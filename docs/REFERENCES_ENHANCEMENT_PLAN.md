# 📚 References Feature Enhancement Plan - AgroInsight

## 🎯 Objective

Fix and enhance the References (Referencias) feature to properly search, validate, and return real scientific articles from multiple trusted sources, with a focus on agricultural and zootechnical research.

## 🔍 Current Issues Identified

### 1. **API Integration Problems**

- ❌ SciELO ArticleMeta API endpoint (`http://articlemeta.scielo.org`) is outdated/unreliable
- ❌ Fallback scraping method returns minimal data
- ❌ No validation of article authenticity
- ❌ Limited metadata extraction

### 2. **Limited Data Sources**

- Only SciELO and Crossref
- No integration with PubMed (important for agricultural research)
- No Google Scholar integration
- Missing Brazilian agricultural databases (Embrapa, etc.)

### 3. **Search Quality Issues**

- Basic keyword matching only
- No advanced filters (publication type, study type, etc.)
- No relevance scoring
- No duplicate detection across sources

## 📋 Implementation Plan

### Phase 1: Fix Core Search Functionality (Priority: HIGH)

#### 1.1 Update SciELO Integration

```typescript
// New SciELO Search API endpoints to implement:
- https://search.scielo.org/api/v1/search (Official Search API)
- https://api.scielo.org/v1/articles (Article Metadata API)
- Add proper authentication headers
- Implement retry logic with exponential backoff
```

#### 1.2 Add PubMed Integration

```typescript
// PubMed E-utilities API
- Base URL: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/
- Search: esearch.fcgi
- Fetch: efetch.fcgi
- Add API key for higher rate limits
```

#### 1.3 Implement Article Validation

```typescript
interface ValidatedArticle {
  // Required fields for validation
  doi?: string // Digital Object Identifier
  pmid?: string // PubMed ID
  issn?: string // Journal ISSN
  verified: boolean // Validation status
  validationSource: string // Where it was validated
}
```

### Phase 2: Add New Data Sources (Priority: HIGH)

#### 2.1 Google Scholar Integration (Web Scraping)

```typescript
// Using Puppeteer for dynamic content
- Implement rate limiting (1 request/second)
- Add proxy rotation to avoid blocking
- Extract: title, authors, year, citations, PDF links
- Handle CAPTCHA detection
```

#### 2.2 Agricultural Databases

```typescript
// Brazilian Agricultural Sources
1. Embrapa Repository
   - API: https://www.alice.cnptia.embrapa.br/api/
   - Focus: Brazilian agricultural research

2. AGRIS (FAO)
   - API: https://agris.fao.org/api/
   - Focus: International agricultural research

3. CAB Abstracts
   - API: Through institutional access
   - Focus: Applied life sciences
```

### Phase 3: Enhanced Search Features (Priority: MEDIUM)

#### 3.1 Advanced Filters

```typescript
interface AdvancedSearchFilters {
  // Time filters
  yearFrom?: number
  yearTo?: number
  lastNDays?: number

  // Content filters
  publicationType?: 'research' | 'review' | 'meta-analysis' | 'case-study'
  studyType?: 'experimental' | 'observational' | 'theoretical'
  language?: string[]

  // Subject filters
  keywords?: string[]
  meshTerms?: string[] // Medical Subject Headings
  animalType?: string[] // Bovine, swine, poultry, etc.

  // Quality filters
  minCitations?: number
  peerReviewed?: boolean
  openAccess?: boolean
  hasFullText?: boolean
}
```

#### 3.2 Search Algorithm Improvements

```typescript
// Implement relevance scoring
function calculateRelevance(article: Article, query: string): number {
  let score = 0

  // Title match (highest weight)
  if (article.title.toLowerCase().includes(query.toLowerCase())) {
    score += 10
  }

  // Abstract match
  if (article.abstract?.toLowerCase().includes(query.toLowerCase())) {
    score += 5
  }

  // Keywords match
  article.keywords?.forEach((keyword) => {
    if (keyword.toLowerCase().includes(query.toLowerCase())) {
      score += 3
    }
  })

  // Recent publication bonus
  const currentYear = new Date().getFullYear()
  if (article.year >= currentYear - 2) {
    score += 2
  }

  // Citation count bonus
  if (article.citationsCount) {
    score += Math.min(article.citationsCount / 10, 5)
  }

  return score
}
```

