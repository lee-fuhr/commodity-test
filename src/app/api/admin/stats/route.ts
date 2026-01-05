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
  timestamp: string
}

interface GuideEmail {
  email: string
  firstName: string | null
  timestamp: string
  source: string
}

interface ContactSubmission {
  name: string
  email: string
  message: string
  timestamp: string
}

interface ResultEmail {
  email: string
  resultId: string
  companyName: string
  timestamp: string
  source: string
}

export async function GET(request: NextRequest) {
  // Check API key
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')

  // Allow access in development or with valid API key
  const isDev = process.env.NODE_ENV === 'development'
  const hasValidKey = ADMIN_API_KEY && apiKey === ADMIN_API_KEY

  if (!isDev && !hasValidKey) {
    return NextResponse.json(
      { error: 'Unauthorized. Set Authorization: Bearer <ADMIN_API_KEY> header.' },
      { status: 401 }
    )
  }

  try {
    // Get recent scans (full URL + result ID for clicking through)
    const scans = await kv.lrange<ScanEntry>('analytics:scans', 0, 49)

    // Get guide emails collected
    const guideEmails = await kv.lrange<GuideEmail>('guide:emails', 0, 49)

    // Get contact form submissions
    const contactSubmissions = await kv.lrange<ContactSubmission>('contact_submissions', 0, 49)

    // Get result page email captures
    const resultEmails = await kv.lrange<ResultEmail>('result:emails', 0, 49)

    // Get total counts
    const totalScans = await kv.llen('analytics:scans')
    const totalGuideEmails = await kv.llen('guide:emails')
    const totalContacts = await kv.llen('contact_submissions')
    const totalResultEmails = await kv.llen('result:emails')

    // Build result URLs for easy clicking
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecommoditytest.com'
    const scansWithLinks = scans.map(scan => ({
      ...scan,
      resultUrl: `${siteUrl}/r/${scan.resultId}`,
    }))

    // Build result email URLs for clicking through
    const resultEmailsWithLinks = resultEmails.map(re => ({
      ...re,
      resultUrl: `${siteUrl}/r/${re.resultId}`,
    }))

    return NextResponse.json({
      summary: {
        totalScans,
        totalGuideEmails,
        totalResultEmails,
        totalContacts,
        lastUpdated: new Date().toISOString(),
      },
      recentScans: scansWithLinks,
      guideEmails,
      resultEmails: resultEmailsWithLinks,
      contactSubmissions,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
