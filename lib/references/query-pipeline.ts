/**
 * Unified Query Pipeline for Scientific Reference Search
 *
 * This module processes ALL queries before sending them to providers.
 * It handles:
 * - Normalization (accents, lowercase, stopwords)
 * - PT→EN phrase translation (multi-word support)
 * - Structure generation for provider-specific query building
 *
 * The pipeline ensures that Portuguese queries like "produção animal"
 * are properly translated to English equivalents for better search results.
 */

/**
 * Portuguese stopwords to remove from queries
 */
const PT_STOPWORDS = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'em',
  'na',
  'no',
  'nas',
  'nos',
  'a',
  'o',
  'as',
  'os',
  'um',
  'uma',
  'uns',
  'umas',
  'e',
  'ou',
  'para',
  'por',
  'com',
  'sem',
  'sobre',
  'entre',
  'que',
  'se',
  'ao',
  'aos',
  'pela',
  'pelo',
  'pelas',
  'pelos',
])

/**
 * Comprehensive PT→EN phrase dictionary for agricultural/zootechnical terms
 * Each phrase maps to an array of English equivalents for broader search coverage
 */
export const PT_EN_PHRASE_DICTIONARY: Record<string, string[]> = {
  // Animal Production & Performance
  'produção animal': ['animal production', 'livestock production', 'animal husbandry'],
  'produção de leite': ['milk production', 'dairy production', 'lactation'],
  'produção de carne': ['meat production', 'beef production', 'meat yield'],
  'produção de ovos': ['egg production', 'egg laying', 'poultry production'],
  'desempenho zootécnico': [
    'animal performance',
    'livestock performance',
    'zootechnical performance',
  ],
  'desempenho produtivo': ['productive performance', 'production performance'],
  'desempenho reprodutivo': ['reproductive performance', 'breeding performance'],

  // Nutrition & Feeding
  'nutrição animal': ['animal nutrition', 'livestock nutrition', 'feed science'],
  'nutrição bovina': ['cattle nutrition', 'bovine nutrition', 'beef cattle nutrition'],
  'nutrição de ruminantes': ['ruminant nutrition', 'ruminant feeding'],
  'nutrição de monogástricos': ['monogastric nutrition', 'non-ruminant nutrition'],
  'alimentação animal': ['animal feeding', 'livestock feeding', 'animal diet'],
  'conversão alimentar': ['feed conversion ratio', 'feed efficiency', 'FCR'],
  'eficiência alimentar': ['feed efficiency', 'feeding efficiency'],
  'consumo de matéria seca': ['dry matter intake', 'DMI', 'feed intake'],
  'consumo alimentar': ['feed intake', 'food consumption', 'feed consumption'],
  'suplementação alimentar': ['feed supplementation', 'dietary supplementation'],
  'aditivos alimentares': ['feed additives', 'dietary additives'],

  // Growth & Weight
  'ganho de peso': ['weight gain', 'body weight gain', 'live weight gain'],
  'ganho médio diário': ['average daily gain', 'ADG', 'daily weight gain'],
  'peso vivo': ['live weight', 'body weight', 'liveweight'],
  'peso ao nascer': ['birth weight', 'weight at birth'],
  'peso ao abate': ['slaughter weight', 'carcass weight'],
  'peso à desmama': ['weaning weight', 'weight at weaning'],
  'taxa de crescimento': ['growth rate', 'rate of growth'],
  'curva de crescimento': ['growth curve', 'growth pattern'],

  // Reproduction
  'reprodução animal': ['animal reproduction', 'livestock breeding'],
  'reprodução bovina': ['cattle reproduction', 'bovine reproduction'],
  'taxa de prenhez': ['pregnancy rate', 'conception rate'],
  'taxa de fertilidade': ['fertility rate', 'reproductive rate'],
  'inseminação artificial': ['artificial insemination', 'AI'],
  'ciclo estral': ['estrous cycle', 'estrus cycle', 'heat cycle'],
  'intervalo entre partos': ['calving interval', 'parturition interval'],

  // Health & Sanitation
  'sanidade animal': ['animal health', 'livestock health', 'veterinary health'],
  'bem-estar animal': ['animal welfare', 'livestock welfare'],
  'doenças infecciosas': ['infectious diseases', 'communicable diseases'],
  'controle sanitário': ['sanitary control', 'health control'],
  'vacinação animal': ['animal vaccination', 'livestock immunization'],

  // Management
  'manejo animal': ['animal management', 'livestock management', 'animal handling'],
  'manejo nutricional': ['nutritional management', 'feeding management'],
  'manejo reprodutivo': ['reproductive management', 'breeding management'],
  'manejo sanitário': ['health management', 'sanitary management'],
  'sistema de produção': ['production system', 'farming system'],
  'sistema intensivo': ['intensive system', 'intensive production'],
  'sistema extensivo': ['extensive system', 'extensive production'],
  'confinamento bovino': ['cattle feedlot', 'beef feedlot', 'cattle confinement'],

  // Pasture & Forage
  'pastagem cultivada': ['cultivated pasture', 'improved pasture'],
  'pastagem nativa': ['native pasture', 'natural grassland'],
  'forragem conservada': ['conserved forage', 'preserved forage'],
  'silagem de milho': ['corn silage', 'maize silage'],
  'silagem de capim': ['grass silage', 'forage silage'],
  'feno de alfafa': ['alfalfa hay', 'lucerne hay'],
  'qualidade da forragem': ['forage quality', 'fodder quality'],
  'digestibilidade da forragem': ['forage digestibility', 'fodder digestibility'],

  // Cattle Specific
  'gado de corte': ['beef cattle', 'meat cattle'],
  'gado leiteiro': ['dairy cattle', 'milk cattle'],
  'bovinos de corte': ['beef cattle', 'beef animals'],
  'bovinos leiteiros': ['dairy cattle', 'dairy cows'],
  'vacas em lactação': ['lactating cows', 'milking cows'],
  'novilhas de reposição': ['replacement heifers', 'heifer replacement'],
  'bezerros de corte': ['beef calves', 'meat calves'],

  // Swine Specific
  'suínos em crescimento': ['growing pigs', 'growing swine'],
  'suínos em terminação': ['finishing pigs', 'fattening pigs'],
  'porcas em gestação': ['gestating sows', 'pregnant sows'],
  'porcas em lactação': ['lactating sows', 'nursing sows'],
  'leitões desmamados': ['weaned piglets', 'weaner pigs'],

  // Poultry Specific
  'frangos de corte': ['broiler chickens', 'meat chickens', 'broilers'],
  'galinhas poedeiras': ['laying hens', 'layer hens', 'egg-laying chickens'],
  'aves de postura': ['laying birds', 'layer poultry'],
  'pintinhos de corte': ['broiler chicks', 'meat chicks'],

  // Sheep & Goat
  'ovinos de corte': ['meat sheep', 'lamb production'],
  'ovinos leiteiros': ['dairy sheep', 'milk sheep'],
  'caprinos leiteiros': ['dairy goats', 'milk goats'],
  'caprinos de corte': ['meat goats', 'goat meat production'],
  'cordeiros em terminação': ['finishing lambs', 'fattening lambs'],

  // Aquaculture
  'piscicultura intensiva': ['intensive fish farming', 'intensive aquaculture'],
  'criação de tilápia': ['tilapia farming', 'tilapia production'],
  'criação de tambaqui': ['tambaqui farming', 'tambaqui production'],
  'qualidade da água': ['water quality', 'aquatic environment'],
  'densidade de estocagem': ['stocking density', 'fish density'],

  // Apiculture
  'criação de abelhas': ['beekeeping', 'apiculture', 'bee farming'],
  'produção de mel': ['honey production', 'honey yield'],
  'colmeia de abelhas': ['bee hive', 'beehive'],

  // Carcass & Meat Quality
  'qualidade da carne': ['meat quality', 'beef quality'],
  'rendimento de carcaça': ['carcass yield', 'dressing percentage'],
  'composição da carcaça': ['carcass composition', 'body composition'],
  'área de olho de lombo': ['ribeye area', 'loin eye area', 'longissimus area'],
  'espessura de gordura': ['fat thickness', 'backfat thickness'],
  'marmoreio da carne': ['meat marbling', 'intramuscular fat'],

  // Milk Quality
  'qualidade do leite': ['milk quality', 'dairy quality'],
  'composição do leite': ['milk composition', 'dairy composition'],
  'contagem de células somáticas': ['somatic cell count', 'SCC'],
  'teor de gordura': ['fat content', 'milk fat'],
  'teor de proteína': ['protein content', 'milk protein'],

  // Economics
  'custo de produção': ['production cost', 'cost of production'],
  'viabilidade econômica': ['economic viability', 'economic feasibility'],
  'rentabilidade da produção': ['production profitability', 'farm profitability'],
}

