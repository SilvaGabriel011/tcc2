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

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ReferenceSearchService } from '@/services/references'
import { ApiResponse, getRequestId } from '@/lib/api/response'
import { validateRequestBody } from '@/lib/validation/middleware'
import { referenceSearchSchema } from '@/lib/validation/schemas'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return ApiResponse.unauthorized('Não autorizado', requestId)
    }

    const validation = await validateRequestBody(request, referenceSearchSchema)
    
    if (!validation.success) {
      return ApiResponse.validationError(validation.errors!, requestId)
    }

    const { 
      query, 
      source = 'all', 
      page = 1, 
      pageSize = 10,
      yearFrom,
      yearTo,
      language = 'all',
      publicationType
    } = validation.data!

    // Validate pagination
    const validPage = Math.max(1, parseInt(String(page)) || 1)
    const validPageSize = Math.min(20, Math.max(5, parseInt(String(pageSize)) || 10))
    const offset = (validPage - 1) * validPageSize

    console.log(`🔍 Searching for: "${query}" (source: ${source}, page: ${validPage})`);

    // Step 3: Build search options
    const searchOptions = {
      limit: validPageSize,
      offset: offset,
      yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
      yearTo: yearTo ? parseInt(yearTo) : undefined,
      language: language as 'pt' | 'en' | 'es' | 'all',
      publicationType: publicationType,
      sources: source === 'all' ? undefined : [source]
    }

    // Step 4: Use the new ReferenceSearchService
    try {
      const referenceService = new ReferenceSearchService()
      const searchResult = await referenceService.search(query, searchOptions)
      
      console.log(`✅ Found ${searchResult.articles.length} articles from ${searchResult.sources.join(', ')}`);
      
        return ApiResponse.success(
        {
          articles: searchResult.articles,
          page: searchResult.page,
          pageSize: searchResult.pageSize,
          hasMore: searchResult.hasMore,
          total: searchResult.totalResults,
          query: searchResult.query,
          source: source,
          sources: searchResult.sources,
          searchTime: searchResult.searchTime,
          message: `${searchResult.totalResults} artigo(s) encontrado(s)`
        },
        { requestId, cached: false }
      )
    } catch (searchError) {
      console.error('❌ Reference search error:', searchError)
      
      return ApiResponse.serverError(
        'Erro ao buscar referências. Tente novamente com outros termos.',
        searchError instanceof Error ? searchError.message : 'Erro desconhecido',
        requestId
      )
    }

  } catch (error) {
    console.error('❌ Erro geral na pesquisa:', error)
    return ApiResponse.serverError(
      'Erro ao processar pesquisa',
      error instanceof Error ? error.message : 'Erro desconhecido',
      requestId
    )
  }
}
