# 🔌 APIs - Implementação dos Endpoints

## 1. API de Análise Multi-Espécie

```typescript
// app/api/analysis/multi-species/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReferenceDataService } from '@/lib/references/species-references'
import { EnhancedLaymanInterpretation } from '@/lib/interpretation/enhanced-layman'
import { ZootechnicalCalculations } from '@/lib/references/zootechnical-formulas'
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

    // Parse CSV
    const text = await file.text()
    const parsed = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    })

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: 'Erro ao processar CSV', details: parsed.errors },
        { status: 400 }
      )
    }

    // Validação específica por espécie
    const validationResult = validateSpeciesData(parsed.data, species, subtype)
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: 'Dados inválidos para a espécie', details: validationResult.errors },
        { status: 400 }
      )
    }

    // Análise estatística
    const statistics = calculateStatistics(parsed.data, species)
    
    // Comparação com referências
    const references = await compareWithReferences(statistics, species, subtype)
    
    // Cálculos zootécnicos específicos
    const zootechnicalMetrics = calculateZootechnicalMetrics(statistics, species, subtype)
    
    // Interpretação para leigos
    const interpretation = await generateInterpretation(
      statistics,
      references,
      zootechnicalMetrics,
      species,
      subtype
    )

    // Salvar no banco de dados
    const analysis = await prisma.dataset.create({
      data: {
        projectId,
        name: `${species} - ${new Date().toLocaleDateString('pt-BR')}`,
        filename: file.name,
        status: 'VALIDATED',
        data: JSON.stringify({
          raw: parsed.data,
          statistics,
          references,
          zootechnicalMetrics,
          interpretation
        }),
        metadata: JSON.stringify({
          species,
          subtype,
          totalRows: parsed.data.length,
          totalColumns: Object.keys(parsed.data[0] || {}).length,
          analyzedAt: new Date().toISOString()
        })
      }
    })

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        species,
        subtype,
        statistics,
        references,
        interpretation,
        metrics: zootechnicalMetrics
      }
    })

  } catch (error) {
    console.error('Erro na análise multi-espécie:', error)
    return NextResponse.json(
      { error: 'Erro ao processar análise' },
      { status: 500 }
    )
  }
}

// Funções auxiliares
function validateSpeciesData(data: any[], species: string, subtype?: string) {
  const requiredColumns = getRequiredColumns(species, subtype)
  const columns = Object.keys(data[0] || {})
  
  const missing = requiredColumns.filter(col => !columns.includes(col))
  
  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Colunas obrigatórias ausentes: ${missing.join(', ')}`]
    }
  }
  
  return { valid: true }
}

function getRequiredColumns(species: string, subtype?: string) {
  const base = ['id', 'date']
  
  switch(species) {
    case 'poultry':
      if (subtype === 'broiler') {
        return [...base, 'peso', 'idade', 'mortalidade', 'consumo_racao']
      }
      if (subtype === 'layer') {
        return [...base, 'producao_ovos', 'peso_ovo', 'consumo_racao']
      }
      return [...base, 'peso', 'idade']
      
    case 'bovine':
      if (subtype === 'dairy') {
        return [...base, 'producao_leite', 'gordura', 'proteina', 'ccs']
      }
      if (subtype === 'beef') {
        return [...base, 'peso', 'gpd', 'escore_corporal']
      }
      return [...base, 'peso']
      
    case 'swine':
      return [...base, 'peso', 'conversao', 'espessura_toucinho']
      
    default:
      return base
  }
}

function calculateStatistics(data: any[], species: string) {
  const numericColumns = Object.keys(data[0] || {}).filter(
    key => typeof data[0][key] === 'number'
  )
  
  const stats = {}
  
  for (const col of numericColumns) {
    const values = data.map(row => row[col]).filter(v => v !== null && !isNaN(v))
    
    stats[col] = {
      mean: mean(values),
      median: median(values),
      stdDev: standardDeviation(values),
      cv: coefficientOfVariation(values),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    }
  }
  
  return stats
}

async function compareWithReferences(stats: any, species: string, subtype?: string) {
  const comparisons = {}
  
  for (const [metric, values] of Object.entries(stats)) {
    const reference = ReferenceDataService.getReference(species, subtype, metric)
    
    if (reference) {
      const validation = ReferenceDataService.validateMetric(
        values.mean,
        species,
        metric,
        subtype
      )
      
      comparisons[metric] = {
        ...values,
        reference,
        validation,
        status: getStatus(values.mean, reference)
      }
    } else {
      comparisons[metric] = {
        ...values,
        status: 'no_reference'
      }
    }
  }
  
  return comparisons
}

