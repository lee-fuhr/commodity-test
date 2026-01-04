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

// Commodity phrases with weights (higher = worse)
export const commodityPhrases = [
  // Vague quality claims (weight 3-7)
  { phrase: 'quality', weight: 4, category: 'vague-quality' },
  { phrase: 'high quality', weight: 5, category: 'vague-quality' },
  { phrase: 'highest quality', weight: 6, category: 'vague-quality' },
  { phrase: 'premium quality', weight: 5, category: 'vague-quality' },
  { phrase: 'quality products', weight: 5, category: 'vague-quality' },
  { phrase: 'quality service', weight: 5, category: 'vague-quality' },

  // Generic partnership claims (weight 4-7)
  { phrase: 'trusted partner', weight: 6, category: 'partnership' },
  { phrase: 'your partner', weight: 4, category: 'partnership' },
  { phrase: 'partner of choice', weight: 6, category: 'partnership' },
  { phrase: 'strategic partner', weight: 5, category: 'partnership' },

  // Leadership claims without proof (weight 5-8)
  { phrase: 'industry leader', weight: 7, category: 'leadership' },
  { phrase: 'industry leading', weight: 7, category: 'leadership' },
  { phrase: 'market leader', weight: 6, category: 'leadership' },
  { phrase: 'leading provider', weight: 6, category: 'leadership' },
  { phrase: 'leading manufacturer', weight: 6, category: 'leadership' },
  { phrase: 'global leader', weight: 7, category: 'leadership' },

  // Innovation without substance (weight 4-7)
  { phrase: 'innovative', weight: 5, category: 'innovation' },
  { phrase: 'innovative solutions', weight: 7, category: 'innovation' },
  { phrase: 'cutting edge', weight: 6, category: 'innovation' },
  { phrase: 'cutting-edge', weight: 6, category: 'innovation' },
  { phrase: 'state of the art', weight: 6, category: 'innovation' },
  { phrase: 'state-of-the-art', weight: 6, category: 'innovation' },

  // Solutions jargon (weight 3-6)
  { phrase: 'solutions', weight: 3, category: 'jargon' },
  { phrase: 'comprehensive solutions', weight: 5, category: 'jargon' },
  { phrase: 'complete solutions', weight: 5, category: 'jargon' },
  { phrase: 'turnkey solutions', weight: 5, category: 'jargon' },
  { phrase: 'end-to-end', weight: 4, category: 'jargon' },

  // Generic service claims (weight 3-5)
  { phrase: 'customer service', weight: 3, category: 'service' },
  { phrase: 'exceptional service', weight: 5, category: 'service' },
  { phrase: 'excellent service', weight: 5, category: 'service' },
  { phrase: 'customer satisfaction', weight: 4, category: 'service' },
  { phrase: 'dedicated team', weight: 4, category: 'service' },
  { phrase: 'experienced team', weight: 4, category: 'service' },

  // Empty value claims (weight 2-4)
  { phrase: 'value', weight: 2, category: 'value' },
  { phrase: 'best value', weight: 4, category: 'value' },
  { phrase: 'great value', weight: 4, category: 'value' },
  { phrase: 'added value', weight: 4, category: 'value' },
  { phrase: 'value-added', weight: 4, category: 'value' },

  // Experience claims without numbers (weight 3-4)
  { phrase: 'years of experience', weight: 3, category: 'experience' },
  { phrase: 'experienced', weight: 2, category: 'experience' },
  { phrase: 'expertise', weight: 3, category: 'experience' },

  // Trust without proof (weight 3-4)
  { phrase: 'trusted', weight: 3, category: 'trust' },
  { phrase: 'reliable', weight: 3, category: 'trust' },
  { phrase: 'dependable', weight: 3, category: 'trust' },

  // World-class claims (weight 5-7)
  { phrase: 'world class', weight: 6, category: 'hyperbole' },
  { phrase: 'world-class', weight: 6, category: 'hyperbole' },
  { phrase: 'best in class', weight: 6, category: 'hyperbole' },
  { phrase: 'best-in-class', weight: 6, category: 'hyperbole' },
  { phrase: 'unmatched', weight: 5, category: 'hyperbole' },
  { phrase: 'unparalleled', weight: 5, category: 'hyperbole' },

  // Commitment claims (weight 2-4)
  { phrase: 'committed to', weight: 3, category: 'commitment' },
  { phrase: 'dedicated to', weight: 3, category: 'commitment' },
  { phrase: 'focused on', weight: 2, category: 'commitment' },

  // Wide range claims (weight 3-5)
  { phrase: 'wide range', weight: 3, category: 'range' },
  { phrase: 'full range', weight: 3, category: 'range' },
  { phrase: 'one-stop shop', weight: 5, category: 'range' },
  { phrase: 'all your needs', weight: 4, category: 'range' },

  // Digital/tech buzzwords (weight 4-6)
  { phrase: 'digital transformation', weight: 6, category: 'buzzword' },
  { phrase: 'transform your business', weight: 5, category: 'buzzword' },
  { phrase: 'transformative', weight: 4, category: 'buzzword' },
  { phrase: 'next generation', weight: 4, category: 'buzzword' },
  { phrase: 'next-generation', weight: 4, category: 'buzzword' },
  { phrase: 'future-proof', weight: 5, category: 'buzzword' },
  { phrase: 'ai-powered', weight: 4, category: 'buzzword' },
  { phrase: 'ai powered', weight: 4, category: 'buzzword' },
  { phrase: 'powered by ai', weight: 4, category: 'buzzword' },

  // Scale claims (weight 3-5)
  { phrase: 'global scale', weight: 4, category: 'scale' },
  { phrase: 'enterprise-grade', weight: 4, category: 'scale' },
  { phrase: 'scalable', weight: 3, category: 'scale' },

  // Optimization jargon (weight 2-4)
  { phrase: 'optimize', weight: 3, category: 'optimize' },
  { phrase: 'streamline', weight: 3, category: 'optimize' },
  { phrase: 'maximize', weight: 3, category: 'optimize' },
  { phrase: 'improve efficiency', weight: 4, category: 'optimize' },

  // Integration jargon (weight 4-5)
  { phrase: 'ecosystem', weight: 4, category: 'ecosystem' },
  { phrase: 'seamless integration', weight: 5, category: 'ecosystem' },
  { phrase: 'integrated platform', weight: 4, category: 'ecosystem' },

  // Mission statements (weight 2-4)
  { phrase: 'our mission', weight: 3, category: 'mission' },
  { phrase: 'our vision', weight: 3, category: 'mission' },
  { phrase: 'we believe', weight: 2, category: 'mission' },
  { phrase: 'we strive', weight: 3, category: 'mission' },
  { phrase: 'empowering', weight: 3, category: 'mission' },

  // Results without proof (weight 4-5)
  { phrase: 'proven results', weight: 4, category: 'results' },
  { phrase: 'proven track record', weight: 5, category: 'results' },
  { phrase: 'track record', weight: 3, category: 'results' },

  // Custom claims (weight 2-3)
  { phrase: 'customized', weight: 3, category: 'custom' },
  { phrase: 'tailored', weight: 3, category: 'custom' },
  { phrase: 'personalized', weight: 3, category: 'custom' },

  // Business jargon (weight 2-4)
  { phrase: 'leverage', weight: 3, category: 'jargon' },
  { phrase: 'utilize', weight: 2, category: 'jargon' },
  { phrase: 'harness', weight: 3, category: 'jargon' },
  { phrase: 'drive growth', weight: 3, category: 'jargon' },
  { phrase: 'unlock potential', weight: 4, category: 'jargon' },
]

