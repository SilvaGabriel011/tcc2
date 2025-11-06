/**
 * Server-Side Rendering (SSR) Optimization for AgroInsight
 * 
 * Implements Next.js 14 caching strategies for optimal performance:
 * - Static Generation with ISR (Incremental Static Regeneration)
 * - Server Component caching
 * - Route segment configuration
 * - Data fetching optimization
 * 
 * Features:
 * - Automatic revalidation strategies
 * - Cache tags for on-demand revalidation
 * - Optimized data fetching patterns
 * - Server component memoization
 * 
 * Benefits:
 * - Faster page loads
 * - Reduced server load
 * - Better SEO
 * - Improved user experience
 */

import { unstable_cache } from 'next/cache'
import { revalidateTag, revalidatePath } from 'next/cache'

/**
 * Cache configuration for different data types
 */
export const CACHE_REVALIDATION = {
  REFERENCE_DATA: 86400, // 24 hours
  SPECIES_DATA: 86400, // 24 hours
  FORAGE_DATA: 86400, // 24 hours
  
  USER_ANALYSES: 300, // 5 minutes
  USER_REFERENCES: 600, // 10 minutes
  USER_PROFILE: 3600, // 1 hour
  
  SEARCH_RESULTS: 3600, // 1 hour
  DIAGNOSTICS: 86400, // 24 hours
  
  DASHBOARD_STATS: 60, // 1 minute
  NOTIFICATIONS: 30, // 30 seconds
} as const

/**
 * Cache tags for on-demand revalidation
 */
export const CACHE_TAGS = {
  REFERENCE: 'reference',
  SPECIES: 'species',
  FORAGE: 'forage',
  ANALYSIS: 'analysis',
  DIAGNOSTIC: 'diagnostic',
  USER: 'user',
  SEARCH: 'search',
} as const

/**
 * Cached data fetcher with automatic revalidation
 * Uses Next.js unstable_cache for server component caching
 */
export function createCachedFetcher<T>(
  fetcher: () => Promise<T>,
  options: {
    tags?: string[]
    revalidate?: number
    keyParts?: string[]
  }
) {
  const cacheKey = options.keyParts?.join(':') || 'default'
  
  return unstable_cache(
    fetcher,
    [cacheKey],
    {
      tags: options.tags,
      revalidate: options.revalidate
    }
  )
}

/**
 * Fetch reference data with caching
 * Optimized for static data that rarely changes
 */
export const getCachedReferenceData = createCachedFetcher(
  async () => {
    const { prisma } = await import('@/lib/prisma')
    return prisma.animalSpecies.findMany({
      include: {
        subtypes: true,
        references: true
      }
    })
  },
  {
    tags: [CACHE_TAGS.REFERENCE, CACHE_TAGS.SPECIES],
    revalidate: CACHE_REVALIDATION.REFERENCE_DATA,
    keyParts: ['reference', 'all']
  }
)

/**
 * Fetch species data with caching
 */
export function getCachedSpeciesData(speciesCode: string) {
  return createCachedFetcher(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      return prisma.animalSpecies.findUnique({
        where: { code: speciesCode },
        include: {
          subtypes: true,
          references: true
        }
      })
    },
    {
      tags: [CACHE_TAGS.SPECIES],
      revalidate: CACHE_REVALIDATION.SPECIES_DATA,
      keyParts: ['species', speciesCode]
    }
  )()
}

/**
 * Fetch user analyses with caching
 */
export function getCachedUserAnalyses(userId: string, limit: number = 20) {
  return createCachedFetcher(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      return prisma.dataset.findMany({
        where: {
          project: {
            ownerId: userId
          },
          status: 'VALIDATED'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        select: {
          id: true,
          name: true,
          filename: true,
          status: true,
          data: true,
          metadata: true,
          createdAt: true,
          projectId: true,
          project: {
            select: {
              name: true,
              id: true
            }
          }
        }
      })
    },
    {
      tags: [CACHE_TAGS.ANALYSIS, `${CACHE_TAGS.USER}:${userId}`],
      revalidate: CACHE_REVALIDATION.USER_ANALYSES,
      keyParts: ['analyses', 'user', userId, limit.toString()]
    }
  )()
}

/**
 * Fetch user saved references with caching
 */
export function getCachedUserReferences(userId: string, limit: number = 50) {
  return createCachedFetcher(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      return prisma.savedReference.findMany({
        where: {
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })
    },
    {
      tags: [`${CACHE_TAGS.USER}:${userId}`],
      revalidate: CACHE_REVALIDATION.USER_REFERENCES,
      keyParts: ['references', 'saved', userId, limit.toString()]
    }
  )()
}

