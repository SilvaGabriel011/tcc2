/**
 * Server-side Progress Tracking Utilities
 *
 * Manages analysis progress state in Redis with graceful fallbacks
 * Includes throttling to avoid excessive Redis writes
 */

import { Redis } from '@upstash/redis'
import { AnalysisProgress } from './types'

const PROGRESS_TTL = 7200 // 2 hours in seconds
const THROTTLE_INTERVAL = 500 // Minimum 500ms between updates

const lastUpdateTimes = new Map<string, number>()

/**
 * Create Redis client with error handling
 * Returns null if Redis is not configured
 */
function createRedisClient(): Redis | null {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    console.warn('⚠️ Upstash Redis not configured. Progress tracking disabled.')
    return null
  }

  try {
    return new Redis({
      url: redisUrl,
      token: redisToken,
    })
  } catch (error) {
    console.error('❌ Failed to initialize Redis client:', error)
    return null
  }
}

const redis = createRedisClient()

/**
 * Set progress for an analysis
 * Includes throttling to avoid excessive Redis writes
 *
 * @param analysisId - Unique identifier for the analysis
 * @param progress - Partial progress update
 * @param forceUpdate - Skip throttling (for critical updates like errors or completion)
 */
export async function setProgress(
  analysisId: string,
  progress: Partial<AnalysisProgress>,
  forceUpdate = false
): Promise<void> {
  if (!redis) {
    return
  }

  try {
    if (!forceUpdate) {
      const lastUpdate = lastUpdateTimes.get(analysisId) || 0
      const now = Date.now()
      if (now - lastUpdate < THROTTLE_INTERVAL) {
        return
      }
      lastUpdateTimes.set(analysisId, now)
    }

    const key = `progress:${analysisId}`
    const existing = await getProgress(analysisId)

    const updated: AnalysisProgress = {
      analysisId,
      step: progress.step || existing?.step || 'UPLOAD',
      percent: progress.percent ?? existing?.percent ?? 0,
      message: progress.message || existing?.message || 'Iniciando...',
      status: progress.status || existing?.status || 'running',
      startedAt: existing?.startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      counters: progress.counters || existing?.counters,
      etaSeconds: progress.etaSeconds ?? existing?.etaSeconds,
      error: progress.error || existing?.error,
    }

    await redis.set(key, JSON.stringify(updated), { ex: PROGRESS_TTL })

    console.log(`[Progress] ${analysisId}: ${updated.step} - ${updated.percent}%`)
  } catch (error) {
    console.error('[Progress] Error saving progress:', error)
  }
}

/**
 * Get progress for an analysis
 *
 * @param analysisId - Unique identifier for the analysis
 * @returns Progress object or null if not found
 */
export async function getProgress(analysisId: string): Promise<AnalysisProgress | null> {
  if (!redis) {
    return null
  }

  try {
    const key = `progress:${analysisId}`
    const data = await redis.get(key)

    if (!data) {
      return null
    }

    if (typeof data === 'string') {
      return JSON.parse(data) as AnalysisProgress
    }

    return data as AnalysisProgress
  } catch (error) {
    console.error('[Progress] Error fetching progress:', error)
    return null
  }
}

/**
 * Clear progress for an analysis
 *
 * @param analysisId - Unique identifier for the analysis
 */
export async function clearProgress(analysisId: string): Promise<void> {
  if (!redis) {
    return
  }

  try {
    const key = `progress:${analysisId}`
    await redis.del(key)
    lastUpdateTimes.delete(analysisId)
  } catch (error) {
    console.error('[Progress] Error clearing progress:', error)
  }
}

/**
 * Calculate ETA based on current progress
 *
 * @param analysisId - Unique identifier for the analysis
 * @param processed - Number of items processed
 * @param total - Total number of items
 * @returns Estimated seconds remaining or undefined
 */
export async function calculateETA(
  analysisId: string,
  processed: number,
  total: number
): Promise<number | undefined> {
  if (!redis || processed === 0 || total === 0) {
    return undefined
  }

  try {
    const progress = await getProgress(analysisId)
    if (!progress) {
      return undefined
    }

    const startTime = new Date(progress.startedAt).getTime()
    const now = Date.now()
    const elapsed = (now - startTime) / 1000 // seconds

    if (elapsed < 1) {
      return undefined
    }

    const throughput = processed / elapsed
    const remaining = total - processed
    const etaSeconds = Math.ceil(remaining / throughput)

    return etaSeconds
  } catch (error) {
    console.error('[Progress] Error calculating ETA:', error)
    return undefined
  }
}
