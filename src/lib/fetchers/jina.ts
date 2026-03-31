// Strategy 3: Jina Reader API (free fallback, good for content extraction)

import type { ScrapeResult } from '../scraper'

const JINA_API_KEY = process.env.JINA_API_KEY || ''

export async function fetch(url: string, timeout: number = 20000): Promise<ScrapeResult> {
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

    const response = await globalThis.fetch(jinaUrl, {
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
