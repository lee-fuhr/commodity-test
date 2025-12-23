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

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-h1 md:text-hero font-bold text-brand-900 mb-4">
            What it costs to fix commodity messaging
          </h1>
          <p className="text-body-lg text-brand-600">
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
                className={`relative rounded-xl p-8 ${
                  tier.highlighted
                    ? 'bg-white border-3 border-accent-400 shadow-elevated'
                    : 'bg-white border-2 border-brand-200'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-400 text-white text-xs font-semibold uppercase tracking-wide px-4 py-1 rounded-full">
                    Most popular
                  </div>
                )}

                <h3 className="text-xl font-semibold text-brand-800 mb-2">{tier.name}</h3>
                <p className="text-4xl font-bold text-brand-900 mb-1">{tier.price}</p>
                <p className="text-sm text-brand-500 mb-6">{tier.timeline}</p>
                <p className="text-brand-600 mb-6">{tier.description}</p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-brand-700">
                      <svg className="w-5 h-5 text-score-excellent mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-brand-700 mb-2">Perfect for:</p>
                  <ul className="text-sm text-brand-500 space-y-1">
                    {tier.perfectFor.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <a
                  href="https://calendly.com/leefuhr/discovery-call"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full ${tier.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6 bg-brand-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h1 font-bold text-brand-900 text-center mb-12">
            How it works: 6-8 weeks
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-6 left-0 right-0 h-1 bg-brand-200" />

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {timeline.map((item) => (
                <div key={item.week} className="relative text-center">
                  <div className="w-12 h-12 mx-auto bg-white border-3 border-accent-400 rounded-full flex items-center justify-center font-semibold text-brand-800 mb-3">
                    {item.week}
                  </div>
                  <p className="font-semibold text-brand-800 text-sm">{item.label}</p>
                  <p className="text-xs text-brand-500 mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's not included */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-amber-900 mb-6">
              What&apos;s NOT included
            </h2>
            <p className="text-amber-800 mb-6">
              I&apos;m a messaging strategist, not a full-service agency. You get expert positioning and copy.
              You handle (or hire for) design, development, and ongoing content.
            </p>
            <ul className="grid md:grid-cols-2 gap-3">
              {notIncluded.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-800">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-brand-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-h1 font-bold text-brand-900 text-center mb-12">
            Common questions
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-brand-200">
                <h3 className="text-lg font-semibold text-brand-800 mb-3">
                  {faq.question}
                </h3>
                <p className="text-brand-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-h1 font-bold text-brand-900 mb-4">
            Let&apos;s figure out which tier fits
          </h2>
          <p className="text-body-lg text-brand-600 mb-8">
            The discovery call is 30 minutes. We&apos;ll talk about your challenges, who you&apos;re selling to,
            and which tier makes sense. No pressure. No obligation.
          </p>
          <a
            href="https://calendly.com/leefuhr/discovery-call"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            Schedule discovery call
          </a>
          <p className="text-sm text-brand-500 mt-6">
            Not ready to talk yet?{' '}
            <Link href="/guide" className="text-accent-400 hover:underline">
              Download the DIY guide
            </Link>
            {' '}and try fixing it yourself first.
          </p>
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
