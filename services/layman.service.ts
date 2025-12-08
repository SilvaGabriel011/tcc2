/**
 * Layman Service - API calls for Layman Visualization
 *
 * Handles all API interactions for the layman visualization feature:
 * - Evaluate metrics and get annotations
 * - Fetch and update thresholds
 * - Refresh annotations
 * - Get threshold history
 */

import type {
  EvaluationRequest,
  EvaluationResponse,
  LaymanViewResponse,
  TechnicalViewResponse,
  FarmThresholds,
  ThresholdConfig,
  ThresholdHistoryResponse,
  EntityType,
} from '@/lib/layman/types'

export class LaymanService {
  /**
   * Evaluate metrics for an entity and get annotation
   */
  async evaluateMetrics(request: EvaluationRequest): Promise<EvaluationResponse> {
    const response = await fetch('/api/layman/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to evaluate metrics' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get annotation for an entity (layman view)
   */
  async getLaymanAnnotation(entityId: string): Promise<LaymanViewResponse> {
    const response = await fetch(`/api/layman/annotations/${entityId}?view=layman`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get annotation' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get annotation for an entity (technical view)
   */
  async getTechnicalAnnotation(entityId: string): Promise<TechnicalViewResponse> {
    const response = await fetch(`/api/layman/annotations/${entityId}?view=technical`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get annotation' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Refresh annotation for an entity
   */
  async refreshAnnotation(
    entityId: string,
    force: boolean = false
  ): Promise<{ task_id: string; status: string }> {
    const response = await fetch(`/api/layman/annotations/${entityId}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ force }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to refresh annotation' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get thresholds for a farm
   */
  async getFarmThresholds(farmId: string): Promise<FarmThresholds> {
    const response = await fetch(`/api/layman/thresholds?farmId=${farmId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get thresholds' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Update thresholds for a farm
   */
  async updateFarmThresholds(
    farmId: string,
    thresholds: ThresholdConfig[],
    preview: boolean = false
  ): Promise<{
    farm_id: string
    version: string
    applied: boolean
    preview: boolean
    errors: string[]
  }> {
    const response = await fetch(`/api/layman/thresholds?farmId=${farmId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ thresholds, preview }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update thresholds' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Get threshold history for a farm
   */
  async getThresholdHistory(farmId: string): Promise<ThresholdHistoryResponse> {
    const response = await fetch(`/api/layman/thresholds/history?farmId=${farmId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: 'Failed to get threshold history' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Convert analysis data to evaluation request
   * Helper to integrate with existing analysis data
   */
  convertAnalysisToEvaluation(
    analysisData: Record<string, unknown>,
    entityType: EntityType,
    farmId: string = 'default_farm'
  ): EvaluationRequest {
    // Safely extract metrics from analysis data
    const numericStats = analysisData.numericStats
    const metrics =
      numericStats && typeof numericStats === 'object'
        ? (numericStats as Record<string, { mean?: number }>)
        : {}

    // Helper function to safely get mean value with multiple possible field names
    const getMeanValue = (...keys: string[]): number | undefined => {
      for (const key of keys) {
        const value = metrics[key]?.mean
        if (typeof value === 'number' && !isNaN(value)) {
          return value
        }
      }
      return undefined
    }

    return {
      entity_id: `analysis_${Date.now()}`,
      farm_id: farmId,
      entity_type: entityType,
      metric_values: {
        // Generic metrics (all species)
        peso_kg: getMeanValue(
          'PESO_ATUAL_KG',
          'peso_atual_kg',
          'peso',
          'peso_kg',
          'PESO',
          'peso_vivo'
        ),
        gmd_7d_kg_per_day: getMeanValue('GPD', 'gmd_7d', 'gmd_30d', 'gpd', 'ganho_peso_diario'),
        gmd_30d_kg_per_day: getMeanValue('GPD', 'gmd_30d', 'gmd_7d', 'gpd', 'ganho_peso_diario'),
        bcs: getMeanValue(
          'ESCORE_CORPORAL',
          'escore_corporal',
          'bcs',
          'ECC',
          'ecc',
          'condicao_corporal'
        ),
        biomassa_kg_ha: getMeanValue('BIOMASSA_KG_HA', 'biomassa_kg_ha', 'biomassa', 'BIOMASSA'),
        cobertura_pct: getMeanValue('COBERTURA_PCT', 'cobertura_pct', 'cobertura', 'COBERTURA'),
        indice_visual: getMeanValue('INDICE_VISUAL', 'indice_visual', 'indice', 'INDICE'),

        // Bovine-specific metrics
        peso_nascimento_kg: getMeanValue(
          'PESO_NASCIMENTO',
          'peso_nascimento',
          'peso_nasc',
          'birth_weight',
          'peso_ao_nascer'
        ),
        peso_desmame_kg: getMeanValue(
          'PESO_DESMAME',
          'peso_desmame',
          'peso_desmama',
          'weaning_weight',
          'peso_ao_desmame'
        ),
        peso_abate_kg: getMeanValue(
          'PESO_ABATE',
          'peso_abate',
          'peso_final',
          'slaughter_weight',
          'final_weight'
        ),
        producao_leite_l: getMeanValue(
          'PRODUCAO_LEITE',
          'producao_leite',
          'leite',
          'milk_production',
          'producao_leiteira'
        ),
        gordura_leite_pct: getMeanValue(
          'GORDURA_LEITE',
          'gordura_leite',
          'gordura',
          'milk_fat',
          'fat'
        ),
        proteina_leite_pct: getMeanValue(
          'PROTEINA_LEITE',
          'proteina_leite',
          'proteina',
          'milk_protein',
          'protein'
        ),
        conversao_alimentar: getMeanValue(
          'CONVERSAO_ALIMENTAR',
          'conversao_alimentar',
          'ca',
          'fcr',
          'feed_conversion',
          'conversao'
        ),

        // Swine-specific metrics
        espessura_toucinho_mm: getMeanValue(
          'ESPESSURA_TOUCINHO',
          'espessura_toucinho',
          'toucinho',
          'backfat',
          'fat_thickness'
        ),
        rendimento_carcaca_pct: getMeanValue(
          'RENDIMENTO_CARCACA',
          'rendimento_carcaca',
          'rendimento',
          'carcass_yield',
          'dressing_percentage'
        ),
        leitoes_nascidos: getMeanValue(
          'LEITOES_NASCIDOS',
          'leitoes_nascidos_vivos',
          'born_alive',
          'leitoes_vivos',
          'piglets_born_alive',
          'tamanho_leitegada'
        ),
        mortalidade_pct: getMeanValue(
          'MORTALIDADE',
          'mortalidade',
          'mortality',
          'morte',
          'death_rate',
          'taxa_mortalidade'
        ),

        // Poultry-specific metrics
        peso_final_ave_kg: getMeanValue(
          'PESO_FINAL',
          'peso_final',
          'peso_abate',
          'peso_21d',
          'peso_42d',
          'final_weight'
        ),
        iep: getMeanValue(
          'IEP',
          'iep',
          'epi',
          'production_efficiency_index',
          'indice_eficiencia',
          'eficiencia_produtiva'
        ),
        viabilidade_pct: getMeanValue(
          'VIABILIDADE',
          'viabilidade',
          'viability',
          'taxa_sobrevivencia',
          'survival_rate'
        ),
        producao_ovos_pct: getMeanValue(
          'PRODUCAO_OVOS',
          'producao_ovos',
          'egg_production',
          'postura',
          'laying_rate'
        ),
        peso_ovo_g: getMeanValue('PESO_OVO', 'peso_ovo', 'egg_weight', 'peso_medio_ovo'),

        // Sheep/Goat-specific metrics
        peso_la_kg: getMeanValue('PESO_LA', 'peso_la', 'wool_weight', 'la', 'producao_la'),
        producao_leite_cabra_l: getMeanValue(
          'PRODUCAO_LEITE_CABRA',
          'producao_leite',
          'leite_cabra',
          'goat_milk',
          'milk_production'
        ),

        // Aquaculture-specific metrics
        peso_final_peixe_kg: getMeanValue(
          'PESO_FINAL_PEIXE',
          'peso_final',
          'peso_abate',
          'fish_weight',
          'peso_peixe'
        ),
        sobrevivencia_pct: getMeanValue(
          'SOBREVIVENCIA',
          'sobrevivencia',
          'survival',
          'taxa_sobrevivencia',
          'survival_rate'
        ),
        densidade_estocagem: getMeanValue(
          'DENSIDADE_ESTOCAGEM',
          'densidade_estocagem',
          'densidade',
          'stocking_density',
          'density'
        ),
        oxigenio_dissolvido_mg: getMeanValue(
          'OXIGENIO_DISSOLVIDO',
          'oxigenio_dissolvido',
          'od',
          'do',
          'dissolved_oxygen',
          'oxigenio'
        ),

        // Bee-specific metrics
        producao_mel_kg: getMeanValue(
          'PRODUCAO_MEL',
          'producao_mel',
          'producao_mel_colmeia_ano',
          'mel_kg',
          'honey_production'
        ),
        populacao_abelhas: getMeanValue(
          'POPULACAO_ABELHAS',
          'populacao_abelhas_colmeia',
          'populacao',
          'num_abelhas',
          'bee_population'
        ),
        quadros_cria: getMeanValue('QUADROS_CRIA', 'quadros_cria', 'cria_quadros', 'brood_frames'),
        taxa_enxameacao_pct: getMeanValue(
          'TAXA_ENXAMEACAO',
          'taxa_enxameacao',
          'enxameacao_pct',
          'swarming_rate'
        ),
        saude_colonia: getMeanValue(
          'SAUDE_COLONIA',
          'saude_colonia',
          'indice_saude',
          'higienicidade',
          'colony_health'
        ),
      },
    }
  }
}

// Export singleton instance
export const laymanService = new LaymanService()
