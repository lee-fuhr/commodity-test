import Link from 'next/link'

// Sample data for demonstration
const sampleResult = {
  companyName: 'ACME Manufacturing',
  url: 'acmemanufacturing.com',
  commodityScore: 67,
  costEstimate: 180000,
  costAssumptions: {
    averageDealValue: 50000,
    annualDeals: 20,
    lossRate: 0.18,
    lossRateLabel: 'loss rate at score 67',
  },
  diagnosis: 'Your homepage uses 8 commodity phrases that make you sound identical to competitors. This pushes buyers toward price comparison instead of value recognition.',
  fixes: [
    {
      number: 1,
      originalPhrase: 'Industry-leading quality and service',
      location: 'Headline',
      context: 'Welcome to ACME Manufacturing — Industry-leading quality and service for precision machining needs.',
      whyBad: 'Every competitor claims "quality and service." Without specifics, it means nothing. Buyers have heard this exact phrase 1000 times.',
      suggestions: [
        { text: 'Zero defects in 47,000 units shipped last year. That\'s what quality looks like.', approach: 'quantify it' },
        { text: 'Our 6-step inspection process catches what others miss. Here\'s exactly how it works.', approach: 'show the process' },
        { text: 'We guarantee ±0.001" tolerance or we remake it free. No questions.', approach: 'make a guarantee' },
      ],
      whyBetter: 'Numbers, processes, and guarantees are believable. Vague claims are ignored.',
    },
    {
      number: 2,
      originalPhrase: 'Your trusted manufacturing partner',
      location: 'Subheadline',
      context: 'ACME is your trusted manufacturing partner for over 30 years, serving clients across the Midwest.',
      whyBad: '"Trusted partner" appears on 70%+ of B2B websites. It signals nothing and wastes precious headline real estate.',
      suggestions: [
        { text: 'Caterpillar has reordered from us 47 times since 2008. Here\'s what they say.', approach: 'tell their story' },
        { text: 'We\'ve never missed a deadline in 15 years. Check our on-time delivery tracker.', approach: 'publish the metrics' },
        { text: 'When your line stops, we answer in 4 hours. Guaranteed response time.', approach: 'stake something on it' },
      ],
      whyBetter: 'Demonstrated partnership through specifics beats claimed partnership every time.',
    },
    {
      number: 3,
      originalPhrase: 'Innovative solutions for your needs',
      location: 'Hero section',
      context: 'We provide innovative solutions for your needs — from prototyping to full production runs.',
      whyBad: '"Innovative solutions" has lost all meaning through overuse. Every company claims innovation without proving it.',
      suggestions: [
        { text: 'Our patented coating process extends part life by 3x. We\'re the only ones who do this.', approach: 'name the innovation' },
        { text: 'We built a custom fixture system that cut setup time from 4 hours to 20 minutes.', approach: 'describe the experience' },
        { text: 'The only precision machining shop in the Midwest with in-house anodizing.', approach: 'claim the niche' },
      ],
      whyBetter: 'Specific innovations are memorable. Generic innovation claims are invisible.',
    },
    {
      number: 4,
      originalPhrase: 'Dedicated team of professionals',
      location: 'About section',
      context: 'Our dedicated team of professionals brings decades of combined experience to every project.',
      whyBad: 'Who doesn\'t have a "dedicated team"? This phrase adds zero information and sounds like every corporate brochure ever written.',
      suggestions: [
        { text: 'Average tenure: 12 years. Our machinists don\'t leave because the work matters.', approach: 'prove retention' },
        { text: 'Meet Jake. He\'s been running our 5-axis CNC for 18 years. Here\'s his story.', approach: 'tell their story' },
        { text: '6 of our 8 machinists are certified to aerospace standards. Here\'s what that means for your parts.', approach: 'add numbers' },
      ],
      whyBetter: 'Real people with real tenure and real credentials beat generic "team" language.',
    },
    {
      number: 5,
      originalPhrase: 'Comprehensive range of services',
      location: 'Services section',
      context: 'ACME offers a comprehensive range of services including CNC machining, assembly, and finishing.',
      whyBad: '"Comprehensive" and "range of services" are filler words. They say nothing about what makes you different or better.',
      suggestions: [
        { text: 'CNC machining, assembly, anodizing, and shipping — all under one roof, in one week.', approach: 'say what you do' },
        { text: 'From raw aluminum to packaged product in 5 days. No handoffs. No delays.', approach: 'describe the experience' },
        { text: 'The only shop in Ohio that does precision machining AND certified medical assembly.', approach: 'find your only' },
      ],
      whyBetter: 'Specificity creates interest. "Comprehensive" is the absence of a message.',
    },
  ],
}

