import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// Simple API key protection - set ADMIN_API_KEY in env
const ADMIN_API_KEY = process.env.ADMIN_API_KEY

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
  const hasValidKey = !!(ADMIN_API_KEY && apiKey === ADMIN_API_KEY)
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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecommoditytest.com'

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

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin action error:', error)
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 })
  }
}