/**
 * Single-word PT→EN translations for fallback
 */
export const PT_EN_WORD_DICTIONARY: Record<string, string[]> = {
  // Animals
  bovino: ['cattle', 'bovine', 'beef'],
  bovinos: ['cattle', 'bovine', 'beef'],
  suíno: ['swine', 'pig', 'pork'],
  suínos: ['swine', 'pigs', 'pork'],
  frango: ['chicken', 'poultry', 'broiler'],
  frangos: ['chickens', 'poultry', 'broilers'],
  aves: ['poultry', 'birds', 'avian'],
  ovino: ['sheep', 'ovine', 'lamb'],
  ovinos: ['sheep', 'ovine', 'lambs'],
  caprino: ['goat', 'caprine'],
  caprinos: ['goats', 'caprine'],
  peixe: ['fish', 'aquaculture'],
  peixes: ['fish', 'aquaculture'],
  tilápia: ['tilapia'],
  tambaqui: ['tambaqui', 'colossoma'],
  abelha: ['bee', 'honeybee'],
  abelhas: ['bees', 'honeybees'],

  // Production terms
  leite: ['milk', 'dairy'],
  carne: ['meat', 'beef'],
  ovo: ['egg'],
  ovos: ['eggs'],
  mel: ['honey'],
  lã: ['wool'],

  // Nutrition terms
  nutrição: ['nutrition', 'feeding'],
  alimentação: ['feeding', 'diet', 'nutrition'],
  ração: ['feed', 'ration', 'diet'],
  forragem: ['forage', 'fodder', 'roughage'],
  silagem: ['silage', 'ensiling'],
  feno: ['hay'],
  pastagem: ['pasture', 'grazing', 'grassland'],
  suplemento: ['supplement', 'additive'],
  proteína: ['protein'],
  energia: ['energy'],
  fibra: ['fiber', 'fibre'],
  mineral: ['mineral'],
  vitamina: ['vitamin'],

  // Performance terms
  produção: ['production', 'yield', 'output'],
  desempenho: ['performance'],
  crescimento: ['growth'],
  ganho: ['gain', 'increase'],
  peso: ['weight', 'mass'],
  conversão: ['conversion', 'efficiency'],
  eficiência: ['efficiency'],
  consumo: ['intake', 'consumption'],
  rendimento: ['yield', 'efficiency'],

  // Reproduction terms
  reprodução: ['reproduction', 'breeding'],
  fertilidade: ['fertility'],
  prenhez: ['pregnancy', 'gestation'],
  gestação: ['gestation', 'pregnancy'],
  lactação: ['lactation', 'milking'],
  desmama: ['weaning'],
  parto: ['parturition', 'calving', 'birth'],
  inseminação: ['insemination'],

  // Health terms
  sanidade: ['health', 'sanitation'],
  doença: ['disease', 'illness'],
  doenças: ['diseases', 'illnesses'],
  vacinação: ['vaccination', 'immunization'],
  tratamento: ['treatment', 'therapy'],

  // Management terms
  manejo: ['management', 'handling'],
  sistema: ['system'],
  confinamento: ['feedlot', 'confinement'],
  criação: ['breeding', 'farming', 'production'],

  // Quality terms
  qualidade: ['quality'],
  carcaça: ['carcass'],
  gordura: ['fat', 'lipid'],
  marmoreio: ['marbling'],

  // General terms
  animal: ['animal', 'livestock'],
  animais: ['animals', 'livestock'],
  gado: ['cattle', 'livestock'],
  pecuária: ['livestock', 'animal husbandry'],
  zootecnia: ['animal science', 'zootechnics'],
  agropecuária: ['agriculture', 'agribusiness'],
}

