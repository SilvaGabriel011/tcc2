import {
  VariableType,
  detectVariableType,
  calculateNumericStats,
  calculateCategoricalStats,
  analyzeDataset,
} from '@/lib/dataAnalysis'

describe('dataAnalysis', () => {
  describe('detectVariableType', () => {
    it('should detect quantitative continuous variables', () => {
      const values = [10.5, 20.3, 30.7, 40.2, 50.9]
      const result = detectVariableType('peso', values)

      expect(result.type).toBe(VariableType.QUANTITATIVE_CONTINUOUS)
      expect(result.rawType).toBe('numeric')
      expect(result.isZootechnical).toBe(true)
    })

    it('should detect quantitative discrete variables', () => {
      const values = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
      const result = detectVariableType('qtd_animais', values)

      expect(result.type).toBe(VariableType.QUANTITATIVE_DISCRETE)
      expect(result.rawType).toBe('numeric')
    })

    it('should detect temporal variables', () => {
      const values = ['2023-01-01', '2023-02-01', '2023-03-01']
      const result = detectVariableType('data', values)

      expect(result.type).toBe(VariableType.TEMPORAL)
      expect(result.rawType).toBe('date')
    })

    it('should detect identifier variables', () => {
      const values = ['ID001', 'ID002', 'ID003', 'ID004']
      const result = detectVariableType('id_animal', values)

      expect(result.type).toBe(VariableType.IDENTIFIER)
      expect(result.rawType).toBe('string')
    })

    it('should detect qualitative nominal variables', () => {
      const values = ['Nelore', 'Angus', 'Brahman', 'Nelore']
      const result = detectVariableType('raca', values)

      expect(result.type).toBe(VariableType.QUALITATIVE_NOMINAL)
      expect(result.rawType).toBe('string')
      expect(result.isZootechnical).toBe(true)
    })

    it('should detect qualitative ordinal variables', () => {
      const values = ['Baixo', 'Médio', 'Alto', 'Médio']
      const result = detectVariableType('escore_corporal', values)

      expect(result.type).toBe(VariableType.QUALITATIVE_ORDINAL)
      expect(result.rawType).toBe('string')
    })

    it('should identify zootechnical variables', () => {
      const zootechnicalNames = ['peso', 'gpd', 'conversao_alimentar', 'idade', 'raca']

      zootechnicalNames.forEach((name) => {
        const result = detectVariableType(name, [1, 2, 3])
        expect(result.isZootechnical).toBe(true)
      })
    })

    it('should handle empty values', () => {
      const values = [10, null, undefined, '', 20, 30]
      const result = detectVariableType('peso', values)

      expect(result.type).toBe(VariableType.QUANTITATIVE_CONTINUOUS)
    })

    it('should detect variable unit', () => {
      const pesoResult = detectVariableType('peso', [10, 20, 30])
      expect(pesoResult.unit).toBe('kg')

      const alturaResult = detectVariableType('altura', [150, 160, 170])
      expect(alturaResult.unit).toBe('cm')
    })
  })

  describe('calculateNumericStats', () => {
    it('should calculate basic statistics correctly', () => {
      const values = [10, 20, 30, 40, 50]
      const stats = calculateNumericStats(values)

      expect(stats.count).toBe(5)
      expect(stats.validCount).toBe(5)
      expect(stats.mean).toBe(30)
      expect(stats.median).toBe(30)
      expect(stats.min).toBe(10)
      expect(stats.max).toBe(50)
      expect(stats.range).toBe(40)
    })

    it('should calculate quartiles correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const stats = calculateNumericStats(values)

      expect(stats.q1).toBeCloseTo(3.25, 1)
      expect(stats.q3).toBeCloseTo(7.75, 1)
      expect(stats.iqr).toBeCloseTo(4.5, 1)
    })

    it('should detect outliers using IQR method', () => {
      const values = [10, 12, 13, 14, 15, 16, 17, 18, 100]
      const stats = calculateNumericStats(values)

      expect(stats.outliers.length).toBeGreaterThan(0)
      expect(stats.outliers).toContain(100)
    })

    it('should calculate coefficient of variation', () => {
      const values = [10, 20, 30, 40, 50]
      const stats = calculateNumericStats(values)

      expect(stats.cv).toBeGreaterThan(0)
      expect(stats.cv).toBeLessThan(100)
    })

    it('should calculate variance and standard deviation', () => {
      const values = [2, 4, 6, 8, 10]
      const stats = calculateNumericStats(values)

      expect(stats.variance).toBeGreaterThan(0)
      expect(stats.stdDev).toBeCloseTo(Math.sqrt(stats.variance), 4)
    })

    it('should handle string numbers with commas', () => {
      const values = ['10,5', '20,3', '30,7']
      const stats = calculateNumericStats(values)

      expect(stats.validCount).toBe(3)
      expect(stats.mean).toBeCloseTo(20.5, 1)
    })

    it('should calculate mode correctly', () => {
      const values = [1, 2, 2, 3, 3, 3, 4]
      const stats = calculateNumericStats(values)

      expect(stats.mode).toBe(3)
    })

    it('should handle even number of values for median', () => {
      const values = [10, 20, 30, 40]
      const stats = calculateNumericStats(values)

      expect(stats.median).toBe(25)
    })

    it('should throw error for empty numeric values', () => {
      const values = ['abc', 'def', null]

      expect(() => calculateNumericStats(values)).toThrow('Nenhum valor numérico válido')
    })

    it('should count missing values correctly', () => {
      const values = [10, null, 20, undefined, 30, '']
      const stats = calculateNumericStats(values)

      expect(stats.missingCount).toBeGreaterThan(0)
    })

    it('should calculate skewness for sufficient data', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const stats = calculateNumericStats(values)

      expect(stats.skewness).toBeDefined()
    })
  })

  describe('calculateCategoricalStats', () => {
    it('should calculate distribution correctly', () => {
      const values = ['A', 'B', 'A', 'C', 'B', 'A']
      const stats = calculateCategoricalStats(values)

      expect(stats.distribution['A']).toBe(3)
      expect(stats.distribution['B']).toBe(2)
      expect(stats.distribution['C']).toBe(1)
    })

    it('should calculate frequencies as percentages', () => {
      const values = ['A', 'A', 'B', 'B']
      const stats = calculateCategoricalStats(values)

      expect(stats.frequencies['A']).toBe(50)
      expect(stats.frequencies['B']).toBe(50)
    })

    it('should identify most and least common values', () => {
      const values = ['A', 'A', 'A', 'B', 'B', 'C']
      const stats = calculateCategoricalStats(values)

      expect(stats.mostCommon).toBe('A')
      expect(stats.leastCommon).toBe('C')
    })

    it('should count unique values', () => {
      const values = ['A', 'B', 'C', 'A', 'B']
      const stats = calculateCategoricalStats(values)

      expect(stats.uniqueValues).toBe(3)
    })

    it('should calculate entropy', () => {
      const values = ['A', 'B', 'C', 'D']
      const stats = calculateCategoricalStats(values)

      expect(stats.entropy).toBeGreaterThan(0)
    })

    it('should handle empty and null values', () => {
      const values = ['A', '', null, 'B', 'null', 'undefined']
      const stats = calculateCategoricalStats(values)

      expect(stats.validCount).toBe(2)
      expect(stats.missingCount).toBeGreaterThan(0)
    })

    it('should trim whitespace from values', () => {
      const values = ['  A  ', 'B', '  A']
      const stats = calculateCategoricalStats(values)

      expect(stats.distribution['A']).toBe(2)
    })
  })

  describe('analyzeDataset', () => {
    it('should analyze complete dataset', () => {
      const data = [
        { id: 1, peso: 450, raca: 'Nelore', idade: 24 },
        { id: 2, peso: 480, raca: 'Angus', idade: 26 },
        { id: 3, peso: 470, raca: 'Nelore', idade: 25 },
      ]

      const result = analyzeDataset(data)

      expect(result.totalRows).toBe(3)
      expect(result.totalColumns).toBe(4)
      expect(result.variablesInfo).toBeDefined()
      expect(result.numericStats).toBeDefined()
      expect(result.categoricalStats).toBeDefined()
    })

    it('should identify variable types correctly', () => {
      const data = [
        { id: 'A001', peso: 450, raca: 'Nelore' },
        { id: 'A002', peso: 480, raca: 'Angus' },
        { id: 'A003', peso: 460, raca: 'Nelore' },
        { id: 'A004', peso: 470, raca: 'Angus' },
      ]

      const result = analyzeDataset(data)

      expect(result.variablesInfo['id'].type).toBe(VariableType.IDENTIFIER)
      expect(result.variablesInfo['peso'].type).toBe(VariableType.QUANTITATIVE_CONTINUOUS)
      expect(result.variablesInfo['raca'].type).toBe(VariableType.QUALITATIVE_NOMINAL)
    })

    it('should calculate numeric stats for numeric columns', () => {
      const data = [{ peso: 100 }, { peso: 200 }, { peso: 300 }]

      const result = analyzeDataset(data)

      expect(result.numericStats['peso']).toBeDefined()
      expect(result.numericStats['peso'].mean).toBe(200)
    })

    it('should calculate categorical stats for categorical columns', () => {
      const data = [{ raca: 'Nelore' }, { raca: 'Angus' }, { raca: 'Nelore' }]

      const result = analyzeDataset(data)

      expect(result.categoricalStats['raca']).toBeDefined()
      expect(result.categoricalStats['raca'].mostCommon).toBe('Nelore')
    })

    it('should throw error for empty dataset', () => {
      expect(() => analyzeDataset([])).toThrow('Dataset vazio')
    })

    it('should handle errors in column analysis gracefully', () => {
      const data = [
        { col1: null, col2: undefined },
        { col1: null, col2: undefined },
      ]

      const result = analyzeDataset(data)

      expect(result.totalRows).toBe(2)
    })

    it('should analyze zootechnical variables', () => {
      const data = [
        { gpd: 1.2, conversao_alimentar: 7.5, peso_nascimento: 32 },
        { gpd: 1.4, conversao_alimentar: 7.0, peso_nascimento: 35 },
      ]

      const result = analyzeDataset(data)

      expect(result.variablesInfo['gpd'].isZootechnical).toBe(true)
      expect(result.variablesInfo['conversao_alimentar'].isZootechnical).toBe(true)
      expect(result.variablesInfo['peso_nascimento'].isZootechnical).toBe(true)
    })
  })
})
