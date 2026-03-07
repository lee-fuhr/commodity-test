import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Initialize Resend inside the handler to ensure env var is read at request time
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Email service not configured. Please contact support.' },
        { status: 500 }
      )
    }
    const resend = new Resend(resendApiKey)

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
      subject: 'The Commodity Messaging Fix Kit (as promised)',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 640px; margin: 0 auto; padding: 0; background: #f5f5f5; }
    .wrapper { background: white; }
    .header { background: linear-gradient(135deg, #0a2540 0%, #1a4070 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 30px; }
    .intro { font-size: 17px; margin-bottom: 30px; }
    .toc { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 25px; margin: 25px 0; }
    .toc h2 { margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
    .toc ul { margin: 0; padding: 0; list-style: none; }
    .toc li { padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
    .toc li:last-child { border-bottom: none; }
    .toc li a { color: #0066cc; text-decoration: none; }
    .toc li span { color: #94a3b8; margin-right: 10px; font-weight: 600; }
    .section { margin: 40px 0; }
    .section-header { background: #0a2540; color: white; padding: 12px 20px; margin: 0 -30px 20px -30px; }
    .section-header h2 { margin: 0; font-size: 18px; font-weight: 600; }
    .section-num { opacity: 0.6; margin-right: 10px; }
    h3 { font-size: 16px; color: #0a2540; margin: 25px 0 10px 0; }
    .pattern { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 15px; margin: 12px 0; }
    .pattern strong { color: #991b1b; }
    .framework { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 15px 0; }
    .framework-name { font-weight: 700; color: #166534; margin-bottom: 8px; }
    .before-after { display: table; width: 100%; margin: 15px 0; }
    .before, .after { display: table-cell; width: 48%; vertical-align: top; padding: 12px; }
    .before { background: #fef2f2; }
    .after { background: #f0fdf4; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: 600; }
    .before .label { color: #991b1b; }
    .after .label { color: #166534; }
    .case-study { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .case-study-header { font-weight: 700; color: #92400e; margin-bottom: 10px; }
    .worksheet { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .worksheet h3 { margin-top: 0; }
    .worksheet ol { margin: 0; padding-left: 20px; }
    .worksheet li { margin: 10px 0; }
    .checkbox { display: inline-block; width: 18px; height: 18px; border: 2px solid #94a3b8; border-radius: 3px; margin-right: 8px; vertical-align: middle; }
    .mistake { background: #fef2f2; border-radius: 6px; padding: 15px; margin: 12px 0; }
    .mistake-title { font-weight: 700; color: #991b1b; margin-bottom: 5px; }
    .cta { background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; padding: 25px; text-align: center; margin: 30px -30px; }
    .cta p { margin: 0 0 15px 0; font-size: 17px; }
    .cta a { display: inline-block; background: white; color: #0066cc; padding: 12px 30px; text-decoration: none; font-weight: 700; border-radius: 6px; }
    .footer { padding: 25px 30px; background: #f8fafc; font-size: 14px; color: #64748b; }
    .footer a { color: #64748b; }
    .sig { margin-bottom: 20px; }
    .sig strong { color: #1a1a1a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="https://areyougeneric.com/lee-avatar.png" alt="Lee Fuhr" width="80" height="80" style="border-radius: 50%; margin-bottom: 15px; border: 3px solid rgba(255,255,255,0.3);" />
      <h1>The Commodity Messaging Fix Kit</h1>
      <p>Your complete DIY guide to differentiated copy</p>
    </div>

    <div class="content">
      <p class="intro">${firstName ? `${firstName}, here` : 'Here'}'s everything you need to audit your homepage and fix the generic language that's costing you deals. Bookmark this email—you'll want to come back to it.</p>

      <div class="toc">
        <h2>What's inside</h2>
        <ul>
          <li><span>01</span> <a href="#patterns">The 12 commodity patterns killing your differentiation</a></li>
          <li><span>02</span> <a href="#worksheet">Self-audit worksheet for your homepage</a></li>
          <li><span>03</span> <a href="#frameworks">5 rewrite frameworks with examples</a></li>
          <li><span>04</span> <a href="#casestudies">Before/after case studies from real manufacturers</a></li>
          <li><span>05</span> <a href="#mistakes">Common mistakes when trying to fix generic messaging</a></li>
        </ul>
      </div>

      <!-- SECTION 1: THE 12 PATTERNS -->
      <div class="section" id="patterns">
        <div class="section-header">
          <h2><span class="section-num">01</span> The 12 Commodity Patterns</h2>
        </div>

        <p>These are the phrases that make buyers lump you in with everyone else. If you see these on your site, you've got work to do.</p>

        <div class="pattern">
          <strong>1. Vague quality claims</strong><br>
          "Quality products" • "High quality" • "Premium quality" • "Quality you can trust"
        </div>

        <div class="pattern">
          <strong>2. Generic partnership language</strong><br>
          "Your trusted partner" • "Partner for success" • "We partner with you"
        </div>

        <div class="pattern">
          <strong>3. Unearned leadership claims</strong><br>
          "Industry leader" • "Leading provider" • "Best in class"
        </div>

        <div class="pattern">
          <strong>4. Empty innovation buzzwords</strong><br>
          "Innovative solutions" • "Cutting-edge" • "State-of-the-art"
        </div>

        <div class="pattern">
          <strong>5. Solutions jargon</strong><br>
          "Comprehensive solutions" • "End-to-end solutions" • "Turnkey solutions"
        </div>

        <div class="pattern">
          <strong>6. Generic service claims</strong><br>
          "Exceptional service" • "Dedicated team" • "Customer-focused"
        </div>

        <div class="pattern">
          <strong>7. Vague experience claims</strong><br>
          "Years of experience" • "Decades of expertise" • "Experienced team"
        </div>

        <div class="pattern">
          <strong>8. Generic commitment language</strong><br>
          "Committed to excellence" • "Dedicated to your success" • "We care about..."
        </div>

        <div class="pattern">
          <strong>9. Scope inflation</strong><br>
          "Serving all industries" • "For businesses of all sizes" • "Full-service provider"
        </div>

        <div class="pattern">
          <strong>10. Empty differentiators</strong><br>
          "What sets us apart" (followed by generic claims) • "The [Company] difference"
        </div>

        <div class="pattern">
          <strong>11. Weak value propositions</strong><br>
          "We help you succeed" • "Taking your business to the next level" • "Unlocking your potential"
        </div>

        <div class="pattern">
          <strong>12. Trust without proof</strong><br>
          "Trusted by thousands" (no names) • "Industry-recognized" (no specifics) • "Award-winning" (no awards listed)
        </div>
      </div>

      <!-- SECTION 2: SELF-AUDIT WORKSHEET -->
      <div class="section" id="worksheet">
        <div class="section-header">
          <h2><span class="section-num">02</span> Self-Audit Worksheet</h2>
        </div>

        <p>Print your homepage. Grab a highlighter. Work through this checklist.</p>

        <div class="worksheet">
          <h3>The 10-Minute Homepage Audit</h3>
          <ol>
            <li><span class="checkbox"></span> <strong>Headline test:</strong> Could your #1 competitor use your headline? If yes, highlight it.</li>
            <li><span class="checkbox"></span> <strong>Proof scan:</strong> Circle every claim. Draw a line to its proof. No proof? Highlight it.</li>
            <li><span class="checkbox"></span> <strong>Number hunt:</strong> Count specific numbers on your homepage. Fewer than 5? You're too vague.</li>
            <li><span class="checkbox"></span> <strong>Customer voice:</strong> Is there a real customer quote with a name and company? No? Highlight the testimonial section.</li>
            <li><span class="checkbox"></span> <strong>Process visibility:</strong> Can visitors see HOW you do what you do? If it's hidden, highlight your services section.</li>
            <li><span class="checkbox"></span> <strong>Specificity check:</strong> Replace every adjective with "really good." Does it change the meaning? If not, highlight it.</li>
          </ol>
        </div>

        <p><strong>Scoring:</strong> Count your highlights. 0-2 = You're ahead of 90% of manufacturers. 3-5 = Typical, fixable in an afternoon. 6+ = Your messaging is costing you deals.</p>
      </div>

      <!-- SECTION 3: 5 REWRITE FRAMEWORKS -->
      <div class="section" id="frameworks">
        <div class="section-header">
          <h2><span class="section-num">03</span> 5 Rewrite Frameworks</h2>
        </div>

        <p>When you find commodity language, use one of these frameworks to fix it.</p>

        <div class="framework">
          <div class="framework-name">Framework 1: Quantify It</div>
          <p>Replace vague claims with specific numbers. Every number is proof.</p>
          <div class="before-after">
            <div class="before">
              <div class="label">Before</div>
              "Years of experience delivering quality"
            </div>
            <div class="after">
              <div class="label">After</div>
              "27 years. 14,000+ parts shipped. 0.02% defect rate."
            </div>
          </div>
        </div>

        <div class="framework">
          <div class="framework-name">Framework 2: Show the Process</div>
          <p>Replace "trust us" with "here's how we do it." Process creates confidence.</p>
          <div class="before-after">
            <div class="before">
              <div class="label">Before</div>
              "Quality you can trust"
            </div>
            <div class="after">
              <div class="label">After</div>
              "Every part gets CMM-inspected. We send the report with your shipment."
            </div>
          </div>
        </div>

        <div class="framework">
          <div class="framework-name">Framework 3: Cite the Evidence</div>
          <p>Replace generic testimonials with named sources and specific stories.</p>
          <div class="before-after">
            <div class="before">
              <div class="label">Before</div>
              "Exceptional customer service"
            </div>
            <div class="after">
              <div class="label">After</div>
              "Johnson Mfg: 'They answered at 7pm Saturday when our line went down.'"
            </div>
          </div>
        </div>

        <div class="framework">
          <div class="framework-name">Framework 4: Claim the Niche</div>
          <p>Replace "we do everything" with "we're the only ones who do THIS."</p>
          <div class="before-after">
            <div class="before">
              <div class="label">Before</div>
              "Custom metal fabrication for all industries"
            </div>
            <div class="after">
              <div class="label">After</div>
              "The only fabricator in Ohio certified for medical device housings"
            </div>
          </div>
        </div>

        <div class="framework">
          <div class="framework-name">Framework 5: Name the Villain</div>
          <p>Replace vague benefits with the specific problem you solve.</p>
          <div class="before-after">
            <div class="before">
              <div class="label">Before</div>
              "Reliable delivery you can count on"
            </div>
            <div class="after">
              <div class="label">After</div>
              "No more 3am calls because your supplier missed the deadline. 99.7% on-time, tracked to the hour."
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 4: CASE STUDIES -->
      <div class="section" id="casestudies">
        <div class="section-header">
          <h2><span class="section-num">04</span> Before/After Case Studies</h2>
        </div>

        <div class="case-study">
          <div class="case-study-header">Industrial Components Manufacturer</div>
          <p><strong>Before:</strong> "Your trusted partner for quality industrial components. With decades of experience, we deliver innovative solutions for businesses of all sizes."</p>
          <p><strong>After:</strong> "Precision-machined components for oil & gas. 43 years in the Permian Basin. Zero field failures since 2019."</p>
          <p><strong>Result:</strong> Homepage bounce rate dropped 23%. RFQ form submissions up 40%.</p>
        </div>

        <div class="case-study">
          <div class="case-study-header">Custom Packaging Company</div>
          <p><strong>Before:</strong> "Leading provider of comprehensive packaging solutions. Our dedicated team is committed to excellence."</p>
          <p><strong>After:</strong> "Food-safe packaging for craft breweries. We designed the 4-pack carrier for [Regional Brewery]. Now shipping 2M+ units/year."</p>
          <p><strong>Result:</strong> Started winning deals against larger competitors. Average deal size increased 60%.</p>
        </div>

        <div class="case-study">
          <div class="case-study-header">Contract Manufacturer</div>
          <p><strong>Before:</strong> "Full-service contract manufacturing with state-of-the-art equipment and experienced team members."</p>
          <p><strong>After:</strong> "Low-volume, high-mix manufacturing for medical devices. ISO 13485 certified. 8 inspection points per assembly. Your engineer gets the same project manager for the life of your product."</p>
          <p><strong>Result:</strong> Shortened sales cycle from 6 months to 6 weeks. Higher-margin projects started finding them.</p>
        </div>
      </div>

      <!-- SECTION 5: COMMON MISTAKES -->
      <div class="section" id="mistakes">
        <div class="section-header">
          <h2><span class="section-num">05</span> Common Mistakes to Avoid</h2>
        </div>

        <div class="mistake">
          <div class="mistake-title">Mistake 1: Replacing commodity with commodity</div>
          <p>"Quality products" → "Superior products" isn't a fix. You need specificity, not synonyms.</p>
        </div>

        <div class="mistake">
          <div class="mistake-title">Mistake 2: Going too niche too fast</div>
          <p>If 80% of your revenue comes from diverse customers, don't suddenly claim you "only serve aerospace." Start with your strongest proof points, not your narrowest niche.</p>
        </div>

        <div class="mistake">
          <div class="mistake-title">Mistake 3: Fixing copy without fixing proof</div>
          <p>You can't claim "99.7% on-time delivery" if you don't track it. Sometimes the copy fix reveals an operations fix you need to make first.</p>
        </div>

        <div class="mistake">
          <div class="mistake-title">Mistake 4: Waiting for perfect</div>
          <p>"27 years in business" beats "decades of experience" even if 27 isn't as impressive as 40. Use the numbers you have.</p>
        </div>

        <div class="mistake">
          <div class="mistake-title">Mistake 5: Fixing everything at once</div>
          <p>Fix your headline and hero section first. That's what 80% of visitors see. Get that right before touching the rest.</p>
        </div>
      </div>

      <div class="cta">
        <p>Want to see exactly where YOUR site has commodity language?</p>
        <a href="https://areyougeneric.com/?utm_source=guide&utm_medium=email">Run the free Commodity Test →</a>
      </div>

      <div class="cta" style="background: linear-gradient(135deg, #0a2540 0%, #1a4070 100%); margin-top: 0;">
        <p>Or skip the DIY and let me fix it for you.</p>
        <a href="https://leefuhr.com/contact?utm_source=guide&utm_medium=email">Talk to Lee →</a>
      </div>
    </div>

    <div class="footer">
      <div class="sig" style="display: flex; align-items: center; gap: 15px;">
        <img src="https://areyougeneric.com/lee-avatar.png" alt="Lee Fuhr" width="50" height="50" style="border-radius: 50%;" />
        <div>
          <strong>Lee Fuhr</strong><br>
          I help manufacturers stop sounding like everyone else.<br>
          <a href="https://leefuhr.com">leefuhr.com</a>
        </div>
      </div>
      <p style="font-size: 12px; color: #94a3b8;">
        You're receiving this because you requested the guide at areyougeneric.com.<br>
        <a href="{{unsubscribe_url}}" style="color: #94a3b8;">Unsubscribe</a>
      </p>
    </div>
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

    // Schedule nurture follow-up emails
    try {
      const signupAt = new Date().toISOString()
      const now = Date.now()
      const MS_PER_DAY = 24 * 60 * 60 * 1000
      await kv.zadd('nurture:queue',
        { score: now + (3 * MS_PER_DAY),  member: { email, firstName: firstName || null, step: 2, signupAt } },
        { score: now + (10 * MS_PER_DAY), member: { email, firstName: firstName || null, step: 3, signupAt } },
        { score: now + (21 * MS_PER_DAY), member: { email, firstName: firstName || null, step: 4, signupAt } }
      )
    } catch (nurtureErr) {
      // Don't fail the request — guide was already delivered
      console.error('Failed to schedule nurture emails:', nurtureErr)
    }

    // Notify Lee about the new lead
    try {
      await resend.emails.send({
        from: 'Commodity Test <hi@mail.leefuhr.com>',
        to: ['hi@leefuhr.com'],
        subject: `New lead: ${firstName ? firstName + ' (' + email + ')' : email} downloaded the guide`,
        html: `<p>New guide download from <strong>${firstName || '(no name)'}</strong> — ${email}</p>
<p>Signed up: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST</p>
<p>3-email nurture sequence scheduled (days 3, 10, 21).</p>
<p style="font-size:12px;color:#888;">View all leads: <a href="https://thecommoditytest.com/admin">thecommoditytest.com/admin</a></p>`,
      })
    } catch (notifyErr) {
      // Non-critical — lead stored, guide sent, nurture scheduled
      console.error('Failed to notify Lee:', notifyErr)
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
