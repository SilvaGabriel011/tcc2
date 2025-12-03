/**
 * EN: ActionSummary - Component for displaying prioritized action recommendations
 * PT-BR: ActionSummary - Componente para exibir recomendações de ações priorizadas
 *
 * EN: Displays a simplified action summary based on diagnostic analysis,
 *     with color-coded priorities for non-technical users.
 * PT-BR: Exibe um resumo de ações simplificado baseado na análise diagnóstica,
 *        com prioridades codificadas por cores para usuários não-técnicos.
 */

'use client'

import { AlertTriangle, CheckCircle2, Clock, Lightbulb, Loader2 } from 'lucide-react'
import type { DiagnosticResult } from '@/lib/ai-diagnostic'

interface ActionSummaryProps {
  diagnostic: DiagnosticResult | null
  loading?: boolean
  onRequestDiagnostic?: () => void
}

// Priority color mapping
const priorityConfig = {
  Alta: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-900',
    text: 'text-red-800 dark:text-red-300',
    badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    icon: AlertTriangle,
    label: 'Ação Imediata',
  },
  Média: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    text: 'text-amber-800 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    icon: Clock,
    label: 'Monitorar',
  },
  Baixa: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-900',
    text: 'text-green-800 dark:text-green-300',
    badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    icon: CheckCircle2,
    label: 'Manutenção',
  },
} as const

type Priority = keyof typeof priorityConfig

function getPriorityOrder(priority: string): number {
  switch (priority) {
    case 'Alta':
      return 0
    case 'Média':
      return 1
    case 'Baixa':
      return 2
    default:
      return 3
  }
}

export function ActionSummary({ diagnostic, loading, onRequestDiagnostic }: ActionSummaryProps) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">Gerando diagnóstico...</span>
        </div>
      </div>
    )
  }

  // No diagnostic available
  if (!diagnostic) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="text-center py-6">
          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Resumo de Ações</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Clique em &quot;Diagnóstico IA&quot; para gerar recomendações personalizadas baseadas na
            análise estatística e referências científicas (EMBRAPA/NRC).
          </p>
          {onRequestDiagnostic && (
            <button
              onClick={onRequestDiagnostic}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Gerar Diagnóstico
            </button>
          )}
        </div>
      </div>
    )
  }

  // Get recommendations sorted by priority
  const recommendations = [...(diagnostic.recomendacoesPrioritarias || [])]
    .sort((a, b) => getPriorityOrder(a.prioridade) - getPriorityOrder(b.prioridade))
    .slice(0, 5) // Limit to 5 recommendations

  // Count by priority
  const highPriorityCount = recommendations.filter((r) => r.prioridade === 'Alta').length
  const mediumPriorityCount = recommendations.filter((r) => r.prioridade === 'Média').length

  // Generate simplified summary
  const getSummaryText = () => {
    if (highPriorityCount > 0) {
      return `Atenção: ${highPriorityCount} ${highPriorityCount === 1 ? 'ação imediata necessária' : 'ações imediatas necessárias'}.`
    }
    if (mediumPriorityCount > 0) {
      return `O lote está estável, mas há ${mediumPriorityCount} ${mediumPriorityCount === 1 ? 'ponto' : 'pontos'} para monitorar.`
    }
    return 'Excelente! O lote está em boas condições. Continue com as práticas atuais.'
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />O Que Fazer Agora
        </h3>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border">
        <p className="text-sm text-foreground">{getSummaryText()}</p>
      </div>

      {/* Recommendations List */}
      <div className="divide-y divide-border">
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => {
            const priority = rec.prioridade as Priority
            const config = priorityConfig[priority] || priorityConfig.Baixa
            const Icon = config.icon

            return (
              <div key={index} className={`p-4 ${config.bg}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-full ${config.badge}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">{rec.titulo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className={`text-sm ${config.text}`}>{rec.descricao}</p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Nenhuma recomendação específica no momento. Continue monitorando os indicadores.
          </div>
        )}
      </div>

      {/* Footer with sources */}
      {diagnostic.fontes && diagnostic.fontes.length > 0 && (
        <div className="px-4 py-2 bg-muted/20 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Fontes:</span> {diagnostic.fontes.slice(0, 3).join(', ')}
          </p>
        </div>
      )}

      {/* Method indicator */}
      {diagnostic.generatedBy && (
        <div className="px-4 py-2 bg-muted/10 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Gerado por:{' '}
            {diagnostic.generatedBy === 'gemini'
              ? 'IA (Google Gemini)'
              : diagnostic.generatedBy === 'openai'
                ? 'IA (OpenAI)'
                : 'Análise Estatística (EMBRAPA/NRC)'}
          </p>
        </div>
      )}
    </div>
  )
}
