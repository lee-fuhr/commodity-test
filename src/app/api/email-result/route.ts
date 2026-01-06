import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { kv } from '@vercel/kv'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const { email, resultId, companyName } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!resultId) {
      return NextResponse.json({ error: 'Result ID is required' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://areyougeneric.com'
    const resultUrl = `${siteUrl}/r/${resultId}`

    // Store the lead with result association
    try {
      await kv.lpush('result:emails', {
        email,
        resultId,
        companyName: companyName || 'Unknown',
        timestamp: new Date().toISOString(),
        source: 'result-page-email'
      })
    } catch (kvError) {
      console.error('Failed to store result email in KV:', kvError)
    }

    if (!resend) {
      // If Resend not configured, still store the lead and return success
      console.warn('RESEND_API_KEY not configured - lead stored but email not sent')
      return NextResponse.json({ success: true, stored: true, sent: false })
    }

    // Send the email
    const { error } = await resend.emails.send({
      from: 'Lee Fuhr <hi@mail.leefuhr.com>',
      to: [email],
      subject: `Your Commodity Test results for ${companyName || 'your website'}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0066cc; color: white; padding: 20px; margin: -20px -20px 30px -20px; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .cta { background: #0066cc; color: white; padding: 15px 30px; text-align: center; margin: 30px 0; display: inline-block; text-decoration: none; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Your Commodity Test results</h1>
  </div>

  <p>Here's the link to your analysis for <strong>${companyName || 'your website'}</strong>:</p>

  <p style="text-align: center;">
    <a href="${resultUrl}" class="cta">View your results</a>
  </p>

  <p>This link will work for 30 days. After that, you can always run a fresh test.</p>

  <p>Questions about your results? Just reply to this email.</p>

  <div class="footer">
    <p><strong>Lee Fuhr</strong><br>
    I help manufacturers stop sounding like everyone else<br>
    <a href="https://leefuhr.com">leefuhr.com</a></p>
  </div>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, stored: true, sent: true })
  } catch (error) {
    console.error('Email result error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
