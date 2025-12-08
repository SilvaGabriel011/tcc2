/**
 * Main Reference Search Service
 *
 * Orchestrates searches across multiple scientific article providers,
 * handles deduplication, validation, and result ranking.
 */

import { Article, SearchOptions, SearchResult, SearchProvider, ProviderSearchStatus } from './types'
import PubMedProvider from './providers/pubmed.provider'
import CrossrefProvider from './providers/crossref.provider'
import GoogleScholarProvider from './providers/scholar.provider'
import { getCache, setCache } from '@/lib/multi-level-cache'

export class ReferenceSearchService {
  private providers: Map<string, SearchProvider>
  private enabledProviders: string[]

  constructor() {
    // Initialize all available providers
    this.providers = new Map<string, SearchProvider>()
    this.providers.set('pubmed', new PubMedProvider())
    this.providers.set('crossref', new CrossrefProvider())

    // Default enabled providers (always available)
    this.enabledProviders = ['pubmed', 'crossref']

    // Conditionally enable Google Scholar if SERPAPI_API_KEY is configured
    if (process.env.SERPAPI_API_KEY) {
      this.providers.set('scholar', new GoogleScholarProvider())
      this.enabledProviders.push('scholar')
      console.log('✅ Google Scholar provider enabled (SERPAPI_API_KEY configured)')
    } else {
      console.log('⚠️ Google Scholar provider disabled (SERPAPI_API_KEY not configured)')
    }
  }

  /**
   * Main search method that queries all enabled providers
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const startTime = Date.now()

    const cacheKey = this.generateCacheKey(query, options)
    const cached = await getCache<SearchResult>(cacheKey)

    if (cached) {
      console.log('📚 Reference search cache hit:', cacheKey)
      return { ...cached, searchTime: Date.now() - startTime }
    }

    // Determine which providers to use
    const providersToUse = options.sources || this.enabledProviders

    // Track provider status for each search
    const providerStatus: ProviderSearchStatus[] = []

    // Search all providers in parallel
    const searchPromises = providersToUse.map(async (providerName) => {
      const provider = this.providers.get(providerName)
      if (!provider) {
        console.warn(`Provider ${providerName} not found`)
        providerStatus.push({
          name: providerName,
          ok: false,
          resultCount: 0,
          error: 'Provider not found',
        })
        return []
      }

      try {
        console.log(`🔍 Searching ${providerName} for: ${query}`)
        const results = await provider.search(query, options)
        console.log(`✅ ${providerName} returned ${results.length} results`)
        providerStatus.push({ name: providerName, ok: true, resultCount: results.length })
        return results
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Error searching ${providerName}:`, error)
        providerStatus.push({ name: providerName, ok: false, resultCount: 0, error: errorMessage })
        return []
      }
    })

    // Wait for all searches to complete
    const allResults = await Promise.allSettled(searchPromises)

    // Combine results from all providers
    let combinedArticles: Article[] = []
    for (const result of allResults) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        combinedArticles = combinedArticles.concat(result.value)
      }
    }

    // Deduplicate articles
    const deduplicatedArticles = this.deduplicateArticles(combinedArticles)

    // Calculate relevance scores and sort
    const scoredArticles = this.scoreAndSortArticles(deduplicatedArticles, query)

    // Apply pagination
    const { limit = 10, offset = 0 } = options
    const paginatedArticles = scoredArticles.slice(offset, offset + limit)

    // Check if any provider failed
    const anyProviderFailed = providerStatus.some((p) => !p.ok)
    // Note: allProvidersFailed is available for future use in error messaging
    const _allProvidersFailed = providerStatus.every((p) => !p.ok)

    // Prepare result
    const searchResult: SearchResult = {
      articles: paginatedArticles,
      totalResults: scoredArticles.length,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      hasMore: offset + limit < scoredArticles.length,
      query: query,
      filters: options,
      searchTime: Date.now() - startTime,
      sources: providersToUse,
      providerStatus: providerStatus,
    }

    // Cache strategy: Don't cache empty results when providers failed
    // This prevents "magic appearance" of articles when cache expires
    if (searchResult.totalResults === 0 && anyProviderFailed) {
      console.log('⚠️ Not caching empty result because some providers failed')
      // Don't cache - let the next request try again
    } else if (searchResult.totalResults === 0) {
      // Cache empty results for a shorter time (60 seconds) when all providers succeeded
      // This handles cases where the query genuinely has no results
      await setCache(cacheKey, searchResult, {
        ttl: 60,
        tags: ['search', 'references'],
      })
      console.log('💾 Cached empty result with short TTL (60s)')
    } else {
      // Cache successful results for 1 hour
      await setCache(cacheKey, searchResult, {
        ttl: 3600,
        tags: ['search', 'references'],
      })
      console.log('💾 Cached search result with standard TTL (3600s)')
    }

    return searchResult
  }

  /**
   * Validate if an article exists in any of the providers
   */
  async validateArticle(
    doi?: string,
    title?: string
  ): Promise<{
    valid: boolean
    sources: string[]
  }> {
    if (!doi && !title) {
      return { valid: false, sources: [] }
    }

    const validationPromises = Array.from(this.providers.entries()).map(
      async ([name, provider]) => {
        if (provider.validateArticle) {
          try {
            const isValid = await provider.validateArticle(doi, title)
            return isValid ? name : null
          } catch (error) {
            console.error(`Validation error for ${name}:`, error)
            return null
          }
        }
        return null
      }
    )

    const results = await Promise.all(validationPromises)
    const validSources = results.filter(Boolean) as string[]

    return {
      valid: validSources.length > 0,
      sources: validSources,
    }
  }

