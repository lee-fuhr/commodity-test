import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { kv } from '@vercel/kv'

// Configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'hi@leefuhr.com'
const FROM_EMAIL = process.env.FROM_EMAIL || 'contact@areyougeneric.com'

// Initialize Resend if configured
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formType, tier, ...formData } = body

    // Basic server-side validation
    if (!formData.name || !formData.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Honeypot check (add hidden field in form for bot detection)
    if (formData._honeypot) {
      // Silently succeed for bots
      return NextResponse.json({ success: true })
    }

    // Create submission record
    const submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      formType,
      tier: tier || null,
      ...formData,
      submittedAt: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }

    // Store in Vercel KV if available
    let stored = false
    try {
      if (process.env.KV_REST_API_URL) {
        await kv.lpush('contact_submissions', JSON.stringify(submission))
        await kv.set(`submission:${submission.id}`, JSON.stringify(submission))
        stored = true
      }
    } catch (kvError) {
      console.error('KV storage error (non-fatal):', kvError)
    }

    // Send email via Resend if configured
    let emailed = false
    if (resend) {
      try {
        const subject = `[Commodity Test] ${formType === 'retainer' ? 'Retainer inquiry' : tier ? `${tier} tier inquiry` : 'Quote request'} from ${formData.name}`

        await resend.emails.send({
          from: `Commodity Test <${FROM_EMAIL}>`,
          to: NOTIFICATION_EMAIL,
          replyTo: formData.email,
          subject,
          html: formatEmailHtml(formType, tier, formData, submission.id),
          text: formatEmailBody(formType, tier, formData),
        })
        emailed = true
      } catch (emailError) {
        console.error('Resend email error (non-fatal):', emailError)
      }
    }

    // Always log for debugging
    console.log('=== CONTACT FORM SUBMISSION ===')
    console.log('ID:', submission.id)
    console.log('Type:', formType)
    console.log('Tier:', tier)
    console.log('Stored:', stored)
    console.log('Emailed:', emailed)
    console.log('Data:', JSON.stringify(formData, null, 2))
    console.log('===============================')

    // Success if either stored or emailed, or if neither is configured (dev mode)
    if (stored || emailed || (!process.env.KV_REST_API_URL && !resend)) {
      return NextResponse.json({
        success: true,
        id: submission.id,
      })
    } else {
      // Both failed when both were expected
      return NextResponse.json(
        { success: false, error: 'Failed to process submission' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}

function formatEmailBody(formType: string, tier: string | null, data: Record<string, string>): string {
  const lines = [
    `Form Type: ${formType === 'retainer' ? 'Retainer Inquiry' : 'Project Quote'}`,
  ]

  if (tier) {
    const tierNames: Record<string, string> = {
      playbook: 'The Playbook ($1,000)',
      core: 'Core Site ($18,000)',
      full: 'Full Site ($25,000)',
    }
    lines.push(`Selected Tier: ${tierNames[tier] || tier}`)
  }

  lines.push('')
  lines.push('--- Contact Info ---')
  if (data.name) lines.push(`Name: ${data.name}`)
  if (data.email) lines.push(`Email: ${data.email}`)
  if (data.company) lines.push(`Company: ${data.company}`)
  if (data.website) lines.push(`Website: ${data.website}`)
  if (data.role) lines.push(`Role: ${data.role}`)

  lines.push('')
  lines.push('--- Project Details ---')
  if (data.pages) lines.push(`Pages: ${data.pages}`)
  if (data.timeline) lines.push(`Timeline: ${data.timeline}`)
  if (data.context) lines.push(`Context:\n${data.context}`)
  if (data.challenge) lines.push(`Challenge:\n${data.challenge}`)
  if (data.goals) lines.push(`Goals:\n${data.goals}`)

  return lines.join('\n')
}

function formatEmailHtml(formType: string, tier: string | null, data: Record<string, string>, submissionId: string): string {
  const tierNames: Record<string, string> = {
    playbook: 'The Playbook ($1,000)',
    core: 'Core Site ($18,000)',
    full: 'Full Site ($25,000)',
  }

  const escapeHtml = (str: string) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a1a1a; font-size: 24px; margin-bottom: 8px; }
    .badge { display: inline-block; background: #f59e0b; color: #000; padding: 4px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }
    .section { margin: 24px 0; padding: 16px; background: #f9fafb; border-left: 4px solid #f59e0b; }
    .section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 0 0 12px 0; }
    .field { margin: 8px 0; }
    .field-label { font-weight: 600; color: #1a1a1a; }
    .field-value { color: #333; }
    .long-text { margin-top: 4px; padding: 12px; background: #fff; border: 1px solid #e5e7eb; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
    a { color: #f59e0b; }
  </style>
</head>
<body>
  <h1>${formType === 'retainer' ? 'Retainer inquiry' : 'Project quote request'}</h1>
  ${tier ? `<span class="badge">${tierNames[tier] || tier}</span>` : ''}

  <div class="section">
    <h2>Contact info</h2>
    <div class="field"><span class="field-label">Name:</span> <span class="field-value">${escapeHtml(data.name || '')}</span></div>
    <div class="field"><span class="field-label">Email:</span> <span class="field-value"><a href="mailto:${escapeHtml(data.email || '')}">${escapeHtml(data.email || '')}</a></span></div>
    ${data.company ? `<div class="field"><span class="field-label">Company:</span> <span class="field-value">${escapeHtml(data.company)}</span></div>` : ''}
    ${data.website ? `<div class="field"><span class="field-label">Website:</span> <span class="field-value"><a href="${escapeHtml(data.website)}">${escapeHtml(data.website)}</a></span></div>` : ''}
    ${data.role ? `<div class="field"><span class="field-label">Role:</span> <span class="field-value">${escapeHtml(data.role)}</span></div>` : ''}
  </div>

  <div class="section">
    <h2>Project details</h2>
    ${data.pages ? `<div class="field"><span class="field-label">Pages:</span> <span class="field-value">${escapeHtml(data.pages)}</span></div>` : ''}
    ${data.timeline ? `<div class="field"><span class="field-label">Timeline:</span> <span class="field-value">${escapeHtml(data.timeline)}</span></div>` : ''}
    ${data.context ? `<div class="field"><span class="field-label">Context:</span><div class="long-text">${escapeHtml(data.context)}</div></div>` : ''}
    ${data.challenge ? `<div class="field"><span class="field-label">Challenge:</span><div class="long-text">${escapeHtml(data.challenge)}</div></div>` : ''}
    ${data.goals ? `<div class="field"><span class="field-label">Goals:</span><div class="long-text">${escapeHtml(data.goals)}</div></div>` : ''}
  </div>

  <div class="footer">
    <p>Submission ID: ${submissionId}</p>
    <p>Reply directly to this email to respond to ${escapeHtml(data.name || 'the submitter')}.</p>
  </div>
</body>
</html>
  `.trim()
}
