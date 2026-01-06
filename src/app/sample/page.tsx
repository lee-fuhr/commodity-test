import Link from 'next/link'
import { Footer } from '@/components/Footer'

// Industry colors (matches admin dashboard)
const INDUSTRY_COLORS: Record<string, string> = {
  manufacturing: '#3b82f6',
  saas: '#8b5cf6',
  services: '#10b981',
  construction: '#f59e0b',
  distribution: '#06b6d4',
  healthcare: '#ec4899',
  finance: '#6366f1',
  retail: '#f97316',
  general: '#6b7280',
}

// Sample data using Caterpillar as a recognizable example
// Note: These are illustrative phrases typical of the industry, demonstrating what the tool finds
const sampleResult = {
  companyName: 'Caterpillar Inc.',
  url: 'caterpillar.com',
  industry: 'manufacturing' as const,
  differentiationScore: 29, // 100 = fully differentiated, 0 = pure commodity
  costEstimate: 180000,
  costAssumptions: {
    averageDealValue: 50000,
    annualDeals: 20,
    lossRate: 0.18,
    lossRateLabel: 'improvement potential at score 29',
  },
  diagnosis: 'Even industry giants have room to differentiate. Your homepage relies on phrases that appear on thousands of competitor sites. Here are 5 specific fixes.',
  fixes: [
    {
      number: 1,
      originalPhrase: 'World-class products and services',
      location: 'Homepage hero',
      sourceUrl: 'https://www.caterpillar.com#:~:text=world-class%20products%20and%20services',
      context: 'Caterpillar offers world-class products and services that help our customers build a better world.',
      whyBad: '"World-class" appears on thousands of B2B websites. Without defining what makes it world-class, it\'s invisible to buyers comparing options.',
      suggestions: [
        { text: '2.7 million machines operating worldwide right now. Here\'s what that scale means for parts availability.', approach: 'quantify it' },
        { text: 'Average uptime: 94.3% across our fleet. Check the live dashboard.', approach: 'publish the metrics' },
        { text: 'If your Cat equipment is down for more than 24 hours, we credit your rental.', approach: 'make a guarantee' },
      ],
      whyBetter: 'Scale, metrics, and guarantees prove world-class. Claiming it proves nothing.',
    },
    {
      number: 2,
      originalPhrase: 'Trusted partner',
      location: 'About section',
      sourceUrl: 'https://www.caterpillar.com/en/company.html#:~:text=trusted%20partner',
      context: 'For nearly 100 years, Caterpillar has been the trusted partner of choice for customers around the world.',
      whyBad: '"Trusted partner" is on 70%+ of industrial websites. 100 years is specific—but "trusted partner" wastes that credibility.',
      suggestions: [
        { text: '89% of our dealers have been with us for 20+ years. Here are their stories.', approach: 'tell their story' },
        { text: 'Fortune\'s Most Admired Company in our industry for 18 consecutive years.', approach: 'cite the evidence' },
        { text: 'When a mine in Chile needed emergency parts, we had them there in 11 hours. Here\'s how.', approach: 'describe the experience' },
      ],
      whyBetter: 'Dealer retention, awards, and stories demonstrate trust. The phrase "trusted" doesn\'t.',
    },
    {
      number: 3,
      originalPhrase: 'Innovative solutions',
      location: 'Technology page',
      sourceUrl: 'https://www.caterpillar.com/en/company/innovation.html#:~:text=innovative%20solutions',
      context: 'We develop innovative solutions that make our customers more successful.',
      whyBad: 'Everyone claims innovation. Caterpillar actually HAS innovations—autonomous mining, Cat Connect—but this phrase hides them.',
      suggestions: [
        { text: 'Our autonomous haul trucks have moved 3.3 billion tonnes without a single lost-time injury.', approach: 'name the innovation' },
        { text: 'Cat Connect has saved customers $7.2B in fuel and maintenance since 2015.', approach: 'quantify the impact' },
        { text: 'The only equipment maker running fully autonomous mining operations. Here\'s how it works.', approach: 'claim the niche' },
      ],
      whyBetter: 'Caterpillar has genuinely differentiating innovations. This sentence buries them under generic language.',
    },
    {
      number: 4,
      originalPhrase: 'Dedicated to sustainability',
      location: 'Sustainability page',
      sourceUrl: 'https://www.caterpillar.com/en/company/sustainability.html#:~:text=dedicated%20to%20sustainability',
      context: 'Caterpillar is dedicated to sustainability and helping our customers reduce their environmental impact.',
      whyBad: '"Dedicated to sustainability" is now table stakes—every Fortune 500 says it. What makes Cat\'s approach different?',
      suggestions: [
        { text: '33% reduction in greenhouse gas intensity since 2018. Here\'s the breakdown by product line.', approach: 'quantify it' },
        { text: 'Our remanufacturing program has kept 222 million pounds of material out of landfills.', approach: 'add numbers' },
        { text: 'The first heavy equipment maker to offer battery-electric underground loaders. Shipping now.', approach: 'claim the niche' },
      ],
      whyBetter: 'Specific numbers and firsts prove sustainability commitment. "Dedicated" is just a word.',
    },
    {
      number: 5,
      originalPhrase: 'Comprehensive range',
      location: 'Products page',
      sourceUrl: 'https://www.caterpillar.com/en/products.html#:~:text=comprehensive%20range',
      context: 'We offer a comprehensive range of equipment, engines, and services.',
      whyBad: '"Comprehensive range" is filler. It says "we have lots of stuff" without explaining what that means for the buyer.',
      suggestions: [
        { text: '300+ machine models. One dealer network. Parts for any of them, anywhere, in 24 hours.', approach: 'say what you do' },
        { text: 'From a 1-ton excavator to a 400-ton mining truck—same parts availability, same service network.', approach: 'describe the experience' },
        { text: 'The only manufacturer covering construction, mining, energy, and marine. All under one support network.', approach: 'find your only' },
      ],
      whyBetter: 'Breadth is a feature. How that breadth helps the customer is the benefit. Show the benefit.',
    },
  ],
}

