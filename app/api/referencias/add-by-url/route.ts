import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

// Detectar e extrair DOI de uma URL
function extractDOI(url: string): string | null {
  const doiPattern = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i
  const match = url.match(doiPattern)
  return match ? match[0] : null
}

// Buscar metadata de um DOI via Crossref
async function getMetadataFromDOI(doi: string) {
  try {
    const response = await axios.get(`https://api.crossref.org/works/${doi}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AgroInsight/1.0 (mailto:contact@agroinsight.com)'
      }
    })
    
    const item = response.data?.message
    if (!item) return null
    
    // Extrair autores
    const authors = item.author?.slice(0, 5).map((a: any) => {
      const family = a.family || ''
      const given = a.given || ''
      return given ? `${family}, ${given.charAt(0)}.` : family
    }).filter(Boolean) || ['Autor não disponível']
    
    // Extrair ano
    const year = item.published?.['date-parts']?.[0]?.[0] || 
                 item.created?.['date-parts']?.[0]?.[0] || 
                 new Date().getFullYear()
    
    // Abstract
    const abstract = item.abstract 
      ? item.abstract.replace(/<[^>]*>/g, '').substring(0, 500)
      : 'Resumo não disponível. Acesse o artigo completo.'
    
    return {
      title: item.title?.[0] || 'Título não disponível',
      authors: authors.join('; '),
      abstract,
      year,
      journal: item['container-title']?.[0] || 'Journal',
      url: `https://doi.org/${doi}`,
      doi
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

    const { url } = await request.json()

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json({ 
        error: 'URL inválida' 
      }, { status: 400 })
    }

    // Extrair DOI da URL
    const doi = extractDOI(url)
    
    if (!doi) {
      return NextResponse.json({ 
        error: 'Não foi possível detectar um DOI válido na URL fornecida' 
      }, { status: 400 })
    }

    // Buscar metadata do DOI
    const metadata = await getMetadataFromDOI(doi)
    
    if (!metadata) {
      return NextResponse.json({ 
        error: 'Não foi possível recuperar informações do artigo. Verifique se o DOI é válido.' 
      }, { status: 404 })
    }

    // Verificar se já existe na biblioteca do usuário
    const existing = await prisma.savedReference.findFirst({
      where: {
        userId: session.user.id,
        url: metadata.url
      }
    })

    if (existing) {
      return NextResponse.json({ 
        error: 'Este artigo já está na sua biblioteca',
        article: existing
      }, { status: 409 })
    }

    // Salvar na biblioteca
    const savedArticle = await prisma.savedReference.create({
      data: {
        userId: session.user.id,
        title: metadata.title,
        url: metadata.url,
        content: JSON.stringify({
          authors: metadata.authors,
          abstract: metadata.abstract,
          year: metadata.year,
          journal: metadata.journal,
          doi: metadata.doi,
          source: 'crossref'
        }),
        tags: metadata.authors // Usar autores como tags
      }
    })

    return NextResponse.json({
      success: true,
      article: {
        ...savedArticle,
        ...metadata
      },
      message: 'Artigo adicionado à biblioteca com sucesso'
    })

  } catch (error) {
    console.error('Erro ao adicionar artigo:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar artigo. Tente novamente.' },
      { status: 500 }
    )
  }
}
