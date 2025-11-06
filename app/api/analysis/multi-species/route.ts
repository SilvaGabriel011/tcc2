// app/api/analysis/multi-species/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReferenceDataService } from '@/lib/references/species-references'
import Papa from 'papaparse'
import { validateUploadedFile, generateUniqueFilename } from '@/lib/upload-security'
import { withRateLimit } from '@/lib/rate-limit'
import { analyzeCorrelations, proposeCorrelations, getMissingVariables } from '@/lib/correlations/correlation-analysis'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(request, 'UPLOAD')
  if (rateLimitResponse) return rateLimitResponse
  
  try {
    console.log('🔍 [multi-species] Step 1: Auth check')
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    console.log('✅ [multi-species] Auth OK, user:', session.user.email)

    console.log('🔍 [multi-species] Step 2: Parse form data')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const species = formData.get('species') as string
    const subtype = formData.get('subtype') as string | null
    const projectId = formData.get('projectId') as string

    if (!file || !species) {
      return NextResponse.json(
        { error: 'Arquivo e espécie são obrigatórios' },
        { status: 400 }
      )
    }
    console.log('✅ [multi-species] Form data OK:', { species, subtype, hasProjectId: !!projectId })

    console.log('🔍 [multi-species] Step 3: Security validation')
    const securityCheck = await validateUploadedFile(file, 'csv')
    if (!securityCheck.valid) {
      console.warn('🚫 Security check failed:', securityCheck.error)
      return NextResponse.json({ 
        error: securityCheck.error,
        warnings: securityCheck.warnings 
      }, { status: 400 })
    }
    console.log('✅ [multi-species] Security check passed')

    const secureFilename = generateUniqueFilename(file.name)

    console.log('🔍 [multi-species] Step 4: Parse CSV')
    console.log('📊 Iniciando análise multi-espécie:', { species, subtype })

    // Parse CSV
    const text = await file.text()
    const parsed = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    })

    if (parsed.errors.length > 0) {
      console.error('❌ Erros no CSV:', parsed.errors)
      return NextResponse.json(
        { error: 'Erro ao processar CSV', details: parsed.errors },
        { status: 400 }
      )
    }

    if (!parsed.data || parsed.data.length === 0) {
      return NextResponse.json(
        { error: 'Arquivo vazio ou sem dados válidos' },
        { status: 400 }
      )
    }
    console.log('✅ [multi-species] CSV parsed:', { rows: parsed.data.length })

    console.log('🔍 [multi-species] Step 5: Calculate statistics')
    const statistics = calculateBasicStatistics(parsed.data as Record<string, number>[])
    console.log('✅ [multi-species] Statistics calculated:', { metrics: Object.keys(statistics.means).length })
    
    console.log('🔍 [multi-species] Step 6: Compare with references')
    const references = ReferenceDataService.compareMultipleMetrics(
      statistics.means,
      species,
      subtype || undefined
    )
    console.log('✅ [multi-species] References compared:', { status: references.overallStatus })
    
    console.log('🔍 [multi-species] Step 7: Generate interpretation')
    const interpretation = generateBasicInterpretation(
      statistics,
      references,
      species
    )
    console.log('✅ [multi-species] Interpretation generated')

    console.log('🔍 [multi-species] Step 8: Analyze correlations')
    const correlationReport = analyzeCorrelations(
      parsed.data as Record<string, unknown>[],
      species,
      {
        maxCorrelations: 20,
        minRelevanceScore: 5,
        minDataPoints: 10,
        significanceLevel: 0.05
      }
    )

    const rows = (parsed.data ?? []) as Array<Record<string, unknown>>
    const firstRow = rows[0] ?? {}
    const availableColumns = Object.keys(firstRow)
    
    const correlationProposals = proposeCorrelations(availableColumns, species)
    const missingVariables = getMissingVariables(availableColumns, species)

    console.log(`✅ [multi-species] Correlations analyzed: ${correlationReport.totalCorrelations} total (${correlationReport.significantCorrelations} significant)`)

    console.log('🔍 [multi-species] Step 9: Get or create project')
    let finalProjectId = projectId
    if (!finalProjectId) {
      console.log('No projectId provided, looking up user in database...')
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
          projects: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      
      if (!user) {
        console.error('❌ [multi-species] User not found in database:', session.user.email)
        return NextResponse.json(
          { error: 'Usuário não encontrado no banco de dados. Por favor, faça login novamente.' },
          { status: 400 }
        )
      }
      
      console.log('User found:', { id: user.id, email: user.email, projectCount: user.projects.length })
      
      if (user.projects[0]) {
        finalProjectId = user.projects[0].id
        console.log('Using existing project:', finalProjectId)
      } else {
        console.log('No projects found, creating default project...')
        const newProject = await prisma.project.create({
          data: {
            name: 'Análise Multi-Espécie',
            description: 'Projeto criado automaticamente',
            ownerId: user.id
          }
        })
        finalProjectId = newProject.id
        console.log('Created new project:', finalProjectId)
      }
    } else {
      console.log('Using provided projectId:', finalProjectId)
    }
    console.log('✅ [multi-species] Project resolved:', finalProjectId)

    console.log('🔍 [multi-species] Step 10: Save to database')
    const analysis = await prisma.dataset.create({
      data: {
        projectId: finalProjectId,
        name: `${species}${subtype ? ` - ${subtype}` : ''} - ${new Date().toLocaleDateString('pt-BR')}`,
        filename: secureFilename,
        status: 'VALIDATED',
        data: JSON.stringify({
          raw: parsed.data.slice(0, 100),
          statistics,
          references,
          interpretation,
          correlations: {
            report: correlationReport,
            proposals: correlationProposals,
            missingVariables,
            analyzedAt: new Date().toISOString()
          }
        }),
        metadata: JSON.stringify({
          species,
          subtype,
          totalRows: parsed.data.length,
          totalColumns: Object.keys(parsed.data[0] || {}).length,
          analyzedAt: new Date().toISOString(),
          version: '2.0'
        })
      }
    })

    console.log('✅ [multi-species] Analysis saved with ID:', analysis.id)

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
          topCorrelations: correlationReport.topCorrelations.slice(0, 5)
        },
        createdAt: analysis.createdAt
      }
    })

  } catch (error) {
    console.error('❌ [multi-species] Error in multi-species analysis:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      type: error?.constructor?.name
    })
    
    return NextResponse.json(
      { 
        error: 'Erro ao processar análise',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

// Função para calcular estatísticas básicas
function calculateBasicStatistics(data: Record<string, number>[]) {
  const numericColumns = Object.keys(data[0] || {}).filter(
    key => typeof data[0][key] === 'number'
  )
  
  const stats = {
    means: {} as Record<string, number>,
    medians: {} as Record<string, number>,
    stdDevs: {} as Record<string, number>,
    cvs: {} as Record<string, number>,
    mins: {} as Record<string, number>,
    maxs: {} as Record<string, number>,
    counts: {} as Record<string, number>
  }
  
  for (const col of numericColumns) {
    const values = data.map(row => row[col]).filter((v): v is number => v !== null && !isNaN(v))
    
    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const sorted = [...values].sort((a, b) => a - b)
      const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]
      const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)
      const cv = (stdDev / mean) * 100
      
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

// Função para gerar interpretação básica
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
      insights.push(`❗ ${comp.metric}: ${comp.value} ${comp.validation.reference?.unit || ''} - ${comp.validation.message}`)
      
      // Recomendações específicas por espécie
      if (species === 'bovine' && comp.metric === 'producao_leite' && comp.validation.status === 'below_minimum') {
        recommendations.push('📌 Revisar nutrição: aumentar proteína na dieta e verificar qualidade da silagem')
      }
      if (species === 'poultry' && comp.metric === 'mortalidade' && comp.validation.status === 'above_maximum') {
        recommendations.push('📌 Revisar programa sanitário e condições ambientais do galpão')
      }
      if (species === 'swine' && comp.metric === 'conversao' && comp.validation.status === 'above_maximum') {
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
    recommendations.push('📌 Melhorar uniformidade do lote através de classificação e manejo específico')
  }
  
  return {
    insights,
    recommendations,
    summary: {
      totalMetrics: references.comparisons.length,
      excellent: references.summary.excellent,
      good: references.summary.good,
      attention: references.summary.attention,
      noReference: references.summary.noReference
    }
  }
}
