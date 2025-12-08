/**
 * AI-Powered Diagnostic Service
 *
 * Generates intelligent zootechnical diagnostics using AI (Gemini/OpenAI)
 * with fallback to rule-based system if AI is unavailable
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { generateDiagnostico } from './diagnostico-generator'
import type { NumericStats } from './dataAnalysis'

export interface DiagnosticInput {
  species: string
  subtype?: string
  statistics: {
    numericStats?: Record<string, NumericStats>
  }
  references?: {
    comparisons?: Array<{
      metric: string
      value: number
      reference?: { min: number; max: number }
      status: string
      deviation?: number
    }>
    overallStatus?: string
    summary?: string
  }
  correlations?: {
    report?: {
      topCorrelations?: Array<{
        var1: string
        var2: string
        coefficient: number
        significant: boolean
      }>
    }
  }
  metadata?: {
    totalRows?: number
    totalColumns?: number
    validRows?: number
  }
}

export interface DiagnosticResult {
  resumoExecutivo: string
  analiseNumericas: Array<{
    variavel: string
    status: 'Excelente' | 'Bom' | 'Regular' | 'Preocupante'
    interpretacao: string
    comparacaoLiteratura?: string
  }>
  pontosFortes: string[]
  pontosAtencao: string[]
  recomendacoesPrioritarias: Array<{
    titulo: string
    descricao: string
    prioridade: 'Alta' | 'Média' | 'Baixa'
  }>
  conclusao: string
  fontes: string[]
  generatedBy?: 'gemini' | 'openai' | 'rule-based'
}

/**
 * Generate AI-powered diagnostic using OpenAI (priority) or Gemini (fallback)
 */
export async function generateAIDiagnostic(input: DiagnosticInput): Promise<DiagnosticResult> {
  // Debug: Log which API keys are configured
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasGemini = !!(process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)
  console.log('[AI-DIAGNOSTIC] API keys configured:', {
    openai: hasOpenAI,
    gemini: hasGemini,
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
  })

  // OpenAI is now the primary AI provider for diagnostics
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('[AI-DIAGNOSTIC] Attempting diagnostic generation with OpenAI (primary)...')
      const result = await generateWithOpenAI(input)
      console.log('[AI-DIAGNOSTIC] Diagnostic generated successfully with OpenAI')
      return { ...result, generatedBy: 'openai' }
    } catch (error) {
      console.warn(
        '[AI-DIAGNOSTIC] OpenAI failed, trying Gemini fallback:',
        (error as Error).message
      )
    }
  } else {
    console.log('[AI-DIAGNOSTIC] OpenAI API key not found, skipping OpenAI')
  }

  // Gemini is now the fallback AI provider
  if (process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY) {
    try {
      console.log('[AI-DIAGNOSTIC] Attempting diagnostic generation with Gemini (fallback)...')
      const result = await generateWithGemini(input)
      console.log('[AI-DIAGNOSTIC] Diagnostic generated successfully with Gemini')
      return { ...result, generatedBy: 'gemini' }
    } catch (error) {
      console.warn(
        '[AI-DIAGNOSTIC] Gemini failed, using rule-based fallback:',
        (error as Error).message
      )
    }
  } else {
    console.log('[AI-DIAGNOSTIC] Gemini API key not found, skipping Gemini')
  }

  console.log('[AI-DIAGNOSTIC] Using rule-based diagnostic generation (no AI available)')

  const refs = input.references
    ? {
        comparisons: input.references.comparisons ?? [],
        overallStatus: input.references.overallStatus ?? 'unknown',
        summary: input.references.summary ?? '',
      }
    : { comparisons: [], overallStatus: 'unknown', summary: '' }

  const fallbackData = {
    species: input.species,
    subtype: input.subtype,
    statistics: input.statistics,
    references: refs,
    correlations: input.correlations,
    metadata: input.metadata as Record<string, unknown> | undefined,
  } as Parameters<typeof generateDiagnostico>[0]

  const result = generateDiagnostico(fallbackData)
  return { ...result, generatedBy: 'rule-based' }
}

/**
 * Generate diagnostic using Google Gemini
 */
async function generateWithGemini(input: DiagnosticInput): Promise<DiagnosticResult> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)

  const modelsToTry = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro']

  let lastError: Error | null = null

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const prompt = buildDiagnosticPrompt(input)

      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      return parseDiagnosticResponse(text)
    } catch (error) {
      lastError = error as Error
      console.warn(`Model ${modelName} failed:`, lastError.message)
      continue
    }
  }

  throw lastError || new Error('All Gemini models failed')
}

/**
 * Generate diagnostic using OpenAI
 */
async function generateWithOpenAI(input: DiagnosticInput): Promise<DiagnosticResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const prompt = buildDiagnosticPrompt(input)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Você é um especialista em zootecnia com amplo conhecimento em análise de dados de produção animal. Sua tarefa é gerar diagnósticos técnicos precisos e acionáveis baseados em dados estatísticos.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })

  const text = completion.choices[0]?.message?.content || ''
  return parseDiagnosticResponse(text)
}

/**
 * Build diagnostic prompt for AI
 */
