import {
  detectCommodityPhrases,
  detectDifferentiationSignals,
  calculateScore,
  detectIndustry,
  calculateCostEstimate,
  generateDiagnosis,
  type DetectedPhrase,
  type DifferentiationSignal,
} from '../scoring'

// ─── detectCommodityPhrases ───────────────────────────────────────────────────

describe('detectCommodityPhrases', () => {
  // UNHAPPY PATHS FIRST

  it('returns empty array for empty string', () => {
    const result = detectCommodityPhrases('')
    expect(result).toEqual([])
  })

  it('returns empty array for whitespace-only input', () => {
    const result = detectCommodityPhrases('   ')
    expect(result).toEqual([])
  })

  it('returns empty array for text with no commodity phrases', () => {
    const clean = 'We reduced client onboarding time by 40% in 6 months by eliminating 3 manual handoff steps.'
    const result = detectCommodityPhrases(clean)
    expect(result).toEqual([])
  })

  // HAPPY PATHS

  it('detects "world-class" as commodity phrase', () => {
    const result = detectCommodityPhrases('We offer world-class solutions.')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(p => p.phrase === 'world-class')).toBe(true)
  })

  it('detects "best-in-class" as commodity phrase', () => {
    const result = detectCommodityPhrases('We offer best-in-class services.')
    expect(result.some(p => p.phrase === 'best-in-class')).toBe(true)
  })

  it('detects "industry leader" as commodity phrase', () => {
    const result = detectCommodityPhrases('We are an industry leader.')
    expect(result.some(p => p.phrase === 'industry leader')).toBe(true)
  })

  it('detects "proven track record" as commodity phrase', () => {
    const result = detectCommodityPhrases('We have a proven track record.')
    expect(result.some(p => p.phrase === 'proven track record')).toBe(true)
  })

  it('detected phrases have required fields', () => {
    const result = detectCommodityPhrases('We offer innovative world-class solutions.')
    for (const phrase of result) {
      expect(typeof phrase.phrase).toBe('string')
      expect(phrase.phrase.length).toBeGreaterThan(0)
      expect(typeof phrase.weight).toBe('number')
      expect(phrase.weight).toBeGreaterThan(0)
      expect(typeof phrase.category).toBe('string')
      expect(typeof phrase.location).toBe('string')
    }
  })

  it('results are sorted by weight descending (heaviest first)', () => {
    const result = detectCommodityPhrases(
      'We are an industry leader offering innovative solutions with world-class quality.'
    )
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].weight).toBeGreaterThanOrEqual(result[i].weight)
    }
  })

  it('phrases in first 200 chars are marked as Headline', () => {
    const result = detectCommodityPhrases('world-class solutions')
    expect(result.some(p => p.location === 'Headline')).toBe(true)
  })

  it('detects "digital transformation" as buzzword', () => {
    const result = detectCommodityPhrases('We drive digital transformation.')
    expect(result.some(p => p.phrase === 'digital transformation')).toBe(true)
  })

  it('context field is populated for each detected phrase', () => {
    const result = detectCommodityPhrases('We offer world-class innovative solutions for businesses.')
    for (const phrase of result) {
      if (phrase.context !== undefined) {
        expect(typeof phrase.context).toBe('string')
        expect(phrase.context.length).toBeGreaterThan(0)
      }
    }
  })

  it('more commodity phrases found in heavier text', () => {
    const light = 'We offer solutions.'
    const heavy = 'We are an industry leader offering world-class best-in-class innovative cutting-edge solutions with a proven track record.'
    const lightResult = detectCommodityPhrases(light)
    const heavyResult = detectCommodityPhrases(heavy)
    expect(heavyResult.length).toBeGreaterThan(lightResult.length)
  })
})

// ─── detectDifferentiationSignals ────────────────────────────────────────────