  /**
   * Deduplicate articles based on DOI, title similarity, and other factors
   */
  private deduplicateArticles(articles: Article[]): Article[] {
    const seen = new Map<string, Article>()
    const deduped: Article[] = []

    for (const article of articles) {
      // Check by DOI first (most reliable)
      if (article.doi) {
        const existing = seen.get(`doi:${article.doi}`)
        if (existing) {
          // Merge data from multiple sources
          this.mergeArticleData(existing, article)
          continue
        }
        seen.set(`doi:${article.doi}`, article)
      }

      // Check by PMID
      if (article.pmid) {
        const existing = seen.get(`pmid:${article.pmid}`)
        if (existing) {
          this.mergeArticleData(existing, article)
          continue
        }
        seen.set(`pmid:${article.pmid}`, article)
      }

      // Check by title similarity (fuzzy matching)
      const normalizedTitle = this.normalizeTitle(article.title)
      let isDuplicate = false

      for (const existingArticle of deduped) {
        const existingNormalized = this.normalizeTitle(existingArticle.title)

        if (this.calculateSimilarity(normalizedTitle, existingNormalized) > 0.9) {
          // Very similar titles, likely the same article
          this.mergeArticleData(existingArticle, article)
          isDuplicate = true
          break
        }
      }

      if (!isDuplicate) {
        deduped.push(article)
      }
    }

    return deduped
  }

  /**
   * Merge data from duplicate articles
   */
  private mergeArticleData(target: Article, source: Article): void {
    // Prefer verified sources
    if (source.verified && !target.verified) {
      target.verified = true
      target.validationSource = source.validationSource
    }

    // Merge missing fields
    if (!target.doi && source.doi) {
      target.doi = source.doi
    }
    if (!target.pmid && source.pmid) {
      target.pmid = source.pmid
    }
    if (!target.pdfUrl && source.pdfUrl) {
      target.pdfUrl = source.pdfUrl
    }
    if (!target.abstract && source.abstract) {
      target.abstract = source.abstract
    }
    if (!target.keywords && source.keywords) {
      target.keywords = source.keywords
    }
    if (!target.citationsCount && source.citationsCount) {
      target.citationsCount = source.citationsCount
    }

    // Combine keywords from multiple sources
    if (target.keywords && source.keywords) {
      target.keywords = Array.from(new Set([...target.keywords, ...source.keywords]))
    }
  }

  /**
   * Calculate relevance score and sort articles
   */
  private scoreAndSortArticles(articles: Article[], query: string): Article[] {
    const queryLower = query.toLowerCase()
    const queryTerms = queryLower.split(/\s+/)

    const scoredArticles = articles.map((article) => {
      let score = 0

      // Title match (highest weight)
      const titleLower = article.title.toLowerCase()
      if (titleLower.includes(queryLower)) {
        score += 20 // Exact phrase match
      } else {
        // Check individual terms
        queryTerms.forEach((term) => {
          if (titleLower.includes(term)) {
            score += 5
          }
        })
      }

      // Abstract match
      if (article.abstract) {
        const abstractLower = article.abstract.toLowerCase()
        if (abstractLower.includes(queryLower)) {
          score += 10
        } else {
          queryTerms.forEach((term) => {
            if (abstractLower.includes(term)) {
              score += 2
            }
          })
        }
      }

      // Keywords match
      if (article.keywords) {
        article.keywords.forEach((keyword) => {
          const keywordLower = keyword.toLowerCase()
          queryTerms.forEach((term) => {
            if (keywordLower.includes(term)) {
              score += 3
            }
          })
        })
      }

      // Boost for recent publications (last 3 years)
      const currentYear = new Date().getFullYear()
      if (article.year >= currentYear - 3) {
        score += 5
      } else if (article.year >= currentYear - 5) {
        score += 2
      }

      // Boost for verified articles
      if (article.verified) {
        score += 3
      }

      // Boost for articles with citations
      if (article.citationsCount) {
        score += Math.min(Math.log10(article.citationsCount + 1) * 2, 10)
      }

      // Boost for open access
      if (article.openAccess) {
        score += 2
      }

      // Boost for articles with PDF
      if (article.pdfUrl) {
        score += 1
      }

      return { article, score }
    })

    // Sort by score (descending)
    scoredArticles.sort((a, b) => b.score - a.score)

    return scoredArticles.map((item) => item.article)
  }

  /**
   * Normalize title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  /**
   * Calculate similarity between two strings (Jaccard similarity)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(' '))
    const set2 = new Set(str2.split(' '))

    const intersection = new Set(Array.from(set1).filter((x) => set2.has(x)))
    const union = new Set(Array.from(set1).concat(Array.from(set2)))

    return intersection.size / union.size
  }

  /**
   * Generate cache key for search
   */
  private generateCacheKey(query: string, options: SearchOptions): string {
    const optionsStr = JSON.stringify(options, Object.keys(options).sort())
    return `ref:search:${query}:${optionsStr}`
  }

  /**
   * Get provider status
   */
  async getProviderStatus(): Promise<Map<string, boolean>> {
    const status = new Map<string, boolean>()

    for (const [name, provider] of Array.from(this.providers.entries())) {
      try {
        // Try a simple search to check if provider is working
        await provider.search('test', { limit: 1 })
        status.set(name, true)
      } catch {
        status.set(name, false)
      }
    }

    return status
  }
}

// Export singleton instance
export const referenceService = new ReferenceSearchService()

export default referenceService
