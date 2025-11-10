/**
 * EN: Multi-species analysis API endpoint - handles species-aware data upload and validation
 * PT-BR: Endpoint de API de análise multi-espécie - gerencia upload e validação de dados com consciência de espécie
 *
 * EN: This endpoint processes CSV uploads for different animal species (bovine, swine, poultry, etc.),
 *     validates data against species-specific reference ranges from NRC/EMBRAPA, calculates statistics,
 *     analyzes correlations, and stores results in the database.
 * PT-BR: Este endpoint processa uploads CSV para diferentes espécies animais (bovinos, suínos, aves, etc.),
 *        valida dados contra faixas de referência específicas da espécie do NRC/EMBRAPA, calcula estatísticas,
 *        analisa correlações e armazena resultados no banco de dados.
 */
// app/api/analysis/multi-species/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReferenceDataService } from '@/lib/references/species-references'
import { parseFile } from '@/lib/file-parser'
import { validateUploadedFile, generateUniqueFilename } from '@/lib/upload-security'
import { withRateLimit } from '@/lib/rate-limit'
import {
  analyzeCorrelations,
  proposeCorrelations,
  getMissingVariables,
} from '@/lib/correlations/correlation-analysis'
import {
  safeStep,
  generateCorrelationId,
  AnalysisErrorException,
  ERROR_CODES,
  createAnalysisError,
} from '@/lib/analysis-errors'

