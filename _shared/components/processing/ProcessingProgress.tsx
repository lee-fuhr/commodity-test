'use client'

/**
 * Progress bar with optional percentage display
 *
 * @param progress - Progress value from 0-100
 * @param showPercentage - Whether to show the percentage text below the bar (default: true)
 */
interface ProcessingProgressProps {
  progress: number
  showPercentage?: boolean
}

export function ProcessingProgress({
  progress,
  showPercentage = true
}: ProcessingProgressProps) {
  return (
    <div>
      {/* Progress bar */}
      <div
        className="h-3 bg-[var(--border)] mb-4 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Analysis progress"
      >
        <div
          className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>

      {/* Percentage display */}
      {showPercentage && (
        <p className="text-center text-[var(--muted-foreground)] mb-6">
          {Math.round(progress)}% complete
        </p>
      )}
    </div>
  )
}
