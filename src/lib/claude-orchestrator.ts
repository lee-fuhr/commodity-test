import Anthropic from '@anthropic-ai/sdk'
import type { DetectedPhrase, DifferentiationSignal } from './scoring'
import { selectDiversePhrases, dedupeFixes } from './dedup'

export interface Fix {
  number: number
  originalPhrase: string
  location: string
  context: string
  whyBad: string
  suggestions: Array<{ text: string; approach: string }>
  whyBetter: string
}

// Initialize Claude client
export const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic()
  : null

if (!anthropic) {
  console.error('FATAL: ANTHROPIC_API_KEY not set. Claude API is required for analysis.')
}

const CLAUDE_TIMEOUT_MS = 45000
const MAX_RETRIES = 1

async function callClaudeWithTimeout(prompt: string, attempt: number): Promise<Anthropic.Message> {
  if (!anthropic) throw new Error('ANTHROPIC_API_KEY is required. Cannot generate fixes without Claude API.')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CLAUDE_TIMEOUT_MS)

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return message
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Claude API timeout after ${CLAUDE_TIMEOUT_MS / 1000}s (attempt ${attempt + 1})`)
    }
    throw error
  }
}

function buildPrompt(
  detectedPhrases: DetectedPhrase[],
  differentiationSignals: DifferentiationSignal[],
  topPhrases: DetectedPhrase[],
  headline: string,
  subheadline: string,
  bodyText: string,
  companyName: string,
  url: string,
  siteStats: string[],
  proofPoints: string[]
): string {
  const phraseSummary = topPhrases
    .map((p, i) => `${i + 1}. "${p.phrase}" (found in ${p.location}, category: ${p.category})\n   Context: "${p.context}"`)
    .join('\n\n')

  const diffSignalsSummary = differentiationSignals.length > 0
    ? `\nDIFFERENTIATION SIGNALS FOUND (good things to amplify):\n${differentiationSignals.slice(0, 5).map(s => `- ${s.value} (${s.type}, strength ${s.strength}/10)`).join('\n')}`
    : ''

  const statsSection = siteStats.length > 0
    ? `\nREAL STATS FOUND ON THEIR SITE (use these in suggestions):\n${siteStats.map(s => `- ${s}`).join('\n')}`
    : ''

  const proofsSection = proofPoints.length > 0
    ? `\nPROOF POINTS & ACHIEVEMENTS FOUND:\n${proofPoints.slice(0, 5).map(p => `- ${p}`).join('\n')}`
    : ''

  const fixInstruction = topPhrases.length > 0
    ? `Provide EXACTLY 5 fixes. Use the ${topPhrases.length} detected commodity phrases above first, then add ${5 - topPhrases.length} more fixes for other weak spots (vague claims, missed opportunities, generic language).`
    : `No commodity phrases were auto-detected — this site avoids obvious clichés. But every B2B site has room to be more specific. Provide EXACTLY 5 improvements targeting: vague claims without proof, missed opportunities to use specific numbers or client names, generic positioning, or places where a concrete detail would differentiate. Pull ACTUAL TEXT from the homepage excerpt below — quote their real words as the originalPhrase.`

  return `You are an expert B2B messaging strategist helping a manufacturing company improve their website copy.

COMPANY: ${companyName}
WEBSITE: ${url}
HEADLINE: "${headline}"
SUBHEADLINE: "${subheadline}"

DETECTED COMMODITY PHRASES (with surrounding context):
${phraseSummary || '(none detected — site avoids common commodity phrases)'}
${diffSignalsSummary}
${statsSection}
${proofsSection}

HOMEPAGE EXCERPT:
${bodyText.slice(0, 1500)}

${fixInstruction}

CRITICAL REQUIREMENTS:
1. Each fix must address a DIFFERENT sentence/phrase - never flag variations of the same phrase twice
2. NEVER suggest fixing testimonials, quotes, or attributed statements (text in quotation marks with a name/title)
3. If you see "..." - Name, Title format, that's a testimonial - SKIP IT
4. Find 5 DISTINCT issues from different parts of the page
5. If you can't find 5 truly different issues, provide fewer rather than duplicate

For additional fixes, pull ACTUAL TEXT from the homepage excerpt - quote their real words.

