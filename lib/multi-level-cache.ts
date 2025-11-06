/**
 * Multi-Level Cache System
 * 
 * Implements a three-tier caching strategy:
 * - L1: In-memory cache (fastest, smallest capacity)
 * - L2: Redis cache (fast, distributed)
 * - L3: Database (slowest, persistent)
 * 
 * Features:
 * - Automatic cache promotion (L3 -> L2 -> L1)
 * - TTL management per level
 * - Cache warming strategies
 * - Hit/miss statistics
 * - Automatic invalidation cascading
 */

import { Redis } from '@upstash/redis'
import { LRUCache } from 'lru-cache'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface MultiLevelCacheConfig {
  l1MaxSize?: number
  l1TTL?: number
  l2TTL?: number
  enableL1?: boolean
  enableL2?: boolean
}

interface CacheStats {
  l1Hits: number
  l1Misses: number
  l2Hits: number
  l2Misses: number
  l3Hits: number
  l3Misses: number
  promotions: number
  invalidations: number
}

/**
 * Multi-Level Cache Manager
 * Provides transparent caching across three levels
 */
export class MultiLevelCache {
  private l1Cache: LRUCache<string, CacheEntry<unknown>>
  private redis: Redis | null
  private stats: CacheStats
  private config: Required<MultiLevelCacheConfig>
  
  constructor(config: MultiLevelCacheConfig = {}) {
    this.config = {
      l1MaxSize: config.l1MaxSize || 100,
      l1TTL: config.l1TTL || 60,
      l2TTL: config.l2TTL || 3600,
      enableL1: config.enableL1 ?? true,
      enableL2: config.enableL2 ?? true
    }
    
    this.l1Cache = new LRUCache<string, CacheEntry<unknown>>({
      max: this.config.l1MaxSize,
      ttl: this.config.l1TTL * 1000,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    })
    
    this.redis = this.initRedis()
    
    this.stats = {
      l1Hits: 0,
      l1Misses: 0,
      l2Hits: 0,
      l2Misses: 0,
      l3Hits: 0,
      l3Misses: 0,
      promotions: 0,
      invalidations: 0
    }
  }
  
