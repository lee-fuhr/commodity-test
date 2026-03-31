import type { DetectedPhrase, DifferentiationSignal } from '../scoring'

// Mock the Anthropic SDK before importing the module under test
jest.mock('@anthropic-ai/sdk', () => {
  const mockCreate = jest.fn()
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: { create: mockCreate },
    })),
    _mockCreate: mockCreate,
  }
})

// Helper to access the mock
function getMockCreate() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Anthropic = require('@anthropic-ai/sdk')
  return Anthropic._mockCreate as jest.Mock
}

// Minimal phrase/signal fixtures
const noSignals: DifferentiationSignal[] = []
const onePhrase: DetectedPhrase[] = [
  {
    phrase: 'world-class',
    weight: 6,
    category: 'hyperbole',
    location: 'Headline',
    context: 'We offer world-class solutions.',
  },
]

function validFixesJson() {
  return JSON.stringify({
    fixes: [
      {
        number: 1,
        originalPhrase: 'world-class',
        location: 'Headline',
        context: 'We offer world-class solutions.',
        whyBad: 'Every competitor says this.',
        suggestions: [
          { text: 'ISO 9001 certified since 2005', approach: 'credential' },
          { text: '500 clients served', approach: 'proof' },
          { text: '47 years machining', approach: 'history' },
        ],
        whyBetter: 'Specificity beats superlatives.',
      },
    ],
  })
}

