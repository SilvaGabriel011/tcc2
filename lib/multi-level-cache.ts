/**
 * Multi-Level Cache Manager for AgroInsight
 *
 * Implements a sophisticated caching strategy with multiple cache levels:
 * - L1: In-memory LRU cache (fastest, limited size)
 * - L2: Redis distributed cache (fast, shared across instances)
 * - L3: Database (fallback)
 *
 * Features:
 * - Automatic cache promotion (L2 -> L1 on access)
 * - Cache warming for frequently accessed data
 * - TTL management per cache level
 * - Cache statistics and monitoring
 * - Graceful degradation on cache failures
 *
 * Benefits:
 * - Ultra-fast response times for hot data (L1)
 * - Reduced Redis load through L1 caching
 * - Better scalability across multiple instances
 * - Improved user experience with cache warming
 */

import { Redis } from '@upstash/redis'

/**
 * LRU Cache Node for doubly-linked list
 */
class CacheNode<T> {
  key: string
  value: T
  prev: CacheNode<T> | null = null
  next: CacheNode<T> | null = null
  expiresAt: number

  constructor(key: string, value: T, ttl: number) {
    this.key = key
    this.value = value
    this.expiresAt = Date.now() + ttl * 1000
  }

  isExpired(): boolean {
    return Date.now() > this.expiresAt
  }
}

/**
 * In-Memory LRU Cache (L1)
 * Provides ultra-fast access to frequently used data
 */
class LRUCache<T> {
  private capacity: number
  private cache: Map<string, CacheNode<T>>
  private head: CacheNode<T> | null = null
  private tail: CacheNode<T> | null = null
  private hits = 0
  private misses = 0

  constructor(capacity: number = 100) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key: string): T | null {
    const node = this.cache.get(key)

    if (!node) {
      this.misses++
      return null
    }

    if (node.isExpired()) {
      this.remove(key)
      this.misses++
      return null
    }

    this.moveToFront(node)
    this.hits++
    return node.value
  }

  set(key: string, value: T, ttl: number): void {
    if (this.cache.has(key)) {
      this.remove(key)
    }

    const node = new CacheNode(key, value, ttl)
    this.cache.set(key, node)
    this.addToFront(node)

    if (this.cache.size > this.capacity) {
      this.evictLRU()
    }
  }

  remove(key: string): void {
    const node = this.cache.get(key)
    if (!node) {
      return
    }

    this.removeNode(node)
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.head = null
    this.tail = null
  }

  getStats() {
    return {
      size: this.cache.size,
      capacity: this.capacity,
      hits: this.hits,
      misses: this.misses,
      hitRate:
        this.hits + this.misses > 0
          ? `${((this.hits / (this.hits + this.misses)) * 100).toFixed(2)}%`
          : '0%',
    }
  }

  private moveToFront(node: CacheNode<T>): void {
    this.removeNode(node)
    this.addToFront(node)
  }

  private addToFront(node: CacheNode<T>): void {
    node.next = this.head
    node.prev = null

    if (this.head) {
      this.head.prev = node
    }

    this.head = node

    if (!this.tail) {
      this.tail = node
    }
  }

  private removeNode(node: CacheNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next
    } else {
      this.head = node.next
    }

    if (node.next) {
      node.next.prev = node.prev
    } else {
      this.tail = node.prev
    }
  }

  private evictLRU(): void {
    if (!this.tail) {
      return
    }

    this.cache.delete(this.tail.key)
    this.removeNode(this.tail)
  }
}

/**
 * Cache configuration options
 */
export interface MultiLevelCacheConfig {
  ttl?: number // Time to live in seconds
  l1Only?: boolean // Only cache in L1 (memory)
  l2Only?: boolean // Only cache in L2 (Redis)
  skipL1?: boolean // Skip L1 cache
  tags?: string[] // Cache tags for group invalidation
}

/**
 * Cache statistics
 */
export interface CacheStatistics {
  l1: {
    size: number
    capacity: number
    hits: number
    misses: number
    hitRate: string
  }
  l2: {
    hits: number
    misses: number
    errors: number
  }
  overall: {
    totalHits: number
    totalMisses: number
    hitRate: string
  }
}

/**
 * Multi-Level Cache Manager
 * Orchestrates caching across memory (L1) and Redis (L2)
 */
class MultiLevelCacheManager {
  private l1Cache: LRUCache<unknown>
  private redis: Redis | null
  private enabled: boolean
  private l2Stats = { hits: 0, misses: 0, errors: 0 }

  constructor(l1Capacity: number = 100) {
    this.l1Cache = new LRUCache(l1Capacity)
    this.enabled = true
    this.redis = this.initRedis()
  }

  /**
   * Initialize Redis connection
   */
  private initRedis(): Redis | null {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!redisUrl || !redisToken) {
      console.warn('⚠️ Redis not configured. Using L1 cache only.')
      return null
    }

