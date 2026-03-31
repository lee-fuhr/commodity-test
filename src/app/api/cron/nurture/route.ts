import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { kv } from '@vercel/kv'
import { logger } from '@shared/lib/logger'

interface NurtureEntry {
  email: string
  firstName: string | null
  step: 2 | 3 | 4
  signupAt: string
}

function checkAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return process.env.NODE_ENV === 'development'
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${cronSecret}`
}

function step2Html(firstName: string | null, email: string): string {
  const name = firstName ? firstName : 'Hey'
  const unsubscribeUrl = `https://areyougeneric.com/unsubscribe?email=${encodeURIComponent(email)}`
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.7; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 30px 20px; }
    p { margin: 0 0 18px 0; font-size: 16px; }
    .sig { margin-top: 30px; }
    a { color: #0066cc; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #888; }
  </style>
</head>
<body>
  <p>${name},</p>

  <p>Three days ago you downloaded the Commodity Messaging Fix Kit. I'm curious — did you actually try the worksheet?</p>

  <p>The one where you print your homepage, grab a highlighter, and go through the 6-item checklist. Most people skim past it. The ones who actually do it find 4-6 highlights in about 10 minutes, and it's usually a little humbling.</p>

  <p>If you did try it — what did you find? I'm not pitching anything. I genuinely want to know what showed up. Reply and tell me.</p>

  <p>If you haven't tried it yet, no pressure. But if you do — reply and tell me how bad it was. Honesty welcome.</p>

  <div class="sig">
    <p>— Lee</p>
    <p style="font-size: 14px; color: #555;">Lee Fuhr<br>
    I help manufacturers stop sounding like everyone else.<br>
    <a href="https://leefuhr.com">leefuhr.com</a></p>
  </div>

  <div class="footer">
    You're getting this because you downloaded the guide at areyougeneric.com.
    <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
  </div>
</body>
</html>`
}

function step3Html(firstName: string | null, email: string): string {
  const name = firstName ? firstName : 'Hey'
  const unsubscribeUrl = `https://areyougeneric.com/unsubscribe?email=${encodeURIComponent(email)}`
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.7; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 30px 20px; }
    p { margin: 0 0 18px 0; font-size: 16px; }
    .callout { background: #f5f5f5; border-left: 3px solid #333; padding: 12px 16px; margin: 20px 0; }
    .callout p { margin: 0; }
    .sig { margin-top: 30px; }
    a { color: #0066cc; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #888; }
  </style>
</head>
<body>
  <p>${name},</p>

  <p>One thing I keep seeing on manufacturer homepages — more than any other pattern — is what I call "borrowed credibility."</p>

  <p>It goes like this: "With over 25 years of experience, we're committed to delivering quality solutions to customers across all industries."</p>

  <p>Every single word of that sentence could appear on any competitor's site. Maybe already does. "25 years" sounds specific but it's not — it tells me nothing about what you've done for 25 years, or why that matters to me right now.</p>

  <div class="callout">
    <p>The fix: replace the duration with the proof. Not "25 years of experience" but "2,400 parts shipped to aerospace clients. Zero field failures since 2019." Now I know what you've been doing for 25 years — and why I should care.</p>
  </div>

  <p>Duration is a proxy for credibility. The actual credibility is in what happened during those years. Show me that instead.</p>

  <p>That's the pattern. If you see it on your site, it's fixable in an afternoon.</p>

  <p>Questions? Just reply.</p>

  <div class="sig">
    <p>— Lee</p>
    <p style="font-size: 14px; color: #555;">Lee Fuhr<br>
    I help manufacturers stop sounding like everyone else.<br>
    <a href="https://leefuhr.com">leefuhr.com</a></p>
  </div>

  <div class="footer">
    You're getting this because you downloaded the guide at areyougeneric.com.
    <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
  </div>
</body>
</html>`
}

function step4Html(firstName: string | null, email: string): string {
  const name = firstName ? firstName : 'Hey'
  const unsubscribeUrl = `https://areyougeneric.com/unsubscribe?email=${encodeURIComponent(email)}`
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.7; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 30px 20px; }
    p { margin: 0 0 18px 0; font-size: 16px; }
    .sig { margin-top: 30px; }
    a { color: #0066cc; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 13px; color: #888; }
  </style>
</head>
<body>
  <p>${name},</p>

  <p>Three weeks ago you downloaded the Commodity Messaging Fix Kit. I've sent you a couple of things since then. This is my last one for a while — don't want to wear out my welcome.</p>

  <p>If any of it was useful, I'm glad. If you want to think through your own site's messaging with someone who's been in this for 25 years — I'm available. No agenda, no pitch. Thirty minutes, you talk, I listen and react.</p>

  <p>Just reply to this email and say "yes" and we'll find a time.</p>

  <p>If now's not the right time, that's completely fine. The guide isn't going anywhere.</p>

  <div class="sig">
    <p>— Lee</p>
    <p style="font-size: 14px; color: #555;">Lee Fuhr<br>
    I help manufacturers stop sounding like everyone else.<br>
    <a href="https://leefuhr.com">leefuhr.com</a></p>
  </div>

  <div class="footer">
    You're getting this because you downloaded the guide at areyougeneric.com.
    <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
  </div>
</body>
</html>`
}

const STEP_CONFIG: Record<number, { subject: string; html: (n: string | null, email: string) => string }> = {
  2: {
    subject: 'That worksheet — did you actually use it?',
    html: step2Html,
  },
  3: {
    subject: 'The most common thing I see on manufacturer sites',
    html: step3Html,
  },
  4: {
    subject: 'One more thing (then I\'ll leave you alone)',
    html: step4Html,
  },
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    logger.error('RESEND_API_KEY not configured — nurture cron cannot send', { tool: 'commodity-test', fn: 'GET /api/cron/nurture' })
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
  }
  const resend = new Resend(resendApiKey)

  try {
    const now = Date.now()
    const dueEntries = await kv.zrange<NurtureEntry[]>('nurture:queue', '-inf', now, { byScore: true })

    if (!dueEntries || dueEntries.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No emails due' })
    }

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const entry of dueEntries) {
      // Check if unsubscribed
      const unsubscribed = await kv.get(`unsub:${entry.email}`)
      if (unsubscribed) {
        await kv.zrem('nurture:queue', entry)
        continue
      }

      const config = STEP_CONFIG[entry.step]
      if (!config) {
        logger.error('Unknown nurture step', { tool: 'commodity-test', fn: 'GET /api/cron/nurture', step: entry.step })
        await kv.zrem('nurture:queue', entry)
        continue
      }

      try {
        const { error } = await resend.emails.send({
          from: 'Lee Fuhr <hi@mail.leefuhr.com>',
          to: [entry.email],
          subject: config.subject,
          html: config.html(entry.firstName, entry.email),
        })

        if (error) {
          logger.error('Resend send error', { tool: 'commodity-test', fn: 'GET /api/cron/nurture', step: entry.step, err: error.message })
          failed++
          errors.push(`${entry.email} step ${entry.step}: ${error.message}`)
        } else {
          await kv.zrem('nurture:queue', entry)
          sent++
        }
      } catch (err) {
        logger.error('Unexpected send error', { tool: 'commodity-test', fn: 'GET /api/cron/nurture', step: entry.step, err: String(err) })
        failed++
        errors.push(`${entry.email} step ${entry.step}: unexpected error`)
      }
    }

    logger.info('Nurture cron complete', { tool: 'commodity-test', fn: 'GET /api/cron/nurture', sent, failed })
    return NextResponse.json({ success: true, sent, failed, errors: errors.length > 0 ? errors : undefined })
  } catch (err) {
    logger.error('Nurture cron error', { tool: 'commodity-test', fn: 'GET /api/cron/nurture', err: String(err) })
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
