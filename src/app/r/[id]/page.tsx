import Link from 'next/link'
import { kv } from '@vercel/kv'
import { ShareButtons } from './ShareButtons'

interface CostAssumptions {
  averageDealValue: number
  annualDeals: number
  lossRate: number
  lossRateLabel: string
}

interface AnalysisResult {
  id: string
  url: string
  companyName: string
  headline: string
  commodityScore: number
  costEstimate: number
  costAssumptions: CostAssumptions
  diagnosis: string
  detectedPhrases: Array<{
    phrase: string
    category: string
    location: string
    context: string
  }>
  fixes: Array<{
    number: number
    originalPhrase: string
    location: string
    context: string
    whyBad: string
    suggestions: Array<{
      text: string
      approach: string
    }>
    whyBetter: string
  }>
  createdAt: string
}

async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  try {
    // Read directly from Vercel KV
    const result = await kv.get<AnalysisResult>(`result:${id}`)
    return result
  } catch (error) {
    console.error('Error fetching from KV:', error)
    return null
  }
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

// Approach badge colors
function getApproachStyle(approach: string): string {
  switch (approach) {
    case 'specific stats':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'social proof':
      return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'unique process':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    default:
      return 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
  }
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAnalysis(id)

  if (!result) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
        <div className="text-center space-y-6">
          <h1 className="text-section text-3xl text-[var(--foreground)]">Result not found</h1>
          <p className="text-body text-lg">This analysis may have expired or doesn&apos;t exist.</p>
          <Link href="/" className="btn-kinetic inline-flex">
            Run a new test
          </Link>
        </div>
      </main>
    )
  }

  const scoreInfo = getScoreLabel(result.commodityScore)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecommoditytest.com'
  const resultUrl = `${siteUrl}/r/${result.id}`

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-section text-lg text-[var(--foreground)]">
            The Commodity Test
          </Link>
          <Link href="/" className="btn-outline text-sm py-2 px-4">
            Test another site
          </Link>
        </div>
      </header>

      {/* Results header */}
      <section className="bg-[var(--muted)] py-8 px-6 border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-label mb-2">Results for</p>
          <h1 className="text-section text-3xl md:text-4xl text-[var(--foreground)] mb-2">
            {result.companyName}
          </h1>
          <p className="text-body text-sm">{result.url}</p>
        </div>
      </section>

      {/* Score section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Big score */}
          <div className="mb-8">
            <p className="text-label mb-4">Your commodity score</p>
            <p className={`text-[8rem] md:text-[12rem] font-display leading-none ${scoreInfo.color}`}>
              {result.commodityScore}
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
              <p className="text-body">Your score</p>
              <p className="text-[var(--foreground)] font-semibold text-xl">{result.commodityScore}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <p className="text-body text-xl max-w-2xl mx-auto">{result.diagnosis}</p>
        </div>
      </section>

      {/* Cost section with methodology */}
      <section className="bg-[var(--accent)] py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-section text-2xl text-[var(--accent-foreground)] mb-4">
              What this is costing you
            </h2>
            <p className="text-[5rem] md:text-[7rem] font-display text-[var(--accent-foreground)] leading-none mb-4">
              ${result.costEstimate.toLocaleString()}
            </p>
            <p className="text-[var(--accent-foreground)]/80">
              in lost deals annually (estimated)
            </p>
          </div>

          {/* Methodology breakdown */}
          {result.costAssumptions && (
            <div className="bg-black/20 p-6 mt-8">
              <p className="text-label text-[var(--accent-foreground)]/70 mb-4">How we calculated this</p>
              <div className="grid md:grid-cols-3 gap-6 text-[var(--accent-foreground)]">
                <div>
                  <p className="text-3xl font-display">${result.costAssumptions.averageDealValue.toLocaleString()}</p>
                  <p className="text-sm opacity-70">avg deal value (industry typical)</p>
                </div>
                <div>
                  <p className="text-3xl font-display">×{result.costAssumptions.annualDeals}</p>
                  <p className="text-sm opacity-70">deals per year ($2-10M company)</p>
                </div>
                <div>
                  <p className="text-3xl font-display">×{Math.round(result.costAssumptions.lossRate * 100)}%</p>
                  <p className="text-sm opacity-70">{result.costAssumptions.lossRateLabel}</p>
                </div>
              </div>
              <p className="text-sm text-[var(--accent-foreground)]/60 mt-4">
                Based on analysis of messaging impact at $2M-$10M manufacturers. Your actual numbers may vary.
              </p>
            </div>
          )}
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
              Specific to YOUR homepage. Not generic advice.
            </p>
          </div>

          <div className="space-y-12">
            {result.fixes.map((fix) => (
              <div key={fix.number} className="border-2 border-[var(--border)] p-8">
                <div className="flex items-start gap-6">
                  <span className="text-[var(--accent)] text-4xl font-display shrink-0">
                    {String(fix.number).padStart(2, '0')}
                  </span>
                  <div className="space-y-6 flex-1">
                    {/* Original phrase with context */}
                    <div>
                      <p className="text-label mb-3">Found on your site</p>
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

                    {/* Drop-in replacements */}
                    <div>
                      <p className="text-label mb-3">Replace with (copy + paste)</p>
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

                    {/* Key insight - the most important takeaway */}
                    <div className="bg-[var(--foreground)]/5 border border-[var(--foreground)]/20 p-4 mt-2">
                      <p className="text-label text-xs mb-1">The key insight</p>
                      <p className="text-[var(--foreground)] text-lg font-medium">{fix.whyBetter}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share section */}
      <section className="bg-[var(--muted)] py-12 px-6 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-section text-2xl text-[var(--foreground)] mb-6">
            Share these results
          </h2>
          <ShareButtons
            resultUrl={resultUrl}
            companyName={result.companyName}
            score={result.commodityScore}
          />
        </div>
      </section>

      {/* CTAs section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-display text-4xl text-[var(--foreground)] text-center mb-12">
            What&apos;s next?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* DIY option */}
            <div className="border-2 border-[var(--border)] p-8">
              <h3 className="text-section text-xl text-[var(--foreground)] mb-4">Fix it yourself</h3>
              <p className="text-body text-lg mb-6">
                Want the full methodology? Download the guide that walks you through
                de-commodifying your entire site.
              </p>
              <Link href="/guide" className="btn-outline w-full">
                Get the DIY guide
              </Link>
            </div>

            {/* Done-for-you option */}
            <div className="bg-[var(--accent)] p-8">
              <h3 className="text-section text-xl text-[var(--accent-foreground)] mb-4">Let me do it for you</h3>
              <p className="text-[var(--accent-foreground)]/80 text-lg mb-6">
                I build messaging frameworks for manufacturers who are tired of competing
                on price. $18K-$25K, 6-8 weeks.
              </p>
              <Link href="/pricing" className="btn-reversed w-full">
                See pricing & process
              </Link>
            </div>
          </div>
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
            Run another test →
          </Link>
        </div>
      </footer>
    </main>
  )
}
