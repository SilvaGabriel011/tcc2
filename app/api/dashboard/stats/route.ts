import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/stats
 * Retorna estatísticas do dashboard do usuário
 */
export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    logger.info('Buscando estatísticas do dashboard', { userId })

    // Buscar análises realizadas
    const analysesCount = await prisma.dataset.count({
      where: {
        project: {
          ownerId: userId,
        },
      },
    })

    // Buscar artigos salvos
    const savedArticlesCount = await prisma.savedReference.count({
      where: {
        userId,
      },
    })

    // Buscar quantidade de cálculos realizados na calculadora zootécnica
    const calculationsCount = await prisma.calculatorHistory.count({
      where: {
        userId,
      },
    })

    const stats = {
      analysesCount,
      calculationsCount,
      savedArticlesCount,
    }

    logger.success('Estatísticas recuperadas', stats)

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    logger.error('Erro ao buscar estatísticas do dashboard', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
