import { kv } from '@vercel/kv'

interface RateLimitConfig {
  hourlyLimit: number
  dailyLimit: number
}

interface RateLimitResult {
  allowed: boolean
  hourlyRemaining: number
  dailyRemaining: number
  retryAfterSeconds?: number
  message?: string
}

const DEFAULT_CONFIG: RateLimitConfig = {
  hourlyLimit: 10,
  dailyLimit: 50,
}

/**
 * Check rate limit for an IP address using Vercel KV
 * Uses sliding window counters with TTL for automatic cleanup
 */
export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<RateLimitResult> {
  const now = Date.now()
  const hourKey = `ratelimit:hour:${ip}`
  const dayKey = `ratelimit:day:${ip}`

  try {
    // Get current counts
    const [hourlyCount, dailyCount] = await Promise.all([
      kv.get<number>(hourKey),
      kv.get<number>(dayKey),
    ])

    const currentHourly = hourlyCount || 0
    const currentDaily = dailyCount || 0

    // Check if over limits
    if (currentDaily >= config.dailyLimit) {
      // Calculate seconds until midnight UTC
      const midnight = new Date()
      midnight.setUTCHours(24, 0, 0, 0)
      const secondsUntilMidnight = Math.ceil((midnight.getTime() - now) / 1000)

      return {
        allowed: false,
        hourlyRemaining: Math.max(0, config.hourlyLimit - currentHourly),
        dailyRemaining: 0,
        retryAfterSeconds: secondsUntilMidnight,
        message: `You've hit the daily limit (${config.dailyLimit} free tests). Come back tomorrow—or reach out if you want to run more.`,
      }
    }

    if (currentHourly >= config.hourlyLimit) {
      // Calculate seconds until the hour resets (when the key expires)
      // Keys expire after 1 hour, so worst case is ~3600 seconds
      const secondsUntilHourReset = 3600 // Conservative estimate

      return {
        allowed: false,
        hourlyRemaining: 0,
        dailyRemaining: Math.max(0, config.dailyLimit - currentDaily),
        retryAfterSeconds: secondsUntilHourReset,
        message: `Slow down there—${config.hourlyLimit} tests is the limit for now. Try again in a bit.`,
      }
    }

    // Increment counters
    // Use INCR with TTL for atomic increment and expiry
    await Promise.all([
      incrementWithTTL(hourKey, 3600), // 1 hour TTL
      incrementWithTTL(dayKey, 86400), // 24 hour TTL
    ])

    return {
      allowed: true,
      hourlyRemaining: Math.max(0, config.hourlyLimit - currentHourly - 1),
      dailyRemaining: Math.max(0, config.dailyLimit - currentDaily - 1),
    }
  } catch (error) {
    // If KV fails, allow the request but log the error
    console.error('[RateLimit] KV error, allowing request:', error)
    return {
      allowed: true,
      hourlyRemaining: config.hourlyLimit,
      dailyRemaining: config.dailyLimit,
    }
  }
}

/**
 * Increment a counter with TTL using Vercel KV
 * Uses INCR + EXPIRE pattern for atomic operations
 */
async function incrementWithTTL(key: string, ttlSeconds: number): Promise<void> {
  // INCR will create the key with value 1 if it doesn't exist
  const newValue = await kv.incr(key)

  // Only set TTL if this is a new key (value is 1)
  // This ensures the TTL is set from the first request, not reset on each increment
  if (newValue === 1) {
    await kv.expire(key, ttlSeconds)
  }
}

/**
 * Get the client IP from the request
 * Handles Vercel's forwarded headers
 */
export function getClientIP(request: Request): string {
  // Vercel sets these headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const vercelIP = request.headers.get('x-vercel-forwarded-for')

  // x-forwarded-for can contain multiple IPs; take the first one
  if (forwardedFor) {
    const firstIP = forwardedFor.split(',')[0].trim()
    if (firstIP) return firstIP
  }

  if (vercelIP) {
    const firstIP = vercelIP.split(',')[0].trim()
    if (firstIP) return firstIP
  }

  if (realIP) {
    return realIP.trim()
  }

  // Fallback for local development
  return '127.0.0.1'
}
