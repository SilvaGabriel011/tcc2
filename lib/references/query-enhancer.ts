/**
 * Query Enhancement Service for Scientific References
 *
 * Uses OpenAI to improve search queries by:
 * - Correcting typos and spelling errors
 * - Translating Portuguese terms to English equivalents
 * - Expanding queries with related keywords and synonyms
 *
 * This service helps users find articles even when they make typos
 * or use terms that don't match exactly what's in the databases.
 */

import OpenAI from 'openai'
import { getCache, setCache } from '@/lib/multi-level-cache'

/**
 * Result of query enhancement
 */
export interface QueryEnhancementResult {
  /** Original query from user */
  originalQuery: string
  /** Typo-corrected query in Portuguese */
  correctedPt: string
  /** Normalized version (lowercase, no accents) */
  normalizedPt: string
  /** English translations/equivalents for the query */
  englishKeywords: string[]
  /** Related terms in Portuguese */
  relatedPtKeywords: string[]
  /** Whether any correction was made */
  wasModified: boolean
}

/**
 * Build an enhanced query string from enhancement result
 * Combines original, corrected, and translated terms with OR operators
 */
export function buildEnhancedQuery(enhancement: QueryEnhancementResult): string {
  const parts: string[] = []

  // Add corrected Portuguese query
  if (enhancement.correctedPt && enhancement.correctedPt !== enhancement.originalQuery) {
    parts.push(`"${enhancement.correctedPt}"`)
  }

  // Add original query (in case correction was wrong)
  parts.push(`"${enhancement.originalQuery}"`)

  // Add normalized version without accents
  if (
    enhancement.normalizedPt &&
    enhancement.normalizedPt !== enhancement.correctedPt.toLowerCase()
  ) {
    parts.push(`"${enhancement.normalizedPt}"`)
  }

  // Add English keywords (limit to top 5 to avoid query explosion)
  const topEnglish = enhancement.englishKeywords.slice(0, 5)
  for (const keyword of topEnglish) {
    parts.push(`"${keyword}"`)
  }

  // Add related Portuguese keywords (limit to top 3)
  const topRelated = enhancement.relatedPtKeywords.slice(0, 3)
  for (const keyword of topRelated) {
    parts.push(`"${keyword}"`)
  }

  // Join with OR and limit total length to avoid issues with providers
  const combined = parts.join(' OR ')

  // Truncate if too long (some APIs have query length limits)
  if (combined.length > 500) {
    return combined.substring(0, 500)
  }

  return combined
}

/**
 * Remove accents from a string (for normalized comparison)
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Enhance a search query using OpenAI
 *
 * @param rawQuery - The original user query (may contain typos)
 * @returns Enhanced query result or null if enhancement fails/not needed
 */
