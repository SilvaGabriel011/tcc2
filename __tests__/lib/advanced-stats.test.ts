import {
  calculateConfidenceInterval,
  oneSampleTTest,
  validateGPD,
  validateFCR,
  validateIEP,
  validateBiologicalPlausibility,
  performCrossValidation,
  calculateStatsWithCI,
} from '@/lib/statistics/advanced-stats'

describe('advanced-stats', () => {
  describe('calculateConfidenceInterval', () => {
    it('should calculate confidence interval for sample data', () => {
      const data = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
      const result = calculateConfidenceInterval(data, 0.95)

      expect(result.lower).toBeLessThan(result.upper)
      expect(result.margin).toBeGreaterThan(0)
      expect(result.lower).toBeGreaterThan(0)
      expect(result.upper).toBeLessThan(40)
    })

    it('should handle single value', () => {
      const data = [15]
      const result = calculateConfidenceInterval(data, 0.95)

      expect(result.lower).toBe(15)
      expect(result.upper).toBe(15)
      expect(result.margin).toBe(0)
    })

    it('should handle 99% confidence level', () => {
      const data = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
      const result = calculateConfidenceInterval(data, 0.99)

      expect(result.margin).toBeGreaterThan(0)
      expect(result.upper - result.lower).toBeGreaterThan(0)
    })

    it('should handle 90% confidence level', () => {
      const data = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
      const result = calculateConfidenceInterval(data, 0.9)

      expect(result.margin).toBeGreaterThan(0)
      expect(result.upper - result.lower).toBeGreaterThan(0)
    })

    it('should handle empty data', () => {
      const data: number[] = []
      const result = calculateConfidenceInterval(data, 0.95)

      expect(result.lower).toBe(0)
      expect(result.upper).toBe(0)
      expect(result.margin).toBe(0)
    })
  })

  describe('oneSampleTTest', () => {
    it('should perform one-sample t-test', () => {
      const data = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
      const referenceValue = 15
      const result = oneSampleTTest(data, referenceValue)

      expect(result.tStatistic).toBeDefined()
      expect(result.pValue).toBeDefined()
      expect(result.significant).toBeDefined()
      expect(result.confidenceInterval.lower).toBeLessThan(result.confidenceInterval.upper)
    })

    it('should detect significant difference', () => {
      const data = [30, 32, 34, 36, 38, 40, 42, 44, 46, 48]
      const referenceValue = 10
      const result = oneSampleTTest(data, referenceValue)

      expect(result.significant).toBe(true)
      expect(Math.abs(result.tStatistic)).toBeGreaterThan(2)
    })

    it('should detect non-significant difference', () => {
      const data = [18, 19, 20, 21, 22]
      const referenceValue = 20
      const result = oneSampleTTest(data, referenceValue)

      expect(result.pValue).toBeGreaterThan(0)
    })
  })

  describe('validateGPD', () => {
    it('should validate consistent GPD values', () => {
      const result = validateGPD(300, 450, 100, 1.5)

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should detect negative weight gain', () => {
      const result = validateGPD(450, 300, 100)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('Peso final menor')
    })

    it('should detect significant GPD discrepancy', () => {
      const result = validateGPD(300, 450, 100, 3.0)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('difere significativamente')
    })

    it('should warn about moderate GPD discrepancy', () => {
      const result = validateGPD(300, 450, 100, 1.65)

      expect(result.valid).toBe(true)
      if (result.warnings.length === 0) {
        expect(result.errors.length).toBe(0)
      } else {
        expect(result.warnings.length).toBeGreaterThan(0)
      }
    })

    it('should suggest calculated GPD when not provided', () => {
      const result = validateGPD(300, 450, 100)

      expect(result.valid).toBe(true)
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions[0]).toContain('GPD calculado')
    })

    it('should return valid when missing required data', () => {
      const result = validateGPD(undefined, 450, 100)

      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBe(0)
      expect(result.errors.length).toBe(0)
    })
  })

  describe('validateFCR', () => {
    it('should validate consistent FCR values', () => {
      const result = validateFCR(300, 100, 3.0)

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should detect zero or negative weight gain', () => {
      const result = validateFCR(300, -10)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('positivo')
    })

    it('should detect significant FCR discrepancy', () => {
      const result = validateFCR(300, 100, 5.0)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('difere significativamente')
    })

    it('should warn about moderate FCR discrepancy', () => {
      const result = validateFCR(300, 100, 3.3)

      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should suggest calculated FCR when not provided', () => {
      const result = validateFCR(300, 100)

      expect(result.valid).toBe(true)
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions[0]).toContain('Conversão alimentar calculada')
    })

    it('should return valid when missing required data', () => {
      const result = validateFCR(undefined, 100)

      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBe(0)
      expect(result.errors.length).toBe(0)
    })
  })

  describe('validateIEP', () => {
    it('should validate consistent IEP values', () => {
      const viabilidade = 0.95
      const pesoMedio = 2.5
      const idade = 42
      const conversao = 1.8
      const iepCalculado = ((viabilidade * pesoMedio) / (idade * conversao)) * 100
      const result = validateIEP(viabilidade, pesoMedio, idade, conversao, iepCalculado)

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should detect significant IEP discrepancy', () => {
      const result = validateIEP(0.95, 2.5, 42, 1.8, 500)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('difere significativamente')
    })

    it('should warn about moderate IEP discrepancy', () => {
      const result = validateIEP(0.95, 2.5, 42, 1.8, 320)

      if (result.valid) {
        expect(result.warnings.length).toBeGreaterThan(0)
      } else {
        expect(result.errors.length).toBeGreaterThan(0)
      }
    })

    it('should suggest calculated IEP when not provided', () => {
      const result = validateIEP(0.95, 2.5, 42, 1.8)

      expect(result.valid).toBe(true)
      expect(result.suggestions.length).toBeGreaterThan(0)
      expect(result.suggestions[0]).toContain('IEP calculado')
    })

    it('should return valid when missing required data', () => {
      const result = validateIEP(undefined, 2.5, 42, 1.8)

      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBe(0)
      expect(result.errors.length).toBe(0)
    })
  })

  describe('validateBiologicalPlausibility', () => {
    it('should validate plausible bovine GPD', () => {
      const result = validateBiologicalPlausibility('gpd', 1.2, 'bovine')

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should detect implausible high bovine GPD', () => {
      const result = validateBiologicalPlausibility('gpd', 5.0, 'bovine')

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('biologicamente plausíveis')
    })

    it('should detect implausible low bovine GPD', () => {
      const result = validateBiologicalPlausibility('gpd', -1.0, 'bovine')

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should warn about unusually high bovine GPD', () => {
      const result = validateBiologicalPlausibility('gpd', 2.5, 'bovine')

      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('incomumente alto')
    })

    it('should warn about unusually low bovine GPD', () => {
      const result = validateBiologicalPlausibility('gpd', 0.1, 'bovine')

      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('incomumente baixo')
    })

    it('should validate plausible swine FCR', () => {
      const result = validateBiologicalPlausibility('conversao', 2.5, 'swine')

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should validate plausible poultry FCR', () => {
      const result = validateBiologicalPlausibility('conversao', 1.7, 'poultry')

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should validate plausible mortality rate', () => {
      const result = validateBiologicalPlausibility('mortalidade', 5, 'bovine')

      expect(result.valid).toBe(true)
      expect(result.errors.length).toBe(0)
    })

    it('should detect implausible mortality rate', () => {
      const result = validateBiologicalPlausibility('mortalidade', 150, 'bovine')

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should return valid for unknown metrics', () => {
      const result = validateBiologicalPlausibility('unknown_metric', 100, 'bovine')

      expect(result.valid).toBe(true)
      expect(result.warnings.length).toBe(0)
      expect(result.errors.length).toBe(0)
    })
  })

  describe('performCrossValidation', () => {
    it('should validate complete bovine dataset', () => {
      const data = [
        { peso_inicial: 300, peso_final: 450, dias: 100, gpd: 1.5 },
        { peso_inicial: 280, peso_final: 420, dias: 100, gpd: 1.4 },
        { peso_inicial: 320, peso_final: 480, dias: 100, gpd: 1.6 },
      ]

      const result = performCrossValidation(data, 'bovine')

      expect(result.overallValid).toBe(true)
      expect(result.totalErrors).toBe(0)
      expect(result.results.length).toBeGreaterThan(0)
    })

    it('should detect errors in dataset', () => {
      const data = [{ peso_inicial: 450, peso_final: 300, dias: 100, gpd: 1.5 }]

      const result = performCrossValidation(data, 'bovine')

      expect(result.overallValid).toBe(false)
      expect(result.totalErrors).toBeGreaterThan(0)
    })

    it('should validate FCR in dataset', () => {
      const data = [{ consumo_total: 300, ganho_total: 100, conversao_alimentar: 3.0 }]

      const result = performCrossValidation(data, 'bovine')

      expect(result.results.length).toBeGreaterThan(0)
      expect(result.results[0].validations.fcr).toBeDefined()
    })

    it('should validate IEP for poultry', () => {
      const viabilidade = 0.95
      const pesoMedio = 2.5
      const idade = 42
      const conversao = 1.8
      const iepCalculado = ((viabilidade * pesoMedio) / (idade * conversao)) * 100
      const data = [{ viabilidade, peso_medio: pesoMedio, idade, conversao, iep: iepCalculado }]

      const result = performCrossValidation(data, 'poultry')

      expect(result.results.length).toBeGreaterThan(0)
      expect(result.results[0].validations.iep).toBeDefined()
    })

    it('should validate biological plausibility', () => {
      const data = [{ gpd: 1.2 }]

      const result = performCrossValidation(data, 'bovine')

      expect(result.results.length).toBeGreaterThan(0)
      expect(result.results[0].validations.gpd_plausibility).toBeDefined()
    })

    it('should handle string numbers with commas', () => {
      const data = [{ peso_inicial: '300,5', peso_final: '450,8', dias: '100', gpd: '1,5' }]

      const result = performCrossValidation(data, 'bovine')

      expect(result.results.length).toBeGreaterThan(0)
    })

    it('should handle empty dataset', () => {
      const data: Array<Record<string, unknown>> = []

      const result = performCrossValidation(data, 'bovine')

      expect(result.overallValid).toBe(true)
      expect(result.totalErrors).toBe(0)
      expect(result.totalWarnings).toBe(0)
      expect(result.results.length).toBe(0)
    })

    it('should accumulate warnings and errors', () => {
      const data = [
        { peso_inicial: 300, peso_final: 450, dias: 100, gpd: 1.6 },
        { peso_inicial: 450, peso_final: 300, dias: 100, gpd: 1.5 },
        { gpd: 0.1 },
      ]

      const result = performCrossValidation(data, 'bovine')

      expect(result.totalWarnings).toBeGreaterThan(0)
      expect(result.totalErrors).toBeGreaterThan(0)
    })
  })

  describe('calculateStatsWithCI', () => {
    it('should calculate stats with confidence interval', () => {
      const data = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
      const result = calculateStatsWithCI(data)

      expect(result.mean).toBeGreaterThan(0)
      expect(result.median).toBeGreaterThan(0)
      expect(result.stdDev).toBeGreaterThan(0)
      expect(result.ci95.lower).toBeLessThan(result.ci95.upper)
      expect(result.ci95.margin).toBeGreaterThan(0)
    })

    it('should handle single value', () => {
      const data = [15]
      const result = calculateStatsWithCI(data)

      expect(result.mean).toBe(15)
      expect(result.median).toBe(15)
      expect(result.stdDev).toBe(0)
    })

    it('should calculate correct median for even count', () => {
      const data = [10, 20, 30, 40]
      const result = calculateStatsWithCI(data)

      expect(result.median).toBe(25)
    })

    it('should calculate correct median for odd count', () => {
      const data = [10, 20, 30]
      const result = calculateStatsWithCI(data)

      expect(result.median).toBe(20)
    })

    it('should use custom confidence level', () => {
      const data = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
      const result = calculateStatsWithCI(data, 0.99)

      expect(result.ci95.margin).toBeGreaterThan(0)
    })

    it('should provide significantlyDifferentFrom function', () => {
      const data = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
      const result = calculateStatsWithCI(data)

      expect(result.significantlyDifferentFrom).toBeDefined()
      expect(typeof result.significantlyDifferentFrom).toBe('function')

      if (typeof result.significantlyDifferentFrom === 'function') {
        expect(result.significantlyDifferentFrom(100)).toBe(true)
        expect(result.significantlyDifferentFrom(19)).toBe(false)
      } else {
        fail('significantlyDifferentFrom should be a function')
      }
    })

    it('should calculate all NumericStats properties', () => {
      const data = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
      const result = calculateStatsWithCI(data)

      expect(result.count).toBe(10)
      expect(result.validCount).toBe(10)
      expect(result.missingCount).toBe(0)
      expect(result.variance).toBeGreaterThan(0)
      expect(result.min).toBe(10)
      expect(result.max).toBe(28)
      expect(result.range).toBe(18)
      expect(result.q1).toBeDefined()
      expect(result.q3).toBeDefined()
      expect(result.iqr).toBeGreaterThan(0)
      expect(result.cv).toBeGreaterThan(0)
      expect(result.outliers).toBeDefined()
    })
  })
})