function calculateZootechnicalMetrics(stats: any, species: string, subtype?: string) {
  const metrics = {}
  
  if (species === 'poultry' && subtype === 'broiler') {
    if (stats.peso && stats.idade && stats.mortalidade && stats.conversao) {
      metrics.iep = ZootechnicalCalculations.calculateIEP({
        pesoMedio: stats.peso.mean,
        idade: stats.idade.mean,
        viabilidade: 100 - stats.mortalidade.mean,
        conversaoAlimentar: stats.conversao.mean
      })
    }
  }
  
  if (stats.peso_final && stats.peso_inicial && stats.dias) {
    metrics.gpd = ZootechnicalCalculations.calculateGPD(
      stats.peso_final.mean,
      stats.peso_inicial.mean,
      stats.dias.mean
    )
  }
  
  if (stats.consumo_racao && stats.ganho_peso) {
    metrics.conversao_alimentar = ZootechnicalCalculations.calculateFCR(
      stats.consumo_racao.mean,
      stats.ganho_peso.mean
    )
  }
  
  return metrics
}

// Funções estatísticas auxiliares
const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
const median = (arr: number[]) => {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
const standardDeviation = (arr: number[]) => {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / arr.length)
}
const coefficientOfVariation = (arr: number[]) => (standardDeviation(arr) / mean(arr)) * 100

function getStatus(value: number, reference: any) {
  if (!reference) return 'unknown'
  
  if (reference.ideal_min && reference.ideal_max) {
    if (value >= reference.ideal_min && value <= reference.ideal_max) {
      return 'excellent'
    }
  }
  
  if (value >= reference.min && value <= reference.max) {
    return 'good'
  }
  
  return value < reference.min ? 'below' : 'above'
}
```

## 2. API de Dados de Referência

```typescript
// app/api/reference/[species]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ReferenceDataService } from '@/lib/references/species-references'

export async function GET(
  request: NextRequest,
  { params }: { params: { species: string } }
) {
  try {
    const { species } = params
    const searchParams = request.nextUrl.searchParams
    const subtype = searchParams.get('subtype')
    const metric = searchParams.get('metric')

    // Primeiro, tenta buscar do banco de dados
    let dbReferences = await prisma.referenceData.findMany({
      where: {
        species: { code: species },
        ...(subtype && { subtype: { code: subtype } }),
        ...(metric && { metric })
      },
      include: {
        species: true,
        subtype: true
      }
    })

    // Se não encontrar no banco, usa dados hardcoded
    if (dbReferences.length === 0) {
      const hardcodedData = ReferenceDataService.getReference(
        species,
        subtype || undefined,
        metric || undefined
      )
      
      if (!hardcodedData) {
        return NextResponse.json(
          { error: 'Dados de referência não encontrados' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        source: 'hardcoded',
        data: hardcodedData,
        species,
        subtype,
        metric
      })
    }

    // Formata os dados do banco
    const formattedData = dbReferences.reduce((acc, ref) => {
      acc[ref.metric] = {
        min: ref.minValue,
        ideal_min: ref.idealMinValue,
        ideal_max: ref.idealMaxValue,
        max: ref.maxValue,
        unit: ref.unit,
        source: ref.source,
        description: ref.description
      }
      return acc
    }, {})

    return NextResponse.json({
      source: 'database',
      data: formattedData,
      species,
      subtype,
      metric,
      count: dbReferences.length
    })

  } catch (error) {
    console.error('Erro ao buscar referências:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados de referência' },
      { status: 500 }
    )
  }
}

// POST - Adicionar novas referências
export async function POST(
  request: NextRequest,
  { params }: { params: { species: string } }
) {
  try {
    const { species } = params
    const body = await request.json()
    
    // Validar permissões (apenas admin)
    // ...
    
    // Buscar ou criar espécie
    let speciesRecord = await prisma.animalSpecies.findUnique({
      where: { code: species }
    })
    
    if (!speciesRecord) {
      speciesRecord = await prisma.animalSpecies.create({
        data: {
          code: species,
          name: body.speciesName || species,
          hasSubtypes: body.hasSubtypes || false
        }
      })
    }
    
    // Criar referência
    const reference = await prisma.referenceData.create({
      data: {
        speciesId: speciesRecord.id,
        metric: body.metric,
        minValue: body.minValue,
        idealMinValue: body.idealMinValue,
        idealMaxValue: body.idealMaxValue,
        maxValue: body.maxValue,
        unit: body.unit,
        source: body.source,
        description: body.description
      }
    })
    
    return NextResponse.json({
      success: true,
      reference
    })
    
  } catch (error) {
    console.error('Erro ao adicionar referência:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar referência' },
      { status: 500 }
    )
  }
}
```

## 3. API de Interpretação Aprimorada

```typescript
// app/api/interpretation/enhanced/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EnhancedLaymanInterpretation } from '@/lib/interpretation/enhanced-layman'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      analysisData, 
      species, 
      subtype, 
      targetAudience = 'producer',
      detailLevel = 'medium' 
    } = body

    const interpreter = new EnhancedLaymanInterpretation()
    
    // Gerar interpretação base
    const interpretation = await interpreter.interpret(
      analysisData,
      species,
      subtype,
      targetAudience
    )
    
    // Adicionar insights específicos por espécie
    const insights = generateSpeciesSpecificInsights(
      analysisData,
      species,
      subtype
    )
    
    // Gerar recomendações práticas
    const recommendations = generateRecommendations(
      analysisData,
      species,
      subtype,
      interpretation.status
    )
    
    // Criar analogias visuais
    const analogies = createVisualAnalogies(
      analysisData,
      species,
      targetAudience
    )
    
    return NextResponse.json({
      interpretation: {
        ...interpretation,
        insights,
        recommendations,
        analogies
      },
      metadata: {
        species,
        subtype,
        targetAudience,
        detailLevel,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erro na interpretação:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar interpretação' },
      { status: 500 }
    )
  }
}