/**
 * EN: POST handler for multi-species data analysis
 * PT-BR: Handler POST para análise de dados multi-espécie
 *
 * @param request - EN: FormData with file, species, subtype, projectId | PT-BR: FormData com file, species, subtype, projectId
 * @returns EN: Analysis results with statistics, references, and correlations | PT-BR: Resultados da análise com estatísticas, referências e correlações
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, 'UPLOAD')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const correlationId = generateCorrelationId()
  console.log(`[${correlationId}] 📊 Iniciando análise multi-espécie`)

  try {
    console.log('🔍 [DEBUG] Step 1: Getting session')
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.error('❌ [DEBUG] No session or user')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    if (!session.user.email) {
      console.error('❌ [DEBUG] Session user has no email')
      return NextResponse.json({ error: 'Sessão inválida: email não encontrado' }, { status: 400 })
    }
    console.log('✅ [DEBUG] Session OK:', { email: session.user.email })

    console.log('🔍 [DEBUG] Step 2: Parsing form data')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const species = formData.get('species') as string
    const subtype = formData.get('subtype') as string | null
    const projectId = formData.get('projectId') as string
    console.log('✅ [DEBUG] Form data parsed:', { species, subtype, hasFile: !!file, projectId })

    if (!file || !species) {
      console.error('❌ [DEBUG] Missing file or species')
      return NextResponse.json({ error: 'Arquivo e espécie são obrigatórios' }, { status: 400 })
    }

    console.log('🔍 [DEBUG] Step 3: Security validation')
    // Security validation
    const securityCheck = await validateUploadedFile(file, 'csv')
    if (!securityCheck.valid) {
      console.warn(`[${correlationId}] 🚫 Security check failed:`, securityCheck.error)
      return NextResponse.json(
        {
          error: securityCheck.error,
          warnings: securityCheck.warnings,
        },
        { status: 400 }
      )
    }
    console.log('✅ [DEBUG] Security check passed')

    const secureFilename = generateUniqueFilename(file.name)

    console.log(`[${correlationId}] 📊 Processando arquivo:`, {
      species,
      subtype,
      filename: file.name,
    })

    console.log(`[${correlationId}] [STAGE 1/4] Análise de dados (parsing e validação)`)
    const parseResult = await safeStep(
      'parse',
      async () => {
        const parsed = await parseFile(file)

        if (parsed.errors.length > 0) {
          const errorMessage = parsed.errors.map((e) => e.message).join('; ')
          throw new Error(errorMessage)
        }

        // Validação básica dos dados
        if (!parsed.data || parsed.data.length === 0) {
          throw new AnalysisErrorException(
            'validation',
            ERROR_CODES.EMPTY_FILE,
            undefined,
            correlationId
          )
        }

        // Validação de pontos mínimos de dados
        if (parsed.data.length < 3) {
          throw new AnalysisErrorException(
            'validation',
            ERROR_CODES.INSUFFICIENT_DATA,
            { rows: parsed.data.length },
            correlationId
          )
        }

        const firstRow = parsed.data[0] as Record<string, unknown>
        const numericColumns = Object.keys(firstRow).filter(
          (key) => typeof firstRow[key] === 'number'
        )

    console.log('🔍 [DEBUG] Step 4: Parsing CSV')
    // Parse CSV
    const text = await file.text()
    const parsed = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    })
    console.log('✅ [DEBUG] CSV parsed:', {
      rows: parsed.data.length,
      errors: parsed.errors.length,
    })

        return parsed.data
      },
      correlationId
    )

    if (!parseResult.ok) {
      console.error(
        `[${correlationId}] ❌ [STAGE 1/4] Falha na análise de dados:`,
        parseResult.error
      )
      return NextResponse.json(
        {
          error: parseResult.error.message,
          stage: parseResult.error.stage,
          code: parseResult.error.code,
          correlationId,
        },
        { status: 400 }
      )
    }

    // Validação básica dos dados
    if (!parsed.data || parsed.data.length === 0) {
      console.error('❌ [DEBUG] Empty data')
      return NextResponse.json({ error: 'Arquivo vazio ou sem dados válidos' }, { status: 400 })
    }

    console.log('🔍 [DEBUG] Step 5: Calculating statistics')
    // Análise estatística básica
    const statistics = calculateBasicStatistics(parsed.data as Record<string, number>[])
    console.log('✅ [DEBUG] Statistics calculated:', {
      numericColumns: Object.keys(statistics.means).length,
    })

    console.log('🔍 [DEBUG] Step 6: Comparing with references')
    // Comparação com referências
    const references = ReferenceDataService.compareMultipleMetrics(
      statistics.means,
      species,
      subtype || undefined
    )
    console.log('✅ [DEBUG] References compared:', {
      comparisons: references.comparisons.length,
      status: references.overallStatus,
    })

    console.log('🔍 [DEBUG] Step 7: Generating interpretation')
    // Interpretação
    const interpretation = generateBasicInterpretation(statistics, references, species)
    console.log('✅ [DEBUG] Interpretation generated:', {
      insights: interpretation.insights.length,
      recommendations: interpretation.recommendations.length,
    })

    console.log('🔍 [DEBUG] Step 8: Analyzing correlations')
    // Análise de correlações
    console.log('🔬 Analisando correlações biologicamente relevantes...')
    const correlationReport = analyzeCorrelations(
      parsed.data as Record<string, unknown>[],
      species,
      {
        maxCorrelations: 20,
        minRelevanceScore: 5,
        minDataPoints: 10,
        significanceLevel: 0.05,
      }
    )
    console.log('✅ [DEBUG] Correlations analyzed:', {
      total: correlationReport.totalCorrelations,
      significant: correlationReport.significantCorrelations,
    })

    console.log(`[${correlationId}] 🔬 Analisando correlações biologicamente relevantes...`)
    const correlationReport = analyzeCorrelations(data as Record<string, unknown>[], species, {
      maxCorrelations: 20,
      minRelevanceScore: 5,
      minDataPoints: 10,
      significanceLevel: 0.05,
    })

    const rows = (data ?? []) as Array<Record<string, unknown>>
    const firstRow = rows[0] ?? {}
    const availableColumns = Object.keys(firstRow)

    const correlationProposals = proposeCorrelations(availableColumns, species)
    const missingVariables = getMissingVariables(availableColumns, species)

    console.log(
      `[${correlationId}] ✅ Encontradas ${correlationReport.totalCorrelations} correlações (${correlationReport.significantCorrelations} significativas)`
    )

    console.log('🔍 [DEBUG] Step 9: Resolving project ID')
    // Se não tem projectId, usar o primeiro projeto do usuário
    let finalProjectId = projectId
    if (!finalProjectId) {
      console.log('🔍 [DEBUG] No projectId provided, looking up user')
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
          projects: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      })
      console.log('✅ [DEBUG] User lookup:', {
        hasUser: !!user,
        projectCount: user?.projects.length || 0,
      })

      if (!user) {
        console.error('❌ [DEBUG] User not found in database')
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 400 })
      }

      if (user.projects[0]) {
        finalProjectId = user.projects[0].id
        console.log('✅ [DEBUG] Using existing project:', finalProjectId)
      } else {
        console.log('🔍 [DEBUG] Creating new project for user:', user.id)
        // Criar projeto padrão
        const newProject = await prisma.project.create({
          data: {
            name: 'Análise Multi-Espécie',
            description: 'Projeto criado automaticamente',
            ownerId: user.id,
          },
        })
        finalProjectId = newProject.id
        console.log('✅ [DEBUG] New project created:', finalProjectId)
      }
    } else {
      console.log('✅ [DEBUG] Using provided projectId:', finalProjectId)
    }

    console.log('🔍 [DEBUG] Step 10: Saving to database')
    console.log('🔍 [DEBUG] Dataset info:', {
      projectId: finalProjectId,
      species,
      subtype,
      dataRows: parsed.data.length,
      secureFilename,
    })

    // Salvar no banco de dados
    const analysis = await prisma.dataset.create({
      data: {
        projectId: finalProjectId,
        name: `${species}${subtype ? ` - ${subtype}` : ''} - ${new Date().toLocaleDateString('pt-BR')}`,
        filename: secureFilename,
        status: 'VALIDATED',
        data: JSON.stringify({
          raw: parsed.data.slice(0, 100), // Limitar dados brutos para economia de espaço
          statistics,
          references,
          interpretation,
          correlations: {
            report: correlationReport,
            proposals: correlationProposals,
            missingVariables,
            analyzedAt: new Date().toISOString(),
          },
        }),
        metadata: JSON.stringify({
          species,
          subtype,
          totalRows: parsed.data.length,
          totalColumns: Object.keys(parsed.data[0] || {}).length,
          analyzedAt: new Date().toISOString(),
          version: '2.0',
        }),
      },
      correlationId
    )

    if (!persistenceResult.ok) {
      console.error(
        `[${correlationId}] ❌ [PERSISTENCE] Falha ao salvar análise:`,
        persistenceResult.error
      )
      return NextResponse.json(
        {
          error: persistenceResult.error.message,
          stage: persistenceResult.error.stage,
          code: persistenceResult.error.code,
          correlationId,
        },
        { status: 500 }
      )
    }

    const analysis = persistenceResult.data
    console.log(`[${correlationId}] ✅ [PERSISTENCE] Análise salva com ID: ${analysis.id}`)

    console.log('✅ [DEBUG] Analysis saved with ID:', analysis.id)

    console.log('🔍 [DEBUG] Step 11: Preparing response')
    const topCorrelations = (correlationReport.topCorrelations ?? []).slice(0, 5)
    console.log('✅ [DEBUG] Response prepared, returning to client')

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        name: analysis.name,
        species,
        subtype,
        statistics,
        references: references.comparisons,
        overallStatus: references.overallStatus,
        summary: references.summary,
        interpretation,
        correlations: {
          total: correlationReport.totalCorrelations,
          significant: correlationReport.significantCorrelations,
          highRelevance: correlationReport.highRelevanceCorrelations,
          topCorrelations,
        },
        createdAt: analysis.createdAt,
      },
      correlationId,
    })
  } catch (error) {
    console.error('❌ [DEBUG] Error in multi-species analysis:', error)
    console.error('❌ [DEBUG] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })

    const isProduction = process.env.VERCEL_ENV === 'production'
    const errorResponse: Record<string, unknown> = { error: 'Erro ao processar análise' }

    if (!isProduction) {
      errorResponse.debug = {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

/**
 * EN: Calculate basic statistical measures for all numeric columns in the dataset
 * PT-BR: Calcular medidas estatísticas básicas para todas as colunas numéricas no conjunto de dados
 *
 * @param data - EN: Array of data rows with numeric values | PT-BR: Array de linhas de dados com valores numéricos
 * @returns EN: Statistics object with means, medians, standard deviations, CVs, mins, maxs, counts | PT-BR: Objeto de estatísticas com médias, medianas, desvios padrão, CVs, mínimos, máximos, contagens
 */