### Phase 4: Article Enrichment (Priority: MEDIUM)

#### 4.1 Automatic Metadata Enhancement

```typescript
async function enrichArticleMetadata(article: Article): Promise<EnrichedArticle> {
  const enriched = { ...article }

  // Get citation count from Google Scholar
  if (!enriched.citationsCount && enriched.title) {
    enriched.citationsCount = await getGoogleScholarCitations(enriched.title)
  }

  // Get full text availability
  enriched.fullTextSources = await findFullTextSources(enriched.doi || enriched.title)

  // Get related articles
  enriched.relatedArticles = await findRelatedArticles(enriched.doi || enriched.title)

  // Get article metrics (Altmetric, PlumX)
  enriched.metrics = await getArticleMetrics(enriched.doi)

  return enriched
}
```

#### 4.2 Full Text Extraction

```typescript
interface FullTextSource {
  source: string // 'publisher', 'repository', 'preprint'
  url: string
  accessType: 'open' | 'subscription' | 'paywall'
  format: 'pdf' | 'html' | 'xml'
}

async function findFullTextSources(identifier: string): Promise<FullTextSource[]> {
  const sources: FullTextSource[] = []

  // Check Unpaywall for open access
  // Check institutional repositories
  // Check preprint servers (bioRxiv, arXiv)
  // Check ResearchGate

  return sources
}
```

### Phase 5: User Experience Improvements (Priority: LOW)

#### 5.1 Citation Management

```typescript
// Add citation formatting
function formatCitation(article: Article, style: 'APA' | 'MLA' | 'Chicago' | 'ABNT'): string {
  // Implement citation formatting for different styles
  // ABNT is important for Brazilian academic work
}

// Export to citation managers
function exportToBibTeX(articles: Article[]): string {
  // Generate BibTeX format
}

function exportToRIS(articles: Article[]): string {
  // Generate RIS format for EndNote, Mendeley, etc.
}
```

#### 5.2 Search History and Alerts

```typescript
// Save search queries
interface SavedSearch {
  id: string
  userId: string
  query: string
  filters: AdvancedSearchFilters
  createdAt: Date
  alertEnabled: boolean
  alertFrequency?: 'daily' | 'weekly' | 'monthly'
}

// Email alerts for new articles matching saved searches
async function checkSearchAlerts() {
  // Run daily/weekly to find new articles
  // Send email notifications to users
}
```

## 🛠️ Technical Implementation Details

### API Service Refactoring

Create a modular service architecture:

```typescript
// services/references/index.ts
export class ReferenceSearchService {
  private providers: SearchProvider[]

  constructor() {
    this.providers = [
      new SciELOProvider(),
      new PubMedProvider(),
      new CrossrefProvider(),
      new GoogleScholarProvider(),
      new EmbrapaProvider(),
    ]
  }

  async search(query: string, options: SearchOptions): Promise<Article[]> {
    // Parallel search across all providers
    const results = await Promise.allSettled(this.providers.map((p) => p.search(query, options)))

    // Merge and deduplicate results
    const articles = this.mergeResults(results)

    // Validate articles
    const validated = await this.validateArticles(articles)

    // Sort by relevance
    return this.sortByRelevance(validated, query)
  }
}
```

### Database Schema Updates

```prisma
model SavedReference {
  id              String    @id @default(cuid())
  userId          String

  // Core fields
  title           String
  authors         String    @db.Text
  abstract        String?   @db.Text
  year            Int?

  // Identifiers
  doi             String?   @unique
  pmid            String?   @unique
  arxivId         String?

  // Journal info
  journal         String?
  issn            String?
  volume          String?
  issue           String?
  pages           String?

  // Enhanced metadata
  publicationType String?
  meshTerms       String?   @db.Text
  keywords        String?   @db.Text

  // Metrics
  citationsCount  Int?
  altmetricScore  Float?

  // Validation
  verified        Boolean   @default(false)
  verifiedSource  String?
  verifiedAt      DateTime?

  // Full text
  fullTextUrl     String?
  pdfUrl          String?

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([doi])
  @@index([pmid])
}
```

