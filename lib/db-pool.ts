/**
 * Database Connection Pool Utilities
 * 
 * Provides utilities for database connection management:
 * - Health checks
 * - Retry logic for transient failures
 * - Connection pool metrics
 */

import { prisma } from './prisma'

/**
 * Connection pool health check
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    return false
  }
}

/**
 * Retry logic for database operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw error
      }
      
      if (attempt < maxRetries) {
        console.warn(`⚠️ Retry attempt ${attempt}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
      }
    }
  }
  
  throw lastError
}

/**
 * Connection pool metrics
 */
export async function getPoolMetrics() {
  try {
    const metrics = await prisma.$metrics.json()
    return {
      activeConnections: metrics.counters.find(c => c.key === 'prisma_client_queries_active')?.value || 0,
      totalQueries: metrics.counters.find(c => c.key === 'prisma_client_queries_total')?.value || 0,
    }
  } catch (error) {
    console.error('❌ Failed to get pool metrics:', error)
    return {
      activeConnections: 0,
      totalQueries: 0,
    }
  }
}
