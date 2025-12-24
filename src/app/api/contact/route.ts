import { NextRequest, NextResponse } from 'next/server'

// Web3Forms - free form submission service
// Get your access key at https://web3forms.com (free, no account needed)
const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formType, tier, ...formData } = body

    if (!WEB3FORMS_KEY) {
      console.error('WEB3FORMS_KEY not configured')
      // Fallback: log to console in development
      console.log('=== CONTACT FORM SUBMISSION ===')
      console.log('Type:', formType)
      console.log('Tier:', tier)
      console.log('Data:', JSON.stringify(formData, null, 2))
      console.log('===============================')

      return NextResponse.json({
        success: true,
        message: 'Form received (email not configured)'
      })
    }

    // Send via Web3Forms
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `[Commodity Test] ${formType === 'retainer' ? 'Retainer inquiry' : tier ? `${tier} tier inquiry` : 'Quote request'}`,
        from_name: formData.name || 'Website Form',
        // Format the email nicely
        message: formatEmailBody(formType, tier, formData),
        // Include raw data for CRM import
        ...formData,
        form_type: formType,
        selected_tier: tier || 'none',
      }),
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      console.error('Web3Forms error:', result)
      return NextResponse.json(
        { success: false, error: 'Failed to send' },
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
