import Link from 'next/link'

const tiers = [
  {
    name: 'The Playbook',
    price: '$1,000',
    description: 'DIY with expert guidance',
    timeline: '1 week',
    features: [
      'Your Commodity Test results as starting point',
      'Full site audit with prioritized fixes',
      'MoSCoW prioritization (Must/Should/Could/Won\'t)',
      'Harder changes clearly marked (new sections, pages)',
      'Two 30-minute calls (kickoff + unveil)',
    ],
    notIncluded: [
      'I don\'t implement - you do',
      'No design or development',
    ],
    cta: 'Get The Playbook',
    highlighted: false,
    href: 'https://calendly.com/leefuhr/playbook',
  },
  {
    name: 'Core Site',
    price: '$18,000',
    description: 'Up to 6 pages, done for you',
    timeline: '6-8 weeks',
    features: [
      'Complete messaging framework',
      'Homepage + 5 key pages',
      'Copywriting for all pages',
      'Webflow design & development',
      'CMS for basic self-editing',
    ],
    notIncluded: [
      'Single buyer persona',
      'Standard CMS structure',
    ],
    cta: 'Schedule discovery call',
    highlighted: true,
    href: 'https://calendly.com/leefuhr/discovery-call',
  },
  {
    name: 'Full Site',
    price: '$25,000',
    description: 'Up to 12 pages, done for you',
    timeline: '8-10 weeks',
    features: [
      'Everything in Core, plus:',
      'Up to 12 pages total',
      'Product/service detail pages',
      'More complex IA & navigation',
      'Extended CMS capabilities',
    ],
    notIncluded: [
      'Single buyer persona',
      'Add-ons available below',
    ],
    cta: 'Schedule discovery call',
    highlighted: false,
    href: 'https://calendly.com/leefuhr/discovery-call',
  },
]

const addons = [
  { name: 'Additional buyer persona', price: '+$3,000', description: 'Messaging + pages for a second audience' },
  { name: 'Advanced CMS setup', price: '+$2,000', description: 'Complex content structures, filtering, custom fields' },
  { name: 'Rush delivery', price: '+20%', description: 'Compress timeline by ~25%' },
]

const retainer = {
  name: 'Monthly Retainer',
  price: 'From $6,000/mo',
  description: 'Fractional CMO / messaging partner',
  features: [
    'Ongoing messaging optimization',
    'Content strategy & guidance',
    'Campaign messaging support',
    'Regular strategy calls',
    'Priority access & response',
  ],
  note: 'Starting at 1/6 time allocation (~6-7 hrs/week). Larger allocations available.',
}

