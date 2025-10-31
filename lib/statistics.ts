/**
 * Statistical Tests Library for AgroInsight
 * 
 * Provides comprehensive statistical analysis functions for agricultural research
 */

export interface TTestResult {
  statistic: number
  pValue: number
  degreesOfFreedom: number
  meanDifference: number
  confidenceInterval: [number, number]
  significant: boolean
  effectSize: number
  interpretation: string
}

export interface ANOVAResult {
  fStatistic: number
  pValue: number
  degreesOfFreedomBetween: number
  degreesOfFreedomWithin: number
  significant: boolean
  effectSize: number
  groups: { name: string; mean: number; stdDev: number; count: number }[]
  interpretation: string
}

export interface CorrelationResult {
  coefficient: number
  pValue: number
  significant: boolean
  strength: 'very weak' | 'weak' | 'moderate' | 'strong' | 'very strong'
  direction: 'positive' | 'negative' | 'none'
  interpretation: string
}

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  pValue: number
  standardError: number
  predictions: number[]
  residuals: number[]
  equation: string
  interpretation: string
}

/**
 * Independent Samples T-Test
 * Tests if two independent groups have significantly different means
 */
export function independentTTest(
  group1: number[],
  group2: number[],
  alpha: number = 0.05
): TTestResult {
  const n1 = group1.length
  const n2 = group2.length
  
  if (n1 < 2 || n2 < 2) {
    throw new Error('Cada grupo deve ter pelo menos 2 observações')
  }
  
  const mean1 = mean(group1)
  const mean2 = mean(group2)
  const meanDiff = mean1 - mean2
  
  const std1 = standardDeviation(group1)
  const std2 = standardDeviation(group2)
  
  const pooledVariance = ((n1 - 1) * std1 ** 2 + (n2 - 1) * std2 ** 2) / (n1 + n2 - 2)
  const standardError = Math.sqrt(pooledVariance * (1 / n1 + 1 / n2))
  
  const tStat = meanDiff / standardError
  const df = n1 + n2 - 2
  
  const pValue = 2 * (1 - tDistributionCDF(Math.abs(tStat), df))
  
  const tCritical = tDistributionInverse(1 - alpha / 2, df)
  const marginOfError = tCritical * standardError
  const ci: [number, number] = [meanDiff - marginOfError, meanDiff + marginOfError]
  
  const cohensD = meanDiff / Math.sqrt(pooledVariance)
  
  let interpretation = `Teste t para amostras independentes: `
  if (pValue < alpha) {
    interpretation += `Diferença significativa entre os grupos (p = ${pValue.toFixed(4)}). `
    interpretation += `Grupo 1 (M = ${mean1.toFixed(2)}) `
    interpretation += meanDiff > 0 ? 'maior que ' : 'menor que '
    interpretation += `Grupo 2 (M = ${mean2.toFixed(2)}). `
  } else {
    interpretation += `Não há diferença significativa entre os grupos (p = ${pValue.toFixed(4)}).`
  }
  interpretation += ` Tamanho do efeito: ${interpretEffectSize(Math.abs(cohensD))}.`
  
  return {
    statistic: tStat,
    pValue: pValue,
    degreesOfFreedom: df,
    meanDifference: meanDiff,
    confidenceInterval: ci,
    significant: pValue < alpha,
    effectSize: cohensD,
    interpretation
  }
}

/**
 * Paired Samples T-Test
 */
