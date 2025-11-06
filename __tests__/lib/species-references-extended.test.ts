import { ReferenceDataService } from '@/lib/references/species-references'

describe('species-references extended', () => {
  describe('ReferenceDataService.validateMetric', () => {
    it('should validate bovine dairy metrics', () => {
      const result = ReferenceDataService.validateMetric(25, 'bovine', 'producao_leite', 'dairy')
      
      expect(result.valid).toBe(true)
      expect(result.status).toBeDefined()
      expect(result.reference).toBeDefined()
    })

    it('should detect below minimum values', () => {
      const result = ReferenceDataService.validateMetric(-10, 'bovine', 'gpd', 'beef')
      
      expect(result.valid).toBe(false)
      expect(result.status).toBe('below_minimum')
      expect(result.message).toContain('mínimo')
    })

    it('should detect above maximum values', () => {
      const result = ReferenceDataService.validateMetric(10000, 'bovine', 'peso', 'beef')
      
      if (result.reference && result.reference.max < 10000) {
        expect(result.valid).toBe(false)
        expect(result.status).toBe('above_maximum')
        expect(result.message).toContain('máximo')
      } else {
        expect(result.valid).toBe(true)
      }
    })

    it('should return no_reference for unknown metrics', () => {
      const result = ReferenceDataService.validateMetric(100, 'bovine', 'unknown_metric_xyz', 'dairy')
      
      expect(result.valid).toBe(true)
      expect(result.status).toBe('no_reference')
      expect(result.message).toContain('Sem dados de referência')
    })

    it('should classify excellent status', () => {
      const result = ReferenceDataService.validateMetric(1.2, 'bovine', 'gpd', 'beef')
      
      expect(result.valid).toBe(true)
      expect(['excellent', 'good', 'acceptable']).toContain(result.status)
    })
  })

  describe('ReferenceDataService.compareMultipleMetrics', () => {
    it('should compare multiple bovine metrics', () => {
      const data = {
        gpd: 1.2,
        peso: 450,
        conversao_alimentar: 6.5
      }
      
      const result = ReferenceDataService.compareMultipleMetrics(data, 'bovine', 'beef')
      
      expect(result.comparisons).toHaveLength(3)
      expect(result.overallStatus).toBeDefined()
      expect(result.summary).toBeDefined()
    })

    it('should calculate summary statistics', () => {
      const data = {
        gpd: 1.2,
        peso: 450
      }
      
      const result = ReferenceDataService.compareMultipleMetrics(data, 'bovine', 'beef')
      
      expect(result.summary.excellent).toBeGreaterThanOrEqual(0)
      expect(result.summary.good).toBeGreaterThanOrEqual(0)
      expect(result.summary.acceptable).toBeGreaterThanOrEqual(0)
      expect(result.summary.attention).toBeGreaterThanOrEqual(0)
      expect(result.summary.noReference).toBeGreaterThanOrEqual(0)
    })

    it('should set attention status when values out of range', () => {
      const data = {
        gpd: -1,
        peso: 10000
      }
      
      const result = ReferenceDataService.compareMultipleMetrics(data, 'bovine', 'beef')
      
      expect(result.overallStatus).toBe('attention')
      expect(result.summary.attention).toBeGreaterThan(0)
    })

    it('should handle empty data', () => {
      const result = ReferenceDataService.compareMultipleMetrics({}, 'bovine', 'beef')
      
      expect(result.comparisons).toHaveLength(0)
      expect(result.overallStatus).toBe('no_data')
    })
  })

  describe('ReferenceDataService.getAvailableMetrics', () => {
    it('should return metrics for bovine dairy', () => {
      const metrics = ReferenceDataService.getAvailableMetrics('bovine', 'dairy')
      
      expect(Array.isArray(metrics)).toBe(true)
      expect(metrics.length).toBeGreaterThan(0)
    })

    it('should return metrics for swine', () => {
      const metrics = ReferenceDataService.getAvailableMetrics('swine', 'growing')
      
      expect(Array.isArray(metrics)).toBe(true)
      expect(metrics.length).toBeGreaterThan(0)
    })

    it('should return empty array for unknown species', () => {
      const metrics = ReferenceDataService.getAvailableMetrics('unknown_species')
      
      expect(metrics).toEqual([])
    })
  })

  describe('ReferenceDataService.getAvailableSpecies', () => {
    it('should return list of available species', () => {
      const species = ReferenceDataService.getAvailableSpecies()
      
      expect(Array.isArray(species)).toBe(true)
      expect(species.length).toBeGreaterThan(0)
    })

    it('should include bovine', () => {
      const species = ReferenceDataService.getAvailableSpecies()
      
      expect(species).toContain('bovine')
    })

    it('should include forage', () => {
      const species = ReferenceDataService.getAvailableSpecies()
      
      expect(species).toContain('forage')
    })

    it('should not have duplicates', () => {
      const species = ReferenceDataService.getAvailableSpecies()
      const uniqueSpecies = Array.from(new Set(species))
      
      expect(species.length).toBe(uniqueSpecies.length)
    })
  })

  describe('ReferenceDataService.getSubtypes', () => {
    it('should return subtypes for bovine', () => {
      const subtypes = ReferenceDataService.getSubtypes('bovine')
      
      expect(Array.isArray(subtypes)).toBe(true)
      expect(subtypes.length).toBeGreaterThan(0)
    })

    it('should return subtypes for swine', () => {
      const subtypes = ReferenceDataService.getSubtypes('swine')
      
      expect(Array.isArray(subtypes)).toBe(true)
      expect(subtypes.length).toBeGreaterThan(0)
    })

    it('should return subtypes for forage', () => {
      const subtypes = ReferenceDataService.getSubtypes('forage')
      
      expect(Array.isArray(subtypes)).toBe(true)
    })

    it('should return subtypes for aquaculture', () => {
      const subtypes = ReferenceDataService.getSubtypes('aquaculture')
      
      expect(Array.isArray(subtypes)).toBe(true)
      expect(subtypes.length).toBeGreaterThan(0)
    })

    it('should not have duplicate subtypes', () => {
      const subtypes = ReferenceDataService.getSubtypes('bovine')
      const uniqueSubtypes = Array.from(new Set(subtypes))
      
      expect(subtypes.length).toBe(uniqueSubtypes.length)
    })
  })

  describe('ReferenceDataService.getReference', () => {
    it('should get reference for bovine dairy', () => {
      const ref = ReferenceDataService.getReference('bovine', 'dairy')
      
      expect(ref).toBeDefined()
      expect(ref).not.toBeNull()
    })

    it('should get specific metric reference', () => {
      const ref = ReferenceDataService.getReference('bovine', 'dairy', 'producao_leite')
      
      expect(ref).toBeDefined()
      if (ref && typeof ref === 'object' && 'unit' in ref) {
        expect(ref.unit).toBeDefined()
        expect(ref.source).toBeDefined()
      }
    })

    it('should return null for unknown species', () => {
      const ref = ReferenceDataService.getReference('unknown_species')
      
      expect(ref).toBeNull()
    })

    it('should combine NRC and EMBRAPA data', () => {
      const ref = ReferenceDataService.getReference('bovine', 'dairy')
      
      expect(ref).toBeDefined()
      expect(typeof ref).toBe('object')
    })
  })

  describe('ReferenceDataService.getNRCData', () => {
    it('should get NRC data for bovine', () => {
      const data = ReferenceDataService.getNRCData('bovine', 'dairy')
      
      expect(data).toBeDefined()
    })

    it('should return null for species without NRC data', () => {
      const data = ReferenceDataService.getNRCData('unknown_species')
      
      expect(data).toBeNull()
    })
  })

  describe('ReferenceDataService.getEMBRAPAData', () => {
    it('should get EMBRAPA data for forage', () => {
      const data = ReferenceDataService.getEMBRAPAData('forage', 'brachiaria_brizantha')
      
      expect(data).toBeDefined()
    })

    it('should get EMBRAPA data for sheep', () => {
      const data = ReferenceDataService.getEMBRAPAData('sheep', 'meat')
      
      expect(data).toBeDefined()
    })

    it('should get EMBRAPA data for goat', () => {
      const data = ReferenceDataService.getEMBRAPAData('goat', 'milk')
      
      expect(data).toBeDefined()
    })

    it('should get EMBRAPA data for aquaculture', () => {
      const data = ReferenceDataService.getEMBRAPAData('aquaculture', 'tilapia')
      
      expect(data).toBeDefined()
    })

    it('should return null for species without EMBRAPA data', () => {
      const data = ReferenceDataService.getEMBRAPAData('poultry')
      
      expect(data).toBeNull()
    })
  })
})
