/**
 * Layman Evaluation API
 * POST /api/layman/evaluate
 *
 * Evaluates metrics and generates annotations for layman visualization
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type {
  EvaluationRequest,
  EvaluationResponse,
  MetricKey,
  MetricCategory,
} from '@/lib/layman/types'

export const dynamic = 'force-dynamic'

// Default thresholds (TODO: Load from database per farm)
const DEFAULT_THRESHOLDS = {
  // Generic metrics
  peso_vs_meta_pct: {
    excellent: { min: 1.0, max: 10.0 },
    ok: { min: 0.95, max: 0.999 },
    ruim: { min: 0.0, max: 0.949 },
  },
  gmd_7d: {
    excellent: { min: 0.6, max: 10.0 },
    ok: { min: 0.3, max: 0.599 },
    ruim: { min: 0.0, max: 0.299 },
  },
  gmd_30d: {
    excellent: { min: 0.5, max: 10.0 },
    ok: { min: 0.25, max: 0.499 },
    ruim: { min: 0.0, max: 0.249 },
  },
  bcs: {
    excellent: { min: 3.5, max: 5.0 },
    ok: { min: 2.5, max: 3.49 },
    ruim: { min: 0.0, max: 2.49 },
  },
  biomassa_kg_ha: {
    excellent: { min: 2500, max: 100000 },
    ok: { min: 1500, max: 2499 },
    ruim: { min: 0, max: 1499 },
  },
  cobertura_pct: {
    excellent: { min: 80, max: 100 },
    ok: { min: 60, max: 79 },
    ruim: { min: 0, max: 59 },
  },
  indice_visual: {
    excellent: { min: 70, max: 100 },
    ok: { min: 50, max: 69 },
    ruim: { min: 0, max: 49 },
  },

  // Bovine-specific thresholds (based on EMBRAPA/NRC references)
  peso_nascimento: {
    excellent: { min: 30, max: 45 },
    ok: { min: 25, max: 29.99 },
    ruim: { min: 0, max: 24.99 },
  },
  peso_desmame: {
    excellent: { min: 180, max: 280 },
    ok: { min: 140, max: 179.99 },
    ruim: { min: 0, max: 139.99 },
  },
  peso_abate: {
    excellent: { min: 450, max: 600 },
    ok: { min: 380, max: 449.99 },
    ruim: { min: 0, max: 379.99 },
  },
  producao_leite: {
    excellent: { min: 25, max: 60 },
    ok: { min: 15, max: 24.99 },
    ruim: { min: 0, max: 14.99 },
  },
  gordura_leite: {
    excellent: { min: 3.5, max: 5.0 },
    ok: { min: 3.0, max: 3.49 },
    ruim: { min: 0, max: 2.99 },
  },
  proteina_leite: {
    excellent: { min: 3.2, max: 4.0 },
    ok: { min: 2.9, max: 3.19 },
    ruim: { min: 0, max: 2.89 },
  },
  conversao_alimentar: {
    excellent: { min: 0, max: 5.5 },
    ok: { min: 5.51, max: 7.0 },
    ruim: { min: 7.01, max: 20 },
  },

  // Swine-specific thresholds
  espessura_toucinho: {
    excellent: { min: 10, max: 15 },
    ok: { min: 15.01, max: 20 },
    ruim: { min: 20.01, max: 50 },
  },
  rendimento_carcaca: {
    excellent: { min: 75, max: 85 },
    ok: { min: 70, max: 74.99 },
    ruim: { min: 0, max: 69.99 },
  },
  leitoes_nascidos: {
    excellent: { min: 12, max: 18 },
    ok: { min: 10, max: 11.99 },
    ruim: { min: 0, max: 9.99 },
  },
  mortalidade: {
    excellent: { min: 0, max: 3 },
    ok: { min: 3.01, max: 5 },
    ruim: { min: 5.01, max: 100 },
  },

  // Poultry-specific thresholds
  peso_final_ave: {
    excellent: { min: 2.5, max: 3.5 },
    ok: { min: 2.2, max: 2.49 },
    ruim: { min: 0, max: 2.19 },
  },
  iep: {
    excellent: { min: 350, max: 450 },
    ok: { min: 300, max: 349.99 },
    ruim: { min: 0, max: 299.99 },
  },
  viabilidade: {
    excellent: { min: 97, max: 100 },
    ok: { min: 95, max: 96.99 },
    ruim: { min: 0, max: 94.99 },
  },
  producao_ovos: {
    excellent: { min: 85, max: 100 },
    ok: { min: 75, max: 84.99 },
    ruim: { min: 0, max: 74.99 },
  },
  peso_ovo: {
    excellent: { min: 58, max: 68 },
    ok: { min: 52, max: 57.99 },
    ruim: { min: 0, max: 51.99 },
  },

  // Sheep/Goat-specific thresholds
  peso_la: {
    excellent: { min: 4, max: 8 },
    ok: { min: 2.5, max: 3.99 },
    ruim: { min: 0, max: 2.49 },
  },
  producao_leite_cabra: {
    excellent: { min: 3, max: 6 },
    ok: { min: 2, max: 2.99 },
    ruim: { min: 0, max: 1.99 },
  },

  // Aquaculture-specific thresholds
  peso_final_peixe: {
    excellent: { min: 0.8, max: 1.5 },
    ok: { min: 0.6, max: 0.79 },
    ruim: { min: 0, max: 0.59 },
  },
  sobrevivencia: {
    excellent: { min: 90, max: 100 },
    ok: { min: 80, max: 89.99 },
    ruim: { min: 0, max: 79.99 },
  },
  densidade_estocagem: {
    excellent: { min: 15, max: 30 },
    ok: { min: 30.01, max: 40 },
    ruim: { min: 40.01, max: 100 },
  },
  oxigenio_dissolvido: {
    excellent: { min: 5, max: 10 },
    ok: { min: 4, max: 4.99 },
    ruim: { min: 0, max: 3.99 },
  },

  // Bee-specific thresholds (based on EMBRAPA Meio-Norte references)
  producao_mel: {
    excellent: { min: 30, max: 100 },
    ok: { min: 15, max: 29.99 },
    ruim: { min: 0, max: 14.99 },
  },
  populacao_abelhas: {
    excellent: { min: 40000, max: 100000 },
    ok: { min: 20000, max: 39999 },
    ruim: { min: 0, max: 19999 },
  },
  quadros_cria: {
    excellent: { min: 7, max: 15 },
    ok: { min: 4, max: 6.99 },
    ruim: { min: 0, max: 3.99 },
  },
  taxa_enxameacao: {
    excellent: { min: 0, max: 10 },
    ok: { min: 10.01, max: 20 },
    ruim: { min: 20.01, max: 100 },
  },
  saude_colonia: {
    excellent: { min: 85, max: 100 },
    ok: { min: 70, max: 84.99 },
    ruim: { min: 0, max: 69.99 },
  },
}

/**
 * Evaluate a single metric against thresholds
 */