function calculateBasicStatistics(data: Record<string, number>[]) {
  const numericColumns = Object.keys(data[0] || {}).filter(
    (key) => typeof data[0][key] === 'number'
  )

  const stats = {
    means: {} as Record<string, number>,
    medians: {} as Record<string, number>,
    stdDevs: {} as Record<string, number>,
    cvs: {} as Record<string, number>,
    mins: {} as Record<string, number>,
    maxs: {} as Record<string, number>,
    counts: {} as Record<string, number>,
  }

  for (const col of numericColumns) {
    const values = data.map((row) => row[col]).filter((v): v is number => v !== null && !isNaN(v))

    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const sorted = [...values].sort((a, b) => a - b)
      const median =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]
      const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)
      const cv = mean === 0 ? 0 : (stdDev / mean) * 100

      stats.means[col] = Number(mean.toFixed(2))
      stats.medians[col] = Number(median.toFixed(2))
      stats.stdDevs[col] = Number(stdDev.toFixed(2))
      stats.cvs[col] = Number(cv.toFixed(1))
      stats.mins[col] = Math.min(...values)
      stats.maxs[col] = Math.max(...values)
      stats.counts[col] = values.length
    }
  }

  return stats
}

/**
 * EN: Generate human-readable interpretation of analysis results with insights and recommendations
 * PT-BR: Gerar interpretação legível dos resultados da análise com insights e recomendações
 *
 * EN: Analyzes validation results and statistics to provide actionable insights and species-specific recommendations
 * PT-BR: Analisa resultados de validação e estatísticas para fornecer insights acionáveis e recomendações específicas da espécie
 *
 * @param stats - EN: Statistical measures | PT-BR: Medidas estatísticas
 * @param references - EN: Reference comparison results | PT-BR: Resultados de comparação de referência
 * @param species - EN: Animal species code | PT-BR: Código da espécie animal
 * @returns EN: Interpretation with insights, recommendations, and summary | PT-BR: Interpretação com insights, recomendações e resumo
 */
