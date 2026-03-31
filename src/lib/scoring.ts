import { INDUSTRY_COPY } from './industry-copy'
import { commodityPhrases as commodityPhrasesData, INDUSTRY_KEYWORDS, INDUSTRY_STRONG_DECLARATIONS } from './scoring-data'

// Scoring algorithm: Bell curve centered at 50
//
// Philosophy:
// - Score 50 = average B2B manufacturer website
// - Score 0-30 = heavily commoditized (generic jargon, no proof)
// - Score 30-50 = below average (some commodity phrases, weak differentiation)
// - Score 50-70 = above average (fewer commodities, some proof points)
// - Score 70-85 = well differentiated (specific claims, real proof)
// - Score 85-95 = excellent (strong proof, unique positioning)
// - Score 96-100 = exceptional (extremely rare, requires extraordinary proof)
//
// A score of 100 should be nearly impossible - like getting a perfect SAT.
// It requires: zero commodity phrases + strong differentiation signals + verifiable proof

export interface DetectedPhrase {
  phrase: string
  weight: number
  category: string
  location: string
  context?: string
}

export interface DifferentiationSignal {
  type: 'stat' | 'proof' | 'unique' | 'specific' | 'claim'
  value: string
  strength: number // 1-10
  location: string
}

export interface ScoringResult {
  score: number
  commodityPenalty: number
  differentiationBonus: number
  baseScore: number
  analysis: {
    totalCommodityPhrases: number
    totalDifferentiationSignals: number
    heaviestCommodities: string[]
    strongestDifferentiators: string[]
  }
}

// Re-exported from scoring-data.ts for backwards compatibility
export { commodityPhrases } from './scoring-data'

// Patterns that indicate differentiation (specific, provable claims)
// NOTE: Patterns are intentionally broad to catch real-world variations
const DIFFERENTIATION_PATTERNS = {
  // Specific years - flexible matching
  yearsInBusiness: /(?:since|founded|established|serving|started)\s*(?:in\s*)?\b(19|20)\d{2}\b/i,
  specificYears: /\b(\d{2,3})\+?\s*years?\b/i, // Just "X years" - very broad
  decadesInBusiness: /\b(?:over|more than)?\s*(\d+)\s*decades?\b/i,

  // Counts - flexible matching
  clientCount: /\b(\d{1,3}(?:,\d{3})*|\d+k|\d+\+)\s*(?:clients?|customers?|companies|businesses|partners?)/i,
  projectCount: /\b(\d{1,3}(?:,\d{3})*|\d+k|\d+\+)\s*(?:projects?|installations?|implementations?|deployments?|builds?)/i,
  employeeCount: /\b(\d{1,3}(?:,\d{3})*|\d+)\+?\s*(?:employees?|team members?|associates?|professionals?|people|staff)/i,
  locationCount: /\b(\d{1,3})\+?\s*(?:locations?|offices?|facilities|warehouses?|distribution centers?|branches)/i,
  countryCount: /\b(\d{1,3})\+?\s*(?:countries?|nations?|states?|markets?|regions?)/i,

  // Statistics - more flexible
  percentages: /\b(\d{1,3}(?:\.\d+)?)\s*%/i, // Any percentage
  dollarAmounts: /\$\s*[\d,]+(?:\.\d{2})?\s*(?:million|billion|M|B|k|K|s|savings?)?/i, // $X, $Xk, $Xs, $X million, etc.
  numbersWithContext: /\b(\d{1,3}(?:,\d{3})+)\b/i, // Large numbers with commas (1,000+)
  rankings: /#\s*\d+|(?:top|largest|biggest|leading)\s*\d+|(?:ranked|rated)\s*(?:#\s*)?\d+/i,

  // Proof points - broader matching
  namedClients: /(?:serving|trusted by|clients include|working with|partnered with|used by)\s+[A-Z][a-zA-Z\s&]+/i,
  awards: /\b(?:award|winner|awarded|recognized|certified|accredited|finalist|honoree|recipient)\b/i,
  patents: /\b(?:patented|patent-pending|patent pending|\d+\s*patents?|proprietary technology)\b/i,
  certifications: /\b(?:ISO|AS9100|IATF|FDA|CE|UL|CSA|NADCAP|API|SOC|HIPAA|PCI|CMMC)\s*\d*/i, // Just needs cert name

  // Unique claims
  firstTo: /\bfirst\s+(?:to|in|company|manufacturer|provider)/i,
  onlyCompany: /\b(?:only|sole)\s+(?:company|provider|manufacturer|supplier)/i,
  uniqueProcess: /\b(?:proprietary|exclusive|our own|in-house|custom-built)\s+(?:process|method|technology|system|approach|solution)/i,
  specialization: /\b(?:specialize|exclusively|dedicated to|focused exclusively|focused on serving)/i,

  // Specific product/service details
  tolerances: /±\s*[\d.]+|(?:tolerance|precision)\s*(?:of|to)?\s*[\d.]+/i,
  specifications: /\b(?:up to|rated for|capacity of|supporting)?\s*[\d,.]+\s*(?:lbs?|kg|tons?|psi|cfm|gpm|rpm|°[CF]|sq\s*ft|cubic)/i,
  measurables: /\b\d+(?:\.\d+)?\s*(?:inch|inches|feet|ft|meters|mm|cm|microns?|mil)\b/i,
}

