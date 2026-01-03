'use client'

import { useState } from 'react'

interface SystemInfo {
  url: string
  userAgent: string
  screenSize: string
  viewport: string
  timestamp: string
  timezone: string
  language: string
  platform: string
  tool: string
}

function getSystemInfo(toolName: string): SystemInfo {
  return {
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    screenSize: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
    viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: typeof navigator !== 'undefined' ? navigator.language : '',
    platform: typeof navigator !== 'undefined' ? navigator.platform : '',
    tool: toolName,
  }
}

interface FeedbackWidgetProps {
  toolName: string
}

export default function FeedbackWidget({ toolName }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setStatus('submitting')

    try {
      const systemInfo = getSystemInfo(toolName)

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedback.trim(),
          systemInfo,
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      setStatus('success')
      setFeedback('')

      // Close after showing success
      setTimeout(() => {
        setIsOpen(false)
        setStatus('idle')
      }, 2000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      {/* Trigger button - subtle, bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-[var(--muted)] hover:bg-[var(--accent)] hover:text-white text-[var(--muted-foreground)] text-xs px-3 py-2 transition-colors border border-[var(--border)]"
        aria-label="Report an issue"
      >
        Report issue
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[var(--background)] border-2 border-[var(--border)] p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-section text-xl">Report an issue</h2>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  Found a bug? Something not working?
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {status === 'success' ? (
              <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 p-4 text-center">
                <p className="text-[var(--success)] font-semibold">Thanks! We'll look into it.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Describe what happened, what you expected, and any steps to reproduce..."
                  className="w-full h-32 bg-[var(--muted)] border border-[var(--border)] p-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none focus:outline-none focus:border-[var(--accent)]"
                  disabled={status === 'submitting'}
                  autoFocus
                />

                <p className="text-[var(--muted-foreground)] text-xs mt-2 mb-4">
                  System info (browser, screen size, page URL) will be included automatically.
                </p>

                {status === 'error' && (
                  <p className="text-[var(--danger)] text-sm mb-4">
                    Failed to submit. Please email <a href="mailto:hi@leefuhr.com" className="underline">hi@leefuhr.com</a> directly.
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn-outline flex-1"
                    disabled={status === 'submitting'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-kinetic flex-1"
                    disabled={status === 'submitting' || !feedback.trim()}
                  >
                    {status === 'submitting' ? 'Sending...' : 'Send report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
