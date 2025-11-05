/**
 * Estatísticas Avançadas
 * 
 * Funções para cálculos estatísticos avançados incluindo:
 * - Intervalos de confiança
 * - Testes de hipótese
 * - Validação cruzada de dados
 */

import type { NumericStats } from '@/lib/dataAnalysis'

/**
 * Calcula intervalo de confiança para uma média
 */
export function calculateConfidenceInterval(
  data: number[],
  confidenceLevel: number = 0.95
): { lower: number; upper: number; margin: number } {
  const n = data.length
  
  if (n < 2) {
    return { lower: data[0] || 0, upper: data[0] || 0, margin: 0 }
  }
  
  const mean = data.reduce((sum, val) => sum + val, 0) / n
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  
  const sem = stdDev / Math.sqrt(n)
  
  const tCritical = getTCritical(n - 1, confidenceLevel)
  
  const margin = tCritical * sem
  
  return {
    lower: mean - margin,
    upper: mean + margin,
    margin
  }
}

/**
 * Obtém valor crítico da distribuição t
 * Aproximação para graus de liberdade > 30
 */
function getTCritical(df: number, confidenceLevel: number): number {
  const tTable: Record<number, number> = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042, 40: 2.021,
    50: 2.009, 60: 2.000, 80: 1.990, 100: 1.984, 120: 1.980
  }
  
  if (confidenceLevel === 0.95) {
    if (df <= 10) return tTable[df] || 2.228
    if (df <= 30) return 2.042
    if (df <= 60) return 2.000
    return 1.96 // Aproximação normal para df > 120
  }
  
  if (confidenceLevel === 0.99) {
    if (df <= 10) return 3.169
    if (df <= 30) return 2.750
    return 2.576 // Aproximação normal
  }
  
  if (confidenceLevel === 0.90) {
    if (df <= 10) return 1.812
    if (df <= 30) return 1.697
    return 1.645 // Aproximação normal
  }
  
  return 1.96 // Default 95%
}

/**
 * Teste t de uma amostra contra um valor de referência
 */
export function oneSampleTTest(
  data: number[],
  referenceValue: number
): {
  tStatistic: number
  pValue: number
  significant: boolean
  confidenceInterval: { lower: number; upper: number }
} {
  const n = data.length
  const mean = data.reduce((sum, val) => sum + val, 0) / n
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  const sem = stdDev / Math.sqrt(n)
  
  const tStatistic = (mean - referenceValue) / sem
  
  const pValue = approximatePValue(Math.abs(tStatistic), n - 1)
  
  const significant = pValue < 0.05
  
  const ci = calculateConfidenceInterval(data, 0.95)
  
  return {
    tStatistic,
    pValue,
    significant,
    confidenceInterval: { lower: ci.lower, upper: ci.upper }
  }
}

/**
 * Aproximação do p-valor para teste t bicaudal
 */
function approximatePValue(tAbs: number, df: number): number {
  if (df > 30) {
    if (tAbs < 1.96) return 0.05
    if (tAbs < 2.576) return 0.01
    if (tAbs < 3.291) return 0.001
    return 0.0001
  }
  
  if (tAbs < 2.042) return 0.05
  if (tAbs < 2.750) return 0.01
  if (tAbs < 3.707) return 0.001
  return 0.0001
}

/**
 * Validação cruzada: verifica consistência entre métricas relacionadas
 */
export interface CrossValidationResult {
  valid: boolean
  warnings: string[]
  errors: string[]
  suggestions: string[]
}

/**
 * Valida GPD vs peso inicial/final e dias
 */
