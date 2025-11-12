/**
 * Progress Tracking Types
 *
 * Defines the structure for tracking analysis progress through multiple stages
 * Used for real-time progress updates during data analysis
 */

export const ANALYSIS_STEPS = {
  UPLOAD: { order: 1, label: 'Upload', percent: 5 },
  PARSE: { order: 2, label: 'Leitura do arquivo', percent: 15 },
  VALIDATE: { order: 3, label: 'Validação de dados', percent: 25 },
  STATS: { order: 4, label: 'Cálculo de estatísticas', percent: 55 },
  CORRELATIONS: { order: 5, label: 'Análise de correlações', percent: 75 },
  REFERENCES: { order: 6, label: 'Comparação com referências', percent: 85 },
  DIAGNOSTICS: { order: 7, label: 'Geração de diagnóstico', percent: 90 },
  SAVE: { order: 8, label: 'Salvando resultados', percent: 98 },
  DONE: { order: 9, label: 'Concluído', percent: 100 },
} as const

export type AnalysisStep = keyof typeof ANALYSIS_STEPS

export interface AnalysisProgress {
  analysisId: string
  step: AnalysisStep
  percent: number
  message: string
  counters?: {
    processed?: number
    total?: number
    current?: string
  }
  status: 'running' | 'completed' | 'error' | 'cancelled'
  startedAt: string
  updatedAt: string
  etaSeconds?: number
  error?: {
    message: string
    details?: string
  }
}
