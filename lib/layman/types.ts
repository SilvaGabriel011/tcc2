/**
 * Types for Layman Visualization Feature
 * Based on pre.dev JSON schemas
 */

// Entity types
export type EntityType = 'gado' | 'forragem'

// Color categories
export type ColorCategory = 'red' | 'yellow' | 'green'
export type LabelCategory = 'ruim' | 'ok' | 'ótimo'

// Metric status
export type MetricCategory = 'excellent' | 'ok' | 'ruim'

// Metric keys
export type MetricKey = 
  | 'peso_vs_meta_pct'
  | 'gmd_7d'
  | 'gmd_30d'
  | 'bcs'
  | 'biomassa_kg_ha'
  | 'cobertura_pct'
  | 'indice_visual'

/**
 * Metric Values - valores de métricas coletadas
 */
export interface MetricValues {
  peso_kg?: number
  meta_peso_kg?: number
  gmd_7d_kg_per_day?: number
  gmd_30d_kg_per_day?: number
  bcs?: number
  biomassa_kg_ha?: number
  cobertura_pct?: number // 0-100
  indice_visual?: number // 0-100
}

/**
 * Threshold Range - range de valores para categorização
 */
export interface ThresholdRange {
  min: number
  max: number
}

/**
 * Threshold Ranges - ranges por categoria
 */
export interface ThresholdRanges {
  excellent: ThresholdRange
  ok: ThresholdRange
  ruim: ThresholdRange
}

/**
 * Threshold Configuration - configuração de threshold para uma métrica
 */
export interface ThresholdConfig {
  metric_key: MetricKey
  label: string
  ranges: ThresholdRanges
  weight?: number | null
  active: boolean
}

/**
 * Farm Thresholds - configurações de thresholds para uma fazenda
 */
export interface FarmThresholds {
  farm_id: string
  version: string
  thresholds: ThresholdConfig[]
  updated_at: string
}

/**
 * Metric Summary - resumo de avaliação de uma métrica
 */
export interface MetricSummary {
  metric_key: string
  value: number
  category: MetricCategory
  display_label: string
  delta?: number
  unit?: string
}

/**
 * Annotation Mode
 */
export type AnnotationMode = 'image_url' | 'composition_metadata'

/**
 * Composition Metadata - metadados para composição client-side
 */
export interface CompositionMetadata {
  silhouette_type: string
  overlay_color: string
  badges: Array<{
    metric_key: string
    category: MetricCategory
    value: number
    unit: string
  }>
  label_position: {
    x: number
    y: number
  }
}

/**
 * Annotation - anotação visual da entidade
 */
export interface Annotation {
  mode: AnnotationMode
  image_url?: string | null
  composition_metadata?: CompositionMetadata | null
}

/**
 * Evaluation Request - requisição para avaliar métricas
 */
export interface EvaluationRequest {
  entity_id: string
  farm_id: string
  entity_type: EntityType
  photo_url?: string
  signed_photo_url?: string | null
  metric_values: MetricValues
  use_thresholds_version?: string | null
}

/**
 * Evaluation Response - resposta da avaliação
 */
export interface EvaluationResponse {
  entity_id: string
  final_color: ColorCategory
  short_label: LabelCategory
  annotation: Annotation
  metric_summaries: MetricSummary[]
  thresholds_version: string
}

/**
 * Layman View Response - resposta para visualização leiga
 */
export interface LaymanViewResponse extends EvaluationResponse {
  legend: Array<{
    color: string
    meaning: string
  }>
  technical_view_url?: string | null
}

/**
 * Technical View Response - resposta para visualização técnica
 * Same as EvaluationResponse but composition_metadata is detailed
 */
export type TechnicalViewResponse = EvaluationResponse

/**
 * Threshold History Entry
 */
export interface ThresholdHistoryEntry {
  version: string
  changed_by: string
  changed_at: string
  diff: Record<string, unknown>
}

/**
 * Threshold History Response
 */
export interface ThresholdHistoryResponse {
  farm_id: string
  history: ThresholdHistoryEntry[]
}

/**
 * Color Legend Entry
 */
export interface ColorLegendEntry {
  color: ColorCategory
  hex: string
  label: LabelCategory
  meaning: string
  icon: string
}