/**
 * Fetch forage data with caching
 */
export const getCachedForageData = createCachedFetcher(
  async () => {
    const { prisma } = await import('@/lib/prisma')
    return prisma.forageReference.findMany({
      orderBy: {
        forageType: 'asc'
      }
    })
  },
  {
    tags: [CACHE_TAGS.FORAGE],
    revalidate: CACHE_REVALIDATION.FORAGE_DATA,
    keyParts: ['forage', 'all']
  }
)

/**
 * Revalidate cache by tag
 * Use this when data changes to invalidate related caches
 */
export async function revalidateCacheTag(tag: string): Promise<void> {
  try {
    revalidateTag(tag)
    console.log(`✅ Revalidated cache tag: ${tag}`)
  } catch (error) {
    console.error(`❌ Error revalidating cache tag ${tag}:`, error)
  }
}

/**
 * Revalidate cache by path
 * Use this to revalidate specific pages
 */
export async function revalidateCachePath(path: string): Promise<void> {
  try {
    revalidatePath(path)
    console.log(`✅ Revalidated cache path: ${path}`)
  } catch (error) {
    console.error(`❌ Error revalidating cache path ${path}:`, error)
  }
}

/**
 * Revalidate user-specific caches
 * Call this when user data changes
 */
export async function revalidateUserCache(userId: string): Promise<void> {
  await revalidateCacheTag(`${CACHE_TAGS.USER}:${userId}`)
}

/**
 * Revalidate analysis caches
 * Call this when analysis data changes
 */
export async function revalidateAnalysisCache(): Promise<void> {
  await revalidateCacheTag(CACHE_TAGS.ANALYSIS)
}

/**
 * Revalidate reference data caches
 * Call this when reference data changes (rare)
 */
export async function revalidateReferenceCache(): Promise<void> {
  await Promise.all([
    revalidateCacheTag(CACHE_TAGS.REFERENCE),
    revalidateCacheTag(CACHE_TAGS.SPECIES),
    revalidateCacheTag(CACHE_TAGS.FORAGE)
  ])
}

/**
 * Route segment configuration presets
 * Use these in your page.tsx or layout.tsx files
 */
export const ROUTE_CONFIG = {
  STATIC: {
    revalidate: 86400, // 24 hours
    dynamic: 'force-static' as const
  },
  
  DYNAMIC_ISR: {
    revalidate: 3600, // 1 hour
    dynamic: 'force-dynamic' as const
  },
  
  REALTIME: {
    revalidate: 0, // No caching
    dynamic: 'force-dynamic' as const
  },
  
  USER_SPECIFIC: {
    revalidate: 300, // 5 minutes
    dynamic: 'force-dynamic' as const
  }
} as const

/**
 * Memoized data fetcher for server components
 * Prevents duplicate fetches within the same request
 */
const fetchCache = new Map<string, Promise<unknown>>()

export function memoizedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  if (fetchCache.has(key)) {
    return fetchCache.get(key) as Promise<T>
  }
  
  const promise = fetcher()
  fetchCache.set(key, promise)
  
  promise.finally(() => {
    setTimeout(() => fetchCache.delete(key), 1000)
  })
  
  return promise
}

/**
 * Preload data for faster navigation
 * Use this in Link components or route prefetching
 */
export function preloadData<T>(fetcher: () => Promise<T>): void {
  fetcher().catch(error => {
    console.error('Preload error:', error)
  })
}

/**
 * Parallel data fetching helper
 * Fetches multiple data sources in parallel for better performance
 */
export async function fetchParallel<T extends Record<string, Promise<unknown>>>(
  fetchers: T
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const keys = Object.keys(fetchers) as Array<keyof T>
  const promises = keys.map(key => fetchers[key])
  
  const results = await Promise.all(promises)
  
  return keys.reduce((acc, key, index) => {
    acc[key] = results[index] as Awaited<T[typeof key]>
    return acc
  }, {} as { [K in keyof T]: Awaited<T[K]> })
}

/**
 * Streaming data fetcher
 * Use for large datasets that can be streamed to the client
 */
export async function* streamData<T>(
  fetcher: () => Promise<T[]>,
  chunkSize: number = 10
): AsyncGenerator<T[], void, unknown> {
  const data = await fetcher()
  
  for (let i = 0; i < data.length; i += chunkSize) {
    yield data.slice(i, i + chunkSize)
  }
}
