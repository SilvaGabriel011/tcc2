/**
 * Prisma Client Singleton Instance
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

// Use existing instance if available, otherwise create new one
// The ?? operator returns right side only if left side is null/undefined
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// In development, store instance in global to survive hot reloads
// In production, this is skipped since there's no hot reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
