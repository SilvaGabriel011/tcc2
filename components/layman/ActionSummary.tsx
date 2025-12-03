/**
 * EN: ActionSummary - Displays prioritized action recommendations from AI diagnostic
 * PT-BR: ActionSummary - Exibe recomendações de ações priorizadas do diagnóstico IA
 *
 * EN: Shows a simplified view of recommendations with priority-based styling:
 *     - High priority (Alta): Red - Immediate action required
 *     - Medium priority (Média): Yellow - Plan action / monitor
 *     - Low priority (Baixa): Shown in separate "Maintain" section
 * PT-BR: Mostra uma visualização simplificada das recomendações com estilo baseado em prioridade:
 *        - Alta prioridade: Vermelho - Ação imediata necessária
 *        - Média prioridade: Amarelo - Planejar ação / monitorar
 *        - Baixa prioridade: Mostrada em seção separada "Manter"
 */

'use client'

import { AlertTriangle, CheckCircle2, Clock, Lightbulb, Loader2, Sparkles } from 'lucide-react'
import type { DiagnosticResult, DiagnosticRecommendation } from '@/types/diagnostic'

interface ActionSummaryProps {
  diagnostic: DiagnosticResult | null
  loading?: boolean
  onRequestDiagnostic?: () => void
}

/**
 * Get styling classes based on recommendation priority
 */
function getPriorityStyles(prioridade: DiagnosticRecommendation['prioridade']) {
  switch (prioridade) {
    case 'Alta':
      return {
        container: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
        title: 'text-red-900 dark:text-red-100',
      }
    case 'Média':
      return {
        container: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
        icon: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
        title: 'text-amber-900 dark:text-amber-100',
      }
    case 'Baixa':
      return {
        container: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
        title: 'text-green-900 dark:text-green-100',
      }
  }
}

/**
 * Get icon component based on priority
 */
function PriorityIcon({ prioridade }: { prioridade: DiagnosticRecommendation['prioridade'] }) {
  const styles = getPriorityStyles(prioridade)

  switch (prioridade) {
    case 'Alta':
      return <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
    case 'Média':
      return <Clock className={`h-5 w-5 ${styles.icon}`} />
    case 'Baixa':
      return <CheckCircle2 className={`h-5 w-5 ${styles.icon}`} />
  }
}

/**
 * Single recommendation card component
 */
function RecommendationCard({ recommendation }: { recommendation: DiagnosticRecommendation }) {
  const styles = getPriorityStyles(recommendation.prioridade)

  return (
    <div className={`rounded-lg border p-4 ${styles.container}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <PriorityIcon prioridade={recommendation.prioridade} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
              {recommendation.prioridade}
            </span>
          </div>
          <h4 className={`font-semibold ${styles.title}`}>{recommendation.titulo}</h4>
          <p className="text-sm text-foreground/70 mt-1">{recommendation.descricao}</p>
        </div>
      </div>
    </div>
  )
}

export function ActionSummary({ diagnostic, loading, onRequestDiagnostic }: ActionSummaryProps) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">Gerando diagnóstico com IA...</span>
        </div>
      </div>
    )
  }

  // No diagnostic yet - show CTA
  if (!diagnostic) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center py-6">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Resumo de Ações</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Gere um diagnóstico com IA para ver recomendações personalizadas de ações.
          </p>
          {onRequestDiagnostic && (
            <button
              onClick={onRequestDiagnostic}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Gerar Diagnóstico IA
            </button>
          )}
        </div>
      </div>
    )
  }

  // Separate recommendations by priority
  const highPriority = diagnostic.recomendacoesPrioritarias.filter((r) => r.prioridade === 'Alta')
  const mediumPriority = diagnostic.recomendacoesPrioritarias.filter(
    (r) => r.prioridade === 'Média'
  )
  const lowPriority = diagnostic.recomendacoesPrioritarias.filter((r) => r.prioridade === 'Baixa')

  // Count high priority items for summary
  const urgentCount = highPriority.length

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      {/* Header with summary */}
      <div>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Resumo de Ações
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {urgentCount > 0 ? (
            <>
              <span className="text-red-600 dark:text-red-400 font-medium">{urgentCount}</span>{' '}
              {urgentCount === 1 ? 'ação urgente identificada' : 'ações urgentes identificadas'}
            </>
          ) : (
            'Nenhuma ação urgente identificada'
          )}
        </p>
      </div>

      {/* Executive Summary (simplified) */}
      {diagnostic.resumoExecutivo && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">{diagnostic.resumoExecutivo}</p>
        </div>
      )}

      {/* High and Medium Priority Actions */}
      {(highPriority.length > 0 || mediumPriority.length > 0) && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            O Que Fazer Agora
          </h4>
          <div className="space-y-3">
            {highPriority.map((rec, idx) => (
              <RecommendationCard key={`high-${idx}`} recommendation={rec} />
            ))}
            {mediumPriority.map((rec, idx) => (
              <RecommendationCard key={`medium-${idx}`} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority Actions - Separate section */}
      {lowPriority.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Manter Boas Práticas
          </h4>
          <div className="space-y-3">
            {lowPriority.map((rec, idx) => (
              <RecommendationCard key={`low-${idx}`} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {diagnostic.fontes && diagnostic.fontes.length > 0 && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Fontes:</span> {diagnostic.fontes.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
