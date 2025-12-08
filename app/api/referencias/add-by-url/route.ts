import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
import { invalidateCache } from '@/lib/cache'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Detectar e extrair DOI de uma URL
function extractDOI(url: string): string | null {
  const doiPattern = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i
  const match = url.match(doiPattern)
  return match ? match[0] : null
}

// SciELO detection removed - no longer supported

// SciELO scraping removed - no longer supported

// Validate if URL is accessible
async function validateUrlAccessibility(
  url: string
): Promise<{ accessible: boolean; error?: string }> {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'AgroInsight/1.0 (mailto:contact@agroinsight.com)',
      },
      validateStatus: (status) => status < 500, // Accept redirects and client errors
    })

    // Check if the response indicates the resource exists
    if (response.status >= 200 && response.status < 400) {
      return { accessible: true }
    }

    // Try GET request as fallback (some servers don't support HEAD)
    const getResponse = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'AgroInsight/1.0 (mailto:contact@agroinsight.com)',
      },
      validateStatus: (status) => status < 500,
    })

    if (getResponse.status >= 200 && getResponse.status < 400) {
      return { accessible: true }
    }

    return { accessible: false, error: `URL retornou status ${response.status}` }
  } catch (error) {
    console.error('URL validation error:', error)
    return {
      accessible: false,
      error: 'Não foi possível acessar a URL. Verifique se o link está correto.',
    }
  }
}

