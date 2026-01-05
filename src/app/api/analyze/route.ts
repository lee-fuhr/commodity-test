import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { nanoid } from 'nanoid'
import Anthropic from '@anthropic-ai/sdk'
import { kv } from '@vercel/kv'
import { scrapeUrl, extractContent as extractFromHtml, type ExtractedContent } from '@/lib/scraper'
import {
  detectCommodityPhrases,
  detectDifferentiationSignals,
  calculateScore,
  generateDiagnosis,
  calculateCostEstimate,
  detectIndustry,
  type DetectedPhrase,
  type DifferentiationSignal,
  type DetectedIndustry,
} from '@/lib/scoring'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

// TTL for stored results (30 days in seconds for Vercel KV)
const RESULT_TTL_SECONDS = 30 * 24 * 60 * 60

// Calculate text similarity using Jaccard index
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
    context: string
  }>
  differentiationSignals: Array<{
    type: string
    value: string
    strength: number
    location: string
  }>
  fixes: Array<{
    number: number
    originalPhrase: string
    location: string
    context: string
    whyBad: string
    suggestions: Array<{
      text: string
      approach: string
    }>
    whyBetter: string
  }>
  scrapeMethod: 'direct' | 'scrapingbee' | 'jina' | 'failed'
  contentQuality: 'excellent' | 'good' | 'minimal' | 'failed'
  industry: DetectedIndustry
  createdAt: string
}

// Initialize Anthropic client if API key is available
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

if (!anthropic) {
  console.error('FATAL: ANTHROPIC_API_KEY not set. Claude API is required for analysis.')
}

// Find key internal pages to scrape for stats
function findKeyPages(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html)
  const base = new URL(baseUrl)
  const keyPages: string[] = []

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
      if (fullUrl.hostname !== base.hostname) return
      if (fullUrl.pathname.match(/\.(pdf|jpg|png|gif|css|js)$/i)) return
      if (fullUrl.pathname === '/' || fullUrl.pathname === base.pathname) return

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

  return keyPages.slice(0, 3) // Max 3 additional pages
}

// Extract stats and proof points from text
function extractStats(text: string): string[] {
  const stats: string[] = []

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

  return [...new Set(stats)].slice(0, 20)
}

// Extract notable projects/clients mentioned
function extractProofPoints(text: string): string[] {
  const proofs: string[] = []

  const sentences = text.split(/[.!?]/)
  for (const sentence of sentences) {
    if (sentence.match(/(?:built|completed|delivered|served|worked with|partnered with|helped)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/)) {
      proofs.push(sentence.trim())
    }
    if (sentence.match(/(?:award|recognition|certified|accredited|ranked|rated)/i)) {
      proofs.push(sentence.trim())
    }
  }

  return proofs.slice(0, 10)
}

// Extract context around a phrase
function extractPhraseContext(fullText: string, phrase: string): string {
  const lowerText = fullText.toLowerCase()
  const lowerPhrase = phrase.toLowerCase()
  const idx = lowerText.indexOf(lowerPhrase)

  if (idx === -1) return phrase

  const start = Math.max(0, idx - 100)
  const end = Math.min(fullText.length, idx + phrase.length + 100)

  let context = fullText.slice(start, end).trim()
  if (start > 0) context = '...' + context
  if (end < fullText.length) context = context + '...'

  return context
}

