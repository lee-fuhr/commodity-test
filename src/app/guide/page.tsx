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

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send guide')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <p className="text-label text-[var(--accent)] mb-4">Free guide</p>
          <h1 className="text-display text-4xl md:text-6xl text-[var(--foreground)] mb-6">
            The DIY guide to fixing commodity messaging
          </h1>
          <p className="text-body text-xl">
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
                <div className="border-2 border-[var(--border)] bg-[var(--muted)] p-8">
                  <h2 className="text-section text-xl text-[var(--foreground)] mb-6">
                    Get the free guide
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-label mb-2">
                        First name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-[var(--background)] border-2 border-[var(--border)] text-[var(--foreground)] px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                        placeholder="Your first name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-label mb-2">
                        Work email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-[var(--background)] border-2 text-[var(--foreground)] px-4 py-3 focus:outline-none ${
                          error ? 'border-red-500' : 'border-[var(--border)] focus:border-[var(--accent)]'
                        }`}
                        placeholder="you@company.com"
                        required
                      />
                      {error && (
                        <p className="text-red-400 text-sm mt-1">{error}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-kinetic w-full"
                    >
                      {isSubmitting ? 'Sending...' : 'Send me the guide'}
                    </button>

                    <p className="text-body text-sm text-center">
                      No spam. Unsubscribe anytime. I respect your inbox.
                    </p>
                  </form>
                </div>
              ) : (
                <div className="border-2 border-green-500 bg-green-500/10 p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-section text-xl text-[var(--foreground)] mb-2">
                    Check your inbox
                  </h2>
                  <p className="text-body">
                    The guide is on its way to {email}. Check your spam folder if you don&apos;t see it in a few minutes.
                  </p>
                </div>
              )}
            </div>

            {/* Contents column */}
            <div>
              <h2 className="text-section text-xl text-[var(--foreground)] mb-6">
                What&apos;s inside
              </h2>

              <ul className="space-y-4 mb-8">
                {guideContents.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[var(--accent)] font-display text-xl">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-body text-lg">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-[var(--muted)] p-6 border-l-4 border-[var(--accent)]">
                <p className="text-body mb-4">
                  <strong className="text-[var(--foreground)]">Who this is for:</strong> Marketing directors and owners at $2M-$10M manufacturers who want to fix their messaging without hiring an agency.
                </p>
                <p className="text-body">
                  <strong className="text-[var(--foreground)]">Who this isn&apos;t for:</strong> SaaS companies, service businesses, or anyone looking for quick hacks. This is real work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-[var(--muted)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-section text-3xl text-[var(--foreground)] text-center mb-12">
            What readers say
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="border-2 border-[var(--border)] bg-[var(--background)] p-6">
                <blockquote className="text-body text-lg mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="text-sm">
                  <p className="text-[var(--foreground)] font-semibold">{testimonial.author}</p>
                  <p className="text-body">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternative CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-display text-4xl text-[var(--foreground)] mb-4">
            Prefer to see your score first?
          </h2>
          <p className="text-body text-xl mb-8">
            The Commodity Test takes 30 seconds and doesn&apos;t require an email.
            See how generic your messaging is before diving into the guide.
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
            <Link href="/how-it-works" className="text-body hover:text-[var(--accent)]">How it works</Link>
            <Link href="/privacy" className="text-body hover:text-[var(--accent)]">Privacy</Link>
            <Link href="/contact" className="text-body hover:text-[var(--accent)]">Contact</Link>
          </nav>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Run the test →
          </Link>
        </div>
      </footer>
    </main>
  )
}
