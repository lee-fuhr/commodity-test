import Link from 'next/link'

const patterns = [
  { name: 'Vague quality claims', example: '"quality products", "high quality"', impact: 'High' },
  { name: 'Generic partnership', example: '"trusted partner", "your partner"', impact: 'High' },
  { name: 'Unproven leadership', example: '"industry leader", "leading provider"', impact: 'High' },
  { name: 'Empty innovation', example: '"innovative solutions", "cutting edge"', impact: 'Medium' },
  { name: 'Solutions jargon', example: '"comprehensive solutions", "turnkey"', impact: 'Medium' },
  { name: 'Generic service', example: '"exceptional service", "dedicated team"', impact: 'Medium' },
]

const faqs = [
  {
    question: 'Is this really free?',
    answer: 'Yes. The test, score, and 5 fixes are completely free. No email required. I make money when people hire me to fix their messaging professionally.',
  },
  {
    question: 'What do you do with my URL?',
    answer: "I scrape your homepage to analyze the text. I don't store personal data, track you across sites, or sell your information. See the privacy policy for details.",
  },
  {
    question: 'How accurate is the score?',
    answer: "The score is based on pattern matching against 60+ commodity phrases common in B2B manufacturing. It's not perfect - some context-appropriate uses might get flagged. But if you score above 60, you definitely have commodity messaging.",
  },
  {
    question: 'Can I run the test multiple times?',
    answer: 'Yes. Run it as many times as you want. Test your competitors too.',
  },
  {
    question: 'What if I disagree with a fix?',
    answer: 'The fixes are suggestions, not mandates. Each issue comes with 3 different approaches - use your judgment about which fits your situation. The goal is to spark thinking about differentiation, not to prescribe exact words.',
  },
  {
    question: 'How is the cost estimate calculated?',
    answer: "I show you the formula: average deal value × annual deals × loss rate based on your score. These are industry averages for $2M-$10M manufacturers. Your numbers may vary, but the methodology is transparent.",
  },
]

