/**
 * Scoring types for website audits
 */

export type ScoreColor = 'green' | 'yellow' | 'orange' | 'red'
export type ScoreLevel = 'excellent' | 'moderate' | 'poor' | 'critical'
export type Severity = 'critical' | 'warning' | 'info'

export interface ScoreCategory {
  key: string
  label: string
  question: string
}

/**
 * Standard score categories used across all audits
 */
export const scoreCategories: ScoreCategory[] = [
  {
    key: 'firstImpression',
    label: 'First impression',
    question: 'Can visitors understand what you do in 5 seconds?',
  },
  {
    key: 'differentiation',
    label: 'Differentiation',
    question: 'Do you stand out from competitors?',
  },
  {
    key: 'customerClarity',
    label: 'Ideal customer clarity',
    question: 'Is your ideal customer obvious?',
  },
  {
    key: 'storyStructure',
    label: 'Story structure',
    question: 'Do you have a compelling narrative?',
  },
  {
    key: 'trustSignals',
    label: 'Proof & credibility',
    question: 'Can visitors verify your claims?',
  },
  {
    key: 'buttonClarity',
    label: 'Button clarity',
    question: 'Is the next step obvious and compelling?',
  },
]
