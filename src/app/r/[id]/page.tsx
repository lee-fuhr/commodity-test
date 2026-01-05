import Link from 'next/link'
import { kv } from '@vercel/kv'
import { ShareButtons } from './ShareButtons'
import { CopyButton } from './CopyButton'

interface CostAssumptions {
  averageDealValue: number
  annualDeals: number
  lossRate: number
  lossRateLabel: string
}

type DetectedIndustry = 'manufacturing' | 'saas' | 'services' | 'construction' | 'healthcare' | 'finance' | 'retail' | 'general'

const INDUSTRY_COPY: Record<DetectedIndustry, { verticalNoun: string; verticalPlural: string; dealContext: string }> = {
  manufacturing: { verticalNoun: 'manufacturer', verticalPlural: 'manufacturers', dealContext: '$2M–$10M manufacturers' },
  saas: { verticalNoun: 'software company', verticalPlural: 'software companies', dealContext: 'B2B SaaS companies' },
  services: { verticalNoun: 'service business', verticalPlural: 'service businesses', dealContext: 'professional service firms' },
  construction: { verticalNoun: 'contractor', verticalPlural: 'contractors', dealContext: 'commercial contractors' },
  healthcare: { verticalNoun: 'healthcare provider', verticalPlural: 'healthcare providers', dealContext: 'healthcare organizations' },
  finance: { verticalNoun: 'financial firm', verticalPlural: 'financial firms', dealContext: 'financial services companies' },
  retail: { verticalNoun: 'retailer', verticalPlural: 'retailers', dealContext: 'retail brands' },
  general: { verticalNoun: 'business', verticalPlural: 'businesses', dealContext: 'B2B companies' }
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
  industry?: DetectedIndustry
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

// Differentiation score: 100 = highly differentiated (good), 0 = pure commodity (bad)
function getScoreLabel(score: number): { label: string; color: string; adjective: string } {
  if (score >= 80) return { label: 'Highly differentiated', adjective: 'Strongly', color: 'text-green-400' }
  if (score >= 60) return { label: 'Well differentiated', adjective: 'Clearly', color: 'text-lime-400' }
  if (score >= 40) return { label: 'Somewhat differentiated', adjective: 'Moderately', color: 'text-yellow-400' }
  if (score >= 20) return { label: 'Barely differentiated', adjective: 'Weakly', color: 'text-orange-400' }
  return { label: 'Undifferentiated', adjective: 'Not', color: 'text-red-400' }
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
  const industry = result.industry || 'general'
  const industryCopy = INDUSTRY_COPY[industry]
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
            <p className="text-body text-sm mt-2 opacity-70">
              (Higher is better. 100 = highly differentiated. 0 = pure commodity.)
            </p>
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
            <p className="text-[var(--accent-foreground)] text-sm mb-4 max-w-xl mx-auto opacity-90">
              Based on typical deal values for {industryCopy.dealContext}, mid-range deal volume, and a {Math.round((result.costAssumptions?.lossRate || 0.3) * 100)}% loss rate to "cheaper" competitors.
            </p>
            <p className="text-[5rem] md:text-[7rem] font-display text-[var(--accent-foreground)] leading-none mb-4">
              ${result.costEstimate.toLocaleString()}
            </p>
            <p className="text-[var(--accent-foreground)] opacity-90">
              in lost deals annually (estimated)
            </p>
          </div>

          {/* Methodology breakdown */}
          {result.costAssumptions && (
            <div className="bg-black/20 p-8 mt-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-blue-200 mb-2">Show your work</h3>
              <p className="text-white/80 text-sm mb-6">
                How much revenue walks out the door when prospects can't tell you apart from competitors?
              </p>

              {/* The calculation as a readable equation */}
              <div className="text-white mb-6">
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center">
                  <div className="bg-black/20 px-4 py-3 min-w-[100px]">
                    <p className="text-2xl md:text-3xl font-display text-white">${(result.costAssumptions.averageDealValue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-white/70">avg deal</p>
                  </div>
                  <span className="text-2xl text-white/70">×</span>
                  <div className="bg-black/20 px-4 py-3 min-w-[80px]">
                    <p className="text-2xl md:text-3xl font-display text-white">{result.costAssumptions.annualDeals}</p>
                    <p className="text-xs text-white/70">deals/yr</p>
                  </div>
                  <span className="text-2xl text-white/70">×</span>
                  <div className="bg-black/20 px-4 py-3 min-w-[80px]">
                    <p className="text-2xl md:text-3xl font-display text-white">{Math.round(result.costAssumptions.lossRate * 100)}%</p>
                    <p className="text-xs text-white/70">loss rate</p>
                  </div>
                  <span className="text-2xl text-white/70">=</span>
                  <div className="bg-white/10 px-4 py-3 min-w-[120px] border-2 border-white/30">
                    <p className="text-2xl md:text-3xl font-display text-white">${(result.costEstimate / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-white/70">annual loss</p>
                  </div>
                </div>
              </div>

              {/* ROI calculation - now more visual */}
              <div className="border-t border-white/20 pt-6">
                <h3 className="text-xl font-semibold text-blue-200 mb-2">If you fix it</h3>
                <p className="text-white/80 text-sm mb-4">
                  A Core Site rebuild runs $18K. Keep just half the deals you'd otherwise lose, and here's your return:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center text-white mb-4">
                  <div className="bg-black/20 px-4 py-3">
                    <p className="text-2xl md:text-3xl font-display text-white">${(result.costEstimate / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-white/70">annual loss</p>
                  </div>
                  <span className="text-2xl text-white/70">×</span>
                  <div className="bg-black/20 px-4 py-3">
                    <p className="text-2xl md:text-3xl font-display text-white">50%</p>
                    <p className="text-xs text-white/70">conservative</p>
                  </div>
                  <span className="text-2xl text-white/70">÷</span>
                  <div className="bg-black/20 px-4 py-3">
                    <p className="text-2xl md:text-3xl font-display text-white">$18K</p>
                    <p className="text-xs text-white/70">investment</p>
                  </div>
                  <span className="text-2xl text-white/70">=</span>
                  <div className="bg-green-500/20 px-4 py-3 border-2 border-green-400/40">
                    <p className="text-2xl md:text-3xl font-display text-green-200">{Math.round((result.costEstimate / 2 / 18000) * 100)}%</p>
                    <p className="text-lg font-display text-green-200">(${Math.round(result.costEstimate / 2 / 1000)}K)</p>
                    <p className="text-xs text-green-200/80">first-year ROI</p>
                  </div>
                </div>
                <p className="text-center text-white">
                  <strong>Payback period:</strong>{' '}
                  {result.costEstimate > 0 ? (
                    <>
                      {Math.ceil(18000 / (result.costEstimate / 2 / 12))} {Math.ceil(18000 / (result.costEstimate / 2 / 12)) === 1 ? 'month' : 'months'}
                    </>
                  ) : '—'}
                </p>
                <p className="text-sm text-[var(--accent-foreground)] opacity-80 mt-4 text-center">
                  Core site rebuild: $18K. <a href="/pricing" className="underline hover:text-[var(--accent-foreground)]">See all options →</a>
                </p>
              </div>
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
                      <p className="text-blue-300 font-semibold text-sm uppercase tracking-wider mb-3">Found on your site</p>
                      <div className="bg-[var(--muted)] p-4 text-lg leading-relaxed">
                        <HighlightedContext context={fix.context} phrase={fix.originalPhrase} />
                      </div>
                      <p className="text-body text-sm mt-2">Location: {fix.location}</p>
                    </div>

                    {/* Why it hurts */}
                    <div>
                      <p className="text-blue-300 font-semibold text-sm uppercase tracking-wider mb-2">Why it hurts you</p>
                      <p className="text-body text-lg">{fix.whyBad}</p>
                    </div>

                    {/* Drop-in replacements */}
                    <div>
                      <p className="text-blue-300 font-semibold text-sm uppercase tracking-wider mb-3">Replace with</p>
                      <div className="space-y-3">
                        {fix.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="bg-[var(--accent)]/10 border-l-4 border-[var(--accent)] p-4"
                          >
                            <div className="flex items-start gap-3">
                              <CopyButton text={suggestion.text} />
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
                    <div className="bg-blue-500/90 p-4 mt-2">
                      <p className="text-blue-100 text-xs uppercase tracking-wider font-semibold mb-1">The key insight</p>
                      <p className="text-white text-lg font-medium">{fix.whyBetter}</p>
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
              <p className="text-[var(--accent-foreground)] opacity-90 text-lg mb-6">
                I build messaging frameworks for {industryCopy.verticalPlural} who are tired of competing
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
      <footer className="border-t border-[var(--border)] py-8 px-6 relative">
        {/* Version number - subtle, for deployment verification */}
        <span className="absolute bottom-2 right-2 text-[10px] text-[var(--muted-foreground)]/30 select-none">v0.7.0</span>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-[var(--foreground)] font-semibold">Built by <a href="https://oww.leefuhr.com" className="text-[var(--accent)] hover:underline">Lee Fuhr</a></p>
            <p className="text-body text-sm">27 years helping {industryCopy.verticalPlural} stop sounding like everyone else</p>
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/how-it-works" className="text-body hover:text-[var(--accent)]">How it works</Link>
            <Link href="/privacy" className="text-body hover:text-[var(--accent)]">Privacy</Link>
            <Link href="/contact" className="text-body hover:text-[var(--accent)]">Contact</Link>
          </nav>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Run another test →
          </Link>
        </div>
      </footer>
    </main>
  )
}
