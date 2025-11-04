// app/api/analysis/multi-species/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReferenceDataService } from '@/lib/references/species-references'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'Arquivo e espécie são obrigatórios' },
        { status: 400 }
      )
    }

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

    // Validação básica dos dados
    if (!parsed.data || parsed.data.length === 0) {
      return NextResponse.json(
        { error: 'Arquivo vazio ou sem dados válidos' },
        { status: 400 }
      )
    }

    // Análise estatística básica
    const statistics = calculateBasicStatistics(parsed.data)
    
    // Comparação com referências
    const references = ReferenceDataService.compareMultipleMetrics(
      statistics.means,
      species,
      subtype || undefined
    )
    
    // Interpretação
    const interpretation = generateBasicInterpretation(
      statistics,
      references,
      species,
      subtype
    )

    // Se não tem projectId, usar o primeiro projeto do usuário
    let finalProjectId = projectId
    if (!finalProjectId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
          projects: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      
      if (user?.projects[0]) {
        finalProjectId = user.projects[0].id
      } else {
        // Criar projeto padrão
        const newProject = await prisma.project.create({
          data: {
            name: 'Análise Multi-Espécie',
            description: 'Projeto criado automaticamente',
            ownerId: user!.id
          }
        })
        finalProjectId = newProject.id
      }
    }

    // Salvar no banco de dados
    const analysis = await prisma.dataset.create({
      data: {
        projectId: finalProjectId,
        name: `${species}${subtype ? ` - ${subtype}` : ''} - ${new Date().toLocaleDateString('pt-BR')}`,
        filename: file.name,
        status: 'VALIDATED',
        data: JSON.stringify({
          raw: parsed.data.slice(0, 100), // Limitar dados brutos para economia de espaço
          statistics,
          references,
          interpretation
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

    console.log('✅ Análise salva com ID:', analysis.id)

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
        createdAt: analysis.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Erro na análise multi-espécie:', error)
    return NextResponse.json(
      { error: 'Erro ao processar análise' },
      { status: 500 }
    )
  }
}

// Função para calcular estatísticas básicas
function calculateBasicStatistics(data: any[]) {
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
    const values = data.map(row => row[col]).filter(v => v !== null && !isNaN(v))
    
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
  stats: any,
  references: any,
  species: string,
  subtype: string | null
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
  references.comparisons.forEach((comp: any) => {
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
    .filter(([_, cv]) => (cv as number) > 35)
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