function getScoreLabel(score: number): { label: string; color: string } {
  if (score <= 40) return { label: 'Differentiated', color: 'text-green-400' }
  if (score <= 60) return { label: 'Moderate', color: 'text-yellow-400' }
  if (score <= 80) return { label: 'Commodity', color: 'text-orange-400' }
  return { label: 'Highly commoditized', color: 'text-red-400' }
}

// Highlight the phrase within its context
function HighlightedContext({ context, phrase }: { context: string; phrase: string }) {
  const lowerContext = context.toLowerCase()
  const lowerPhrase = phrase.toLowerCase()
  const idx = lowerContext.indexOf(lowerPhrase)

  if (idx === -1) {
    return <span className="text-[var(--muted-foreground)]">{context}</span>
  }

  const before = context.slice(0, idx)
  const match = context.slice(idx, idx + phrase.length)
  const after = context.slice(idx + phrase.length)

  return (
    <span>
      <span className="text-[var(--muted-foreground)]">{before}</span>
      <span className="text-[var(--foreground)] font-semibold bg-[var(--accent)]/20 px-1">{match}</span>
      <span className="text-[var(--muted-foreground)]">{after}</span>
    </span>
  )
}

// Approach badge colors - varied based on approach type
function getApproachStyle(approach: string): string {
  const styles: Record<string, string> = {
    'quantify it': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'show the process': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'make a guarantee': 'bg-green-500/20 text-green-300 border-green-500/30',
    'tell their story': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'publish the metrics': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'stake something on it': 'bg-red-500/20 text-red-300 border-red-500/30',
    'name the innovation': 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    'describe the experience': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'claim the niche': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'prove retention': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'add numbers': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'say what you do': 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    'find your only': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  }
  return styles[approach] || 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
}