/**
 * Processed query structure returned by the pipeline
 */
export interface ProcessedQuery {
  /** Original query from user */
  originalPt: string
  /** Normalized version (lowercase, no accents, no stopwords) */
  normalizedPt: string
  /** Main phrase detected (if any) */
  mainPhrase: string | null
  /** Individual tokens from the query */
  tokens: string[]
  /** English translations for detected phrases */
  phraseTranslations: string[]
  /** English translations for individual tokens */
  tokenTranslations: string[]
  /** All English keywords combined (phrases + tokens) */
  allEnglishKeywords: string[]
  /** Whether any translation was found */
  hasTranslations: boolean
  /** Number of words in original query */
  wordCount: number
}

/**
 * Provider-specific query structure
 */
export interface ProviderQuery {
  /** Query optimized for PubMed (with field qualifiers) */
  pubmed: string
  /** Query optimized for Crossref (query.title + generic) */
  crossref: {
    titleQuery: string
    genericQuery: string
  }
  /** Generic query for other providers */
  generic: string
}

/**
 * Remove accents from a string
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Normalize a query string:
 * - Convert to lowercase
 * - Remove accents
 * - Remove stopwords
 * - Normalize whitespace
 */
export function normalizeQuery(query: string): string {
  const lower = query.toLowerCase().trim()
  const noAccents = removeAccents(lower)

  // Split into words and filter stopwords
  const words = noAccents.split(/\s+/).filter((word) => !PT_STOPWORDS.has(word) && word.length > 1)

  return words.join(' ')
}