// Detect commodity phrases in text
export function detectCommodityPhrases(text: string): DetectedPhrase[] {
  const lowerText = text.toLowerCase()
  const detected: DetectedPhrase[] = []

  for (const item of commodityPhrasesData) {
    const phraseLC = item.phrase.toLowerCase()
    let index = lowerText.indexOf(phraseLC)

    if (index !== -1) {
      // Determine location based on position
      let location: string
      if (index < 200) location = 'Headline'
      else if (index < 500) location = 'Subheadline'
      else location = 'Body copy'

      // Extract context (surrounding text)
      const start = Math.max(0, index - 50)
      const end = Math.min(text.length, index + item.phrase.length + 50)
      let context = text.slice(start, end).trim()
      if (start > 0) context = '...' + context
      if (end < text.length) context = context + '...'

      detected.push({
        phrase: item.phrase,
        weight: item.weight,
        category: item.category,
        location,
        context,
      })
    }
  }

  // Sort by weight (heaviest first)
  return detected.sort((a, b) => b.weight - a.weight)
}

// Detect differentiation signals (proof of specificity)
export function detectDifferentiationSignals(text: string): DifferentiationSignal[] {
  const signals: DifferentiationSignal[] = []

  // Check each pattern
  for (const [name, pattern] of Object.entries(DIFFERENTIATION_PATTERNS)) {
    const match = text.match(pattern)
    if (match) {
      let type: DifferentiationSignal['type'] = 'specific'
      let strength = 5

      // Categorize and weight based on pattern type
      if (name.includes('Count') || name.includes('years') || name.includes('decades') ||
          name.includes('percent') || name.includes('dollar') || name.includes('numbers') || name.includes('ranking')) {
        type = 'stat'
        strength = 7
      } else if (name.includes('Client') || name.includes('award') || name.includes('patent') || name.includes('cert')) {
        type = 'proof'
        strength = 8
      } else if (name.includes('first') || name.includes('only') || name.includes('unique')) {
        type = 'unique'
        strength = 9
      } else if (name.includes('tolerance') || name.includes('spec') || name.includes('measur')) {
        type = 'specific'
        strength = 6
      }

      // Extract location
      const idx = text.toLowerCase().indexOf(match[0].toLowerCase())
      let location = 'Body copy'
      if (idx < 200) location = 'Headline'
      else if (idx < 500) location = 'Subheadline'

      signals.push({
        type,
        value: match[0],
        strength,
        location,
      })
    }
  }

  // Sort by strength (strongest first)
  return signals.sort((a, b) => b.strength - a.strength)
}