export default function SamplePage() {
  const scoreInfo = getScoreLabel(sampleResult.commodityScore)

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Sample banner */}
      <div className="bg-yellow-500 py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-yellow-950">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-semibold uppercase tracking-wider text-sm">Sample report — company data redacted</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-[var(--border)] py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-section text-lg text-[var(--foreground)]">
            The Commodity Test
          </Link>
          <Link href="/" className="btn-kinetic text-sm py-2 px-4">
            Test your site
          </Link>
        </div>
      </header>

      {/* Results header */}
      <section className="bg-[var(--muted)] py-8 px-6 border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-label mb-2">Sample results for</p>
          <h1 className="text-section text-3xl md:text-4xl text-[var(--foreground)] mb-2">
            <span className="blur-sm select-none">{sampleResult.companyName}</span>
          </h1>
          <p className="text-body text-sm blur-sm select-none">{sampleResult.url}</p>
        </div>
      </section>

      {/* Score section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Big score */}
          <div className="mb-8">
            <p className="text-label mb-4">Commodity score</p>
            <p className={`text-[8rem] md:text-[12rem] font-display leading-none ${scoreInfo.color}`}>
              {sampleResult.commodityScore}
            </p>
            <p className={`text-section text-2xl ${scoreInfo.color}`}>{scoreInfo.label}</p>
          </div>

          {/* Context */}
          <div className="flex justify-center gap-8 mb-8 text-sm">
            <div className="text-center">
              <p className="text-body">Industry avg</p>
              <p className="text-[var(--foreground)] font-semibold text-xl">64</p>
            </div>
            <div className="w-px bg-[var(--border)]" />
            <div className="text-center">
              <p className="text-body">Sample score</p>
              <p className="text-[var(--foreground)] font-semibold text-xl">{sampleResult.commodityScore}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <p className="text-body text-xl max-w-2xl mx-auto">{sampleResult.diagnosis}</p>
        </div>
      </section>

      {/* Cost section with methodology */}
      <section className="bg-[var(--accent)] py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-section text-2xl text-[var(--accent-foreground)] mb-4">
              What this is costing them
            </h2>
            <p className="text-[5rem] md:text-[7rem] font-display text-[var(--accent-foreground)] leading-none mb-4">
              ${sampleResult.costEstimate.toLocaleString()}
            </p>
            <p className="text-[var(--accent-foreground)]">
              in lost deals annually (estimated)
            </p>
          </div>

          {/* Methodology breakdown */}
          <div className="bg-black/20 p-6 mt-8">
            <p className="text-label text-[var(--accent-foreground)]/70 mb-4">How I calculated this</p>
            <div className="grid md:grid-cols-3 gap-6 text-[var(--accent-foreground)]">
              <div>
                <p className="text-3xl font-display">${sampleResult.costAssumptions.averageDealValue.toLocaleString()}</p>
                <p className="text-sm opacity-70">avg deal value (industry typical)</p>
              </div>
              <div>
                <p className="text-3xl font-display">×{sampleResult.costAssumptions.annualDeals}</p>
                <p className="text-sm opacity-70">deals per year ($2-10M company)</p>
              </div>
              <div>
                <p className="text-3xl font-display">×{Math.round(sampleResult.costAssumptions.lossRate * 100)}%</p>
                <p className="text-sm opacity-70">{sampleResult.costAssumptions.lossRateLabel}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--accent-foreground)]/60 mt-4">
              Based on analysis of messaging impact at $2M-$10M manufacturers. Your actual numbers may vary.
            </p>
          </div>
        </div>
      </section>

      {/* Fixes section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display text-4xl md:text-5xl text-[var(--foreground)] mb-4">
              5 things to fix
            </h2>
            <p className="text-body text-xl">
              These are the specific recommendations generated for this sample company.
            </p>
          </div>

          <div className="space-y-12">
            {sampleResult.fixes.map((fix) => (
              <div key={fix.number} className="border-2 border-[var(--border)] p-8">
                <div className="flex items-start gap-6">
                  <span className="text-[var(--accent)] text-4xl font-display shrink-0">
                    {String(fix.number).padStart(2, '0')}
                  </span>
                  <div className="space-y-6 flex-1">
                    {/* Original phrase with context */}
                    <div>
                      <p className="text-label mb-3">Found on their site</p>
                      <div className="bg-[var(--muted)] p-4 text-lg leading-relaxed">
                        <HighlightedContext context={fix.context} phrase={fix.originalPhrase} />
                      </div>
                      <p className="text-body text-sm mt-2">Location: {fix.location}</p>
                    </div>

                    {/* Why it hurts */}
                    <div>
                      <p className="text-label mb-2">Why it hurts them</p>
                      <p className="text-body text-lg">{fix.whyBad}</p>
                    </div>

                    {/* Multiple suggestions */}
                    <div>
                      <p className="text-label mb-3">Three ways to fix it</p>
                      <div className="space-y-3">
                        {fix.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="bg-[var(--accent)]/10 border-l-4 border-[var(--accent)] p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-[var(--foreground)] text-lg flex-1">{suggestion.text}</p>
                              <span className={`text-xs uppercase tracking-wider px-2 py-1 border shrink-0 ${getApproachStyle(suggestion.approach)}`}>
                                {suggestion.approach}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-body text-sm italic">{fix.whyBetter}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-[var(--muted)] py-16 px-6 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-display text-4xl md:text-5xl text-[var(--foreground)] mb-4">
            Ready to see yours?
          </h2>
          <p className="text-body text-xl mb-8">
            Get your Commodity Score, cost estimate, and 5 specific fixes in 30 seconds.
            No email required.
          </p>
          <Link href="/" className="btn-kinetic text-lg">
            Test your website now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-[var(--foreground)] font-semibold">Built by <a href="https://oww.leefuhr.com" className="text-[var(--accent)] hover:underline">Lee Fuhr</a></p>
            <p className="text-body text-sm">27 years helping manufacturers stop sounding like everyone else</p>
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/how-it-works" className="text-body hover:text-[var(--accent)]">How it works</Link>
            <Link href="/privacy" className="text-body hover:text-[var(--accent)]">Privacy</Link>
            <a href="mailto:hello@leefuhr.com" className="text-body hover:text-[var(--accent)]">Contact</a>
          </nav>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Run the test →
          </Link>
        </div>
      </footer>
    </main>
  )
}
