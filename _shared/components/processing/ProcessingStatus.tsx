'use client'

/**
 * Status message display component
 *
 * @param status - Current processing status
 * @param message - Status message to display
 * @param currentUrl - Optional URL being processed (for crawling state)
 */
interface ProcessingStatusProps {
  status: 'pending' | 'crawling' | 'analyzing' | 'complete' | 'failed'
  message: string
  currentUrl?: string
}

export function ProcessingStatus({
  status,
  message,
  currentUrl
}: ProcessingStatusProps) {
  // Extract path from URL for cleaner display
  const currentPath = currentUrl
    ? (() => {
        try {
          return new URL(currentUrl).pathname || '/'
        } catch {
          return currentUrl
        }
      })()
    : ''

  return (
    <>
      {/* Current URL when crawling */}
      {currentPath && status === 'crawling' && (
        <div className="bg-[var(--muted)] px-4 py-3 mb-6 font-mono text-sm text-center rounded">
          <span className="text-[var(--muted-foreground)]">Scanning:</span>{' '}
          <span className="text-[var(--foreground)]">{currentPath}</span>
        </div>
      )}

      {/* Status message when analyzing */}
      {status === 'analyzing' && message && (
        <p className="text-body text-lg text-center mb-6">{message}</p>
      )}
    </>
  )
}
