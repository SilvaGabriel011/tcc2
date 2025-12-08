import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * POST /api/calculator/history
 * Saves a calculator usage record
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    const { calculationType, inputValues, result } = body

    if (!calculationType || !result) {
      return NextResponse.json(
        { error: 'Tipo de cálculo e resultado são obrigatórios' },
        { status: 400 }
      )
    }

    const calculatorHistory = await prisma.calculatorHistory.create({
      data: {
        userId,
        calculationType,
        inputValues: JSON.stringify(inputValues || {}),
        result: String(result),
      },
    })

    logger.info('Cálculo salvo no histórico', {
      userId,
      calculationType,
      historyId: calculatorHistory.id,
    })

    return NextResponse.json({
      success: true,
      data: calculatorHistory,
    })
  } catch (error) {
    logger.error('Erro ao salvar histórico da calculadora', error)
    return NextResponse.json({ error: 'Erro ao salvar histórico' }, { status: 500 })
  }
}

/**
 * GET /api/calculator/history
 * Returns calculator history for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    const history = await prisma.calculatorHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
    })
  } catch (error) {
    logger.error('Erro ao buscar histórico da calculadora', error)
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
  }
}