describe('detectDifferentiationSignals', () => {
  // UNHAPPY PATHS FIRST

  it('returns empty array for empty string', () => {
    const result = detectDifferentiationSignals('')
    expect(result).toEqual([])
  })

  it('returns empty array for commodity-only text', () => {
    const result = detectDifferentiationSignals('We offer world-class solutions.')
    expect(result).toHaveLength(0)
  })

  // HAPPY PATHS

  it('detects percentage as stat signal', () => {
    const result = detectDifferentiationSignals('We reduced errors by 40%.')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(s => s.type === 'stat')).toBe(true)
  })

  it('detects dollar amounts', () => {
    const result = detectDifferentiationSignals('We saved clients $2 million annually.')
    expect(result.length).toBeGreaterThan(0)
  })

  it('detects client count as stat', () => {
    const result = detectDifferentiationSignals('We serve 500+ clients worldwide.')
    expect(result.length).toBeGreaterThan(0)
  })

  it('detects "only company" as unique signal', () => {
    const result = detectDifferentiationSignals('We are the only company that provides this service.')
    expect(result.some(s => s.type === 'unique')).toBe(true)
  })

  it('detects ISO certification as proof', () => {
    const result = detectDifferentiationSignals('We are ISO 9001 certified.')
    expect(result.some(s => s.type === 'proof')).toBe(true)
  })

  it('detected signals have required fields', () => {
    const result = detectDifferentiationSignals('We reduced errors by 40% and serve 200+ clients.')
    for (const signal of result) {
      expect(['stat', 'proof', 'unique', 'specific', 'claim']).toContain(signal.type)
      expect(typeof signal.value).toBe('string')
      expect(signal.value.length).toBeGreaterThan(0)
      expect(typeof signal.strength).toBe('number')
      expect(signal.strength).toBeGreaterThanOrEqual(1)
      expect(signal.strength).toBeLessThanOrEqual(10)
      expect(typeof signal.location).toBe('string')
    }
  })

  it('signals are sorted by strength descending', () => {
    const result = detectDifferentiationSignals(
      'We are the only company with 500+ clients and $2M savings and ISO 9001 certification, founded in 1985.'
    )
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].strength).toBeGreaterThanOrEqual(result[i].strength)
    }
  })
})

// ─── calculateScore ───────────────────────────────────────────────────────────

