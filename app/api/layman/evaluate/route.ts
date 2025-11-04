/**
 * Layman Evaluation API
 * POST /api/layman/evaluate
 * 
 * Evaluates metrics and generates annotations for layman visualization
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { EvaluationRequest, EvaluationResponse, MetricKey, MetricCategory } from '@/lib/layman/types'

export const dynamic = 'force-dynamic'

// Default thresholds (TODO: Load from database per farm)
const DEFAULT_THRESHOLDS = {
  peso_vs_meta_pct: {
    excellent: { min: 1.00, max: 10.0 },
    ok: { min: 0.95, max: 0.999 },
    ruim: { min: 0.0, max: 0.949 }
  },
  gmd_7d: {
    excellent: { min: 0.6, max: 10.0 },
    ok: { min: 0.3, max: 0.599 },
    ruim: { min: 0.0, max: 0.299 }
  },
  gmd_30d: {
    excellent: { min: 0.5, max: 10.0 },
    ok: { min: 0.25, max: 0.499 },
    ruim: { min: 0.0, max: 0.249 }
  },
  bcs: {
    excellent: { min: 3.5, max: 5.0 },
    ok: { min: 2.5, max: 3.49 },
    ruim: { min: 0.0, max: 2.49 }
  },
  biomassa_kg_ha: {
    excellent: { min: 2500, max: 100000 },
    ok: { min: 1500, max: 2499 },
    ruim: { min: 0, max: 1499 }
  },
  cobertura_pct: {
    excellent: { min: 80, max: 100 },
    ok: { min: 60, max: 79 },
    ruim: { min: 0, max: 59 }
  },
  indice_visual: {
    excellent: { min: 70, max: 100 },
    ok: { min: 50, max: 69 },
    ruim: { min: 0, max: 49 }
  }
}

/**
 * Evaluate a single metric against thresholds
 */
function evaluateMetric(value: number, metricKey: string): MetricCategory {
  const thresholds = DEFAULT_THRESHOLDS[metricKey as keyof typeof DEFAULT_THRESHOLDS]
  
  if (!thresholds) return 'ok'
  
  if (value >= thresholds.excellent.min && value <= thresholds.excellent.max) {
    return 'excellent'
  }
  if (value >= thresholds.ok.min && value <= thresholds.ok.max) {
    return 'ok'
  }
  return 'ruim'
}

/**
 * Calculate peso_vs_meta_pct from peso and meta_peso
 */
function calculatePesoVsMeta(peso_kg?: number, meta_peso_kg?: number): number | undefined {
  if (!peso_kg || !meta_peso_kg || meta_peso_kg === 0) return undefined
  return peso_kg / meta_peso_kg
}

/**
 * Determine final color using priority rule (worst metric wins)
 */
function determineFinalColor(categories: MetricCategory[]): 'red' | 'yellow' | 'green' {
  if (categories.includes('ruim')) return 'red'
  if (categories.includes('ok')) return 'yellow'
  return 'green'
}

/**
 * Get display label for metric
 */
function getDisplayLabel(metricKey: string, category: MetricCategory): string {
  const labels: Record<string, Record<MetricCategory, string>> = {
    peso_vs_meta_pct: {
      excellent: 'Peso acima da meta',
      ok: 'Peso próximo da meta',
      ruim: 'Peso baixo'
    },
    gmd_7d: {
      excellent: 'Ganho excelente (7d)',
      ok: 'Ganho ok (7d)',
      ruim: 'Ganho baixo (7d)'
    },
    gmd_30d: {
      excellent: 'Ganho excelente (30d)',
      ok: 'Ganho ok (30d)',
      ruim: 'Ganho baixo (30d)'
    },
    bcs: {
      excellent: 'Condição corporal excelente',
      ok: 'Condição corporal ok',
      ruim: 'Condição corporal ruim'
    },
    biomassa_kg_ha: {
      excellent: 'Biomassa excelente',
      ok: 'Biomassa adequada',
      ruim: 'Biomassa baixa'
    },
    cobertura_pct: {
      excellent: 'Cobertura excelente',
      ok: 'Cobertura adequada',
      ruim: 'Cobertura insuficiente'
    },
    indice_visual: {
      excellent: 'Índice visual excelente',
      ok: 'Índice visual adequado',
      ruim: 'Índice visual ruim'
    }
  }
  
  return labels[metricKey]?.[category] || `${metricKey} ${category}`
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: EvaluationRequest = await request.json()
    
    // Validate required fields
    if (!body.entity_id || !body.farm_id || !body.entity_type) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    const { entity_id, metric_values } = body

    // Calculate derived metrics
    const peso_vs_meta = calculatePesoVsMeta(
      metric_values.peso_kg,
      metric_values.meta_peso_kg
    )

    // Evaluate each metric
    const metric_summaries = []
    const categories: MetricCategory[] = []

    // Process peso_vs_meta_pct
    if (peso_vs_meta !== undefined) {
      const category = evaluateMetric(peso_vs_meta, 'peso_vs_meta_pct')
      categories.push(category)
      metric_summaries.push({
        metric_key: 'peso_vs_meta_pct',
        value: peso_vs_meta,
        category,
        display_label: getDisplayLabel('peso_vs_meta_pct', category)
      })
    }

    // Process other metrics
    const metricsToEvaluate: Array<{ key: MetricKey; value: number | undefined }> = [
      { key: 'gmd_7d', value: metric_values.gmd_7d_kg_per_day },
      { key: 'gmd_30d', value: metric_values.gmd_30d_kg_per_day },
      { key: 'bcs', value: metric_values.bcs },
      { key: 'biomassa_kg_ha', value: metric_values.biomassa_kg_ha },
      { key: 'cobertura_pct', value: metric_values.cobertura_pct },
      { key: 'indice_visual', value: metric_values.indice_visual }
    ]

    for (const { key, value } of metricsToEvaluate) {
      if (value !== undefined) {
        const category = evaluateMetric(value, key)
        categories.push(category)
        metric_summaries.push({
          metric_key: key,
          value,
          category,
          display_label: getDisplayLabel(key, category)
        })
      }
    }

    // Determine final color
    const final_color = determineFinalColor(categories)
    const short_label = final_color === 'green' ? 'ótimo' : final_color === 'yellow' ? 'ok' : 'ruim'

    // Build response
    const response: EvaluationResponse = {
      entity_id,
      final_color,
      short_label,
      annotation: {
        mode: 'composition_metadata',
        composition_metadata: null
      },
      metric_summaries,
      thresholds_version: 'v2025-11-04-01'
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error in layman evaluate:', error)
    return NextResponse.json(
      { error: 'Erro ao avaliar métricas' },
      { status: 500 }
    )
  }
}
