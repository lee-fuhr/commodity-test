'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateUrl = (input: string): string | null => {
    let normalized = input.trim()
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized
    }
    try {
      const parsed = new URL(normalized)
      if (!parsed.hostname.includes('.')) return null
      return normalized
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const validUrl = validateUrl(url)
    if (!validUrl) {
      setError('Enter a valid URL')
      return
    }
    setIsLoading(true)
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Analyze Started')
    }
    router.push(`/processing?url=${encodeURIComponent(validUrl)}`)
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero: Value prop + Form (CTA immediately visible) */}
      <section className="min-h-[85vh] flex flex-col justify-center px-4 md:px-8 lg:px-12 py-12">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Headline */}
            <div>
              <p className="text-label mb-4">COMMODITY TEST</p>
              <h1 className="text-display text-[clamp(2.25rem,6vw,5rem)] mb-6">
                Could a competitor
                <br />
                <span className="text-[var(--accent)]">say exactly</span>
                <br />
                what you&apos;re saying?
              </h1>
              <p className="text-body text-xl md:text-2xl max-w-xl mb-6">
                Your website says &ldquo;quality&rdquo; and &ldquo;trusted partner.&rdquo; So does everyone else&apos;s. When buyers can&apos;t tell you apart, they compare on price. We show you exactly where you blend in — and <strong>how to become the obvious choice.</strong>
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--muted-foreground)]">
                <span>30 seconds</span>
                <span>·</span>
                <span>Score + fixes</span>
                <span>·</span>
                <span>Free</span>
              </div>
            </div>

            {/* Right: Form (PRIMARY CTA) - Blue box, reversed */}
            <div>
              <div className="bg-[var(--accent)] p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-label mb-3 block text-[var(--accent-foreground)] opacity-80">Enter your URL</label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value)
                        setError('')
                      }}
                      placeholder="yourcompany.com"
                      className={`input-reversed ${error ? 'border-red-400' : ''}`}
                      disabled={isLoading}
                      aria-label="Website URL"
                    />
                    {error && (
                      <p className="text-red-200 text-sm mt-2 uppercase tracking-wider">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !url.trim()}
                    className="btn-reversed w-full text-lg"
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing
                      </>
                    ) : (
                      'Find my blind spots →'
                    )}
                  </button>

                  <div role="status" aria-live="polite" className="sr-only">
                    {isLoading && 'Analyzing your website, please wait...'}
                  </div>
                </form>

              </div>

              {/* Sample CTA - prominent secondary action */}
              <div className="mt-4 text-center">
                <Link href="/sample" className="btn-outline w-full text-base">
                  Or see a full sample report first →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakes strip */}
      <section className="bg-[var(--accent)] py-6">
        <div className="max-w-6xl mx-auto px-6">
          {/* Mobile: stacked list, Desktop: horizontal flow */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <span className="text-section text-base md:text-lg text-white">Can&apos;t tell you apart</span>
            <span className="text-white">→</span>
            <span className="text-section text-base md:text-lg text-white">Compare on price</span>
            <span className="text-white">→</span>
            <span className="text-section text-base md:text-lg text-white">3-bid territory</span>
            <span className="text-white">→</span>
            <span className="text-section text-base md:text-lg text-white">Margins erode</span>
            <span className="text-white text-xl">★</span>
          </div>
          <div className="md:hidden flex flex-col items-center gap-2 text-center">
            <span className="text-section text-base text-white">Can&apos;t tell you apart → Compare on price</span>
            <span className="text-section text-base text-white">→ 3-bid territory → Margins erode ★</span>
          </div>
        </div>
      </section>

      {/* What you get - VBF: outcomes first */}
      <section className="px-4 md:px-8 lg:px-12 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-label mb-4 flex items-center gap-2">
              What changes
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" className="w-4 h-4" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.167 0.917c-0.017 4.187 2.019 6.563 6.667 6.666-4.31-0.017-6.448 2.294-6.667 6.667-0.042-4.125-1.885-6.673-6.667-6.667 4.277-0.06 6.65-2.125 6.667-6.666Z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.675 0.917v2.666"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.341 2.25h2.667"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.167 12.417v2.666"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.833 13.75h2.667"/>
              </svg>
            </p>
              <h2 className="text-section text-4xl md:text-5xl lg:text-6xl mb-8">
                Become
                <br />
                the &ldquo;obvious choice&rdquo;
                <br />
                <span className="text-[var(--muted-foreground)]">in 30 seconds</span>
              </h2>
              <p className="text-body text-lg text-[var(--muted-foreground)]">
                When a purchasing manager can&apos;t tell you apart, you&apos;re one of three identical bids and price wins. This shows you exactly where you blend in — and hands you the words to stand out.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-[var(--accent)] text-2xl font-bold shrink-0">01</span>
                <div>
                  <p className="text-section text-xl mb-2">See where buyers lose you</p>
                  <p className="text-body text-lg">Exact phrases on your site that every competitor uses. &ldquo;Quality,&rdquo; &ldquo;trusted partner,&rdquo; &ldquo;industry-leading&rdquo; — the words that make you invisible.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[var(--accent)] text-2xl font-bold shrink-0">02</span>
                <div>
                  <p className="text-section text-xl mb-2">Get copy that differentiates</p>
                  <p className="text-body text-lg">For each weak phrase, a rewrite that only you can say. Not generic advice — specific sentences you can paste today.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[var(--accent)] text-2xl font-bold shrink-0">03</span>
                <div>
                  <p className="text-section text-xl mb-2">Know where you stand</p>
                  <p className="text-body text-lg">Your differentiation score (0-100) shows how much your messaging stands out. Higher is better. Run your competitor through it too — see who&apos;s winning the positioning battle.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The problem (condensed) */}
      <section className="px-4 md:px-8 lg:px-12 py-20 md:py-28 bg-[var(--muted)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-label mb-4 flex items-center gap-2">
              The real problem
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </p>
              <h2 className="text-section text-4xl md:text-5xl lg:text-6xl mb-8">
                It&apos;s not your product.
                <br />
                <span className="text-[var(--foreground)]">It&apos;s your messaging.</span>
              </h2>
              <p className="text-body text-xl md:text-2xl">
                You&apos;ve built something genuinely better. But your website sounds exactly like the competitors you outperform. So buyers put you in a spreadsheet and pick the cheapest one.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <span className="number-massive text-[4rem] sm:text-[5rem] md:text-[7rem] lg:text-[10rem] text-[var(--border)] block leading-none">
                  73%
                </span>
                <span className="text-body text-base sm:text-lg text-[var(--muted-foreground)]">
                  of manufacturing and industrial websites use the same 50 phrases
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pro tip */}
      <section className="px-4 md:px-8 lg:px-12 py-16 bg-[var(--muted)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-label mb-4 flex items-center justify-center gap-2">
            PRO TIP
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </p>
          <h2 className="text-section text-3xl md:text-4xl mb-6">
            Run a competitor through it too.
          </h2>
          <p className="text-body text-xl">
            Compare your score to theirs. If you&apos;re both in the same range, that&apos;s the problem — buyers can&apos;t tell you apart. The gap between your scores is your opportunity.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 md:px-8 lg:px-12 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <p className="text-label mb-4 text-center">FREQUENTLY ASKED</p>
          <h2 className="text-section text-3xl md:text-4xl mb-12 text-center">Common questions</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-section text-xl mb-3">What counts as a &ldquo;commodity phrase&rdquo;?</h3>
              <p className="text-body text-lg">
                Words and phrases that every company in your industry uses — &ldquo;quality,&rdquo; &ldquo;trusted partner,&rdquo; &ldquo;industry-leading,&rdquo; &ldquo;innovative solutions.&rdquo; They&apos;re not wrong, but they&apos;re invisible. When a purchasing manager has read &ldquo;committed to quality&rdquo; on 12 websites this week, yours doesn&apos;t register. You blend into the pile.
              </p>
            </div>

            <div>
              <h3 className="text-section text-xl mb-3">What does my score mean?</h3>
              <p className="text-body text-lg">
                Higher is better. A score of 70+ means your messaging stands out — buyers can tell you apart from competitors. A score below 40 means you sound like everyone else, which pushes buyers to compare on price alone. That doesn&apos;t mean you&apos;re bad at what you do — it means your website isn&apos;t communicating what makes you different.
              </p>
            </div>

            <div>
              <h3 className="text-section text-xl mb-3">How is this different from SEO tools?</h3>
              <p className="text-body text-lg">
                SEO tools check if Google can find you. This checks if buyers can tell you apart once they get there. You can rank #1 and still lose deals if your messaging sounds identical to everyone else.
              </p>
            </div>

            <div>
              <h3 className="text-section text-xl mb-3">Do you store my website data?</h3>
              <p className="text-body text-lg">
                No. We analyze your homepage in real-time and discard the content immediately after generating your report. We don&apos;t save your URL, your content, or your results.
              </p>
            </div>

            <div>
              <h3 className="text-section text-xl mb-3">How do I improve my score?</h3>
              <p className="text-body text-lg">
                Your report rewrites your worst offenders for you. The pattern is always the same: swap claims for proof. &ldquo;Industry-leading quality&rdquo; → &ldquo;0.02% defect rate across 50,000 units last year.&rdquo; &ldquo;Trusted partner&rdquo; → &ldquo;43 contractors have reordered from us 10+ times.&rdquo; The phrases aren&apos;t bad because they&apos;re on a list — they&apos;re bad because they don&apos;t prove anything.
              </p>
            </div>

            <div>
              <h3 className="text-section text-xl mb-3">We compete mostly on relationships and reputation. Does messaging really matter?</h3>
              <p className="text-body text-lg">
                It matters for the deals where you don&apos;t have a relationship yet. Your existing customers know you&apos;re different. The purchasing manager who&apos;s never heard of you is comparing your website to four others. If you all say the same thing, she&apos;s comparing price. That&apos;s the deal you lose without knowing it.
              </p>
            </div>

            <div>
              <h3 className="text-section text-xl mb-3">Can I game the score by removing certain words?</h3>
              <p className="text-body text-lg">
                You could, but you&apos;d miss the point. The goal isn&apos;t a low score — it&apos;s replacing generic claims with specific proof. &ldquo;Quality&rdquo; isn&apos;t bad because it&apos;s on a list. It&apos;s bad because it doesn&apos;t prove anything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer lockup: Credibility + More tools + Footer */}
      <section className="px-4 md:px-8 lg:px-12 py-12 bg-[var(--muted)] border-t-2 border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          {/* Credibility */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="max-w-2xl">
              <p className="text-body text-lg md:text-xl">
                Built by <a href="https://leefuhr.com" className="text-[var(--accent)] underline hover:no-underline">Lee Fuhr</a>. I help manufacturers stop sounding like everyone else. The pattern is always the same: &ldquo;quality,&rdquo; &ldquo;trusted partner,&rdquo; &ldquo;industry-leading&rdquo; — words that mean nothing because everyone uses them. This tool spots those phrases so you can replace them with proof.
              </p>
            </div>
            <Link href="/sample" className="btn-outline min-h-[44px] shrink-0">
              See a sample report
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* More tools */}
          <p className="text-label mb-6 text-center">MORE TOOLS FOR MANUFACTURERS</p>
          <div className="grid md:grid-cols-3 gap-6">
            <a href="https://proposal-analyzer.vercel.app" className="bg-[var(--background)] p-6 border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
              <p className="text-section text-lg mb-2">Proposal Analyzer</p>
              <p className="text-body text-sm text-[var(--muted-foreground)]">Spot commodity language in your proposals before the deadline. Get copy-paste fixes.</p>
            </a>
            <a href="https://case-study-extractor.vercel.app" className="bg-[var(--background)] p-6 border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
              <p className="text-section text-lg mb-2">Case Study Extractor</p>
              <p className="text-body text-sm text-[var(--muted-foreground)]">Turn project photos and invoices into sales-ready case studies in 5 minutes.</p>
            </a>
            <a href="https://risk-translator.vercel.app" className="bg-[var(--background)] p-6 border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
              <p className="text-section text-lg mb-2">Risk Translator</p>
              <p className="text-body text-sm text-[var(--muted-foreground)]">Translate your specs into risk language that gets purchasing to approve the budget.</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 lg:px-12 py-8 bg-[var(--muted)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-label">
            <a href="https://leefuhr.com" className="text-[var(--accent)] hover:underline">Lee Fuhr Inc</a> © {new Date().getFullYear()}
            <span className="text-[var(--muted)] ml-3">v0.14.0</span>
          </p>

          <nav className="flex gap-8">
            <Link href="/sample" className="text-body text-sm hover:text-[var(--accent)] transition-colors">
              See sample
            </Link>
            <Link href="/privacy" className="text-body text-sm hover:text-[var(--accent)] transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  )
}
