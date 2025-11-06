/**
 * Cache Metrics and Monitoring Utilities for AgroInsight
 * 
 * Provides comprehensive monitoring and analytics for the caching system:
 * - Real-time cache performance metrics
 * - Hit rate tracking
 * - Cache size monitoring
 * - Performance analytics
 * - Health checks
 * 
 * Features:
 * - Multi-level cache statistics
 * - Performance trend analysis
 * - Cache efficiency scoring
 * - Automated health checks
 * - Metric export for monitoring tools
 * 
 * Benefits:
 * - Identify cache performance issues
 * - Optimize cache configuration
 * - Monitor system health
 * - Track cache effectiveness
 */

import { multiLevelCache, getCacheStats } from '@/lib/multi-level-cache'
import { cacheManager } from '@/lib/cache-manager'

/**
 * Cache performance metrics
 */
export interface CachePerformanceMetrics {
  timestamp: number
  multiLevel: {
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
  legacy: {
    hits: number
    misses: number
    sets: number
    errors: number
    hitRate: string
  }
  performance: {
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
  }
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    issues: string[]
  }
}

/**
 * Cache health status
 */
export interface CacheHealthStatus {
  healthy: boolean
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    name: string
    passed: boolean
    message: string
  }[]
  timestamp: number
}

/**
 * Response time tracker
 */
class ResponseTimeTracker {
  private times: number[] = []
  private maxSamples = 1000

  add(time: number): void {
    this.times.push(time)
    if (this.times.length > this.maxSamples) {
      this.times.shift()
    }
  }

  getAverage(): number {
    if (this.times.length === 0) return 0
    return this.times.reduce((a, b) => a + b, 0) / this.times.length
  }

  getPercentile(percentile: number): number {
    if (this.times.length === 0) return 0
    const sorted = [...this.times].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index] || 0
  }

  clear(): void {
    this.times = []
  }
}

const responseTimeTracker = new ResponseTimeTracker()

/**
 * Track cache operation response time
 */
export function trackCacheResponseTime(operation: () => Promise<unknown>): Promise<unknown> {
  const startTime = Date.now()
  return operation().finally(() => {
    const duration = Date.now() - startTime
    responseTimeTracker.add(duration)
  })
}

/**
 * Get comprehensive cache metrics
 */
export async function getCacheMetrics(): Promise<CachePerformanceMetrics> {
  const multiLevelStats = getCacheStats()
  const legacyStats = cacheManager.getStats()
  const legacyHitRate = cacheManager.getHitRate()

  const health = await checkCacheHealth()

  return {
    timestamp: Date.now(),
    multiLevel: multiLevelStats,
    legacy: {
      ...legacyStats,
      hitRate: legacyHitRate.toFixed(2) + '%'
    },
    performance: {
      avgResponseTime: responseTimeTracker.getAverage(),
      p95ResponseTime: responseTimeTracker.getPercentile(95),
      p99ResponseTime: responseTimeTracker.getPercentile(99)
    },
    health: {
      status: health.status,
      issues: health.checks.filter(c => !c.passed).map(c => c.message)
    }
  }
}

/**
 * Check cache health
 */
