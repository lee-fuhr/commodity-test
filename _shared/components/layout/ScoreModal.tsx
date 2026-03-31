'use client'

import { useEffect } from 'react'
import { ScoreCategory } from '../../types/audit'

export interface ScoreModalProps {
  /** Score category to display */
  category: ScoreCategory
  /** Callback when user closes the modal */
  onClose: () => void
  /** Callback when user clicks unlock button */
  onUnlock: () => void
  /** Optional score if unlocked */
  score?: number
  /** Whether content is locked (default: true) */
  isLocked?: boolean
}

/**
 * Score detail modal
 * Shows locked state or actual scores
 * Displays how score is calculated, evidence preview, and how to improve
 */
export function ScoreModal({
  category,
  onClose,
  onUnlock,
  score,
  isLocked = true
}: ScoreModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-10" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60" />
      <div
        className="relative bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-[var(--accent)] rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b-2 border-[var(--border)] p-8 md:p-10 z-20">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-3xl leading-none"
          >
            ×
          </button>
          <p className="text-label mb-3">{category.label}</p>
          <div className="flex items-baseline gap-3">
            {isLocked ? (
              <>
                <span className="text-5xl font-bold text-[var(--muted-foreground)]">?</span>
                <span className="text-xl text-[var(--muted-foreground)]">/10</span>
                <span className="text-lg font-semibold text-[var(--muted-foreground)]">Score locked</span>
              </>
            ) : (
              <>
                <span className="text-5xl font-bold text-[var(--accent)]">{score}</span>
                <span className="text-xl text-[var(--muted-foreground)]">/10</span>
              </>
            )}
          </div>
          <p className="text-body mt-3 text-[var(--muted-foreground)]">{category.question}</p>
        </div>

        <div className="p-8 md:p-10 space-y-8">
          {/* Scoring factors preview */}
          <div>
            <h3 className="text-subsection mb-4">How this score is calculated</h3>
            {isLocked ? (
              <div className="bg-[var(--muted)] border-2 border-dashed border-[var(--border)] p-6 text-center">
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  4 scoring factors with individual breakdowns
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">🔒 Unlock to see your scores</p>
              </div>
            ) : (
              <div className="bg-white border-2 border-[var(--border)] p-6">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Detailed scoring breakdown shown here when unlocked
                </p>
              </div>
            )}
          </div>

          {/* Evidence preview */}
          <div>
            <h3 className="text-subsection mb-4">What we found on your site</h3>
            {isLocked ? (
              <div className="bg-[var(--muted)] border-2 border-dashed border-[var(--border)] p-6 text-center">
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  Specific examples from your homepage, about page, and services
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">🔒 Unlock to see evidence</p>
              </div>
            ) : (
              <div className="bg-white border-2 border-[var(--border)] p-6">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Specific evidence from site shown here when unlocked
                </p>
              </div>
            )}
          </div>

          {/* How to improve preview */}
          <div>
            <h3 className="text-subsection mb-4">How to improve this score</h3>
            {isLocked ? (
              <div className="bg-[var(--muted)] border-2 border-dashed border-[var(--border)] p-6 text-center">
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  3 specific actions ranked by effort
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">🔒 Unlock to see recommendations</p>
              </div>
            ) : (
              <div className="bg-white border-2 border-[var(--border)] p-6">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Actionable recommendations shown here when unlocked
                </p>
              </div>
            )}
          </div>

          {/* Copy you can use */}
          <div className="bg-[var(--muted)] p-4 border-l-4 border-[var(--accent)]">
            <h3 className="text-subsection mb-2">Copy you can use</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              {isLocked ? '🔒 Ready-to-paste replacement text included in full audit' : 'Ready-to-paste replacement text shown here'}
            </p>
          </div>

          {/* Unlock button */}
          {isLocked && (
            <button
              onClick={onUnlock}
              className="w-full bg-[var(--accent)] text-white py-4 font-bold hover:opacity-90 transition-opacity"
            >
              Unlock full audit — $400
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