export default function HowItWorksPage() {
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

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-display text-4xl md:text-6xl text-[var(--foreground)] mb-6">
            How it works
          </h1>
          <p className="text-body text-xl">
            Transparent methodology. No black boxes. Here&apos;s exactly what I do and why.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-12 px-6 bg-[var(--muted)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-section text-3xl text-[var(--foreground)] mb-8">
            The problem we&apos;re solving
          </h2>

          <div className="space-y-6 text-body text-lg">
            <p>
              73% of manufacturing websites use the same 50 phrases. &ldquo;Quality.&rdquo; &ldquo;Trusted partner.&rdquo;
              &ldquo;Industry-leading.&rdquo; When everyone sounds the same, buyers default to the only
              differentiator left: price.
            </p>

            <p>
              The Commodity Test identifies exactly where your messaging blends in - and gives you
              specific alternatives to stand out.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-section text-3xl text-[var(--foreground)] mb-8">
            The methodology
          </h2>

          <div className="space-y-8 text-body text-lg">
            <div>
              <h3 className="text-section text-xl text-[var(--foreground)] mb-4">
                1. I scrape your homepage
              </h3>
              <p className="mb-4">
                When you enter your URL, I extract:
              </p>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Your main headline (H1)
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Subheadlines and hero section copy
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  The first 2,000 characters of visible text
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-section text-xl text-[var(--foreground)] mb-4">
                2. I scan for commodity patterns
              </h3>
              <p>
                I match your text against 60+ commodity patterns, each weighted by how
                severely it impacts differentiation. High-impact phrases in your headline
                hurt more than medium-impact phrases buried in body copy.
              </p>
            </div>

            <div>
              <h3 className="text-section text-xl text-[var(--foreground)] mb-4">
                3. I calculate your score
              </h3>
              <p className="mb-4">
                Your Commodity Score reflects how interchangeable your messaging is. Higher = more generic.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--muted)] p-4 text-center">
                  <p className="text-2xl font-display text-green-400">0-40</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Differentiated</p>
                </div>
                <div className="bg-[var(--muted)] p-4 text-center">
                  <p className="text-2xl font-display text-yellow-400">41-60</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Moderate</p>
                </div>
                <div className="bg-[var(--muted)] p-4 text-center">
                  <p className="text-2xl font-display text-orange-400">61-80</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Commodity</p>
                </div>
                <div className="bg-[var(--muted)] p-4 text-center">
                  <p className="text-2xl font-display text-red-400">81-100</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Invisible</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-section text-xl text-[var(--foreground)] mb-4">
                4. I generate specific fixes
              </h3>
              <p className="mb-4">
                For each commodity phrase I detect, I provide:
              </p>
              <ul className="list-none space-y-2">
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  The original phrase in context (so you can find it)
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  Why it hurts your differentiation
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--accent)]">→</span>
                  <strong>3 different alternatives</strong>: specific stats, social proof, or unique process
                </li>
              </ul>
              <p className="mt-4 text-[var(--muted-foreground)]">
                Not everyone has the same data available. Three options means one will work for you.
              </p>
            </div>

            <div>
              <h3 className="text-section text-xl text-[var(--foreground)] mb-4">
                5. I estimate the cost
              </h3>
              <p className="mb-4">
                I show my math:
              </p>
              <div className="bg-[var(--accent)]/10 border-l-4 border-[var(--accent)] p-6">
                <p className="text-[var(--foreground)] font-mono text-lg">
                  $50,000 (avg deal) × 30 (deals/year) × 20% (loss rate) = $300,000
                </p>
              </div>
              <p className="mt-4 text-[var(--muted-foreground)]">
                These are industry averages for $2M-$10M manufacturers. Your numbers may be different,
                but you can plug in your own values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pattern Categories */}
      <section className="py-16 px-6 bg-[var(--muted)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-section text-3xl text-[var(--foreground)] mb-8">
            Pattern categories
          </h2>

          <div className="space-y-4">
            {patterns.map((pattern, i) => (
              <div key={i} className="border-2 border-[var(--border)] bg-[var(--background)] p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[var(--foreground)] font-semibold">{pattern.name}</p>
                  <p className="text-body text-sm italic">{pattern.example}</p>
                </div>
                <span className={`text-xs uppercase tracking-wider px-3 py-1 border ${
                  pattern.impact === 'High'
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                }`}>
                  {pattern.impact} impact
                </span>
              </div>
            ))}
          </div>

          <p className="text-body mt-6">
            Plus 54 more patterns across 12 categories. The full list is based on analysis
            of hundreds of manufacturing websites.
          </p>
        </div>
      </section>

      {/* About Lee */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-section text-3xl text-[var(--foreground)] mb-8">
            Who built this
          </h2>

          <div className="space-y-6 text-body text-lg">
            <p>
              I&apos;m Lee Fuhr. 27 years helping manufacturers stop sounding like everyone else.
            </p>

            <p>
              I built The Commodity Test because I got tired of having the same conversation.
              Marketing directors would say &ldquo;I think our messaging might be too generic.&rdquo;
              I&apos;d say &ldquo;Let me check.&rdquo; Then I&apos;d spend 30 minutes manually analyzing their site.
            </p>

            <p>
              This tool automates that first conversation. Now you can see the problem for yourself,
              with specific fixes - before we ever talk.
            </p>

            <div className="bg-[var(--accent)] p-6 mt-8">
              <p className="text-section text-xl text-[var(--accent-foreground)] mb-4">
                Why manufacturers?
              </p>
              <p className="text-[var(--accent-foreground)]">
                SaaS companies have a million messaging tools. Manufacturers have nothing.
                They&apos;re underserved, and the messaging problems are often worse because
                the industry moves slowly and everyone copies the same templates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-[var(--muted)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-section text-3xl text-[var(--foreground)] mb-8">
            Questions
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border-2 border-[var(--border)] bg-[var(--background)] p-6">
                <h3 className="text-[var(--foreground)] font-semibold text-lg mb-3">
                  {faq.question}
                </h3>
                <p className="text-body">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-display text-4xl text-[var(--foreground)] mb-4">
            Ready to see your score?
          </h2>
          <p className="text-body text-xl mb-8">
            30 seconds. No email. Just the truth about your messaging.
          </p>
          <Link href="/" className="btn-kinetic text-lg">
            Run the test
          </Link>
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