/**
 * Find phrase matches in the query
 * Returns the longest matching phrase and its translations
 */
function findPhraseMatches(normalizedQuery: string): {
  phrase: string | null
  translations: string[]
} {
  const normalizedLower = normalizedQuery.toLowerCase()
  let bestMatch: { phrase: string; translations: string[] } | null = null

  // Sort phrases by length (longest first) to find best match
  const sortedPhrases = Object.entries(PT_EN_PHRASE_DICTIONARY).sort(
    ([a], [b]) => b.length - a.length
  )

  for (const [ptPhrase, enTranslations] of sortedPhrases) {
    const normalizedPhrase = removeAccents(ptPhrase.toLowerCase())

    if (normalizedLower.includes(normalizedPhrase)) {
      if (!bestMatch || normalizedPhrase.length > bestMatch.phrase.length) {
        bestMatch = { phrase: ptPhrase, translations: enTranslations }
      }
    }
  }

  return {
    phrase: bestMatch?.phrase || null,
    translations: bestMatch?.translations || [],
  }
}

/**
 * Find word translations for individual tokens
 */
function findWordTranslations(tokens: string[]): string[] {
  const translations: string[] = []

  for (const token of tokens) {
    const normalizedToken = removeAccents(token.toLowerCase())

    // Check word dictionary
    for (const [ptWord, enWords] of Object.entries(PT_EN_WORD_DICTIONARY)) {
      const normalizedPtWord = removeAccents(ptWord.toLowerCase())

      if (normalizedToken === normalizedPtWord) {
        translations.push(...enWords)
        break
      }
    }
  }

  return [...new Set(translations)] // Remove duplicates
}

/**
 * Process a query through the unified pipeline
 * This is the main entry point for query processing
 */
export function processQuery(rawQuery: string): ProcessedQuery {
  const trimmedQuery = rawQuery.trim()
  const normalizedQuery = normalizeQuery(trimmedQuery)
  const tokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 0)

  // Find phrase matches
  const { phrase, translations: phraseTranslations } = findPhraseMatches(normalizedQuery)

  // Find word translations for tokens not covered by phrase
  const tokenTranslations = findWordTranslations(tokens)

  // Combine all English keywords (deduplicated)
  const allEnglishKeywords = [...new Set([...phraseTranslations, ...tokenTranslations])]

  return {
    originalPt: trimmedQuery,
    normalizedPt: normalizedQuery,
    mainPhrase: phrase,
    tokens,
    phraseTranslations,
    tokenTranslations,
    allEnglishKeywords,
    hasTranslations: allEnglishKeywords.length > 0,
    wordCount: tokens.length,
  }
}

