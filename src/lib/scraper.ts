// Multi-strategy scraper with anti-bot bypass
// Strategy 1: Direct fetch with browser-like headers
// Strategy 2: ScrapingBee API (handles JS, anti-bot, proxies)
// Strategy 3: Jina Reader API (free, good for simple sites)

import * as cheerio from 'cheerio'

// Configuration
const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY || ''
const JINA_API_KEY = process.env.JINA_API_KEY || ''

// User agents to rotate through
const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

// Private IP ranges to block (SSRF protection)
const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9][0-9]|1[0-2][0-9])\./,
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,
  /^::1$/,
  /^localhost$/i,
]

const BLOCKED_HOSTS = [
  'localhost', '127.0.0.1', '0.0.0.0', '::1',
  'metadata.google.internal', '169.254.169.254',
]

export interface ScrapeResult {
  html: string
  method: 'direct' | 'scrapingbee' | 'jina' | 'failed'
  error?: string
  contentLength: number
  statusCode?: number
}

export interface ExtractedContent {
  headline: string
  subheadline: string
  bodyText: string
  companyName: string
  contentQuality: 'excellent' | 'good' | 'minimal' | 'failed'
  wordCount: number
  hasStructuredContent: boolean
  isErrorPage?: boolean
  schemaDescription?: string  // From JSON-LD schema markup
  metaDescription?: string    // From meta description tag
}

function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    if (!['http:', 'https:'].includes(parsed.protocol)) return true
    if (BLOCKED_HOSTS.some(h => hostname === h || hostname.endsWith('.' + h))) return true
    if (PRIVATE_IP_PATTERNS.some(pattern => pattern.test(hostname))) return true

    return false
  } catch {
    return true
  }
}

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

function getBrowserHeaders(): Record<string, string> {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  }
}

// Strategy 1: Direct fetch with browser-like headers
async function fetchDirect(url: string, timeout: number = 15000): Promise<ScrapeResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: getBrowserHeaders(),
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        html: '',
        method: 'direct',
        error: `HTTP ${response.status}`,
        contentLength: 0,
        statusCode: response.status,
      }
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return {
        html: '',
        method: 'direct',
        error: 'Not HTML content',
        contentLength: 0,
      }
    }

    const html = await response.text()

    return {
      html,
      method: 'direct',
      contentLength: html.length,
      statusCode: response.status,
    }
  } catch (error) {
    clearTimeout(timeoutId)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      html: '',
      method: 'direct',
      error: errorMsg,
      contentLength: 0,
    }
  }
}

// Strategy 2: ScrapingBee API (handles JS rendering, anti-bot)
async function fetchWithScrapingBee(url: string, timeout: number = 30000): Promise<ScrapeResult> {
  if (!SCRAPINGBEE_API_KEY) {
    return {
      html: '',
      method: 'scrapingbee',
      error: 'SCRAPINGBEE_API_KEY not configured',
      contentLength: 0,
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const params = new URLSearchParams({
      api_key: SCRAPINGBEE_API_KEY,
      url: url,
      render_js: 'true',
      premium_proxy: 'true',
      country_code: 'us',
      wait: '2000', // Wait 2s for JS
      block_ads: 'true',
      block_resources: 'false',
    })

    const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        html: '',
        method: 'scrapingbee',
        error: `ScrapingBee API error: ${response.status}`,
        contentLength: 0,
        statusCode: response.status,
      }
    }

    const html = await response.text()

    return {
      html,
      method: 'scrapingbee',
      contentLength: html.length,
      statusCode: 200,
    }
  } catch (error) {
    clearTimeout(timeoutId)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      html: '',
      method: 'scrapingbee',
      error: errorMsg,
      contentLength: 0,
    }
  }
}

// Strategy 3: Jina Reader API (free fallback, good for content extraction)
async function fetchWithJina(url: string, timeout: number = 20000): Promise<ScrapeResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const headers: Record<string, string> = {
      'Accept': 'text/html',
    }

    if (JINA_API_KEY) {
      headers['Authorization'] = `Bearer ${JINA_API_KEY}`
    }

    // Jina Reader API - prepend r.jina.ai/ to the URL
    const jinaUrl = `https://r.jina.ai/${url}`

    const response = await fetch(jinaUrl, {
      signal: controller.signal,
      headers,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        html: '',
        method: 'jina',
        error: `Jina API error: ${response.status}`,
        contentLength: 0,
        statusCode: response.status,
      }
    }

    // Jina returns markdown, convert to pseudo-HTML for our parser
    const markdown = await response.text()

    // Wrap markdown in basic HTML structure for cheerio
    const html = `<!DOCTYPE html>
<html>
<head><title>Jina Extracted Content</title></head>
<body>
<main>
${markdown}
</main>
</body>
</html>`

    return {
      html,
      method: 'jina',
      contentLength: html.length,
      statusCode: 200,
    }
  } catch (error) {
    clearTimeout(timeoutId)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      html: '',
      method: 'jina',
      error: errorMsg,
      contentLength: 0,
    }
  }
}

