// Commodity phrases library - patterns that make messaging generic
export const commodityPhrases = [
  // Vague quality claims
  { phrase: 'quality', weight: 5, category: 'vague-quality' },
  { phrase: 'high quality', weight: 6, category: 'vague-quality' },
  { phrase: 'highest quality', weight: 7, category: 'vague-quality' },
  { phrase: 'premium quality', weight: 6, category: 'vague-quality' },
  { phrase: 'quality products', weight: 6, category: 'vague-quality' },
  { phrase: 'quality service', weight: 6, category: 'vague-quality' },

  // Generic partnership claims
  { phrase: 'trusted partner', weight: 8, category: 'partnership' },
  { phrase: 'your partner', weight: 5, category: 'partnership' },
  { phrase: 'partner of choice', weight: 7, category: 'partnership' },
  { phrase: 'strategic partner', weight: 6, category: 'partnership' },

  // Leadership claims without proof
  { phrase: 'industry leader', weight: 8, category: 'leadership' },
  { phrase: 'industry leading', weight: 8, category: 'leadership' },
  { phrase: 'market leader', weight: 7, category: 'leadership' },
  { phrase: 'leading provider', weight: 7, category: 'leadership' },
  { phrase: 'leading manufacturer', weight: 7, category: 'leadership' },

  // Innovation without substance
  { phrase: 'innovative', weight: 6, category: 'innovation' },
  { phrase: 'innovative solutions', weight: 8, category: 'innovation' },
  { phrase: 'cutting edge', weight: 7, category: 'innovation' },
  { phrase: 'cutting-edge', weight: 7, category: 'innovation' },
  { phrase: 'state of the art', weight: 7, category: 'innovation' },
  { phrase: 'state-of-the-art', weight: 7, category: 'innovation' },

  // Solutions jargon
  { phrase: 'solutions', weight: 4, category: 'jargon' },
  { phrase: 'comprehensive solutions', weight: 6, category: 'jargon' },
  { phrase: 'complete solutions', weight: 6, category: 'jargon' },
  { phrase: 'turnkey solutions', weight: 6, category: 'jargon' },
  { phrase: 'end-to-end', weight: 5, category: 'jargon' },

  // Generic service claims
  { phrase: 'customer service', weight: 4, category: 'service' },
  { phrase: 'exceptional service', weight: 6, category: 'service' },
  { phrase: 'excellent service', weight: 6, category: 'service' },
  { phrase: 'customer satisfaction', weight: 5, category: 'service' },
  { phrase: 'dedicated team', weight: 5, category: 'service' },
  { phrase: 'experienced team', weight: 5, category: 'service' },

  // Empty value claims
  { phrase: 'value', weight: 3, category: 'value' },
  { phrase: 'best value', weight: 5, category: 'value' },
  { phrase: 'great value', weight: 5, category: 'value' },
  { phrase: 'added value', weight: 5, category: 'value' },

  // Experience claims without numbers
  { phrase: 'years of experience', weight: 4, category: 'experience' },
  { phrase: 'experienced', weight: 3, category: 'experience' },
  { phrase: 'expertise', weight: 4, category: 'experience' },

  // Trust without proof
  { phrase: 'trusted', weight: 4, category: 'trust' },
  { phrase: 'reliable', weight: 4, category: 'trust' },
  { phrase: 'dependable', weight: 4, category: 'trust' },

  // World-class claims
  { phrase: 'world class', weight: 7, category: 'hyperbole' },
  { phrase: 'world-class', weight: 7, category: 'hyperbole' },
  { phrase: 'best in class', weight: 7, category: 'hyperbole' },
  { phrase: 'best-in-class', weight: 7, category: 'hyperbole' },
  { phrase: 'unmatched', weight: 6, category: 'hyperbole' },
  { phrase: 'unparalleled', weight: 6, category: 'hyperbole' },

  // Commitment claims
  { phrase: 'committed to', weight: 4, category: 'commitment' },
  { phrase: 'dedicated to', weight: 4, category: 'commitment' },
  { phrase: 'focused on', weight: 3, category: 'commitment' },

  // Wide range claims
  { phrase: 'wide range', weight: 4, category: 'range' },
  { phrase: 'full range', weight: 4, category: 'range' },
  { phrase: 'one-stop shop', weight: 6, category: 'range' },
  { phrase: 'all your needs', weight: 5, category: 'range' },
]

export function detectCommodityPhrases(text: string): Array<{
  phrase: string
  weight: number
  category: string
  location: string
}> {
  const lowerText = text.toLowerCase()
  const detected: Array<{
    phrase: string
    weight: number
    category: string
    location: string
  }> = []

  for (const item of commodityPhrases) {
    if (lowerText.includes(item.phrase.toLowerCase())) {
      // Find approximate location
      const index = lowerText.indexOf(item.phrase.toLowerCase())
      const location = index < 200 ? 'Headline' : index < 500 ? 'Subheadline' : 'Body copy'

      detected.push({
        phrase: item.phrase,
        weight: item.weight,
        category: item.category,
        location,
      })
    }
  }

  return detected
}

export function calculateCommodityScore(detectedPhrases: Array<{ weight: number }>): number {
  // Base score starts at 100 (fully differentiated)
  // Subtract for each commodity phrase found
  let score = 100

  for (const phrase of detectedPhrases) {
    score -= phrase.weight
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score))
}