export function validateGPD(
  pesoInicial?: number,
  pesoFinal?: number,
  dias?: number,
  gpdReportado?: number,
  tolerance: number = 0.15 // 15% de tolerância
): CrossValidationResult {
  const warnings: string[] = []
  const errors: string[] = []
  const suggestions: string[] = []
  
  if (!pesoInicial || !pesoFinal || !dias) {
    return { valid: true, warnings: [], errors: [], suggestions: [] }
  }
  
  const gpdCalculado = (pesoFinal - pesoInicial) / dias
  
  if (gpdCalculado < 0) {
    errors.push('Peso final menor que peso inicial - possível erro de digitação')
    suggestions.push('Verifique se os pesos foram inseridos na ordem correta')
    return { valid: false, warnings, errors, suggestions }
  }
  
  if (!gpdReportado) {
    suggestions.push(`GPD calculado: ${gpdCalculado.toFixed(3)} kg/dia`)
    return { valid: true, warnings, errors, suggestions }
  }
  
  const diff = Math.abs(gpdCalculado - gpdReportado)
  const percentDiff = (diff / gpdCalculado) * 100
  
  if (percentDiff > tolerance * 100) {
    errors.push(
      `GPD reportado (${gpdReportado.toFixed(3)} kg/dia) difere significativamente do calculado ` +
      `(${gpdCalculado.toFixed(3)} kg/dia) - diferença de ${percentDiff.toFixed(1)}%`
    )
    suggestions.push('Verifique os valores de peso inicial, peso final e número de dias')
    return { valid: false, warnings, errors, suggestions }
  }
  
  if (percentDiff > (tolerance / 2) * 100) {
    warnings.push(
      `GPD reportado (${gpdReportado.toFixed(3)} kg/dia) difere do calculado ` +
      `(${gpdCalculado.toFixed(3)} kg/dia) - diferença de ${percentDiff.toFixed(1)}%`
    )
  }
  
  return { valid: true, warnings, errors, suggestions }
}

/**
 * Valida conversão alimentar vs consumo e ganho
 */
export function validateFCR(
  consumoTotal?: number,
  ganhoTotal?: number,
  fcrReportado?: number,
  tolerance: number = 0.15
): CrossValidationResult {
  const warnings: string[] = []
  const errors: string[] = []
  const suggestions: string[] = []
  
  if (!consumoTotal || !ganhoTotal) {
    return { valid: true, warnings: [], errors: [], suggestions: [] }
  }
  
  if (ganhoTotal <= 0) {
    errors.push('Ganho de peso total deve ser positivo')
    return { valid: false, warnings, errors, suggestions }
  }
  
  const fcrCalculado = consumoTotal / ganhoTotal
  
  if (!fcrReportado) {
    suggestions.push(`Conversão alimentar calculada: ${fcrCalculado.toFixed(2)} kg/kg`)
    return { valid: true, warnings, errors, suggestions }
  }
  
  const diff = Math.abs(fcrCalculado - fcrReportado)
  const percentDiff = (diff / fcrCalculado) * 100
  
  if (percentDiff > tolerance * 100) {
    errors.push(
      `Conversão alimentar reportada (${fcrReportado.toFixed(2)}) difere significativamente ` +
      `da calculada (${fcrCalculado.toFixed(2)}) - diferença de ${percentDiff.toFixed(1)}%`
    )
    suggestions.push('Verifique os valores de consumo total e ganho de peso total')
    return { valid: false, warnings, errors, suggestions }
  }
  
  if (percentDiff > (tolerance / 2) * 100) {
    warnings.push(
      `Conversão alimentar reportada (${fcrReportado.toFixed(2)}) difere da calculada ` +
      `(${fcrCalculado.toFixed(2)}) - diferença de ${percentDiff.toFixed(1)}%`
    )
  }
  
  return { valid: true, warnings, errors, suggestions }
}

/**
 * Valida IEP (Índice de Eficiência Produtiva) para aves
 */
