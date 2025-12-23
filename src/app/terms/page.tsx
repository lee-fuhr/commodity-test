import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-brand-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-brand-900 font-semibold">
            The Commodity Test
          </Link>
          <Link href="/" className="btn-secondary text-sm py-2 px-4">
            Run the test
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-h1 md:text-hero font-bold text-brand-900 mb-4">
            Terms of service
          </h1>
          <p className="text-brand-500 mb-12">Last updated: December 22, 2025</p>

          <div className="prose prose-lg text-brand-700 space-y-8">
            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">The plain English version</h2>
              <p>
                The Commodity Test is a free tool. Use it to analyze your website. Don&apos;t use it
                to analyze websites you don&apos;t have permission to analyze. The suggestions are just
                suggestions - use your judgment. I&apos;m not liable if your messaging changes don&apos;t
                work out.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">1. Acceptance of terms</h2>
              <p>
                By using The Commodity Test (&ldquo;the Service&rdquo;), you agree to these terms.
                If you don&apos;t agree, don&apos;t use the Service. Simple.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">2. What the service does</h2>
              <p>
                The Commodity Test analyzes website homepage content for common &ldquo;commodity&rdquo;
                language patterns that may make businesses sound generic. It provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>A Commodity Score (0-100)</li>
                <li>An estimated annual cost of generic messaging</li>
                <li>Three suggested improvements</li>
              </ul>
              <p className="mt-4">
                The Service is provided for informational and educational purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">3. Acceptable use</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Only analyze websites you own or have permission to analyze</li>
                <li>Not use the Service for any illegal purpose</li>
                <li>Not attempt to abuse, overload, or interfere with the Service</li>
                <li>Not scrape or harvest data from the Service</li>
                <li>Not use automated systems to access the Service at excessive rates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">4. No guarantees</h2>
              <p>
                <strong>The Service is provided &ldquo;as is&rdquo; without warranties of any kind.</strong>
              </p>
              <p className="mt-4">
                I don&apos;t guarantee that:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>The Commodity Score is accurate or comprehensive</li>
                <li>The suggested fixes will improve your business results</li>
                <li>The cost estimate reflects actual losses</li>
                <li>The Service will be available without interruption</li>
              </ul>
              <p className="mt-4">
                The analysis is based on pattern matching and AI suggestions. It&apos;s a starting point
                for thinking about differentiation, not a definitive assessment.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">5. Limitation of liability</h2>
              <p>
                To the maximum extent permitted by law, Lee Fuhr Inc shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, including but
                not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Loss of profits or revenue</li>
                <li>Loss of business or business opportunities</li>
                <li>Damage to reputation</li>
                <li>Any other intangible losses</li>
              </ul>
              <p className="mt-4">
                This applies whether the damages arise from use of the Service, inability to use
                the Service, or any actions taken based on the Service&apos;s suggestions.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">6. Intellectual property</h2>
              <p>
                The Commodity Test, its methodology, design, and code are owned by Lee Fuhr Inc.
                You may not copy, modify, or create derivative works from the Service without
                written permission.
              </p>
              <p className="mt-4">
                Your website content remains yours. I claim no ownership over the content you
                submit for analysis.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">7. Results sharing</h2>
              <p>
                You&apos;re free to share your results publicly. When you share your results URL,
                you grant permission for others to view that specific report.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">8. Paid services</h2>
              <p>
                The Commodity Test itself is free. If you choose to hire Lee Fuhr Inc for messaging
                work (via the pricing page), separate terms will apply to that engagement.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">9. Changes to terms</h2>
              <p>
                I may update these terms. Continued use of the Service after changes constitutes
                acceptance of the new terms. Major changes will be noted with an updated date
                at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">10. Termination</h2>
              <p>
                I reserve the right to terminate or suspend access to the Service at my discretion,
                without notice, for conduct that I believe violates these terms or is harmful to
                other users or the Service.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">11. Governing law</h2>
              <p>
                These terms are governed by the laws of the State of Minnesota, United States,
                without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-h2 font-semibold text-brand-800 mb-4">12. Contact</h2>
              <p>
                Questions about these terms? Email me at{' '}
                <a href="mailto:hello@leefuhr.com" className="text-accent-500 hover:underline">
                  hello@leefuhr.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-900 text-brand-400 py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2025 Lee Fuhr Inc</p>
          <nav className="flex gap-6 text-sm">
            <Link href="/how-it-works" className="hover:text-white">How it works</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <a href="mailto:hello@leefuhr.com" className="hover:text-white">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  )
}
