import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { nanoid } from 'nanoid'
import { kv } from '@vercel/kv'
import crypto from 'crypto'
import { waitUntil } from '@vercel/functions'
import { scrapeUrl, extractContent as extractFromHtml, type ExtractedContent } from '@/lib/scraper'
import {
  detectCommodityPhrases,
  detectDifferentiationSignals,
  calculateScore,
  generateDiagnosis,
  calculateCostEstimate,
  detectIndustry,
  type DetectedIndustry,
} from '@/lib/scoring'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { generateFixesWithClaude } from '@/lib/claude-orchestrator'
import { logger } from '@shared/lib/logger'

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

// TTL for stored results (30 days in seconds for Vercel KV)
const RESULT_TTL_SECONDS = 30 * 24 * 60 * 60
// TTL for pending/processing state (10 minutes — if analysis hasn't completed, it failed)
const PENDING_TTL_SECONDS = 10 * 60

interface CostAssumptions {
  averageDealValue: number
  annualDeals: number
  lossRate: number
  lossRateLabel: string
}

interface AnalysisResult {
  id: string
  status: 'processing' | 'complete' | 'error'
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
  error?: string
  errorHint?: string
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
        if (!keyPages.includes(url)) keyPages.push(url)
      }
    } catch {
      // Invalid URL, skip
    }
  })

  return keyPages.slice(0, 3)
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
    if (matches) stats.push(...matches.map(m => m.trim()))
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

