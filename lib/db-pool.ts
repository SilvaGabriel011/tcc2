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
    const anyPrisma = prisma as unknown as { 
      $metrics?: { 
        json: () => Promise<{ 
          counters: Array<{ key: string; value: number }> 
        }> 
      } 
    }
    
    if (!anyPrisma.$metrics) {
      return {
        activeConnections: 0,
        totalQueries: 0,
      }
    }
    
    const metrics = await anyPrisma.$metrics.json()
    const counters = metrics.counters ?? []
    const getValue = (key: string) => 
      counters.find((c: { key: string; value: number }) => c.key === key)?.value ?? 0
    
    return {
      activeConnections: getValue('prisma_client_queries_active'),
      totalQueries: getValue('prisma_client_queries_total'),
    }
  } catch (error) {
    console.error('❌ Failed to get pool metrics:', error)
    return {
      activeConnections: 0,
      totalQueries: 0,
    }
  }
}
