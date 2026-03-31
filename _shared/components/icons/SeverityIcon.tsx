/**
 * Severity indicator icons for issues/findings
 * Uses emoji indicators for visual distinction
 */

import React from 'react'
import type { Severity } from '../../types/scoring'

interface SeverityIconProps {
  severity: Severity
  className?: string
}

/**
 * Get emoji for severity level
 */
export function getSeverityEmoji(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return '🔴'
    case 'warning':
      return '🟡'
    case 'info':
      return '🟢'
    default:
      return '⚪'
  }
}

/**
 * Severity icon component
 * Renders emoji indicator for issue severity
 */
export function SeverityIcon({ severity, className }: SeverityIconProps) {
  const emoji = getSeverityEmoji(severity)

  return (
    <span className={className} role="img" aria-label={`${severity} severity`}>
      {emoji}
    </span>
  )
}

/**
 * Get Tailwind background color class for severity
 */
export function getSeverityBgClass(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100'
    case 'warning':
      return 'bg-yellow-100'
    case 'info':
      return 'bg-green-100'
    default:
      return 'bg-gray-100'
  }
}

/**
 * Get Tailwind text color class for severity
 */
export function getSeverityTextClass(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'text-red-700'
    case 'warning':
      return 'text-yellow-700'
    case 'info':
      return 'text-green-700'
    default:
      return 'text-gray-700'
  }
}

/**
 * Get human-readable label for severity
 */
export function getSeverityLabel(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'Critical'
    case 'warning':
      return 'Warning'
    case 'info':
      return 'Info'
    default:
      return 'Unknown'
  }
}
