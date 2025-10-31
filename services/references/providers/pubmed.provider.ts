/**
 * PubMed Provider for Scientific Article Search
 * 
 * This provider integrates with PubMed/NCBI E-utilities API to search and retrieve
 * biomedical and life science articles, including agricultural and veterinary research.
 * 
 * PubMed is highly reliable and provides validated, peer-reviewed articles.
 */

import axios, { AxiosInstance } from 'axios'
import { Article, SearchOptions, SearchProvider } from '@/services/references/types'
import * as xml2js from 'xml2js'

// Create promisified parseString function with proper typing
const parseXML = (xml: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: true, trim: true }, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

export class PubMedProvider implements SearchProvider {
  private readonly name = 'pubmed'
  private readonly searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
  private readonly fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
  private readonly summaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
  private readonly apiKey: string | undefined
  private readonly client: AxiosInstance
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PUBMED_API_KEY
    
    this.client = axios.create({
      timeout: 20000,
      headers: {
        'User-Agent': 'AgroInsight/1.0 (Agricultural Research Platform; mailto:contact@agroinsight.com)'
      }
    })
  }
  
  /**
   * Translate common agricultural terms to English for PubMed
   */
  private translateQuery(query: string): string {
    const translations: Record<string, string> = {
      'leite': 'milk OR dairy',
      'bovino': 'cattle OR bovine',
      'suíno': 'swine OR pig',
      'frango': 'chicken OR poultry',
      'aves': 'poultry OR birds',
      'nutrição': 'nutrition',
      'alimentação': 'feeding OR feed',
      'pastagem': 'pasture OR grazing',
      'silagem': 'silage',
      'ração': 'feed OR ration',
      'gado': 'cattle OR livestock',
      'pecuária': 'livestock OR animal husbandry',
      'zootecnia': 'animal science OR zootechnics',
      'reprodução': 'reproduction OR breeding',
      'sanidade': 'health OR disease',
      'manejo': 'management OR handling'
    }
    
    // Check if query contains Portuguese terms and translate
    const lowerQuery = query.toLowerCase()
    for (const [pt, en] of Object.entries(translations)) {
      if (lowerQuery.includes(pt)) {
        // Replace Portuguese term with English equivalent
        query = query.replace(new RegExp(pt, 'gi'), en)
      }
    }
    
    return query
  }
  
  /**
   * Search for articles in PubMed database
   * Automatically translates Portuguese terms to English for better results
   */
  async search(query: string, options: SearchOptions = {}): Promise<Article[]> {
    try {
      const { 
        limit = 10, 
        offset = 0,
        yearFrom,
        yearTo,
        language,
        publicationType
      } = options
      
      // Translate Portuguese/Spanish terms to English for PubMed
      const translatedQuery = this.translateQuery(query)
      
      // Build PubMed query with filters
      let pubmedQuery = this.buildPubMedQuery(translatedQuery, {
        yearFrom,
        yearTo,
        language,
        publicationType
      })
      
      // Step 1: Search for article IDs
      const searchResponse = await this.client.get(this.searchUrl, {
        params: {
          db: 'pubmed',
          term: pubmedQuery,
          retmax: limit,
          retstart: offset,
          retmode: 'json',
          sort: 'relevance',
          ...(this.apiKey && { api_key: this.apiKey })
        }
      })
      
      const idList = searchResponse.data?.esearchresult?.idlist || []
      
      if (idList.length === 0) {
        return []
      }
      
      // Step 2: Fetch article details
      const articles = await this.fetchArticleDetails(idList)
      
      return articles
    } catch (error) {
      console.error('PubMed search error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`PubMed search failed: ${message}`)
    }
  }
  
  /**
   * Build PubMed query with filters
   */
  private buildPubMedQuery(query: string, filters: any): string {
    let pubmedQuery = query
    
    // Add year range filter
    if (filters.yearFrom || filters.yearTo) {
      const fromYear = filters.yearFrom || 1900
      const toYear = filters.yearTo || new Date().getFullYear()
      pubmedQuery += ` AND ${fromYear}:${toYear}[dp]` // dp = Date of Publication
    }
    
    // Add language filter
    if (filters.language && filters.language !== 'all') {
      const langMap: Record<string, string> = {
        'pt': 'portuguese',
        'en': 'english',
        'es': 'spanish'
      }
      if (langMap[filters.language]) {
        pubmedQuery += ` AND ${langMap[filters.language]}[la]`
      }
    }
    
    // Add publication type filter
    if (filters.publicationType && filters.publicationType !== 'all') {
      const typeMap: Record<string, string> = {
        'research': 'Research Support',
        'review': 'Review',
        'meta-analysis': 'Meta-Analysis',
        'case-study': 'Case Reports'
      }
      if (typeMap[filters.publicationType]) {
        pubmedQuery += ` AND "${typeMap[filters.publicationType]}"[pt]`
      }
    }
    
    // Optional: Add broad agricultural context only if query is too generic
    // Removed forced English terms to allow natural Portuguese/Spanish queries
    
    return pubmedQuery
  }
  
  /**
   * Fetch detailed article information
   */
  private async fetchArticleDetails(pmids: string[]): Promise<Article[]> {
    try {
      const response = await this.client.get(this.fetchUrl, {
        params: {
          db: 'pubmed',
          id: pmids.join(','),
          retmode: 'xml',
          rettype: 'abstract',
          ...(this.apiKey && { api_key: this.apiKey })
        }
      })
      
      const result = await parseXML(response.data)
      const articles: Article[] = []
      
      const pubmedArticles = result?.PubmedArticleSet?.PubmedArticle || []
      
      for (const pmArticle of pubmedArticles) {
        const article = this.transformPubMedArticle(pmArticle)
        if (article) {
          articles.push(article)
        }
      }
      
      return articles
    } catch (error) {
      console.error('PubMed fetch error:', error)
      return []
    }
  }
  
  /**
   * Transform PubMed XML to Article format
   */
  private transformPubMedArticle(pmArticle: any): Article | null {
    try {
      const medlineCitation = pmArticle.MedlineCitation?.[0]
      const article = medlineCitation?.Article?.[0]
      
      if (!article) return null
      
      // Extract PMID
      const pmid = medlineCitation.PMID?.[0]?._ || medlineCitation.PMID?.[0]
      
      // Extract title
      const title = article.ArticleTitle?.[0] || 'Title not available'
      
      // Extract authors
      const authors = this.extractAuthors(article.AuthorList?.[0]?.Author)
      
      // Extract abstract
      const abstract = this.extractAbstract(article.Abstract?.[0])
      
      // Extract year
      const year = this.extractYear(article.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0])
      
      // Extract journal
      const journal = article.Journal?.[0]?.Title?.[0] || 'Journal not specified'
      
      // Extract DOI
      const doi = this.extractDOI(pmArticle.PubmedData?.[0]?.ArticleIdList?.[0]?.ArticleId)
      
      // Build URL
      const url = doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
      
      // Extract keywords (MeSH terms)
      const keywords = this.extractMeshTerms(medlineCitation.MeshHeadingList?.[0]?.MeshHeading)
      
      // Extract additional metadata
      const issn = article.Journal?.[0]?.ISSN?.[0]?._ || article.Journal?.[0]?.ISSN?.[0]
      const volume = article.Journal?.[0]?.JournalIssue?.[0]?.Volume?.[0]
      const issue = article.Journal?.[0]?.JournalIssue?.[0]?.Issue?.[0]
      const pages = article.Pagination?.[0]?.MedlinePgn?.[0]
      
      // Language
      const language = article.Language?.[0] || 'en'
      
      // Publication type
      const publicationType = this.extractPublicationType(article.PublicationTypeList?.[0]?.PublicationType)
      
      return {
        id: `pubmed-${pmid}`,
        title: title,
        authors: authors,
        abstract: abstract,
        year: year,
        journal: journal,
        url: url,
        source: 'pubmed' as const,
        doi: doi,
        pmid: pmid,
        issn: issn,
        volume: volume,
        issue: issue,
        pages: pages,
        keywords: keywords,
        meshTerms: keywords, // Store as both for compatibility
        language: language,
        publicationType: publicationType,
        verified: true,
        validationSource: 'PubMed/NCBI',
        openAccess: this.checkOpenAccess(pmArticle)
      }
    } catch (error) {
      console.error('Error transforming PubMed article:', error)
      return null
    }
  }
  
  /**
   * Extract authors from PubMed format
   */
  private extractAuthors(authorList: any[]): string[] {
    if (!authorList || !Array.isArray(authorList)) {
      return ['Author not available']
    }
    
    return authorList.map(author => {
      const lastName = author.LastName?.[0] || ''
      const foreName = author.ForeName?.[0] || ''
      const initials = author.Initials?.[0] || ''
      
      if (lastName && foreName) {
        return `${lastName}, ${foreName}`
      } else if (lastName && initials) {
        return `${lastName}, ${initials}`
      } else if (author.CollectiveName?.[0]) {
        return author.CollectiveName[0]
      }
      
      return 'Author not available'
    }).filter(Boolean)
  }
  
  /**
   * Extract abstract text
   */
  private extractAbstract(abstractData: any): string {
    if (!abstractData) {
      return 'Abstract not available. Access the full article for more information.'
    }
    
    if (typeof abstractData === 'string') {
      return abstractData
    }
    
    if (abstractData.AbstractText) {
      const texts = Array.isArray(abstractData.AbstractText) 
        ? abstractData.AbstractText 
        : [abstractData.AbstractText]
      
      return texts.map((text: any) => {
        if (typeof text === 'string') return text
        if (text._) return text._
        return ''
      }).join(' ').trim()
    }
    
    return 'Abstract not available.'
  }
  
  /**
   * Extract publication year
   */
  private extractYear(pubDate: any): number {
    if (!pubDate) return new Date().getFullYear()
    
    if (pubDate.Year?.[0]) {
      return parseInt(pubDate.Year[0])
    }
    
    if (pubDate.MedlineDate?.[0]) {
      const yearMatch = pubDate.MedlineDate[0].match(/\b(19|20)\d{2}\b/)
      if (yearMatch) {
        return parseInt(yearMatch[0])
      }
    }
    
    return new Date().getFullYear()
  }
  
  /**
   * Extract DOI from article IDs
   */
  private extractDOI(articleIds: any[]): string | undefined {
    if (!articleIds || !Array.isArray(articleIds)) return undefined
    
    for (const id of articleIds) {
      if (id.$ && id.$.IdType === 'doi') {
        return id._ || id
      }
    }
    
    return undefined
  }
  
  /**
   * Extract MeSH terms as keywords
   */
  private extractMeshTerms(meshHeadings: any[]): string[] | undefined {
    if (!meshHeadings || !Array.isArray(meshHeadings)) return undefined
    
    const terms = meshHeadings.map(heading => {
      return heading.DescriptorName?.[0]?._ || heading.DescriptorName?.[0]
    }).filter(Boolean)
    
    return terms.length > 0 ? terms : undefined
  }
  
  /**
   * Extract publication type
   */
  private extractPublicationType(pubTypes: any[]): 'research' | 'review' | 'meta-analysis' | 'case-study' | 'other' {
    if (!pubTypes || !Array.isArray(pubTypes)) return 'other'
    
    const types = pubTypes.map(t => (t._ || t || '').toLowerCase())
    
    if (types.some(t => t.includes('meta-analysis'))) return 'meta-analysis'
    if (types.some(t => t.includes('review'))) return 'review'
    if (types.some(t => t.includes('case report'))) return 'case-study'
    if (types.some(t => t.includes('clinical trial') || t.includes('research'))) return 'research'
    
    return 'other'
  }
  
  /**
   * Check if article is open access
   */
  private checkOpenAccess(pmArticle: any): boolean {
    // Check for PMC ID (PubMed Central = Open Access)
    const articleIds = pmArticle.PubmedData?.[0]?.ArticleIdList?.[0]?.ArticleId
    
    if (articleIds && Array.isArray(articleIds)) {
      for (const id of articleIds) {
        if (id.$ && id.$.IdType === 'pmc') {
          return true
        }
      }
    }
    
    return false
  }
  
  /**
   * Validate if an article exists in PubMed
   */
  async validateArticle(doi?: string, title?: string): Promise<boolean> {
    if (!doi && !title) return false
    
    try {
      const query = doi ? `${doi}[doi]` : `"${title}"[ti]`
      
      const response = await this.client.get(this.searchUrl, {
        params: {
          db: 'pubmed',
          term: query,
          retmax: 1,
          retmode: 'json',
          ...(this.apiKey && { api_key: this.apiKey })
        }
      })
      
      return response.data?.esearchresult?.count > 0
    } catch (error) {
      console.error('PubMed validation error:', error)
      return false
    }
  }
}

export default PubMedProvider
