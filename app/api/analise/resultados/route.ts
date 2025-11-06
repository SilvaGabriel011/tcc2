import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { multiLevelCache } from '@/lib/multi-level-cache'
import { getPaginationFromRequest, buildPaginatedResponse } from '@/lib/pagination'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Get pagination parameters
    const pagination = getPaginationFromRequest(request)
    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 20)
    const take = pagination.limit || 20

    const cacheKey = `resultados:${session.user.id}:p${pagination.page}:l${pagination.limit}`
    
    const cachedData = await multiLevelCache.get<{
      analyses: unknown[]
      total: number
    }>(cacheKey, async () => {
      console.log('🔍 L3 Database fetch: Loading analyses from database')
      
      const [analyses, total] = await Promise.all([
        prisma.dataset.findMany({
          where: {
            status: 'VALIDATED',
            project: {
              ownerId: session.user.id
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
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
          },
          skip,
          take
        }),
        prisma.dataset.count({
          where: {
            status: 'VALIDATED',
            project: {
              ownerId: session.user.id
            }
          }
        })
      ])
      
      return { analyses, total }
    })

    if (!cachedData) {
      return NextResponse.json(
        { error: 'Erro ao buscar análises' },
        { status: 500 }
      )
    }

    // Build paginated response
    const paginatedResponse = buildPaginatedResponse(
      cachedData.analyses,
      cachedData.total,
      pagination
    )

    return NextResponse.json({
      success: true,
      ...paginatedResponse,
      cacheStats: multiLevelCache.getStats()
    })

  } catch (error) {
    console.error('Erro ao buscar análises:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