/**
 * Build provider-specific queries from processed query
 */
export function buildProviderQueries(processed: ProcessedQuery): ProviderQuery {
  const { originalPt, normalizedPt, allEnglishKeywords, phraseTranslations } = processed

  // PubMed query with field qualifiers
  // Use [tiab] for title/abstract search
  const pubmedParts: string[] = []

  // Add English translations with [tiab] qualifier
  if (allEnglishKeywords.length > 0) {
    const englishTerms = allEnglishKeywords.slice(0, 5).map((term) => `"${term}"[tiab]`)
    pubmedParts.push(`(${englishTerms.join(' OR ')})`)
  }

  // Also include original query for broader coverage
  pubmedParts.push(`"${normalizedPt}"[tiab]`)

  const pubmedQuery = pubmedParts.join(' OR ')

  // Crossref queries
  // Use translated phrase for title query, original for generic
  const titleQuery =
    phraseTranslations.length > 0 ? phraseTranslations.slice(0, 2).join(' OR ') : normalizedPt

  const genericQuery =
    allEnglishKeywords.length > 0
      ? [...allEnglishKeywords.slice(0, 3), normalizedPt].join(' ')
      : normalizedPt

  // Generic query for other providers
  const genericParts = allEnglishKeywords.length > 0 ? allEnglishKeywords.slice(0, 5) : [originalPt]

  return {
    pubmed: pubmedQuery,
    crossref: {
      titleQuery,
      genericQuery,
    },
    generic: genericParts.join(' OR '),
  }
}

/**
 * Get suggested search terms based on the query
 * Returns related terms that the user might want to try
 */
export function getSuggestedTerms(processed: ProcessedQuery): string[] {
  const suggestions: string[] = []

  // Add phrase translations as suggestions
  if (processed.phraseTranslations.length > 0) {
    suggestions.push(...processed.phraseTranslations.slice(0, 3))
  }

  // Add some related phrases from dictionary
  const normalizedQuery = processed.normalizedPt.toLowerCase()

  for (const [ptPhrase, _enTranslations] of Object.entries(PT_EN_PHRASE_DICTIONARY)) {
    const normalizedPhrase = removeAccents(ptPhrase.toLowerCase())

    // Check if any token from query appears in the phrase
    const hasOverlap = processed.tokens.some((token) => normalizedPhrase.includes(token))

    if (hasOverlap && !normalizedPhrase.includes(normalizedQuery)) {
      suggestions.push(ptPhrase)
      if (suggestions.length >= 6) {
        break
      }
    }
  }

  return [...new Set(suggestions)].slice(0, 6)
}

/**
 * Format search feedback message for the user
 * Shows what was searched and the translations used
 */
export function formatSearchFeedback(processed: ProcessedQuery): string {
  if (!processed.hasTranslations) {
    return `Buscamos por: "${processed.originalPt}"`
  }

  const translations = processed.allEnglishKeywords.slice(0, 3).join(', ')
  return `Buscamos por: "${processed.originalPt}" → ${translations}`
}

/**
 * Structured logging for query pipeline
 */
export interface QueryPipelineLog {
  timestamp: string
  stage: 'normalize' | 'translate' | 'build' | 'search' | 'enhance'
  query: string
  details: Record<string, unknown>
  duration?: number
}

/**
 * Create a structured log entry
 */
export function createPipelineLog(
  stage: QueryPipelineLog['stage'],
  query: string,
  details: Record<string, unknown>,
  duration?: number
): QueryPipelineLog {
  return {
    timestamp: new Date().toISOString(),
    stage,
    query,
    details,
    duration,
  }
}

/**
 * Log pipeline activity with structured format
 */
export function logPipeline(log: QueryPipelineLog): void {
  const prefix = {
    normalize: '🔄',
    translate: '🌐',
    build: '🔧',
    search: '🔍',
    enhance: '✨',
  }[log.stage]

  const durationStr = log.duration ? ` (${log.duration}ms)` : ''

  console.log(
    `${prefix} [QueryPipeline:${log.stage}] "${log.query}"${durationStr}`,
    JSON.stringify(log.details)
  )
}