### Error Handling and Fallbacks

```typescript
class ReferenceSearchError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string,
    public retryable: boolean = true
  ) {
    super(message)
  }
}

// Implement circuit breaker pattern for unreliable APIs
class CircuitBreaker {
  private failures = 0
  private lastFailTime?: Date
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
}
```

## 📅 Implementation Timeline

### Week 1-2: Core Fixes

- [ ] Fix SciELO API integration
- [ ] Implement article validation
- [ ] Add PubMed integration
- [ ] Improve error handling

### Week 3-4: New Features

- [ ] Add Google Scholar scraping
- [ ] Implement advanced filters
- [ ] Add relevance scoring
- [ ] Create deduplication logic

### Week 5-6: Enhancements

- [ ] Add Brazilian agricultural databases
- [ ] Implement citation formatting
- [ ] Add full-text detection
- [ ] Create search alerts

### Week 7-8: Testing & Optimization

- [ ] Performance testing
- [ ] Rate limit testing
- [ ] User acceptance testing
- [ ] Documentation

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('ReferenceSearchService', () => {
  it('should return validated articles from SciELO', async () => {
    const results = await service.search('bovine nutrition', {
      source: 'scielo',
      limit: 10,
    })

    expect(results).toHaveLength(10)
    results.forEach((article) => {
      expect(article.verified).toBe(true)
      expect(article.title).toBeTruthy()
      expect(article.authors).toBeInstanceOf(Array)
    })
  })

  it('should handle API failures gracefully', async () => {
    // Mock API failure
    jest.spyOn(scielo, 'search').mockRejectedValue(new Error('API Error'))

    const results = await service.search('test query', {})

    // Should still return results from other sources
    expect(results.length).toBeGreaterThan(0)
  })
})
```

### Integration Tests

- Test with real API endpoints
- Verify rate limiting compliance
- Test deduplication across sources
- Validate citation formatting

## 🚀 Deployment Considerations

### Environment Variables

```env
# API Keys
PUBMED_API_KEY=your_key_here
CROSSREF_API_KEY=your_key_here
SERPAPI_KEY=your_key_here  # For Google Scholar

# Rate Limits
SCIELO_RATE_LIMIT=10  # requests per second
PUBMED_RATE_LIMIT=3   # requests per second
SCHOLAR_RATE_LIMIT=1  # requests per second

# Cache Settings
ARTICLE_CACHE_TTL=3600  # 1 hour
SEARCH_CACHE_TTL=1800   # 30 minutes
```

### Performance Optimization

- Implement Redis caching for search results
- Use database indexes for DOI and PMID lookups
- Implement pagination for large result sets
- Use CDN for PDF storage

## 📊 Success Metrics

### Technical Metrics

- API response time < 2 seconds
- Search accuracy > 90%
- Article validation rate > 95%
- Zero duplicate articles in results

### User Metrics

- Increased saved articles per user
- Reduced "no results found" rate
- Higher user engagement with references
- Positive user feedback on article quality

## 🔒 Security Considerations

- Sanitize all search inputs
- Implement rate limiting per user
- Use API keys securely (environment variables)
- Validate all external data
- Implement CORS properly for external APIs
- Log all search queries for audit

## 📝 Documentation Updates

- Update API documentation
- Create user guide for advanced search
- Document citation formats
- Add troubleshooting guide
- Create developer documentation for adding new sources

---

## Next Steps

1. **Immediate Action**: Fix SciELO API integration
2. **Quick Win**: Add PubMed integration (reliable API)
3. **High Impact**: Implement article validation
4. **User Value**: Add citation formatting

This plan will transform the References feature from a basic search tool into a comprehensive scientific literature discovery platform tailored for agricultural research.
