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

const INDUSTRY_KEYWORDS: Record<DetectedIndustry, string[]> = {
  manufacturing: ['manufacturing', 'manufacturer', 'machining', 'cnc', 'precision', 'fabrication', 'tooling', 'oem', 'supply chain', 'iso 9001', 'assembly', 'production', 'industrial', 'made in usa', 'made in the usa'],
  distribution: ['distributor', 'distribution', 'wholesale', 'mro', 'maintenance repair', 'industrial supplies', 'safety supplies', 'fasteners', 'electrical supplies', 'plumbing supplies', 'hvac supplies', 'ppe', 'safety equipment', 'bulk orders', 'ship same day', 'next day delivery', 'will call', 'local branch', 'stock', 'in stock', 'catalog', 'skus', 'part number', 'sku'],
  saas: ['software', 'saas', 'platform', 'cloud', 'api', 'integration', 'dashboard', 'subscription', 'deploy', 'onboarding', 'workflow', 'automation tool', 'work management', 'project management', 'crm', 'team collaboration', 'collaborate', 'workspace', 'app', 'sign up free', 'free trial', 'get started', 'pricing plans', 'per user', 'per month', 'per seat'],
  agency: ['agency', 'creative agency', 'digital agency', 'marketing agency', 'design agency', 'branding agency', 'web agency', 'advertising agency', 'full-service agency', 'boutique agency', 'our work', 'case studies', 'our clients', 'portfolio', 'we partner', 'brand strategy', 'creative direction', 'campaign', 'client roster', 'studio', 'creative studio', 'design studio'],
  services: ['consulting', 'service provider', 'professional services', 'advisory', 'consulting firm', 'managed services'],
  construction: ['construction', 'contractor', 'builder', 'building', 'jobsite', 'job site', 'renovation', 'commercial construction', 'general contractor', 'subcontractor', 'excavation', 'concrete', 'framing', 'roofing'],
  healthcare: ['healthcare', 'medical', 'patient', 'clinical', 'health', 'hospital', 'provider', 'hipaa', 'physician'],
  finance: ['financial', 'banking', 'investment', 'wealth', 'insurance', 'lending', 'mortgage', 'credit'],
  retail: ['shopping cart', 'add to cart', 'checkout', 'buy now', 'ecommerce', 'e-commerce', 'online store', 'free shipping', 'shop now', 'retail store', 'merchandise'],
  general: []
}

const INDUSTRY_COPY: Record<DetectedIndustry, { verticalNoun: string; verticalPlural: string; dealContext: string }> = {
  manufacturing: { verticalNoun: 'manufacturer', verticalPlural: 'manufacturers', dealContext: '$2M–$10M manufacturers' },
  distribution: { verticalNoun: 'distributor', verticalPlural: 'distributors', dealContext: 'industrial distributors' },
  saas: { verticalNoun: 'software company', verticalPlural: 'software companies', dealContext: 'B2B SaaS companies' },
  agency: { verticalNoun: 'agency', verticalPlural: 'agencies', dealContext: 'creative and digital agencies' },
  services: { verticalNoun: 'service business', verticalPlural: 'service businesses', dealContext: 'professional service firms' },
  construction: { verticalNoun: 'contractor', verticalPlural: 'contractors', dealContext: 'commercial contractors' },
  healthcare: { verticalNoun: 'healthcare provider', verticalPlural: 'healthcare providers', dealContext: 'healthcare organizations' },
  finance: { verticalNoun: 'financial firm', verticalPlural: 'financial firms', dealContext: 'financial services companies' },
  retail: { verticalNoun: 'retailer', verticalPlural: 'retailers', dealContext: 'retail brands' },
  general: { verticalNoun: 'business', verticalPlural: 'businesses', dealContext: 'B2B companies' }
}

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
  // These are explicit "we are X" statements that trump counting client verticals
  const strongDeclarations: Array<{ pattern: RegExp; industry: DetectedIndustry; bonus: number }> = [
    { pattern: /\b(we are|we're|as) an? agency\b/i, industry: 'agency', bonus: 20 },
    { pattern: /\b(digital|creative|marketing|design|branding|web|advertising|full-service) agency\b/i, industry: 'agency', bonus: 15 },
    { pattern: /\bagency (for|serving|helping)\b/i, industry: 'agency', bonus: 15 },
    { pattern: /\b(creative|design|digital) studio\b/i, industry: 'agency', bonus: 10 },
  ]

  for (const { pattern, industry, bonus } of strongDeclarations) {
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

export function getIndustryCopy(industry: DetectedIndustry): { verticalNoun: string; verticalPlural: string; dealContext: string } {
  return INDUSTRY_COPY[industry]
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
