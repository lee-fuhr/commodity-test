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
    router.push(`/processing?url=${encodeURIComponent(validUrl)}`)
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Hero: Value prop + Form (CTA immediately visible) */}
      <section className="min-h-[85vh] flex flex-col justify-center px-4 md:px-8 lg:px-12 py-12">
        <div className="max-w-[95vw] mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Headline */}
            <div>
              <h1 className="text-display text-[clamp(2.5rem,8vw,8rem)] mb-6">
                Become the
                <br />
                <span className="text-[var(--accent)]">obvious</span>
                <br />
                choice
              </h1>
              <p className="text-body text-xl md:text-2xl max-w-xl">
                Your website says &ldquo;quality&rdquo; and &ldquo;trusted partner.&rdquo;
                So does everyone else&apos;s. Find out exactly where you blend in — <strong className="text-[var(--foreground)]">and how to fix it.</strong>
              </p>
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
                      'Get your commodity score'
                    )}
                  </button>

                  <div role="status" aria-live="polite" className="sr-only">
                    {isLoading && 'Analyzing your website, please wait...'}
                  </div>
                </form>

                <div className="mt-6 pt-6 border-t border-white/20 flex flex-wrap justify-center gap-6 text-sm text-[var(--accent-foreground)] opacity-70">
                  <span>30 seconds</span>
                  <span>·</span>
                  <span>No email</span>
                  <span>·</span>
                  <span>Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stakes strip */}
      <section className="bg-[var(--accent)] py-4 overflow-hidden">
        <div className="marquee-track whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-6">
              <span className="text-section text-lg text-[var(--accent-foreground)]">Can&apos;t tell you apart</span>
              <span className="text-[var(--accent-foreground)]">→</span>
              <span className="text-section text-lg text-[var(--accent-foreground)]">Compare on price</span>
              <span className="text-[var(--accent-foreground)]">→</span>
              <span className="text-section text-lg text-[var(--accent-foreground)]">3-bid territory</span>
              <span className="text-[var(--accent-foreground)]">→</span>
              <span className="text-section text-lg text-[var(--accent-foreground)]">Margins erode</span>
              <span className="text-[var(--accent-foreground)] px-4">★</span>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="px-4 md:px-8 lg:px-12 py-20 md:py-28">
        <div className="max-w-[95vw] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-label mb-4">What you get</p>
              <h2 className="text-section text-4xl md:text-5xl lg:text-6xl mb-8">
                Your commodity score
                <br />
                <span className="text-[var(--muted-foreground)]">+ 3 specific fixes</span>
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="text-[var(--accent)] text-2xl font-bold shrink-0">01</span>
                <div>
                  <p className="text-section text-xl mb-2">Commodity score</p>
                  <p className="text-body text-lg">How much of your messaging is interchangeable with competitors. The higher the score, the more you&apos;re competing on price.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[var(--accent)] text-2xl font-bold shrink-0">02</span>
                <div>
                  <p className="text-section text-xl mb-2">Flagged phrases</p>
                  <p className="text-body text-lg">Exact phrases on your site that every competitor uses. &ldquo;Quality,&rdquo; &ldquo;trusted partner,&rdquo; &ldquo;industry-leading&rdquo; — you know the ones.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[var(--accent)] text-2xl font-bold shrink-0">03</span>
                <div>
                  <p className="text-section text-xl mb-2">Specific rewrites</p>
                  <p className="text-body text-lg">For each flagged phrase, a suggested alternative that actually differentiates. Not generic advice — specific copy you can use.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The problem (condensed) */}
      <section className="px-4 md:px-8 lg:px-12 py-20 md:py-28 bg-[var(--muted)]">
        <div className="max-w-[95vw] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-label mb-4">The real problem</p>
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
                <span className="number-massive text-[7rem] md:text-[10rem] text-[var(--border)] block leading-none">
                  73%
                </span>
                <span className="text-body text-lg text-[var(--muted-foreground)]">
                  of B2B websites use the same 50 phrases
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="px-4 md:px-8 lg:px-12 py-16 border-t-2 border-[var(--border)]">
        <div className="max-w-[95vw] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-2xl">
              <p className="text-body text-lg md:text-xl">
                Built by <a href="https://oww.leefuhr.com" className="text-[var(--accent)] hover:underline">Lee Fuhr</a>, who&apos;s spent 27 years helping manufacturers escape commodity positioning.
                The patterns in this test come from analyzing hundreds of websites that were losing deals to &ldquo;cheaper&rdquo; competitors.
              </p>
            </div>
            <Link href="/sample" className="btn-outline min-h-[44px] shrink-0">
              See a sample report
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 lg:px-12 py-8 border-t border-[var(--border)]">
        <div className="max-w-[95vw] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-label">
            <a href="https://oww.leefuhr.com" className="text-[var(--accent)] hover:underline">Lee Fuhr Inc</a> © 2025
          </p>

          <nav className="flex gap-8">
            <Link href="/how-it-works" className="text-body text-sm hover:text-[var(--accent)] transition-colors">
              How it works
            </Link>
            <Link href="/privacy" className="text-body text-sm hover:text-[var(--accent)] transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-body text-sm hover:text-[var(--accent)] transition-colors">
              Contact
            </Link>
          </nav>

          <p className="text-label">No tracking · No bullshit</p>
        </div>
      </footer>
    </main>
  )
}