// Buscar metadata de um DOI via Crossref
async function getMetadataFromDOI(doi: string) {
  try {
    const response = await axios.get(`https://api.crossref.org/works/${doi}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AgroInsight/1.0 (mailto:contact@agroinsight.com)',
      },
    })

    const item = response.data?.message
    if (!item) {
      return null
    }

    // Extrair autores
    const authors = item.author
      ?.slice(0, 5)
      .map((a: { family?: string; given?: string }) => {
        const family = a.family || ''
        const given = a.given || ''
        return given ? `${family}, ${given.charAt(0)}.` : family
      })
      .filter(Boolean) || ['Autor não disponível']

    // Extrair ano
    const year =
      item.published?.['date-parts']?.[0]?.[0] ||
      item.created?.['date-parts']?.[0]?.[0] ||
      new Date().getFullYear()

    // Abstract
    const abstract = item.abstract
      ? item.abstract.replace(/<[^>]*>/g, '').substring(0, 500)
      : 'Resumo não disponível. Acesse o artigo completo.'

    // ISSN
    const issn = item.ISSN?.[0]

    // Volume, Issue, Pages
    const volume = item.volume
    const issue = item.issue
    const pages = item.page

    // Keywords
    const keywords = item.subject

    // Idioma
    const language = item.language

    // Citações
    const citationsCount = item['is-referenced-by-count'] || 0

    // Data de publicação
    const publishedDate = item.published?.['date-parts']?.[0]
      ? `${item.published['date-parts'][0].join('-')}`
      : undefined

    return {
      title: item.title?.[0] || 'Título não disponível',
      authors,
      abstract,
      year,
      publishedDate,
      journal: item['container-title']?.[0] || 'Journal',
      issn,
      volume,
      issue,
      pages,
      keywords,
      language,
      citationsCount,
      url: `https://doi.org/${doi}`,
      doi,
      pdfUrl: null,
      source: 'crossref',
    }
  } catch (error) {
    console.error('Erro ao buscar metadata do DOI:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Parse JSON com tratamento de erro
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido na requisição' }, { status: 400 })
    }

    const { url, preview = false, customTitle } = body

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Campo "url" é obrigatório e deve ser uma string válida',
        },
        { status: 400 }
      )
    }

    // Validar se é uma URL válida
    let validUrl: URL
    try {
      validUrl = new URL(url)
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Protocolo inválido')
      }
    } catch {
      return NextResponse.json(
        {
          error: 'URL inválida. Use uma URL completa com http:// ou https://',
        },
        { status: 400 }
      )
    }

    // Validate URL accessibility to prevent broken links
    const urlValidation = await validateUrlAccessibility(url)
    if (!urlValidation.accessible) {
      return NextResponse.json(
        {
          error:
            urlValidation.error ||
            'O link fornecido não está acessível. Verifique se a URL está correta.',
          urlValidationFailed: true,
        },
        { status: 400 }
      )
    }

    // Detect DOI from URL
    const doi = extractDOI(url)

    let metadata = null
    let metadataSource: 'crossref' | 'manual' = 'manual'

    // If DOI is found, fetch metadata from Crossref
    if (doi) {
      metadata = await getMetadataFromDOI(doi)
      if (metadata) {
        metadataSource = 'crossref'
      }
    }

    // Se não conseguiu metadata via DOI, criar entrada básica com a URL fornecida
    if (!metadata) {
      // Tentar extrair título do domínio/path
      const urlParts = validUrl.pathname.split('/').filter(Boolean)
      const lastPart = urlParts[urlParts.length - 1] || validUrl.hostname
      const basicTitle =
        lastPart
          .replace(/[-_]/g, ' ')
          .replace(/\.[^.]+$/, '') // Remove extensão de arquivo
          .trim() || 'Artigo sem título'

      metadata = {
        title: basicTitle,
        authors: 'Autor não especificado',
        abstract: 'Resumo não disponível. Acesse o artigo completo no link fornecido.',
        year: new Date().getFullYear(),
        journal: validUrl.hostname.replace('www.', ''),
        url: url,
        doi: doi || null,
        pdfUrl: null,
        citationsCount: 0,
        source: 'manual',
      }
    }

    // If preview mode, return metadata without saving
    if (preview) {
      return NextResponse.json({
        success: true,
        preview: true,
        article: {
          id: `preview-${Date.now()}`,
          ...metadata,
          source: metadataSource,
        },
        metadataSource: metadataSource,
        message:
          metadataSource === 'crossref'
            ? 'Metadados encontrados via DOI. Revise e edite o título se necessário.'
            : 'Não foi possível obter metadados completos. Por favor, edite o título do artigo.',
      })
    }

    // Apply custom title if provided
    if (customTitle && typeof customTitle === 'string' && customTitle.trim()) {
      metadata.title = customTitle.trim()
    }

    // Verificar se já existe na biblioteca do usuário
    const existing = await prisma.savedReference.findFirst({
      where: {
        userId: session.user.id,
        url: metadata.url,
      },
    })

    if (existing) {
      return NextResponse.json(
        {
          error: 'Este artigo já está na sua biblioteca',
          article: existing,
        },
        { status: 409 }
      )
    }

    // Preparar dados para salvar
    const authorsArray = Array.isArray(metadata.authors) ? metadata.authors : [metadata.authors]
    const authorsJson = JSON.stringify(authorsArray.map((a: string) => ({ name: a })))
    const keywordsJson = metadata.keywords ? JSON.stringify(metadata.keywords) : null

    // Converter publishedDate para DateTime se existir
    let publishedDateTime = null
    if (metadata.publishedDate) {
      try {
        const date = new Date(metadata.publishedDate)
        // Validar se a data é válida
        publishedDateTime = isNaN(date.getTime()) ? null : date
      } catch (e) {
        console.error('Erro ao converter data:', e)
        publishedDateTime = null
      }
    }

    // Salvar na biblioteca com campos estruturados
    const savedArticle = await prisma.savedReference.create({
      data: {
        userId: session.user.id,
        title: metadata.title,
        url: metadata.url,
        doi: metadata.doi || null,
        abstract: metadata.abstract || null,
        authors: authorsJson,
        year: metadata.year || null,
        publishedDate: publishedDateTime,
        language: metadata.language || null,
        journal: metadata.journal || null,
        issn: metadata.issn || null,
        volume: metadata.volume || null,
        issue: metadata.issue || null,
        pages: metadata.pages || null,
        keywords: keywordsJson,
        source: metadata.source || 'manual',
        pdfUrl: metadata.pdfUrl || null,
        citationsCount: metadata.citationsCount || 0,
        tags: authorsArray.slice(0, 3).join(', '), // Primeiros 3 autores como tags
        content: JSON.stringify(metadata), // Manter compatibilidade
      },
    })

    // 🗑️ CACHE: Invalidar cache de artigos salvos do usuário
    const cacheKey = `articles:saved:${session.user.id}`
    await invalidateCache(cacheKey)
    console.log('🗑️ Cache de artigos salvos invalidado')

    return NextResponse.json({
      success: true,
      article: {
        ...savedArticle,
        ...metadata,
      },
      message:
        metadata.source === 'manual'
          ? 'Artigo adicionado! Você pode editar as informações depois clicando no artigo.'
          : 'Artigo adicionado à biblioteca com sucesso',
    })
  } catch (error) {
    console.error('Erro ao adicionar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar artigo. Tente novamente.' },
      { status: 500 }
    )
  }
}
