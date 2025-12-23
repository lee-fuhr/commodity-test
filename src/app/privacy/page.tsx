import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-section text-lg text-[var(--foreground)]">
            The Commodity Test
          </Link>
          <Link href="/" className="btn-kinetic text-sm py-2 px-4">
            Run the test
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display text-4xl md:text-5xl text-[var(--foreground)] mb-4">
            Privacy policy
          </h1>
          <p className="text-body mb-12">Last updated: December 22, 2025</p>

          <div className="space-y-10 text-body text-lg">
            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">The short version</h2>
              <p>
                I don&apos;t sell your data. I don&apos;t track you across the web. I use your URL to analyze
                your homepage and generate a report. That&apos;s it.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">What I collect</h2>

              <h3 className="text-[var(--foreground)] font-semibold mt-6 mb-3">When you run the test</h3>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">The URL you submit:</strong> I need this to fetch and analyze your homepage.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Your homepage content:</strong> I scrape the text from your homepage to run the analysis. This is processed and not permanently stored.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Your results:</strong> I store your score and fixes so you can access them via your unique results URL. Results are retained for 30 days.</span>
                </li>
              </ul>

              <h3 className="text-[var(--foreground)] font-semibold mt-6 mb-3">When you download the guide</h3>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Email address:</strong> Required to send you the guide.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">First name:</strong> Optional. Used to personalize emails if provided.</span>
                </li>
              </ul>

              <h3 className="text-[var(--foreground)] font-semibold mt-6 mb-3">Automatically collected</h3>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Basic analytics:</strong> Page views, referral source, device type. I use privacy-respecting analytics (no cross-site tracking).</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Error logs:</strong> If something breaks, I log the error to fix it.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">What I don&apos;t collect</h2>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Personal information beyond what you explicitly provide
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Cookies for advertising or cross-site tracking
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Your browsing history
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Data from other tabs or applications
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">How I use your data</h2>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">URL and homepage content:</strong> Analyzed to generate your Commodity Score and fixes. Not shared with third parties except for AI processing (see below).</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Email address:</strong> Used only to send the guide and occasional updates about messaging and differentiation. You can unsubscribe anytime.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Analytics:</strong> Used to improve the tool and understand what&apos;s working.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">Third-party services</h2>
              <p className="mb-4">I use a few services to make this tool work:</p>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Vercel:</strong> Hosting and infrastructure.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Anthropic (Claude):</strong> AI-powered fix generation. Your homepage text is sent to their API for analysis.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Email service:</strong> To send the guide. I use a reputable provider that doesn&apos;t sell data.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">Data retention</h2>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Test results:</strong> 30 days, then automatically deleted</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Email list:</strong> Until you unsubscribe</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <span><strong className="text-[var(--foreground)]">Analytics:</strong> Aggregated, no personal identifiers retained</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">Your rights</h2>
              <p className="mb-4">You can:</p>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Request a copy of any data I have about you
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Request deletion of your data
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Unsubscribe from emails at any time (link in every email)
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Ask questions about this policy
                </li>
              </ul>
              <p className="mt-4">
                Email me at <a href="mailto:hello@leefuhr.com" className="text-[var(--accent)] hover:underline">hello@leefuhr.com</a> for any requests.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">Changes to this policy</h2>
              <p>
                If I make significant changes, I&apos;ll update the &ldquo;last updated&rdquo; date at the top.
                For major changes that affect how I use your data, I&apos;ll notify you via email if you&apos;re
                on my list.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">Contact</h2>
              <p className="mb-4">
                Questions? Concerns? Just want to say hi?
              </p>
              <div className="bg-[var(--muted)] p-6">
                <p className="text-[var(--foreground)] font-semibold">Lee Fuhr</p>
                <p>Lee Fuhr Inc</p>
                <a href="mailto:hello@leefuhr.com" className="text-[var(--accent)] hover:underline">hello@leefuhr.com</a>
              </div>
            </section>
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
