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
  createAnalysisError,
  ERROR_CODES,
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const species = formData.get('species') as string
    const subtype = formData.get('subtype') as string | null
    const projectId = formData.get('projectId') as string

    if (!file || !species) {
      return NextResponse.json({ error: 'Arquivo e espécie são obrigatórios' }, { status: 400 })
    }

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
          const error = createAnalysisError(
            'validation',
            ERROR_CODES.EMPTY_FILE,
            undefined,
            correlationId
          )
          throw new Error(error.message)
        }

        // Validação de pontos mínimos de dados
        if (parsed.data.length < 3) {
          const error = createAnalysisError(
            'validation',
            ERROR_CODES.INSUFFICIENT_DATA,
            { rows: parsed.data.length },
            correlationId
          )
          throw new Error(error.message)
        }

        const firstRow = parsed.data[0] as Record<string, unknown>
        const numericColumns = Object.keys(firstRow).filter(
          (key) => typeof firstRow[key] === 'number'
        )

        if (numericColumns.length === 0) {
          const error = createAnalysisError(
            'validation',
            ERROR_CODES.NO_NUMERIC_COLUMNS,
            undefined,
            correlationId
          )
          throw new Error(error.message)
        }

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

    const data = parseResult.data
    console.log(
      `[${correlationId}] ✅ [STAGE 1/4] Análise de dados concluída: ${data.length} registros, ${Object.keys(data[0] || {}).length} colunas`
    )

    console.log(`[${correlationId}] [STAGE 2/4] Cálculo de estatísticas`)
    const statsResult = await safeStep(
      'statistics',
      () => {
        const stats = calculateBasicStatistics(data as Record<string, number>[])

        // Verificar se conseguimos calcular estatísticas
        if (Object.keys(stats.means).length === 0) {
          const error = createAnalysisError(
            'statistics',
            ERROR_CODES.STATISTICS_FAILED,
            { reason: 'Nenhuma estatística calculada' },
            correlationId
          )
          throw new Error(error.message)
        }

        return stats
      },
      correlationId
    )

    if (!statsResult.ok) {
      console.error(
        `[${correlationId}] ❌ [STAGE 2/4] Falha no cálculo de estatísticas:`,
        statsResult.error
      )
      return NextResponse.json(
        {
          error: statsResult.error.message,
          stage: statsResult.error.stage,
          code: statsResult.error.code,
          correlationId,
        },
        { status: 500 }
      )
    }

    const statistics = statsResult.data
    console.log(
      `[${correlationId}] ✅ [STAGE 2/4] Estatísticas calculadas: ${Object.keys(statistics.means).length} métricas`
    )

    console.log(
      `[${correlationId}] [STAGE 3/4] Busca e comparação com dados de referência (NRC/EMBRAPA)`
    )
    const referenceResult = await safeStep(
      'reference',
      () => {
        const referenceData = ReferenceDataService.getReference(species, subtype || undefined)

        if (!referenceData) {
          console.warn(
            `[${correlationId}] ⚠️ Dados de referência não encontrados para ${species}${subtype ? `/${subtype}` : ''}`
          )
        }

        const references = ReferenceDataService.compareMultipleMetrics(
          statistics.means,
          species,
          subtype || undefined
        )

        return references
      },
      correlationId
    )

    if (!referenceResult.ok) {
      console.error(
        `[${correlationId}] ❌ [STAGE 3/4] Falha na comparação com referências:`,
        referenceResult.error
      )
      return NextResponse.json(
        {
          error: referenceResult.error.message,
          stage: referenceResult.error.stage,
          code: referenceResult.error.code,
          correlationId,
        },
        { status: 500 }
      )
    }

    const references = referenceResult.data
    console.log(
      `[${correlationId}] ✅ [STAGE 3/4] Comparação concluída: ${references.comparisons.length} métricas comparadas, status geral: ${references.overallStatus}`
    )

    console.log(`[${correlationId}] [STAGE 4/4] Geração de diagnóstico e interpretação`)
    const diagnosisResult = await safeStep(
      'diagnosis',
      () => {
        const interpretation = generateBasicInterpretation(statistics, references, species)

        if (!interpretation || (!interpretation.insights && !interpretation.recommendations)) {
          const error = createAnalysisError(
            'diagnosis',
            ERROR_CODES.DIAGNOSIS_FAILED,
            undefined,
            correlationId
          )
          throw new Error(error.message)
        }

        return interpretation
      },
      correlationId
    )

    if (!diagnosisResult.ok) {
      console.error(
        `[${correlationId}] ❌ [STAGE 4/4] Falha na geração de diagnóstico:`,
        diagnosisResult.error
      )
      return NextResponse.json(
        {
          error: diagnosisResult.error.message,
          stage: diagnosisResult.error.stage,
          code: diagnosisResult.error.code,
          correlationId,
        },
        { status: 500 }
      )
    }

    const interpretation = diagnosisResult.data
    console.log(
      `[${correlationId}] ✅ [STAGE 4/4] Diagnóstico gerado: ${interpretation.insights.length} insights, ${interpretation.recommendations.length} recomendações`
    )

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

    console.log(`[${correlationId}] [PERSISTENCE] Salvando análise no banco de dados`)
    const persistenceResult = await safeStep(
      'persistence',
      async () => {
        let finalProjectId = projectId
        if (!finalProjectId) {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            include: {
              projects: {
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
          })

          if (user?.projects[0]) {
            finalProjectId = user.projects[0].id
          } else {
            const newProject = await prisma.project.create({
              data: {
                name: 'Análise Multi-Espécie',
                description: 'Projeto criado automaticamente',
                ownerId: user!.id,
              },
            })
            finalProjectId = newProject.id
          }
        }

        const analysis = await prisma.dataset.create({
          data: {
            projectId: finalProjectId,
            name: `${species}${subtype ? ` - ${subtype}` : ''} - ${new Date().toLocaleDateString('pt-BR')}`,
            filename: secureFilename,
            status: 'VALIDATED',
            data: JSON.stringify({
              raw: data.slice(0, 100),
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
              totalRows: data.length,
              totalColumns: Object.keys(data[0] || {}).length,
              analyzedAt: new Date().toISOString(),
              version: '2.0',
            }),
          },
        })

        return analysis
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

    console.log(`[${correlationId}] ✅ Análise multi-espécie concluída com sucesso`)

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
          topCorrelations: correlationReport.topCorrelations.slice(0, 5),
        },
        createdAt: analysis.createdAt,
      },
      correlationId,
    })
  } catch (error) {
    console.error(`[${correlationId}] ❌ Erro inesperado na análise multi-espécie:`, error)

    const analysisError = createAnalysisError(
      'unknown',
      ERROR_CODES.UNEXPECTED_ERROR,
      error instanceof Error ? { message: error.message } : undefined,
      correlationId
    )

    return NextResponse.json(
      {
        error: analysisError.message,
        stage: analysisError.stage,
        code: analysisError.code,
        correlationId,
      },
      { status: 500 }
    )
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
    const values = data
      .map((row) => row[col])
      .filter((v): v is number => v !== null && !isNaN(v) && isFinite(v))

    if (values.length >= 2) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const sorted = [...values].sort((a, b) => a - b)
      const median =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)]
      const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)
      const cv = mean === 0 ? 0 : (stdDev / Math.abs(mean)) * 100

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