function buildDiagnosticPrompt(input: DiagnosticInput): string {
  const { species, subtype, statistics, references, correlations, metadata } = input

  const speciesName = getSpeciesDisplayName(species, subtype)
  const numericStats = statistics.numericStats || {}
  const statsCount = Object.keys(numericStats).length
  const totalRows = metadata?.totalRows || 0

  let prompt = `# ANÁLISE ZOOTÉCNICA - ${speciesName.toUpperCase()}\n\n`
  prompt += `## CONTEXTO\n`
  prompt += `- Espécie: ${speciesName}\n`
  prompt += `- Total de registros: ${totalRows}\n`
  prompt += `- Variáveis analisadas: ${statsCount}\n\n`

  prompt += `## ESTATÍSTICAS DESCRITIVAS\n\n`
  for (const [variable, stats] of Object.entries(numericStats)) {
    prompt += `### ${variable}\n`
    prompt += `- Média: ${stats.mean}\n`
    prompt += `- Mediana: ${stats.median}\n`
    prompt += `- Desvio Padrão: ${stats.stdDev}\n`
    prompt += `- CV%: ${stats.cv}%\n`
    prompt += `- Min: ${stats.min} | Max: ${stats.max}\n`
    if (stats.outliers && stats.outliers.length > 0) {
      prompt += `- Outliers: ${stats.outliers.length} valores\n`
    }
    prompt += `\n`
  }

  if (references?.comparisons && references.comparisons.length > 0) {
    prompt += `## COMPARAÇÃO COM REFERÊNCIAS CIENTÍFICAS\n\n`
    for (const comp of references.comparisons) {
      prompt += `- ${comp.metric}: ${comp.value} - Status: ${comp.status}\n`
      if (comp.reference) {
        prompt += `  Referência: ${comp.reference.min} - ${comp.reference.max}\n`
      }
      if (comp.deviation) {
        prompt += `  Desvio: ${comp.deviation > 0 ? '+' : ''}${comp.deviation.toFixed(1)}%\n`
      }
    }
    prompt += `\n`
  }

  if (correlations?.report?.topCorrelations && correlations.report.topCorrelations.length > 0) {
    prompt += `## CORRELAÇÕES SIGNIFICATIVAS\n\n`
    const topCorrs = correlations.report.topCorrelations.slice(0, 5)
    for (const corr of topCorrs) {
      prompt += `- ${corr.var1} ↔ ${corr.var2}: r = ${corr.coefficient.toFixed(3)}`
      prompt += ` (${corr.significant ? 'significativa' : 'não significativa'})\n`
    }
    prompt += `\n`
  }

  prompt += `## TAREFA\n\n`
  prompt += `Gere um diagnóstico zootécnico completo e profissional no seguinte formato JSON:\n\n`
  prompt += `{\n`
  prompt += `  "resumoExecutivo": "Resumo executivo conciso (2-3 frases) sobre o desempenho geral",\n`
  prompt += `  "analiseNumericas": [\n`
  prompt += `    {\n`
  prompt += `      "variavel": "nome da variável",\n`
  prompt += `      "status": "Excelente|Bom|Regular|Preocupante",\n`
  prompt += `      "interpretacao": "interpretação técnica específica",\n`
  prompt += `      "comparacaoLiteratura": "comparação com literatura científica (NRC, EMBRAPA)"\n`
  prompt += `    }\n`
  prompt += `  ],\n`
  prompt += `  "pontosFortes": ["ponto forte 1", "ponto forte 2", ...],\n`
  prompt += `  "pontosAtencao": ["ponto de atenção 1", "ponto de atenção 2", ...],\n`
  prompt += `  "recomendacoesPrioritarias": [\n`
  prompt += `    {\n`
  prompt += `      "titulo": "título da recomendação",\n`
  prompt += `      "descricao": "descrição detalhada e acionável",\n`
  prompt += `      "prioridade": "Alta|Média|Baixa"\n`
  prompt += `    }\n`
  prompt += `  ],\n`
  prompt += `  "conclusao": "Conclusão geral e perspectivas (2-3 frases)",\n`
  prompt += `  "fontes": ["NRC (2021)", "EMBRAPA (2023)", "Literatura científica relevante"]\n`
  prompt += `}\n\n`
  prompt += `IMPORTANTE:\n`
  prompt += `- Use conhecimento técnico em zootecnia\n`
  prompt += `- Baseie-se em referências científicas (NRC, EMBRAPA, etc.)\n`
  prompt += `- Seja específico e acionável nas recomendações\n`
  prompt += `- Considere o contexto da espécie ${speciesName}\n`
  prompt += `- Retorne APENAS o JSON, sem texto adicional\n`

  return prompt
}

/**
 * Parse AI response into structured diagnostic
 */
function parseDiagnosticResponse(text: string): DiagnosticResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!parsed.resumoExecutivo || !parsed.analiseNumericas || !parsed.conclusao) {
      throw new Error('Missing required fields in AI response')
    }

    return {
      resumoExecutivo: parsed.resumoExecutivo,
      analiseNumericas: parsed.analiseNumericas || [],
      pontosFortes: parsed.pontosFortes || [],
      pontosAtencao: parsed.pontosAtencao || [],
      recomendacoesPrioritarias: parsed.recomendacoesPrioritarias || [],
      conclusao: parsed.conclusao,
      fontes: parsed.fontes || [
        'NRC - National Research Council (2021)',
        'EMBRAPA - Empresa Brasileira de Pesquisa Agropecuária (2023)',
        'Análise baseada em IA com conhecimento zootécnico',
      ],
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    throw new Error(`Failed to parse AI response: ${(error as Error).message}`)
  }
}

/**
 * Get display name for species
 */
function getSpeciesDisplayName(species: string, subtype?: string): string {
  const speciesNames: Record<string, string> = {
    bovine: 'Bovinos',
    swine: 'Suínos',
    poultry: 'Aves',
    sheep: 'Ovinos',
    goat: 'Caprinos',
    aquaculture: 'Aquicultura',
    forage: 'Forragem',
    bees: 'Abelhas',
    abelhas: 'Abelhas',
    gado: 'Bovinos',
    unknown: 'Produção Animal',
  }

  const baseName = speciesNames[species.toLowerCase()] || speciesNames['unknown']

  if (subtype) {
    return `${baseName} (${subtype})`
  }

  return baseName
}