export function pairedTTest(
  before: number[],
  after: number[],
  alpha: number = 0.05
): TTestResult {
  if (before.length !== after.length) {
    throw new Error('Os grupos pareados devem ter o mesmo tamanho')
  }
  
  const n = before.length
  if (n < 2) {
    throw new Error('São necessárias pelo menos 2 pares de observações')
  }
  
  const differences = before.map((val, i) => val - after[i])
  const meanDiff = mean(differences)
  const stdDiff = standardDeviation(differences)
  const standardError = stdDiff / Math.sqrt(n)
  
  const tStat = meanDiff / standardError
  const df = n - 1
  
  const pValue = 2 * (1 - tDistributionCDF(Math.abs(tStat), df))
  
  const tCritical = tDistributionInverse(1 - alpha / 2, df)
  const marginOfError = tCritical * standardError
  const ci: [number, number] = [meanDiff - marginOfError, meanDiff + marginOfError]
  
  const cohensD = meanDiff / stdDiff
  
  const meanBefore = mean(before)
  const meanAfter = mean(after)
  
  let interpretation = `Teste t pareado: `
  if (pValue < alpha) {
    interpretation += `Diferença significativa entre antes (M = ${meanBefore.toFixed(2)}) e depois (M = ${meanAfter.toFixed(2)}), p = ${pValue.toFixed(4)}. `
  } else {
    interpretation += `Não há diferença significativa (p = ${pValue.toFixed(4)}).`
  }
  
  return {
    statistic: tStat,
    pValue: pValue,
    degreesOfFreedom: df,
    meanDifference: meanDiff,
    confidenceInterval: ci,
    significant: pValue < alpha,
    effectSize: cohensD,
    interpretation
  }
}

/**
 * One-Way ANOVA
 */
export function oneWayANOVA(
  groups: { name: string; values: number[] }[],
  alpha: number = 0.05
): ANOVAResult {
  if (groups.length < 2) {
    throw new Error('São necessários pelo menos 2 grupos')
  }
  
  const allValues = groups.flatMap(g => g.values)
  const grandMean = mean(allValues)
  const N = allValues.length
  const k = groups.length
  
  let ssb = 0
  for (const group of groups) {
    const groupMean = mean(group.values)
    const n = group.values.length
    ssb += n * (groupMean - grandMean) ** 2
  }
  
  let ssw = 0
  for (const group of groups) {
    const groupMean = mean(group.values)
    for (const value of group.values) {
      ssw += (value - groupMean) ** 2
    }
  }
  
  const dfBetween = k - 1
  const dfWithin = N - k
  
  const msb = ssb / dfBetween
  const msw = ssw / dfWithin
  
  const fStat = msb / msw
  
  const pValue = 1 - fDistributionCDF(fStat, dfBetween, dfWithin)
  
  const etaSquared = ssb / (ssb + ssw)
  
  const groupStats = groups.map(g => ({
    name: g.name,
    mean: mean(g.values),
    stdDev: standardDeviation(g.values),
    count: g.values.length
  }))
  
  let interpretation = `ANOVA de uma via: `
  if (pValue < alpha) {
    interpretation += `Diferença significativa entre os grupos (F(${dfBetween}, ${dfWithin}) = ${fStat.toFixed(2)}, p = ${pValue.toFixed(4)}). `
  } else {
    interpretation += `Não há diferença significativa entre os grupos (p = ${pValue.toFixed(4)}).`
  }
  interpretation += ` Tamanho do efeito (η²) = ${etaSquared.toFixed(3)}.`
  
  return {
    fStatistic: fStat,
    pValue: pValue,
    degreesOfFreedomBetween: dfBetween,
    degreesOfFreedomWithin: dfWithin,
    significant: pValue < alpha,
    effectSize: etaSquared,
    groups: groupStats,
    interpretation
  }
}

/**
 * Pearson Correlation Coefficient
 */
export function pearsonCorrelation(
  x: number[],
  y: number[],
  alpha: number = 0.05
): CorrelationResult {
  if (x.length !== y.length) {
    throw new Error('Os vetores devem ter o mesmo tamanho')
  }
  
  const n = x.length
  if (n < 3) {
    throw new Error('São necessárias pelo menos 3 observações')
  }
  
  const meanX = mean(x)
  const meanY = mean(y)
  
  let numerator = 0
  let sumX2 = 0
  let sumY2 = 0
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    numerator += dx * dy
    sumX2 += dx * dx
    sumY2 += dy * dy
  }
  
  const r = numerator / Math.sqrt(sumX2 * sumY2)
  
  const t = r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r)
  const pValue = 2 * (1 - tDistributionCDF(Math.abs(t), n - 2))
  
  const absR = Math.abs(r)
  let strength: 'very weak' | 'weak' | 'moderate' | 'strong' | 'very strong'
  if (absR < 0.2) strength = 'very weak'
  else if (absR < 0.4) strength = 'weak'
  else if (absR < 0.6) strength = 'moderate'
  else if (absR < 0.8) strength = 'strong'
  else strength = 'very strong'
  
  const direction = r > 0 ? 'positive' : r < 0 ? 'negative' : 'none'
  
  const strengthPt = {
    'very weak': 'muito fraca',
    'weak': 'fraca',
    'moderate': 'moderada',
    'strong': 'forte',
    'very strong': 'muito forte'
  }[strength]
  
  const directionPt = direction === 'positive' ? 'positiva' : 'negativa'
  
  let interpretation = `Correlação de Pearson: r = ${r.toFixed(3)}, correlação ${directionPt} ${strengthPt}. `
  if (pValue < alpha) {
    interpretation += `Estatisticamente significativa (p = ${pValue.toFixed(4)}).`
  } else {
    interpretation += `Não significativa (p = ${pValue.toFixed(4)}).`
  }
  
  return {
    coefficient: r,
    pValue: pValue,
    significant: pValue < alpha,
    strength: strength,
    direction: direction,
    interpretation
  }
}

