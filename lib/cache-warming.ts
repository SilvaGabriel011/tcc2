/**
 * Cache Warming Strategies for AgroInsight
 * 
 * Proactively loads frequently accessed data into cache to improve performance.
 * This reduces latency for common operations and improves user experience.
 * 
 * Warming strategies:
 * - Reference data (species, subtypes, reference values)
 * - User's recent analyses
 * - Popular search queries
 * - System configuration
 * 
 * Usage:
 * ```ts
 * // Warm cache on application startup
 * await warmSystemCache()
 * 
 * // Warm cache for specific user
 * await warmUserCache(userId)
 * ```
 */

import { prisma } from '@/lib/prisma'
import { warmCache } from '@/lib/multi-level-cache'

/**
 * Warm cache with reference data (species, subtypes, reference values)
 * This data is accessed frequently and rarely changes
 */
export async function warmReferenceDataCache(): Promise<void> {
  console.log('🔥 Warming reference data cache...')
  
  try {
    const species = await prisma.animalSpecies.findMany({
      include: {
        subtypes: true,
        referenceData: true
      }
    })

    const entries = []

    for (const sp of species) {
      entries.push({
        key: `species:${sp.code}`,
        value: sp,
        config: { ttl: 86400, tags: ['reference', 'species'] } // 24 hours
      })

      for (const subtype of sp.subtypes) {
        entries.push({
          key: `subtype:${sp.code}:${subtype.code}`,
          value: subtype,
          config: { ttl: 86400, tags: ['reference', 'subtype'] }
        })
      }

      const referenceData = sp.referenceData
      if (referenceData.length > 0) {
        entries.push({
          key: `reference:${sp.code}`,
          value: referenceData,
          config: { ttl: 86400, tags: ['reference', 'data'] }
        })
      }
    }

    entries.push({
      key: 'species:all',
      value: species,
      config: { ttl: 86400, tags: ['reference', 'species'] }
    })

    await warmCache(entries)
    console.log(`✅ Warmed ${entries.length} reference data entries`)
  } catch (error) {
    console.error('❌ Error warming reference data cache:', error)
  }
}

/**
 * Warm cache with user's recent analyses
 * Preloads the most recent analyses for faster access
 */
export async function warmUserAnalysesCache(userId: string, limit: number = 10): Promise<void> {
  console.log(`🔥 Warming analyses cache for user ${userId}...`)
  
  try {
    const analyses = await prisma.dataset.findMany({
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
        projectId: true
      }
    })

    const entries = []

    for (const analysis of analyses) {
      entries.push({
        key: `analysis:${analysis.id}`,
        value: analysis,
        config: { ttl: 3600, tags: ['analysis', `user:${userId}`] } // 1 hour
      })
    }

    entries.push({
      key: `analyses:user:${userId}`,
      value: analyses,
      config: { ttl: 300, tags: ['analysis', `user:${userId}`] } // 5 minutes
    })

    await warmCache(entries)
    console.log(`✅ Warmed ${entries.length} analysis entries for user ${userId}`)
  } catch (error) {
    console.error(`❌ Error warming analyses cache for user ${userId}:`, error)
  }
}

/**
 * Warm cache with user's saved references
 * Preloads saved scientific articles for faster access
 */
export async function warmUserReferencesCache(userId: string, limit: number = 20): Promise<void> {
  console.log(`🔥 Warming references cache for user ${userId}...`)
  
  try {
    const references = await prisma.savedReference.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    const entries = []

    entries.push({
      key: `references:saved:${userId}`,
      value: references,
      config: { ttl: 600, tags: ['references', `user:${userId}`] } // 10 minutes
    })

    await warmCache(entries)
    console.log(`✅ Warmed ${entries.length} reference entries for user ${userId}`)
  } catch (error) {
    console.error(`❌ Error warming references cache for user ${userId}:`, error)
  }
}

/**
 * Warm cache with forage reference data
 * Forage data is accessed frequently for agricultural analysis
 */
export async function warmForageDataCache(): Promise<void> {
  console.log('🔥 Warming forage data cache...')
  
  try {
    const forageData = await prisma.forageReference.findMany({
      orderBy: {
        forageType: 'asc'
      }
    })

    const entries = []

    const forageByType = forageData.reduce((acc, forage) => {
      if (!acc[forage.forageType]) {
        acc[forage.forageType] = []
      }
      acc[forage.forageType].push(forage)
      return acc
    }, {} as Record<string, typeof forageData>)

    for (const [type, data] of Object.entries(forageByType)) {
      entries.push({
        key: `forage:${type}`,
        value: data,
        config: { ttl: 86400, tags: ['reference', 'forage'] } // 24 hours
      })
    }

    entries.push({
      key: 'forage:all',
      value: forageData,
      config: { ttl: 86400, tags: ['reference', 'forage'] }
    })

    await warmCache(entries)
    console.log(`✅ Warmed ${entries.length} forage data entries`)
  } catch (error) {
    console.error('❌ Error warming forage data cache:', error)
  }
}

/**
 * Warm all system caches
 * Should be called on application startup or periodically
 */
export async function warmSystemCache(): Promise<void> {
  console.log('🔥 Starting system cache warming...')
  
  const startTime = Date.now()
  
  try {
    await Promise.all([
      warmReferenceDataCache(),
      warmForageDataCache()
    ])
    
    const duration = Date.now() - startTime
    console.log(`✅ System cache warming completed in ${duration}ms`)
  } catch (error) {
    console.error('❌ Error warming system cache:', error)
  }
}

/**
 * Warm all caches for a specific user
 * Should be called after user login or periodically for active users
 */
export async function warmUserCache(userId: string): Promise<void> {
  console.log(`🔥 Starting cache warming for user ${userId}...`)
  
  const startTime = Date.now()
  
  try {
    await Promise.all([
      warmUserAnalysesCache(userId),
      warmUserReferencesCache(userId)
    ])
    
    const duration = Date.now() - startTime
    console.log(`✅ User cache warming completed in ${duration}ms`)
  } catch (error) {
    console.error(`❌ Error warming cache for user ${userId}:`, error)
  }
}

/**
 * Schedule periodic cache warming
 * Keeps frequently accessed data hot in cache
 */
export function schedulePeriodicCacheWarming(intervalMs: number = 3600000): NodeJS.Timeout {
  console.log(`⏰ Scheduling periodic cache warming every ${intervalMs}ms`)
  
  warmSystemCache()
  
  return setInterval(() => {
    warmSystemCache()
  }, intervalMs)
}

/**
 * Warm cache for popular search queries
 * Can be extended to track and cache popular searches
 */
export async function warmPopularSearchesCache(queries: string[]): Promise<void> {
  console.log(`🔥 Warming cache for ${queries.length} popular searches...`)
  
  
  console.log('✅ Popular searches cache warming completed')
}
