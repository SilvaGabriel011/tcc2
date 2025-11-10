import {
  CANONICAL_METRICS,
  resolveMetric,
  convertUnit,
  validateMetricValue,
  getMetricsForSpecies,
  getMetricsByCategory,
} from '@/lib/metrics/canonical-metrics'

describe('canonical-metrics', () => {
  describe('CANONICAL_METRICS', () => {
    it('should have metrics defined', () => {
      expect(CANONICAL_METRICS.length).toBeGreaterThan(0)
    })

    it('should have gpd metric', () => {
      const gpd = CANONICAL_METRICS.find((m) => m.key === 'gpd')
      expect(gpd).toBeDefined()
      expect(gpd?.unit).toBe('kg/dia')
      expect(gpd?.category).toBe('performance')
    })

    it('should have conversao_alimentar metric', () => {
      const ca = CANONICAL_METRICS.find((m) => m.key === 'conversao_alimentar')
      expect(ca).toBeDefined()
      expect(ca?.aliases).toContain('fcr')
    })

    it('should have validation rules for metrics', () => {
      const gpd = CANONICAL_METRICS.find((m) => m.key === 'gpd')
      expect(gpd?.validationRules).toBeDefined()
      expect(gpd?.validationRules?.mustBePositive).toBe(true)
    })
  })

  describe('resolveMetric', () => {
    it('should resolve metric by key', () => {
      const metric = resolveMetric('gpd')
      expect(metric).toBeDefined()
      expect(metric?.key).toBe('gpd')
    })

    it('should resolve metric by alias', () => {
      const metric = resolveMetric('gmd')
      expect(metric).toBeDefined()
      expect(metric?.key).toBe('gpd')
    })

    it('should resolve metric by partial alias match', () => {
      const metric = resolveMetric('ganho_diario')
      expect(metric).toBeDefined()
      expect(metric?.key).toBe('gpd')
    })

    it('should normalize accents', () => {
      const metric = resolveMetric('conversão_alimentar')
      expect(metric).toBeDefined()
      expect(metric?.key).toBe('conversao_alimentar')
    })

    it('should normalize separators', () => {
      const metric = resolveMetric('ganho-peso-diario')
      expect(metric).toBeDefined()
      expect(metric?.key).toBe('gpd')
    })

    it('should filter by species', () => {
      const metric = resolveMetric('producao_leite', 'bovine')
      expect(metric).toBeDefined()
      expect(metric?.species).toContain('bovine')
    })

    it('should return null for wrong species', () => {
      const metric = resolveMetric('producao_leite', 'poultry')
      expect(metric).toBeNull()
    })

    it('should return null for unknown metric', () => {
      const metric = resolveMetric('unknown_metric_xyz')
      expect(metric).toBeNull()
    })

    it('should handle uppercase input', () => {
      const metric = resolveMetric('GPD')
      expect(metric).toBeDefined()
      expect(metric?.key).toBe('gpd')
    })

    it('should handle whitespace', () => {
      const metric = resolveMetric('  gpd  ')
      expect(metric).toBeDefined()
      expect(metric?.key).toBe('gpd')
    })
  })

  describe('convertUnit', () => {
    it('should return same value for same unit', () => {
      expect(convertUnit(100, 'kg', 'kg')).toBe(100)
    })

    it('should convert kg to g', () => {
      expect(convertUnit(1, 'kg', 'g')).toBe(1000)
    })

    it('should convert g to kg', () => {
      expect(convertUnit(1000, 'g', 'kg')).toBe(1)
    })

    it('should convert kg to lb', () => {
      const result = convertUnit(1, 'kg', 'lb')
      expect(result).toBeCloseTo(2.20462, 4)
    })

    it('should convert kg to arroba', () => {
      const result = convertUnit(30, 'kg', 'arroba')
      expect(result).toBeCloseTo(1, 3)
    })

    it('should convert percent to decimal', () => {
      expect(convertUnit(50, '%', 'decimal')).toBe(0.5)
    })

    it('should convert decimal to percent', () => {
      expect(convertUnit(0.5, 'decimal', '%')).toBe(50)
    })

    it('should convert dias to days', () => {
      expect(convertUnit(30, 'dias', 'days')).toBe(30)
    })

    it('should convert meses to dias', () => {
      expect(convertUnit(1, 'meses', 'dias')).toBe(30)
    })

    it('should be case-insensitive', () => {
      expect(convertUnit(1, 'KG', 'G')).toBe(1000)
    })

    it('should handle whitespace', () => {
      expect(convertUnit(1, '  kg  ', '  g  ')).toBe(1000)
    })

    it('should return original value for unknown conversion', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      const result = convertUnit(100, 'unknown', 'kg')
      expect(result).toBe(100)
      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })

    it('should return original value for missing target unit', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      const result = convertUnit(100, 'kg', 'unknown')
      expect(result).toBe(100)
      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })

  describe('validateMetricValue', () => {
    it('should validate value within range', () => {
      const metric = CANONICAL_METRICS.find((m) => m.key === 'gpd')!
      const result = validateMetricValue(1.5, metric)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject negative value when mustBePositive', () => {
      const metric = CANONICAL_METRICS.find((m) => m.key === 'gpd')!
      const result = validateMetricValue(-1, metric)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('positivo')
    })

    it('should reject value below minimum', () => {
      const metric = CANONICAL_METRICS.find((m) => m.key === 'gpd')!
      const result = validateMetricValue(-0.5, metric)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('mínimo'))).toBe(true)
    })

    it('should reject value above maximum', () => {
      const metric = CANONICAL_METRICS.find((m) => m.key === 'gpd')!
      const result = validateMetricValue(5, metric)

      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('máximo'))).toBe(true)
    })

    it('should accept value at minimum boundary', () => {
      const metric = CANONICAL_METRICS.find((m) => m.key === 'gpd')!
      const result = validateMetricValue(0, metric)

      expect(result.valid).toBe(true)
    })

    it('should accept value at maximum boundary', () => {
      const metric = CANONICAL_METRICS.find((m) => m.key === 'gpd')!
      const result = validateMetricValue(3, metric)

      expect(result.valid).toBe(true)
    })

    it('should pass validation when no rules defined', () => {
      const metric = {
        key: 'test',
        aliases: [],
        unit: 'unit',
        acceptedUnits: [],
        species: [],
        category: 'test',
        description: 'Test',
      }
      const result = validateMetricValue(999, metric)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate conversao_alimentar range', () => {
      const metric = CANONICAL_METRICS.find((m) => m.key === 'conversao_alimentar')!

      expect(validateMetricValue(2, metric).valid).toBe(true)
      expect(validateMetricValue(0.3, metric).valid).toBe(false)
      expect(validateMetricValue(25, metric).valid).toBe(false)
    })

    it('should validate mortalidade percentage', () => {
      const metric = CANONICAL_METRICS.find((m) => m.key === 'mortalidade')!

      expect(validateMetricValue(5, metric).valid).toBe(true)
      expect(validateMetricValue(-1, metric).valid).toBe(false)
      expect(validateMetricValue(101, metric).valid).toBe(false)
    })
  })

  describe('getMetricsForSpecies', () => {
    it('should return bovine metrics', () => {
      const metrics = getMetricsForSpecies('bovine')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.species.includes('bovine'))).toBe(true)
    })

    it('should return swine metrics', () => {
      const metrics = getMetricsForSpecies('swine')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.species.includes('swine'))).toBe(true)
    })

    it('should return poultry metrics', () => {
      const metrics = getMetricsForSpecies('poultry')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.species.includes('poultry'))).toBe(true)
    })

    it('should return aquaculture metrics', () => {
      const metrics = getMetricsForSpecies('aquaculture')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.species.includes('aquaculture'))).toBe(true)
    })

    it('should return forage metrics', () => {
      const metrics = getMetricsForSpecies('forage')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.species.includes('forage'))).toBe(true)
    })

    it('should return empty array for unknown species', () => {
      const metrics = getMetricsForSpecies('unknown')
      expect(metrics).toHaveLength(0)
    })

    it('should include shared metrics across species', () => {
      const bovineMetrics = getMetricsForSpecies('bovine')
      const swineMetrics = getMetricsForSpecies('swine')

      const gpdInBovine = bovineMetrics.some((m) => m.key === 'gpd')
      const gpdInSwine = swineMetrics.some((m) => m.key === 'gpd')

      expect(gpdInBovine).toBe(true)
      expect(gpdInSwine).toBe(true)
    })
  })

  describe('getMetricsByCategory', () => {
    it('should return performance metrics', () => {
      const metrics = getMetricsByCategory('performance')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.category === 'performance')).toBe(true)
    })

    it('should return peso metrics', () => {
      const metrics = getMetricsByCategory('peso')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.category === 'peso')).toBe(true)
    })

    it('should return producao metrics', () => {
      const metrics = getMetricsByCategory('producao')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.category === 'producao')).toBe(true)
    })

    it('should return qualidade metrics', () => {
      const metrics = getMetricsByCategory('qualidade')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.category === 'qualidade')).toBe(true)
    })

    it('should return reproducao metrics', () => {
      const metrics = getMetricsByCategory('reproducao')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.category === 'reproducao')).toBe(true)
    })

    it('should return carcaca metrics', () => {
      const metrics = getMetricsByCategory('carcaca')
      expect(metrics.length).toBeGreaterThan(0)
      expect(metrics.every((m) => m.category === 'carcaca')).toBe(true)
    })

    it('should return empty array for unknown category', () => {
      const metrics = getMetricsByCategory('unknown')
      expect(metrics).toHaveLength(0)
    })
  })

  describe('Integration tests', () => {
    it('should resolve, validate, and convert metric', () => {
      const metric = resolveMetric('gpd', 'bovine')
      expect(metric).toBeDefined()

      const valueInGrams = 1500
      const valueInKg = convertUnit(valueInGrams, 'g/dia', 'kg/dia')
      expect(valueInKg).toBe(1.5)

      const validation = validateMetricValue(valueInKg, metric!)
      expect(validation.valid).toBe(true)
    })

    it('should handle complete metric workflow', () => {
      const columnName = 'ganho_peso_diario'
      const metric = resolveMetric(columnName, 'bovine')

      expect(metric).toBeDefined()
      expect(metric?.key).toBe('gpd')

      const metrics = getMetricsForSpecies('bovine')
      expect(metrics).toContain(metric)

      const performanceMetrics = getMetricsByCategory('performance')
      expect(performanceMetrics).toContain(metric)
    })
  })
})