// The actual analysis work — runs in background via waitUntil()
async function runAnalysis(id: string, validUrl: string, clientIP: string): Promise<void> {
  try {
    const scrapeResult = await scrapeUrl(validUrl)

    if (scrapeResult.method === 'failed' || scrapeResult.contentLength < 100) {
      logger.warn('Scraping failed', { tool: 'commodity-test', fn: 'runAnalysis', url: validUrl, error: scrapeResult.error })
      await kv.set(`result:${id}`, {
        id,
        status: 'error',
        url: validUrl,
        error: 'That site won\'t let anyone look.',
        errorHint: 'Some companies are... protective about their messaging. Their security blocks outside analysis. Make of that what you will. Try a competitor instead.',
        createdAt: new Date().toISOString(),
      }, { ex: PENDING_TTL_SECONDS })
      return
    }

    const extractedContent: ExtractedContent = extractFromHtml(scrapeResult.html, validUrl)
    const { headline, subheadline, bodyText, companyName, contentQuality, wordCount, schemaDescription, metaDescription } = extractedContent

    logger.info('Extracted content', { tool: 'commodity-test', fn: 'runAnalysis', wordCount, contentQuality })

    if (contentQuality === 'failed') {
      await kv.set(`result:${id}`, {
        id,
        status: 'error',
        url: validUrl,
        error: 'Can\'t find the text on this one.',
        errorHint: 'The way this site was built hides its content from analysis tools—usually JavaScript frameworks or text baked into images. Not great for their SEO either. Try another page or a different site.',
        createdAt: new Date().toISOString(),
      }, { ex: PENDING_TTL_SECONDS })
      return
    }

    const allText = `${headline} ${subheadline} ${schemaDescription || ''} ${metaDescription || ''} ${bodyText}`

    const detectedPhrases = detectCommodityPhrases(allText).map(phrase => ({
      ...phrase,
      context: extractPhraseContext(allText, phrase.phrase)
    }))

    const differentiationSignals = detectDifferentiationSignals(allText)

    const scoringResult = calculateScore(detectedPhrases, differentiationSignals, contentQuality)
    const commodityScore = scoringResult.score

    if (commodityScore === -1) {
      await kv.set(`result:${id}`, {
        id,
        status: 'error',
        url: validUrl,
        error: 'We couldn\'t analyze this page.',
        errorHint: 'The content we found wasn\'t what we expected. Try your homepage or a main services page instead.',
        createdAt: new Date().toISOString(),
      }, { ex: PENDING_TTL_SECONDS })
      return
    }

    const domain = new URL(validUrl).hostname.replace(/^www\./, '')
    const learnedIndustry = await kv.get<string>(`industry:learned:${domain}`)
    const industry = (learnedIndustry as DetectedIndustry) || detectIndustry(allText)
    logger.info('Score calculated', { tool: 'commodity-test', fn: 'runAnalysis', commodityScore, penalty: scoringResult.commodityPenalty, bonus: scoringResult.differentiationBonus, industry, learnedIndustry: !!learnedIndustry })

    const diagnosis = generateDiagnosis(commodityScore, detectedPhrases.length, differentiationSignals.length, contentQuality, industry)
    const costResult = calculateCostEstimate(commodityScore, industry)

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
        } catch (err) {
          logger.error('Secondary scrape failed', { tool: 'commodity-test', fn: 'runAnalysis', pageUrl, error: err instanceof Error ? err.message : String(err) })
        }
      }
    }

    allStats.push(...extractStats(allText))
    allProofs.push(...extractProofPoints(allText))

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

    const result: AnalysisResult = {
      id,
      status: 'complete',
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

    await kv.set(`result:${id}`, result, { ex: RESULT_TTL_SECONDS })

    try {
      await kv.lpush('analytics:scans', {
        url: validUrl,
        resultId: id,
        companyName,
        score: commodityScore,
        industry,
        ip: hashIP(clientIP),
        timestamp: new Date().toISOString(),
      })
      await kv.ltrim('analytics:scans', 0, 499)
    } catch (err) {
      logger.warn('KV scan log failed — non-fatal', { fn: 'runAnalysis', err: String(err) })
    }

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
    } catch (err) {
      logger.warn('KV analytics log failed — non-fatal', { fn: 'runAnalysis', err: String(err) })
    }

    logger.info('Analysis complete', { tool: 'commodity-test', fn: 'runAnalysis', resultId: id, commodityScore })

  } catch (error) {
    logger.error('Analysis error', { tool: 'commodity-test', fn: 'runAnalysis', id, error: error instanceof Error ? error.message : String(error) })

    // Store the error state so the polling client knows what happened
    const errorMessage = getErrorMessage(error)
    await kv.set(`result:${id}`, {
      id,
      status: 'error',
      url: validUrl,
      error: errorMessage,
      createdAt: new Date().toISOString(),
    }, { ex: PENDING_TTL_SECONDS }).catch(() => {
      // If even the error storage fails, there's nothing more we can do
    })
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase()
    const errorName = error.name || ''

    if (errorMsg.includes('timed out') || errorMsg.includes('timeout') || errorName === 'AbortError') {
      return 'The website took too long to respond. Try again or try a different site.'
    }
    if (errorMsg.includes('enotfound') || errorMsg.includes('dns') || errorMsg.includes('getaddrinfo')) {
      return 'Could not find that website. Check the URL and try again.'
    }
    if (errorMsg.includes('econnrefused') || errorMsg.includes('connection refused')) {
      return 'The website refused the connection. It may be down or blocking automated access.'
    }
    if (errorMsg.includes('certificate') || errorMsg.includes('ssl') || errorMsg.includes('tls')) {
      return 'We couldn\'t connect securely to that website. The site may be having technical issues. Try again later or contact the site owner.'
    }
    if (errorMsg.includes('403') || errorMsg.includes('forbidden')) {
      return 'The website blocked our request. It may be using bot protection.'
    }
    if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      return 'Page not found. Check the URL and try again.'
    }
    if (errorMsg.includes('508') || errorMsg.includes('loop')) {
      return 'The website has a redirect loop. This is a site configuration issue - try a different URL.'
    }
    if (process.env.NODE_ENV === 'development') {
      return `Analysis failed: ${error.message}`
    }
  }
  return 'Failed to analyze URL. Please check the URL and try again.'
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimitResult = await checkRateLimit(clientIP, { hourlyLimit: 3, dailyLimit: 3 })

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limited', { tool: 'commodity-test', fn: 'POST /api/analyze', ip: clientIP, message: rateLimitResult.message })
      const response = NextResponse.json(
        { error: rateLimitResult.message, rateLimited: true, retryAfterSeconds: rateLimitResult.retryAfterSeconds },
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

    let validUrl: string
    try {
      const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
      validUrl = new URL(urlWithProtocol).toString()
    } catch {
      return NextResponse.json({ error: 'That doesn\'t look like a valid website address. Try something like "example.com" or "https://example.com".' }, { status: 400 })
    }

    // Generate ID and store pending state immediately
    const id = nanoid(10)
    await kv.set(`result:${id}`, {
      id,
      status: 'processing',
      url: validUrl,
      createdAt: new Date().toISOString(),
    }, { ex: PENDING_TTL_SECONDS })

    logger.info('Starting analysis (async)', { tool: 'commodity-test', fn: 'POST /api/analyze', url: validUrl, id })

    // Run the analysis in the background via waitUntil
    // This allows us to return the ID to the client immediately
    // while the analysis continues running on Vercel's infrastructure
    waitUntil(runAnalysis(id, validUrl, clientIP))

    // Return immediately with the job ID
    return NextResponse.json({ id })

  } catch (error) {
    logger.error('Analysis setup error', { tool: 'commodity-test', fn: 'POST /api/analyze', error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: 'Failed to start analysis. Please try again.' }, { status: 500 })
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
