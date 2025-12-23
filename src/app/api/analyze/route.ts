import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { nanoid } from 'nanoid'
import Anthropic from '@anthropic-ai/sdk'
import { kv } from '@vercel/kv'
import { detectCommodityPhrases, calculateCommodityScore } from '@/lib/commodity-phrases'

// TTL for stored results (30 days in seconds for Vercel KV)
const RESULT_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days

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

async function fetchHomepage(url: string): Promise<string> {
  // SSRF protection
  if (isPrivateUrl(url)) {
    throw new Error('Invalid URL: Private or internal addresses are not allowed')
  }

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

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

    // Check content type
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error('URL does not return HTML content')
    }

    // Limit response size to 5MB
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      throw new Error('Page too large to analyze')
    }

    // Read with size limit
    const reader = response.body?.getReader()
    if (!reader) throw new Error('Failed to read response')

    const chunks: Uint8Array[] = []
    let totalSize = 0
    const maxSize = 5 * 1024 * 1024 // 5MB

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

    const html = new TextDecoder().decode(Buffer.concat(chunks.map(c => Buffer.from(c))))
    return html
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out after 15 seconds')
    }
    throw error
  }
}

function extractContent(html: string): { headline: string; subheadline: string; bodyText: string; companyName: string } {
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
  let companyName = $('title').text().split('|')[0].split('-')[0].trim()
  if (!companyName) {
    companyName = $('meta[property="og:site_name"]').attr('content') || 'Your Company'
  }

  return { headline, subheadline, bodyText, companyName }
}

function generateDiagnosis(score: number, phraseCount: number): string {
  if (score <= 40) {
    return `Your messaging is differentiated. You use specific language that sets you apart from competitors. This is rare - only 15% of manufacturers achieve this level of clarity.`
  }
  if (score <= 60) {
    return `Your homepage uses ${phraseCount} commodity phrases that make you sound similar to competitors. Buyers can partially distinguish you, but you're leaving differentiation on the table.`
  }
  if (score <= 80) {
    return `Your homepage uses ${phraseCount} generic phrases that make you sound identical to competitors. When buyers can't tell you apart, they default to price comparison.`
  }
  return `Your messaging is highly commoditized with ${phraseCount} generic phrases. Buyers see no difference between you and competitors - you're invisible except for price.`
}

function calculateCostEstimate(score: number): { estimate: number; assumptions: CostAssumptions } {
  // Industry average assumptions:
  // - Average deal value: $50K (typical for $2M-$10M manufacturer)
  // - Annual deals: 30 (mid-range for target segment)
  // - Commodity messaging impact: 5-30% deal loss depending on score
  const baseDealValue = 50000
  const annualDeals = 30

  let lossRate: number
  let lossRateLabel: string

  if (score > 80) {
    lossRate = 0.30
    lossRateLabel = '30% of deals lost to "cheaper" competitors'
  } else if (score > 60) {
    lossRate = 0.20
    lossRateLabel = '20% of deals lost to price pressure'
  } else if (score > 40) {
    lossRate = 0.10
    lossRateLabel = '10% of deals lost to undifferentiated positioning'
  } else {
    lossRate = 0.05
    lossRateLabel = '5% baseline deal loss'
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
  url: string
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

  const prompt = `You are an expert B2B messaging strategist helping a manufacturing company improve their website copy. You're known for turning generic "we're the best" language into specific, differentiating claims.

COMPANY: ${companyName}
WEBSITE: ${url}
HEADLINE: "${headline}"
SUBHEADLINE: "${subheadline}"

DETECTED COMMODITY PHRASES (with surrounding context):
${phraseSummary}

HOMEPAGE EXCERPT:
${bodyText.slice(0, 1500)}

For each of the ${topPhrases.length} commodity phrases detected, provide:
1. whyBad: Why this specific phrase hurts their differentiation (1-2 sentences, direct, no fluff)
2. suggestions: THREE different alternative approaches - VARY the approach types based on what makes sense for THIS specific phrase. Choose from approaches like:
   - quantify it (add real numbers)
   - show the process (explain how they do it)
   - make a guarantee (stake something on it)
   - tell their story (specific client example)
   - describe the experience (what working with them is like)
   - prove retention (why clients stay)
   - claim the niche (what only they do)
   - name the innovation (specific tech/method)
   - say what you do (plain language)
   - publish the metrics (transparent data)
   - find your only (unique differentiator)
3. whyBetter: Why specificity wins over generic claims (1 sentence)

IMPORTANT GUIDELINES:
- Be specific to THIS company based on what you can infer from their content
- Each suggestion should be a complete rewrite they could use today
- Use placeholder brackets like [X years] or [Client Name] where they'd fill in specifics
- VARY the approach types - don't use the same three for every fix
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

    // Parse JSON response
    const parsed = JSON.parse(responseText)

    if (parsed.fixes && Array.isArray(parsed.fixes) && parsed.fixes.length > 0) {
      // Validate each fix has required fields
      const validatedFixes = parsed.fixes
        .slice(0, 5)
        .filter((fix: Record<string, unknown>) =>
          fix.number && fix.originalPhrase && fix.location &&
          fix.whyBad && fix.suggestions && Array.isArray(fix.suggestions) && fix.whyBetter
        )

      if (validatedFixes.length > 0) {
        return validatedFixes
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

  // If we have fewer than 5 phrases, add generic headline fixes
  while (fixes.length < 5) {
    const n = fixes.length + 1
    fixes.push({
      number: n,
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
    const { headline, subheadline, bodyText, companyName } = extractContent(html)

    // Combine all text for analysis
    const allText = `${headline} ${subheadline} ${bodyText}`

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
      validUrl
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

    return NextResponse.json({ id })
  } catch (error) {
    console.error('Analysis error:', error)

    // Return user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        return NextResponse.json({ error: 'The website took too long to respond. Please try again.' }, { status: 504 })
      }
      if (error.message.includes('Private or internal')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (error.message.includes('HTML')) {
        return NextResponse.json({ error: 'The URL does not appear to be a website.' }, { status: 400 })
      }
      if (error.message.includes('too large')) {
        return NextResponse.json({ error: 'The page is too large to analyze.' }, { status: 400 })
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