// Main scraper with fallback chain
export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  // SSRF protection
  if (isPrivateUrl(url)) {
    return {
      html: '',
      method: 'failed',
      error: 'That URL doesn\'t look like a public website. Enter a regular website address like "example.com".',
      contentLength: 0,
    }
  }

  console.log(`[Scraper] Starting scrape: ${url}`)

  // Strategy 1: Try direct fetch first (fastest, cheapest)
  const directResult = await fetchDirect(url)

  if (directResult.html.length > 1000) {
    // Check if we got actual content or just a shell
    const $ = cheerio.load(directResult.html)
    const textContent = $('body').text().replace(/\s+/g, ' ').trim()

    if (textContent.length > 500) {
      console.log(`[Scraper] Direct fetch successful: ${textContent.length} chars`)
      return directResult
    }
  }

  // If direct fetch returned 403/401/503 or minimal content, try ScrapingBee
  const wasBlocked = directResult.statusCode === 403 ||
                     directResult.statusCode === 401 ||
                     directResult.statusCode === 503 ||
                     directResult.error?.includes('blocked') ||
                     directResult.contentLength < 1000

  if (wasBlocked && SCRAPINGBEE_API_KEY) {
    console.log(`[Scraper] Direct fetch blocked/minimal, trying ScrapingBee...`)
    const sbResult = await fetchWithScrapingBee(url)

    if (sbResult.html.length > 1000) {
      const $ = cheerio.load(sbResult.html)
      const textContent = $('body').text().replace(/\s+/g, ' ').trim()

      if (textContent.length > 500) {
        console.log(`[Scraper] ScrapingBee successful: ${textContent.length} chars`)
        return sbResult
      }
    }
  }

  // Strategy 3: Try Jina as last resort (good for content extraction)
  console.log(`[Scraper] Trying Jina Reader as fallback...`)
  const jinaResult = await fetchWithJina(url)

  if (jinaResult.html.length > 500) {
    console.log(`[Scraper] Jina successful: ${jinaResult.contentLength} chars`)
    return jinaResult
  }

  // All strategies failed
  console.log(`[Scraper] All strategies failed for ${url}`)
  return {
    html: '',
    method: 'failed',
    error: directResult.error || 'All scraping strategies failed',
    contentLength: 0,
  }
}

