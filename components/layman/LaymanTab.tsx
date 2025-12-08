/**
 * EN: LaymanTab - Main component for Layman Visualization Tab
 * PT-BR: LaymanTab - Componente principal para Aba de Visualização Leiga
 *
 * EN: Displays analysis data in an intuitive, accessible format using:
 *     - Color-coded visualizations (red/yellow/green)
 *     - Simple language
 *     - Action summary based on diagnostic analysis
 * PT-BR: Exibe dados de análise em formato intuitivo e acessível usando:
 *        - Visualizações codificadas por cores (vermelho/amarelo/verde)
 *        - Linguagem simples
 *        - Resumo de ações baseado na análise diagnóstica
 */

'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Info } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { ColorLegend } from './ColorLegend'
import { ActionSummary } from './ActionSummary'
import { laymanService } from '@/services/layman.service'
import { toast } from 'sonner'
import type { LaymanViewResponse, EntityType } from '@/lib/layman/types'
import type { DiagnosticResult } from '@/lib/ai-diagnostic'

// Feature flag to control image visibility (set to false to hide silhouettes)
// The AnimalSilhouettes and ForagePanel components are preserved for future use
const SHOW_IMAGES = false

// Preserved imports for future use when SHOW_IMAGES is enabled:
// import { AnimalSilhouette } from './AnimalSilhouettes'
// import { ForagePanel } from './ForagePanel'

// Helper function to map entity type to species (preserved for future use when SHOW_IMAGES is enabled)
function _getSpeciesFromEntityType(
  entityType: EntityType
): 'bovine' | 'swine' | 'poultry' | 'sheep' | 'goat' | 'fish' {
  switch (entityType) {
    case 'gado':
    case 'bovine':
      return 'bovine'
    case 'swine':
      return 'swine'
    case 'poultry':
      return 'poultry'
    case 'sheep':
      return 'sheep'
    case 'goat':
      return 'goat'
    case 'fish':
      return 'fish'
    default:
      return 'bovine' // Default to bovine for backward compatibility
  }
}

interface LaymanTabProps {
  analysisData: Record<string, unknown>
  entityType: EntityType
  diagnostic?: DiagnosticResult | null
  loadingDiagnostic?: boolean
  onRequestDiagnostic?: () => void
}

export function LaymanTab({
  analysisData,
  entityType,
  diagnostic,
  loadingDiagnostic,
  onRequestDiagnostic,
}: LaymanTabProps) {
  const [evaluation, setEvaluation] = useState<LaymanViewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function evaluateData() {
      try {
        setLoading(true)
        setError(null)

        // Convert analysis data to evaluation request
        const request = laymanService.convertAnalysisToEvaluation(analysisData, entityType)

        // Evaluate metrics
        const result = await laymanService.evaluateMetrics(request)

        // Convert EvaluationResponse to LaymanViewResponse by adding legend
        const laymanView: LaymanViewResponse = {
          ...result,
          legend: [
            { color: 'red', meaning: 'Ruim — ação necessária' },
            { color: 'yellow', meaning: 'Ok — monitorar' },
            { color: 'green', meaning: 'Ótimo — sem ação' },
          ],
          technical_view_url: null,
        }

        setEvaluation(laymanView)
      } catch (err) {
        console.error('Error evaluating data:', err)
        setError(err instanceof Error ? err.message : 'Erro ao avaliar dados')
        toast.error('Erro ao processar visualização leiga')
      } finally {
        setLoading(false)
      }
    }

    if (analysisData) {
      void evaluateData()
    }
  }, [analysisData, entityType])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">Processando visualização...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-6 border border-red-200 dark:border-red-900">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
              Erro ao Processar Dados
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-900">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Dados Insuficientes
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Não há dados suficientes para gerar a visualização leiga.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Visualização Leiga</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Interpretação simplificada e universal dos dados
        </p>
      </div>

      {/* Color Legend */}
      <ColorLegend />

      {/* Main Visualization */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Action Summary (replaces silhouettes when SHOW_IMAGES is false) */}
        <div>
          {SHOW_IMAGES ? (
            // Silhouettes are hidden but code is preserved for future use
            // To re-enable, set SHOW_IMAGES = true and uncomment the imports
            <div className="bg-muted/30 rounded-lg p-6 text-center text-muted-foreground">
              Silhuetas desabilitadas
            </div>
          ) : (
            <ActionSummary
              diagnostic={diagnostic ?? null}
              loading={loadingDiagnostic}
              onRequestDiagnostic={onRequestDiagnostic}
            />
          )}
        </div>

        {/* Right: Metric Cards */}
        <div className="space-y-4">
          {evaluation.metric_summaries.map((metric) => (
            <MetricCard key={metric.metric_key} metric={metric} viewMode="layman" />
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">Como Interpretar:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <strong className="text-green-700 dark:text-green-400">Verde</strong>: Excelente!
                Continue assim.
              </li>
              <li>
                <strong className="text-amber-700 dark:text-amber-400">Amarelo</strong>: Está ok,
                mas monitore de perto.
              </li>
              <li>
                <strong className="text-red-700 dark:text-red-400">Vermelho</strong>: Precisa de
                atenção imediata!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
