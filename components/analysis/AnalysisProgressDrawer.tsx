'use client'

import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, Clock, Minimize2 } from 'lucide-react'
import { ANALYSIS_STEPS, AnalysisProgress } from '@/lib/progress/types'

interface Props {
  analysisId: string
  onComplete: (analysisId: string) => void
  onError: (error: string) => void
  onMinimize?: () => void
}

export function AnalysisProgressDrawer({ analysisId, onComplete, onError, onMinimize }: Props) {
  const [progress, setProgress] = useState<AnalysisProgress | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/analysis/progress/${analysisId}`)

        if (!response.ok) {
          if (response.status === 404) {
            return
          }
          throw new Error('Erro ao buscar progresso')
        }

        const data = await response.json()
        setProgress(data)

        if (data.status === 'completed') {
          onComplete(analysisId)
        } else if (data.status === 'error') {
          onError(data.error?.message ?? 'Erro na análise')
        }
      } catch (error) {
        console.error('Erro ao buscar progresso:', error)
      }
    }

    void fetchProgress()

    const interval = setInterval(() => {
      void fetchProgress()
    }, 1000)

    return () => clearInterval(interval)
  }, [analysisId, onComplete, onError])

  useEffect(() => {
    if (progress?.status !== 'running') {
      return
    }

    const interval = setInterval(() => {
      const start = new Date(progress.startedAt).getTime()
      const now = Date.now()
      setElapsedSeconds(Math.floor((now - start) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [progress])

  if (!progress) {
    return (
      <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-4 w-96">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Iniciando análise...</span>
        </div>
      </div>
    )
  }

  const currentStep = ANALYSIS_STEPS[progress.step]

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-3 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-medium">{progress.percent}%</span>
          <span className="text-sm text-muted-foreground">{progress.message}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-xl p-6 w-[480px] max-h-[600px] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Análise em Andamento</h3>
        <div className="flex items-center gap-2">
          {onMinimize && (
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-muted rounded"
              title="Minimizar"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          {progress.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
          {progress.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
          {progress.status === 'running' && (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{progress.message}</span>
          <span className="text-sm font-bold text-primary">{progress.percent}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {progress.counters && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso:</span>
            <span className="font-medium">
              {progress.counters.processed} / {progress.counters.total}
            </span>
          </div>
          {progress.counters.current && (
            <div className="mt-1 text-xs text-muted-foreground">
              Processando: {progress.counters.current}
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <div className="space-y-2">
          {Object.entries(ANALYSIS_STEPS).map(([key, step]) => {
            const isCompleted = step.order < currentStep.order
            const isCurrent = step.order === currentStep.order

            return (
              <div key={key} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? '✓' : step.order}
                </div>
                <span
                  className={`text-sm ${
                    isCurrent
                      ? 'font-medium text-foreground'
                      : isCompleted
                        ? 'text-muted-foreground line-through'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Tempo decorrido: {formatSeconds(elapsedSeconds)}</span>
        </div>
        {progress.etaSeconds && progress.status === 'running' && (
          <span>ETA: {formatSeconds(progress.etaSeconds)}</span>
        )}
      </div>

      {progress.status === 'error' && progress.error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
          <p className="text-sm font-medium text-red-900 dark:text-red-300">
            {progress.error.message}
          </p>
          {progress.error.details && (
            <details className="mt-2">
              <summary className="text-xs text-red-700 dark:text-red-400 cursor-pointer">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-500 overflow-x-auto">
                {progress.error.details}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}
