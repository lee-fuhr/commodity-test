'use client'

import { TeaserFinding } from '../../types/audit'

export interface LockedFindingsProps {
  /** Callback when user clicks unlock button */
  onUnlock: () => void
  /** Whether to show a teaser finding (default: false) */
  showTeaser?: boolean
  /** Optional teaser finding to display */
  teaserFinding?: TeaserFinding
  /** Price to display (default: 400) */
  price?: number
}

/**
 * Locked content paywall component
 * Shows teaser rewrite when showTeaser is true
 * Dashed border locked state with unlock CTA button
 */
export function LockedFindings({
  onUnlock,
  showTeaser = false,
  teaserFinding,
  price = 400
}: LockedFindingsProps) {
  return (
    <div className="my-6">
      {/* Show REAL teaser rewrite from THIS site's analysis */}
      {showTeaser && teaserFinding && (
        <div className="mb-4 p-4 bg-white border-2 border-[var(--accent)] rounded">
          <p className="text-xs font-bold text-[var(--accent)] mb-3">REAL FINDING FROM YOUR SITE:</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-red-50 border-l-4 border-red-400">
              <p className="text-xs font-bold text-red-600 mb-1">❌ ON YOUR SITE NOW</p>
              <p className="text-sm italic text-[var(--foreground)]">{teaserFinding.phrase}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-2">
                Found: {teaserFinding.location}
              </p>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-500">
              <p className="text-xs font-bold text-green-600 mb-1">✓ SUGGESTED REWRITE</p>
              <p className="text-sm text-[var(--foreground)]">{teaserFinding.rewrite}</p>
            </div>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] mt-3 p-2 bg-[var(--muted)] rounded">
            <strong>Why this matters:</strong> {teaserFinding.problem}
          </p>

          <p className="text-xs text-[var(--accent)] font-medium mt-3">
            Your full audit includes 15-20 rewrites like this, all specific to YOUR site.
          </p>
        </div>
      )}

      {/* Fallback if no teaser (shouldn't happen with real analysis) */}
      {showTeaser && !teaserFinding && (
        <div className="mb-4 p-4 bg-[var(--muted)] border-2 border-[var(--border)] rounded">
          <p className="text-xs font-bold text-[var(--muted-foreground)] mb-2">SAMPLE REWRITE:</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            The full audit includes 15-20 specific rewrites from YOUR site&apos;s actual copy.
          </p>
        </div>
      )}

      <div className="p-6 bg-[var(--muted)] border-2 border-dashed border-[var(--border)] text-center">
        <div className="max-w-md mx-auto">
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">
            Full findings locked
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Includes all phrases from YOUR site, why they&apos;re hurting you, and copy-paste replacements you can implement yourself in Squarespace, WordPress, or any website builder.
          </p>
          <button
            onClick={onUnlock}
            aria-label={`Unlock full audit for $${price}`}
            className="bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Unlock full audit — ${price}
          </button>
        </div>
      </div>
    </div>
  )
}