const faqs = [
  {
    question: 'How do I know which tier is right?',
    answer: "Count your pages. Most manufacturers need 6–8 pages: Homepage, About, Services/Products, Process, Contact, and maybe a couple detail pages. If you're over 8, you probably need Full Site.",
  },
  {
    question: 'What if I need more than 12 pages?',
    answer: "We'll scope it custom. Complex sites with 15+ pages, multiple product lines, or unusual requirements get a custom quote based on actual scope.",
  },
  {
    question: 'What about the messaging framework only?',
    answer: 'If you just want the strategic work without design/development, The Playbook is your option. It gives you everything you need to brief your own team or another agency.',
  },
  {
    question: 'Do you guarantee results?',
    answer: "I guarantee deliverables: you'll get everything listed. Sales outcomes depend on your product, market, and implementation. But I promise your messaging will stop sounding like everyone else's.",
  },
  {
    question: "What's your refund policy?",
    answer: "Milestone-based payment protects both of us: 30% deposit, 30% at framework delivery, 40% at launch. You're protected because you can revise or walk away at framework stage. I'm protected because I'm bringing 27 years of expertise to bear—my time and insight have real value. Fair exchange.",
  },
  {
    question: 'What if I need it faster?',
    answer: "Rush delivery (+20%) compresses the timeline by about 25%. I'd rather do it right than fast, but I understand deadlines. We'll discuss trade-offs upfront.",
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
            Fix your commodity messaging
          </h1>
          <p className="text-body text-xl">
            Three ways to work together. Pick the one that fits your budget and bandwidth.
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
                <p className={`text-4xl font-display mb-1 ${tier.highlighted ? 'text-[var(--accent-foreground)]' : 'text-[var(--foreground)]'}`}>
                  {tier.price}
                </p>
                <p className={`text-sm mb-4 ${tier.highlighted ? 'text-[var(--accent-foreground)]/70' : 'text-body'}`}>
                  {tier.timeline}
                </p>
                <p className={`mb-6 ${tier.highlighted ? 'text-[var(--accent-foreground)]/90' : 'text-body'}`}>
                  {tier.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm ${tier.highlighted ? 'text-[var(--accent-foreground)]' : 'text-body'}`}>
                      <span className={tier.highlighted ? 'text-[var(--accent-foreground)]' : 'text-green-400'}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {tier.notIncluded && (
                  <ul className="space-y-1 mb-6 pt-4 border-t border-current/20">
                    {tier.notIncluded.map((item, i) => (
                      <li key={i} className={`flex items-start gap-2 text-xs ${tier.highlighted ? 'text-[var(--accent-foreground)]/60' : 'text-body/60'}`}>
                        <span>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href={tier.href}
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

      {/* Add-ons */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-section text-2xl text-[var(--foreground)] mb-6">
            Add-ons (Core & Full Site)
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {addons.map((addon) => (
              <div key={addon.name} className="border border-[var(--border)] p-4">
                <p className="text-[var(--foreground)] font-semibold">{addon.name}</p>
                <p className="text-[var(--accent)] font-display text-xl">{addon.price}</p>
                <p className="text-body text-sm">{addon.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise callout */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--muted)] border-2 border-[var(--border)] p-8 text-center">
            <h2 className="text-section text-2xl text-[var(--foreground)] mb-4">
              Need something bigger?
            </h2>
            <p className="text-body text-lg mb-6">
              12+ pages, multiple product lines, complex requirements? Let&apos;s scope it properly.
            </p>
            <Link
              href="/contact?type=quote"
              className="btn-outline inline-flex"
            >
              Request custom quote
            </Link>
          </div>
        </div>
      </section>

      {/* Retainer */}
      <section className="py-16 px-6 bg-[var(--muted)]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-label text-[var(--accent)] mb-2">Ongoing partnership</p>
              <h2 className="text-display text-3xl text-[var(--foreground)] mb-4">
                {retainer.name}
              </h2>
              <p className="text-4xl font-display text-[var(--foreground)] mb-2">
                {retainer.price}
              </p>
              <p className="text-body text-lg mb-6">
                {retainer.description}
              </p>
              <ul className="space-y-2 mb-6">
                {retainer.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-body">
                    <span className="text-[var(--accent)]">→</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-body text-sm italic">{retainer.note}</p>
            </div>
            <div className="text-center">
              <Link
                href="/contact?type=retainer"
                className="btn-kinetic inline-flex text-lg"
              >
                Discuss retainer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-section text-3xl text-[var(--foreground)] text-center mb-12">
            Common questions
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border-2 border-[var(--border)] bg-[var(--muted)] p-6">
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
      <section className="py-16 px-6 bg-[var(--accent)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-display text-4xl text-[var(--accent-foreground)] mb-4">
            Not sure which to pick?
          </h2>
          <p className="text-[var(--accent-foreground)]/80 text-xl mb-8">
            Run the free Commodity Test first. See your score, get 5 specific fixes. Then decide if you want help implementing.
          </p>
          <Link href="/" className="bg-[var(--background)] text-[var(--foreground)] px-8 py-4 font-semibold uppercase tracking-wider hover:bg-[var(--muted)] transition-colors inline-flex">
            Run the free test
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