describe('generateFixesWithClaude', () => {
  let generateFixesWithClaude: typeof import('../claude-orchestrator').generateFixesWithClaude

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  // UNHAPPY PATHS FIRST

  it('throws when ANTHROPIC_API_KEY is missing', async () => {
    const original = process.env.ANTHROPIC_API_KEY
    delete process.env.ANTHROPIC_API_KEY

    // Re-require after clearing env so the module-level check fires
    jest.resetModules()
    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
        messages: { create: jest.fn() },
      })),
    }))

    const mod = await import('../claude-orchestrator')
    generateFixesWithClaude = mod.generateFixesWithClaude

    await expect(
      generateFixesWithClaude(
        onePhrase, noSignals,
        'Test headline', '', 'Body text', 'Acme', 'https://acme.com'
      )
    ).rejects.toThrow('ANTHROPIC_API_KEY is required')

    process.env.ANTHROPIC_API_KEY = original
  })

  it('throws on malformed JSON response from Claude', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'

    jest.resetModules()
    const mockCreate = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'This is not JSON at all' }],
    })
    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }))

    const mod = await import('../claude-orchestrator')
    generateFixesWithClaude = mod.generateFixesWithClaude

    await expect(
      generateFixesWithClaude(
        onePhrase, noSignals,
        'Test headline', '', 'Body text', 'Acme', 'https://acme.com'
      )
    ).rejects.toThrow()
  })

  it('retries once on API failure before throwing', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'

    jest.resetModules()
    const mockCreate = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error again'))

    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }))

    const mod = await import('../claude-orchestrator')
    generateFixesWithClaude = mod.generateFixesWithClaude

    await expect(
      generateFixesWithClaude(
        onePhrase, noSignals,
        'Test headline', '', 'Body text', 'Acme', 'https://acme.com'
      )
    ).rejects.toThrow()

    // MAX_RETRIES is 1 — should have been called 2 times (attempt 0 + retry 1)
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it('throws on JSON with empty fixes array', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'

    jest.resetModules()
    const mockCreate = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ fixes: [] }) }],
    })
    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }))

    const mod = await import('../claude-orchestrator')
    generateFixesWithClaude = mod.generateFixesWithClaude

    await expect(
      generateFixesWithClaude(
        onePhrase, noSignals,
        'Test headline', '', 'Body text', 'Acme', 'https://acme.com'
      )
    ).rejects.toThrow()
  })

  it('handles markdown-fenced JSON response (strips ``` wrapper)', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'

    jest.resetModules()
    const mockCreate = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: '```json\n' + validFixesJson() + '\n```' }],
    })
    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }))

    const mod = await import('../claude-orchestrator')
    generateFixesWithClaude = mod.generateFixesWithClaude

    const fixes = await generateFixesWithClaude(
      onePhrase, noSignals,
      'Test headline', '', 'Body text', 'Acme', 'https://acme.com'
    )

    expect(fixes.length).toBeGreaterThan(0)
    expect(fixes[0].originalPhrase).toBe('world-class')
  })

  // HAPPY PATHS

  it('returns parsed fixes on valid Claude response', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'

    jest.resetModules()
    const mockCreate = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: validFixesJson() }],
    })
    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }))

    const mod = await import('../claude-orchestrator')
    generateFixesWithClaude = mod.generateFixesWithClaude

    const fixes = await generateFixesWithClaude(
      onePhrase, noSignals,
      'Test headline', '', 'Body text', 'Acme', 'https://acme.com'
    )

    expect(Array.isArray(fixes)).toBe(true)
    expect(fixes.length).toBeGreaterThan(0)
    expect(fixes[0]).toHaveProperty('originalPhrase')
    expect(fixes[0]).toHaveProperty('whyBad')
    expect(fixes[0]).toHaveProperty('suggestions')
    expect(fixes[0]).toHaveProperty('whyBetter')
    expect(Array.isArray(fixes[0].suggestions)).toBe(true)
  })

  it('returns fallback fix when no commodity phrases detected', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'

    jest.resetModules()
    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
        messages: { create: jest.fn() },
      })),
    }))

    const mod = await import('../claude-orchestrator')
    generateFixesWithClaude = mod.generateFixesWithClaude

    const fixes = await generateFixesWithClaude(
      [], // no phrases
      noSignals,
      'Our Solutions', '', 'Body text', 'Acme', 'https://acme.com'
    )

    expect(fixes).toHaveLength(1)
    expect(fixes[0].location).toBe('Headline')
  })

  it('uses differentiation signals in fallback when no phrases but has signals', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'

    jest.resetModules()
    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
        messages: { create: jest.fn() },
      })),
    }))

    const mod = await import('../claude-orchestrator')
    generateFixesWithClaude = mod.generateFixesWithClaude

    const signals: DifferentiationSignal[] = [
      { type: 'stat', value: '500+ clients served', strength: 8, location: 'Body copy' },
    ]

    const fixes = await generateFixesWithClaude(
      [],
      signals,
      'Our Solutions', '', 'Body text', 'Acme', 'https://acme.com'
    )

    expect(fixes).toHaveLength(1)
    // Fallback with signals references the signal value
    expect(fixes[0].suggestions.some(s => s.text.includes('500+ clients served'))).toBe(true)
  })

  it('caps fixes at 5 even if Claude returns more', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'

    jest.resetModules()

    const manyFixes = Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      originalPhrase: `phrase-${i}`,
      location: 'Body copy',
      context: `Context for phrase ${i}`,
      whyBad: `Unique problem ${i} with this phrase.`,
      suggestions: [
        { text: `Replacement ${i}a`, approach: 'stat' },
        { text: `Replacement ${i}b`, approach: 'proof' },
        { text: `Replacement ${i}c`, approach: 'history' },
      ],
      whyBetter: `Better because ${i}.`,
    }))

    const mockCreate = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ fixes: manyFixes }) }],
    })

    jest.mock('@anthropic-ai/sdk', () => ({
      __esModule: true,
      default: jest.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }))

    const mod = await import('../claude-orchestrator')
    generateFixesWithClaude = mod.generateFixesWithClaude

    const phrases: DetectedPhrase[] = manyFixes.map((f, i) => ({
      phrase: f.originalPhrase,
      weight: 5,
      category: 'hyperbole',
      location: 'Body copy',
      context: `Context ${i}`,
    }))

    const fixes = await generateFixesWithClaude(
      phrases, noSignals,
      'Test headline', '', 'Body text', 'Acme', 'https://acme.com'
    )

    expect(fixes.length).toBeLessThanOrEqual(5)
  })
})
