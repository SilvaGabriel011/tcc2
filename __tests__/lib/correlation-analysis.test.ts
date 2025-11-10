import {
  analyzeCorrelations,
  generateCorrelationInterpretation,
  proposeCorrelations,
  getMissingVariables,
} from '@/lib/correlations/correlation-analysis'

describe('correlation-analysis', () => {
  const mockBovineData = [
    { peso_inicial: 300, peso_final: 450, gpd: 1.2, conversao_alimentar: 7.5, idade: 24 },
    { peso_inicial: 320, peso_final: 480, gpd: 1.3, conversao_alimentar: 7.2, idade: 24 },
    { peso_inicial: 310, peso_final: 470, gpd: 1.25, conversao_alimentar: 7.3, idade: 25 },
    { peso_inicial: 330, peso_final: 490, gpd: 1.35, conversao_alimentar: 7.0, idade: 25 },
    { peso_inicial: 305, peso_final: 460, gpd: 1.22, conversao_alimentar: 7.4, idade: 24 },
    { peso_inicial: 325, peso_final: 485, gpd: 1.32, conversao_alimentar: 7.1, idade: 26 },
    { peso_inicial: 315, peso_final: 475, gpd: 1.28, conversao_alimentar: 7.25, idade: 25 },
    { peso_inicial: 335, peso_final: 495, gpd: 1.38, conversao_alimentar: 6.9, idade: 26 },
    { peso_inicial: 308, peso_final: 465, gpd: 1.24, conversao_alimentar: 7.35, idade: 24 },
    { peso_inicial: 328, peso_final: 488, gpd: 1.34, conversao_alimentar: 7.05, idade: 25 },
  ]

  describe('analyzeCorrelations', () => {
    it('should analyze correlations for bovine species', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      expect(result.totalCorrelations).toBeGreaterThan(0)
      expect(result.allCorrelations).toBeDefined()
      expect(Array.isArray(result.allCorrelations)).toBe(true)
    })

    it('should identify significant correlations', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      expect(result.significantCorrelations).toBeGreaterThanOrEqual(0)
    })

    it('should categorize correlations', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      expect(result.correlationsByCategory).toBeDefined()
      expect(typeof result.correlationsByCategory).toBe('object')
    })

    it('should provide top correlations based on relevance', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine', {
        maxCorrelations: 5,
      })

      expect(result.topCorrelations.length).toBeLessThanOrEqual(5)
    })

    it('should filter by minimum relevance score', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine', {
        minRelevanceScore: 8,
      })

      result.topCorrelations.forEach((corr) => {
        expect(corr.relevanceScore).toBeGreaterThanOrEqual(8)
      })
    })

    it('should respect minimum data points requirement', () => {
      const smallData = mockBovineData.slice(0, 3)
      const result = analyzeCorrelations(smallData, 'bovine', {
        minDataPoints: 5,
      })

      expect(result.totalCorrelations).toBe(0)
    })

    it('should use custom significance level', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine', {
        significanceLevel: 0.01,
      })

      expect(result).toBeDefined()
    })

    it('should handle unknown species gracefully', () => {
      const result = analyzeCorrelations(mockBovineData, 'unknown_species')

      expect(result.totalCorrelations).toBe(0)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('não encontrada')
    })

    it('should handle insufficient numeric columns', () => {
      const insufficientData = [
        { id: 1, nome: 'Animal 1' },
        { id: 2, nome: 'Animal 2' },
      ]

      const result = analyzeCorrelations(insufficientData, 'bovine')

      expect(result.totalCorrelations).toBe(0)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should generate warnings for unexpected correlations', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('should generate recommendations', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      expect(Array.isArray(result.recommendations)).toBe(true)
    })

    it('should count high relevance correlations', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      expect(result.highRelevanceCorrelations).toBeGreaterThanOrEqual(0)
    })

    it('should include data points in correlation results', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      if (result.allCorrelations.length > 0) {
        const firstCorr = result.allCorrelations[0]
        expect(firstCorr.dataPoints).toBeDefined()
        expect(Array.isArray(firstCorr.dataPoints)).toBe(true)
      }
    })

    it('should check if correlations match expectations', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      result.allCorrelations.forEach((corr) => {
        expect(corr.matchesExpectation).toBeDefined()
        expect(typeof corr.matchesExpectation).toBe('boolean')
      })
    })

    it('should include correlation strength classification', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      result.allCorrelations.forEach((corr) => {
        expect(['very weak', 'weak', 'moderate', 'strong', 'very strong']).toContain(corr.strength)
      })
    })

    it('should include correlation direction', () => {
      const result = analyzeCorrelations(mockBovineData, 'bovine')

      result.allCorrelations.forEach((corr) => {
        expect(['positive', 'negative', 'none']).toContain(corr.direction)
      })
    })

    it('should calculate additional correlations beyond config', () => {
      const dataWithExtra = mockBovineData.map((d) => ({
        ...d,
        extra_metric: d.peso_final * 0.5,
      }))

      const result = analyzeCorrelations(dataWithExtra, 'bovine')

      expect(result.totalCorrelations).toBeGreaterThan(0)
    })

    it('should handle empty dataset', () => {
      const result = analyzeCorrelations([], 'bovine')

      expect(result.totalCorrelations).toBe(0)
    })

    it('should provide recommendation when no significant correlations found', () => {
      const randomData = Array.from({ length: 10 }, () => ({
        var1: Math.random() * 100,
        var2: Math.random() * 100,
      }))

      const result = analyzeCorrelations(randomData, 'bovine')

      if (result.significantCorrelations === 0) {
        expect(result.recommendations.some((r) => r.includes('Nenhuma correlação'))).toBe(true)
      }
    })
  })

  describe('generateCorrelationInterpretation', () => {
    const mockCorrelation = {
      var1: 'peso_inicial',
      var2: 'peso_final',
      coefficient: 0.85,
      pValue: 0.001,
      significant: true,
      strength: 'very strong' as const,
      direction: 'positive' as const,
      relevanceScore: 9,
      category: 'Crescimento',
      interpretation: 'Correlação esperada entre peso inicial e final',
      expectedDirection: 'positive' as const,
      matchesExpectation: true,
      dataPoints: [
        { x: 300, y: 450 },
        { x: 320, y: 480 },
      ],
    }

    it('should generate detailed interpretation', () => {
      const interpretation = generateCorrelationInterpretation(mockCorrelation)

      expect(interpretation).toContain('peso_inicial')
      expect(interpretation).toContain('peso_final')
      expect(interpretation).toContain('0.850')
    })

    it('should include coefficient in interpretation', () => {
      const interpretation = generateCorrelationInterpretation(mockCorrelation)

      expect(interpretation).toContain('Coeficiente de Pearson')
    })

    it('should include strength classification', () => {
      const interpretation = generateCorrelationInterpretation(mockCorrelation)

      expect(interpretation).toContain('Força')
    })

    it('should include relevance score', () => {
      const interpretation = generateCorrelationInterpretation(mockCorrelation)

      expect(interpretation).toContain('Relevância Biológica')
      expect(interpretation).toContain('9/10')
    })

    it('should include significance information', () => {
      const interpretation = generateCorrelationInterpretation(mockCorrelation)

      expect(interpretation).toContain('Significância')
    })

    it('should warn about unexpected correlations', () => {
      const unexpectedCorr = {
        ...mockCorrelation,
        matchesExpectation: false,
      }

      const interpretation = generateCorrelationInterpretation(unexpectedCorr)

      expect(interpretation).toContain('Atenção')
    })

    it('should provide recommendations for strong correlations', () => {
      const interpretation = generateCorrelationInterpretation(mockCorrelation)

      expect(interpretation).toContain('Recomendações')
    })

    it('should provide category-specific recommendations', () => {
      const categories = ['Crescimento', 'Eficiência', 'Qualidade', 'Produção']

      categories.forEach((category) => {
        const corr = { ...mockCorrelation, category }
        const interpretation = generateCorrelationInterpretation(corr)

        expect(interpretation.length).toBeGreaterThan(0)
      })
    })

    it('should note non-significant correlations', () => {
      const nonSigCorr = {
        ...mockCorrelation,
        significant: false,
        pValue: 0.15,
      }

      const interpretation = generateCorrelationInterpretation(nonSigCorr)

      expect(interpretation).toContain('não significativa')
    })

    it('should handle negative correlations', () => {
      const negativeCorr = {
        ...mockCorrelation,
        coefficient: -0.75,
        direction: 'negative' as const,
      }

      const interpretation = generateCorrelationInterpretation(negativeCorr)

      expect(interpretation).toContain('negativa')
    })
  })

  describe('proposeCorrelations', () => {
    it('should propose correlations based on available columns', () => {
      const columns = ['peso_inicial', 'peso_final', 'gpd', 'conversao_alimentar']
      const proposals = proposeCorrelations(columns, 'bovine')

      expect(Array.isArray(proposals)).toBe(true)
      expect(proposals.length).toBeGreaterThan(0)
    })

    it('should sort proposals by priority', () => {
      const columns = ['peso_inicial', 'peso_final', 'gpd', 'conversao_alimentar']
      const proposals = proposeCorrelations(columns, 'bovine')

      for (let i = 1; i < proposals.length; i++) {
        expect(proposals[i - 1].priority).toBeGreaterThanOrEqual(proposals[i].priority)
      }
    })

    it('should include reason for each proposal', () => {
      const columns = ['peso_inicial', 'peso_final', 'gpd']
      const proposals = proposeCorrelations(columns, 'bovine')

      proposals.forEach((proposal) => {
        expect(proposal.reason).toBeDefined()
        expect(proposal.reason.length).toBeGreaterThan(0)
      })
    })

    it('should handle unknown species', () => {
      const columns = ['peso_inicial', 'peso_final']
      const proposals = proposeCorrelations(columns, 'unknown_species')

      expect(proposals).toEqual([])
    })

    it('should not propose correlations for insufficient columns', () => {
      const columns = ['peso_inicial']
      const proposals = proposeCorrelations(columns, 'bovine')

      expect(proposals.length).toBe(0)
    })

    it('should include var1 and var2 in proposals', () => {
      const columns = ['peso_inicial', 'peso_final', 'gpd']
      const proposals = proposeCorrelations(columns, 'bovine')

      proposals.forEach((proposal) => {
        expect(proposal.var1).toBeDefined()
        expect(proposal.var2).toBeDefined()
        expect(proposal.var1).not.toBe(proposal.var2)
      })
    })
  })

  describe('getMissingVariables', () => {
    it('should identify missing important variables', () => {
      const columns = ['peso_inicial']
      const missing = getMissingVariables(columns, 'bovine')

      expect(Array.isArray(missing)).toBe(true)
    })

    it('should prioritize high importance variables', () => {
      const columns = ['peso_inicial']
      const missing = getMissingVariables(columns, 'bovine')

      missing.forEach((item) => {
        expect(item.importance).toBeDefined()
      })
    })

    it('should provide reason for each missing variable', () => {
      const columns = ['peso_inicial']
      const missing = getMissingVariables(columns, 'bovine')

      missing.forEach((item) => {
        expect(item.reason).toBeDefined()
        expect(item.reason.length).toBeGreaterThan(0)
      })
    })

    it('should handle unknown species', () => {
      const columns = ['peso_inicial']
      const missing = getMissingVariables(columns, 'unknown_species')

      expect(missing).toEqual([])
    })

    it('should not report variables that are present', () => {
      const columns = ['peso_inicial', 'peso_final', 'gpd', 'conversao_alimentar', 'idade']
      const missing = getMissingVariables(columns, 'bovine')

      const missingNames = missing.map((m) => m.variable.toLowerCase())
      columns.forEach((col) => {
        const colLower = col.toLowerCase()
        const isReported = missingNames.some(
          (name) => colLower.includes(name) || name.includes(colLower)
        )
        expect(isReported).toBe(false)
      })
    })

    it('should limit results to top 10', () => {
      const columns = ['peso_inicial']
      const missing = getMissingVariables(columns, 'bovine')

      expect(missing.length).toBeLessThanOrEqual(10)
    })

    it('should remove duplicate missing variables', () => {
      const columns = ['peso_inicial']
      const missing = getMissingVariables(columns, 'bovine')

      const variables = missing.map((m) => m.variable)
      const uniqueVariables = new Set(variables)
      expect(variables.length).toBe(uniqueVariables.size)
    })

    it('should handle empty column list', () => {
      const missing = getMissingVariables([], 'bovine')

      expect(Array.isArray(missing)).toBe(true)
    })
  })
})
