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
 * Enhanced with unified query pipeline:
 * - Always runs local dictionary expansion BEFORE search (fast, deterministic)
 * - Only calls OpenAI if: results < 5 AND query has 2+ words AND not cached
 * - Returns enhanced metadata (search feedback, suggested terms, provider status)
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
import { ReferenceSearchService, EnhancedSearchResult } from '@/services/references'
import { enhanceReferenceQuery, buildEnhancedQuery } from '@/lib/references/query-enhancer'
import { logPipeline, createPipelineLog } from '@/lib/references/query-pipeline'

/** Threshold for triggering AI enhancement */
const AI_ENHANCEMENT_THRESHOLD = 5

/** Minimum word count for AI enhancement */
const AI_ENHANCEMENT_MIN_WORDS = 2

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

    // Step 4: Use the new ReferenceSearchService with unified query pipeline
    try {
      const referenceService = new ReferenceSearchService()
      let searchResult: EnhancedSearchResult = await referenceService.search(query, searchOptions)

      // Track if we used AI enhancement (local expansion is always used)
      let usedAIEnhancement = false
      let enhancementData = null

      // Get word count from processed query
      const wordCount = searchResult.processedQuery?.wordCount || query.trim().split(/\s+/).length

      // Step 4.1: Hybrid Enhancement Strategy
      // Only call OpenAI if:
      // - Results < AI_ENHANCEMENT_THRESHOLD (5)
      // - Query has AI_ENHANCEMENT_MIN_WORDS (2+) words
      // - OpenAI API key is configured
      const shouldTryAIEnhancement =
        searchResult.totalResults < AI_ENHANCEMENT_THRESHOLD &&
        wordCount >= AI_ENHANCEMENT_MIN_WORDS &&
        process.env.OPENAI_API_KEY

      if (shouldTryAIEnhancement) {
        logPipeline(
          createPipelineLog('enhance', query, {
            reason: 'low_results',
            currentResults: searchResult.totalResults,
            wordCount,
            threshold: AI_ENHANCEMENT_THRESHOLD,
          })
        )

        console.log(
          `🔄 Results below threshold (${searchResult.totalResults} < ${AI_ENHANCEMENT_THRESHOLD}), attempting AI enhancement...`
        )

        try {
          enhancementData = await enhanceReferenceQuery(query)

          if (enhancementData && enhancementData.wasModified) {
            console.log('✨ Query enhanced with AI:', {
              original: query,
              corrected: enhancementData.correctedPt,
              englishKeywords: enhancementData.englishKeywords,
            })

            // Build enhanced query and retry search
            const enhancedQuery = buildEnhancedQuery(enhancementData)
            console.log('🔍 Retrying with AI-enhanced query:', enhancedQuery)

            // Retry search with enhanced query
            const enhancedResult = await referenceService.search(enhancedQuery, searchOptions)

            if (enhancedResult.totalResults > searchResult.totalResults) {
              searchResult = enhancedResult
              usedAIEnhancement = true
              console.log(`✅ AI-enhanced search found ${enhancedResult.totalResults} results`)

              logPipeline(
                createPipelineLog('enhance', query, {
                  success: true,
                  previousResults: searchResult.totalResults,
                  newResults: enhancedResult.totalResults,
                })
              )
            }
          }
        } catch (enhanceError) {
          console.warn(
            '⚠️ AI query enhancement failed, using local expansion results:',
            enhanceError
          )
          // Continue with local expansion results (not empty)
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

      // Step 5: Return formatted response with enhanced metadata
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
        // Enhanced query pipeline metadata
        usedLocalExpansion: searchResult.usedLocalExpansion,
        usedAIEnhancement: usedAIEnhancement,
        searchFeedback: searchResult.searchFeedback,
        suggestedTerms: searchResult.suggestedTerms,
        // Legacy fields for backward compatibility
        usedEnhancement: usedAIEnhancement || searchResult.usedLocalExpansion,
        correctedQuery: enhancementData?.correctedPt,
        englishKeywords:
          enhancementData?.englishKeywords || searchResult.processedQuery?.allEnglishKeywords,
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