function evaluateMetric(value: number, metricKey: string): MetricCategory {
  const thresholds = DEFAULT_THRESHOLDS[metricKey as keyof typeof DEFAULT_THRESHOLDS]

  if (!thresholds) {
    return 'ok'
  }

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
  if (!peso_kg || !meta_peso_kg || meta_peso_kg === 0) {
    return undefined
  }
  return peso_kg / meta_peso_kg
}

/**
 * Determine final color using priority rule (worst metric wins)
 */
function determineFinalColor(categories: MetricCategory[]): 'red' | 'yellow' | 'green' {
  if (categories.includes('ruim')) {
    return 'red'
  }
  if (categories.includes('ok')) {
    return 'yellow'
  }
  return 'green'
}

/**
 * Get display label for metric
 */
function getDisplayLabel(metricKey: string, category: MetricCategory): string {
  const labels: Record<string, Record<MetricCategory, string>> = {
    // Generic metrics
    peso_vs_meta_pct: {
      excellent: 'Peso acima da meta',
      ok: 'Peso próximo da meta',
      ruim: 'Peso baixo',
    },
    gmd_7d: {
      excellent: 'Ganho excelente (7d)',
      ok: 'Ganho ok (7d)',
      ruim: 'Ganho baixo (7d)',
    },
    gmd_30d: {
      excellent: 'Ganho excelente (30d)',
      ok: 'Ganho ok (30d)',
      ruim: 'Ganho baixo (30d)',
    },
    bcs: {
      excellent: 'Condição corporal excelente',
      ok: 'Condição corporal ok',
      ruim: 'Condição corporal ruim',
    },
    biomassa_kg_ha: {
      excellent: 'Biomassa excelente',
      ok: 'Biomassa adequada',
      ruim: 'Biomassa baixa',
    },
    cobertura_pct: {
      excellent: 'Cobertura excelente',
      ok: 'Cobertura adequada',
      ruim: 'Cobertura insuficiente',
    },
    indice_visual: {
      excellent: 'Índice visual excelente',
      ok: 'Índice visual adequado',
      ruim: 'Índice visual ruim',
    },

    // Bovine-specific labels
    peso_nascimento: {
      excellent: 'Peso ao nascer excelente',
      ok: 'Peso ao nascer adequado',
      ruim: 'Peso ao nascer baixo',
    },
    peso_desmame: {
      excellent: 'Peso ao desmame excelente',
      ok: 'Peso ao desmame adequado',
      ruim: 'Peso ao desmame baixo',
    },
    peso_abate: {
      excellent: 'Peso ao abate excelente',
      ok: 'Peso ao abate adequado',
      ruim: 'Peso ao abate baixo',
    },
    producao_leite: {
      excellent: 'Produção de leite excelente',
      ok: 'Produção de leite adequada',
      ruim: 'Produção de leite baixa',
    },
    gordura_leite: {
      excellent: 'Gordura do leite excelente',
      ok: 'Gordura do leite adequada',
      ruim: 'Gordura do leite baixa',
    },
    proteina_leite: {
      excellent: 'Proteína do leite excelente',
      ok: 'Proteína do leite adequada',
      ruim: 'Proteína do leite baixa',
    },
    conversao_alimentar: {
      excellent: 'Conversão alimentar excelente',
      ok: 'Conversão alimentar adequada',
      ruim: 'Conversão alimentar ruim',
    },

    // Swine-specific labels
    espessura_toucinho: {
      excellent: 'Espessura de toucinho ideal',
      ok: 'Espessura de toucinho adequada',
      ruim: 'Espessura de toucinho alta',
    },
    rendimento_carcaca: {
      excellent: 'Rendimento de carcaça excelente',
      ok: 'Rendimento de carcaça adequado',
      ruim: 'Rendimento de carcaça baixo',
    },
    leitoes_nascidos: {
      excellent: 'Leitões nascidos excelente',
      ok: 'Leitões nascidos adequado',
      ruim: 'Leitões nascidos baixo',
    },
    mortalidade: {
      excellent: 'Mortalidade baixa',
      ok: 'Mortalidade moderada',
      ruim: 'Mortalidade alta',
    },

    // Poultry-specific labels
    peso_final_ave: {
      excellent: 'Peso final excelente',
      ok: 'Peso final adequado',
      ruim: 'Peso final baixo',
    },
    iep: {
      excellent: 'IEP excelente',
      ok: 'IEP adequado',
      ruim: 'IEP baixo',
    },
    viabilidade: {
      excellent: 'Viabilidade excelente',
      ok: 'Viabilidade adequada',
      ruim: 'Viabilidade baixa',
    },
    producao_ovos: {
      excellent: 'Produção de ovos excelente',
      ok: 'Produção de ovos adequada',
      ruim: 'Produção de ovos baixa',
    },
    peso_ovo: {
      excellent: 'Peso do ovo excelente',
      ok: 'Peso do ovo adequado',
      ruim: 'Peso do ovo baixo',
    },

    // Sheep/Goat-specific labels
    peso_la: {
      excellent: 'Produção de lã excelente',
      ok: 'Produção de lã adequada',
      ruim: 'Produção de lã baixa',
    },
    producao_leite_cabra: {
      excellent: 'Produção de leite excelente',
      ok: 'Produção de leite adequada',
      ruim: 'Produção de leite baixa',
    },

    // Aquaculture-specific labels
    peso_final_peixe: {
      excellent: 'Peso final excelente',
      ok: 'Peso final adequado',
      ruim: 'Peso final baixo',
    },
    sobrevivencia: {
      excellent: 'Sobrevivência excelente',
      ok: 'Sobrevivência adequada',
      ruim: 'Sobrevivência baixa',
    },
    densidade_estocagem: {
      excellent: 'Densidade ideal',
      ok: 'Densidade adequada',
      ruim: 'Densidade alta',
    },
    oxigenio_dissolvido: {
      excellent: 'Oxigênio excelente',
      ok: 'Oxigênio adequado',
      ruim: 'Oxigênio baixo',
    },

    // Bee-specific labels
    producao_mel: {
      excellent: 'Produção de mel excelente',
      ok: 'Produção de mel adequada',
      ruim: 'Produção de mel baixa',
    },
    populacao_abelhas: {
      excellent: 'População excelente',
      ok: 'População adequada',
      ruim: 'População baixa',
    },
    quadros_cria: {
      excellent: 'Cria excelente',
      ok: 'Cria adequada',
      ruim: 'Cria insuficiente',
    },
    taxa_enxameacao: {
      excellent: 'Enxameação controlada',
      ok: 'Enxameação moderada',
      ruim: 'Enxameação alta',
    },
    saude_colonia: {
      excellent: 'Saúde da colônia excelente',
      ok: 'Saúde da colônia ok',
      ruim: 'Saúde da colônia ruim',
    },
  }

  return labels[metricKey]?.[category] || `${metricKey} ${category}`
}

