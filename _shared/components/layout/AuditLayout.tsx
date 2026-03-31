'use client'

import { useEffect } from 'react'
import { View, ViewType } from '../../types/audit'
import { SidebarNav } from './SidebarNav'

export interface AuditLayoutProps {
  /** Main content to render */
  children: React.ReactNode
  /** Company name for sidebar */
  companyName: string
  /** Hostname for sidebar */
  hostname: string
  /** Current active view */
  currentView: ViewType
  /** Callback when view changes */
  onViewChange: (view: ViewType) => void
  /** List of views for navigation */
  views: View[]
  /** Whether to show lock icons on nav items (for preview mode) */
  isLocked?: boolean
  /** Whether this is a sample report */
  isSample?: boolean
  /** Whether to show download PDF button */
  showDownloadPdf?: boolean
  /** Callback when download PDF is clicked */
  onDownloadPdf?: () => void
  /** Optional top banner content (sample banner, preview banner, etc.) */
  topBanner?: React.ReactNode
  /** Optional bottom CTA for sidebar */
  sidebarBottomCta?: React.ReactNode
}

/**
 * Main layout wrapper for audit reports
 * Composes sidebar navigation with main content area
 * Handles responsive layout (sidebar hidden on mobile)
 * Manages scroll-to-top on view change
 */
export function AuditLayout({
  children,
  companyName,
  hostname,
  currentView,
  onViewChange,
  views,
  isLocked = false,
  isSample = false,
  showDownloadPdf = false,
  onDownloadPdf,
  topBanner,
  sidebarBottomCta
}: AuditLayoutProps) {
  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentView])

  const handleViewChange = (view: ViewType) => {
    onViewChange(view)
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Optional top banner */}
      {topBanner && (
        <div className="fixed top-0 left-0 right-0 z-50">
          {topBanner}
        </div>
      )}

      {/* Sidebar Navigation */}
      <SidebarNav
        companyName={companyName}
        hostname={hostname}
        views={views}
        currentView={currentView}
        onViewChange={handleViewChange}
        isLocked={isLocked}
        showDownloadPdf={showDownloadPdf}
        onDownloadPdf={onDownloadPdf}
        bottomCta={sidebarBottomCta}
      />

      {/* Main content area */}
      <div className={`lg:ml-64 print:!ml-0 ${topBanner ? 'pt-[44px]' : ''}`}>
        {children}
      </div>
    </main>
  )
}
