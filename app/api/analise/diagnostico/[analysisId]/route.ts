import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateAIDiagnostic } from '@/lib/ai-diagnostic'
import { getCache, setCache } from '@/lib/multi-level-cache'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { analysisId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const analysisId = params.analysisId

    // Buscar análise no banco garantindo propriedade do projeto
    const analysis = await prisma.dataset.findFirst({
      where: {
        id: analysisId,
        project: {
          ownerId: session.user.id,
        },
      },
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 })
    }

    const cacheKey = `diagnostico:${analysisId}`
    interface DiagnosticoCache {
      summary: string
      recommendations: string[]
      strengths: string[]
      alerts: string[]
      insights: Record<string, unknown>
      metadata: Record<string, unknown>
    }
    const cachedDiagnostico = await getCache<DiagnosticoCache>(cacheKey)

    if (cachedDiagnostico) {
      return NextResponse.json({
        success: true,
        diagnostico: cachedDiagnostico,
        cached: true,
      })
    }

    const data = JSON.parse(analysis.data)
    const metadata = analysis.metadata ? JSON.parse(analysis.metadata) : {}

    console.log('🔍 Gerando diagnóstico com IA...')
    console.log(
      '📊 Total de variáveis:',
      Object.keys(data.numericStats || data.statistics || {}).length
    )

    // Gerar diagnóstico com IA (Gemini/OpenAI) ou fallback para rule-based
    const diagnosticoData = {
      species: metadata.species || 'unknown',
      subtype: metadata.subtype,
      statistics: data.statistics || { numericStats: data.numericStats },
      references: data.references || {},
      correlations: data.correlations,
      metadata: {
        totalRows: metadata.totalRows,
        totalColumns: metadata.totalColumns,
        validRows: metadata.validRows,
      },
    }

    const diagnosticoResult = await generateAIDiagnostic(diagnosticoData)

    console.log(`✅ Diagnóstico gerado com sucesso (${diagnosticoResult.generatedBy || 'unknown'})`)

    // Preparar resposta no formato esperado pelo frontend
    const response = {
      ...diagnosticoResult,
      diagnostico: `Diagnóstico gerado para ${analysis.name}`,
      geradoEm: new Date().toISOString(),
      metodo:
        diagnosticoResult.generatedBy === 'gemini'
          ? 'Análise com IA (Google Gemini)'
          : diagnosticoResult.generatedBy === 'openai'
            ? 'Análise com IA (OpenAI GPT-4)'
            : 'Análise Estatística Avançada',
    }

    // 💾 MULTI-LEVEL CACHE: Salvar no cache (L1 + L2, 24 horas = 86400s)
    await setCache(cacheKey, response, {
      ttl: 86400,
      tags: ['diagnostic', `analysis:${analysisId}`],
    })

    return NextResponse.json({
      success: true,
      ...response,
      cached: false,
    })
  } catch (error) {
    console.error('❌ Erro ao gerar diagnóstico:', error)

    return NextResponse.json(
      {
        error: 'Erro ao gerar diagnóstico. Tente novamente.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}