// Funções auxiliares de interpretação
function generateSpeciesSpecificInsights(data: any, species: string, subtype?: string) {
  const insights = []
  
  switch(species) {
    case 'bovine':
      if (subtype === 'dairy') {
        // Análise de produção leiteira
        if (data.producao_leite?.mean < 20) {
          insights.push({
            type: 'warning',
            title: 'Produção Abaixo do Esperado',
            message: 'Produção média de leite está abaixo do ideal para vacas em lactação',
            action: 'Revisar dieta e verificar qualidade da silagem',
            priority: 'high'
          })
        }
        
        if (data.ccs?.mean > 400000) {
          insights.push({
            type: 'alert',
            title: 'Alta Contagem de Células Somáticas',
            message: 'Indicativo de problemas de mastite no rebanho',
            action: 'Implementar protocolo de controle de mastite',
            priority: 'high'
          })
        }
      }
      break
      
    case 'poultry':
      if (subtype === 'broiler') {
        // Análise de frangos de corte
        if (data.conversao?.mean > 1.8) {
          insights.push({
            type: 'improvement',
            title: 'Conversão Alimentar Pode Melhorar',
            message: 'A conversão está acima do ideal para a idade',
            action: 'Verificar qualidade da ração e manejo alimentar',
            priority: 'medium'
          })
        }
        
        if (data.mortalidade?.mean > 3) {
          insights.push({
            type: 'warning',
            title: 'Mortalidade Elevada',
            message: `Mortalidade de ${data.mortalidade.mean.toFixed(1)}% está acima do aceitável`,
            action: 'Revisar programa sanitário e ambiência',
            priority: 'high'
          })
        }
      }
      break
  }
  
  return insights
}

function generateRecommendations(data: any, species: string, subtype: string, status: string) {
  const recommendations = []
  
  // Recomendações gerais baseadas no status
  if (status === 'attention') {
    recommendations.push({
      category: 'immediate',
      title: 'Ações Imediatas Necessárias',
      items: [
        'Revisar programa nutricional',
        'Verificar condições sanitárias',
        'Consultar veterinário/zootecnista'
      ]
    })
  }
  
  // Recomendações específicas por espécie
  if (species === 'bovine' && subtype === 'dairy') {
    recommendations.push({
      category: 'nutrition',
      title: 'Ajustes Nutricionais',
      items: [
        'Aumentar proteína em 2% na dieta',
        'Verificar qualidade da silagem (FDN e FDA)',
        'Adicionar suplemento mineral específico para lactação'
      ]
    })
  }
  
  if (species === 'swine') {
    recommendations.push({
      category: 'management',
      title: 'Manejo e Ambiente',
      items: [
        'Ajustar densidade de alojamento',
        'Verificar temperatura ambiente (ideal: 18-22°C)',
        'Implementar alimentação por fases'
      ]
    })
  }
  
  return recommendations
}

