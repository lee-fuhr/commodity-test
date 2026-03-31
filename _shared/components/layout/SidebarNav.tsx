'use client'

import { View, ViewType } from '../../types/audit'

// View icons (Streamline-style, 1px stroke)
const viewIcons: Record<ViewType, React.ReactNode> = {
  overview: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  message: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  audience: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  trust: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  copy: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
}

export interface SidebarNavProps {
  /** Company name to display */
  companyName: string
  /** Hostname to display */
  hostname: string
  /** List of views to display */
  views: View[]
  /** Current active view */
  currentView: ViewType
  /** Callback when view changes */
  onViewChange: (view: ViewType) => void
  /** Whether to show lock icons on nav items (for preview mode) */
  isLocked?: boolean
  /** Whether to show download PDF button */
  showDownloadPdf?: boolean
  /** Callback when download PDF is clicked */
  onDownloadPdf?: () => void
  /** Optional bottom CTA content */
  bottomCta?: React.ReactNode
}

/**
 * Dark side navigation bar
 * Appears on desktop (w-64, fixed left)
 * Shows company name/hostname, view list with icons, optional lock icons, download PDF, and bottom CTA
 */
export function SidebarNav({
  companyName,
  hostname,
  views,
  currentView,
  onViewChange,
  isLocked = false,
  showDownloadPdf = false,
  onDownloadPdf,
  bottomCta
}: SidebarNavProps) {
  return (
    <nav className="hidden lg:block print:!hidden fixed top-0 left-0 w-64 h-screen bg-[var(--accent)] text-white p-8 overflow-y-auto z-40 flex flex-col">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-wider opacity-60 mb-1">
          {isLocked ? 'Audit for' : 'Sample audit for'}
        </p>
        <button
          onClick={() => onViewChange('overview')}
          className="font-semibold text-lg text-left hover:underline w-full capitalize"
        >
          {companyName}
        </button>
        <p className="text-xs opacity-60 font-mono mt-1">{hostname}</p>
      </div>

      <ul className="space-y-1 flex-1">
        {views.map((view) => {
          const shouldShowLock = isLocked && view.id !== 'overview'
          return (
            <li key={view.id}>
              <button
                onClick={() => onViewChange(view.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onViewChange(view.id)
                  }
                }}
                tabIndex={0}
                aria-current={currentView === view.id ? 'page' : undefined}
                className={`w-full text-left py-3 px-4 text-sm transition-all flex items-center gap-3 ${
                  currentView === view.id
                    ? 'bg-white/20 font-semibold'
                    : 'opacity-70 hover:opacity-100 hover:bg-white/10'
                }`}
              >
                {shouldShowLock ? (
                  <span className="text-xs opacity-60">🔒</span>
                ) : (
                  viewIcons[view.id]
                )}
                {view.label}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto pt-8 border-t border-white/20 print:hidden">
        {showDownloadPdf && (
          <div className="relative group mb-4">
            <button
              onClick={onDownloadPdf}
              disabled={isLocked}
              className={`w-full py-3 px-4 text-sm transition-all flex items-center justify-center gap-2 ${
                isLocked
                  ? 'bg-white/10 opacity-60 cursor-default'
                  : 'bg-white text-[var(--accent)] font-bold hover:bg-white/90'
              }`}
            >
              {isLocked && '🔒 '}Download PDF
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </button>
            {isLocked && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Included with full purchase
              </div>
            )}
          </div>
        )}

        {bottomCta}
      </div>
    </nav>
  )
}