// Check if content looks like an error page
function isErrorPage(text: string, headline: string): boolean {
  const errorPatterns = [
    /404\s*(error|not found|page)/i,
    /page\s*(not|can't|cannot)\s*(be\s*)?found/i,
    /sorry,?\s*(we\s*)?(couldn't|could not|can't)\s*find/i,
    /this\s*page\s*(doesn't|does not)\s*exist/i,
    /whoops|oops/i,
    /something\s*went\s*wrong/i,
    /error\s*\d{3}/i,
    /access\s*denied/i,
    /forbidden/i,
    /we\s*(couldn't|could not)\s*find\s*(that|the)/i,
    /page\s*you\s*(are|were)\s*looking\s*for/i,
    /no\s*longer\s*(available|exists)/i,
    /has\s*been\s*(removed|deleted|moved)/i,
  ]

  const combinedText = `${headline} ${text.slice(0, 1000)}`.toLowerCase()
  return errorPatterns.some(pattern => pattern.test(combinedText))
}

// Extract meaningful content from HTML
export function extractContent(html: string, url: string): ExtractedContent {
  const $ = cheerio.load(html)

  // Extract JSON-LD schema BEFORE removing scripts
  let schemaDescription = ''
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const jsonText = $(el).html()
      if (jsonText) {
        const data = JSON.parse(jsonText)
        // Handle both single object and array of objects
        const schemas = Array.isArray(data) ? data : [data]
        for (const schema of schemas) {
          // Look for description in Organization, LocalBusiness, WebSite, etc.
          if (schema.description && typeof schema.description === 'string') {
            schemaDescription += ' ' + schema.description
          }
          // Also check @type for business descriptors
          if (schema['@type'] && typeof schema['@type'] === 'string') {
            schemaDescription += ' ' + schema['@type']
          }
        }
      }
    } catch {
      // Invalid JSON, skip
    }
  })
  schemaDescription = schemaDescription.trim()

  // Extract meta description
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() ||
                         $('meta[property="og:description"]').attr('content')?.trim() || ''

  // Remove script, style, nav, footer, header (common noise)
  $('script, style, noscript, iframe, nav, footer, header').remove()

  // Remove testimonial/quote content - we don't want to analyze or suggest fixing these
  // They're typically client quotes that shouldn't be edited
  $('blockquote').remove()
  $('[class*="testimonial"], [class*="quote"], [class*="review"]').remove()
  $('[class*="client-quote"], [class*="customer-quote"], [class*="feedback"]').remove()
  $('[id*="testimonial"], [id*="quote"], [id*="review"]').remove()

  // Extract headline
  let headline = ''
  const headlineSelectors = [
    'h1',
    '[class*="hero"] h1',
    '[class*="hero"] h2',
    '[class*="banner"] h1',
    '[class*="main"] h1',
    'main h1',
    'article h1',
  ]

  for (const selector of headlineSelectors) {
    const found = $(selector).first().text().trim()
    if (found && found.length > 5 && found.length < 200) {
      headline = found
      break
    }
  }

  // Extract subheadline
  let subheadline = ''
  const subheadlineSelectors = [
    'h1 + p',
    'h1 + h2',
    '[class*="hero"] p',
    '[class*="hero"] h2',
    '[class*="subtitle"]',
    '[class*="tagline"]',
    'h2:first-of-type',
  ]

  for (const selector of subheadlineSelectors) {
    const found = $(selector).first().text().trim()
    if (found && found.length > 10 && found.length < 300 && found !== headline) {
      subheadline = found
      break
    }
  }

  // Extract all visible text
  const bodyText = $('body')
    .text()
    .replace(/\s+/g, ' ')
    .trim()

  // Calculate word count
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length

  // Check for structured content (indicates real content, not just a shell)
  const hasH1 = $('h1').length > 0
  const hasH2 = $('h2').length > 0
  const hasParagraphs = $('p').length > 3
  const hasLists = $('ul, ol').length > 0
  const hasStructuredContent = (hasH1 || hasH2) && hasParagraphs

  // Extract company name - prefer og:site_name over title (title often has taglines)
  let companyName = $('meta[property="og:site_name"]').attr('content')?.trim() || ''

  // Fallback to application-name
  if (!companyName) {
    companyName = $('meta[name="application-name"]').attr('content')?.trim() || ''
  }

  // Fallback to title tag (split on common separators to get just company name)
  if (!companyName) {
    companyName = $('title').text()
      .split(/[|•–—\-:]/)[0]
      .replace(/\s+(Home|Homepage|Welcome)\s*$/i, '')
      .trim()
  }

  // If title is too long (probably a tagline), try the shorter part after split
  if (companyName && companyName.length > 50) {
    const titleParts = $('title').text().split(/[|•–—\-:]/)
    // Look for the shortest reasonable part (likely company name)
    const shortPart = titleParts
      .map(p => p.trim())
      .filter(p => p.length >= 2 && p.length <= 40)
      .sort((a, b) => a.length - b.length)[0]
    if (shortPart) {
      companyName = shortPart
    }
  }

  // Helper to check if company name looks like an error message or is invalid
  const isInvalidCompanyName = (name: string): boolean => {
    if (!name || name.length < 2) return true
    // Include "Jina Extracted Content" which comes from Jina fallback's fake HTML wrapper
    const errorPatterns = /whoops|error|not found|page not|404|500|403|oops|sorry|couldn't|could not|can't|cannot|unavailable|problem|went wrong|jina extracted content/i
    return errorPatterns.test(name)
  }

  // Fallback to domain if company name is missing or looks like an error
  if (!companyName || isInvalidCompanyName(companyName)) {
    try {
      const domain = new URL(url).hostname
      companyName = domain
        .replace(/^www\./, '')
        .split('.')[0]
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    } catch {
      companyName = 'Unknown Company'
    }
  }

  // Check if this looks like an error page
  const errorPage = isErrorPage(bodyText, headline)

  // Determine content quality
  let contentQuality: ExtractedContent['contentQuality']

  if (errorPage || wordCount < 50 || bodyText.length < 200) {
    contentQuality = 'failed'
  } else if (wordCount < 150 || !hasStructuredContent) {
    contentQuality = 'minimal'
  } else if (wordCount < 400 || !headline) {
    contentQuality = 'good'
  } else {
    contentQuality = 'excellent'
  }

  return {
    headline,
    subheadline,
    bodyText: bodyText.slice(0, 5000), // Cap at 5000 chars
    companyName,
    contentQuality,
    wordCount,
    hasStructuredContent,
    isErrorPage: errorPage,
    schemaDescription: schemaDescription || undefined,
    metaDescription: metaDescription || undefined,
  }
}
