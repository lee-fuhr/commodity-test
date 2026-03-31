/**
 * Scoring utility functions for website audits
 *
 * IMPORTANT: There are TWO different score systems:
 *
 * 1. COMMODITY SCORE (0-100, INVERSE - lower is better)
 *    - 0-40: Well differentiated (green)
 *    - 41-60: Needs work (yellow)
 *    - 61-80: Highly generic (orange)
 *    - 81-100: Commodity territory (red)
 *
 * 2. CATEGORY SCORES (0-10, NORMAL - higher is better)
 *    - 7-10: Strong (excellent)
 *    - 5-6: Needs work (moderate)
 *    - 0-4: Critical gap (poor)
 */

import type { ScoreColor, ScoreLevel } from '../types/scoring'

/**
 * Get color for commodity score (0-100, INVERSE)
 * Lower scores are better (less generic)
 */
export function getCommodityScoreColor(score: number): ScoreColor {
  if (!Number.isFinite(score)) return 'red'
  if (score <= 40) return 'green'
  if (score <= 60) return 'yellow'
  if (score <= 80) return 'orange'
  return 'red'
}

/**
 * Get level descriptor for commodity score
 * Maps to ScoreLevel for consistency with category scores
 */
export function getCommodityScoreLevel(score: number): ScoreLevel {
  if (!Number.isFinite(score)) return 'critical'
  if (score <= 40) return 'excellent'
  if (score <= 60) return 'moderate'
  if (score <= 80) return 'poor'
  return 'critical'
}

/**
 * Get human-readable label for commodity score
 */
export function getCommodityScoreLabel(score: number): string {
  if (!Number.isFinite(score)) return 'Invalid score'
  if (score <= 40) return 'Well differentiated'
  if (score <= 60) return 'Needs work'
  if (score <= 80) return 'Highly generic'
  return 'Commodity territory'
}

/**
 * Get detailed description for commodity score
 */
export function getCommodityScoreDescription(score: number): string {
  if (!Number.isFinite(score)) return 'Score calculation error'

  if (score <= 40) {
    return 'Your website stands out from competitors. Keep refining your specific proof points.'
  }
  if (score <= 60) {
    return 'Some differentiation, but too many generic phrases. Buyers might still compare on price.'
  }
  if (score <= 80) {
    return "Your website sounds like most competitors. Buyers can't tell you apart and will default to price."
  }
  return "Your website could be anyone's. You're competing purely on price — and losing to better marketers."
}

/**
 * Get Tailwind text color class for commodity score
 */
export function getCommodityScoreColorClass(score: number): string {
  const color = getCommodityScoreColor(score)
  switch (color) {
    case 'green':
      return 'text-green-600'
    case 'yellow':
      return 'text-yellow-600'
    case 'orange':
      return 'text-orange-500'
    case 'red':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get Tailwind background color class for commodity score
 */
export function getCommodityScoreBgClass(score: number): string {
  const color = getCommodityScoreColor(score)
  switch (color) {
    case 'green':
      return 'bg-green-50'
    case 'yellow':
      return 'bg-yellow-50'
    case 'orange':
      return 'bg-orange-50'
    case 'red':
      return 'bg-red-50'
    default:
      return 'bg-gray-50'
  }
}

/**
 * Get color for individual category scores (0-10, NORMAL)
 * Higher scores are better
 */
export function getCategoryScoreColor(score: number): ScoreLevel {
  if (!Number.isFinite(score)) return 'poor'
  if (score >= 7) return 'excellent'
  if (score >= 5) return 'moderate'
  return 'poor'
}

/**
 * Get human-readable label for category scores
 */
export function getCategoryScoreLabel(score: number): string {
  if (!Number.isFinite(score)) return 'No score'
  if (score >= 7) return 'Strong'
  if (score >= 5) return 'Needs work'
  return 'Critical gap'
}

/**
 * Get Tailwind text color class for category scores
 */
export function getCategoryScoreColorClass(score: number): string {
  const level = getCategoryScoreColor(score)
  switch (level) {
    case 'excellent':
      return 'text-green-600'
    case 'moderate':
      return 'text-yellow-600'
    case 'poor':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get Tailwind background color class for category scores
 */
export function getCategoryScoreBgClass(score: number): string {
  const level = getCategoryScoreColor(score)
  switch (level) {
    case 'excellent':
      return 'bg-green-50'
    case 'moderate':
      return 'bg-yellow-50'
    case 'poor':
      return 'bg-red-50'
    default:
      return 'bg-gray-50'
  }
}
