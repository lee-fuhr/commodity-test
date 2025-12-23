'use client'

import { useState } from 'react'
import Link from 'next/link'

const guideContents = [
  'The 12 commodity patterns killing your differentiation',
  'Self-audit worksheet for your homepage',
  '5 rewrite frameworks with examples',
  'Before/after case studies from real manufacturers',
  'Common mistakes when trying to fix generic messaging',
]

const testimonials = [
  {
    quote: 'The worksheet alone was worth it. I found 6 commodity phrases on our homepage in 10 minutes.',
    author: 'Marketing Director',
    company: 'Industrial equipment manufacturer',
  },
  {
    quote: 'Finally, someone who understands that manufacturers aren\'t SaaS companies.',
    author: 'VP Marketing',
    company: '$8M precision machining company',
  },
]

export default function GuidePage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    // TODO: Integrate with email service (ConvertKit, Mailchimp, etc.)
    // For now, simulate success
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

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
          <p className="text-accent-400 font-semibold text-sm uppercase tracking-wide mb-4">
            Free guide
          </p>
          <h1 className="text-h1 md:text-hero font-bold text-brand-900 mb-4">
            The DIY guide to fixing commodity messaging
          </h1>
          <p className="text-body-lg text-brand-600 mb-8">
            Everything I know about differentiating manufacturer websites, distilled into a practical guide you can use yourself.
          </p>
        </div>
      </section>

      {/* Two-column: Form + Contents */}
      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form column */}
            <div>
              {!isSubmitted ? (
                <div className="bg-white rounded-xl border-2 border-brand-200 p-8 shadow-elevated">
                  <h2 className="text-xl font-semibold text-brand-900 mb-6">
                    Get the free guide
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-brand-700 mb-2">
                        First name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="input"
                        placeholder="Your first name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-brand-700 mb-2">
                        Work email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={error ? 'input-error' : 'input'}
                        placeholder="you@company.com"
                        required
                      />
                      {error && (
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full"
                    >
                      {isSubmitting ? 'Sending...' : 'Send me the guide'}
                    </button>

                    <p className="text-xs text-brand-500 text-center">
                      No spam. Unsubscribe anytime. I respect your inbox.
                    </p>
                  </form>
                </div>
              ) : (
                <div className="bg-score-excellent/10 rounded-xl border-2 border-score-excellent p-8 text-center">
                  <div className="w-16 h-16 bg-score-excellent rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-brand-900 mb-2">
                    Check your inbox
                  </h2>
                  <p className="text-brand-600">
                    The guide is on its way to {email}. Check your spam folder if you don&apos;t see it in a few minutes.
                  </p>
                </div>
              )}
            </div>

            {/* Contents column */}
            <div>
              <h2 className="text-xl font-semibold text-brand-900 mb-6">
                What&apos;s inside
              </h2>

              <ul className="space-y-4 mb-8">
                {guideContents.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent-600 text-sm font-semibold">{i + 1}</span>
                    </div>
                    <span className="text-brand-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-brand-50 rounded-lg p-6">
                <p className="text-sm text-brand-600 mb-4">
                  <strong className="text-brand-800">Who this is for:</strong> Marketing directors and owners at $2M-$10M manufacturers who want to fix their messaging without hiring an agency.
                </p>
                <p className="text-sm text-brand-600">
                  <strong className="text-brand-800">Who this isn&apos;t for:</strong> SaaS companies, service businesses, or anyone looking for quick hacks. This is real work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-brand-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-h2 font-bold text-brand-900 text-center mb-12">
            What readers say
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-brand-200">
                <blockquote className="text-brand-700 mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="text-sm">
                  <p className="font-semibold text-brand-800">{testimonial.author}</p>
                  <p className="text-brand-500">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternative CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-h2 font-bold text-brand-900 mb-4">
            Prefer to see your score first?
          </h2>
          <p className="text-body-lg text-brand-600 mb-8">
            The Commodity Test takes 30 seconds and doesn&apos;t require an email.
            See how generic your messaging is before diving into the guide.
          </p>
          <Link href="/" className="btn-accent inline-flex">
            Run the test
          </Link>
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
