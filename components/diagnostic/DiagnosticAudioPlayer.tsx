'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Loader2, Pause, RotateCcw } from 'lucide-react'

interface DiagnosticAudioPlayerProps {
  analysisId: string
  disabled?: boolean
}

export function DiagnosticAudioPlayer({ analysisId, disabled }: DiagnosticAudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<{ message: string; code?: string } | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const loadAudio = async () => {
    if (audioUrl) {
      return audioUrl
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/analise/diagnostico/${analysisId}/audio`)

      if (!response.ok) {
        let errorMessage = 'Erro ao carregar áudio'
        let errorCode: string | undefined

        const errorData = await response.json().catch(() => null)

        if (errorData && typeof errorData === 'object') {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error
          }
          if (typeof errorData.code === 'string') {
            errorCode = errorData.code
          }
        } else {
          // Fallback based on status if there is no JSON body
          if (response.status === 401) {
            errorMessage = 'Você precisa estar logado para ouvir o diagnóstico.'
            errorCode = 'UNAUTHORIZED'
          } else if (response.status === 404) {
            errorMessage =
              'O diagnóstico da IA não foi encontrado. Gere o diagnóstico primeiro e depois tente ouvir.'
            errorCode = 'NOT_FOUND'
          } else if (response.status === 503) {
            errorMessage =
              'Serviço de áudio temporariamente indisponível. Verifique se a chave da API está configurada.'
            errorCode = 'SERVICE_UNAVAILABLE'
          }
        }

        console.error('Erro ao gerar áudio do diagnóstico:', {
          code: errorCode,
          message: errorMessage,
          status: response.status,
        })

        const audioError = new Error(errorMessage) as Error & { code?: string }
        audioError.code = errorCode
        throw audioError
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      return url
    } catch (err) {
      const errorObj = err as { message?: string; code?: string }
      const message =
        errorObj?.message || (err instanceof Error ? err.message : 'Erro ao carregar áudio')
      const code = errorObj?.code
      setError({ message, code })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = async () => {
    try {
      const url = await loadAudio()

      if (!audioRef.current) {
        audioRef.current = new Audio(url)
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false)
          setProgress(0)
        })
        audioRef.current.addEventListener('timeupdate', () => {
          if (audioRef.current) {
            const progressPercent = (audioRef.current.currentTime / audioRef.current.duration) * 100
            setProgress(progressPercent)
          }
        })
        audioRef.current.addEventListener('error', () => {
          setError('Erro ao reproduzir áudio')
          setIsPlaying(false)
        })
      } else {
        audioRef.current.src = url
      }

      await audioRef.current.play()
      setIsPlaying(true)
    } catch (err) {
      console.error('Erro ao reproduzir áudio:', err)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setProgress(0)
      if (!isPlaying) {
        void audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleToggle = () => {
    if (isPlaying) {
      handlePause()
    } else {
      void handlePlay()
    }
  }

  if (disabled) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {error ? (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <VolumeX className="h-4 w-4" />
          <div className="flex flex-col">
            <span>{error.message}</span>
            {error.code && (
              <span className="text-xs text-gray-500 dark:text-gray-400">Código: {error.code}</span>
            )}
          </div>
          <button
            onClick={() => {
              setError(null)
              void handlePlay()
            }}
            className="text-xs underline hover:no-underline ml-2"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
            title={isPlaying ? 'Pausar áudio' : 'Ouvir diagnóstico'}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                <span>Ouvir</span>
              </>
            )}
          </button>

          {(isPlaying || progress > 0) && (
            <>
              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                onClick={handleRestart}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded"
                title="Reiniciar"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
