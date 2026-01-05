import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { kv } from '@vercel/kv'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!resend) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Email service not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Store the lead for future marketing campaigns
    try {
      await kv.lpush('guide:emails', {
        email,
        firstName: firstName || null,
        timestamp: new Date().toISOString(),
        source: 'commodity-test-guide'
      })
    } catch (kvError) {
      // Don't fail the request if KV storage fails - still send the email
      console.error('Failed to store guide email in KV:', kvError)
    }

    // Send the guide via Resend
    const { data, error } = await resend.emails.send({
      from: 'Lee Fuhr <hi@mail.leefuhr.com>',
      to: [email],
      subject: 'Your DIY guide to fixing commodity messaging',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { font-size: 28px; margin-bottom: 10px; }
    h2 { font-size: 22px; margin-top: 30px; margin-bottom: 10px; border-bottom: 2px solid #0066cc; padding-bottom: 5px; }
    h3 { font-size: 18px; margin-top: 20px; margin-bottom: 5px; color: #0066cc; }
    p { margin: 10px 0; }
    strong { color: #000; }
    .header { background: #0066cc; color: white; padding: 20px; margin: -20px -20px 30px -20px; }
    .header h1 { color: white; margin: 0; }
    .fix { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #0066cc; }
    .cta { background: #0066cc; color: white; padding: 15px 30px; text-align: center; margin: 30px 0; }
    .cta a { color: white; text-decoration: none; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>The commodity messaging diagnostic</h1>
    <p style="margin: 10px 0 0 0;">Your DIY guide from Lee Fuhr</p>
  </div>

  <p>${firstName ? `Hi ${firstName},` : 'Hi,'}

  <p>You know your product is better. Your customers tell you that. But when prospects read your website, they lump you in with every other option and pick whoever's cheapest.</p>

  <p>That's commodity messaging - and it's killing your margins.</p>

  <p>Here's how to spot it and fix it. Takes 30 minutes.</p>

  <h2>The two-question test</h2>

  <p>Run every piece of copy on your homepage through these two filters:</p>

  <p><strong>Question 1: Could a competitor say this exact same thing?</strong><br>
  If yes → commodity phrase. Delete it or replace it.</p>

  <p><strong>Question 2: Does this give the buyer specific proof or a specific reason to choose you?</strong><br>
  If no → commodity phrase. Replace it with proof.</p>

  <p>That's it. Those two questions will surface 90% of the commodity language hiding in your messaging.</p>

  <h2>The 10 most effective fixes</h2>

  <div class="fix">
    <h3>Fix 1: Add numbers (easiest)</h3>
    <p><strong>Before:</strong> "Years of experience delivering quality"<br>
    <strong>After:</strong> "27 years. 14,000+ parts shipped. 0.02% defect rate."</p>
    <p><strong>When to use:</strong> Any time you see "quality," "experienced," "leading," or other unmeasurable adjectives</p>
  </div>

  <div class="fix">
    <h3>Fix 2: Quote a customer (high impact)</h3>
    <p><strong>Before:</strong> "Our team provides exceptional service"<br>
    <strong>After:</strong> "Johnson Manufacturing: 'They answered at 7pm on a Saturday when our line went down. Parts arrived Monday morning.'"</p>
    <p><strong>When to use:</strong> When you're claiming something about your service, reliability, or relationship</p>
  </div>

  <div class="fix">
    <h3>Fix 3: Name what you're NOT (differentiating)</h3>
    <p><strong>Before:</strong> "Full-service CNC machining"<br>
    <strong>After:</strong> "Not a job shop. We only machine aerospace-grade titanium."</p>
    <p><strong>When to use:</strong> When buyers are confusing you with a different type of provider</p>
  </div>

  <div class="fix">
    <h3>Fix 4: Show the process (builds trust)</h3>
    <p><strong>Before:</strong> "Quality you can trust"<br>
    <strong>After:</strong> "Every part gets CMM-inspected before it leaves. Here's the report we send with each shipment."</p>
    <p><strong>When to use:</strong> When you do something competitors skip or when your process creates the outcome buyers want</p>
  </div>

  <div class="fix">
    <h3>Fix 5: Claim your niche (strategic)</h3>
    <p><strong>Before:</strong> "Custom metal fabrication for all industries"<br>
    <strong>After:</strong> "The only fabricator in Ohio certified for medical device housings"</p>
    <p><strong>When to use:</strong> When you have a certification, capability, or specialization that's rare</p>
  </div>

  <p><em>5 more fixes (guarantee, story, metric, innovation, experience) in the full guide below...</em></p>

  <div class="cta">
    <p style="margin: 0;"><a href="https://commodity.leefuhr.com/?utm_source=guide">Run The Commodity Test on your site (30 seconds, free)</a></p>
  </div>

  <h2>How to apply this</h2>

  <ol>
    <li><strong>Print your homepage</strong> (yes, actually print it)</li>
    <li><strong>Highlight every phrase</strong> that fails the two-question test</li>
    <li><strong>Pick ONE tactic</strong> from above for each highlight</li>
    <li><strong>Rewrite</strong> the phrase using that tactic</li>
    <li><strong>Publish</strong> the changes</li>
  </ol>

  <p>If you fix the top 5 commodity phrases on your homepage, you'll see a measurable difference in how prospects respond.</p>

  <h2>Time estimate</h2>
  <ul>
    <li><strong>Audit:</strong> 30 minutes (print page, highlight phrases, categorize)</li>
    <li><strong>Rewrites:</strong> 1-2 hours (depends on how many phrases you found)</li>
    <li><strong>Total:</strong> 2-3 hours to transform your homepage</li>
  </ul>

  <div class="cta">
    <p style="margin: 0;"><a href="https://commodity.leefuhr.com/pricing">Or let me do it for you - from $18K</a></p>
  </div>

  <div class="footer">
    <p><strong>Lee Fuhr</strong><br>
    I help manufacturers stop sounding like everyone else<br>
    <a href="https://leefuhr.com">leefuhr.com</a></p>

    <p style="font-size: 12px; color: #999; margin-top: 20px;">
    You're receiving this because you requested the DIY guide at thecommoditytest.com.
    <br><a href="{{unsubscribe_url}}" style="color: #999;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Resend error details:', {
        name: error.name,
        message: error.message,
        statusCode: (error as any).statusCode,
        full: JSON.stringify(error, null, 2)
      })
      return NextResponse.json(
        { error: `Email failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error('Guide delivery error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}
