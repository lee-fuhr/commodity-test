import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { nanoid } from 'nanoid'
import Anthropic from '@anthropic-ai/sdk'
import { kv } from '@vercel/kv'
import { detectCommodityPhrases, calculateCommodityScore } from '@/lib/commodity-phrases'

// TTL for stored results (30 days in seconds for Vercel KV)
const RESULT_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

// Calculate text similarity using Jaccard index (word overlap)
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3))
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3))

  const intersection = new Set(Array.from(words1).filter(w => words2.has(w)))
  const union = new Set([...Array.from(words1), ...Array.from(words2)])

  if (union.size === 0) return 0
  return intersection.size / union.size
}

interface CostAssumptions {
  averageDealValue: number
  annualDeals: number
  lossRate: number
  lossRateLabel: string
}

interface AnalysisResult {
  id: string
  url: string
  companyName: string
  headline: string
  subheadline: string
  commodityScore: number
  costEstimate: number
  costAssumptions: CostAssumptions
  diagnosis: string
  detectedPhrases: Array<{
    phrase: string
    weight: number
    category: string
    location: string
    context: string // Surrounding text with phrase highlighted
  }>
  fixes: Array<{
    number: number
    originalPhrase: string
    location: string
    context: string
    whyBad: string
    suggestions: Array<{
      text: string
      approach: string // "specific stats", "social proof", "unique process"
    }>
    whyBetter: string
  }>
  createdAt: string
}

// Initialize Anthropic client if API key is available
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// Log warning if no API key in production
if (process.env.NODE_ENV === 'production' && !anthropic) {
  console.warn('WARNING: ANTHROPIC_API_KEY not set. Using template-based fixes.')
}

// Private IP ranges to block (SSRF protection)
const PRIVATE_IP_PATTERNS = [
  /^127\./,                     // Loopback
  /^10\./,                      // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B
  /^192\.168\./,                // Private Class C
  /^169\.254\./,                // Link-local
  /^0\./,                       // Current network
  /^100\.(6[4-9]|[7-9][0-9]|1[0-2][0-9])\./, // Carrier-grade NAT
  /^fd[0-9a-f]{2}:/i,           // IPv6 private
  /^fe80:/i,                    // IPv6 link-local
  /^::1$/,                      // IPv6 loopback
  /^localhost$/i,               // Localhost hostname
]

const BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  '169.254.169.254',            // Cloud metadata endpoints
]

function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    // Block non-HTTP protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return true
    }

    // Block known private hostnames
    if (BLOCKED_HOSTS.some(h => hostname === h || hostname.endsWith('.' + h))) {
      return true
    }

    // Block private IP patterns
    if (PRIVATE_IP_PATTERNS.some(pattern => pattern.test(hostname))) {
      return true
    }

    return false
  } catch {
    return true // Invalid URLs are blocked
  }
}

async function fetchPage(url: string, timeout: number = 10000): Promise<string> {
  // SSRF protection
  if (isPrivateUrl(url)) {
    throw new Error('Invalid URL: Private or internal addresses are not allowed')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CommodityTest/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('URL does not return HTML content')
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      throw new Error('Page too large to analyze')
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('Failed to read response')

    const chunks: Uint8Array[] = []
    let totalSize = 0
    const maxSize = 5 * 1024 * 1024

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      totalSize += value.length
      if (totalSize > maxSize) {
        reader.cancel()
        throw new Error('Page too large to analyze')
      }

      chunks.push(value)
    }

    return new TextDecoder().decode(Buffer.concat(chunks.map(c => Buffer.from(c))))
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      return '' // Silent fail for secondary pages
    }
    throw error
  }
}

// Find key internal pages to scrape for stats
function findKeyPages(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html)
  const base = new URL(baseUrl)
  const keyPages: string[] = []

  // Patterns for valuable pages
  const patterns = [
    /about/i, /company/i, /who-we-are/i,
    /service/i, /capabilit/i, /what-we-do/i,
    /project/i, /portfolio/i, /work/i, /case-stud/i,
    /client/i, /customer/i, /testimonial/i,
    /why-us/i, /why-choose/i, /difference/i,
  ]

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href) return

    try {
      const fullUrl = new URL(href, baseUrl)
      // Only same domain
      if (fullUrl.hostname !== base.hostname) return
      // Skip assets, anchors, etc
      if (fullUrl.pathname.match(/\.(pdf|jpg|png|gif|css|js)$/i)) return
      if (fullUrl.pathname === '/' || fullUrl.pathname === base.pathname) return

      // Check if matches our patterns
      if (patterns.some(p => p.test(fullUrl.pathname))) {
        const url = fullUrl.origin + fullUrl.pathname
        if (!keyPages.includes(url)) {
          keyPages.push(url)
        }
      }
    } catch {
      // Invalid URL, skip
    }
  })

  return keyPages.slice(0, 5) // Max 5 additional pages
}