For each fix, provide:
1. whyBad: Why this specific phrase hurts differentiation (1-2 sentences, direct)
2. suggestions: THREE different DROP-IN REPLACEMENTS that create grammatically correct sentences.

   CRITICAL: The replacement must slot into the original context grammatically. Test it mentally.

   VARY the approaches: quantify it, show the process, make a guarantee, tell their story, prove retention, claim the niche, name the innovation.

3. whyBetter: The KEY INSIGHT - why this change works. Punchy and memorable (1 sentence).

CRITICAL - USE REAL DATA WHEN AVAILABLE:
- If we found real stats, USE THEM in suggestions
- Repurpose their own numbers, years, project counts, client names
- NEVER use brackets like [X] - always provide concrete text
- The suggestions should be ready to use TODAY

Respond in this exact JSON format:
{
  "fixes": [
    {
      "number": 1,
      "originalPhrase": "the exact phrase detected",
      "location": "where found",
      "context": "surrounding text",
      "whyBad": "explanation",
      "suggestions": [
        {"text": "rewrite 1", "approach": "approach type"},
        {"text": "rewrite 2", "approach": "approach type"},
        {"text": "rewrite 3", "approach": "approach type"}
      ],
      "whyBetter": "brief reason"
    }
  ]
}

Only return the JSON, no other text.`
}

export async function generateFixesWithClaude(
  detectedPhrases: DetectedPhrase[],
  differentiationSignals: DifferentiationSignal[],
  headline: string,
  subheadline: string,
  bodyText: string,
  companyName: string,
  url: string,
  siteStats: string[] = [],
  proofPoints: string[] = []
): Promise<Fix[]> {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY is required. Cannot generate fixes without Claude API.')
  }

  const topPhrases = selectDiversePhrases(detectedPhrases, 5)

  const prompt = buildPrompt(
    detectedPhrases, differentiationSignals, topPhrases,
    headline, subheadline, bodyText, companyName, url, siteStats, proofPoints
  )

  try {
    let message: Anthropic.Message | null = null
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        message = await callClaudeWithTimeout(prompt, attempt)
        break
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`Claude API attempt ${attempt + 1} failed:`, lastError.message)
        if (attempt < MAX_RETRIES) {
          console.log(`Retrying Claude API call...`)
        }
      }
    }

    if (!message) {
      throw lastError || new Error('Claude API failed after all retries')
    }

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('')

    let jsonText = responseText.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonText)

    if (parsed.fixes && Array.isArray(parsed.fixes) && parsed.fixes.length > 0) {
      const validatedFixes: Fix[] = parsed.fixes
        .slice(0, 5)
        .filter((fix: Record<string, unknown>) =>
          fix.number && fix.originalPhrase && fix.location &&
          fix.whyBad && fix.suggestions && Array.isArray(fix.suggestions) && fix.whyBetter
        )

      const dedupedFixes = dedupeFixes(validatedFixes)

      if (dedupedFixes.length > 0) {
        if (validatedFixes.length >= 4 && dedupedFixes.length < 3) {
          console.warn(`[Analysis] Deduplication reduced fixes from ${validatedFixes.length} to ${dedupedFixes.length} - Claude may have returned duplicates`)
        }
        // Enforce minimum of 3 fixes — pad with headline-based fallback if needed
        if (dedupedFixes.length < 3) {
          const fallback: Fix = {
            number: dedupedFixes.length + 1,
            originalPhrase: headline.slice(0, 50) + (headline.length > 50 ? '...' : ''),
            location: 'Headline',
            context: headline,
            whyBad: `Your headline doesn't lead with your strongest differentiator. Buyers scan headlines first — make yours impossible to ignore.`,
            suggestions: [
              { text: differentiationSignals[0]?.value || `${siteStats[0] || '27 years serving industrial manufacturers'}`, approach: 'lead with proof' },
              { text: `The only ${companyName.split(' ')[0] || 'firm'} in the region that ${proofPoints[0]?.slice(0, 40) || 'guarantees delivery'}`, approach: 'unique claim' },
              { text: `${proofPoints[0]?.slice(0, 60) || 'ISO 9001 certified. Zero missed deadlines in 5 years.'}`, approach: 'credential first' },
            ],
            whyBetter: 'Specificity is differentiation. Add numbers, names, or unique capabilities.',
          }
          while (dedupedFixes.length < 3) {
            dedupedFixes.push({ ...fallback, number: dedupedFixes.length + 1 })
          }
        }
        return dedupedFixes
      }
    }

    throw new Error('Failed to parse Claude response')
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error(`Claude API failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
