import Link from 'next/link'
import { Footer } from '@/components/Footer'

const examples = [
  {
    industry: 'Precision machining',
    before: {
      headline: 'Your trusted partner for quality machined parts',
      score: 78,
      issues: ['trusted partner', 'quality', 'generic industry reference'],
    },
    after: {
      headline: '±0.0001" tolerance on every part. Verified by CMM before it ships.',
      score: 23,
      improvements: ['Specific tolerance claim', 'Quality verification process', 'Differentiating capability'],
    },
  },
  {
    industry: 'Industrial packaging',
    before: {
      headline: 'Innovative packaging solutions for your business needs',
      score: 82,
      issues: ['innovative', 'solutions', 'business needs', 'no specificity'],
    },
    after: {
      headline: 'Cut shipping damage 60% with our 3-layer corrugated system',
      score: 31,
      improvements: ['Quantified benefit', 'Specific product feature', 'Clear value proposition'],
    },
  },
  {
    industry: 'Custom fabrication',
    before: {
      headline: 'Industry-leading metal fabrication with exceptional service',
      score: 85,
      issues: ['industry-leading', 'exceptional service', 'no proof points'],
    },
    after: {
      headline: '48-hour turnaround on custom steel work. 97% on-time delivery since 2018.',
      score: 19,
      improvements: ['Specific turnaround time', 'Track record with dates', 'Verifiable claim'],
    },
  },
  {
    industry: 'Food processing equipment',
    before: {
      headline: 'Comprehensive food processing solutions from a trusted leader',
      score: 89,
      issues: ['comprehensive', 'solutions', 'trusted leader', 'no differentiation'],
    },
    after: {
      headline: 'The only conveyors rated for -40°F frozen food lines. Ask Tyson.',
      score: 15,
      improvements: ['Unique capability', 'Specific use case', 'Social proof reference'],
    },
  },
]

function ScoreBadge({ score, type }: { score: number; type: 'before' | 'after' }) {
  const colorClass = type === 'before'
    ? 'bg-[var(--error)] text-white'
    : 'bg-[var(--success)] text-white'

  return (
    <span className={`${colorClass} px-3 py-1 rounded-full text-sm font-semibold`}>
      Score: {score}
    </span>
  )
}

export default function ExamplesPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-[var(--background)] border-b border-[var(--border-light)] py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-[var(--foreground)] font-semibold">
            The Commodity Test
          </Link>
          <Link href="/" className="btn-accent text-sm py-2 px-4">
            Test your site
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-h1 md:text-hero font-bold text-[var(--foreground)] mb-4">
            Before & after: Real manufacturer rewrites
          </h1>
          <p className="text-body-lg text-[var(--muted-foreground)]">
            See how specific changes dropped Commodity Scores from 80+ to under 30.
            These are real examples (anonymized) from manufacturers like you.
          </p>
        </div>
      </section>

      {/* Examples */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {examples.map((example, i) => (
            <div key={i} className="bg-[var(--background)] rounded-xl border border-[var(--border-light)] overflow-hidden">
              {/* Industry header */}
              <div className="bg-[var(--muted)] px-6 py-4 border-b border-[var(--border-light)]">
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {example.industry}
                </h2>
              </div>

              <div className="grid md:grid-cols-2">
                {/* Before */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--border-light)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Before</h3>
                    <ScoreBadge score={example.before.score} type="before" />
                  </div>

                  <blockquote className="text-xl font-medium text-[var(--foreground)] mb-6 border-l-4 border-[var(--error)] pl-4">
                    &ldquo;{example.before.headline}&rdquo;
                  </blockquote>

                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Issues detected:</p>
                    <ul className="space-y-2">
                      {example.before.issues.map((issue, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                          <svg className="w-4 h-4 text-[var(--error)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* After */}
                <div className="p-6 bg-[var(--success)]/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">After</h3>
                    <ScoreBadge score={example.after.score} type="after" />
                  </div>

                  <blockquote className="text-xl font-medium text-[var(--foreground)] mb-6 border-l-4 border-[var(--success)] pl-4">
                    &ldquo;{example.after.headline}&rdquo;
                  </blockquote>

                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-2">What improved:</p>
                    <ul className="space-y-2">
                      {example.after.improvements.map((improvement, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                          <svg className="w-4 h-4 text-[var(--success)] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pattern summary */}
      <section className="py-16 px-6 bg-[var(--muted)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-h1 font-bold text-[var(--foreground)] text-center mb-8">
            The pattern is clear
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[var(--background)] rounded-lg p-6 border border-[var(--border-light)]">
              <h3 className="text-lg font-semibold text-[var(--error)] mb-4">
                Commodity messaging
              </h3>
              <ul className="space-y-2 text-[var(--muted-foreground)]">
                <li>• Vague quality claims</li>
                <li>• Unproven leadership status</li>
                <li>• Generic partnership language</li>
                <li>• Empty innovation buzzwords</li>
                <li>• No specifics, no proof</li>
              </ul>
            </div>

            <div className="bg-[var(--background)] rounded-lg p-6 border border-[var(--border-light)]">
              <h3 className="text-lg font-semibold text-[var(--success)] mb-4">
                Differentiated messaging
              </h3>
              <ul className="space-y-2 text-[var(--muted-foreground)]">
                <li>• Specific numbers and tolerances</li>
                <li>• Verifiable track records</li>
                <li>• Named clients or references</li>
                <li>• Unique capabilities</li>
                <li>• Clear, concrete benefits</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-h1 font-bold text-[var(--foreground)] mb-4">
            What&apos;s your score?
          </h2>
          <p className="text-body-lg text-[var(--muted-foreground)] mb-8">
            30 seconds. No email. See exactly where your messaging falls on the commodity spectrum.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary">
              Run the test
            </Link>
            <Link href="/guide" className="btn-secondary">
              Get the DIY guide
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer showCta tagline="27 years helping B2B companies win on value, not price" />
    </main>
  )
}