// Patterns that indicate differentiation (specific, provable claims)
const DIFFERENTIATION_PATTERNS = {
  // Specific numbers with context
  yearsInBusiness: /(?:since|founded|established|serving since)\s*(?:in\s*)?\b(19|20)\d{2}\b/i,
  specificYears: /\b(\d{1,3})\+?\s*years?\s*(?:of|in)\s*(?:experience|business|operation|service)/i,
  clientCount: /\b(\d{1,3}(?:,\d{3})*|\d+k)\+?\s*(?:clients?|customers?|companies|businesses)/i,
  projectCount: /\b(\d{1,3}(?:,\d{3})*|\d+k)\+?\s*(?:projects?|installations?|implementations?)/i,
  employeeCount: /\b(\d{1,3}(?:,\d{3})*)\+?\s*(?:employees?|team members?|associates?|professionals?)/i,
  locationCount: /\b(\d{1,3})\+?\s*(?:locations?|offices?|facilities|warehouses?|distribution centers?)/i,
  countryCount: /\b(\d{1,3})\+?\s*(?:countries?|nations?|states?|markets?)/i,
  percentages: /\b(\d{1,3}(?:\.\d+)?)\s*%\s*(?:satisfaction|reduction|increase|improvement|savings?|faster|better|accuracy|uptime|on-time)/i,
  dollarAmounts: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B)?\s*(?:saved|revenue|in sales|value)/i,
  rankings: /#\s*\d+\s*(?:in|ranked|rated)|(?:top|largest|biggest)\s*\d+/i,

  // Proof points
  namedClients: /(?:serving|trusted by|clients include|working with|partnered with)\s+[A-Z][a-zA-Z\s&]+(?:,\s*[A-Z][a-zA-Z\s&]+){2,}/i,
  awards: /\b(?:winner|awarded|recognized|certified|accredited|ISO\s*\d+|finalist|honoree)\b/i,
  patents: /\b(?:patented|proprietary|patent(?:ed)?-pending|\d+\s*patents?)\b/i,

  // Unique claims
  firstTo: /\bfirst\s+(?:to|in|company to)\s+[^.]{10,50}/i,
  onlyCompany: /\b(?:only|sole)\s+(?:company|provider|manufacturer|supplier)\s+(?:to|that|in)\s+[^.]{10,50}/i,
  uniqueProcess: /\b(?:proprietary|exclusive|our own|in-house)\s+(?:process|method|technology|system|approach)/i,
  specialization: /\b(?:specialize|exclusively|dedicated to|focused exclusively on)\s+[^.]{10,40}/i,

  // Specific product/service details
  tolerances: /±\s*[\d.]+\s*(?:mm|in|inches?|microns?|thou|%)/i,
  specifications: /\b(?:up to|rated for|capacity of)\s*[\d,.]+\s*(?:lbs?|kg|tons?|psi|cfm|gpm|rpm|°[CF])/i,
  certifications: /\b(?:ISO|AS9100|IATF|FDA|CE|UL|CSA|NADCAP|API)\s*\d*\s*(?:certified|compliant|registered)/i,
}