// Extract stats and proof points from text
function extractStats(text: string): string[] {
  const stats: string[] = []

  // Numbers with context (e.g., "50 years", "1,000 clients", "99% satisfaction")
  const patterns = [
    /\d{1,3}(?:,\d{3})*\+?\s*(?:years?|clients?|customers?|projects?|employees?|locations?|countries?|states?)/gi,
    /\d{1,3}(?:\.\d+)?%\s*(?:satisfaction|reduction|increase|improvement|growth|savings?|faster|better)/gi,
    /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:million|billion|M|B|saved|revenue)/gi,
    /(?:since|founded|established|serving)\s*(?:in\s*)?\d{4}/gi,
    /(?:over|more than|nearly|almost)\s*\d{1,3}(?:,\d{3})*\s*(?:years?|clients?|projects?)/gi,
    /#\d+\s*(?:in|ranked|rated)/gi,
    /\d+(?:st|nd|rd|th)\s*(?:largest|biggest|fastest)/gi,
    /first\s+(?:to|in)\s+[^.]+/gi,
    /only\s+(?:company|provider|manufacturer)\s+[^.]+/gi,
    /patented|proprietary|exclusive/gi,
  ]

  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) {
      stats.push(...matches.map(m => m.trim()))
    }
  }

  // Dedupe and limit
  return [...new Set(stats)].slice(0, 20)
}

// Extract notable projects/clients mentioned
function extractProofPoints(text: string): string[] {
  const proofs: string[] = []

  // Look for sentences with company names (capitalized multi-word phrases)
  const sentences = text.split(/[.!?]/)
  for (const sentence of sentences) {
    // Sentences mentioning specific projects, clients, or achievements
    if (sentence.match(/(?:built|completed|delivered|served|worked with|partnered with|helped)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/)) {
      proofs.push(sentence.trim())
    }
    // Award mentions
    if (sentence.match(/(?:award|recognition|certified|accredited|ranked|rated)/i)) {
      proofs.push(sentence.trim())
    }
  }

  return proofs.slice(0, 10)
}

async function fetchHomepage(url: string): Promise<string> {
  return fetchPage(url, 15000)
}

function extractContent(html: string, url: string): { headline: string; subheadline: string; bodyText: string; companyName: string } {
  const $ = cheerio.load(html)

  // Extract headline (h1 or largest heading)
  let headline = $('h1').first().text().trim()
  if (!headline) {
    headline = $('h2').first().text().trim()
  }
  if (!headline) {
    headline = $('[class*="hero"] h1, [class*="hero"] h2, [class*="banner"] h1').first().text().trim()
  }

  // Extract subheadline
  let subheadline = $('h1 + p, h1 + h2, [class*="hero"] p').first().text().trim()
  if (!subheadline) {
    subheadline = $('h2').first().text().trim()
  }

  // Extract body text (first 2000 chars of visible text)
  const bodyText = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)

  // Extract company name from title or meta
  let companyName = $('title').text()
    .split(/[|•–—\-]/)  // Split on common separators
    [0]
    .replace(/\s+(Home|homepage)\s*$/i, '')  // Remove trailing "Home" etc
    .trim()

  // Fallback to og:site_name if title is empty or too long
  if (!companyName || companyName.length > 100) {
    companyName = $('meta[property="og:site_name"]').attr('content') ||
                  $('meta[name="application-name"]').attr('content') ||
                  ''
  }

  // Final fallback: extract domain name from URL
  if (!companyName) {
    try {
      const domain = new URL(url).hostname
      // Remove www. and convert to title case
      companyName = domain
        .replace(/^www\./, '')
        .split('.')[0]
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    } catch {
      companyName = 'Your Company'
    }
  }

  return { headline, subheadline, bodyText, companyName }
}