async function generateFixesWithClaude(
  detectedPhrases: DetectedPhrase[],
  differentiationSignals: DifferentiationSignal[],
  headline: string,
  subheadline: string,
  bodyText: string,
  companyName: string,
  url: string,
  siteStats: string[] = [],
  proofPoints: string[] = []
): Promise<AnalysisResult['fixes']> {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY is required. Cannot generate fixes without Claude API.')
  }

  const topPhrases = detectedPhrases.slice(0, 5)

  // If no commodity phrases detected but we have content, provide specific feedback
  if (topPhrases.length === 0) {
    // Check if we have differentiation signals to comment on
    if (differentiationSignals.length > 0) {
      return [{
        number: 1,
        originalPhrase: headline.slice(0, 50) + (headline.length > 50 ? '...' : ''),
        location: 'Headline',
        context: headline,
        whyBad: `Your messaging avoids common commodity phrases - good start. But "${headline.slice(0, 30)}..." could be more specific. You have ${differentiationSignals.length} proof point${differentiationSignals.length === 1 ? '' : 's'} (${differentiationSignals.slice(0, 2).map(s => s.value).join(', ')}) that could be featured more prominently.`,
        suggestions: [
          { text: differentiationSignals[0]?.value || `47 years machining precision parts`, approach: 'lead with proof' },
          { text: `The only ${companyName.split(' ')[0]} that ${siteStats[0] || 'delivers same-day quotes'}`, approach: 'unique claim' },
          { text: `${proofPoints[0]?.slice(0, 50) || 'ISO 9001 certified since 2005'}`, approach: 'credential first' },
        ],
        whyBetter: 'Lead with your strongest proof point instead of generic positioning.',
      }]
    } else {
      return [{
        number: 1,
        originalPhrase: headline.slice(0, 50) + (headline.length > 50 ? '...' : ''),
        location: 'Headline',
        context: headline,
        whyBad: `Your messaging avoids common commodity phrases, but it's also missing specifics. Without numbers, proof points, or unique claims, buyers still can't distinguish you.`,
        suggestions: [
          { text: `[X] years serving [industry] manufacturers`, approach: 'add a number' },
          { text: `Trusted by [Client A, Client B, Client C]`, approach: 'name names' },
          { text: `The only [your region] shop with [capability]`, approach: 'claim your niche' },
        ],
        whyBetter: 'Specificity is differentiation. Add numbers, names, or unique capabilities.',
      }]
    }
  }

  // Build context about what we detected
  const phraseSummary = topPhrases
    .map((p, i) => `${i + 1}. "${p.phrase}" (found in ${p.location}, category: ${p.category})\n   Context: "${p.context}"`)
    .join('\n\n')

  const diffSignalsSummary = differentiationSignals.length > 0
    ? `\nDIFFERENTIATION SIGNALS FOUND (good things to amplify):\n${differentiationSignals.slice(0, 5).map(s => `- ${s.value} (${s.type}, strength ${s.strength}/10)`).join('\n')}`
    : ''

  const statsSection = siteStats.length > 0
    ? `\nREAL STATS FOUND ON THEIR SITE (use these in suggestions):\n${siteStats.map(s => `- ${s}`).join('\n')}`
    : ''

  const proofsSection = proofPoints.length > 0
    ? `\nPROOF POINTS & ACHIEVEMENTS FOUND:\n${proofPoints.slice(0, 5).map(p => `- ${p}`).join('\n')}`
    : ''

  const prompt = `You are an expert B2B messaging strategist helping a manufacturing company improve their website copy.

COMPANY: ${companyName}
WEBSITE: ${url}
HEADLINE: "${headline}"
SUBHEADLINE: "${subheadline}"

DETECTED COMMODITY PHRASES (with surrounding context):
${phraseSummary}
${diffSignalsSummary}
${statsSection}
${proofsSection}

HOMEPAGE EXCERPT:
${bodyText.slice(0, 1500)}

Provide EXACTLY 5 fixes. Use the ${topPhrases.length} detected commodity phrases first, then add ${5 - topPhrases.length} more fixes for other weak spots (vague claims, missed opportunities, generic language).

For additional fixes, pull ACTUAL TEXT from the homepage excerpt - quote their real words.

For each fix, provide:
1. whyBad: Why this specific phrase hurts differentiation (1-2 sentences, direct)
2. suggestions: THREE different DROP-IN REPLACEMENTS that create grammatically correct sentences.

   CRITICAL: The replacement must slot into the original context grammatically. Test it mentally.

   VARY the approaches: quantify it, show the process, make a guarantee, tell their story, prove retention, claim the niche, name the innovation.

3. whyBetter: The KEY INSIGHT - why this change works. Punchy and memorable (1 sentence).

CRITICAL - USE REAL DATA WHEN AVAILABLE:
- If we found real stats, USE THEM in suggestions
- Repurpose their own numbers, years, project counts, client names
- NEVER use brackets like [X] - always provide concrete text
- The suggestions should be ready to use TODAY

Respond in this exact JSON format:
{
  "fixes": [
    {
      "number": 1,
      "originalPhrase": "the exact phrase detected",
      "location": "where found",
      "context": "surrounding text",
      "whyBad": "explanation",
      "suggestions": [
        {"text": "rewrite 1", "approach": "approach type"},
        {"text": "rewrite 2", "approach": "approach type"},
        {"text": "rewrite 3", "approach": "approach type"}
      ],
      "whyBetter": "brief reason"
    }
  ]
}

Only return the JSON, no other text.`

  const CLAUDE_TIMEOUT_MS = 45000
  const MAX_RETRIES = 1

  async function callClaudeWithTimeout(attempt: number): Promise<Anthropic.Message> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT_MS)

    try {
      const message = await anthropic!.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return message
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Claude API timeout after ${CLAUDE_TIMEOUT_MS / 1000}s (attempt ${attempt + 1})`)
      }
      throw error
    }
  }

  try {
    let message: Anthropic.Message | null = null
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        message = await callClaudeWithTimeout(attempt)
        break
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`Claude API attempt ${attempt + 1} failed:`, lastError.message)
        if (attempt < MAX_RETRIES) {
          console.log(`Retrying Claude API call...`)
        }
      }
    }

    if (!message) {
      throw lastError || new Error('Claude API failed after all retries')
    }

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('')

    let jsonText = responseText.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonText)

    if (parsed.fixes && Array.isArray(parsed.fixes) && parsed.fixes.length > 0) {
      const validatedFixes = parsed.fixes
        .slice(0, 5)
        .filter((fix: Record<string, unknown>) =>
          fix.number && fix.originalPhrase && fix.location &&
          fix.whyBad && fix.suggestions && Array.isArray(fix.suggestions) && fix.whyBetter
        )

      // Deduplicate fixes
      const dedupedFixes = validatedFixes.filter((fix: any, index: number) => {
        const currentPhrase = fix.originalPhrase.toLowerCase().trim()
        const currentLocation = fix.location.toLowerCase().trim()
        const currentContent = (fix.whyBad + ' ' + fix.suggestions.map((s: any) => s.text).join(' ') + ' ' + fix.whyBetter).toLowerCase().trim()

        for (let i = 0; i < index; i++) {
          const prevFix = validatedFixes[i]
          const prevPhrase = prevFix.originalPhrase.toLowerCase().trim()
          const prevLocation = prevFix.location.toLowerCase().trim()
          const prevContent = (prevFix.whyBad + ' ' + prevFix.suggestions.map((s: any) => s.text).join(' ') + ' ' + prevFix.whyBetter).toLowerCase().trim()

          if (currentContent === prevContent) return false

          const similarity = calculateSimilarity(currentContent, prevContent)
          if (similarity > 0.2) return false

          if (currentLocation === prevLocation) {
            if (currentPhrase === prevPhrase) return false
            if (currentPhrase.includes(prevPhrase) || prevPhrase.includes(currentPhrase)) return false

            const currentWords = new Set<string>(currentPhrase.split(/\s+/).filter((w: string) => w.length > 3))
            const prevWords = new Set<string>(prevPhrase.split(/\s+/).filter((w: string) => w.length > 3))
            const commonWords = Array.from(currentWords).filter((w: string) => prevWords.has(w))
            if (commonWords.length >= 2) return false
          }
        }

        return true
      })

      if (dedupedFixes.length > 0) {
        return dedupedFixes
      }
    }

    throw new Error('Failed to parse Claude response')
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error(`Claude API failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit before doing any expensive work
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit(clientIP, {
      hourlyLimit: 10,
      dailyLimit: 50,
    })

    if (!rateLimitResult.allowed) {
      console.log(`[Analyze] Rate limited: ${clientIP} - ${rateLimitResult.message}`)
      const response = NextResponse.json(
        {
          error: rateLimitResult.message,
          rateLimited: true,
          retryAfterSeconds: rateLimitResult.retryAfterSeconds,
        },
        { status: 429 }
      )
      if (rateLimitResult.retryAfterSeconds) {
        response.headers.set('Retry-After', String(rateLimitResult.retryAfterSeconds))
      }
      return response
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'Please enter a website URL to analyze.' }, { status: 400 })
    }

    // Basic URL validation
    let validUrl: string
    try {
      const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
      validUrl = new URL(urlWithProtocol).toString()
    } catch {
      return NextResponse.json({ error: 'That doesn\'t look like a valid website address. Try something like "example.com" or "https://example.com".' }, { status: 400 })
    }

    console.log(`[Analyze] Starting analysis for: ${validUrl}`)

    // Scrape the URL with fallback chain
    const scrapeResult = await scrapeUrl(validUrl)

    // Check if scraping completely failed
    if (scrapeResult.method === 'failed' || scrapeResult.contentLength < 100) {
      console.log(`[Analyze] Scraping failed: ${scrapeResult.error}`)
      return NextResponse.json({
        error: 'We couldn\'t read that website.',
        hint: 'The site may be blocking our request, taking too long to load, or temporarily unavailable. Double-check the URL and try again.',
      }, { status: 400 })
    }

    // Extract content from HTML
    const extractedContent = extractFromHtml(scrapeResult.html, validUrl)
    const { headline, subheadline, bodyText, companyName, contentQuality, wordCount } = extractedContent

    console.log(`[Analyze] Extracted content: ${wordCount} words, quality: ${contentQuality}`)

    // Check for minimal content
    if (contentQuality === 'failed') {
      return NextResponse.json({
        error: 'Not enough text to analyze.',
        hint: 'We loaded the page but couldn\'t find much written content. This sometimes happens with image-heavy sites or pages that load content dynamically. Try a different page on the same site.',
      }, { status: 400 })
    }

    // Combine all text for analysis
    const allText = `${headline} ${subheadline} ${bodyText}`

    // Detect commodity phrases
    const detectedPhrases = detectCommodityPhrases(allText).map(phrase => ({
      ...phrase,
      context: extractPhraseContext(allText, phrase.phrase)
    }))

    // Detect differentiation signals
    const differentiationSignals = detectDifferentiationSignals(allText)

    // Calculate score using bell curve
    const scoringResult = calculateScore(detectedPhrases, differentiationSignals, contentQuality)
    const commodityScore = scoringResult.score

    // Handle unscoreable content
    if (commodityScore === -1) {
      return NextResponse.json({
        error: 'We couldn\'t analyze this page.',
        hint: 'The content we found wasn\'t what we expected. Try your homepage or a main services page instead.',
      }, { status: 400 })
    }

    // Detect industry from content
    const industry = detectIndustry(allText)
    console.log(`[Analyze] Score: ${commodityScore} (penalty: ${scoringResult.commodityPenalty}, bonus: ${scoringResult.differentiationBonus}), industry: ${industry}`)

    // Generate diagnosis and cost (pass contentQuality and industry for honest diagnosis)
    const diagnosis = generateDiagnosis(commodityScore, detectedPhrases.length, differentiationSignals.length, contentQuality, industry)
    const costResult = calculateCostEstimate(commodityScore, industry)

    // Fetch additional pages for more context (if direct scrape worked)
    const allStats: string[] = []
    const allProofs: string[] = []

    if (scrapeResult.method === 'direct') {
      const keyPages = findKeyPages(scrapeResult.html, validUrl)
      for (const pageUrl of keyPages.slice(0, 2)) {
        try {
          const pageResult = await scrapeUrl(pageUrl)
          if (pageResult.html) {
            const pageContent = extractFromHtml(pageResult.html, pageUrl)
            allStats.push(...extractStats(pageContent.bodyText))
            allProofs.push(...extractProofPoints(pageContent.bodyText))
          }
        } catch {
          // Silent fail for secondary pages
        }
      }
    }

    // Add stats from main page
    allStats.push(...extractStats(allText))
    allProofs.push(...extractProofPoints(allText))

    // Generate fixes with Claude
    const fixes = await generateFixesWithClaude(
      detectedPhrases,
      differentiationSignals,
      headline,
      subheadline,
      bodyText,
      companyName,
      validUrl,
      [...new Set(allStats)].slice(0, 10),
      [...new Set(allProofs)].slice(0, 5)
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
      costEstimate: costResult.estimate,
      costAssumptions: costResult.assumptions,
      diagnosis,
      detectedPhrases,
      differentiationSignals: differentiationSignals.map(s => ({
        type: s.type,
        value: s.value,
        strength: s.strength,
        location: s.location,
      })),
      fixes,
      scrapeMethod: scrapeResult.method,
      contentQuality,
      industry,
      createdAt: new Date().toISOString(),
    }

    // Store result in Vercel KV
    await kv.set(`result:${id}`, result, { ex: RESULT_TTL_SECONDS })

    // Store scan log with full URL and result ID (so Lee can see exact reports)
    try {
      await kv.lpush('analytics:scans', {
        url: validUrl,
        resultId: id,
        companyName,
        score: commodityScore,
        industry,
        ip: clientIP,
        timestamp: new Date().toISOString(),
      })
      // Keep last 500 scans (30 days of results stored, scan log for visibility)
      await kv.ltrim('analytics:scans', 0, 499)
    } catch {
      // Silent fail - scan log shouldn't break the main flow
    }

    // Store anonymized analytics (aggregate stats)
    try {
      const analyticsData = {
        timestamp: new Date().toISOString(),
        score: commodityScore,
        phraseCount: detectedPhrases.length,
        signalCount: differentiationSignals.length,
        phrases: detectedPhrases.map(p => ({ phrase: p.phrase, category: p.category })),
        scrapeMethod: scrapeResult.method,
        contentQuality,
        domain: new URL(validUrl).hostname.replace(/^www\./, ''),
      }
      await kv.lpush('analytics:analyses', JSON.stringify(analyticsData))
      await kv.ltrim('analytics:analyses', 0, 999)
    } catch {
      // Silent fail - analytics shouldn't break the main flow
    }

    console.log(`[Analyze] Success: ID ${id}, score ${commodityScore}`)
    return NextResponse.json({ id })

  } catch (error) {
    console.error('Analysis error:', error)

    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase()
      const errorName = error.name || ''

      if (errorMsg.includes('timed out') || errorMsg.includes('timeout') || errorName === 'AbortError') {
        return NextResponse.json({
          error: 'The website took too long to respond. Try again or try a different site.'
        }, { status: 504 })
      }

      if (errorMsg.includes('enotfound') || errorMsg.includes('dns') || errorMsg.includes('getaddrinfo')) {
        return NextResponse.json({
          error: 'Could not find that website. Check the URL and try again.'
        }, { status: 400 })
      }

      if (errorMsg.includes('econnrefused') || errorMsg.includes('connection refused')) {
        return NextResponse.json({
          error: 'The website refused the connection. It may be down or blocking automated access.'
        }, { status: 503 })
      }

      if (errorMsg.includes('certificate') || errorMsg.includes('ssl') || errorMsg.includes('tls')) {
        return NextResponse.json({
          error: 'We couldn\'t connect securely to that website. The site may be having technical issues. Try again later or contact the site owner.'
        }, { status: 400 })
      }

      if (errorMsg.includes('403') || errorMsg.includes('forbidden')) {
        return NextResponse.json({
          error: 'The website blocked our request. It may be using bot protection.'
        }, { status: 403 })
      }

      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        return NextResponse.json({
          error: 'Page not found. Check the URL and try again.'
        }, { status: 404 })
      }

      if (errorMsg.includes('508') || errorMsg.includes('loop')) {
        return NextResponse.json({
          error: 'The website has a redirect loop. This is a site configuration issue - try a different URL.'
        }, { status: 508 })
      }

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
    return NextResponse.json({ error: 'We couldn\'t find that analysis. Results expire after 30 days — run a new test to get fresh results.' }, { status: 404 })
  }

  return NextResponse.json(result)
}
