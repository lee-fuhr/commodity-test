// Strategy 1: Direct fetch with browser-like headers + SSRF protection

import type { ScrapeResult } from '../scraper'

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

export function isPrivateUrl(url: string): boolean {
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

export async function fetch(url: string, timeout: number = 15000): Promise<ScrapeResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await globalThis.fetch(url, {
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