export async function checkCacheHealth(): Promise<CacheHealthStatus> {
  const checks = []
  let healthy = true

  const multiLevelStats = getCacheStats()
  const hitRate = parseFloat(multiLevelStats.overall.hitRate)

  checks.push({
    name: 'Hit Rate',
    passed: hitRate >= 50,
    message: hitRate >= 50 
      ? `Hit rate is healthy: ${hitRate.toFixed(2)}%`
      : `Hit rate is low: ${hitRate.toFixed(2)}% (expected >= 50%)`
  })

  if (hitRate < 50) healthy = false

  checks.push({
    name: 'L1 Cache Capacity',
    passed: multiLevelStats.l1.size < multiLevelStats.l1.capacity * 0.9,
    message: multiLevelStats.l1.size < multiLevelStats.l1.capacity * 0.9
      ? `L1 cache has sufficient capacity: ${multiLevelStats.l1.size}/${multiLevelStats.l1.capacity}`
      : `L1 cache is near capacity: ${multiLevelStats.l1.size}/${multiLevelStats.l1.capacity}`
  })

  if (multiLevelStats.l1.size >= multiLevelStats.l1.capacity * 0.9) healthy = false

  checks.push({
    name: 'L2 Cache Errors',
    passed: multiLevelStats.l2.errors < 10,
    message: multiLevelStats.l2.errors < 10
      ? `L2 cache errors are acceptable: ${multiLevelStats.l2.errors}`
      : `L2 cache has too many errors: ${multiLevelStats.l2.errors}`
  })

  if (multiLevelStats.l2.errors >= 10) healthy = false

  const avgResponseTime = responseTimeTracker.getAverage()
  checks.push({
    name: 'Response Time',
    passed: avgResponseTime < 100,
    message: avgResponseTime < 100
      ? `Average response time is good: ${avgResponseTime.toFixed(2)}ms`
      : `Average response time is high: ${avgResponseTime.toFixed(2)}ms (expected < 100ms)`
  })

  if (avgResponseTime >= 100) healthy = false

  checks.push({
    name: 'Multi-Level Cache',
    passed: multiLevelCache.isEnabled(),
    message: multiLevelCache.isEnabled()
      ? 'Multi-level cache is enabled'
      : 'Multi-level cache is disabled'
  })

  if (!multiLevelCache.isEnabled()) healthy = false

  const status = healthy ? 'healthy' : (checks.filter(c => !c.passed).length > 2 ? 'unhealthy' : 'degraded')

  return {
    healthy,
    status,
    checks,
    timestamp: Date.now()
  }
}

/**
 * Get cache efficiency score (0-100)
 */