/**
 * Get unit for metric
 */
function getMetricUnit(metricKey: string): string {
  const units: Record<string, string> = {
    // Generic metrics
    peso_vs_meta_pct: '%',
    gmd_7d: 'kg/dia',
    gmd_30d: 'kg/dia',
    bcs: '',
    biomassa_kg_ha: 'kg/ha',
    cobertura_pct: '%',
    indice_visual: '',

    // Bovine-specific units
    peso_nascimento: 'kg',
    peso_desmame: 'kg',
    peso_abate: 'kg',
    producao_leite: 'L/dia',
    gordura_leite: '%',
    proteina_leite: '%',
    conversao_alimentar: 'kg/kg',

    // Swine-specific units
    espessura_toucinho: 'mm',
    rendimento_carcaca: '%',
    leitoes_nascidos: 'leitões',
    mortalidade: '%',

    // Poultry-specific units
    peso_final_ave: 'kg',
    iep: 'pontos',
    viabilidade: '%',
    producao_ovos: '%',
    peso_ovo: 'g',

    // Sheep/Goat-specific units
    peso_la: 'kg',
    producao_leite_cabra: 'L/dia',

    // Aquaculture-specific units
    peso_final_peixe: 'kg',
    sobrevivencia: '%',
    densidade_estocagem: 'peixes/m³',
    oxigenio_dissolvido: 'mg/L',

    // Bee-specific units
    producao_mel: 'kg/colmeia/ano',
    populacao_abelhas: 'abelhas',
    quadros_cria: 'quadros',
    taxa_enxameacao: '%',
    saude_colonia: '%',
  }

  return units[metricKey] || ''
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parse request body
    const body: EvaluationRequest = await request.json()

    // Validate required fields
    if (!body.entity_id || !body.farm_id || !body.entity_type) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    const { entity_id, metric_values } = body

    // Calculate derived metrics
    const peso_vs_meta = calculatePesoVsMeta(metric_values.peso_kg, metric_values.meta_peso_kg)

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
        display_label: getDisplayLabel('peso_vs_meta_pct', category),
      })
    }

    // Process other metrics
    const metricsToEvaluate: Array<{ key: MetricKey; value: number | undefined }> = [
      // Generic metrics
      { key: 'gmd_7d', value: metric_values.gmd_7d_kg_per_day },
      { key: 'gmd_30d', value: metric_values.gmd_30d_kg_per_day },
      { key: 'bcs', value: metric_values.bcs },
      { key: 'biomassa_kg_ha', value: metric_values.biomassa_kg_ha },
      { key: 'cobertura_pct', value: metric_values.cobertura_pct },
      { key: 'indice_visual', value: metric_values.indice_visual },

      // Bovine-specific metrics
      { key: 'peso_nascimento', value: metric_values.peso_nascimento_kg },
      { key: 'peso_desmame', value: metric_values.peso_desmame_kg },
      { key: 'peso_abate', value: metric_values.peso_abate_kg },
      { key: 'producao_leite', value: metric_values.producao_leite_l },
      { key: 'gordura_leite', value: metric_values.gordura_leite_pct },
      { key: 'proteina_leite', value: metric_values.proteina_leite_pct },
      { key: 'conversao_alimentar', value: metric_values.conversao_alimentar },

      // Swine-specific metrics
      { key: 'espessura_toucinho', value: metric_values.espessura_toucinho_mm },
      { key: 'rendimento_carcaca', value: metric_values.rendimento_carcaca_pct },
      { key: 'leitoes_nascidos', value: metric_values.leitoes_nascidos },
      { key: 'mortalidade', value: metric_values.mortalidade_pct },

      // Poultry-specific metrics
      { key: 'peso_final_ave', value: metric_values.peso_final_ave_kg },
      { key: 'iep', value: metric_values.iep },
      { key: 'viabilidade', value: metric_values.viabilidade_pct },
      { key: 'producao_ovos', value: metric_values.producao_ovos_pct },
      { key: 'peso_ovo', value: metric_values.peso_ovo_g },

      // Sheep/Goat-specific metrics
      { key: 'peso_la', value: metric_values.peso_la_kg },
      { key: 'producao_leite_cabra', value: metric_values.producao_leite_cabra_l },

      // Aquaculture-specific metrics
      { key: 'peso_final_peixe', value: metric_values.peso_final_peixe_kg },
      { key: 'sobrevivencia', value: metric_values.sobrevivencia_pct },
      { key: 'densidade_estocagem', value: metric_values.densidade_estocagem },
      { key: 'oxigenio_dissolvido', value: metric_values.oxigenio_dissolvido_mg },

      // Bee-specific metrics
      { key: 'producao_mel', value: metric_values.producao_mel_kg },
      { key: 'populacao_abelhas', value: metric_values.populacao_abelhas },
      { key: 'quadros_cria', value: metric_values.quadros_cria },
      { key: 'taxa_enxameacao', value: metric_values.taxa_enxameacao_pct },
      { key: 'saude_colonia', value: metric_values.saude_colonia },
    ]

    for (const { key, value } of metricsToEvaluate) {
      if (value !== undefined) {
        const category = evaluateMetric(value, key)
        categories.push(category)
        metric_summaries.push({
          metric_key: key,
          value,
          category,
          display_label: getDisplayLabel(key, category),
        })
      }
    }

    // Determine final color
    const final_color = determineFinalColor(categories)
    const short_label = final_color === 'green' ? 'ótimo' : final_color === 'yellow' ? 'ok' : 'ruim'

    const badges = metric_summaries.map((summary) => ({
      metric_key: summary.metric_key,
      category: summary.category,
      value: summary.value,
      unit: getMetricUnit(summary.metric_key),
    }))

    // Build response
    const response: EvaluationResponse = {
      entity_id,
      final_color,
      short_label,
      annotation: {
        mode: 'composition_metadata',
        composition_metadata: {
          silhouette_type: body.entity_type,
          overlay_color:
            final_color === 'green' ? '#22c55e' : final_color === 'yellow' ? '#eab308' : '#ef4444',
          badges,
          label_position: {
            x: 85,
            y: 15,
          },
        },
      },
      metric_summaries,
      thresholds_version: 'v2025-11-04-01',
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error in layman evaluate:', error)
    return NextResponse.json({ error: 'Erro ao avaliar métricas' }, { status: 500 })
  }
}
