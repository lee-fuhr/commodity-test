/**
 * Shared types for audit layout components
 */

/** View types for the audit navigation */
export type ViewType = 'overview' | 'message' | 'audience' | 'trust' | 'copy'

/** View definition with label and optional description */
export interface View {
  id: ViewType
  label: string
  description?: string
}

/** Teaser finding to show in locked state */
export interface TeaserFinding {
  phrase: string
  problem: string
  rewrite: string
  location: string
  pageUrl?: string
}

/** Score category for detail modal */
export interface ScoreCategory {
  key: string
  label: string
  question: string
}