// Main scoring function - bell curve centered at 50
export function calculateScore(
  commodityPhrases: DetectedPhrase[],
  differentiationSignals: DifferentiationSignal[],
  contentQuality: 'excellent' | 'good' | 'minimal' | 'failed'
): ScoringResult {
  // Handle failed content - can't score what we can't read
  if (contentQuality === 'failed') {
    return {
      score: -1, // Special value indicating no score possible
      commodityPenalty: 0,
      differentiationBonus: 0,
      baseScore: 0,
      analysis: {
        totalCommodityPhrases: 0,
        totalDifferentiationSignals: 0,
        heaviestCommodities: [],
        strongestDifferentiators: [],
      },
    }
  }

  // Start at 50 (median - average B2B manufacturer)
  let baseScore = 50

  // CRITICAL: If we have minimal content and no phrases detected,
  // we can't confidently say the messaging is differentiated.
  // This prevents score 100 when we just couldn't scrape the real content.
  if (contentQuality === 'minimal' && commodityPhrases.length === 0) {
    baseScore = 45 // Strong penalty - lack of data ≠ differentiation
    // Also cap differentiation bonus since we can't verify claims
  } else if (contentQuality === 'minimal') {
    baseScore = 47 // Slight penalty for thin content
  } else if (contentQuality === 'excellent') {
    baseScore = 52 // Slight bonus for rich content
  }

  // Calculate commodity penalty (each phrase drags score down)
  // Use diminishing returns - first phrases hurt more
  let commodityPenalty = 0
  commodityPhrases.forEach((phrase, index) => {
    // Diminishing impact: first phrase full weight, then decreasing
    const multiplier = 1 / (1 + index * 0.3)
    commodityPenalty += phrase.weight * multiplier
  })

  // Cap penalty at 45 points (can't go below 5 from commodity alone)
  commodityPenalty = Math.min(commodityPenalty, 45)

  // Calculate differentiation bonus
  // Unique claims and proof points boost score
  let differentiationBonus = 0
  differentiationSignals.forEach((signal, index) => {
    // Diminishing returns on multiple signals
    const multiplier = 1 / (1 + index * 0.4)
    differentiationBonus += signal.strength * multiplier
  })

  // Cap bonus based on content quality
  // If content is minimal, we can't trust differentiation signals as much
  if (contentQuality === 'minimal') {
    differentiationBonus = Math.min(differentiationBonus, 15) // Strict cap for thin content
  } else if (contentQuality === 'good') {
    differentiationBonus = Math.min(differentiationBonus, 35) // Moderate cap
  } else {
    differentiationBonus = Math.min(differentiationBonus, 40) // Normal cap for excellent content
  }

  // Calculate final score
  let score = baseScore - commodityPenalty + differentiationBonus

  // Apply soft caps to create bell curve shape
  // Make scores above 85 increasingly hard to achieve
  if (score > 85) {
    const excess = score - 85
    score = 85 + (excess * 0.3) // Compress high scores
  }

  // Make scores below 15 rare (floor effect)
  if (score < 15) {
    const deficit = 15 - score
    score = 15 - (deficit * 0.5)
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)))

  // For score 95+, require exceptional evidence
  if (score >= 95) {
    const hasUniqueSignal = differentiationSignals.some(s => s.type === 'unique')
    const hasProofSignal = differentiationSignals.some(s => s.type === 'proof')
    const hasStatSignal = differentiationSignals.some(s => s.type === 'stat')

    if (!hasUniqueSignal || !hasProofSignal || !hasStatSignal) {
      score = 94 // Cap at 94 without all three types of proof
    }
  }

  // For score 98+, require zero commodity phrases AND 5+ signals
  if (score >= 98) {
    if (commodityPhrases.length > 0 || differentiationSignals.length < 5) {
      score = 97
    }
  }

  // Score 100 is nearly impossible - require perfect conditions
  if (score >= 100) {
    if (commodityPhrases.length > 0 ||
        differentiationSignals.length < 7 ||
        !differentiationSignals.some(s => s.type === 'unique' && s.strength >= 9)) {
      score = 99
    }
  }

  return {
    score,
    commodityPenalty: Math.round(commodityPenalty * 10) / 10,
    differentiationBonus: Math.round(differentiationBonus * 10) / 10,
    baseScore,
    analysis: {
      totalCommodityPhrases: commodityPhrases.length,
      totalDifferentiationSignals: differentiationSignals.length,
      heaviestCommodities: commodityPhrases.slice(0, 3).map(p => p.phrase),
      strongestDifferentiators: differentiationSignals.slice(0, 3).map(s => s.value),
    },
  }
}