    try {
      return new Redis({
        url: redisUrl,
        token: redisToken,
      })
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error)
      return null
    }
  }

  /**
   * Get value from cache (checks L1 first, then L2)
   */
  async get<T>(key: string, config: MultiLevelCacheConfig = {}): Promise<T | null> {
    if (!this.enabled) {
      return null
    }

    if (!config.skipL1 && !config.l2Only) {
      const l1Value = this.l1Cache.get(key)
      if (l1Value !== null) {
        console.log(`✅ L1 Cache HIT: ${key}`)
        return l1Value as T
      }
    }

    if (this.redis && !config.l1Only) {
      try {
        const l2Value = await this.redis.get(key)

        if (l2Value !== null) {
          this.l2Stats.hits++
          console.log(`✅ L2 Cache HIT: ${key}`)

          // Parse JSON string if needed - Upstash may return data as string
          // when it was stored with JSON.stringify
          let parsedValue: T
          if (typeof l2Value === 'string') {
            try {
              parsedValue = JSON.parse(l2Value) as T
            } catch {
              // If parsing fails, use the raw value
              parsedValue = l2Value as T
            }
          } else {
            parsedValue = l2Value as T
          }

          if (!config.skipL1) {
            const ttl = config.ttl || 3600
            this.l1Cache.set(key, parsedValue, ttl)
          }

          return parsedValue
        }

        this.l2Stats.misses++
      } catch (error) {
        this.l2Stats.errors++
        console.error(`❌ L2 Cache error for ${key}:`, error)
      }
    }

    console.log(`❌ Cache MISS: ${key}`)
    return null
  }

  /**
   * Set value in cache (stores in both L1 and L2)
   */
  async set(key: string, value: unknown, config: MultiLevelCacheConfig = {}): Promise<void> {
    if (!this.enabled) {
      return
    }

    const ttl = config.ttl || 3600

    if (!config.l2Only && !config.skipL1) {
      this.l1Cache.set(key, value, ttl)
      console.log(`💾 L1 Cache SET: ${key}`)
    }

    if (this.redis && !config.l1Only) {
      try {
        await this.redis.setex(key, ttl, JSON.stringify(value))

        // Store tags for group invalidation
        if (config.tags && config.tags.length > 0) {
          for (const tag of config.tags) {
            const tagKey = `tag:${tag}`
            await this.redis.sadd(tagKey, key)
            await this.redis.expire(tagKey, ttl)
          }
        }

        console.log(`💾 L2 Cache SET: ${key} (TTL: ${ttl}s)`)
      } catch (error) {
        this.l2Stats.errors++
        console.error(`❌ L2 Cache set error for ${key}:`, error)
      }
    }
  }

  /**
   * Invalidate a specific cache key (both L1 and L2)
   */
  async invalidate(key: string): Promise<void> {
    this.l1Cache.remove(key)

    if (this.redis) {
      try {
        await this.redis.del(key)
        console.log(`🗑️ Cache invalidated: ${key}`)
      } catch (error) {
        console.error(`❌ Cache invalidate error for ${key}:`, error)
      }
    }
  }

  /**
   * Invalidate all keys with a specific tag
   */
  async invalidateTag(tag: string): Promise<void> {
    if (!this.redis) {
      return
    }

    const tagKey = `tag:${tag}`

    try {
      // Get all keys with this tag
      const keys = await this.redis.smembers(tagKey)

      if (keys.length > 0) {
        keys.forEach((key) => this.l1Cache.remove(key))

        await this.redis.del(...keys)
        await this.redis.del(tagKey)

        console.log(`🗑️ Cache tag invalidated: ${tag} (${keys.length} keys)`)
      }
    } catch (error) {
      console.error(`❌ Cache tag invalidate error for ${tag}:`, error)
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warm(
    entries: Array<{ key: string; value: unknown; config?: MultiLevelCacheConfig }>
  ): Promise<void> {
    console.log(`🔥 Warming cache with ${entries.length} entries...`)

    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.config)
    }

    console.log(`✅ Cache warming completed`)
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStatistics {
    const l1Stats = this.l1Cache.getStats()
    const totalHits = parseInt(l1Stats.hits.toString()) + this.l2Stats.hits
    const totalMisses = parseInt(l1Stats.misses.toString()) + this.l2Stats.misses
    const overallHitRate =
      totalHits + totalMisses > 0
        ? `${((totalHits / (totalHits + totalMisses)) * 100).toFixed(2)}%`
        : '0%'

    return {
      l1: l1Stats,
      l2: this.l2Stats,
      overall: {
        totalHits,
        totalMisses,
        hitRate: overallHitRate,
      },
    }
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.l1Cache.clear()

    if (this.redis) {
      try {
        await this.redis.flushdb()
        console.log('🗑️ All caches cleared')
      } catch (error) {
        console.error('❌ Cache clear error:', error)
      }
    }
  }

  /**
   * Check if cache is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Enable/disable cache
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
}

// Export singleton instance
export const multiLevelCache = new MultiLevelCacheManager(100)

// Export convenience functions
export const getCache = <T>(key: string, config?: MultiLevelCacheConfig) =>
  multiLevelCache.get<T>(key, config)

export const setCache = (key: string, value: unknown, config?: MultiLevelCacheConfig) =>
  multiLevelCache.set(key, value, config)

export const invalidateCache = (key: string) => multiLevelCache.invalidate(key)

export const invalidateCacheTag = (tag: string) => multiLevelCache.invalidateTag(tag)

export const warmCache = (
  entries: Array<{ key: string; value: unknown; config?: MultiLevelCacheConfig }>
) => multiLevelCache.warm(entries)

export const getCacheStats = () => multiLevelCache.getStats()

export const clearAllCaches = () => multiLevelCache.clear()
