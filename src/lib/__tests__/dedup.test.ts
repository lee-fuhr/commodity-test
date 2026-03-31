import { calculateSimilarity, dedupeFixes, selectDiversePhrases } from '../dedup'

// ─── calculateSimilarity ──────────────────────────────────────────────────────

describe('calculateSimilarity', () => {
  // UNHAPPY PATHS FIRST

  it('returns 0 for two empty strings', () => {
    expect(calculateSimilarity('', '')).toBe(0)
  })

  it('returns 0 when one string is empty', () => {
    expect(calculateSimilarity('hello world testing', '')).toBe(0)
  })

  it('returns 0 when both strings have only short words (filtered out)', () => {
    // Words <= 3 chars are filtered — "the" "a" "is" "of" etc
    expect(calculateSimilarity('the a is', 'the a is')).toBe(0)
  })

  // HAPPY PATHS

  it('returns 1 for identical strings', () => {
    const text = 'precision machining services manufacturing'
    expect(calculateSimilarity(text, text)).toBe(1)
  })

  it('returns value between 0 and 1 for partial overlap', () => {
    const result = calculateSimilarity(
      'precision machining services',
      'precision welding solutions manufacturing'
    )
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })

  it('completely different text returns 0', () => {
    const result = calculateSimilarity(
      'precision machining manufacturing',
      'digital marketing solutions agency'
    )
    expect(result).toBe(0)
  })

  it('similarity is symmetric — order does not matter', () => {
    const a = 'precision machining services quality'
    const b = 'quality manufacturing precision solutions'
    expect(calculateSimilarity(a, b)).toBe(calculateSimilarity(b, a))
  })
})

// ─── dedupeFixes ─────────────────────────────────────────────────────────────

type Fix = {
  number: number
  originalPhrase: string
  location: string
  context: string
  whyBad: string
  suggestions: Array<{ text: string; approach: string }>
  whyBetter: string
}

function makeFix(overrides: Partial<Fix> & { number: number }): Fix {
  return {
    originalPhrase: 'world-class',
    location: 'Headline',
    context: 'We offer world-class solutions',
    whyBad: 'Commodity phrase that every competitor uses.',
    suggestions: [
      { text: 'ISO 9001 certified since 2005', approach: 'credential' },
      { text: '500 clients served', approach: 'proof' },
      { text: '47 years of precision machining', approach: 'history' },
    ],
    whyBetter: 'Specificity beats superlatives.',
    ...overrides,
  }
}