// Generate diagnosis based on score
export function generateDiagnosis(
  score: number,
  commodityCount: number,
  differentiationCount: number,
  contentQuality: 'excellent' | 'good' | 'minimal' | 'failed' = 'good',
  industry: DetectedIndustry = 'general'
): string {
  const industryCopy = INDUSTRY_COPY[industry]

  if (score === -1) {
    return 'We couldn\'t extract enough content to analyze this site. The page may use heavy JavaScript rendering or have restricted access.'
  }

  // Add caveat for minimal content - we can't be confident in high scores
  const contentCaveat = contentQuality === 'minimal'
    ? ' Note: We had limited content to analyze, so this score may not fully reflect your actual messaging.'
    : ''

  if (score >= 90) {
    if (contentQuality === 'minimal') {
      // Can't get 90+ with minimal content anymore, but just in case
      return `We couldn't extract enough marketing content to give you an accurate score. The visible text appears clean, but we'd need to see more of your actual messaging.${contentCaveat}`
    }
    return `Exceptional differentiation. Your messaging is in the top 5% of ${industryCopy.verticalPlural}. You use specific, provable language that competitors can't copy.`
  }

  if (score >= 75) {
    return `Strong differentiation. Your messaging stands out with ${differentiationCount} specific proof point${differentiationCount === 1 ? '' : 's'}. ${commodityCount > 0 ? `Cleaning up ${commodityCount} commodity phrase${commodityCount === 1 ? '' : 's'} would push you higher.` : 'Keep strengthening with more specifics.'}${contentCaveat}`
  }

  if (score >= 60) {
    if (contentQuality === 'minimal' && commodityCount === 0) {
      return `Limited content extracted. Based on what we could see, no obvious commodity language detected, but we'd need more of your marketing copy to give you a complete picture.${contentCaveat}`
    }
    return `Above average. Your messaging is better than most competitors, but ${commodityCount} generic phrase${commodityCount === 1 ? '' : 's'} and limited proof points are holding you back. Buyers can distinguish you, but there's room to stand out more.${contentCaveat}`
  }

  if (score >= 45) {
    if (contentQuality === 'minimal' && commodityCount === 0) {
      return `We extracted limited content from this page. Without more text to analyze, we're giving you an average score. Try analyzing a page with more marketing copy for a more accurate assessment.`
    }
    return `Average. Your messaging sounds like most ${industryCopy.verticalPlural}. ${commodityCount} commodity phrase${commodityCount === 1 ? '' : 's'} make${commodityCount === 1 ? 's' : ''} you blend in. When buyers can't tell you apart, they default to price.${contentCaveat}`
  }

  if (score >= 30) {
    return `Below average. Heavy use of generic language (${commodityCount} commodity phrase${commodityCount === 1 ? '' : 's'}) makes you nearly indistinguishable from competitors. You're competing on price whether you want to or not.${contentCaveat}`
  }

  return `Highly commoditized. Your messaging is almost entirely generic corporate speak. Buyers see no difference between you and the lowest-priced alternative. This is costing you deals.${contentCaveat}`
}

// Industry detection based on content keywords
export type DetectedIndustry = 'manufacturing' | 'distribution' | 'saas' | 'agency' | 'services' | 'construction' | 'healthcare' | 'finance' | 'retail' | 'general'

