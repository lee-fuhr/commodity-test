import { checkRateLimit, getClientIP } from '../rate-limit'

// Mock @vercel/kv
jest.mock('@vercel/kv', () => ({
  kv: {
    get: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  },
}))

import { kv } from '@vercel/kv'

const mockKv = kv as jest.Mocked<typeof kv>

describe('checkRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // UNHAPPY PATHS FIRST

  it('returns 429-style response when hourly limit is reached', async () => {
    mockKv.get.mockImplementation(async (key: string) => {
      if (key.includes('hour')) return 10 // at hourly limit
      return 5 // well under daily limit
    })

    const result = await checkRateLimit('1.2.3.4', { hourlyLimit: 10, dailyLimit: 50 })

    expect(result.allowed).toBe(false)
    expect(result.hourlyRemaining).toBe(0)
    expect(result.retryAfterSeconds).toBeDefined()
    expect(result.message).toBeTruthy()
  })

  it('returns 429-style response when daily limit is reached', async () => {
    mockKv.get.mockImplementation(async (key: string) => {
      if (key.includes('day')) return 50 // at daily limit
      return 0
    })

    const result = await checkRateLimit('1.2.3.4', { hourlyLimit: 10, dailyLimit: 50 })

    expect(result.allowed).toBe(false)
    expect(result.dailyRemaining).toBe(0)
    expect(result.retryAfterSeconds).toBeDefined()
    expect(result.message).toBeTruthy()
  })

  it('allows request when KV throws (fail-open)', async () => {
    mockKv.get.mockRejectedValue(new Error('KV connection failed'))

    const result = await checkRateLimit('1.2.3.4', { hourlyLimit: 10, dailyLimit: 50 })

    expect(result.allowed).toBe(true)
  })

  // HAPPY PATHS

  it('allows request when under both limits', async () => {
    mockKv.get.mockResolvedValue(0)
    mockKv.incr.mockResolvedValue(1)
    mockKv.expire.mockResolvedValue(1)

    const result = await checkRateLimit('1.2.3.4', { hourlyLimit: 10, dailyLimit: 50 })

    expect(result.allowed).toBe(true)
    expect(result.hourlyRemaining).toBeGreaterThanOrEqual(0)
    expect(result.dailyRemaining).toBeGreaterThanOrEqual(0)
  })

  it('bypasses rate limit for whitelisted IP 127.0.0.1', async () => {
    const result = await checkRateLimit('127.0.0.1', { hourlyLimit: 10, dailyLimit: 50 })

    expect(result.allowed).toBe(true)
    expect(result.hourlyRemaining).toBe(999)
    expect(result.dailyRemaining).toBe(999)
    expect(mockKv.get).not.toHaveBeenCalled()
  })

  it('increments both hourly and daily counters on allowed request', async () => {
    mockKv.get.mockResolvedValue(0)
    mockKv.incr.mockResolvedValue(1)
    mockKv.expire.mockResolvedValue(1)

    await checkRateLimit('1.2.3.4', { hourlyLimit: 10, dailyLimit: 50 })

    // Should have called incr twice (once for hour key, once for day key)
    expect(mockKv.incr).toHaveBeenCalledTimes(2)
  })

  it('sets TTL only on first increment (value === 1)', async () => {
    mockKv.get.mockResolvedValue(0)
    mockKv.incr.mockResolvedValue(1) // new key — value is 1
    mockKv.expire.mockResolvedValue(1)

    await checkRateLimit('1.2.3.4', { hourlyLimit: 10, dailyLimit: 50 })

    expect(mockKv.expire).toHaveBeenCalledTimes(2)
  })

  it('does NOT set TTL when key already existed (value > 1)', async () => {
    mockKv.get.mockResolvedValue(5)
    mockKv.incr.mockResolvedValue(6) // existing key — value > 1
    mockKv.expire.mockResolvedValue(1)

    await checkRateLimit('1.2.3.4', { hourlyLimit: 10, dailyLimit: 50 })

    expect(mockKv.expire).not.toHaveBeenCalled()
  })

  it('decrements remaining counts correctly', async () => {
    mockKv.get.mockImplementation(async (key: string) => {
      if (key.includes('hour')) return 7
      return 30
    })
    mockKv.incr.mockResolvedValue(8)
    mockKv.expire.mockResolvedValue(1)

    const result = await checkRateLimit('1.2.3.4', { hourlyLimit: 10, dailyLimit: 50 })

    expect(result.hourlyRemaining).toBe(2) // 10 - 7 - 1
    expect(result.dailyRemaining).toBe(19) // 50 - 30 - 1
  })
})

// ─── getClientIP ──────────────────────────────────────────────────────────────

describe('getClientIP', () => {
  function makeRequest(headers: Record<string, string>): Request {
    return new Request('https://example.com', { headers })
  }

  // UNHAPPY PATHS FIRST

  it('returns 127.0.0.1 fallback when no headers present', () => {
    const req = makeRequest({})
    expect(getClientIP(req)).toBe('127.0.0.1')
  })

  // HAPPY PATHS

  it('extracts first IP from x-forwarded-for with multiple IPs', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' })
    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('uses x-real-ip when x-forwarded-for is absent', () => {
    const req = makeRequest({ 'x-real-ip': '5.6.7.8' })
    expect(getClientIP(req)).toBe('5.6.7.8')
  })

  it('uses x-vercel-forwarded-for when x-forwarded-for is absent', () => {
    const req = makeRequest({ 'x-vercel-forwarded-for': '3.4.5.6, 9.9.9.9' })
    expect(getClientIP(req)).toBe('3.4.5.6')
  })

  it('prefers x-forwarded-for over x-vercel-forwarded-for', () => {
    const req = makeRequest({
      'x-forwarded-for': '1.2.3.4',
      'x-vercel-forwarded-for': '9.9.9.9',
    })
    expect(getClientIP(req)).toBe('1.2.3.4')
  })
})
