import Link from 'next/link'

const tiers = [
  {
    name: 'Base',
    price: '$18,000',
    description: 'Single market positioning',
    timeline: '6 weeks',
    features: [
      'Competitive positioning audit',
      'Complete messaging framework',
      'Homepage + 3 key pages',
      'Sales messaging toolkit',
      '3 revision rounds',
    ],
    perfectFor: [
      'Clear single market (e.g., only distributors)',
      'Straightforward product line',
      'One primary buyer persona',
    ],
    cta: 'Schedule discovery call',
    highlighted: false,
  },
  {
    name: 'Extended',
    price: '$22,000',
    description: 'Two market positioning strategies',
    timeline: '7 weeks',
    features: [
      'Everything in Base, plus:',
      'Two market positioning strategies',
      'Homepage + 5 key pages',
      'Extended sales toolkit',
      '4 revision rounds',
    ],
    perfectFor: [
      'Selling to multiple buyer types',
      'Complex product lines',
      'Multiple stakeholder groups',
    ],
    cta: 'Schedule discovery call',
    highlighted: true,
  },
  {
    name: 'Comprehensive',
    price: '$25,000',
    description: 'Full messaging transformation',
    timeline: '8 weeks',
    features: [
      'Everything in Extended, plus:',
      'Three market positioning strategies',
      'Up to 8 pages',
      'Competitive response playbook',
      '5 revision rounds',
    ],
    perfectFor: [
      'Complex go-to-market',
      'Multiple product lines',
      'Deep sales enablement needs',
    ],
    cta: 'Schedule discovery call',
    highlighted: false,
  },
]

const timeline = [
  { week: '1', label: 'Discovery', description: 'Kickoff, materials review' },
  { week: '2-3', label: 'Research', description: 'Competitor audit, analysis' },
  { week: '4-5', label: 'Framework', description: 'Messaging framework draft' },
  { week: '6', label: 'Copy', description: 'Website copy delivery' },
  { week: '7', label: 'Toolkit', description: 'Sales materials' },
  { week: '8', label: 'Handoff', description: 'Final revisions, training' },
]

const notIncluded = [
  'Website design or development',
  'Logo design or brand identity creation',
  'Graphic design for sales materials',
  'Social media content creation',
  'Blog writing or content marketing',
  'SEO optimization beyond page copy',
  'Primary market research (surveys, focus groups)',
]

const faqs = [
  {
    question: 'What if I don\'t like what you deliver?',
    answer: 'Milestone-based payment: 30% deposit, 30% at framework delivery, 40% at final handoff. If you\'re unhappy at framework stage, we can revise or part ways (you keep the work completed). I\'ve been doing this 27 years - I\'m confident you\'ll like it.',
  },
  {
    question: 'How do I know which tier is right for me?',
    answer: 'We\'ll figure it out on the discovery call. I\'ll ask about your markets, product complexity, and sales process. The scoping logic above gives you 80% clarity before we talk.',
  },
  {
    question: 'Do you guarantee results?',
    answer: 'I guarantee deliverables, not outcomes. You\'ll get everything listed in "What You Get." Whether it increases sales depends on implementation, product quality, and market. But I promise: your messaging will stop sounding like everyone else\'s.',
  },
  {
    question: 'What if my timeline is tighter than 6-8 weeks?',
    answer: 'We can compress to 4-5 weeks if needed, but quality may suffer. Messaging work needs time to develop and test. I\'d rather do it right than fast.',
  },
  {
    question: 'What\'s your refund policy?',
    answer: 'No refunds after work starts, but milestone payments protect you. If you hate the framework at week 4, you walk away having paid 60%. You keep the work completed.',
  },
]

export default function PricingPage() {
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
            What it costs to fix commodity messaging
          </h1>
          <p className="text-body text-xl">
            Fixed-price project. No hourly billing. No scope creep. You know the price before we start.
          </p>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative p-8 ${
                  tier.highlighted
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                    : 'border-2 border-[var(--border)] bg-[var(--muted)]'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] text-xs font-semibold uppercase tracking-wide px-4 py-1">
                    Most popular
                  </div>
                )}

                <h3 className={`text-section text-xl mb-2 ${tier.highlighted ? 'text-[var(--accent-foreground)]' : 'text-[var(--foreground)]'}`}>
                  {tier.name}
                </h3>
                <p className={`text-5xl font-display mb-1 ${tier.highlighted ? 'text-[var(--accent-foreground)]' : 'text-[var(--foreground)]'}`}>
                  {tier.price}
                </p>
                <p className={`text-sm mb-6 ${tier.highlighted ? 'text-[var(--accent-foreground)]/70' : 'text-body'}`}>
                  {tier.timeline}
                </p>
                <p className={`mb-6 ${tier.highlighted ? 'text-[var(--accent-foreground)]/90' : 'text-body'}`}>
                  {tier.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className={`flex items-start gap-2 ${tier.highlighted ? 'text-[var(--accent-foreground)]' : 'text-body'}`}>
                      <span className={tier.highlighted ? 'text-[var(--accent-foreground)]' : 'text-[var(--accent)]'}>→</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <p className={`text-sm font-semibold mb-2 ${tier.highlighted ? 'text-[var(--accent-foreground)]' : 'text-[var(--foreground)]'}`}>
                    Perfect for:
                  </p>
                  <ul className={`text-sm space-y-1 ${tier.highlighted ? 'text-[var(--accent-foreground)]/70' : 'text-body'}`}>
                    {tier.perfectFor.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <a
                  href="https://calendly.com/leefuhr/discovery-call"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-3 font-semibold uppercase tracking-wider text-sm transition-all ${
                    tier.highlighted
                      ? 'bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--muted)]'
                      : 'btn-kinetic'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6 bg-[var(--muted)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-section text-3xl text-[var(--foreground)] text-center mb-12">
            How it works: 6-8 weeks
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-[var(--border)]" />

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {timeline.map((item) => (
                <div key={item.week} className="relative text-center">
                  <div className="w-12 h-12 mx-auto bg-[var(--background)] border-2 border-[var(--accent)] flex items-center justify-center font-display text-[var(--accent)] mb-3">
                    {item.week}
                  </div>
                  <p className="text-[var(--foreground)] font-semibold text-sm">{item.label}</p>
                  <p className="text-body text-xs mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's not included */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 p-8">
            <h2 className="text-section text-xl text-yellow-300 mb-6">
              What&apos;s NOT included
            </h2>
            <p className="text-yellow-200/80 mb-6">
              I&apos;m a messaging strategist, not a full-service agency. You get expert positioning and copy.
              You handle (or hire for) design, development, and ongoing content.
            </p>
            <ul className="grid md:grid-cols-2 gap-3">
              {notIncluded.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-yellow-200/80">
                  <span className="text-yellow-500">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-[var(--muted)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-section text-3xl text-[var(--foreground)] text-center mb-12">
            Common questions
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

      {/* Final CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-display text-4xl text-[var(--foreground)] mb-4">
            Let&apos;s figure out which tier fits
          </h2>
          <p className="text-body text-xl mb-8">
            The discovery call is 30 minutes. We&apos;ll talk about your challenges, who you&apos;re selling to,
            and which tier makes sense. No pressure. No obligation.
          </p>
          <a
            href="https://calendly.com/leefuhr/discovery-call"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-kinetic inline-flex text-lg"
          >
            Schedule discovery call
          </a>
          <p className="text-body text-sm mt-6">
            Not ready to talk yet?{' '}
            <Link href="/guide" className="text-[var(--accent)] hover:underline">
              Download the DIY guide
            </Link>
            {' '}and try fixing it yourself first.
          </p>
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
