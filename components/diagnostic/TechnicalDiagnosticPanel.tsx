/**
 * TechnicalDiagnosticPanel - Component for displaying AI diagnostic results
 *
 * Displays the full AI-generated diagnostic including:
 * - Executive summary
 * - Numeric variable analysis
 * - Strengths and attention points
 * - Priority recommendations
 * - Conclusion
 */

'use client'

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Printer,
  RefreshCw,
  X,
} from 'lucide-react'
import { getPriorityConfig } from '@/types/priority'
import { DiagnosticAudioPlayer } from './DiagnosticAudioPlayer'

// Type for raw diagnostico from API (with optional fields)
interface RawDiagnostico {
  diagnostico: string
  geradoEm: string
  metodo: string
  resumoExecutivo?: string
  analiseNumericas?: Array<{
    variavel: string
    status: string
    interpretacao: string
    comparacaoLiteratura?: string
  }>
  pontosFortes?: string[]
  pontosAtencao?: string[]
  recomendacoesPrioritarias?: Array<{
    titulo: string
    descricao: string
    prioridade: string
    justificativa?: string
  }>
  conclusao?: string
  fontes?: string[]
  generatedBy?: string
}

interface TechnicalDiagnosticPanelProps {
  diagnostico: RawDiagnostico | null
  loading: boolean
  error?: string | null
  analysisId?: string
  onPrint?: () => void
  onClose?: () => void
  onRetry?: () => void
}

export function TechnicalDiagnosticPanel({
  diagnostico,
  loading,
  error,
  analysisId,
  onPrint,
  onClose,
  onRetry,
}: TechnicalDiagnosticPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <span className="ml-3 text-muted-foreground">Gerando diagnostico IA...</span>
      </div>
    )
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Erro ao gerar diagnostico</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </button>
        )}
      </div>
    )
  }

  if (!diagnostico) {
    return (
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-8 text-center">
        <Activity className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Diagnostico nao disponivel</h3>
        <p className="text-muted-foreground">O diagnostico sera gerado automaticamente.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-lg rounded-lg p-6 border-l-4 border-blue-600">
      {/* Header with buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-xl font-bold text-foreground">
            Diagnostico Zootecnico - Analise Especializada
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Show diagnostic metadata */}
          {diagnostico.geradoEm && (
            <span className="text-xs text-muted-foreground">
              Gerado em: {new Date(diagnostico.geradoEm).toLocaleString('pt-BR')}
            </span>
          )}
          {/* Audio Player for listening to the diagnostic */}
          {analysisId && <DiagnosticAudioPlayer analysisId={analysisId} />}
          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Printer className="h-4 w-4" /> PDF
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      {diagnostico.resumoExecutivo && (
        <div className="bg-card rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
            Resumo Executivo
          </h4>
          <p className="text-foreground/80 leading-relaxed">{diagnostico.resumoExecutivo}</p>
        </div>
      )}

      {/* Numeric Variable Analysis */}
      {diagnostico.analiseNumericas && diagnostico.analiseNumericas.length > 0 && (
        <div className="bg-card rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
            Analise das Variaveis Numericas
          </h4>
          <div className="space-y-3">
            {diagnostico.analiseNumericas.map((analise, idx) => (
              <div key={idx} className="border-l-2 border-blue-300 dark:border-blue-700 pl-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">{analise.variavel}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      analise.status === 'Excelente'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : analise.status === 'Bom'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : analise.status === 'Regular'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {analise.status}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mb-1">{analise.interpretacao}</p>
                {analise.comparacaoLiteratura && (
                  <p className="text-xs text-muted-foreground italic">
                    {analise.comparacaoLiteratura}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {diagnostico.pontosFortes && diagnostico.pontosFortes.length > 0 && (
        <div className="bg-card rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Pontos Fortes
          </h4>
          <ul className="space-y-2">
            {diagnostico.pontosFortes.map((ponto, idx) => (
              <li key={idx} className="flex items-start text-sm text-foreground/80">
                <span className="text-green-600 mr-2">+</span>
                {ponto}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Attention Points */}
      {diagnostico.pontosAtencao && diagnostico.pontosAtencao.length > 0 && (
        <div className="bg-card rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
            Pontos de Atencao
          </h4>
          <ul className="space-y-2">
            {diagnostico.pontosAtencao.map((ponto, idx) => (
              <li key={idx} className="flex items-start text-sm text-foreground/80">
                <span className="text-amber-600 mr-2">!</span>
                {ponto}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Priority Recommendations */}
      {diagnostico.recomendacoesPrioritarias &&
        diagnostico.recomendacoesPrioritarias.length > 0 && (
          <div className="bg-card rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
              Recomendacoes Prioritarias
            </h4>
            <div className="space-y-3">
              {diagnostico.recomendacoesPrioritarias.map((rec, idx) => {
                const config = getPriorityConfig(rec.prioridade)
                return (
                  <div
                    key={idx}
                    className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border-l-4 border-primary"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded ${config.badgeClass}`}>
                        {config.label}
                      </span>
                    </div>
                    <h5 className="font-medium text-foreground">{rec.titulo}</h5>
                    <p className="text-sm text-muted-foreground">{rec.descricao}</p>
                    {rec.justificativa && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Por que: {rec.justificativa}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      {/* Conclusion */}
      {diagnostico.conclusao && (
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Conclusao e Perspectivas
          </h4>
          <p className="text-foreground leading-relaxed">{diagnostico.conclusao}</p>
        </div>
      )}

      {/* Sources */}
      {diagnostico.fontes && diagnostico.fontes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Fontes:</span> {diagnostico.fontes.join(', ')}
          </p>
        </div>
      )}

      {/* Method indicator */}
      {diagnostico.generatedBy && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">
            Gerado por:{' '}
            {diagnostico.generatedBy === 'gemini'
              ? 'IA (Google Gemini)'
              : diagnostico.generatedBy === 'openai'
                ? 'IA (OpenAI)'
                : 'Analise Estatistica (EMBRAPA/NRC)'}
          </p>
        </div>
      )}
    </div>
  )
}
