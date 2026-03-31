/**
 * View navigation icons for audit pages
 * Streamline-style icons with 1px stroke
 */

import React from 'react'

export type ViewType = 'overview' | 'message' | 'audience' | 'trust' | 'copy'

interface IconProps {
  className?: string
}

/**
 * Overview icon - grid/dashboard layout
 */
export function OverviewIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

/**
 * Message icon - chat/communication bubble
 */
export function MessageIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

/**
 * Audience icon - target/bullseye
 */
export function AudienceIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

/**
 * Trust icon - shield with checkmark
 */
export function TrustIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

/**
 * Copy icon - document/clipboard
 */
export function CopyIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

/**
 * Map of all view icons by type
 * Use this for dynamic icon rendering based on view type
 */
export const viewIcons: Record<ViewType, React.ReactNode> = {
  overview: <OverviewIcon />,
  message: <MessageIcon />,
  audience: <AudienceIcon />,
  trust: <TrustIcon />,
  copy: <CopyIcon />,
}

/**
 * Get icon component for a view type
 * @param type - View type
 * @param className - Optional CSS class for icon
 * @returns Icon component
 */
export function getViewIcon(type: ViewType, className?: string): React.ReactNode {
  switch (type) {
    case 'overview':
      return <OverviewIcon className={className} />
    case 'message':
      return <MessageIcon className={className} />
    case 'audience':
      return <AudienceIcon className={className} />
    case 'trust':
      return <TrustIcon className={className} />
    case 'copy':
      return <CopyIcon className={className} />
    default:
      return null
  }
}