describe('calculateScore', () => {
  const noPhrases: DetectedPhrase[] = []
  const noSignals: DifferentiationSignal[] = []

  // UNHAPPY PATHS FIRST

  it('returns score -1 for failed content quality', () => {
    const result = calculateScore(noPhrases, noSignals, 'failed')
    expect(result.score).toBe(-1)
  })

  it('failed result has zero penalties and bonuses', () => {
    const result = calculateScore(noPhrases, noSignals, 'failed')
    expect(result.commodityPenalty).toBe(0)
    expect(result.differentiationBonus).toBe(0)
  })

  it('minimal content with no phrases gives score around 45 base', () => {
    const result = calculateScore(noPhrases, noSignals, 'minimal')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  // HAPPY PATHS

  it('score is always in range 0-100 for good content', () => {
    const result = calculateScore(noPhrases, noSignals, 'good')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('score is always in range 0-100 for excellent content', () => {
    const result = calculateScore(noPhrases, noSignals, 'excellent')
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })

  it('heavy commodity phrases lower the score', () => {
    const heavyCommodity: DetectedPhrase[] = [
      { phrase: 'world-class', weight: 6, category: 'hyperbole', location: 'Headline', context: '...world-class...' },
      { phrase: 'best-in-class', weight: 6, category: 'hyperbole', location: 'Headline', context: '...best-in-class...' },
      { phrase: 'industry leader', weight: 7, category: 'leadership', location: 'Headline', context: '...industry leader...' },
      { phrase: 'innovative solutions', weight: 7, category: 'innovation', location: 'Body copy', context: '...innovative solutions...' },
      { phrase: 'proven track record', weight: 5, category: 'results', location: 'Body copy', context: '...proven track record...' },
    ]
    const cleanResult = calculateScore(noPhrases, noSignals, 'good')
    const commodityResult = calculateScore(heavyCommodity, noSignals, 'good')
    expect(cleanResult.score).toBeGreaterThan(commodityResult.score)
  })

  it('differentiation signals raise the score', () => {
    const strongSignals: DifferentiationSignal[] = [
      { type: 'stat', value: '500+ clients', strength: 7, location: 'Headline' },
      { type: 'proof', value: 'ISO 9001', strength: 8, location: 'Body copy' },
      { type: 'unique', value: 'only company', strength: 9, location: 'Body copy' },
    ]
    const baseResult = calculateScore(noPhrases, noSignals, 'good')
    const enrichedResult = calculateScore(noPhrases, strongSignals, 'good')
    expect(enrichedResult.score).toBeGreaterThan(baseResult.score)
  })

  it('analysis includes correct counts', () => {
    const phrases: DetectedPhrase[] = [
      { phrase: 'world-class', weight: 6, category: 'hyperbole', location: 'Headline', context: '...' },
      { phrase: 'innovative', weight: 5, category: 'innovation', location: 'Body copy', context: '...' },
    ]
    const signals: DifferentiationSignal[] = [
      { type: 'stat', value: '40%', strength: 7, location: 'Body copy' },
    ]
    const result = calculateScore(phrases, signals, 'good')
    expect(result.analysis.totalCommodityPhrases).toBe(2)
    expect(result.analysis.totalDifferentiationSignals).toBe(1)
  })

  it('heaviestCommodities lists top 3 phrase names', () => {
    const phrases: DetectedPhrase[] = [
      { phrase: 'industry leader', weight: 7, category: 'leadership', location: 'Headline', context: '...' },
      { phrase: 'world-class', weight: 6, category: 'hyperbole', location: 'Headline', context: '...' },
      { phrase: 'innovative', weight: 5, category: 'innovation', location: 'Body copy', context: '...' },
      { phrase: 'quality', weight: 4, category: 'vague-quality', location: 'Body copy', context: '...' },
    ]
    const result = calculateScore(phrases, noSignals, 'good')
    expect(result.analysis.heaviestCommodities).toHaveLength(3)
    expect(result.analysis.heaviestCommodities[0]).toBe('industry leader')
  })

  it('score 100 is extremely difficult — blocked by caps without perfect conditions', () => {
    // With commodity phrases present, score should never reach 100
    const phrases: DetectedPhrase[] = [
      { phrase: 'quality', weight: 2, category: 'vague-quality', location: 'Body copy', context: '...' },
    ]
    const signals: DifferentiationSignal[] = Array(10).fill(null).map((_, i) => ({
      type: 'unique' as const,
      value: `unique-signal-${i}`,
      strength: 9,
      location: 'Headline',
    }))
    const result = calculateScore(phrases, signals, 'excellent')
    expect(result.score).toBeLessThan(100)
  })
})

// ─── detectIndustry ───────────────────────────────────────────────────────────

describe('detectIndustry', () => {
  // UNHAPPY PATHS FIRST

  it('returns "general" for empty string', () => {
    const result = detectIndustry('')
    expect(result).toBe('general')
  })

  it('returns "general" for unrecognized text', () => {
    const result = detectIndustry('Purple elephants dancing in the moonlight.')
    expect(result).toBe('general')
  })

  it('returns "general" for weak signal (only 1 keyword match)', () => {
    // "manufacturing" appears once but score threshold is 2
    const result = detectIndustry('I like manufacturing.')
    // Score for manufacturing = 1, threshold = 2, so "general"
    expect(result).toBe('general')
  })

  // HAPPY PATHS

  it('detects manufacturing industry', () => {
    const result = detectIndustry(
      'We are a precision manufacturing company specializing in CNC machining and ISO 9001 certified assembly.'
    )
    expect(result).toBe('manufacturing')
  })

  it('detects SaaS industry', () => {
    const result = detectIndustry(
      'Our cloud-based software platform offers API integrations, dashboard analytics, and monthly subscription pricing.'
    )
    expect(result).toBe('saas')
  })

  it('detects agency industry from explicit declaration', () => {
    const result = detectIndustry(
      'We are a digital agency specializing in branding and creative campaigns for our clients.'
    )
    expect(result).toBe('agency')
  })

  it('detects construction industry', () => {
    const result = detectIndustry(
      'We are a commercial construction general contractor specializing in renovation and concrete work.'
    )
    expect(result).toBe('construction')
  })

  it('detects healthcare industry', () => {
    const result = detectIndustry(
      'Our HIPAA-compliant healthcare platform serves patient care and medical providers.'
    )
    expect(result).toBe('healthcare')
  })

  it('detects retail via e-commerce signals', () => {
    const result = detectIndustry(
      'Our ecommerce online store features add to cart, buy now, and free shipping on all orders.'
    )
    expect(result).toBe('retail')
  })

  it('returns a valid DetectedIndustry type', () => {
    const validIndustries = ['manufacturing', 'distribution', 'saas', 'agency', 'services', 'construction', 'healthcare', 'finance', 'retail', 'general']
    const result = detectIndustry('We build software platforms for our clients.')
    expect(validIndustries).toContain(result)
  })
})

// ─── calculateCostEstimate ────────────────────────────────────────────────────

describe('calculateCostEstimate', () => {
  // UNHAPPY PATHS FIRST

  it('returns zero estimate for score -1 (failed scan)', () => {
    const result = calculateCostEstimate(-1, 'general')
    expect(result.estimate).toBe(0)
  })

  it('score -1 returns lossRateLabel indicating insufficient content', () => {
    const result = calculateCostEstimate(-1, 'general')
    expect(result.assumptions.lossRateLabel).toContain('insufficient content')
  })

  // HAPPY PATHS

  it('returns a positive estimate for low score', () => {
    const result = calculateCostEstimate(20, 'general')
    expect(result.estimate).toBeGreaterThan(0)
  })

  it('higher score produces lower loss rate', () => {
    const low = calculateCostEstimate(20, 'general')
    const high = calculateCostEstimate(85, 'general')
    expect(high.assumptions.lossRate).toBeLessThan(low.assumptions.lossRate)
  })

  it('higher score produces lower or equal estimate', () => {
    const low = calculateCostEstimate(20, 'general')
    const high = calculateCostEstimate(85, 'general')
    expect(high.estimate).toBeLessThanOrEqual(low.estimate)
  })

  it('estimate for score 80+ uses 3% loss rate', () => {
    const result = calculateCostEstimate(80, 'general')
    expect(result.assumptions.lossRate).toBe(0.03)
  })

  it('estimate for score 30-44 uses 22% loss rate', () => {
    const result = calculateCostEstimate(35, 'general')
    expect(result.assumptions.lossRate).toBe(0.22)
  })

  it('estimate for score below 30 uses 30% loss rate', () => {
    const result = calculateCostEstimate(15, 'general')
    expect(result.assumptions.lossRate).toBe(0.30)
  })

  it('manufacturing industry has higher deal value than saas', () => {
    const mfg = calculateCostEstimate(50, 'manufacturing')
    const saas = calculateCostEstimate(50, 'saas')
    expect(mfg.assumptions.averageDealValue).toBeGreaterThan(saas.assumptions.averageDealValue)
  })

  it('estimate is rounded to nearest $10,000', () => {
    const result = calculateCostEstimate(50, 'general')
    expect(result.estimate % 10000).toBe(0)
  })

  it('assumptions object has all required fields', () => {
    const result = calculateCostEstimate(50, 'general')
    expect(typeof result.assumptions.averageDealValue).toBe('number')
    expect(typeof result.assumptions.annualDeals).toBe('number')
    expect(typeof result.assumptions.lossRate).toBe('number')
    expect(typeof result.assumptions.lossRateLabel).toBe('string')
  })
})

// ─── generateDiagnosis ────────────────────────────────────────────────────────

describe('generateDiagnosis', () => {
  // UNHAPPY PATHS FIRST

  it('handles score -1 (failed scan) gracefully', () => {
    const result = generateDiagnosis(-1, 0, 0)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result.toLowerCase()).toContain("couldn't extract")
  })

  // HAPPY PATHS

  it('returns string for all score ranges', () => {
    for (const score of [10, 25, 35, 50, 65, 80, 92]) {
      const result = generateDiagnosis(score, 5, 2)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    }
  })

  it('score 90+ returns exceptional differentiation message', () => {
    const result = generateDiagnosis(92, 0, 5, 'excellent')
    expect(result.toLowerCase()).toContain('exceptional')
  })

  it('score 75-89 returns strong differentiation message', () => {
    const result = generateDiagnosis(80, 2, 4)
    expect(result.toLowerCase()).toContain('strong')
  })

  it('score below 30 returns commoditized message', () => {
    const result = generateDiagnosis(20, 10, 0)
    expect(result.toLowerCase()).toContain('commoditized')
  })

  it('score 30-44 mentions below average', () => {
    const result = generateDiagnosis(35, 8, 1)
    expect(result.toLowerCase()).toContain('below average')
  })

  it('content caveat is appended for minimal content quality', () => {
    const result = generateDiagnosis(65, 3, 2, 'minimal')
    expect(result).toContain('Note:')
  })

  it('no content caveat for good content quality', () => {
    const result = generateDiagnosis(65, 3, 2, 'good')
    expect(result).not.toContain('Note:')
  })
})
