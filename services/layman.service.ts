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
  ThresholdHistoryResponse
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
  async refreshAnnotation(entityId: string, force: boolean = false): Promise<{ task_id: string; status: string }> {
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
  ): Promise<{ farm_id: string; version: string; applied: boolean; preview: boolean; errors: string[] }> {
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
      const error = await response.json().catch(() => ({ error: 'Failed to get threshold history' }))
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
    entityType: 'gado' | 'forragem'
  ): EvaluationRequest {
    // Extract metrics from analysis data
    const metrics = analysisData.numericStats as Record<string, { mean?: number }> || {}
    
    return {
      entity_id: `analysis_${Date.now()}`,
      farm_id: 'default_farm', // TODO: Get from user context
      entity_type: entityType,
      metric_values: {
        peso_kg: metrics['peso']?.mean || metrics['peso_kg']?.mean,
        gmd_7d_kg_per_day: metrics['gmd_7d']?.mean,
        gmd_30d_kg_per_day: metrics['gmd_30d']?.mean,
        bcs: metrics['bcs']?.mean,
        biomassa_kg_ha: metrics['biomassa']?.mean,
        cobertura_pct: metrics['cobertura']?.mean,
        indice_visual: metrics['indice']?.mean,
      }
    }
  }
}

// Export singleton instance
export const laymanService = new LaymanService()
