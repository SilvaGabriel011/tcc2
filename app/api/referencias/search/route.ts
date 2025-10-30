import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import axios from 'axios'
import * as cheerio from 'cheerio'

// Types
interface Article {
  id: string
  title: string
  authors: string[]
  abstract: string
  year: number
  journal: string
  url: string
  source: 'scielo' | 'crossref'
  doi?: string
}

// Função para buscar artigos do SciELO com paginação
async function searchScieloArticles(query: string, page: number = 1, pageSize: number = 10): Promise<Article[]> {
  try {
    const offset = (page - 1) * pageSize
    const searchUrl = `https://search.scielo.org/?q=${encodeURIComponent(query)}&lang=pt&count=${pageSize}&from=${offset}&output=site&sort=&format=summary&fb=&page=${page}`
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    })
    
    const $ = cheerio.load(response.data)
    const articles: any[] = []
    
    $('.results .item').each((index, element) => {
      if (index >= pageSize) return false
      
      const $item = $(element)
      const title = $item.find('.title a').text().trim()
      const authors = $item.find('.authors').text().trim()
      const source = $item.find('.source').text().trim()
      const url = $item.find('.title a').attr('href') || ''
      
      if (title && url) {
        const yearMatch = source.match(/\b(19|20)\d{2}\b/)
        articles.push({
          id: `scielo-${Date.now()}-${index}`,
          title,
          authors: authors ? authors.split(/[;,]/).map(a => a.trim()).filter(Boolean).slice(0, 5) : ['Autor não disponível'],
          abstract: 'Artigo disponível no SciELO. Acesse o link para ler o resumo completo.',
          year: yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear(),
          journal: source.split('.').slice(0, -1).join('.').trim() || 'Revista Científica',
          url: url.startsWith('http') ? url : `https://scielo.org${url}`,
          source: 'scielo' as const
        })
      }
    })
    
    return articles
  } catch (error) {
    console.error('Erro ao buscar SciELO:', error)
    return []
  }
}

// Função para buscar artigos do Crossref com paginação
async function searchCrossrefArticles(query: string, page: number = 1, pageSize: number = 10): Promise<Article[]> {
  try {
    const offset = (page - 1) * pageSize
    const crossrefUrl = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${pageSize}&offset=${offset}&filter=type:journal-article&sort=relevance&mailto=contact@agroinsight.com`
    
    const response = await axios.get(crossrefUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'AgroInsight/1.0 (https://agroinsight.com; mailto:contact@agroinsight.com)'
      }
    })
    
    const items = response.data?.message?.items || []
    const articles: Article[] = []
    
    for (const item of items) {
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
      
      // Extrair abstract (limitado)
      const abstract = item.abstract 
        ? item.abstract.replace(/<[^>]*>/g, '').substring(0, 300) + '...'
        : 'Resumo não disponível. Acesse o artigo completo para mais informações.'
      
      // URL e DOI
      const doi = item.DOI
      const url = doi ? `https://doi.org/${doi}` : item.URL || '#'
      
      articles.push({
        id: `crossref-${doi || Date.now()}-${articles.length}`,
        title: item.title?.[0] || 'Título não disponível',
        authors,
        abstract,
        year,
        journal: item['container-title']?.[0] || item.publisher || 'Journal',
        url,
        source: 'crossref' as const,
        doi
      })
    }
    
    return articles
  } catch (error) {
    console.error('Erro ao buscar Crossref:', error)
    return []
  }
}

// Fallback em caso de erro total
function getFallbackArticles(query: string): Article[] {
  return [
    {
      id: 'fallback-1',
      title: `Pesquisa sobre ${query} - Consulte as bases científicas`,
      authors: ['Sistema AgroInsight'],
      abstract: `Não foi possível recuperar artigos no momento. Por favor, tente novamente ou consulte diretamente as bases SciELO e Crossref. Use termos específicos para melhores resultados.`,
      year: new Date().getFullYear(),
      journal: 'Sistema de Busca',
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
      source: 'crossref' as const
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { query, source = 'all', page = 1, pageSize = 10 } = await request.json()

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ 
        error: 'Termo de pesquisa deve ter pelo menos 3 caracteres' 
      }, { status: 400 })
    }

    // Validar paginação
    const validPage = Math.max(1, parseInt(String(page)) || 1)
    const validPageSize = Math.min(20, Math.max(5, parseInt(String(pageSize)) || 10))

    let articles: Article[] = []

    // Estratégia: SciELO + Crossref em paralelo, combinar resultados
    if (source === 'scielo') {
      articles = await searchScieloArticles(query, validPage, validPageSize)
    } else if (source === 'crossref') {
      articles = await searchCrossrefArticles(query, validPage, validPageSize)
    } else {
      // 'all': buscar de ambas as fontes
      const halfSize = Math.ceil(validPageSize / 2)
      const [scieloResults, crossrefResults] = await Promise.all([
        searchScieloArticles(query, validPage, halfSize),
        searchCrossrefArticles(query, validPage, halfSize)
      ])
      
      // Combinar e ordenar por relevância (SciELO primeiro, depois Crossref)
      articles = [...scieloResults, ...crossrefResults].slice(0, validPageSize)
    }

    // Fallback se não encontrou nada
    if (articles.length === 0 && validPage === 1) {
      articles = getFallbackArticles(query)
    }

    // Determinar se há mais resultados
    const hasMore = articles.length === validPageSize

    return NextResponse.json({
      success: true,
      articles,
      page: validPage,
      pageSize: validPageSize,
      hasMore,
      total: articles.length,
      query,
      source,
      message: `${articles.length} artigo(s) encontrado(s)`
    })

  } catch (error) {
    console.error('Erro na pesquisa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar referências. Tente novamente.' },
      { status: 500 }
    )
  }
}
