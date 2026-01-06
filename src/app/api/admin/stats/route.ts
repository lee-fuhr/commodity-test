import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { detectIndustry, type DetectedIndustry } from '@/lib/scoring'
import { scrapeUrl, extractContent } from '@/lib/scraper'

// Simple API key protection - set ADMIN_API_KEY in env
// Read inside function to ensure env var is available at request time (not module load)

interface ScanEntry {
  url: string
  resultId: string
  companyName: string
  score: number
  industry: string
  ip?: string
  timestamp: string
  ignored?: boolean
}

interface GuideEmail {
  email: string
  firstName: string | null
  timestamp: string
  source: string
  ignored?: boolean
}

interface ContactSubmission {
  name: string
  email: string
  message: string
  timestamp: string
  ignored?: boolean
}

interface ResultEmail {
  email: string
  resultId: string
  companyName: string
  timestamp: string
  source: string
  ignored?: boolean
}

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')
  const isDev = process.env.NODE_ENV === 'development'
  const adminApiKey = process.env.ADMIN_API_KEY
  const hasValidKey = !!(adminApiKey && apiKey === adminApiKey)
  return isDev || hasValidKey
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Set Authorization: Bearer <ADMIN_API_KEY> header.' },
      { status: 401 }
    )
  }

  try {
    // Get ignored IPs
    const ignoredIPs = await kv.smembers('admin:ignored-ips') || []

    // Get ignored record keys (format: "type:timestamp")
    const ignoredRecords = await kv.smembers('admin:ignored-records') || []
    const ignoredSet = new Set(ignoredRecords)

    // Get recent scans (full URL + result ID for clicking through)
    const rawScans = await kv.lrange<ScanEntry>('analytics:scans', 0, 99)

    // Get guide emails collected
    const rawGuideEmails = await kv.lrange<GuideEmail>('guide:emails', 0, 99)

    // Get contact form submissions
    const rawContacts = await kv.lrange<ContactSubmission>('contact_submissions', 0, 99)

    // Get result page email captures
    const rawResultEmails = await kv.lrange<ResultEmail>('result:emails', 0, 99)

    // Mark ignored records and filter for counts
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://areyougeneric.com'

    const scans = rawScans.map(scan => ({
      ...scan,
      resultUrl: `${siteUrl}/r/${scan.resultId}`,
      ignored: ignoredSet.has(`scan:${scan.timestamp}`) || (scan.ip && ignoredIPs.includes(scan.ip)),
    }))

    const guideEmails = rawGuideEmails.map(g => ({
      ...g,
      ignored: ignoredSet.has(`guide:${g.timestamp}`),
    }))

    const resultEmails = rawResultEmails.map(re => ({
      ...re,
      resultUrl: `${siteUrl}/r/${re.resultId}`,
      ignored: ignoredSet.has(`result:${re.timestamp}`),
    }))

    const contacts = rawContacts.map(c => ({
      ...c,
      ignored: ignoredSet.has(`contact:${c.timestamp}`),
    }))

    // Counts exclude ignored records
    const totalScans = scans.filter(s => !s.ignored).length
    const totalGuideEmails = guideEmails.filter(g => !g.ignored).length
    const totalResultEmails = resultEmails.filter(r => !r.ignored).length
    const totalContacts = contacts.filter(c => !c.ignored).length

    return NextResponse.json({
      summary: {
        totalScans,
        totalGuideEmails,
        totalResultEmails,
        totalContacts,
        lastUpdated: new Date().toISOString(),
      },
      recentScans: scans,
      guideEmails,
      resultEmails,
      contactSubmissions: contacts,
      ignoredIPs,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, type, timestamp, ip } = body

    switch (action) {
      case 'ignore':
        // Ignore a specific record by type and timestamp
        if (!type || !timestamp) {
          return NextResponse.json({ error: 'Missing type or timestamp' }, { status: 400 })
        }
        await kv.sadd('admin:ignored-records', `${type}:${timestamp}`)
        return NextResponse.json({ success: true, message: `Ignored ${type}:${timestamp}` })

      case 'unignore':
        // Unignore a specific record
        if (!type || !timestamp) {
          return NextResponse.json({ error: 'Missing type or timestamp' }, { status: 400 })
        }
        await kv.srem('admin:ignored-records', `${type}:${timestamp}`)
        return NextResponse.json({ success: true, message: `Unignored ${type}:${timestamp}` })

      case 'ignore-ip':
        // Ignore all records from an IP
        if (!ip) {
          return NextResponse.json({ error: 'Missing ip' }, { status: 400 })
        }
        await kv.sadd('admin:ignored-ips', ip)
        return NextResponse.json({ success: true, message: `Ignored IP ${ip}` })

      case 'unignore-ip':
        // Unignore an IP
        if (!ip) {
          return NextResponse.json({ error: 'Missing ip' }, { status: 400 })
        }
        await kv.srem('admin:ignored-ips', ip)
        return NextResponse.json({ success: true, message: `Unignored IP ${ip}` })

      case 'delete':
        // Actually delete a record (more permanent)
        // For now, we'll just mark it as ignored - actual deletion from lists is complex
        // since KV lists don't support removal by value easily
        if (!type || !timestamp) {
          return NextResponse.json({ error: 'Missing type or timestamp' }, { status: 400 })
        }
        await kv.sadd('admin:ignored-records', `${type}:${timestamp}`)
        return NextResponse.json({ success: true, message: `Deleted (ignored) ${type}:${timestamp}` })

      case 'recategorize':
        // Re-run industry detection on all stored results
        return await recategorizeResults()

      case 'set-industry': {
        // Manually override industry for a specific result
        const { resultId, newIndustry } = body
        if (!resultId || !newIndustry) {
          return NextResponse.json({ error: 'Missing resultId or newIndustry' }, { status: 400 })
        }

        // Validate industry
        const validIndustries = ['manufacturing', 'distribution', 'saas', 'agency', 'services', 'construction', 'healthcare', 'finance', 'retail', 'general']
        if (!validIndustries.includes(newIndustry)) {
          return NextResponse.json({ error: 'Invalid industry' }, { status: 400 })
        }

        // Update stored result
        const result = await kv.get<Record<string, unknown>>(`result:${resultId}`)
        if (result) {
          await kv.set(`result:${resultId}`, { ...result, industry: newIndustry })

          // Learn from this override - store domain → industry mapping for future scans
          const url = result.url as string | undefined
          if (url) {
            try {
              const domain = new URL(url).hostname.replace(/^www\./, '')
              await kv.set(`industry:learned:${domain}`, newIndustry)
            } catch {
              // Invalid URL, skip learning
            }
          }
        }

        // Update scan log entries with this resultId
        const scans = await kv.lrange<ScanEntry>('analytics:scans', 0, 499)
        const updatedScans = scans.map(scan =>
          scan.resultId === resultId ? { ...scan, industry: newIndustry } : scan
        )

        // Check if any actually changed
        const changed = scans.some((scan, i) => scan.resultId === resultId && scan.industry !== newIndustry)
        if (changed) {
          await kv.del('analytics:scans')
          for (const scan of updatedScans.reverse()) {
            await kv.lpush('analytics:scans', scan)
          }
        }

        return NextResponse.json({ success: true, message: `Set industry to ${newIndustry} for result ${resultId}` })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin action error:', error)
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 })
  }
}

