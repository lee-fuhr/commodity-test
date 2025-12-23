'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface UrlInputProps {
  onSubmit?: (url: string) => void
}

export function UrlInput({ onSubmit }: UrlInputProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateUrl = (input: string): string | null => {
    let normalized = input.trim()

    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized
    }

    try {
      const parsed = new URL(normalized)
      if (!parsed.hostname.includes('.')) {
        return null
      }
      return normalized
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const validUrl = validateUrl(url)
    if (!validUrl) {
      setError('Please enter a valid website URL')
      return
    }

    setIsLoading(true)

    if (onSubmit) {
      onSubmit(validUrl)
    } else {
      // Navigate to processing page with URL
      router.push(`/processing?url=${encodeURIComponent(validUrl)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
      <div className="space-y-4">
        {/* Input field */}
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError('')
            }}
            placeholder="https://yourcompany.com"
            className={`input pl-12 ${error ? 'input-error' : ''}`}
            disabled={isLoading}
            aria-label="Website URL"
            aria-describedby={error ? 'url-error' : undefined}
          />
          {/* Globe icon */}
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>

        {/* Error message */}
        {error && (
          <p id="url-error" className="text-score-critical text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {/* Submit button - larger on mobile for touch */}
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="btn-primary w-full shadow-xl min-h-[52px] md:min-h-[48px] text-lg md:text-base"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Run the test'
          )}
        </button>

        {/* Screen reader announcement for loading state */}
        <div role="status" aria-live="polite" className="sr-only">
          {isLoading && 'Analyzing your website, please wait...'}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-brand-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            30 seconds
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            No email required
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Free forever
          </span>
        </div>
      </div>
    </form>
  )
}