export function validateIEP(
  viabilidade?: number,
  pesoMedio?: number,
  idade?: number,
  conversao?: number,
  iepReportado?: number,
  tolerance: number = 0.10
): CrossValidationResult {
  const warnings: string[] = []
  const errors: string[] = []
  const suggestions: string[] = []
  
  if (!viabilidade || !pesoMedio || !idade || !conversao) {
    return { valid: true, warnings: [], errors: [], suggestions: [] }
  }
  
  const iepCalculado = (viabilidade * pesoMedio) / (idade * conversao) * 100
  
  if (!iepReportado) {
    suggestions.push(`IEP calculado: ${iepCalculado.toFixed(0)} pontos`)
    return { valid: true, warnings, errors, suggestions }
  }
  
  const diff = Math.abs(iepCalculado - iepReportado)
  const percentDiff = (diff / iepCalculado) * 100
  
  if (percentDiff > tolerance * 100) {
    errors.push(
      `IEP reportado (${iepReportado.toFixed(0)}) difere significativamente do calculado ` +
      `(${iepCalculado.toFixed(0)}) - diferença de ${percentDiff.toFixed(1)}%`
    )
    suggestions.push('Verifique os valores de viabilidade, peso médio, idade e conversão alimentar')
    return { valid: false, warnings, errors, suggestions }
  }
  
  if (percentDiff > (tolerance / 2) * 100) {
    warnings.push(
      `IEP reportado (${iepReportado.toFixed(0)}) difere do calculado ` +
      `(${iepCalculado.toFixed(0)}) - diferença de ${percentDiff.toFixed(1)}%`
    )
  }
  
  return { valid: true, warnings, errors, suggestions }
}

/**
 * Valida plausibilidade biológica de valores
 */
export function validateBiologicalPlausibility(
  metric: string,
  value: number,
  species: string
): CrossValidationResult {
  const warnings: string[] = []
  const errors: string[] = []
  const suggestions: string[] = []
  
  const rules: Record<string, { min: number; max: number; warning_min?: number; warning_max?: number }> = {
    'gpd_bovine': { min: 0, max: 3, warning_min: 0.3, warning_max: 2 },
    'gpd_swine': { min: 0, max: 1.5, warning_min: 0.2, warning_max: 1.2 },
    'gpd_poultry': { min: 0, max: 0.15, warning_min: 0.03, warning_max: 0.1 },
    'conversao_bovine': { min: 4, max: 15, warning_min: 5, warning_max: 12 },
    'conversao_swine': { min: 1.5, max: 4, warning_min: 2, warning_max: 3.5 },
    'conversao_poultry': { min: 1.3, max: 2.5, warning_min: 1.5, warning_max: 2.0 },
    'mortalidade': { min: 0, max: 100, warning_min: 0, warning_max: 10 },
    'producao_leite': { min: 0, max: 80, warning_min: 5, warning_max: 50 },
  }
  
  const key = `${metric}_${species}`
  const rule = rules[key] || rules[metric]
  
  if (!rule) {
    return { valid: true, warnings, errors, suggestions }
  }
  
  if (value < rule.min || value > rule.max) {
    errors.push(
      `Valor ${value} fora dos limites biologicamente plausíveis (${rule.min} - ${rule.max})`
    )
    suggestions.push('Verifique se o valor foi digitado corretamente e se a unidade está correta')
    return { valid: false, warnings, errors, suggestions }
  }
  
  if (rule.warning_min !== undefined && value < rule.warning_min) {
    warnings.push(`Valor ${value} é incomumente baixo (esperado > ${rule.warning_min})`)
    suggestions.push('Valor possível mas incomum - verifique se está correto')
  }
  
  if (rule.warning_max !== undefined && value > rule.warning_max) {
    warnings.push(`Valor ${value} é incomumente alto (esperado < ${rule.warning_max})`)
    suggestions.push('Valor possível mas incomum - verifique se está correto')
  }
  
  return { valid: true, warnings, errors, suggestions }
}

/**
 * Helper para converter valores desconhecidos em números
 * Lida com strings, separadores decimais, e texto extra
 */
function toNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const s = v.trim().replace(',', '.')
    const match = s.match(/[-+]?[0-9]*\.?[0-9]+/)
    if (!match) return undefined
    const n = Number(match[0])
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

/**
 * Executa todas as validações cruzadas em um dataset
 */