// Differentiation score: 100 = highly differentiated, 0 = pure commodity
function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Highly differentiated', color: 'text-green-400' }
  if (score >= 60) return { label: 'Differentiated', color: 'text-lime-400' }
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400' }
  if (score >= 20) return { label: 'Commodity risk', color: 'text-orange-400' }
  return { label: 'Undifferentiated', color: 'text-red-400' }
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

// Approach badge colors - high contrast for readability
function getApproachStyle(approach: string): string {
  const styles: Record<string, string> = {
    'quantify it': 'bg-blue-600 text-white border-blue-700',
    'show the process': 'bg-purple-600 text-white border-purple-700',
    'make a guarantee': 'bg-green-600 text-white border-green-700',
    'tell their story': 'bg-amber-600 text-white border-amber-700',
    'publish the metrics': 'bg-cyan-700 text-white border-cyan-800',
    'stake something on it': 'bg-red-600 text-white border-red-700',
    'name the innovation': 'bg-fuchsia-600 text-white border-fuchsia-700',
    'describe the experience': 'bg-orange-600 text-white border-orange-700',
    'claim the niche': 'bg-emerald-600 text-white border-emerald-700',
    'prove retention': 'bg-indigo-600 text-white border-indigo-700',
    'add numbers': 'bg-sky-600 text-white border-sky-700',
    'say what you do': 'bg-lime-700 text-white border-lime-800',
    'find your only': 'bg-rose-600 text-white border-rose-700',
    'cite the evidence': 'bg-teal-600 text-white border-teal-700',
    'quantify the impact': 'bg-violet-600 text-white border-violet-700',
  }
  return styles[approach] || 'bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]'
}