// Differentiation score: 100 = highly differentiated (good), 0 = pure commodity (bad)
function generateDiagnosis(score: number, phraseCount: number): string {
  const phraseWord = phraseCount === 1 ? 'phrase' : 'phrases'
  if (score >= 80) {
    return `Your messaging is highly differentiated. You use specific language that sets you apart from competitors. This is rare - only 15% of manufacturers achieve this level of clarity.`
  }
  if (score >= 60) {
    return `Your messaging is differentiated. You have ${phraseCount} commodity ${phraseWord} to clean up, but buyers can tell you apart from competitors.`
  }
  if (score >= 40) {
    return `Your homepage uses ${phraseCount} commodity ${phraseWord} that make you sound similar to competitors. Buyers can partially distinguish you, but you're leaving differentiation on the table.`
  }
  if (score >= 20) {
    return `Your homepage uses ${phraseCount} generic ${phraseWord} that make you sound identical to competitors. When buyers can't tell you apart, they default to price comparison.`
  }
  return `Your messaging is highly commoditized with ${phraseCount} generic ${phraseWord}. Buyers see no difference between you and competitors - you're invisible except for price.`
}

// Differentiation score: 100 = highly differentiated (good), 0 = pure commodity (bad)
// Lower scores = more commodity = higher deal loss
function calculateCostEstimate(score: number): { estimate: number; assumptions: CostAssumptions } {
  // Industry average assumptions:
  // - Average deal value: $50K (typical for $2M-$10M manufacturer)
  // - Annual deals: 30 (mid-range for target segment)
  // - Commodity messaging impact: 5-30% deal loss depending on score
  const baseDealValue = 50000
  const annualDeals = 30

  let lossRate: number
  let lossRateLabel: string

  if (score >= 80) {
    lossRate = 0.05
    lossRateLabel = '5% baseline deal loss'
  } else if (score >= 60) {
    lossRate = 0.10
    lossRateLabel = '10% of deals lost to undifferentiated positioning'
  } else if (score >= 40) {
    lossRate = 0.15
    lossRateLabel = '15% of deals lost to price pressure'
  } else if (score >= 20) {
    lossRate = 0.25
    lossRateLabel = '25% of deals lost to "cheaper" competitors'
  } else {
    lossRate = 0.30
    lossRateLabel = '30% of deals lost - you look identical to competitors'
  }

  const estimate = baseDealValue * annualDeals * lossRate
  // Round to nearest $10K
  return {
    estimate: Math.round(estimate / 10000) * 10000,
    assumptions: {
      averageDealValue: baseDealValue,
      annualDeals,
      lossRate,
      lossRateLabel
    }
  }
}

// Extract context around a phrase from the full text
function extractPhraseContext(fullText: string, phrase: string): string {
  const lowerText = fullText.toLowerCase()
  const lowerPhrase = phrase.toLowerCase()
  const idx = lowerText.indexOf(lowerPhrase)

  if (idx === -1) return phrase

  // Get ~100 chars before and after
  const start = Math.max(0, idx - 100)
  const end = Math.min(fullText.length, idx + phrase.length + 100)

  let context = fullText.slice(start, end).trim()

  // Add ellipsis if we truncated
  if (start > 0) context = '...' + context
  if (end < fullText.length) context = context + '...'

  return context
}

