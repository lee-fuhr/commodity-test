'use client'

import { useState, useEffect } from 'react'
import { ProcessingProgress } from './ProcessingProgress'
import { ProcessingStatus } from './ProcessingStatus'
import { ProcessingChecklist } from './ProcessingChecklist'
import { AnimatedCounter } from './AnimatedCounter'

/**
 * Reusable processing page component for LFI tools
 *
 * Handles:
 * - Status polling with configurable interval
 * - Progress visualization
 * - Optional enrichment fields (LinkedIn, competitors, email)
 * - Customizable checklist
 * - Results-ready state with reveal button
 * - Error states
 */

export interface ChecklistItem {
  label: string
  progressThreshold: number
}

export interface ProcessingPageProps {
  // Core state
  analysisId: string
  progress: number
  status: 'pending' | 'crawling' | 'analyzing' | 'complete' | 'failed'
  message: string

  // Metrics (for counter display)
  itemsProcessed?: number
  itemsProcessedLabel?: string

  // Optional current URL (for crawling display)
  currentUrl?: string

  // Optional enrichment fields
  showLinkedInField?: boolean
  showCompetitorsField?: boolean
  showEmailField?: boolean

  // Callbacks
  onComplete: (analysisId: string) => void
  onError: (error: string) => void
  onRetry?: () => void

  // API polling
  apiEndpoint: string
  pollInterval?: number

  // Customization
  checklistItems?: ChecklistItem[]
  title?: string
  subtitle?: string
  completionTitle?: string
  completionMessage?: string
  completionButtonText?: string
  checklistTitle?: string
  checklistSubtitle?: string

  // Processed items list (optional)
  processedItems?: string[]
  processedItemsLabel?: string
}