export function getCacheEfficiencyScore(): number {
  const stats = getCacheStats()
  const hitRate = parseFloat(stats.overall.hitRate)
  
  let score = hitRate

  if (stats.l2.errors > 0) {
    score -= stats.l2.errors * 2
  }

  const avgResponseTime = responseTimeTracker.getAverage()
  if (avgResponseTime > 50) {
    score -= (avgResponseTime - 50) / 10
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Export metrics in Prometheus format
 */
export function exportMetricsPrometheus(): string {
  const stats = getCacheStats()
  const legacyStats = cacheManager.getStats()
  const avgResponseTime = responseTimeTracker.getAverage()
  const p95ResponseTime = responseTimeTracker.getPercentile(95)
  const p99ResponseTime = responseTimeTracker.getPercentile(99)

  return `
# HELP cache_l1_size Current size of L1 cache
# TYPE cache_l1_size gauge
cache_l1_size ${stats.l1.size}

# HELP cache_l1_capacity Maximum capacity of L1 cache
# TYPE cache_l1_capacity gauge
cache_l1_capacity ${stats.l1.capacity}

# HELP cache_l1_hits Total number of L1 cache hits
# TYPE cache_l1_hits counter
cache_l1_hits ${stats.l1.hits}

# HELP cache_l1_misses Total number of L1 cache misses
# TYPE cache_l1_misses counter
cache_l1_misses ${stats.l1.misses}

# HELP cache_l2_hits Total number of L2 cache hits
# TYPE cache_l2_hits counter
cache_l2_hits ${stats.l2.hits}

# HELP cache_l2_misses Total number of L2 cache misses
# TYPE cache_l2_misses counter
cache_l2_misses ${stats.l2.misses}

# HELP cache_l2_errors Total number of L2 cache errors
# TYPE cache_l2_errors counter
cache_l2_errors ${stats.l2.errors}

# HELP cache_hit_rate Overall cache hit rate percentage
# TYPE cache_hit_rate gauge
cache_hit_rate ${parseFloat(stats.overall.hitRate)}

# HELP cache_response_time_avg Average cache response time in milliseconds
# TYPE cache_response_time_avg gauge
cache_response_time_avg ${avgResponseTime}

# HELP cache_response_time_p95 95th percentile cache response time in milliseconds
# TYPE cache_response_time_p95 gauge
cache_response_time_p95 ${p95ResponseTime}

# HELP cache_response_time_p99 99th percentile cache response time in milliseconds
# TYPE cache_response_time_p99 gauge
cache_response_time_p99 ${p99ResponseTime}

# HELP cache_efficiency_score Cache efficiency score (0-100)
# TYPE cache_efficiency_score gauge
cache_efficiency_score ${getCacheEfficiencyScore()}

# HELP cache_legacy_hits Total number of legacy cache hits
# TYPE cache_legacy_hits counter
cache_legacy_hits ${legacyStats.hits}

# HELP cache_legacy_misses Total number of legacy cache misses
# TYPE cache_legacy_misses counter
cache_legacy_misses ${legacyStats.misses}

# HELP cache_legacy_sets Total number of legacy cache sets
# TYPE cache_legacy_sets counter
cache_legacy_sets ${legacyStats.sets}

# HELP cache_legacy_errors Total number of legacy cache errors
# TYPE cache_legacy_errors counter
cache_legacy_errors ${legacyStats.errors}
`.trim()
}

/**
 * Export metrics in JSON format
 */
export async function exportMetricsJSON(): Promise<string> {
  const metrics = await getCacheMetrics()
  return JSON.stringify(metrics, null, 2)
}

/**
 * Log cache metrics to console
 */
export async function logCacheMetrics(): Promise<void> {
  const metrics = await getCacheMetrics()
  
  console.log('\n📊 Cache Performance Metrics')
  console.log('━'.repeat(50))
  console.log(`Timestamp: ${new Date(metrics.timestamp).toISOString()}`)
  console.log('\n🔹 Multi-Level Cache:')
  console.log(`  L1: ${metrics.multiLevel.l1.size}/${metrics.multiLevel.l1.capacity} (${metrics.multiLevel.l1.hitRate} hit rate)`)
  console.log(`  L2: ${metrics.multiLevel.l2.hits} hits, ${metrics.multiLevel.l2.misses} misses, ${metrics.multiLevel.l2.errors} errors`)
  console.log(`  Overall: ${metrics.multiLevel.overall.hitRate} hit rate`)
  console.log('\n🔹 Legacy Cache:')
  console.log(`  ${metrics.legacy.hits} hits, ${metrics.legacy.misses} misses (${metrics.legacy.hitRate} hit rate)`)
  console.log('\n🔹 Performance:')
  console.log(`  Avg: ${metrics.performance.avgResponseTime.toFixed(2)}ms`)
  console.log(`  P95: ${metrics.performance.p95ResponseTime.toFixed(2)}ms`)
  console.log(`  P99: ${metrics.performance.p99ResponseTime.toFixed(2)}ms`)
  console.log('\n🔹 Health:')
  console.log(`  Status: ${metrics.health.status}`)
  if (metrics.health.issues.length > 0) {
    console.log(`  Issues: ${metrics.health.issues.join(', ')}`)
  }
  console.log(`\n🎯 Efficiency Score: ${getCacheEfficiencyScore().toFixed(2)}/100`)
  console.log('━'.repeat(50) + '\n')
}

/**
 * Monitor cache performance continuously
 */
export function startCacheMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
  console.log(`📊 Starting cache monitoring (interval: ${intervalMs}ms)`)
  
  logCacheMetrics()
  
  return setInterval(() => {
    logCacheMetrics()
  }, intervalMs)
}

/**
 * Stop cache monitoring
 */
export function stopCacheMonitoring(timer: NodeJS.Timeout): void {
  clearInterval(timer)
  console.log('📊 Cache monitoring stopped')
}

/**
 * Reset cache metrics
 */
export function resetCacheMetrics(): void {
  responseTimeTracker.clear()
  cacheManager.resetStats()
  console.log('📊 Cache metrics reset')
}

/**
 * Get cache recommendations based on metrics
 */
export async function getCacheRecommendations(): Promise<string[]> {
  const recommendations: string[] = []
  const stats = getCacheStats()
  const hitRate = parseFloat(stats.overall.hitRate)
  const health = await checkCacheHealth()

  if (hitRate < 50) {
    recommendations.push('Consider increasing cache TTL values to improve hit rate')
    recommendations.push('Review cache warming strategy to preload frequently accessed data')
  }

  if (stats.l1.size >= stats.l1.capacity * 0.9) {
    recommendations.push('L1 cache is near capacity - consider increasing capacity')
  }

  if (stats.l2.errors > 5) {
    recommendations.push('L2 cache has errors - check Redis connection and configuration')
  }

  const avgResponseTime = responseTimeTracker.getAverage()
  if (avgResponseTime > 100) {
    recommendations.push('Cache response time is high - consider optimizing cache operations')
  }

  if (health.status === 'unhealthy') {
    recommendations.push('Cache health is unhealthy - immediate attention required')
  }

  if (recommendations.length === 0) {
    recommendations.push('Cache performance is optimal - no recommendations at this time')
  }

  return recommendations
}
