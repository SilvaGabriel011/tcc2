/**
 * References Search API Route - Enhanced Version
 *
 * Endpoint: POST /api/referencias/search
 *
 * This route now uses the enhanced ReferenceSearchService which:
 * - Searches real scientific articles from Google Scholar, PubMed, and Crossref
 * - Validates articles from trusted sources
 * - Deduplicates results across providers
 * - Ranks articles by relevance
 * - Caches results for performance
 *
 * Request body:
 * ```json
 * {
 *   "query": "leite",
 *   "source": "all" | "scholar" | "pubmed" | "crossref",
 *   "page": 1,
 *   "pageSize": 10,
 *   "yearFrom": 2020,
 *   "yearTo": 2024,
 *   "language": "pt" | "en" | "es" | "all"
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ReferenceSearchService } from '@/services/references'
import { enhanceReferenceQuery, buildEnhancedQuery } from '@/lib/references/query-enhancer'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Step 2: Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido na requisição' }, { status: 400 })
    }

    const {
      query,
      source = 'all',
      page = 1,
      pageSize = 10,
      yearFrom,
      yearTo,
      language = 'all',
      publicationType,
    } = body

    // Validate query
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          error: 'Termo de pesquisa deve ter pelo menos 2 caracteres',
        },
        { status: 400 }
      )
    }

    // Validate pagination
    const validPage = Math.max(1, parseInt(String(page)) || 1)
    const validPageSize = Math.min(20, Math.max(5, parseInt(String(pageSize)) || 10))
    const offset = (validPage - 1) * validPageSize

    console.log(`🔍 Searching for: "${query}" (source: ${source}, page: ${validPage})`)

    // Step 3: Build search options
    const searchOptions = {
      limit: validPageSize,
      offset: offset,
      yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
      yearTo: yearTo ? parseInt(yearTo) : undefined,
      language: language as 'pt' | 'en' | 'es' | 'all',
      publicationType: publicationType,
      sources: source === 'all' ? undefined : [source],
    }

    // Step 4: Use the new ReferenceSearchService
    try {
      const referenceService = new ReferenceSearchService()
      let searchResult = await referenceService.search(query, searchOptions)

      // Track if we used query enhancement
      let usedEnhancement = false
      let enhancementData = null

      // Step 4.1: If no results found, try query enhancement with OpenAI
      if (searchResult.totalResults === 0) {
        console.log('🔄 No results found, attempting query enhancement...')

        try {
          enhancementData = await enhanceReferenceQuery(query)

          if (enhancementData && enhancementData.wasModified) {
            console.log('✨ Query enhanced:', {
              original: query,
              corrected: enhancementData.correctedPt,
              englishKeywords: enhancementData.englishKeywords,
            })

            // Build enhanced query and retry search
            const enhancedQuery = buildEnhancedQuery(enhancementData)
            console.log('🔍 Retrying with enhanced query:', enhancedQuery)

            // Retry search with enhanced query
            const enhancedResult = await referenceService.search(enhancedQuery, searchOptions)

            if (enhancedResult.totalResults > 0) {
              searchResult = enhancedResult
              usedEnhancement = true
              console.log(`✅ Enhanced search found ${enhancedResult.totalResults} results`)
            }
          }
        } catch (enhanceError) {
          console.warn('⚠️ Query enhancement failed, using original results:', enhanceError)
          // Continue with original (empty) results
        }
      }

      console.log(
        `✅ Found ${searchResult.articles.length} articles from ${searchResult.sources.join(', ')}`
      )

      // Step 4.2: Check provider status for error messaging
      const providerStatus = searchResult.providerStatus || []
      const anyProviderFailed = providerStatus.some((p) => !p.ok)
      const allProvidersFailed = providerStatus.every((p) => !p.ok)

      // Build appropriate message based on results and provider status
      let message = `${searchResult.totalResults} artigo(s) encontrado(s)`
      let warning = undefined

      if (searchResult.totalResults === 0 && allProvidersFailed) {
        message = 'Erro ao consultar fontes externas. Tente novamente em alguns instantes.'
        warning = 'providers_failed'
      } else if (searchResult.totalResults === 0 && anyProviderFailed) {
        message = 'Nenhum artigo encontrado. Algumas fontes não responderam, tente novamente.'
        warning = 'partial_failure'
      } else if (searchResult.totalResults === 0) {
        message = 'Nenhum artigo encontrado. Tente outros termos de busca.'
      }

      // Step 5: Return formatted response
      return NextResponse.json({
        success: true,
        articles: searchResult.articles,
        page: searchResult.page,
        pageSize: searchResult.pageSize,
        hasMore: searchResult.hasMore,
        total: searchResult.totalResults,
        query: searchResult.query,
        originalQuery: query,
        source: source,
        sources: searchResult.sources,
        searchTime: searchResult.searchTime,
        message: message,
        warning: warning,
        cached: false,
        // Query enhancement metadata
        usedEnhancement: usedEnhancement,
        correctedQuery: enhancementData?.correctedPt,
        englishKeywords: enhancementData?.englishKeywords,
        // Provider status for debugging
        providerStatus: providerStatus,
      })
    } catch (searchError) {
      console.error('❌ Reference search error:', searchError)

      // Return user-friendly error
      return NextResponse.json(
        {
          success: false,
          articles: [],
          error: 'Erro ao buscar referências. Tente novamente com outros termos.',
          query: query,
          page: validPage,
          pageSize: validPageSize,
          hasMore: false,
          total: 0,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Erro geral na pesquisa:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor. Tente novamente.',
      },
      { status: 500 }
    )
  }
}