function generateBasicInterpretation(
  stats: ReturnType<typeof calculateBasicStatistics>,
  references: ReturnType<typeof ReferenceDataService.compareMultipleMetrics>,
  species: string
) {
  const insights: string[] = []
  const recommendations: string[] = []

  // Análise geral do status
  if (references.overallStatus === 'excellent') {
    insights.push('✅ Os indicadores gerais estão excelentes!')
  } else if (references.overallStatus === 'good') {
    insights.push('👍 Os indicadores estão dentro dos parâmetros aceitáveis')
  } else if (references.overallStatus === 'attention') {
    insights.push('⚠️ Alguns indicadores necessitam atenção')
  }

  // Análise específica por métrica com problemas
  references.comparisons.forEach((comp) => {
    if (comp.validation.status === 'below_minimum' || comp.validation.status === 'above_maximum') {
      insights.push(
        `❗ ${comp.metric}: ${comp.value} ${comp.validation.reference?.unit || ''} - ${comp.validation.message}`
      )

      // Recomendações específicas por espécie
      if (
        species === 'bovine' &&
        comp.metric === 'producao_leite' &&
        comp.validation.status === 'below_minimum'
      ) {
        recommendations.push(
          '📌 Revisar nutrição: aumentar proteína na dieta e verificar qualidade da silagem'
        )
      }
      if (
        species === 'poultry' &&
        comp.metric === 'mortalidade' &&
        comp.validation.status === 'above_maximum'
      ) {
        recommendations.push('📌 Revisar programa sanitário e condições ambientais do galpão')
      }
      if (
        species === 'swine' &&
        comp.metric === 'conversao' &&
        comp.validation.status === 'above_maximum'
      ) {
        recommendations.push('📌 Otimizar formulação da ração e revisar manejo alimentar')
      }
    }
  })

  // Análise de variabilidade (CV)
  const highVariability = Object.entries(stats.cvs)
    .filter(([, cv]) => (cv as number) > 35)
    .map(([metric, cv]) => `${metric} (CV: ${cv}%)`)

  if (highVariability.length > 0) {
    insights.push(`📊 Alta variabilidade detectada em: ${highVariability.join(', ')}`)
    recommendations.push(
      '📌 Melhorar uniformidade do lote através de classificação e manejo específico'
    )
  }

  return {
    insights,
    recommendations,
    summary: {
      totalMetrics: references.comparisons.length,
      excellent: references.summary.excellent,
      good: references.summary.good,
      attention: references.summary.attention,
      noReference: references.summary.noReference,
    },
  }
}
