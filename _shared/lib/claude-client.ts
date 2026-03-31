/**
 * Claude API Client with Automatic Failover
 *
 * Provides automatic failover between primary and backup Anthropic API keys
 * when quota limits are hit. Transparently retries failed requests with backup key.
 *
 * Usage:
 *   import { createClaudeClient } from '@/shared/lib/claude-client'
 *   const anthropic = createClaudeClient()
 *   const message = await anthropic.messages.create({ ... })
 *
 * Environment variables:
 *   ANTHROPIC_API_KEY - Primary API key
 *   ANTHROPIC_API_KEY_BACKUP - Backup API key (optional but recommended)
 */

import Anthropic from '@anthropic-ai/sdk'

interface FailoverConfig {
  primaryKey?: string
  backupKey?: string
  logFailover?: boolean
}

interface FailoverStats {
  primaryUsed: number
  backupUsed: number
  quotaErrors: number
  lastFailover?: Date
}

const stats: FailoverStats = {
  primaryUsed: 0,
  backupUsed: 0,
  quotaErrors: 0,
}

/**
 * Check if an error is a quota/rate limit error that should trigger failover
 */
function isQuotaError(error: any): boolean {
  if (!error) return false

  // Anthropic SDK error structure
  if (error.status === 429) return true
  if (error.statusCode === 429) return true

  // Check error message
  const message = error.message?.toLowerCase() || ''
  return (
    message.includes('quota') ||
    message.includes('rate limit') ||
    message.includes('429')
  )
}

/**
 * Create a Claude client with automatic failover
 */
export function createClaudeClient(config: FailoverConfig = {}): Anthropic {
  const primaryKey = config.primaryKey || process.env.ANTHROPIC_API_KEY
  const backupKey = config.backupKey || process.env.ANTHROPIC_API_KEY_BACKUP
  const logFailover = config.logFailover !== false // default true

  if (!primaryKey) {
    throw new Error('ANTHROPIC_API_KEY is required')
  }

  // Create both clients upfront
  const primaryClient = new Anthropic({ apiKey: primaryKey })
  const backupClient = backupKey ? new Anthropic({ apiKey: backupKey }) : null

  // Wrap the messages.create method with failover logic
  const originalCreate = primaryClient.messages.create.bind(primaryClient)

  primaryClient.messages.create = async function (
    params: Anthropic.MessageCreateParams,
    options?: Anthropic.RequestOptions
  ): Promise<Anthropic.Message> {
    try {
      // Try primary key first
      const response = await originalCreate(params, options)
      stats.primaryUsed++
      return response
    } catch (error) {
      // If quota error and backup available, try backup
      if (isQuotaError(error) && backupClient) {
        stats.quotaErrors++
        stats.lastFailover = new Date()

        if (logFailover) {
          console.log('[Claude Failover] Primary key hit quota. Retrying with backup key...')
        }

        try {
          const response = await backupClient.messages.create(params, options)
          stats.backupUsed++

          if (logFailover) {
            console.log('[Claude Failover] Backup key succeeded')
          }

          return response
        } catch (backupError) {
          if (logFailover) {
            console.error('[Claude Failover] Backup key also failed:', backupError)
          }
          throw backupError
        }
      }

      // Not a quota error or no backup available
      throw error
    }
  }

  return primaryClient
}

/**
 * Get failover statistics
 */
export function getFailoverStats(): FailoverStats {
  return { ...stats }
}

/**
 * Reset failover statistics (useful for testing)
 */
export function resetFailoverStats(): void {
  stats.primaryUsed = 0
  stats.backupUsed = 0
  stats.quotaErrors = 0
  stats.lastFailover = undefined
}

/**
 * Check if backup key is configured
 */
export function hasBackupKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY_BACKUP
}

/**
 * Legacy: Get Anthropic client instance (for backward compatibility)
 * @deprecated Use createClaudeClient() instead
 */
export function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null
  }
  return createClaudeClient()
}