// Recategorize all stored results with updated industry detection
// This re-scrapes URLs to get fresh text for detection
async function recategorizeResults() {
  try {
    // Get recent scans to find result IDs and URLs
    const scans = await kv.lrange<ScanEntry>('analytics:scans', 0, 499)

    // Dedupe by resultId, keeping track of URLs
    const resultMap = new Map<string, { id: string; url: string; oldIndustry: string }>()
    for (const scan of scans) {
      if (!resultMap.has(scan.resultId)) {
        resultMap.set(scan.resultId, { id: scan.resultId, url: scan.url, oldIndustry: scan.industry })
      }
    }

    let updated = 0
    let skipped = 0
    let failed = 0
    const changes: Array<{ id: string; url: string; from: string; to: string }> = []

    for (const [id, { url, oldIndustry }] of resultMap) {
      try {
        // Get stored result
        const result = await kv.get<{
          industry: DetectedIndustry
          [key: string]: unknown
        }>(`result:${id}`)

        if (!result) {
          skipped++
          continue
        }

        // Re-scrape the URL to get fresh text for industry detection
        const fullUrl = url.startsWith('http') ? url : `https://${url}`
        const scrapeResult = await scrapeUrl(fullUrl)

        if (scrapeResult.method === 'failed' || !scrapeResult.html) {
          failed++
          continue
        }

        const extracted = extractContent(scrapeResult.html, fullUrl)
        // Include schema and meta descriptions for better industry detection
        const textForDetection = `${extracted.headline} ${extracted.subheadline} ${extracted.schemaDescription || ''} ${extracted.metaDescription || ''} ${extracted.bodyText}`

        const newIndustry = detectIndustry(textForDetection)

        if (newIndustry !== oldIndustry) {
          // Update the stored result
          await kv.set(`result:${id}`, { ...result, industry: newIndustry })
          changes.push({ id, url, from: oldIndustry, to: newIndustry })
          updated++
        } else {
          skipped++
        }

        // Small delay to avoid hammering sites
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (e) {
        console.error(`Failed to recategorize ${id}:`, e)
        failed++
      }
    }

    // Also update the scan log entries
    const updatedScans = scans.map(scan => {
      const change = changes.find(c => c.id === scan.resultId)
      if (change) {
        return { ...scan, industry: change.to }
      }
      return scan
    })

    // Rewrite scan log if there were changes
    if (changes.length > 0) {
      await kv.del('analytics:scans')
      for (const scan of updatedScans.reverse()) {
        await kv.lpush('analytics:scans', scan)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Recategorized ${updated} results, skipped ${skipped}, failed ${failed}`,
      changes,
    })
  } catch (error) {
    console.error('Recategorize error:', error)
    return NextResponse.json({ error: 'Failed to recategorize' }, { status: 500 })
  }
}