describe('dedupeFixes', () => {
  // UNHAPPY PATHS FIRST

  it('returns empty array for empty input', () => {
    expect(dedupeFixes([])).toEqual([])
  })

  it('removes exact duplicate (identical whyBad + suggestions + whyBetter)', () => {
    const fix = makeFix({ number: 1 })
    const duplicate = makeFix({ number: 2 })
    const result = dedupeFixes([fix, duplicate])
    expect(result).toHaveLength(1)
  })

  it('removes fix with high content similarity to a prior fix', () => {
    const fix1 = makeFix({
      number: 1,
      whyBad: 'Commodity phrase that every competitor uses and customers ignore completely.',
      whyBetter: 'Specificity beats superlatives every time.',
    })
    const fix2 = makeFix({
      number: 2,
      originalPhrase: 'best-in-class',
      whyBad: 'Commodity phrase that every competitor uses and customers ignore entirely.',
      whyBetter: 'Specificity beats superlatives always.',
    })
    const result = dedupeFixes([fix1, fix2])
    expect(result).toHaveLength(1)
  })

  it('removes fix with overlapping phrase in same location (one contains the other)', () => {
    const fix1 = makeFix({ number: 1, originalPhrase: 'solutions', location: 'Headline' })
    const fix2 = makeFix({ number: 2, originalPhrase: 'world-class solutions', location: 'Headline' })
    const result = dedupeFixes([fix1, fix2])
    expect(result).toHaveLength(1)
  })

  // HAPPY PATHS

  it('keeps single fix unchanged', () => {
    const fix = makeFix({ number: 1 })
    expect(dedupeFixes([fix])).toHaveLength(1)
  })

  it('keeps distinct fixes with different content', () => {
    const fix1 = makeFix({
      number: 1,
      originalPhrase: 'world-class',
      location: 'Headline',
      whyBad: 'Superlative that no one believes.',
      whyBetter: 'Use your actual certifications.',
    })
    const fix2 = makeFix({
      number: 2,
      originalPhrase: 'proven track record',
      location: 'Body copy',
      whyBad: 'Circular claim that proves nothing.',
      suggestions: [
        { text: '200 on-time deliveries last year', approach: 'stat' },
        { text: 'Zero defects in 2023 audit', approach: 'proof' },
        { text: 'Serving aerospace clients since 1998', approach: 'history' },
      ],
      whyBetter: 'Show the record, not the claim.',
    })
    const result = dedupeFixes([fix1, fix2])
    expect(result).toHaveLength(2)
  })

  it('preserves order of surviving fixes', () => {
    // Each fix needs truly distinct content (different whyBad + suggestions + whyBetter)
    // or dedup's similarity check will collapse them
    const fix1: Fix = {
      number: 1, originalPhrase: 'alpha', location: 'Headline', context: 'alpha context',
      whyBad: 'Superlative that no one believes. Replace with certification.',
      suggestions: [
        { text: 'ISO 9001 certified machining', approach: 'credential' },
        { text: '500 clients delivered on time', approach: 'proof' },
        { text: '47 years precision manufacturing', approach: 'history' },
      ],
      whyBetter: 'Use your certifications.',
    }
    const fix2: Fix = {
      number: 2, originalPhrase: 'beta', location: 'Body copy', context: 'beta context',
      whyBad: 'Circular claim proves nothing. Quantify the track record.',
      suggestions: [
        { text: '200 zero-defect deliveries last year', approach: 'stat' },
        { text: 'Zero rejected parts in 2023 audit', approach: 'audit' },
        { text: 'Aerospace clients since 1998', approach: 'tenure' },
      ],
      whyBetter: 'Show the record, not the claim.',
    }
    const fix3: Fix = {
      number: 3, originalPhrase: 'gamma', location: 'Footer', context: 'gamma context',
      whyBad: 'Vague process language. Name the actual technology.',
      suggestions: [
        { text: '5-axis CNC milling to ±0.001"', approach: 'spec' },
        { text: 'Wire EDM and surface grinding in-house', approach: 'capability' },
        { text: 'Same-day quoting via automated CAD upload', approach: 'speed' },
      ],
      whyBetter: 'Technology specifics create real differentiation.',
    }
    const result = dedupeFixes([fix1, fix2, fix3])
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result[0].originalPhrase).toBe('alpha')
  })
})

// ─── selectDiversePhrases ─────────────────────────────────────────────────────

describe('selectDiversePhrases', () => {
  type Item = { category: string; weight: number }

  const items: Item[] = [
    { category: 'hyperbole', weight: 9 },
    { category: 'hyperbole', weight: 7 },
    { category: 'innovation', weight: 8 },
    { category: 'leadership', weight: 6 },
    { category: 'vague-quality', weight: 5 },
    { category: 'vague-quality', weight: 4 },
  ]

  // UNHAPPY PATHS FIRST

  it('returns empty array for empty input', () => {
    expect(selectDiversePhrases([], 3)).toEqual([])
  })

  it('returns all items when count exceeds array length', () => {
    const small = [{ category: 'hyperbole', weight: 9 }, { category: 'innovation', weight: 8 }]
    expect(selectDiversePhrases(small, 10)).toHaveLength(2)
  })

  // HAPPY PATHS

  it('returns exactly count items when input is larger', () => {
    const result = selectDiversePhrases(items, 3)
    expect(result).toHaveLength(3)
  })

  it('first pass selects one item per category', () => {
    const result = selectDiversePhrases(items, 4)
    const categories = result.map(r => r.category)
    // First 3 should be one each of hyperbole, innovation, leadership
    const uniqueCategories = new Set(categories.slice(0, 3))
    expect(uniqueCategories.size).toBe(3)
  })

  it('fills remaining slots after one-per-category pass', () => {
    // 6 items, 3 unique categories — requesting 5 should give 5
    const result = selectDiversePhrases(items, 5)
    expect(result).toHaveLength(5)
  })

  it('does not mutate the original array', () => {
    const original = [...items]
    selectDiversePhrases(items, 3)
    expect(items).toEqual(original)
  })
})
