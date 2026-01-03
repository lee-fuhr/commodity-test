import { NextRequest, NextResponse } from 'next/server'

interface SystemInfo {
  url: string
  userAgent: string
  screenSize: string
  viewport: string
  timestamp: string
  timezone: string
  language: string
  platform: string
  tool: string
}

interface FeedbackPayload {
  feedback: string
  systemInfo: SystemInfo
}

// Try to send via fallback webhook (Slack, Discord, Zapier, Make, etc.)
async function sendToFallbackWebhook(feedback: string, systemInfo: SystemInfo): Promise<boolean> {
  const webhookUrl = process.env.FEEDBACK_FALLBACK_WEBHOOK_URL
  if (!webhookUrl) return false

  try {
    // Format for Slack/Discord compatibility (both accept "text" or "content")
    const message = `🐛 *Bug Report: ${systemInfo.tool}*

*User Report:*
${feedback}

*System Info:*
• Tool: ${systemInfo.tool}
• URL: ${systemInfo.url}
• Timestamp: ${systemInfo.timestamp}
• Timezone: ${systemInfo.timezone}

*Browser/Device:*
• Platform: ${systemInfo.platform}
• Screen: ${systemInfo.screenSize}
• Viewport: ${systemInfo.viewport}
• Language: ${systemInfo.language}
• User Agent: ${systemInfo.userAgent}`

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,           // Slack format
        content: message,        // Discord format
      }),
    })

    return response.ok
  } catch {
    return false
  }
}

// Try to send via Todoist
async function sendToTodoist(feedback: string, systemInfo: SystemInfo): Promise<boolean> {
  const todoistToken = process.env.TODOIST_API_TOKEN
  if (!todoistToken) return false

  try {
    const taskContent = `🐛 Bug Report: ${systemInfo.tool}`
    const description = `**User Report:**
${feedback}

---
**System Info:**
- Tool: ${systemInfo.tool}
- URL: ${systemInfo.url}
- Timestamp: ${systemInfo.timestamp}
- Timezone: ${systemInfo.timezone}

**Browser/Device:**
- User Agent: ${systemInfo.userAgent}
- Platform: ${systemInfo.platform}
- Language: ${systemInfo.language}
- Screen: ${systemInfo.screenSize}
- Viewport: ${systemInfo.viewport}`

    const response = await fetch('https://api.todoist.com/rest/v2/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${todoistToken}`,
      },
      body: JSON.stringify({
        content: taskContent,
        description: description,
        project_id: process.env.TODOIST_FEEDBACK_PROJECT_ID || undefined,
        priority: 3,
        labels: ['bug-report', 'tool-feedback'],
      }),
    })

    return response.ok
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackPayload = await request.json()
    const { feedback, systemInfo } = body

    if (!feedback?.trim()) {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 })
    }

    // Try Todoist first, then fallback webhook
    const todoistSuccess = await sendToTodoist(feedback, systemInfo)

    if (todoistSuccess) {
      return NextResponse.json({ success: true, method: 'todoist' })
    }

    // Todoist failed or not configured - try fallback
    const webhookSuccess = await sendToFallbackWebhook(feedback, systemInfo)

    if (webhookSuccess) {
      return NextResponse.json({ success: true, method: 'webhook' })
    }

    // Both failed - be honest with the user
    // This means the deployment is misconfigured
    console.error('FEEDBACK LOST - No delivery method configured or both failed:', { feedback, systemInfo })
    return NextResponse.json(
      {
        error: 'Unable to submit feedback. Please email hi@leefuhr.com directly.',
        fallbackEmail: 'hi@leefuhr.com'
      },
      { status: 503 }
    )
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
