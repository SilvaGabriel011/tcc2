import { gerarDiagnosticoLocal } from '@/lib/diagnostico-local'
import type { NumericStats } from '@/types/api'

describe('diagnostico-local', () => {
  describe('gerarDiagnosticoLocal', () => {
    const mockNumericStats: Record<string, NumericStats> = {
      peso_nascimento: {
        count: 100,
        validCount: 100,
        missingCount: 0,
        mean: 32,
        median: 32,
        stdDev: 3,
        variance: 9,
        min: 28,
        max: 38,
        range: 10,
        q1: 30,
        q3: 34,
        iqr: 4,
        cv: 9.375,
        outliers: [],
      },
      gpd: {
        count: 100,
        validCount: 100,
        missingCount: 0,
        mean: 1.2,
        median: 1.2,
        stdDev: 0.2,
        variance: 0.04,
        min: 0.8,
        max: 1.6,
        range: 0.8,
        q1: 1.0,
        q3: 1.4,
        iqr: 0.4,
        cv: 16.67,
        outliers: [],
      },
    }

    const mockCategoricalStats = {
      raca: {
        uniqueValues: 3,
        mode: 'Nelore',
      },
    }

    it('should generate diagnostic report with all sections', () => {
      const result = gerarDiagnosticoLocal(
        mockNumericStats,
        mockCategoricalStats,
        'Test Dataset',
        100
      )

      expect(result.resumoExecutivo).toBeDefined()
      expect(result.analiseNumericas).toBeDefined()
      expect(result.analiseCategoricas).toBeDefined()
      expect(result.pontosFortes).toBeDefined()
      expect(result.pontosAtencao).toBeDefined()
      expect(result.recomendacoesPrioritarias).toBeDefined()
      expect(result.conclusao).toBeDefined()
      expect(result.fontes).toBeDefined()
    })

    it('should identify excellent performance metrics', () => {
      const result = gerarDiagnosticoLocal(
        mockNumericStats,
        mockCategoricalStats,
        'Test Dataset',
        100
      )

      const pesoAnalysis = result.analiseNumericas.find((a) => a.variavel === 'peso_nascimento')
      expect(pesoAnalysis).toBeDefined()
      expect(pesoAnalysis?.status).toBe('Excelente')
    })

    it('should identify problematic metrics', () => {
      const problematicStats: Record<string, NumericStats> = {
        gpd: {
          count: 100,
          validCount: 100,
          missingCount: 0,
          mean: 0.3,
          median: 0.3,
          stdDev: 0.1,
          variance: 0.01,
          min: 0.2,
          max: 0.4,
          range: 0.2,
          q1: 0.25,
          q3: 0.35,
          iqr: 0.1,
          cv: 33.33,
          outliers: [],
        },
      }

      const result = gerarDiagnosticoLocal(problematicStats, {}, 'Test Dataset', 100)

      const gpdAnalysis = result.analiseNumericas.find((a) => a.variavel === 'gpd')
      expect(gpdAnalysis?.status).toBe('Preocupante')
      expect(result.pontosAtencao.length).toBeGreaterThan(0)
    })

    it('should evaluate coefficient of variation', () => {
      const highCVStats: Record<string, NumericStats> = {
        peso_final: {
          count: 100,
          validCount: 100,
          missingCount: 0,
          mean: 450,
          median: 450,
          stdDev: 180,
          variance: 32400,
          min: 200,
          max: 700,
          range: 500,
          q1: 350,
          q3: 550,
          iqr: 200,
          cv: 40,
          outliers: [],
        },
      }

      const result = gerarDiagnosticoLocal(highCVStats, {}, 'Test Dataset', 100)

      const pesoAnalysis = result.analiseNumericas.find((a) => a.variavel === 'peso_final')
      expect(pesoAnalysis?.status).toBe('Preocupante')
    })

    it('should classify CV as excellent when below 15%', () => {
      const excellentCVStats: Record<string, NumericStats> = {
        peso_uniforme: {
          count: 100,
          validCount: 100,
          missingCount: 0,
          mean: 450,
          median: 450,
          stdDev: 45,
          variance: 2025,
          min: 400,
          max: 500,
          range: 100,
          q1: 425,
          q3: 475,
          iqr: 50,
          cv: 10,
          outliers: [],
        },
      }

      const result = gerarDiagnosticoLocal(excellentCVStats, {}, 'Test Dataset', 100)

      const analysis = result.analiseNumericas.find((a) => a.variavel === 'peso_uniforme')
      expect(analysis?.status).toBe('Excelente')
    })

    it('should generate priority recommendations for problematic variables', () => {
      const problematicStats: Record<string, NumericStats> = {
        gpd: {
          count: 100,
          validCount: 100,
          missingCount: 0,
          mean: 0.3,
          median: 0.3,
          stdDev: 0.1,
          variance: 0.01,
          min: 0.2,
          max: 0.4,
          range: 0.2,
          q1: 0.25,
          q3: 0.35,
          iqr: 0.1,
          cv: 33.33,
          outliers: [],
        },
      }

      const result = gerarDiagnosticoLocal(problematicStats, {}, 'Test Dataset', 100)

      expect(result.recomendacoesPrioritarias.length).toBeGreaterThan(0)
      const criticalRec = result.recomendacoesPrioritarias.find(
        (r) => r.titulo === 'Corrigir Indicadores Críticos'
      )
      expect(criticalRec).toBeDefined()
    })

    it('should recommend nutritional review for weight/gpd issues', () => {
      const weightIssueStats: Record<string, NumericStats> = {
        peso_desmame_210d: {
          count: 100,
          validCount: 100,
          missingCount: 0,
          mean: 150,
          median: 150,
          stdDev: 20,
          variance: 400,
          min: 120,
          max: 180,
          range: 60,
          q1: 140,
          q3: 160,
          iqr: 20,
          cv: 13.33,
          outliers: [],
        },
      }

      const result = gerarDiagnosticoLocal(weightIssueStats, {}, 'Test Dataset', 100)

      const nutritionRec = result.recomendacoesPrioritarias.find(
        (r) => r.titulo === 'Revisar Programa Nutricional'
      )
      expect(nutritionRec).toBeDefined()
    })

    it('should always include monitoring protocol recommendation', () => {
      const result = gerarDiagnosticoLocal(
        mockNumericStats,
        mockCategoricalStats,
        'Test Dataset',
        100
      )

      const monitoringRec = result.recomendacoesPrioritarias.find(
        (r) => r.titulo === 'Estabelecer Protocolo de Monitoramento'
      )
      expect(monitoringRec).toBeDefined()
    })

    it('should include sources in the report', () => {
      const result = gerarDiagnosticoLocal(
        mockNumericStats,
        mockCategoricalStats,
        'Test Dataset',
        100
      )

      expect(result.fontes.length).toBeGreaterThan(0)
      expect(result.fontes.some((f) => f.includes('EMBRAPA') || f.includes('NRC'))).toBe(true)
    })

    it('should analyze categorical variables', () => {
      const result = gerarDiagnosticoLocal(
        mockNumericStats,
        mockCategoricalStats,
        'Test Dataset',
        100
      )

      expect(result.analiseCategoricas.length).toBeGreaterThan(0)
      const racaAnalysis = result.analiseCategoricas.find((a) => a.variavel === 'raca')
      expect(racaAnalysis).toBeDefined()
    })

    it('should generate executive summary with dataset info', () => {
      const result = gerarDiagnosticoLocal(
        mockNumericStats,
        mockCategoricalStats,
        'Test Dataset',
        100
      )

      expect(result.resumoExecutivo).toContain('100')
      expect(result.resumoExecutivo).toContain('Test Dataset')
    })

    it('should generate positive conclusion for excellent performance', () => {
      const excellentStats: Record<string, NumericStats> = {
        peso_nascimento: mockNumericStats.peso_nascimento,
        gpd: mockNumericStats.gpd,
        conversao_alimentar: {
          count: 100,
          validCount: 100,
          missingCount: 0,
          mean: 7.5,
          median: 7.5,
          stdDev: 0.5,
          variance: 0.25,
          min: 6.5,
          max: 8.5,
          range: 2,
          q1: 7.0,
          q3: 8.0,
          iqr: 1,
          cv: 6.67,
          outliers: [],
        },
      }

      const result = gerarDiagnosticoLocal(excellentStats, {}, 'Test Dataset', 100)

      expect(result.conclusao).toContain('satisfatório')
    })

    it('should handle empty categorical stats', () => {
      const result = gerarDiagnosticoLocal(mockNumericStats, {}, 'Test Dataset', 100)

      expect(result.analiseCategoricas).toBeDefined()
      expect(Array.isArray(result.analiseCategoricas)).toBe(true)
    })

    it('should identify conversao_alimentar metrics', () => {
      const conversionStats: Record<string, NumericStats> = {
        conversao_alimentar: {
          count: 100,
          validCount: 100,
          missingCount: 0,
          mean: 7.5,
          median: 7.5,
          stdDev: 0.5,
          variance: 0.25,
          min: 6.5,
          max: 8.5,
          range: 2,
          q1: 7.0,
          q3: 8.0,
          iqr: 1,
          cv: 6.67,
          outliers: [],
        },
      }

      const result = gerarDiagnosticoLocal(conversionStats, {}, 'Test Dataset', 100)

      const analysis = result.analiseNumericas.find((a) => a.variavel === 'conversao_alimentar')
      expect(analysis).toBeDefined()
      expect(analysis?.comparacaoLiteratura).toContain('ASBIA')
    })

    it('should provide default points when no issues found', () => {
      const perfectStats: Record<string, NumericStats> = {
        peso_nascimento: mockNumericStats.peso_nascimento,
      }

      const result = gerarDiagnosticoLocal(perfectStats, {}, 'Test Dataset', 100)

      if (result.pontosFortes.length === 0) {
        expect(result.pontosFortes).toContain('Dados organizados e analisáveis')
      }
    })
  })
})
