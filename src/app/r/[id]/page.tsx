import Link from 'next/link'
import { kv } from '@vercel/kv'
import { Metadata } from 'next'
import { ShareButtons } from './ShareButtons'
import { InteractiveCostCalculator } from './InteractiveCostCalculator'
import { EmailCapture } from './EmailCapture'
import { SuggestionVote } from './SuggestionVote'
import { Footer } from '@/components/Footer'

interface CostAssumptions {
  averageDealValue: number
  annualDeals: number
  lossRate: number
  lossRateLabel: string
}

type DetectedIndustry = 'manufacturing' | 'distribution' | 'saas' | 'agency' | 'services' | 'construction' | 'healthcare' | 'finance' | 'retail' | 'general'

const INDUSTRY_COPY: Record<DetectedIndustry, { verticalNoun: string; verticalPlural: string; dealContext: string }> = {
  manufacturing: { verticalNoun: 'manufacturer', verticalPlural: 'manufacturers', dealContext: '$2M–$10M manufacturers' },
  distribution: { verticalNoun: 'distributor', verticalPlural: 'distributors', dealContext: 'industrial distributors' },
  saas: { verticalNoun: 'software company', verticalPlural: 'software companies', dealContext: 'B2B SaaS companies' },
  agency: { verticalNoun: 'agency', verticalPlural: 'agencies', dealContext: 'creative and digital agencies' },
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

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const result = await getAnalysis(id)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://areyougeneric.com'

  if (!result) {
    return {
      title: 'Result not found | The Commodity Test',
      description: 'This analysis may have expired or doesn\'t exist.',
    }
  }

  const scoreLabel = result.commodityScore >= 70 ? 'well differentiated' :
                     result.commodityScore >= 55 ? 'moderately differentiated' :
                     result.commodityScore >= 40 ? 'weakly differentiated' : 'undifferentiated'

  const title = `${result.companyName} scored ${result.commodityScore} | The Commodity Test`
  const description = `${result.companyName}'s messaging is ${scoreLabel}. See their full analysis with specific fixes.`
  const url = `${siteUrl}/r/${id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'The Commodity Test',
      images: [
        {
          url: `${siteUrl}/api/og?company=${encodeURIComponent(result.companyName)}&score=${result.commodityScore}`,
          width: 1200,
          height: 630,
          alt: `${result.companyName} Commodity Test Results - Score: ${result.commodityScore}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/api/og?company=${encodeURIComponent(result.companyName)}&score=${result.commodityScore}`],
    },
  }
}

// Differentiation score: 100 = highly differentiated (good), 0 = pure commodity (bad)
// Be pessimistic - 61 shouldn't feel "well done"
function getScoreLabel(score: number): { label: string; color: string; adjective: string } {
  if (score >= 85) return { label: 'Highly differentiated', adjective: 'Strongly', color: 'text-[var(--score-excellent)]' }
  if (score >= 70) return { label: 'Well differentiated', adjective: 'Clearly', color: 'text-[var(--score-excellent)]' }
  if (score >= 55) return { label: 'Moderately differentiated', adjective: 'Somewhat', color: 'text-[var(--score-good)]' }
  if (score >= 40) return { label: 'Weakly differentiated', adjective: 'Barely', color: 'text-[var(--score-fair)]' }
  return { label: 'Undifferentiated', adjective: 'Not', color: 'text-[var(--score-poor)]' }
}

// Highlight the phrase within its context
function HighlightedContext({ context, phrase }: { context: string; phrase: string }) {
  const lowerContext = context.toLowerCase()
  const lowerPhrase = phrase.toLowerCase()
  const idx = lowerContext.indexOf(lowerPhrase)

  if (idx === -1) {
    return <span className="text-[var(--muted-foreground)] italic">{context}</span>
  }

  const before = context.slice(0, idx)
  const match = context.slice(idx, idx + phrase.length)
  const after = context.slice(idx + phrase.length)

  return (
    <span className="italic">
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
      return 'bg-[var(--score-good-bg)] text-[var(--score-good)] border-[var(--score-good)]'
    case 'social proof':
      return 'bg-[var(--score-excellent-bg)] text-[var(--score-excellent)] border-[var(--score-excellent)]'
    case 'unique process':
      return 'bg-[var(--score-fair-bg)] text-[var(--score-fair)] border-[var(--score-fair)]'
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
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-section text-3xl text-[var(--foreground)]">Analysis not found</h1>
          <p className="text-body text-lg">This result has expired or the link is incorrect. Results are kept for 30 days.</p>
          <p className="text-body text-sm text-[var(--muted-foreground)]">Good news: running a new test only takes about 30 seconds.</p>
          <div className="pt-2">
            <Link href="/" className="btn-kinetic inline-flex">
              Run a new test
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const scoreInfo = getScoreLabel(result.commodityScore)
  const industry = result.industry || 'general'
  const industryCopy = INDUSTRY_COPY[industry]
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://areyougeneric.com'
  const resultUrl = `${siteUrl}/r/${result.id}`

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] py-3 sm:py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          <Link href="/" className="text-section text-base sm:text-lg text-[var(--foreground)]">
            The Commodity Test
          </Link>
          <Link href="/" className="btn-outline text-xs sm:text-sm py-2 px-3 sm:px-4 min-h-[44px] flex items-center">
            Test another site
          </Link>
        </div>
      </header>

      {/* Results header */}
      <section className="bg-[var(--muted)] py-6 sm:py-8 px-4 sm:px-6 border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-label mb-2">Results for</p>
          <h1 className="text-section text-2xl sm:text-3xl md:text-4xl text-[var(--foreground)] mb-2 break-words">
            {result.companyName}
          </h1>
          <p className="text-body text-xs sm:text-sm break-all">{result.url}</p>
        </div>
      </section>

      {/* Score section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Big score */}
          <div className="mb-8">
            <p className="text-label mb-4">Your commodity score</p>
            <p className={`text-[5rem] sm:text-[6rem] md:text-[8rem] lg:text-[12rem] font-display leading-none ${scoreInfo.color}`}>
              {result.commodityScore}
            </p>
            <p className={`text-section text-xl sm:text-2xl ${scoreInfo.color}`}>{scoreInfo.label}</p>
            <p className="text-body text-xs sm:text-sm mt-2 opacity-70">
              (Higher is better. 100 = highly differentiated. 0 = pure commodity.)
            </p>
          </div>

          {/* Context */}
          <div className="flex justify-center gap-8 mb-8 text-sm">
            <div className="text-center">
              <p className="text-body">Industry avg (est.)</p>
              <p className="text-[var(--foreground)] font-semibold text-xl">64</p>
            </div>
            <div className="w-px bg-[var(--border)]" />
            <div className="text-center">
              <p className="text-body">Your score</p>
              <p className="text-[var(--foreground)] font-semibold text-xl">{result.commodityScore}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <p className="text-body text-lg sm:text-xl max-w-2xl mx-auto">{result.diagnosis}</p>
        </div>
      </section>

      {/* Cost section with methodology */}
      <section className="bg-[var(--accent)] py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-section text-xl sm:text-2xl text-[var(--accent-foreground)] mb-4">
              What this is costing you
            </h2>
            <p className="text-[var(--accent-foreground)] text-xs sm:text-sm mb-4 max-w-xl mx-auto opacity-90 px-2">
              Based on typical deal values for {industryCopy.dealContext}, mid-range deal volume, and a {Math.round((result.costAssumptions?.lossRate || 0.3) * 100)}% loss rate to &quot;cheaper&quot; competitors.
            </p>
            <p className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[7rem] font-display text-[var(--accent-foreground)] leading-none mb-4">
              ${result.costEstimate.toLocaleString()}
            </p>
            <p className="text-[var(--accent-foreground)] opacity-90 text-sm sm:text-base">
              in lost deals annually (estimated)
            </p>
          </div>

          {/* Methodology breakdown - interactive */}
          {result.costAssumptions && (
            <InteractiveCostCalculator
              initialAssumptions={result.costAssumptions}
            />
          )}
        </div>
      </section>

      {/* Fixes section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-display text-3xl sm:text-4xl md:text-5xl text-[var(--foreground)] mb-4">
              {result.fixes.length} thing{result.fixes.length !== 1 ? 's' : ''} to fix
            </h2>
            <p className="text-body text-lg sm:text-xl">
              Specific to YOUR homepage. Not generic advice.
            </p>
          </div>

          <div className="space-y-8 sm:space-y-12">
            {result.fixes.map((fix) => (
              <div key={fix.number} className="border-2 border-[var(--border)] p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
                  <span className="text-[var(--accent)] text-2xl sm:text-4xl font-display shrink-0">
                    {String(fix.number).padStart(2, '0')}
                  </span>
                  <div className="space-y-4 sm:space-y-6 flex-1 min-w-0">
                    {/* Original phrase with context */}
                    <div>
                      <p className="text-blue-300 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3">Found on your site</p>
                      <div className="bg-[var(--muted)] p-3 sm:p-4 text-base sm:text-lg leading-relaxed relative">
                        {/* Quotemark graphic - decorative, anchored top-left inside box */}
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[2.5rem] sm:text-[3rem] text-[var(--foreground)]/10 font-serif leading-none select-none pointer-events-none">&ldquo;</span>
                        <div className="pl-8 sm:pl-10 relative">
                          <HighlightedContext context={fix.context} phrase={fix.originalPhrase} />
                        </div>
                      </div>
                      <p className="text-body text-xs sm:text-sm mt-2">Location: {fix.location}</p>
                    </div>

                    {/* Why it hurts */}
                    <div>
                      <p className="text-blue-300 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2">Why it hurts you</p>
                      <p className="text-body text-base sm:text-lg">{fix.whyBad}</p>
                    </div>

                    {/* Drop-in replacements */}
                    <div>
                      <p className="text-blue-300 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3">Replace with</p>
                      <div className="space-y-3">
                        {fix.suggestions.map((suggestion, idx) => (
                          <SuggestionVote
                            key={suggestion.text}
                            resultId={result.id}
                            fixNumber={fix.number}
                            suggestionIndex={idx}
                            approach={suggestion.approach}
                            originalPhrase={fix.originalPhrase}
                            suggestionText={suggestion.text}
                          >
                            <div className="bg-[var(--accent)]/10 border-l-4 border-[var(--accent)] p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                                <p className="text-[var(--foreground)] text-base sm:text-lg flex-1">{suggestion.text}</p>
                                <span className={`text-[10px] sm:text-xs uppercase tracking-wider px-2 py-1 border shrink-0 self-start ${getApproachStyle(suggestion.approach)}`}>
                                  {suggestion.approach}
                                </span>
                              </div>
                            </div>
                          </SuggestionVote>
                        ))}
                      </div>
                    </div>

                    {/* Key insight - the most important takeaway */}
                    <div className="bg-blue-500/90 p-3 sm:p-4 mt-2">
                      <p className="text-blue-100 text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-1">The key insight</p>
                      <p className="text-white text-base sm:text-lg font-medium">{fix.whyBetter}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share section */}
      <section className="bg-[var(--muted)] py-10 sm:py-12 px-4 sm:px-6 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-section text-xl sm:text-2xl text-[var(--foreground)] mb-4 sm:mb-6">
              Share these results
            </h2>
            <ShareButtons
              resultUrl={resultUrl}
              companyName={result.companyName}
              score={result.commodityScore}
            />
          </div>
          <div className="mt-8">
            <EmailCapture resultId={result.id} companyName={result.companyName} />
          </div>
        </div>
      </section>

      {/* CTAs section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-display text-3xl sm:text-4xl text-[var(--foreground)] text-center mb-4">
            Now fix it.
          </h2>
          <p className="text-body text-center text-lg mb-8 sm:mb-12">
            Three ways to go from generic to specific.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Done-for-you option */}
            <div className="bg-[var(--accent)] p-5 sm:p-8 flex flex-col">
              <p className="text-label text-xs mb-3 text-[var(--accent-foreground)] opacity-70">OPTION 1 · $400</p>
              <h3 className="text-section text-lg sm:text-xl text-[var(--accent-foreground)] mb-3">Full site audit</h3>
              <p className="text-[var(--accent-foreground)] opacity-90 text-base mb-6 flex-1">
                Every page. 15–20 specific rewrites, prioritized by impact. You get the copy — not a list of things to fix, but the actual words to use. Done in 48 hours.
              </p>
              <a href="https://websiteaudit.leefuhr.com" className="btn-reversed w-full min-h-[44px] flex items-center justify-center">
                Get the full audit →
              </a>
            </div>

            {/* Call option */}
            <div className="border-2 border-[var(--accent)] p-5 sm:p-8 flex flex-col">
              <p className="text-label text-xs mb-3 text-[var(--accent)]">OPTION 2 · FREE</p>
              <h3 className="text-section text-lg sm:text-xl text-[var(--foreground)] mb-3">Talk it through</h3>
              <p className="text-body text-base mb-6 flex-1">
                Thirty minutes. You walk me through where you&apos;re stuck, I react. No pitch, no agenda. I&apos;ve been doing this for 27 years — I probably know what&apos;s wrong before you finish the sentence.
              </p>
              <a href="https://cal.com/leefuhr/30i" target="_blank" rel="noopener noreferrer" className="btn-outline border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] w-full min-h-[44px] flex items-center justify-center">
                Book a time →
              </a>
            </div>

            {/* DIY option */}
            <div className="border-2 border-[var(--border)] p-5 sm:p-8 flex flex-col">
              <p className="text-label text-xs mb-3">OPTION 3 · FREE</p>
              <h3 className="text-section text-lg sm:text-xl text-[var(--foreground)] mb-3">Fix it yourself</h3>
              <p className="text-body text-base mb-6 flex-1">
                The 6-page Commodity Messaging Fix Kit: worksheet, rewrite frameworks, and before/after examples from real manufacturers.
              </p>
              <Link href="/guide" className="btn-outline w-full min-h-[44px]">
                Get the free guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell: website-audit — highest value upsell ($400) */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 sm:p-8 border-2 border-[var(--accent)] bg-[var(--accent)]/5">
            <div className="flex-1">
              <p className="text-label text-xs mb-2 text-[var(--accent)]">YOUR SCORE · FULL FIX</p>
              <h3 className="text-section text-xl sm:text-2xl text-[var(--foreground)] mb-2">
                Your score shows the problem. The audit shows the fix.
              </h3>
              <p className="text-body text-base">
                Your commodity score is {result.commodityScore}. We found the specific phrases killing your credibility — all of them, across every page. Get the complete fix-it list with exact rewrites.
              </p>
            </div>
            <a href="https://websiteaudit.leefuhr.com" className="btn-kinetic shrink-0 min-h-[44px] flex items-center px-6 whitespace-nowrap">
              Get 15–20 specific rewrites — $400 →
            </a>
          </div>
        </div>
      </section>

      {/* Cross-sell: proposal-analyzer */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 sm:p-8 border-2 border-[var(--border)]">
            <div className="flex-1">
              <p className="text-label text-xs mb-2">WHILE YOU&apos;RE AT IT</p>
              <h3 className="text-section text-xl sm:text-2xl text-[var(--foreground)] mb-2">
                If your website sounds generic, your proposals probably do too.
              </h3>
              <p className="text-body text-base">
                Same methodology applied to proposals. Upload your last one and get drop-in rewrites for the phrases that are costing you bids.
              </p>
            </div>
            <a href="https://proposal-analyzer.vercel.app" className="btn-outline shrink-0 min-h-[44px] flex items-center px-6 whitespace-nowrap">
              Check your proposal →
            </a>
          </div>
        </div>
      </section>

      {/* Cross-sell: risk-translator — free entry point */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 sm:p-7 border border-[var(--border)] bg-[var(--muted)]/40">
            <div className="flex-1">
              <p className="text-label text-xs mb-2">FREE TOOL</p>
              <h3 className="text-section text-lg sm:text-xl text-[var(--foreground)] mb-2">
                Your website sounds like everyone else&apos;s. So might your technical pitch.
              </h3>
              <p className="text-body text-sm sm:text-base">
                If purchasing keeps eliminating you on price, you might not be translating your technical advantages into language they respond to. Try the risk translator — free.
              </p>
            </div>
            <a href="https://risktranslator.leefuhr.com" className="btn-outline shrink-0 min-h-[44px] flex items-center px-6 whitespace-nowrap text-sm">
              Translate my specs — free →
            </a>
          </div>
        </div>
      </section>

      {/* Cross-sell: case-study-extractor — free entry point */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 sm:p-7 border border-[var(--border)] bg-[var(--muted)]/40">
            <div className="flex-1">
              <p className="text-label text-xs mb-2">FREE TOOL</p>
              <h3 className="text-section text-lg sm:text-xl text-[var(--foreground)] mb-2">
                Better language is one thing. Proof is another.
              </h3>
              <p className="text-body text-sm sm:text-base">
                Your score shows your site sounds like everyone else. But do you have case studies to back up the claims? Turn your best project photos and invoices into a professional case study in 10 minutes.
              </p>
            </div>
            <a href="https://casestudyextractor.leefuhr.com" className="btn-outline shrink-0 min-h-[44px] flex items-center px-6 whitespace-nowrap text-sm">
              Build my first case study — free →
            </a>
          </div>
        </div>
      </section>

      <Footer showCta tagline="27 years helping B2B companies win on value, not price" />
    </main>
  )
}
