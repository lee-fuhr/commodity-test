'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type FormType = 'quote' | 'retainer'

const formConfig = {
  quote: {
    title: 'Let's scope your project',
    subtitle: 'Tell me about what you're building. I'll review and we'll schedule a call to discuss.',
    fields: [
      { name: 'name', label: 'Your name', type: 'text', required: true },
      { name: 'email', label: 'Work email', type: 'email', required: true },
      { name: 'company', label: 'Company name', type: 'text', required: true },
      { name: 'website', label: 'Current website (if any)', type: 'url', required: false },
      { name: 'pages', label: 'Estimated number of pages', type: 'select', required: true, options: ['6–8 pages', '9–12 pages', '13–20 pages', '20+ pages', 'Not sure yet'] },
      { name: 'timeline', label: 'Ideal timeline', type: 'select', required: true, options: ['ASAP (rush)', '2–3 months', '3–6 months', 'Flexible'] },
      { name: 'context', label: 'What's driving this project?', type: 'textarea', required: true, placeholder: 'Rebrand? New product launch? Site just feels dated? The more context, the better.' },
    ],
  },
  retainer: {
    title: 'Let's talk ongoing partnership',
    subtitle: 'Tell me where you are and what you're trying to accomplish. I'll review and we'll schedule a call.',
    fields: [
      { name: 'name', label: 'Your name', type: 'text', required: true },
      { name: 'email', label: 'Work email', type: 'email', required: true },
      { name: 'company', label: 'Company name', type: 'text', required: true },
      { name: 'website', label: 'Current website', type: 'url', required: true },
      { name: 'role', label: 'Your role', type: 'text', required: true, placeholder: 'e.g., Marketing Director, CEO, Owner' },
      { name: 'challenge', label: 'What's your biggest messaging/marketing challenge right now?', type: 'textarea', required: true },
      { name: 'goals', label: 'What would success look like in 6 months?', type: 'textarea', required: true },
    ],
  },
}

function ContactFormContent() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as FormType | null
  const [formType, setFormType] = useState<FormType>(typeParam === 'retainer' ? 'retainer' : 'quote')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeParam === 'retainer' || typeParam === 'quote') {
      setFormType(typeParam)
    }
  }, [typeParam])

  const config = formConfig[formType]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Validate required fields
    const missingFields = config.fields
      .filter(f => f.required && !formData[f.name])
      .map(f => f.label)

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`)
      setIsSubmitting(false)
      return
    }

    // Basic email validation
    if (formData.email && !formData.email.includes('@')) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      // TODO: Send to backend/email service
      // For now, simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <header className="border-b border-[var(--border)] py-4 px-6">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-section text-lg text-[var(--foreground)]">
              The Commodity Test
            </Link>
          </div>
        </header>

        <section className="py-24 px-6">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-[var(--accent-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-display text-4xl text-[var(--foreground)] mb-4">
              Got it. I'll be in touch.
            </h1>
            <p className="text-body text-xl mb-8">
              I review every submission personally. Expect a reply within 1–2 business days.
            </p>
            <p className="text-body mb-8">
              Want to skip ahead? Schedule a call now:
            </p>
            <a
              href="https://cal.com/leefuhr/30i"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kinetic inline-flex"
            >
              Schedule 30-min call
            </a>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-section text-lg text-[var(--foreground)]">
            The Commodity Test
          </Link>
          <Link href="/pricing" className="text-body hover:text-[var(--accent)]">
            ← Back to pricing
          </Link>
        </div>
      </header>

      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Form type toggle */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setFormType('quote')}
              className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
                formType === 'quote'
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                  : 'border-2 border-[var(--border)] text-body hover:border-[var(--accent)]'
              }`}
            >
              Custom project
            </button>
            <button
              onClick={() => setFormType('retainer')}
              className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
                formType === 'retainer'
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                  : 'border-2 border-[var(--border)] text-body hover:border-[var(--accent)]'
              }`}
            >
              Retainer
            </button>
          </div>

          <h1 className="text-display text-4xl text-[var(--foreground)] mb-4">
            {config.title}
          </h1>
          <p className="text-body text-xl mb-12">
            {config.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {config.fields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-label mb-2">
                  {field.label} {field.required && '*'}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full bg-[var(--muted)] border-2 border-[var(--border)] text-[var(--foreground)] px-4 py-3 focus:border-[var(--accent)] focus:outline-none resize-none"
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full bg-[var(--muted)] border-2 border-[var(--border)] text-[var(--foreground)] px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-[var(--muted)] border-2 border-[var(--border)] text-[var(--foreground)] px-4 py-3 focus:border-[var(--accent)] focus:outline-none"
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="bg-red-500/10 border-2 border-red-500 text-red-400 p-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-kinetic w-full text-lg"
            >
              {isSubmitting ? 'Sending...' : 'Send it over'}
            </button>

            <p className="text-body text-sm text-center">
              I read every submission. No sales team, no autoresponders—just me.
            </p>
          </form>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-body text-sm">
            Prefer to just talk? <a href="https://cal.com/leefuhr/30i" className="text-[var(--accent)] hover:underline">Schedule a call directly</a>
          </p>
        </div>
      </footer>
    </main>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-body">Loading...</p>
      </main>
    }>
      <ContactFormContent />
    </Suspense>
  )
}