export default function SamplePage() {
  const scoreInfo = getScoreLabel(sampleResult.differentiationScore)

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Sample banner */}
      <div className="bg-yellow-500 py-3 px-6">
        <div className="max-w-4xl mx-auto text-center text-yellow-950">
          <span className="font-semibold uppercase tracking-wider text-sm">Sample report</span>
          <span className="block text-xs mt-1 opacity-80">Illustrative analysis showing how the tool identifies commodity messaging patterns</span>
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
          <p className="text-label mb-2">Results for</p>
          <h1 className="text-section text-3xl md:text-4xl text-[var(--foreground)] mb-2">
            {sampleResult.companyName}
          </h1>
          <div className="flex items-center justify-center gap-3">
            <a
              href={`https://${sampleResult.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-body text-sm text-[var(--accent)] hover:underline"
            >
              {sampleResult.url} →
            </a>
            <span
              className="text-xs px-2 py-0.5 rounded capitalize"
              style={{
                backgroundColor: `${INDUSTRY_COLORS[sampleResult.industry]}20`,
                color: INDUSTRY_COLORS[sampleResult.industry]
              }}
            >
              {sampleResult.industry}
            </span>
          </div>
        </div>
      </section>

      {/* Score section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Big score */}
          <div className="mb-8">
            <p className="text-label mb-4">Differentiation score</p>
            <p className={`text-[8rem] md:text-[12rem] font-display leading-none ${scoreInfo.color}`}>
              {sampleResult.differentiationScore}
            </p>
            <p className={`text-section text-2xl ${scoreInfo.color}`}>{scoreInfo.label}</p>
            <p className="text-body text-sm text-[var(--muted-foreground)] mt-2">100 = highly differentiated · 0 = pure commodity</p>
          </div>

          {/* Context */}
          <div className="flex justify-center gap-8 mb-8 text-sm">
            <div className="text-center">
              <p className="text-body">Industry avg</p>
              <p className="text-[var(--foreground)] font-semibold text-xl">36</p>
            </div>
            <div className="w-px bg-[var(--border)]" />
            <div className="text-center">
              <p className="text-body">This sample</p>
              <p className="text-[var(--foreground)] font-semibold text-xl">{sampleResult.differentiationScore}</p>
            </div>
            <div className="w-px bg-[var(--border)]" />
            <div className="text-center">
              <p className="text-body">Target</p>
              <p className="text-green-400 font-semibold text-xl">70+</p>
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
            <h2 className="text-section text-2xl text-white mb-4">
              What this is costing you
            </h2>
            <p className="text-[5rem] md:text-[7rem] font-display text-white leading-none mb-4">
              ${sampleResult.costEstimate.toLocaleString()}
            </p>
            <p className="text-white">
              in lost deals annually (estimated)
            </p>
          </div>

          {/* Methodology breakdown */}
          <div className="bg-black/20 p-6 mt-8">
            <p className="text-label text-white/70 mb-4">How I calculated this</p>
            <div className="grid md:grid-cols-3 gap-6 text-white">
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
            <p className="text-sm text-white/60 mt-4">
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
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-label">Found on site</p>
                        {'sourceUrl' in fix && (
                          <a
                            href={fix.sourceUrl as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
                          >
                            View on live site →
                          </a>
                        )}
                      </div>
                      <div className="bg-[var(--muted)] p-4 text-lg leading-relaxed">
                        <HighlightedContext context={fix.context} phrase={fix.originalPhrase} />
                      </div>
                      <p className="text-body text-sm mt-2">Location: {fix.location}</p>
                    </div>

                    {/* Why it hurts */}
                    <div>
                      <p className="text-label mb-2">Why it hurts you</p>
                      <p className="text-body text-lg">{fix.whyBad}</p>
                    </div>

                    {/* Multiple suggestions */}
                    <div>
                      <p className="text-label mb-3">Replace the entire sentence with one of these</p>
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
      <Footer showCta tagline="27 years helping manufacturers stop sounding like everyone else" />
    </main>
  )
}
