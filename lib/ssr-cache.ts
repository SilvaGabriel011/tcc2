/**
 * Server-Side Rendering Cache Optimization
 * 
 * Provides caching strategies specifically optimized for SSR:
 * - Page-level caching with revalidation
 * - Component-level data caching
 * - Incremental Static Regeneration (ISR) helpers
 * - Cache tags for smart invalidation
 * - Stale-while-revalidate pattern
 */

import { multiLevelCache } from './multi-level-cache'
import { unstable_cache } from 'next/cache'

export interface SSRCacheOptions {
  revalidate?: number
  tags?: string[]
  staleWhileRevalidate?: boolean
}

export interface PageCacheConfig {
  key: string
  ttl: number
  revalidate?: number
  tags?: string[]
}

/**
 * Cache data for SSR with automatic revalidation
 */
export async function cacheForSSR<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: SSRCacheOptions = {}
): Promise<T> {
  const {
    revalidate = 3600,
    staleWhileRevalidate = true
  } = options
  
  const cached = await multiLevelCache.get<T>(key)
  
  if (cached !== null) {
    if (staleWhileRevalidate) {
      revalidateInBackground(key, fetcher, revalidate)
    }
    return cached
  }
  
  const data = await fetcher()
  await multiLevelCache.set(key, data, {
    l1TTL: Math.min(revalidate, 300),
    l2TTL: revalidate
  })
  
  return data
}

/**
 * Revalidate cache in background
 */
async function revalidateInBackground<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<void> {
  setImmediate(async () => {
    try {
      const data = await fetcher()
      await multiLevelCache.set(key, data, {
        l1TTL: Math.min(ttl, 300),
        l2TTL: ttl
      })
      console.log(`🔄 Background revalidation completed: ${key}`)
    } catch (error) {
      console.error(`Background revalidation failed for ${key}:`, error)
    }
  })
}

/**
 * Cache page data with tags for invalidation
 */
export async function cachePageData<T>(
  config: PageCacheConfig,
  fetcher: () => Promise<T>
): Promise<T> {
  return cacheForSSR(config.key, fetcher, {
    revalidate: config.revalidate || config.ttl,
    tags: config.tags,
    staleWhileRevalidate: true
  })
}

/**
 * Invalidate cache by tags
 */
export async function invalidateByTags(tags: string[]): Promise<void> {
  for (const tag of tags) {
    await multiLevelCache.invalidatePattern(`*:${tag}:*`)
  }
  console.log(`🗑️ Invalidated cache for tags: ${tags.join(', ')}`)
}

/**
 * Create a cached function with Next.js unstable_cache
 */
export function createCachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyParts: string[],
  options: {
    revalidate?: number
    tags?: string[]
  } = {}
): T {
  return unstable_cache(fn, keyParts, {
    revalidate: options.revalidate,
    tags: options.tags
  }) as T
}

/**
 * Cache analysis results with user-specific key
 */
export async function cacheAnalysisResults<T>(
  userId: string,
  analysisId: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const key = `analysis:${userId}:${analysisId}`
  return cacheForSSR(key, fetcher, {
    revalidate: 1800,
    tags: [`user:${userId}`, `analysis:${analysisId}`]
  })
}

/**
 * Cache reference search results
 */
export async function cacheReferenceSearch<T>(
  query: string,
  filters: Record<string, unknown>,
  fetcher: () => Promise<T>
): Promise<T> {
  const filterHash = JSON.stringify(filters)
  const key = `ref:search:${query}:${filterHash}`
  return cacheForSSR(key, fetcher, {
    revalidate: 3600,
    tags: ['references', `query:${query}`]
  })
}

/**
 * Cache user-specific data
 */
export async function cacheUserData<T>(
  userId: string,
  dataType: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const key = `user:${userId}:${dataType}`
  return cacheForSSR(key, fetcher, {
    revalidate: ttl,
    tags: [`user:${userId}`, dataType]
  })
}

/**
 * Invalidate all user-related caches
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await multiLevelCache.invalidatePattern(`user:${userId}:*`)
  await multiLevelCache.invalidatePattern(`analysis:${userId}:*`)
  await multiLevelCache.invalidatePattern(`resultados:${userId}`)
  console.log(`🗑️ Invalidated all caches for user: ${userId}`)
}

/**
 * Invalidate analysis-related caches
 */
export async function invalidateAnalysisCache(analysisId: string): Promise<void> {
  await multiLevelCache.invalidatePattern(`*:${analysisId}*`)
  console.log(`🗑️ Invalidated all caches for analysis: ${analysisId}`)
}

/**
 * Warm up common caches on server start
 */
export async function warmCommonCaches(): Promise<void> {
  console.log('🔥 Warming up common caches...')
  
  const warmTasks = [
    {
      key: 'species:list',
      fetcher: async () => {
        const { prisma } = await import('./prisma')
        return prisma.animalSpecies.findMany({
          include: {
            subtypes: true
          }
        })
      }
    }
  ]
  
  await multiLevelCache.warmBatch(warmTasks)
  console.log('✅ Common caches warmed')
}

/**
 * Preload critical data for a user session
 */
export async function preloadUserSession(userId: string): Promise<void> {
  console.log(`🔥 Preloading session data for user: ${userId}`)
  
  const { prisma } = await import('./prisma')
  
  const warmTasks = [
    {
      key: `user:${userId}:projects`,
      fetcher: async () => prisma.project.findMany({
        where: { ownerId: userId }
      })
    },
    {
      key: `user:${userId}:recent-analyses`,
      fetcher: async () => prisma.dataset.findMany({
        where: {
          project: { ownerId: userId }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    }
  ]
  
  await multiLevelCache.warmBatch(warmTasks)
  console.log(`✅ Session data preloaded for user: ${userId}`)
}

/**
 * Get cache statistics for monitoring
 */
export function getSSRCacheStats() {
  return multiLevelCache.getStats()
}