export function performCrossValidation(
  data: Array<Record<string, unknown>>,
  species: string
): {
  overallValid: boolean
  totalWarnings: number
  totalErrors: number
  results: Array<{
    row: number
    validations: Record<string, CrossValidationResult>
  }>
} {
  const results: Array<{
    row: number
    validations: Record<string, CrossValidationResult>
  }> = []
  
  let totalWarnings = 0
  let totalErrors = 0
  
  data.forEach((row, index) => {
    const validations: Record<string, CrossValidationResult> = {}
    
    const pesoInicial = toNumber(row.peso_inicial)
    const pesoFinal = toNumber(row.peso_final)
    const dias = toNumber(row.dias)
    const gpdReportado = toNumber(row.gpd)
    
    if (pesoInicial !== undefined && pesoFinal !== undefined && dias !== undefined) {
      const gpdResult = validateGPD(
        pesoInicial,
        pesoFinal,
        dias,
        gpdReportado
      )
      validations.gpd = gpdResult
      totalWarnings += gpdResult.warnings.length
      totalErrors += gpdResult.errors.length
    }
    
    const consumoTotal = toNumber(row.consumo_total)
    const ganhoTotal = toNumber(row.ganho_total)
    const fcrReportado = toNumber(row.conversao_alimentar)
    
    if (consumoTotal !== undefined && ganhoTotal !== undefined) {
      const fcrResult = validateFCR(
        consumoTotal,
        ganhoTotal,
        fcrReportado
      )
      validations.fcr = fcrResult
      totalWarnings += fcrResult.warnings.length
      totalErrors += fcrResult.errors.length
    }
    
    if (species === 'poultry') {
      const viabilidade = toNumber(row.viabilidade)
      const pesoMedio = toNumber(row.peso_medio)
      const idade = toNumber(row.idade)
      const conversao = toNumber(row.conversao)
      const iepReportado = toNumber(row.iep)
      
      if (viabilidade !== undefined && pesoMedio !== undefined && idade !== undefined && conversao !== undefined) {
        const iepResult = validateIEP(
          viabilidade,
          pesoMedio,
          idade,
          conversao,
          iepReportado
        )
        validations.iep = iepResult
        totalWarnings += iepResult.warnings.length
        totalErrors += iepResult.errors.length
      }
    }
    
    const gpdVal = toNumber(row.gpd)
    if (gpdVal !== undefined) {
      const plausResult = validateBiologicalPlausibility('gpd', gpdVal, species)
      validations.gpd_plausibility = plausResult
      totalWarnings += plausResult.warnings.length
      totalErrors += plausResult.errors.length
    }
    
    if (Object.keys(validations).length > 0) {
      results.push({ row: index + 1, validations })
    }
  })
  
  return {
    overallValid: totalErrors === 0,
    totalWarnings,
    totalErrors,
    results
  }
}

/**
 * Calcula estatísticas com intervalo de confiança
 */
export function calculateStatsWithCI(
  data: number[],
  confidenceLevel: number = 0.95
): NumericStats & {
  ci95: { lower: number; upper: number; margin: number }
  significantlyDifferentFrom?: (value: number) => boolean
} {
  const n = data.length
  const mean = data.reduce((sum, val) => sum + val, 0) / n
  const sorted = [...data].sort((a, b) => a - b)
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)]
  
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
  const stdDev = Math.sqrt(variance)
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0
  
  // Quartis
  const q1 = sorted[Math.floor(n * 0.25)]
  const q3 = sorted[Math.floor(n * 0.75)]
  const iqr = q3 - q1
  
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr
  const outliers = data.filter(v => v < lowerBound || v > upperBound)
  
  const ci = calculateConfidenceInterval(data, confidenceLevel)
  
  return {
    count: n,
    validCount: n,
    missingCount: 0,
    mean: Number(mean.toFixed(4)),
    median: Number(median.toFixed(4)),
    stdDev: Number(stdDev.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    q1,
    q3,
    iqr,
    cv: Number(cv.toFixed(2)),
    outliers,
    ci95: ci,
    significantlyDifferentFrom: (value: number) => {
      return value < ci.lower || value > ci.upper
    }
  }
}