  private initRedis(): Redis | null {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    if (!redisUrl || !redisToken || !this.config.enableL2) {
      console.warn('⚠️ Redis (L2) cache disabled')
      return null
    }
    
    try {
      return new Redis({
        url: redisUrl,
        token: redisToken
      })
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error)
      return null
    }
  }
  
  /**
   * Get value from cache (checks L1 -> L2 -> L3)
   */
  async get<T>(key: string, l3Fetcher?: () => Promise<T>): Promise<T | null> {
    const now = Date.now()
    
    if (this.config.enableL1) {
      const l1Entry = this.l1Cache.get(key) as CacheEntry<T> | undefined
      if (l1Entry && (now - l1Entry.timestamp) < l1Entry.ttl * 1000) {
        this.stats.l1Hits++
        console.log(`✅ L1 Cache HIT: ${key}`)
        return l1Entry.data
      }
      this.stats.l1Misses++
    }
    
    if (this.redis && this.config.enableL2) {
      try {
        const l2Data = await this.redis.get(key)
        if (l2Data !== null) {
          this.stats.l2Hits++
          console.log(`✅ L2 Cache HIT: ${key}`)
          
          const data = typeof l2Data === 'string' ? JSON.parse(l2Data) : l2Data
          
          if (this.config.enableL1) {
            this.promoteToL1(key, data as T, this.config.l1TTL)
          }
          
          return data as T
        }
        this.stats.l2Misses++
      } catch (error) {
        console.error(`L2 cache error for ${key}:`, error)
      }
    }
    
    if (l3Fetcher) {
      try {
        console.log(`🔍 L3 Fetch: ${key}`)
        const data = await l3Fetcher()
        
        if (data !== null && data !== undefined) {
          this.stats.l3Hits++
          await this.set(key, data, {
            l1TTL: this.config.l1TTL,
            l2TTL: this.config.l2TTL
          })
          return data
        }
        
        this.stats.l3Misses++
      } catch (error) {
        console.error(`L3 fetch error for ${key}:`, error)
        this.stats.l3Misses++
      }
    }
    
    return null
  }
  
  /**
   * Set value in all cache levels
   */
  async set<T>(
    key: string,
    data: T,
    options: { l1TTL?: number; l2TTL?: number } = {}
  ): Promise<void> {
    const l1TTL = options.l1TTL || this.config.l1TTL
    const l2TTL = options.l2TTL || this.config.l2TTL
    
    if (this.config.enableL1) {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: l1TTL
      }
      this.l1Cache.set(key, entry as CacheEntry<unknown>)
      console.log(`💾 L1 Cache SET: ${key} (TTL: ${l1TTL}s)`)
    }
    
    if (this.redis && this.config.enableL2) {
      try {
        await this.redis.setex(key, l2TTL, JSON.stringify(data))
        console.log(`💾 L2 Cache SET: ${key} (TTL: ${l2TTL}s)`)
      } catch (error) {
        console.error(`L2 cache set error for ${key}:`, error)
      }
    }
  }
  
  /**
   * Promote data from L2 to L1
   */
  private promoteToL1<T>(key: string, data: T, ttl: number): void {
    if (!this.config.enableL1) return
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }
    this.l1Cache.set(key, entry as CacheEntry<unknown>)
    this.stats.promotions++
    console.log(`⬆️ Cache promoted to L1: ${key}`)
  }
  
  /**
   * Invalidate key from all cache levels
   */
  async invalidate(key: string): Promise<void> {
    if (this.config.enableL1) {
      this.l1Cache.delete(key)
    }
    
    if (this.redis && this.config.enableL2) {
      try {
        await this.redis.del(key)
      } catch (error) {
        console.error(`L2 cache invalidate error for ${key}:`, error)
      }
    }
    
    this.stats.invalidations++
    console.log(`🗑️ Cache invalidated: ${key}`)
  }
  
  /**
   * Invalidate multiple keys matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (this.config.enableL1) {
      const keysToDelete: string[] = []
      for (const key of this.l1Cache.keys()) {
        if (this.matchPattern(key, pattern)) {
          keysToDelete.push(key)
        }
      }
      keysToDelete.forEach(key => this.l1Cache.delete(key))
    }
    
    if (this.redis && this.config.enableL2) {
      try {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      } catch (error) {
        console.error(`L2 cache pattern invalidate error for ${pattern}:`, error)
      }
    }
    
    this.stats.invalidations++
    console.log(`🗑️ Cache pattern invalidated: ${pattern}`)
  }
  
  /**
   * Warm cache with data
   */
  async warm<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
    try {
      const data = await fetcher()
      await this.set(key, data)
      console.log(`🔥 Cache warmed: ${key}`)
    } catch (error) {
      console.error(`Cache warm error for ${key}:`, error)
    }
  }
  
  /**
   * Batch warm multiple keys
   */
  async warmBatch(items: Array<{ key: string; fetcher: () => Promise<unknown> }>): Promise<void> {
    await Promise.allSettled(
      items.map(item => this.warm(item.key, item.fetcher))
    )
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number; l1HitRate: number; l2HitRate: number } {
    const totalRequests = 
      this.stats.l1Hits + this.stats.l1Misses +
      this.stats.l2Hits + this.stats.l2Misses +
      this.stats.l3Hits + this.stats.l3Misses
    
    const totalHits = this.stats.l1Hits + this.stats.l2Hits + this.stats.l3Hits
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0
    
    const l1Total = this.stats.l1Hits + this.stats.l1Misses
    const l1HitRate = l1Total > 0 ? (this.stats.l1Hits / l1Total) * 100 : 0
    
    const l2Total = this.stats.l2Hits + this.stats.l2Misses
    const l2HitRate = l2Total > 0 ? (this.stats.l2Hits / l2Total) * 100 : 0
    
    return {
      ...this.stats,
      hitRate,
      l1HitRate,
      l2HitRate
    }
  }
  
  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      l1Hits: 0,
      l1Misses: 0,
      l2Hits: 0,
      l2Misses: 0,
      l3Hits: 0,
      l3Misses: 0,
      promotions: 0,
      invalidations: 0
    }
  }
  
  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    if (this.config.enableL1) {
      this.l1Cache.clear()
    }
    
    if (this.redis && this.config.enableL2) {
      try {
        await this.redis.flushdb()
      } catch (error) {
        console.error('L2 cache clear error:', error)
      }
    }
    
    console.log('🗑️ All caches cleared')
  }
  
  /**
   * Get L1 cache size
   */
  getL1Size(): number {
    return this.l1Cache.size
  }
  
  /**
   * Check if pattern matches key
   */
  private matchPattern(key: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(key)
  }
}

/**
 * Singleton instance for global use
 */
export const multiLevelCache = new MultiLevelCache({
  l1MaxSize: 200,
  l1TTL: 60,
  l2TTL: 3600,
  enableL1: true,
  enableL2: true
})

/**
 * Convenience functions
 */
export const {
  get: getCached,
  set: setCached,
  invalidate: invalidateCached,
  invalidatePattern: invalidateCachedPattern,
  warm: warmCache,
  warmBatch: warmCacheBatch,
  getStats: getCacheStats,
  clear: clearCache
} = {
  get: multiLevelCache.get.bind(multiLevelCache),
  set: multiLevelCache.set.bind(multiLevelCache),
  invalidate: multiLevelCache.invalidate.bind(multiLevelCache),
  invalidatePattern: multiLevelCache.invalidatePattern.bind(multiLevelCache),
  warm: multiLevelCache.warm.bind(multiLevelCache),
  warmBatch: multiLevelCache.warmBatch.bind(multiLevelCache),
  getStats: multiLevelCache.getStats.bind(multiLevelCache),
  clear: multiLevelCache.clear.bind(multiLevelCache)
}
