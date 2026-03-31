'use client'

import { ViewType } from '../../types/audit'

export interface ViewNavBarProps {
  /** Next view to navigate to (null if on last view) */
  nextView: { id: ViewType; label: string } | null
  /** Callback when user clicks next button */
  onNavigate: (view: ViewType) => void
}

/**
 * Bottom navigation bar that shows next section button
 * Simple right-aligned next navigation
 */
export function ViewNavBar({ nextView, onNavigate }: ViewNavBarProps) {
  return (
    <nav className="bg-[#0a0a0a] text-white print:hidden">
      <div className="container py-3">
        <div className="flex items-center justify-end">
          {nextView && (
            <button
              onClick={() => onNavigate(nextView.id)}
              className="flex items-center gap-2 text-sm hover:text-white/80 transition-colors"
            >
              {nextView.label}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
