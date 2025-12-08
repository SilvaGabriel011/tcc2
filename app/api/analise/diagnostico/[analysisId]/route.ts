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

    // Interface matching the RawDiagnostico type expected by the frontend
    interface DiagnosticoPayload {
      diagnostico: string
      geradoEm: string
      metodo: string
      resumoExecutivo?: string
      analiseNumericas?: Array<{
        variavel: string
        status: string
        interpretacao: string
        comparacaoLiteratura?: string
      }>
      pontosFortes?: string[]
      pontosAtencao?: string[]
      recomendacoesPrioritarias?: Array<{
        titulo: string
        descricao: string
        prioridade: string
      }>
      conclusao?: string
      fontes?: string[]
      generatedBy?: string
    }

    const cachedDiagnostico = await getCache<DiagnosticoPayload>(cacheKey)

    // Validate cached data has the expected shape before using it
    // This prevents issues with stale cache entries from before format changes
    const isValidCachedDiagnostico =
      cachedDiagnostico &&
      typeof cachedDiagnostico === 'object' &&
      'diagnostico' in cachedDiagnostico &&
      ('resumoExecutivo' in cachedDiagnostico || 'recomendacoesPrioritarias' in cachedDiagnostico)

    if (isValidCachedDiagnostico) {
      return NextResponse.json({
        success: true,
        diagnostico: cachedDiagnostico,
        cached: true,
      })
    } else if (cachedDiagnostico) {
      // Invalid cache entry - invalidate it so it gets regenerated
      console.warn(`⚠️ Invalid cached diagnostic for ${analysisId}, regenerating...`)
      await setCache(cacheKey, null, { ttl: 1 }) // Expire immediately
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

    // Preparar resposta no formato esperado pelo frontend (RawDiagnostico)
    // FIX: The frontend expects data.diagnostico to be the full object, not just a string
    // Previously, the response was spread at root level which caused the frontend to receive
    // only the string "Diagnóstico gerado para X" instead of the full diagnostic object
    const diagnosticoPayload: DiagnosticoPayload = {
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
    await setCache(cacheKey, diagnosticoPayload, {
      ttl: 86400,
      tags: ['diagnostic', `analysis:${analysisId}`],
    })

    // FIX: Return diagnostico nested under 'diagnostico' key to match frontend expectation
    // Both cached and non-cached paths now return the same structure
    return NextResponse.json({
      success: true,
      diagnostico: diagnosticoPayload,
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
