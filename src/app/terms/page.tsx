import Link from 'next/link'

export default function TermsPage() {
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
            Terms of service
          </h1>
          <p className="text-body mb-12">Last updated: December 22, 2025</p>

          <div className="space-y-10 text-body text-lg">
            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">The plain English version</h2>
              <p>
                The Commodity Test is a free tool. Use it to analyze your website. Don&apos;t use it
                to analyze websites you don&apos;t have permission to analyze. The suggestions are just
                suggestions - use your judgment. I&apos;m not liable if your messaging changes don&apos;t
                work out.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">1. Acceptance of terms</h2>
              <p>
                By using The Commodity Test (&ldquo;the Service&rdquo;), you agree to these terms.
                If you don&apos;t agree, don&apos;t use the Service. Simple.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">2. What the service does</h2>
              <p className="mb-4">
                The Commodity Test analyzes website homepage content for common &ldquo;commodity&rdquo;
                language patterns that may make businesses sound generic. It provides:
              </p>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  A Commodity Score (0-100)
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  An estimated annual cost of generic messaging
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Three suggested improvements
                </li>
              </ul>
              <p className="mt-4">
                The Service is provided for informational and educational purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">3. Acceptable use</h2>
              <p className="mb-4">You agree to:</p>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Only analyze websites you own or have permission to analyze
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Not use the Service for any illegal purpose
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Not attempt to abuse, overload, or interfere with the Service
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Not scrape or harvest data from the Service
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Not use automated systems to access the Service at excessive rates
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">4. No guarantees</h2>
              <p className="mb-4">
                <strong className="text-[var(--foreground)]">The Service is provided &ldquo;as is&rdquo; without warranties of any kind.</strong>
              </p>
              <p className="mb-4">
                I don&apos;t guarantee that:
              </p>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  The Commodity Score is accurate or comprehensive
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  The suggested fixes will improve your business results
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  The cost estimate reflects actual losses
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  The Service will be available without interruption
                </li>
              </ul>
              <p className="mt-4">
                The analysis is based on pattern matching and AI suggestions. It&apos;s a starting point
                for thinking about differentiation, not a definitive assessment.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">5. Limitation of liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, Lee Fuhr Inc shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, including but
                not limited to:
              </p>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Loss of profits or revenue
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Loss of business or business opportunities
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Damage to reputation
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Any other intangible losses
                </li>
              </ul>
              <p className="mt-4">
                This applies whether the damages arise from use of the Service, inability to use
                the Service, or any actions taken based on the Service&apos;s suggestions.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">6. Intellectual property</h2>
              <p className="mb-4">
                The Commodity Test, its methodology, design, and code are owned by Lee Fuhr Inc.
                You may not copy, modify, or create derivative works from the Service without
                written permission.
              </p>
              <p>
                Your website content remains yours. I claim no ownership over the content you
                submit for analysis.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">7. Results sharing</h2>
              <p>
                You&apos;re free to share your results publicly. When you share your results URL,
                you grant permission for others to view that specific report.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">8. Paid services</h2>
              <p>
                The Commodity Test itself is free. If you choose to hire Lee Fuhr Inc for messaging
                work (via the pricing page), separate terms will apply to that engagement.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">9. Changes to terms</h2>
              <p>
                I may update these terms. Continued use of the Service after changes constitutes
                acceptance of the new terms. Major changes will be noted with an updated date
                at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">10. Termination</h2>
              <p>
                I reserve the right to terminate or suspend access to the Service at my discretion,
                without notice, for conduct that I believe violates these terms or is harmful to
                other users or the Service.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">11. Governing law</h2>
              <p>
                These terms are governed by the laws of the State of Minnesota, United States,
                without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">12. Contact</h2>
              <p className="mb-4">
                Questions about these terms?
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
