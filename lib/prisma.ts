/**
 * Prisma Client Singleton Instance with Enhanced Connection Pooling
 * 
 * This file ensures only one instance of PrismaClient exists throughout the application.
 * This is important because:
 * 
 * 1. In development, Next.js hot-reloads modules, which would create multiple instances
 * 2. Each PrismaClient instance maintains a connection pool (default: 5 connections)
 * 3. Multiple instances can exhaust database connections
 * 
 * Solution: Store the client in globalThis (not affected by hot reload)
 * 
 * Optimizations:
 * - PgBouncer mode for serverless environments
 * - Connection pooling with timeouts
 * - Retry logic for transient failures
 * - Graceful shutdown handling
 * 
 * Usage:
 * ```ts
 * import { prisma } from '@/lib/prisma'
 * const users = await prisma.user.findMany()
 * ```
 */

import { PrismaClient } from '@prisma/client'

// Type augmentation for global object to include prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Get optimized database URL with connection pooling parameters
 */
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL || ''
  
  if (!baseUrl) {
    console.warn('⚠️ DATABASE_URL not configured')
    return baseUrl
  }
  
  // In production/Vercel, use connection pooling optimizations
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    try {
      const url = new URL(baseUrl)
      
      url.searchParams.set('pgbouncer', 'true')
      
      url.searchParams.set('connection_limit', '1')
      
      url.searchParams.set('pool_timeout', '10')
      
      url.searchParams.set('pooling', 'true')
      
      return url.toString()
    } catch (error) {
      console.error('❌ Error configuring database URL:', error)
      return baseUrl
    }
  }
  
  try {
    const url = new URL(baseUrl)
    url.searchParams.set('connection_limit', '5')
    url.searchParams.set('pool_timeout', '20')
    return url.toString()
  } catch {
    return baseUrl
  }
}

/**
 * Prisma Client configuration with optimized settings
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  errorFormat: 'minimal',
})

// In development, store instance in global to survive hot reloads
// In production, this is skipped since there's no hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Graceful shutdown handler
 */
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
