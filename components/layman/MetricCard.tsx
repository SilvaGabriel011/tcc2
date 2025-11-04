/**
 * MetricCard - Display individual metric with color coding
 */

'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getColorBackground, getColorText, getColorBorder, getLabelText } from '@/lib/layman/colors'
import type { MetricSummary, ColorCategory } from '@/lib/layman/types'

interface MetricCardProps {
  metric: MetricSummary
  viewMode: 'layman' | 'technical'
}

// Map metric keys to friendly names
const METRIC_LABELS: Record<string, string> = {
  'peso_vs_meta_pct': 'Peso vs Meta',
  'gmd_7d': 'Ganho de Peso (7 dias)',
  'gmd_30d': 'Ganho de Peso (30 dias)',
  'bcs': 'Condição Corporal',
  'biomassa_kg_ha': 'Biomassa',
  'cobertura_pct': 'Cobertura do Solo',
  'indice_visual': 'Índice Visual'
}

// Map categories to colors
function categoryToColor(category: string): ColorCategory {
  if (category === 'excellent') return 'green'
  if (category === 'ok') return 'yellow'
  return 'red'
}

export function MetricCard({ metric, viewMode }: MetricCardProps) {
  const color = categoryToColor(metric.category)
  const label = getLabelText(color === 'green' ? 'ótimo' : color === 'yellow' ? 'ok' : 'ruim')
  const metricLabel = METRIC_LABELS[metric.metric_key] || metric.metric_key

  // Determine trend icon
  const delta = metric.delta || 0
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus
  
  return (
    <div className={`rounded-lg p-4 border-2 ${getColorBorder(color)} ${getColorBackground(color, 'light')}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm font-medium text-foreground">
            {metricLabel}
          </div>
          {viewMode === 'layman' && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {metric.display_label}
            </div>
          )}
        </div>
        <div className={`px-2 py-1 rounded-md text-xs font-bold ${getColorText(color)}`}>
          {label}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-foreground">
            {metric.value.toFixed(2)}
          </div>
          {metric.unit && (
            <div className="text-xs text-muted-foreground">
              {metric.unit}
            </div>
          )}
        </div>

        {viewMode === 'technical' && delta !== 0 && (
          <div className={`flex items-center gap-1 ${delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}{metric.unit}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
