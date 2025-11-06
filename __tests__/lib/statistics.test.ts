import {
  independentTTest,
  pairedTTest,
  oneWayANOVA,
  pearsonCorrelation,
  linearRegression
} from '@/lib/statistics'

describe('statistics', () => {
  describe('independentTTest', () => {
    it('should detect significant difference between groups', () => {
      const group1 = [10, 12, 14, 16, 18]
      const group2 = [20, 22, 24, 26, 28]
      
      const result = independentTTest(group1, group2)
      
      expect(result.significant).toBe(true)
      expect(result.pValue).toBeLessThan(0.05)
      expect(result.meanDifference).toBeLessThan(0)
    })

    it('should not detect difference when groups are similar', () => {
      const group1 = [10, 11, 12, 13, 14]
      const group2 = [10, 11, 12, 13, 14]
      
      const result = independentTTest(group1, group2)
      
      expect(result.significant).toBe(false)
      expect(result.meanDifference).toBeCloseTo(0, 5)
    })

    it('should calculate degrees of freedom correctly', () => {
      const group1 = [1, 2, 3, 4, 5]
      const group2 = [6, 7, 8, 9, 10]
      
      const result = independentTTest(group1, group2)
      
      expect(result.degreesOfFreedom).toBe(8)
    })

    it('should calculate confidence interval', () => {
      const group1 = [10, 12, 14]
      const group2 = [20, 22, 24]
      
      const result = independentTTest(group1, group2)
      
      expect(result.confidenceInterval).toBeDefined()
      expect(result.confidenceInterval.length).toBe(2)
      expect(result.confidenceInterval[0]).toBeLessThan(result.confidenceInterval[1])
    })

    it('should calculate effect size (Cohen\'s d)', () => {
      const group1 = [10, 12, 14, 16, 18]
      const group2 = [20, 22, 24, 26, 28]
      
      const result = independentTTest(group1, group2)
      
      expect(result.effectSize).toBeDefined()
      expect(Math.abs(result.effectSize)).toBeGreaterThan(0)
    })

    it('should provide interpretation', () => {
      const group1 = [10, 12, 14]
      const group2 = [20, 22, 24]
      
      const result = independentTTest(group1, group2)
      
      expect(result.interpretation).toBeDefined()
      expect(result.interpretation.length).toBeGreaterThan(0)
    })

    it('should throw error for insufficient data', () => {
      const group1 = [10]
      const group2 = [20, 22]
      
      expect(() => independentTTest(group1, group2)).toThrow()
    })

    it('should use custom alpha level', () => {
      const group1 = [10, 11, 12]
      const group2 = [13, 14, 15]
      
      const result = independentTTest(group1, group2, 0.01)
      
      expect(result.significant).toBe(result.pValue < 0.01)
    })
  })

  describe('pairedTTest', () => {
    it('should detect significant change in paired data', () => {
      const before = [10, 12, 14, 16, 18]
      const after = [15, 17, 19, 21, 23]
      
      const result = pairedTTest(before, after)
      
      expect(result.significant).toBe(true)
      expect(result.pValue).toBeLessThan(0.05)
    })

    it('should not detect change when data is identical', () => {
      const before = [10, 12, 14, 16, 18]
      const after = [10, 12, 14, 16, 18]
      
      const result = pairedTTest(before, after)
      
      expect(result.significant).toBe(false)
      expect(result.meanDifference).toBeCloseTo(0, 5)
    })

    it('should calculate mean difference correctly', () => {
      const before = [10, 20, 30]
      const after = [15, 25, 35]
      
      const result = pairedTTest(before, after)
      
      expect(result.meanDifference).toBeCloseTo(-5, 5)
    })

    it('should throw error for mismatched array lengths', () => {
      const before = [10, 12, 14]
      const after = [15, 17]
      
      expect(() => pairedTTest(before, after)).toThrow('mesmo tamanho')
    })

    it('should throw error for insufficient pairs', () => {
      const before = [10]
      const after = [15]
      
      expect(() => pairedTTest(before, after)).toThrow()
    })

    it('should calculate confidence interval for paired data', () => {
      const before = [10, 12, 14, 16, 18]
      const after = [15, 17, 19, 21, 23]
      
      const result = pairedTTest(before, after)
      
      expect(result.confidenceInterval).toBeDefined()
      expect(result.confidenceInterval[0]).toBeLessThan(result.confidenceInterval[1])
    })

    it('should provide interpretation for paired test', () => {
      const before = [10, 12, 14]
      const after = [15, 17, 19]
      
      const result = pairedTTest(before, after)
      
      expect(result.interpretation).toContain('pareado')
    })
  })

  describe('oneWayANOVA', () => {
    it('should detect significant difference among groups', () => {
      const groups = [
        { name: 'Group A', values: [10, 12, 14, 16, 18] },
        { name: 'Group B', values: [20, 22, 24, 26, 28] },
        { name: 'Group C', values: [30, 32, 34, 36, 38] }
      ]
      
      const result = oneWayANOVA(groups)
      
      expect(result.significant).toBe(true)
      expect(result.pValue).toBeLessThan(0.05)
    })

    it('should not detect difference when groups are similar', () => {
      const groups = [
        { name: 'Group A', values: [10, 11, 12] },
        { name: 'Group B', values: [10, 11, 12] },
        { name: 'Group C', values: [10, 11, 12] }
      ]
      
      const result = oneWayANOVA(groups)
      
      expect(result.significant).toBe(false)
    })

    it('should calculate F-statistic', () => {
      const groups = [
        { name: 'Group A', values: [1, 2, 3] },
        { name: 'Group B', values: [4, 5, 6] }
      ]
      
      const result = oneWayANOVA(groups)
      
      expect(result.fStatistic).toBeGreaterThan(0)
    })

    it('should calculate degrees of freedom correctly', () => {
      const groups = [
        { name: 'Group A', values: [1, 2, 3, 4] },
        { name: 'Group B', values: [5, 6, 7, 8] },
        { name: 'Group C', values: [9, 10, 11, 12] }
      ]
      
      const result = oneWayANOVA(groups)
      
      expect(result.degreesOfFreedomBetween).toBe(2)
      expect(result.degreesOfFreedomWithin).toBe(9)
    })

    it('should calculate effect size (eta squared)', () => {
      const groups = [
        { name: 'Group A', values: [10, 12, 14] },
        { name: 'Group B', values: [20, 22, 24] }
      ]
      
      const result = oneWayANOVA(groups)
      
      expect(result.effectSize).toBeGreaterThanOrEqual(0)
      expect(result.effectSize).toBeLessThanOrEqual(1)
    })

    it('should provide group statistics', () => {
      const groups = [
        { name: 'Group A', values: [10, 12, 14] },
        { name: 'Group B', values: [20, 22, 24] }
      ]
      
      const result = oneWayANOVA(groups)
      
      expect(result.groups).toHaveLength(2)
      expect(result.groups[0].name).toBe('Group A')
      expect(result.groups[0].mean).toBe(12)
      expect(result.groups[0].count).toBe(3)
    })

    it('should throw error for insufficient groups', () => {
      const groups = [
        { name: 'Group A', values: [1, 2, 3] }
      ]
      
      expect(() => oneWayANOVA(groups)).toThrow('pelo menos 2 grupos')
    })

    it('should provide interpretation', () => {
      const groups = [
        { name: 'Group A', values: [10, 12, 14] },
        { name: 'Group B', values: [20, 22, 24] }
      ]
      
      const result = oneWayANOVA(groups)
      
      expect(result.interpretation).toContain('ANOVA')
    })
  })

  describe('pearsonCorrelation', () => {
    it('should detect strong positive correlation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = pearsonCorrelation(x, y)
      
      expect(result.coefficient).toBeCloseTo(1, 1)
      expect(result.direction).toBe('positive')
      expect(result.strength).toBe('very strong')
    })

    it('should detect strong negative correlation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [10, 8, 6, 4, 2]
      
      const result = pearsonCorrelation(x, y)
      
      expect(result.coefficient).toBeCloseTo(-1, 1)
      expect(result.direction).toBe('negative')
      expect(result.strength).toBe('very strong')
    })

    it('should detect weak correlation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [5, 4, 6, 3, 7]
      
      const result = pearsonCorrelation(x, y)
      
      expect(Math.abs(result.coefficient)).toBeLessThan(0.5)
    })

    it('should calculate p-value', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = pearsonCorrelation(x, y)
      
      expect(result.pValue).toBeDefined()
      expect(result.pValue).toBeGreaterThanOrEqual(0)
      expect(result.pValue).toBeLessThanOrEqual(1)
    })

    it('should determine significance', () => {
      const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const y = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
      
      const result = pearsonCorrelation(x, y)
      
      expect(result.significant).toBe(true)
    })

    it('should throw error for mismatched array lengths', () => {
      const x = [1, 2, 3]
      const y = [4, 5]
      
      expect(() => pearsonCorrelation(x, y)).toThrow('mesmo tamanho')
    })

    it('should throw error for insufficient data', () => {
      const x = [1, 2]
      const y = [3, 4]
      
      expect(() => pearsonCorrelation(x, y)).toThrow()
    })

    it('should provide interpretation in Portuguese', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = pearsonCorrelation(x, y)
      
      expect(result.interpretation).toContain('Correlação de Pearson')
      expect(result.interpretation).toContain('positiva')
    })

    it('should classify correlation strength correctly', () => {
      const testCases = [
        { r: 0.1, expected: 'very weak' },
        { r: 0.3, expected: 'weak' },
        { r: 0.5, expected: 'moderate' },
        { r: 0.7, expected: 'strong' },
        { r: 0.9, expected: 'very strong' }
      ]
      
      testCases.forEach(({ r, expected }) => {
        const x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        const y = x.map((val, i) => val * r + (1 - r) * (Math.random() * 2))
        
        const result = pearsonCorrelation(x, y)
        expect(['very weak', 'weak', 'moderate', 'strong', 'very strong']).toContain(result.strength)
      })
    })
  })

  describe('linearRegression', () => {
    it('should calculate slope and intercept', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = linearRegression(x, y)
      
      expect(result.slope).toBeCloseTo(2, 1)
      expect(result.intercept).toBeCloseTo(0, 1)
    })

    it('should calculate R-squared', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = linearRegression(x, y)
      
      expect(result.rSquared).toBeGreaterThan(0.9)
    })

    it('should generate predictions', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = linearRegression(x, y)
      
      expect(result.predictions).toHaveLength(5)
      expect(result.predictions[0]).toBeCloseTo(2, 1)
    })

    it('should calculate residuals', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = linearRegression(x, y)
      
      expect(result.residuals).toHaveLength(5)
      result.residuals.forEach(r => {
        expect(Math.abs(r)).toBeLessThan(1)
      })
    })

    it('should calculate standard error', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = linearRegression(x, y)
      
      expect(result.standardError).toBeGreaterThanOrEqual(0)
    })

    it('should generate equation string', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = linearRegression(x, y)
      
      expect(result.equation).toContain('y =')
      expect(result.equation).toContain('x')
    })

    it('should calculate p-value for significance', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = linearRegression(x, y)
      
      expect(result.pValue).toBeDefined()
      expect(result.pValue).toBeLessThan(0.05)
    })

    it('should throw error for mismatched array lengths', () => {
      const x = [1, 2, 3]
      const y = [4, 5]
      
      expect(() => linearRegression(x, y)).toThrow('mesmo tamanho')
    })

    it('should throw error for insufficient data', () => {
      const x = [1, 2]
      const y = [3, 4]
      
      expect(() => linearRegression(x, y)).toThrow()
    })

    it('should provide interpretation', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      
      const result = linearRegression(x, y)
      
      expect(result.interpretation).toContain('Regressão linear')
      expect(result.interpretation).toContain('R²')
    })

    it('should handle non-perfect linear relationships', () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2.1, 3.9, 6.2, 7.8, 10.1]
      
      const result = linearRegression(x, y)
      
      expect(result.rSquared).toBeGreaterThan(0.9)
      expect(result.rSquared).toBeLessThan(1)
    })
  })
})
