'use client'

import { useState } from 'react'

interface Props {
  resultId: string
  companyName: string
}

export function EmailCapture({ resultId, companyName }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/email-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resultId, companyName }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send')
      }

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-900/30 border border-green-700/50 p-4 text-center">
        <p className="text-green-400 font-medium">Check your inbox.</p>
        <p className="text-green-400/80 text-sm mt-1">We sent a link to this report to {email}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--muted)] p-4">
      <label htmlFor="email-capture" className="text-[var(--foreground)] font-medium text-sm mb-3 block">
        Email me this report
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="email-capture"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent)]"
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {status === 'loading' ? 'Sending...' : 'Email me'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2">{errorMessage}</p>
      )}
      <p className="text-[var(--muted-foreground)] text-xs mt-2">
        We&apos;ll send you a link. Results expire in 30 days.
      </p>
    </form>
  )
}
