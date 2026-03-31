// Deduplication utilities for analysis results

// Calculate text similarity using Jaccard index
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3))
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3))

  const intersection = new Set(Array.from(words1).filter(w => words2.has(w)))
  const union = new Set([...Array.from(words1), ...Array.from(words2)])

  if (union.size === 0) return 0
  return intersection.size / union.size
}

interface Fix {
  number: number
  originalPhrase: string
  location: string
  context: string
  whyBad: string
  suggestions: Array<{ text: string; approach: string }>
  whyBetter: string
}

// Remove duplicate fixes — same content, overlapping phrases in same location, or high text similarity
export function dedupeFixes(fixes: Fix[]): Fix[] {
  return fixes.filter((fix, index) => {
    const currentPhrase = fix.originalPhrase.toLowerCase().trim()
    const currentLocation = fix.location.toLowerCase().trim()
    const currentContent = (fix.whyBad + ' ' + fix.suggestions.map(s => s.text).join(' ') + ' ' + fix.whyBetter).toLowerCase().trim()

    for (let i = 0; i < index; i++) {
      const prev = fixes[i]
      const prevPhrase = prev.originalPhrase.toLowerCase().trim()
      const prevLocation = prev.location.toLowerCase().trim()
      const prevContent = (prev.whyBad + ' ' + prev.suggestions.map(s => s.text).join(' ') + ' ' + prev.whyBetter).toLowerCase().trim()

      if (currentContent === prevContent) return false

      const similarity = calculateSimilarity(currentContent, prevContent)
      if (similarity > 0.2) return false

      if (currentLocation === prevLocation) {
        if (currentPhrase === prevPhrase) return false
        if (currentPhrase.includes(prevPhrase) || prevPhrase.includes(currentPhrase)) return false

        const currentWords = new Set<string>(currentPhrase.split(/\s+/).filter(w => w.length > 3))
        const prevWords = new Set<string>(prevPhrase.split(/\s+/).filter(w => w.length > 3))
        const commonWords = Array.from(currentWords).filter(w => prevWords.has(w))
        if (commonWords.length >= 2) return false
      }
    }

    return true
  })
}

// Select diverse phrases — one from each category first, then fill remaining
// Prevents returning 5 variations of "quality" when there are other issues
export function selectDiversePhrases<T extends { category: string }>(phrases: T[], count: number): T[] {
  if (phrases.length <= count) return phrases

  const selected: T[] = []
  const usedCategories = new Set<string>()

  // First pass: one phrase per category (highest weight first since input is sorted)
  for (const phrase of phrases) {
    if (!usedCategories.has(phrase.category) && selected.length < count) {
      selected.push(phrase)
      usedCategories.add(phrase.category)
    }
  }

  // Second pass: fill remaining slots with next highest weight phrases
  for (const phrase of phrases) {
    if (!selected.includes(phrase) && selected.length < count) {
      selected.push(phrase)
    }
  }

  return selected
}