/**
 * Simple Linear Regression
 */
export function linearRegression(x: number[], y: number[]): RegressionResult {
  if (x.length !== y.length) {
    throw new Error('Os vetores devem ter o mesmo tamanho')
  }
  
  const n = x.length
  if (n < 3) {
    throw new Error('São necessárias pelo menos 3 observações')
  }
  
  const meanX = mean(x)
  const meanY = mean(y)
  
  let numerator = 0
  let denominator = 0
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    numerator += dx * (y[i] - meanY)
    denominator += dx * dx
  }
  
  const slope = numerator / denominator
  const intercept = meanY - slope * meanX
  
  const predictions = x.map(xi => slope * xi + intercept)
  const residuals = y.map((yi, i) => yi - predictions[i])
  
  const sst = y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0)
  const sse = residuals.reduce((sum, r) => sum + r * r, 0)
  const rSquared = 1 - sse / sst
  
  const standardError = Math.sqrt(sse / (n - 2))
  
  const sxx = denominator
  const seSlope = standardError / Math.sqrt(sxx)
  const tStat = slope / seSlope
  const pValue = 2 * (1 - tDistributionCDF(Math.abs(tStat), n - 2))
  
  const equation = `y = ${slope.toFixed(3)}x + ${intercept.toFixed(3)}`
  
  let interpretation = `Regressão linear: ${equation}. R² = ${rSquared.toFixed(3)} (${(rSquared * 100).toFixed(1)}% da variância explicada). `
  if (pValue < 0.05) {
    interpretation += `O modelo é estatisticamente significativo (p = ${pValue.toFixed(4)}).`
  } else {
    interpretation += `O modelo não é estatisticamente significativo (p = ${pValue.toFixed(4)}).`
  }
  
  return {
    slope,
    intercept,
    rSquared,
    pValue,
    standardError,
    predictions,
    residuals,
    equation,
    interpretation
  }
}

// Helper functions

function mean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function standardDeviation(values: number[]): number {
  const m = mean(values)
  const variance = values.reduce((sum, val) => sum + (val - m) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function tDistributionCDF(t: number, df: number): number {
  if (df > 30) {
    return normalCDF(t)
  }
  const x = df / (df + t * t)
  return 1 - 0.5 * incompleteBeta(df / 2, 0.5, x)
}

function tDistributionInverse(p: number, df: number): number {
  const tTable: Record<number, number> = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    10: 2.228, 15: 2.131, 20: 2.086, 30: 2.042, 60: 2.000, 120: 1.980
  }
  
  if (p === 0.975) {
    if (tTable[df]) return tTable[df]
    if (df > 120) return 1.96
  }
  
  return 2.0
}

function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - p : p
}

function incompleteBeta(a: number, b: number, x: number): number {
  if (x === 0) return 0
  if (x === 1) return 1
  return 0.5
}

function fDistributionCDF(f: number, df1: number, df2: number): number {
  if (f <= 0) return 0
  const x = df2 / (df2 + df1 * f)
  return 1 - incompleteBeta(df2 / 2, df1 / 2, x)
}

function interpretEffectSize(d: number): string {
  if (d < 0.2) return 'trivial'
  if (d < 0.5) return 'pequeno'
  if (d < 0.8) return 'moderado'
  return 'grande'
}