async function generateFixesWithClaude(
  detectedPhrases: Array<{ phrase: string; location: string; category: string; context: string }>,
  headline: string,
  subheadline: string,
  bodyText: string,
  companyName: string,
  url: string,
  siteStats: string[] = [],
  proofPoints: string[] = []
): Promise<AnalysisResult['fixes']> {
  if (!anthropic) {
    return generateTemplateFixes(detectedPhrases, headline, companyName)
  }

  const topPhrases = detectedPhrases.slice(0, 5) // 5 fixes now

  // If no commodity phrases detected, provide general headline advice
  if (topPhrases.length === 0) {
    return [{
      number: 1,
      originalPhrase: headline.slice(0, 50) + (headline.length > 50 ? '...' : ''),
      location: 'Headline',
      context: headline,
      whyBad: 'While your messaging avoids common commodity phrases, there may still be opportunities to make it more specific and compelling.',
      suggestions: [
        { text: `Add specific numbers: "X years", "Y clients", "Z% improvement"`, approach: 'specific stats' },
        { text: `Name a real client or project success story`, approach: 'social proof' },
        { text: `Describe what only ${companyName} can do`, approach: 'unique process' }
      ],
      whyBetter: 'Even non-commodity messaging can be strengthened with specifics.',
    }]
  }

  // Build context about what we detected
  const phraseSummary = topPhrases
    .map((p, i) => `${i + 1}. "${p.phrase}" (found in ${p.location}, category: ${p.category})\n   Context: "${p.context}"`)
    .join('\n\n')

  // Format real stats and proof points found on their site
  const statsSection = siteStats.length > 0
    ? `\nREAL STATS FOUND ON THEIR SITE (use these in suggestions when relevant):\n${siteStats.map(s => `- ${s}`).join('\n')}`
    : ''

  const proofsSection = proofPoints.length > 0
    ? `\nPROOF POINTS & ACHIEVEMENTS FOUND:\n${proofPoints.slice(0, 5).map(p => `- ${p}`).join('\n')}`
    : ''

  const prompt = `You are an expert B2B messaging strategist helping a manufacturing company improve their website copy. You're known for turning generic "we're the best" language into specific, differentiating claims.

COMPANY: ${companyName}
WEBSITE: ${url}
HEADLINE: "${headline}"
SUBHEADLINE: "${subheadline}"

DETECTED COMMODITY PHRASES (with surrounding context):
${phraseSummary}
${statsSection}
${proofsSection}

HOMEPAGE EXCERPT:
${bodyText.slice(0, 1500)}

Provide EXACTLY 5 fixes. Use the ${topPhrases.length} detected commodity phrases first, then add ${5 - topPhrases.length} more fixes targeting OTHER weak spots you notice in their copy (vague claims, missed opportunities, generic language that wasn't in our detection list).

For these additional fixes, pull ACTUAL TEXT from the homepage excerpt above - quote their real words, don't use placeholders like "Main website headline".

For each fix, provide:
1. whyBad: Why this specific phrase hurts their differentiation (1-2 sentences, direct, no fluff)
2. suggestions: THREE different DROP-IN REPLACEMENTS that create grammatically correct sentences.

   CRITICAL GRAMMAR RULES:
   - If the highlighted phrase is part of a compound word (like "value" in "value-added"), you must REPLACE THE ENTIRE COMPOUND, not just the highlighted word
   - The resulting sentence MUST read naturally and be grammatically correct
   - Test it: mentally substitute your suggestion into the original context - does it make sense?

   Example 1 - compound word context "Our **value**-added services support clients":
   - WRONG: "risk-mitigation" → "Our risk-mitigation-added services" (broken grammar!)
   - RIGHT: Replace "value-added services" entirely → "Our risk-analysis services support clients"
   - RIGHT: Replace whole phrase → "Our predictive maintenance programs support clients"

   Example 2 - standalone phrase "We deliver **quality** you can trust":
   - RIGHT: "ISO 9001-certified precision" → "We deliver ISO 9001-certified precision you can trust"
   - RIGHT: "±0.0005" tolerances" → "We deliver ±0.0005" tolerances you can trust"

   Example 3 - headline replacement "**Innovative solutions** for your business":
   - RIGHT: Replace full headline → "47 years machining aerospace-grade titanium"
   - RIGHT: Replace full headline → "The only Midwest shop with 5-axis EDM capability"

   For each suggestion, include ONLY the text that should replace the highlighted portion. The text must slot in grammatically.

   VARY the approach types across suggestions:
   - quantify it, show the process, make a guarantee, tell their story, describe the experience, prove retention, claim the niche, name the innovation, say what you do, publish the metrics, find your only

3. whyBetter: The KEY INSIGHT - why this specific change works. This is the most important learning for them. Make it punchy and memorable (1 sentence).

CRITICAL - USE REAL DATA WHEN AVAILABLE:
- If we found real stats on their site (listed above), USE THEM in your suggestions
- Repurpose their own numbers, years in business, project counts, client names, awards
- When real data isn't available, invent specific-sounding but realistic examples
- NEVER use brackets like [X] or [Client Name] - always provide concrete text
- The suggestions should be copy they could use TODAY without filling in blanks

APPROACH VARIETY IS CRITICAL:
- You MUST use DIFFERENT approach types across the 5 fixes
- Do NOT repeat the same approaches - vary between quantify, process, guarantee, story, experience, retention, niche, innovation, metrics, etc.
- Each fix should demonstrate a different differentiation strategy
- This variety shows the company multiple ways to stand out

OTHER GUIDELINES:
- Be specific to THIS company based on what you found on their site
- Each suggestion should be a complete, ready-to-use rewrite
- If you can infer their industry, products, or capabilities, reference them
- Never suggest more generic language - always go MORE specific
- Match the tone of a direct consultant, not a marketing textbook

Respond in this exact JSON format:
{
  "fixes": [
    {
      "number": 1,
      "originalPhrase": "the exact phrase detected",
      "location": "where it was found",
      "context": "the surrounding text",
      "whyBad": "explanation",
      "suggestions": [
        {"text": "rewrite option 1", "approach": "approach type 1"},
        {"text": "rewrite option 2", "approach": "approach type 2"},
        {"text": "rewrite option 3", "approach": "approach type 3"}
      ],
      "whyBetter": "brief reason"
    }
  ]
}

Only return the JSON, no other text.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048, // More tokens for 5 fixes with 3 suggestions each
      messages: [
        { role: 'user', content: prompt }
      ],
    })

    // Extract text from response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('')

    // Strip markdown code fences if present
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    // Parse JSON response
    const parsed = JSON.parse(jsonText)

    if (parsed.fixes && Array.isArray(parsed.fixes) && parsed.fixes.length > 0) {
      // Validate each fix has required fields
      const validatedFixes = parsed.fixes
        .slice(0, 5)
        .filter((fix: Record<string, unknown>) =>
          fix.number && fix.originalPhrase && fix.location &&
          fix.whyBad && fix.suggestions && Array.isArray(fix.suggestions) && fix.whyBetter
        )

      // Deduplicate fixes based on phrase overlap + location + content similarity
      // Detects exact matches, overlapping phrases, AND identical advice
      const dedupedFixes = validatedFixes.filter((fix: any, index: number) => {
        const currentPhrase = fix.originalPhrase.toLowerCase().trim()
        const currentLocation = fix.location.toLowerCase().trim()
        const currentContent = (fix.whyBad + ' ' + fix.suggestions.map((s: any) => s.text).join(' ') + ' ' + fix.whyBetter).toLowerCase().trim()

        // Check against all previous fixes for duplicates or overlaps
        for (let i = 0; i < index; i++) {
          const prevFix = validatedFixes[i]
          const prevPhrase = prevFix.originalPhrase.toLowerCase().trim()
          const prevLocation = prevFix.location.toLowerCase().trim()
          const prevContent = (prevFix.whyBad + ' ' + prevFix.suggestions.map((s: any) => s.text).join(' ') + ' ' + prevFix.whyBetter).toLowerCase().trim()

          // Same location check
          if (currentLocation === prevLocation) {
            // Exact match
            if (currentPhrase === prevPhrase) {
              return false
            }

            // Substring match (one phrase contains the other)
            if (currentPhrase.includes(prevPhrase) || prevPhrase.includes(currentPhrase)) {
              return false
            }

            // Significant word overlap (share 2+ words and same location = likely duplicate)
            const currentWords = new Set<string>(currentPhrase.split(/\s+/).filter((w: string) => w.length > 3))
            const prevWords = new Set<string>(prevPhrase.split(/\s+/).filter((w: string) => w.length > 3))
            const commonWords = Array.from(currentWords).filter((w: string) => prevWords.has(w))
            if (commonWords.length >= 2) {
              return false
            }

            // Content similarity check (identical advice = duplicate fix)
            // If 50%+ of the fix content is identical, consider it a duplicate
            if (currentContent === prevContent) {
              return false
            }
            const similarity = calculateSimilarity(currentContent, prevContent)
            if (similarity > 0.5) {
              return false
            }
          }
        }

        return true
      })

      if (dedupedFixes.length > 0) {
        // If we got fewer than 5 from Claude, pad with template fixes
        if (dedupedFixes.length < 5) {
          const templateFixes = generateTemplateFixes(detectedPhrases, headline, companyName)

          // Add template fixes, avoiding duplicates/overlaps with existing fixes
          for (const templateFix of templateFixes) {
            if (dedupedFixes.length >= 5) break

            const templatePhrase = templateFix.originalPhrase.toLowerCase().trim()
            const templateLocation = templateFix.location.toLowerCase().trim()

            // Check for duplicates/overlaps against all existing fixes
            let isDuplicate = false
            for (const existingFix of dedupedFixes) {
              const existingPhrase = existingFix.originalPhrase.toLowerCase().trim()
              const existingLocation = existingFix.location.toLowerCase().trim()

              if (templateLocation === existingLocation) {
                // Exact match, substring, or word overlap
                if (templatePhrase === existingPhrase ||
                    templatePhrase.includes(existingPhrase) ||
                    existingPhrase.includes(templatePhrase)) {
                  isDuplicate = true
                  break
                }

                const templateWords = new Set<string>(templatePhrase.split(/\s+/).filter((w: string) => w.length > 3))
                const existingWords = new Set<string>(existingPhrase.split(/\s+/).filter((w: string) => w.length > 3))
                const commonWords = Array.from(templateWords).filter((w: string) => existingWords.has(w))
                if (commonWords.length >= 2) {
                  isDuplicate = true
                  break
                }
              }
            }

            if (!isDuplicate) {
              dedupedFixes.push({
                ...templateFix,
                number: dedupedFixes.length + 1
              })
            }
          }
        }
        return dedupedFixes
      }
    }

    // Fallback to templates if parsing fails
    return generateTemplateFixes(detectedPhrases, headline, companyName)
  } catch (error) {
    console.error('Claude API error:', error)
    // Fallback to template-based fixes
    return generateTemplateFixes(detectedPhrases, headline, companyName)
  }
}

function generateTemplateFixes(
  detectedPhrases: Array<{ phrase: string; location: string; category: string; context?: string }>,
  headline: string,
  companyName: string
): AnalysisResult['fixes'] {
  const topPhrases = detectedPhrases.slice(0, 5) // 5 fixes now
  const fixes: AnalysisResult['fixes'] = []

  const fixTemplates: Record<string, {
    whyBad: string
    suggestions: Array<{ text: string; approach: string }>
    whyBetter: string
  }> = {
    'vague-quality': {
      whyBad: 'Every competitor claims "quality." Without specifics, it means nothing. Buyers have heard this exact phrase 1000 times.',
      suggestions: [
        { text: 'Zero defects in [X] units shipped last year. That\'s what quality looks like.', approach: 'quantify it' },
        { text: 'Our [inspection process] catches what others miss. Here\'s how it works.', approach: 'show the process' },
        { text: 'We guarantee [specific outcome] or we remake it free. No questions.', approach: 'make a guarantee' }
      ],
      whyBetter: 'Numbers and specifics are believable. Vague claims are ignored.',
    },
    'partnership': {
      whyBad: '"Trusted partner" appears on 70%+ of B2B websites. It signals nothing and wastes precious headline real estate.',
      suggestions: [
        { text: '[Client Name] called us their "secret weapon." Here\'s why.', approach: 'tell their story' },
        { text: 'Your dedicated engineer will know your tolerances by heart within 30 days.', approach: 'describe the experience' },
        { text: 'Average client tenure: [X] years. They stay because [specific reason].', approach: 'prove retention' }
      ],
      whyBetter: 'Demonstrated partnership > claimed partnership.',
    },
    'leadership': {
      whyBad: 'Self-proclaimed "industry leaders" are everywhere. Without proof, it reads as marketing fluff.',
      suggestions: [
        { text: 'Installed in [X]+ facilities across [Region]. See the map.', approach: 'show reach' },
        { text: 'The only [type] manufacturer offering [capability] in-house.', approach: 'claim the niche' },
        { text: '[Industry Publication] ranked us #[X] for [category] in 2024.', approach: 'cite recognition' }
      ],
      whyBetter: 'Leadership is proven through specifics, not claimed through adjectives.',
    },
    'innovation': {
      whyBad: '"Innovative" has lost all meaning through overuse. Every company claims innovation.',
      suggestions: [
        { text: 'Our patented [process] cuts [metric] by [X]%. Here\'s the data.', approach: 'name the innovation' },
        { text: 'The first [product type] with [specific feature]. Still the only one.', approach: 'claim the first' },
        { text: 'We invested [X] in R&D last year. Here\'s what we built.', approach: 'show investment' }
      ],
      whyBetter: 'Specific innovations are memorable. Generic innovation claims are invisible.',
    },
    'jargon': {
      whyBad: '"Solutions" is the most overused word in B2B. It says nothing about what you actually do.',
      suggestions: [
        { text: 'We [specific verb] [specific product] for [specific industry].', approach: 'say what you do' },
        { text: 'When [problem] happens, we [specific action]. Done in [timeframe].', approach: 'describe the scenario' },
        { text: 'We make [thing]. It does [specific function]. Here\'s one in action.', approach: 'keep it simple' }
      ],
      whyBetter: 'Clarity beats cleverness. Say what you do, not what category you\'re in.',
    },
    'service': {
      whyBad: 'Everyone claims "exceptional service." It\'s table stakes, not a differentiator.',
      suggestions: [
        { text: 'Average response time: [X] hours. Track record: [Y]% same-day ship.', approach: 'publish the metrics' },
        { text: 'Your rep\'s cell number, day one. They answer weekends.', approach: 'describe the access' },
        { text: 'If we miss your deadline, the rush fee is on us.', approach: 'stake something on it' }
      ],
      whyBetter: 'Measurable commitments beat unmeasurable claims.',
    },
    'default': {
      whyBad: 'This phrase appears on countless competitor websites. It doesn\'t help buyers understand why you\'re different.',
      suggestions: [
        { text: 'Add a specific number: [X] years, [Y] clients, [Z]% improvement.', approach: 'add numbers' },
        { text: 'What would only YOUR company say? Lead with that.', approach: 'find your only' },
        { text: 'Describe a specific customer win. Name names if you can.', approach: 'tell a story' }
      ],
      whyBetter: 'Differentiation comes from specificity, not from adjectives.',
    },
  }

  for (let i = 0; i < topPhrases.length; i++) {
    const phrase = topPhrases[i]
    const template = fixTemplates[phrase.category] || fixTemplates['default']

    fixes.push({
      number: i + 1,
      originalPhrase: phrase.phrase,
      location: phrase.location,
      context: phrase.context || phrase.phrase,
      whyBad: template.whyBad,
      suggestions: template.suggestions,
      whyBetter: template.whyBetter,
    })
  }

  // If we have fewer than 5 phrases, add ONE generic headline fix (not multiple copies)
  if (fixes.length < 5 && headline.length > 0) {
    fixes.push({
      number: fixes.length + 1,
      originalPhrase: headline.slice(0, 50) + (headline.length > 50 ? '...' : ''),
      location: 'Headline',
      context: headline,
      whyBad: 'Your headline doesn\'t immediately answer: "Why should I choose you over competitors?"',
      suggestions: [
        { text: `[X] years serving [industry]. [Y] satisfied clients. Here's one.`, approach: 'add numbers' },
        { text: `The only [type] that [unique capability]. And we can prove it.`, approach: 'claim the niche' },
        { text: `See why [Client Name] switched from [competitor type] to ${companyName}.`, approach: 'tell their story' }
      ],
      whyBetter: 'Headlines that answer "why you" outperform generic value claims.',
    })
  }

  return fixes.slice(0, 5)
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Basic URL validation
    let validUrl: string
    try {
      // Add protocol if missing
      const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
      validUrl = new URL(urlWithProtocol).toString()
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // SSRF check
    if (isPrivateUrl(validUrl)) {
      return NextResponse.json({ error: 'Invalid URL: Private or internal addresses are not allowed' }, { status: 400 })
    }

    // Fetch and parse homepage
    const html = await fetchHomepage(validUrl)
    const { headline, subheadline, bodyText, companyName } = extractContent(html, validUrl)

    // Detect if this is a JavaScript-rendered SPA with minimal server-side content
    const contentLength = bodyText.trim().length
    const headlineLength = headline.trim().length

    // Check for SPA indicators in HTML
    const hasSPAMarkers = (
      html.includes('react') ||
      html.includes('React') ||
      html.includes('ng-app') ||
      html.includes('vue-app') ||
      html.includes('__NEXT_DATA__') ||
      html.includes('root"></div><script') ||
      html.toLowerCase().includes('id="app"') ||
      html.toLowerCase().includes('id="root"')
    )

    // SPA if: very little content AND SPA markers, OR almost no content at all
    const isLikelySPA = (contentLength < 300 && hasSPAMarkers) || contentLength < 100

    // Also check if we got a title but no meaningful body content
    const hasNoMeaningfulContent = headlineLength > 0 && contentLength < 150

    if (isLikelySPA || hasNoMeaningfulContent) {
      return NextResponse.json({
        error: 'This site uses client-side JavaScript rendering, which our analyzer doesn\'t support yet. Try a site with server-rendered HTML content.',
        hint: 'SPA sites (React, Vue, Angular) render content in the browser, so we can\'t analyze them without a headless browser.'
      }, { status: 400 })
    }

    // Find and fetch additional pages for stats
    const keyPages = findKeyPages(html, validUrl)
    const additionalContent: string[] = []
    const allStats: string[] = []
    const allProofs: string[] = []

    // Fetch additional pages in parallel (with 5 second timeout each)
    if (keyPages.length > 0) {
      const pagePromises = keyPages.map(async (pageUrl) => {
        try {
          const pageHtml = await fetchPage(pageUrl, 5000)
          if (pageHtml) {
            const $ = cheerio.load(pageHtml)
            const pageText = $('body').text().replace(/\s+/g, ' ').trim()
            return pageText.slice(0, 3000) // First 3000 chars per page
          }
        } catch {
          // Silent fail for secondary pages
        }
        return ''
      })

      const results = await Promise.all(pagePromises)
      additionalContent.push(...results.filter(Boolean))
    }

    // Combine all text for analysis
    const allText = `${headline} ${subheadline} ${bodyText}`
    const fullSiteText = [allText, ...additionalContent].join(' ')

    // Extract stats and proof points from full site
    allStats.push(...extractStats(fullSiteText))
    allProofs.push(...extractProofPoints(fullSiteText))

    // Detect commodity phrases
    const rawDetectedPhrases = detectCommodityPhrases(allText)

    // Add context to each detected phrase
    const detectedPhrases = rawDetectedPhrases.map(phrase => ({
      ...phrase,
      context: extractPhraseContext(allText, phrase.phrase)
    }))

    // Calculate score
    const commodityScore = calculateCommodityScore(rawDetectedPhrases)

    // Generate diagnosis and cost
    const diagnosis = generateDiagnosis(commodityScore, detectedPhrases.length)
    const { estimate: costEstimate, assumptions: costAssumptions } = calculateCostEstimate(commodityScore)

    // Generate fixes (with Claude if available, else templates)
    const fixes = await generateFixesWithClaude(
      detectedPhrases,
      headline,
      subheadline,
      bodyText,
      companyName,
      validUrl,
      allStats,
      allProofs
    )

    // Create result
    const id = nanoid(10)
    const result: AnalysisResult = {
      id,
      url: validUrl,
      companyName,
      headline,
      subheadline,
      commodityScore,
      costEstimate,
      costAssumptions,
      diagnosis,
      detectedPhrases,
      fixes,
      createdAt: new Date().toISOString(),
    }

    // Store result in Vercel KV with TTL
    await kv.set(`result:${id}`, result, { ex: RESULT_TTL_SECONDS })

    // Store anonymized analytics for learning (no TTL - permanent)
    try {
      const analyticsData = {
        timestamp: new Date().toISOString(),
        score: commodityScore,
        phraseCount: detectedPhrases.length,
        phrases: detectedPhrases.map(p => ({ phrase: p.phrase, category: p.category })),
        statsFound: allStats.length,
        proofsFound: allProofs.length,
        // Anonymized industry hint from URL domain
        domain: new URL(validUrl).hostname.replace(/^www\./, ''),
      }
      await kv.lpush('analytics:analyses', JSON.stringify(analyticsData))
      // Keep only last 1000 analyses
      await kv.ltrim('analytics:analyses', 0, 999)
    } catch {
      // Silent fail - analytics shouldn't break the main flow
    }

    return NextResponse.json({ id })
  } catch (error) {
    console.error('Analysis error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)

    // Return user-friendly error messages
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()
      const errorName = error.name || ''

      // Timeout errors
      if (errorMsg.includes('timed out') || errorMsg.includes('timeout') || errorName === 'AbortError') {
        return NextResponse.json({
          error: 'The website took too long to respond. Try again or try a different site.'
        }, { status: 504 })
      }

      // Network/DNS errors
      if (errorMsg.includes('enotfound') || errorMsg.includes('dns') || errorMsg.includes('getaddrinfo')) {
        return NextResponse.json({
          error: 'Could not find that website. Check the URL and try again.'
        }, { status: 400 })
      }

      // Connection refused
      if (errorMsg.includes('econnrefused') || errorMsg.includes('connection refused')) {
        return NextResponse.json({
          error: 'The website refused the connection. It may be down or blocking automated access.'
        }, { status: 503 })
      }

      // SSL/Certificate errors
      if (errorMsg.includes('certificate') || errorMsg.includes('ssl') || errorMsg.includes('tls')) {
        return NextResponse.json({
          error: 'SSL certificate error. The website may have security configuration issues.'
        }, { status: 400 })
      }

      // HTTP status errors
      if (errorMsg.includes('failed to fetch url: 403') || errorMsg.includes('status 403')) {
        return NextResponse.json({
          error: 'The website blocked our request (403 Forbidden). It may be using bot protection.'
        }, { status: 403 })
      }

      if (errorMsg.includes('failed to fetch url: 404') || errorMsg.includes('status 404')) {
        return NextResponse.json({
          error: 'Page not found (404). Check the URL and try again.'
        }, { status: 404 })
      }

      if (errorMsg.includes('failed to fetch url: 5') || errorMsg.includes('status 5')) {
        return NextResponse.json({
          error: 'The website is experiencing server errors. Try again later.'
        }, { status: 502 })
      }

      // Content type errors
      if (errorMsg.includes('private or internal')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      if (errorMsg.includes('html') || errorMsg.includes('content')) {
        return NextResponse.json({
          error: 'The URL does not appear to be a website. Make sure it returns HTML.'
        }, { status: 400 })
      }

      if (errorMsg.includes('too large')) {
        return NextResponse.json({
          error: 'The page is too large to analyze (max 5MB).'
        }, { status: 400 })
      }

      // Include actual error message in development
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { error: `Analysis failed: ${error.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze URL. Please check the URL and try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  const result = await kv.get<AnalysisResult>(`result:${id}`)

  if (!result) {
    return NextResponse.json({ error: 'Result not found or expired' }, { status: 404 })
  }

  return NextResponse.json(result)
}