export async function enhanceReferenceQuery(
  rawQuery: string
): Promise<QueryEnhancementResult | null> {
  // Skip enhancement for very short queries
  if (!rawQuery || rawQuery.trim().length < 3) {
    return null
  }

  const trimmedQuery = rawQuery.trim()

  // Check cache first (TTL: 12 hours for query enhancements)
  const cacheKey = `ref:qenhance:${trimmedQuery.toLowerCase()}`
  const cached = await getCache<QueryEnhancementResult>(cacheKey)

  if (cached) {
    console.log('📚 Query enhancement cache hit:', trimmedQuery)
    return cached
  }

  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ OpenAI API key not configured, skipping query enhancement')
    return createFallbackEnhancement(trimmedQuery)
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const prompt = `Você é um assistente especializado em pesquisa científica agrícola e zootécnica.
Recebeu um termo de busca que pode estar em português ou inglês e pode conter erros de digitação.

Termo de busca: "${trimmedQuery}"

Sua tarefa:
1. Corrija erros ortográficos mantendo o sentido original (ex: "produçao" -> "produção", "nutricao" -> "nutrição")
2. Gere de 3 a 6 palavras/frases-chave em INGLÊS equivalentes ou relacionadas (para busca em PubMed/Crossref)
3. Gere de 2 a 4 termos relacionados em PORTUGUÊS (sinônimos, termos técnicos)

Responda APENAS com JSON válido no formato:
{
  "correctedPt": "termo corrigido em português",
  "englishKeywords": ["keyword1", "keyword2", "keyword3"],
  "relatedPtKeywords": ["termo1", "termo2"]
}

Exemplos:
- "produçao animal" -> correctedPt: "produção animal", englishKeywords: ["animal production", "livestock production", "animal husbandry"]
- "nutricao bovina" -> correctedPt: "nutrição bovina", englishKeywords: ["cattle nutrition", "bovine nutrition", "beef cattle feeding"]
- "leite" -> correctedPt: "leite", englishKeywords: ["milk", "dairy", "milk production", "dairy cattle"]`

    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 300,
      },
      {
        timeout: 5000, // 5 second timeout to avoid blocking the search
      }
    )

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn('⚠️ Could not parse OpenAI response as JSON')
      return createFallbackEnhancement(trimmedQuery)
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!parsed.correctedPt || !Array.isArray(parsed.englishKeywords)) {
      console.warn('⚠️ OpenAI response missing required fields')
      return createFallbackEnhancement(trimmedQuery)
    }

    const result: QueryEnhancementResult = {
      originalQuery: trimmedQuery,
      correctedPt: parsed.correctedPt || trimmedQuery,
      normalizedPt: removeAccents(parsed.correctedPt || trimmedQuery).toLowerCase(),
      englishKeywords: parsed.englishKeywords || [],
      relatedPtKeywords: parsed.relatedPtKeywords || [],
      wasModified:
        parsed.correctedPt !== trimmedQuery ||
        (parsed.englishKeywords && parsed.englishKeywords.length > 0),
    }

    // Cache the result for 12 hours
    await setCache(cacheKey, result, { ttl: 43200, tags: ['query-enhancement'] })
    console.log('💾 Query enhancement cached:', trimmedQuery)

    return result
  } catch (error) {
    console.error('❌ Query enhancement error:', error)
    // Return fallback enhancement on error
    return createFallbackEnhancement(trimmedQuery)
  }
}

/**
 * Create a basic fallback enhancement without AI
 * Uses simple rules for common Portuguese agricultural terms
 */
function createFallbackEnhancement(query: string): QueryEnhancementResult {
  const lowerQuery = query.toLowerCase()
  const normalizedQuery = removeAccents(lowerQuery)

  // Basic Portuguese to English translations for common agricultural terms
  const translations: Record<string, string[]> = {
    leite: ['milk', 'dairy', 'milk production'],
    bovino: ['cattle', 'bovine', 'beef cattle'],
    bovinos: ['cattle', 'bovine', 'beef cattle'],
    suino: ['swine', 'pig', 'pork'],
    suinos: ['swine', 'pigs', 'pork production'],
    frango: ['chicken', 'poultry', 'broiler'],
    aves: ['poultry', 'birds', 'avian'],
    nutricao: ['nutrition', 'feeding', 'diet'],
    alimentacao: ['feeding', 'feed', 'nutrition'],
    producao: ['production', 'yield', 'output'],
    animal: ['animal', 'livestock'],
    gado: ['cattle', 'livestock'],
    pecuaria: ['livestock', 'animal husbandry', 'cattle farming'],
    zootecnia: ['animal science', 'zootechnics', 'animal husbandry'],
    reproducao: ['reproduction', 'breeding'],
    sanidade: ['health', 'disease', 'sanitary'],
    manejo: ['management', 'handling'],
    pastagem: ['pasture', 'grazing', 'grassland'],
    silagem: ['silage', 'ensiling'],
    racao: ['feed', 'ration', 'diet'],
    ovino: ['sheep', 'ovine'],
    caprino: ['goat', 'caprine'],
    aquicultura: ['aquaculture', 'fish farming'],
    peixe: ['fish', 'aquaculture'],
    tilapia: ['tilapia', 'fish farming'],
    abelha: ['bee', 'apiculture', 'honey'],
    mel: ['honey', 'apiculture', 'bee'],
    forragem: ['forage', 'fodder', 'roughage'],
  }

  // Find matching translations
  const englishKeywords: string[] = []
  const relatedPtKeywords: string[] = []

  for (const [ptTerm, enTerms] of Object.entries(translations)) {
    if (normalizedQuery.includes(ptTerm)) {
      englishKeywords.push(...enTerms)
    }
  }

  // Remove duplicates
  const uniqueEnglish = Array.from(new Set(englishKeywords))

  return {
    originalQuery: query,
    correctedPt: query, // No correction without AI
    normalizedPt: normalizedQuery,
    englishKeywords: uniqueEnglish.slice(0, 6),
    relatedPtKeywords: relatedPtKeywords,
    wasModified: uniqueEnglish.length > 0,
  }
}
