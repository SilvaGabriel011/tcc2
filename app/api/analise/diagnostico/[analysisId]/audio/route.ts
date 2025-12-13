import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCache, setCache } from '@/lib/multi-level-cache'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

interface DiagnosticoData {
  resumoExecutivo?: string
  pontosFortes?: string[]
  pontosAtencao?: string[]
  recomendacoesPrioritarias?: Array<{
    titulo: string
    descricao: string
    prioridade: string
  }>
  conclusao?: string
}

function buildSimplifiedDiagnosticText(diagnostico: DiagnosticoData, analysisName: string): string {
  const parts: string[] = []

  parts.push(`Olá! Aqui está o diagnóstico da sua análise: ${analysisName}.`)
  parts.push('')

  if (diagnostico.resumoExecutivo) {
    parts.push('Resumo geral:')
    parts.push(diagnostico.resumoExecutivo)
    parts.push('')
  }

  if (diagnostico.pontosFortes && diagnostico.pontosFortes.length > 0) {
    parts.push('Pontos positivos identificados:')
    diagnostico.pontosFortes.forEach((ponto, index) => {
      parts.push(`${index + 1}. ${ponto}`)
    })
    parts.push('')
  }

  if (diagnostico.pontosAtencao && diagnostico.pontosAtencao.length > 0) {
    parts.push('Pontos que precisam de atenção:')
    diagnostico.pontosAtencao.forEach((ponto, index) => {
      parts.push(`${index + 1}. ${ponto}`)
    })
    parts.push('')
  }

  if (diagnostico.recomendacoesPrioritarias && diagnostico.recomendacoesPrioritarias.length > 0) {
    parts.push('Recomendações importantes:')
    diagnostico.recomendacoesPrioritarias.forEach((rec, index) => {
      const prioridadeText =
        rec.prioridade === 'Alta'
          ? 'urgente'
          : rec.prioridade === 'Média'
            ? 'importante'
            : 'quando possível'
      parts.push(`${index + 1}. ${rec.titulo}, prioridade ${prioridadeText}: ${rec.descricao}`)
    })
    parts.push('')
  }

  if (diagnostico.conclusao) {
    parts.push('Conclusão:')
    parts.push(diagnostico.conclusao)
  }

  parts.push('')
  parts.push('Este foi o diagnóstico da sua análise. Boa sorte com a produção!')

  return parts.join(' ')
}

export async function GET(request: NextRequest, { params }: { params: { analysisId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    const analysisId = params.analysisId

    const audioCacheKey = `diagnostico-audio:${analysisId}`
    const cachedAudio = await getCache<string>(audioCacheKey)

    if (cachedAudio) {
      const audioBuffer = Buffer.from(cachedAudio, 'base64')
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    const analysis = await prisma.dataset.findFirst({
      where: {
        id: analysisId,
        project: {
          ownerId: session.user.id,
        },
      },
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análise não encontrada', code: 'ANALYSIS_NOT_FOUND' },
        { status: 404 }
      )
    }

    const diagnosticCacheKey = `diagnostico:${analysisId}`
    const cachedDiagnostico = await getCache<DiagnosticoData>(diagnosticCacheKey)

    if (!cachedDiagnostico) {
      return NextResponse.json(
        {
          error: 'Diagnóstico não encontrado. Por favor, gere o diagnóstico primeiro.',
          code: 'DIAGNOSTIC_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: 'Serviço de áudio não disponível. Chave da API não configurada.',
          code: 'OPENAI_API_KEY_MISSING',
        },
        { status: 503 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const simplifiedText = buildSimplifiedDiagnosticText(cachedDiagnostico, analysis.name)

    console.log('🔊 Gerando áudio do diagnóstico...')
    console.log('📝 Texto simplificado:', `${simplifiedText.substring(0, 200)}...`)

    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: simplifiedText,
      speed: 0.95,
    })

    const audioBuffer = Buffer.from(await mp3Response.arrayBuffer())

    await setCache(audioCacheKey, audioBuffer.toString('base64'), {
      ttl: 86400,
      tags: ['diagnostic-audio', `analysis:${analysisId}`],
    })

    console.log('✅ Áudio gerado com sucesso!')

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('❌ Erro ao gerar áudio do diagnóstico:', error)

    // Classify the error for better debugging
    const anyError = error as Record<string, unknown>
    const status =
      typeof anyError?.status === 'number'
        ? anyError.status
        : typeof (anyError?.response as Record<string, unknown>)?.status === 'number'
          ? (anyError.response as Record<string, unknown>).status
          : undefined
    const rawMessage =
      typeof anyError?.message === 'string'
        ? anyError.message
        : typeof (anyError?.response as Record<string, unknown>)?.data === 'object'
          ? JSON.stringify((anyError.response as Record<string, unknown>).data)
          : undefined

    let code = 'UNKNOWN_ERROR'
    let message = 'Erro interno ao gerar áudio. Tente novamente em alguns minutos.'

    if (typeof status === 'number') {
      if (status === 400) {
        code = 'OPENAI_BAD_REQUEST'
        message =
          'O serviço de áudio não conseguiu processar este diagnóstico. O texto pode estar muito longo ou em formato inválido.'
      } else if (status === 401 || status === 403) {
        code = 'OPENAI_AUTH_ERROR'
        message =
          'Erro de autenticação com o serviço de áudio. A chave da API pode estar inválida ou expirada.'
      } else if (status === 429) {
        code = 'OPENAI_RATE_LIMIT'
        message =
          'O serviço de áudio está temporariamente indisponível por limite de uso. Tente novamente em alguns minutos.'
      } else if (status >= 500) {
        code = 'OPENAI_SERVICE_ERROR'
        message =
          'O serviço de áudio está com instabilidade no momento. Tente novamente mais tarde.'
      }
    } else if (rawMessage) {
      // Check for common error patterns in the message
      if (rawMessage.includes('ENOTFOUND') || rawMessage.includes('ECONNREFUSED')) {
        code = 'NETWORK_ERROR'
        message = 'Erro de conexão com o serviço de áudio. Verifique sua conexão com a internet.'
      } else if (rawMessage.includes('timeout') || rawMessage.includes('ETIMEDOUT')) {
        code = 'TIMEOUT_ERROR'
        message = 'O serviço de áudio demorou muito para responder. Tente novamente.'
      } else if (
        rawMessage.includes('Redis') ||
        rawMessage.includes('cache') ||
        rawMessage.includes('Upstash')
      ) {
        code = 'CACHE_ERROR'
        message =
          'Erro ao acessar o cache. O serviço de cache pode estar indisponível. Tente novamente.'
      }
    }

    console.error(`❌ Erro classificado: code=${code}, status=${status}, rawMessage=${rawMessage}`)

    return NextResponse.json(
      {
        error: message,
        code,
        details: process.env.NODE_ENV === 'development' ? rawMessage : undefined,
      },
      { status: 500 }
    )
  }
}