export function ProcessingPage({
  analysisId,
  progress: initialProgress,
  status: initialStatus,
  message: initialMessage,
  itemsProcessed = 0,
  itemsProcessedLabel = 'pages scanned',
  currentUrl,
  showLinkedInField = false,
  showCompetitorsField = false,
  showEmailField = false,
  onComplete,
  onError,
  onRetry,
  apiEndpoint,
  pollInterval = 800,
  checklistItems = [],
  title = 'Scanning your website',
  subtitle = 'This takes 1-2 minutes. Add optional context below while you wait.',
  completionTitle = 'Results ready!',
  completionMessage,
  completionButtonText = 'Show me my results →',
  checklistTitle = "WHAT WE'RE DOING",
  checklistSubtitle,
  processedItems = [],
  processedItemsLabel = 'PAGES FOUND'
}: ProcessingPageProps) {
  // State management
  const [progress, setProgress] = useState(initialProgress)
  const [status, setStatus] = useState(initialStatus)
  const [message, setMessage] = useState(initialMessage)
  const [currentProcessingUrl, setCurrentProcessingUrl] = useState(currentUrl)
  const [itemCount, setItemCount] = useState(itemsProcessed)
  const [items, setItems] = useState<string[]>(processedItems)
  const [error, setError] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  // Optional enrichment fields
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [email, setEmail] = useState('')

  // Status polling
  useEffect(() => {
    let isMounted = true
    let pollTimeout: NodeJS.Timeout

    const pollStatus = async () => {
      if (!isMounted) return

      try {
        const response = await fetch(`${apiEndpoint}?id=${analysisId}`)
        const result = await response.json()

        if (!isMounted) return

        if (!result.success) {
          const errorMessage =
            response.status === 404
              ? 'Analysis not found. Please try again.'
              : result.error || 'Something went wrong.'
          setError(errorMessage)
          onError(errorMessage)
          return
        }

        const analysis = result.analysis

        // Update state
        setProgress(analysis.progress)
        setMessage(analysis.message)
        setStatus(analysis.status)
        if (analysis.currentUrl) setCurrentProcessingUrl(analysis.currentUrl)
        if (analysis.pagesCrawled !== undefined) setItemCount(analysis.pagesCrawled)
        if (analysis.pagesFound !== undefined) setItemCount(analysis.pagesFound)
        if (analysis.crawledPages) setItems(analysis.crawledPages)

        // Handle completion
        if (analysis.status === 'complete') {
          setIsComplete(true)
        } else if (analysis.status === 'failed') {
          const failureMessage = analysis.message || 'Analysis failed. Please try again.'
          setError(failureMessage)
          onError(failureMessage)
        } else if (isMounted) {
          // Continue polling
          pollTimeout = setTimeout(pollStatus, pollInterval)
        }
      } catch {
        // Retry on network errors
        if (isMounted) {
          pollTimeout = setTimeout(pollStatus, 2000)
        }
      }
    }

    pollStatus()

    return () => {
      isMounted = false
      if (pollTimeout) {
        clearTimeout(pollTimeout)
      }
    }
  }, [analysisId, apiEndpoint, pollInterval, onError])

  // ERROR STATE
  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-section text-2xl text-[var(--foreground)] mb-4">
            Something went wrong
          </h1>
          <p className="text-body mb-6">{error}</p>
          <button
            onClick={onRetry || (() => window.location.href = '/')}
            className="bg-[var(--accent)] text-white px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  // RESULTS READY STATE
  if (isComplete) {
    const defaultCompletionMessage = `We scanned ${itemCount} ${itemsProcessedLabel.replace('scanned', 'pages')} and found messaging issues you can fix.`

    return (
      <main className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✓</span>
            </div>
            <h1 className="text-section text-4xl text-[var(--foreground)] mb-4">
              {completionTitle}
            </h1>
            <p className="text-body-lg text-[var(--muted-foreground)]">
              {completionMessage || defaultCompletionMessage}
            </p>
          </div>

          <button
            onClick={() => onComplete(analysisId)}
            className="bg-[var(--accent)] text-white px-10 py-5 text-xl font-bold hover:opacity-90 transition-opacity mb-8"
          >
            {completionButtonText}
          </button>

          <p className="text-sm text-[var(--muted-foreground)]">
            Your free preview includes your commodity score, top issues, and one real rewrite from your site.
          </p>
        </div>
      </main>
    )
  }

  // PROCESSING STATE
  return (
    <main className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-section text-3xl text-[var(--foreground)] mb-2">
            {title}
          </h1>
          <p className="text-body text-[var(--muted-foreground)]">{subtitle}</p>
        </div>

        {/* Optional Enrichment Fields */}
        {(showLinkedInField || showCompetitorsField || showEmailField) && (
          <div className="grid md:grid-cols-3 gap-4 mb-8 p-6 bg-[var(--muted)] border border-[var(--border)]">
            {/* LinkedIn URL */}
            {showLinkedInField && (
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-2">
                  YOUR LINKEDIN (OPTIONAL)
                </label>
                <input
                  type="url"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  placeholder="linkedin.com/company/..."
                  className="w-full px-3 py-2 bg-white border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] text-sm"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  We&apos;ll try to find it automatically
                </p>
              </div>
            )}

            {/* Competitors */}
            {showCompetitorsField && (
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-2">
                  COMPETITORS TO BEAT
                </label>
                <div className="px-3 py-2 bg-white/50 border border-[var(--border)] text-sm text-[var(--muted-foreground)] h-[38px] flex items-center">
                  Included in full audit
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  After purchase, add 2-3 competitors
                </p>
              </div>
            )}

            {/* Email */}
            {showEmailField && (
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] mb-2">
                  EMAIL FOR RESULTS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3 py-2 bg-white border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] text-sm"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Get your results link emailed
                </p>
              </div>
            )}
          </div>
        )}

        {/* Main Progress Area */}
        <div className="max-w-lg mx-auto">
          {/* Spinner */}
          <div className="text-center mb-8">
            <img src="/spinner.gif" alt="Loading" className="w-12 h-12 mx-auto" />
          </div>

          {/* Progress bar */}
          <ProcessingProgress progress={progress} showPercentage={true} />

          {/* Status message */}
          <ProcessingStatus
            status={status}
            message={message}
            currentUrl={currentProcessingUrl}
          />

          {/* Items processed counter */}
          {itemCount > 0 && (
            <div className="text-center mb-8">
              <AnimatedCounter
                value={itemCount}
                className="text-5xl font-bold text-[var(--foreground)]"
              />
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                {itemsProcessedLabel}
              </p>
            </div>
          )}

          {/* Processed items list */}
          {items.length > 0 && (
            <div className="bg-[var(--muted)] p-4 text-left mb-8 max-h-40 overflow-y-auto rounded">
              <p className="text-label mb-3">{processedItemsLabel}</p>
              <ul className="space-y-1 text-sm font-mono">
                {items.slice(-6).map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-[var(--success)]">✓</span>
                    <span className="text-[var(--muted-foreground)] truncate">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist */}
          {checklistItems.length > 0 && (
            <ProcessingChecklist
              items={checklistItems}
              progress={progress}
              title={checklistTitle}
              subtitle={checklistSubtitle}
            />
          )}
        </div>
      </div>
    </main>
  )
}
