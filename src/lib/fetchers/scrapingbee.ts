// Strategy 2: ScrapingBee API (handles JS rendering, anti-bot, proxies)

import type { ScrapeResult } from '../scraper'

const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY || ''

export async function fetch(url: string, timeout: number = 30000): Promise<ScrapeResult> {
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

    const response = await globalThis.fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
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