function createVisualAnalogies(data: any, species: string, audience: string) {
  const analogies = []
  
  if (audience === 'producer') {
    // Analogias práticas para produtores
    if (data.gpd?.mean) {
      const gpd = data.gpd.mean
      analogies.push({
        metric: 'Ganho de Peso Diário',
        value: gpd,
        analogy: species === 'bovine' 
          ? `Como adicionar ${Math.round(gpd * 10)} bifes por mês`
          : `Como adicionar ${Math.round(gpd * 1000 / 50)} grãos de milho por dia`,
        visual: '🥩'.repeat(Math.min(5, Math.round(gpd * 2)))
      })
    }
    
    if (data.producao_leite?.mean) {
      const leite = data.producao_leite.mean
      analogies.push({
        metric: 'Produção de Leite',
        value: leite,
        analogy: `Suficiente para ${Math.round(leite / 0.2)} copos de leite por dia`,
        visual: '🥛'.repeat(Math.min(10, Math.round(leite / 5)))
      })
    }
  } else {
    // Analogias técnicas para profissionais
    // ...
  }
  
  return analogies
}
```

## 4. Script de Seed para Popular Banco

```typescript
// prisma/seed-multi-species.ts
import { PrismaClient } from '@prisma/client'
import { NRC_REFERENCES } from '../lib/references/nrc-data'
import { EMBRAPA_REFERENCES } from '../lib/references/embrapa-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')
  
  // Criar espécies
  const species = await seedSpecies()
  
  // Criar subtipos
  await seedSubtypes(species)
  
  // Popular dados de referência
  await seedReferenceData(species)
  
  // Popular dados de forragem
  await seedForageData()
  
  console.log('✅ Seed concluído com sucesso!')
}

async function seedSpecies() {
  const speciesData = [
    { code: 'bovine', name: 'Bovinos', hasSubtypes: true },
    { code: 'swine', name: 'Suínos', hasSubtypes: true },
    { code: 'poultry', name: 'Aves', hasSubtypes: true },
    { code: 'sheep', name: 'Ovinos', hasSubtypes: true },
    { code: 'goat', name: 'Caprinos', hasSubtypes: true },
    { code: 'forage', name: 'Forragem', hasSubtypes: false },
    { code: 'aquaculture', name: 'Piscicultura', hasSubtypes: true }
  ]
  
  const species = {}
  
  for (const sp of speciesData) {
    const created = await prisma.animalSpecies.upsert({
      where: { code: sp.code },
      update: {},
      create: sp
    })
    species[sp.code] = created
    console.log(`✅ Espécie criada: ${sp.name}`)
  }
  
  return species
}

async function seedSubtypes(species: any) {
  const subtypesData = [
    { speciesCode: 'bovine', code: 'dairy', name: 'Leite' },
    { speciesCode: 'bovine', code: 'beef', name: 'Corte' },
    { speciesCode: 'bovine', code: 'dual', name: 'Dupla Aptidão' },
    
    { speciesCode: 'poultry', code: 'broiler', name: 'Frango de Corte' },
    { speciesCode: 'poultry', code: 'layer', name: 'Poedeiras' },
    { speciesCode: 'poultry', code: 'breeder', name: 'Matrizes' },
    
    { speciesCode: 'swine', code: 'nursery', name: 'Creche' },
    { speciesCode: 'swine', code: 'growing', name: 'Crescimento' },
    { speciesCode: 'swine', code: 'finishing', name: 'Terminação' },
    { speciesCode: 'swine', code: 'breeding', name: 'Reprodução' }
  ]
  
  for (const st of subtypesData) {
    await prisma.animalSubtype.create({
      data: {
        code: st.code,
        name: st.name,
        speciesId: species[st.speciesCode].id
      }
    })
    console.log(`  ✅ Subtipo criado: ${st.name} (${st.speciesCode})`)
  }
}

async function seedReferenceData(species: any) {
  // Popular dados do NRC
  for (const [speciesCode, speciesData] of Object.entries(NRC_REFERENCES)) {
    if (!species[speciesCode]) continue
    
    for (const [subtypeCode, metrics] of Object.entries(speciesData as any)) {
      const subtype = await prisma.animalSubtype.findFirst({
        where: {
          code: subtypeCode,
          speciesId: species[speciesCode].id
        }
      })
      
      if (!subtype) continue
      
      for (const [metric, values] of Object.entries(metrics as any)) {
        await prisma.referenceData.create({
          data: {
            speciesId: species[speciesCode].id,
            subtypeId: subtype.id,
            metric,
            minValue: values.min,
            idealMinValue: values.ideal_min,
            idealMaxValue: values.ideal_max,
            maxValue: values.max,
            unit: values.unit,
            source: values.source || 'NRC'
          }
        })
      }
    }
  }
  
  console.log('✅ Dados NRC importados')
}

async function seedForageData() {
  // Popular dados de forragem da EMBRAPA
  for (const [forageType, forageData] of Object.entries(EMBRAPA_REFERENCES.forage)) {
    for (const [variety, metrics] of Object.entries(forageData as any)) {
      for (const [metric, values] of Object.entries(metrics as any)) {
        await prisma.forageReference.create({
          data: {
            forageType: `${forageType}_${variety}`,
            metric,
            minValue: values.min,
            idealValue: values.ideal,
            maxValue: values.max,
            unit: values.unit,
            season: values.season,
            source: values.source || 'EMBRAPA'
          }
        })
      }
    }
  }
  
  console.log('✅ Dados de forragem importados')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
```