// Detect commodity phrases in text
export function detectCommodityPhrases(text: string): DetectedPhrase[] {
  const lowerText = text.toLowerCase()
  const detected: DetectedPhrase[] = []

  for (const item of commodityPhrases) {
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
      if (name.includes('Count') || name.includes('years') || name.includes('percent') || name.includes('dollar')) {
        type = 'stat'
        strength = 7
      } else if (name.includes('Client') || name.includes('award') || name.includes('patent')) {
        type = 'proof'
        strength = 8
      } else if (name.includes('first') || name.includes('only') || name.includes('unique')) {
        type = 'unique'
        strength = 9
      } else if (name.includes('tolerance') || name.includes('spec') || name.includes('cert')) {
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

  // Adjust base score by content quality
  if (contentQuality === 'minimal') {
    baseScore = 45 // Slight penalty for thin content
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

  // Cap bonus at 40 points (need to be truly exceptional for 90+)
  differentiationBonus = Math.min(differentiationBonus, 40)

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
  differentiationCount: number
): string {
  if (score === -1) {
    return 'We couldn\'t extract enough content to analyze this site. The page may use heavy JavaScript rendering or have restricted access.'
  }

  if (score >= 90) {
    return `Exceptional differentiation. Your messaging is in the top 5% of B2B manufacturers. You use specific, provable language that competitors can't copy.`
  }

  if (score >= 75) {
    return `Strong differentiation. Your messaging stands out with ${differentiationCount} specific proof point${differentiationCount === 1 ? '' : 's'}. ${commodityCount > 0 ? `Cleaning up ${commodityCount} commodity phrase${commodityCount === 1 ? '' : 's'} would push you higher.` : 'Keep strengthening with more specifics.'}`
  }

  if (score >= 60) {
    return `Above average. Your messaging is better than most competitors, but ${commodityCount} generic phrase${commodityCount === 1 ? '' : 's'} and limited proof points are holding you back. Buyers can distinguish you, but there's room to stand out more.`
  }

  if (score >= 45) {
    return `Average. Your messaging sounds like most B2B manufacturers. ${commodityCount} commodity phrase${commodityCount === 1 ? '' : 's'} make${commodityCount === 1 ? 's' : ''} you blend in. When buyers can't tell you apart, they default to price.`
  }

  if (score >= 30) {
    return `Below average. Heavy use of generic language (${commodityCount} commodity phrase${commodityCount === 1 ? '' : 's'}) makes you nearly indistinguishable from competitors. You're competing on price whether you want to or not.`
  }

  return `Highly commoditized. Your messaging is almost entirely generic corporate speak. Buyers see no difference between you and the lowest-priced alternative. This is costing you deals.`
}

// Calculate cost estimate based on score
export function calculateCostEstimate(score: number): {
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

  const baseDealValue = 50000
  const annualDeals = 30

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