export function detectIndustry(text: string): DetectedIndustry {
  const lowerText = text.toLowerCase()
  const scores: Record<DetectedIndustry, number> = {
    manufacturing: 0,
    distribution: 0,
    saas: 0,
    agency: 0,
    services: 0,
    construction: 0,
    healthcare: 0,
    finance: 0,
    retail: 0,
    general: 0
  }

  // Strong self-declarations that should override other signals
  for (const { pattern, industry, bonus } of INDUSTRY_STRONG_DECLARATIONS) {
    if (pattern.test(lowerText)) {
      scores[industry] += bonus
    }
  }

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    for (const keyword of keywords) {
      // Count occurrences
      const regex = new RegExp(keyword, 'gi')
      const matches = lowerText.match(regex)
      if (matches) {
        scores[industry as DetectedIndustry] += matches.length
      }
    }
  }

  // Find highest scoring industry
  let maxScore = 0
  let detectedIndustry: DetectedIndustry = 'general'

  for (const [industry, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      detectedIndustry = industry as DetectedIndustry
    }
  }

  // Require minimum confidence
  if (maxScore < 2) {
    return 'general'
  }

  return detectedIndustry
}

// Industry-specific deal assumptions
const INDUSTRY_DEAL_ASSUMPTIONS: Record<DetectedIndustry, { dealValue: number; annualDeals: number }> = {
  manufacturing: { dealValue: 50000, annualDeals: 30 },      // B2B manufacturing: bigger deals, fewer of them
  distribution: { dealValue: 25000, annualDeals: 50 },       // Industrial distribution: mid-size, moderate volume
  saas: { dealValue: 12000, annualDeals: 200 },              // SaaS: smaller ARR per deal, high volume
  agency: { dealValue: 40000, annualDeals: 25 },             // Agency: project-based, moderate volume
  services: { dealValue: 75000, annualDeals: 20 },           // Professional services: big projects, few clients
  construction: { dealValue: 150000, annualDeals: 15 },      // Construction: large projects, few per year
  healthcare: { dealValue: 80000, annualDeals: 25 },         // Healthcare: substantial contracts
  finance: { dealValue: 100000, annualDeals: 20 },           // Finance: high-value relationships
  retail: { dealValue: 5000, annualDeals: 500 },             // Retail: low AOV, high volume
  general: { dealValue: 50000, annualDeals: 30 }             // Default
}

// Calculate cost estimate based on score and industry
export function calculateCostEstimate(score: number, industry: DetectedIndustry = 'general'): {
  estimate: number
  assumptions: {
    averageDealValue: number
    annualDeals: number
    lossRate: number
    lossRateLabel: string
  }
} {
  if (score === -1) {
    return {
      estimate: 0,
      assumptions: {
        averageDealValue: 0,
        annualDeals: 0,
        lossRate: 0,
        lossRateLabel: 'Unable to calculate - insufficient content',
      },
    }
  }

  const industryAssumptions = INDUSTRY_DEAL_ASSUMPTIONS[industry] || INDUSTRY_DEAL_ASSUMPTIONS.general
  const baseDealValue = industryAssumptions.dealValue
  const annualDeals = industryAssumptions.annualDeals

  let lossRate: number
  let lossRateLabel: string

  if (score >= 80) {
    lossRate = 0.03
    lossRateLabel = '3% baseline (minimal commodity penalty)'
  } else if (score >= 60) {
    lossRate = 0.08
    lossRateLabel = '8% of deals lost to undifferentiated positioning'
  } else if (score >= 45) {
    lossRate = 0.15
    lossRateLabel = '15% of deals lost to price pressure (average messaging)'
  } else if (score >= 30) {
    lossRate = 0.22
    lossRateLabel = '22% of deals lost to "cheaper" competitors'
  } else {
    lossRate = 0.30
    lossRateLabel = '30% of deals lost - you look identical to competitors'
  }

  const estimate = Math.round((baseDealValue * annualDeals * lossRate) / 10000) * 10000

  return {
    estimate,
    assumptions: {
      averageDealValue: baseDealValue,
      annualDeals,
      lossRate,
      lossRateLabel,
    },
  }
}
