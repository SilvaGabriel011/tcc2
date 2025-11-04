// lib/references/species-references.ts
import { NRC_REFERENCES } from './nrc-data'
import { EMBRAPA_REFERENCES } from './embrapa-data'

export interface ReferenceMetric {
  min: number
  ideal_min?: number
  ideal_max?: number
  ideal?: number
  max: number
  unit: string
  source: string
}

export class ReferenceDataService {
  /**
   * Busca dados de referência combinando NRC e EMBRAPA
   */
  static getReference(
    species: string, 
    subtype?: string, 
    metric?: string
  ): Record<string, ReferenceMetric> | ReferenceMetric | null {
    const nrcData = this.getNRCData(species, subtype)
    const embrapaData = this.getEMBRAPAData(species, subtype)
    
    // Combina as duas fontes, priorizando EMBRAPA para dados brasileiros
    const combined: Record<string, ReferenceMetric> = {}
    
    // Adiciona dados NRC
    if (nrcData) {
      Object.entries(nrcData).forEach(([key, value]: [string, any]) => {
        combined[key] = {
          min: value.min,
          ideal_min: value.ideal_min,
          ideal_max: value.ideal_max,
          max: value.max,
          unit: value.unit,
          source: value.source
        }
      })
    }
    
    // Adiciona/sobrescreve com dados EMBRAPA
    if (embrapaData) {
      Object.entries(embrapaData).forEach(([key, value]: [string, any]) => {
        if (value.ideal !== undefined) {
          // Formato EMBRAPA (min, ideal, max)
          combined[key] = {
            min: value.min,
            ideal_min: value.ideal * 0.95, // Range de 5% abaixo do ideal
            ideal: value.ideal,
            ideal_max: value.ideal * 1.05, // Range de 5% acima do ideal
            max: value.max,
            unit: value.unit,
            source: value.source
          }
        } else if (value.ideal_min !== undefined) {
          // Formato NRC (min, ideal_min, ideal_max, max)
          combined[key] = value
        }
      })
    }
    
    // Se não encontrou dados, retorna null
    if (Object.keys(combined).length === 0) {
      return null
    }
    
    // Se solicitou uma métrica específica
    if (metric) {
      return combined[metric] || null
    }
    
    return combined
  }
  
  /**
   * Busca dados específicos do NRC
   */
  static getNRCData(species: string, subtype?: string): any {
    const speciesData = NRC_REFERENCES[species]
    if (!speciesData) return null
    
    if (subtype && speciesData[subtype]) {
      return speciesData[subtype]
    }
    
    // Se não tem subtipo, retorna todos os subtipos
    return speciesData
  }
  
  /**
   * Busca dados específicos da EMBRAPA
   */
  static getEMBRAPAData(species: string, subtype?: string): any {
    // EMBRAPA tem estrutura diferente para algumas espécies
    
    // Forragem
    if (species === 'forage') {
      const forageData = EMBRAPA_REFERENCES.forage
      if (subtype) {
        // subtype pode ser 'brachiaria', 'panicum', etc
        const [type, variety] = subtype.split('_')
        if (forageData[type]) {
          if (variety && forageData[type][variety]) {
            return forageData[type][variety]
          }
          return forageData[type]
        }
      }
      return forageData
    }
    
    // Ovinos e Caprinos
    if (species === 'sheep' || species === 'goat') {
      const sgData = EMBRAPA_REFERENCES.sheep_goat
      const embrapaSpecies = species === 'sheep' ? 'ovinos' : 'caprinos'
      return sgData[embrapaSpecies] || null
    }
    
    // Piscicultura
    if (species === 'aquaculture') {
      const aquaData = EMBRAPA_REFERENCES.aquaculture
      if (subtype && aquaData[subtype]) {
        return aquaData[subtype]
      }
      return aquaData
    }
    
    return null
  }
  
  /**
   * Valida se um valor está dentro dos parâmetros de referência
   */
  static validateMetric(
    value: number, 
    species: string, 
    metric: string, 
    subtype?: string
  ): {
    valid: boolean
    status: 'no_reference' | 'below_minimum' | 'above_maximum' | 'acceptable' | 'good' | 'excellent'
    reference?: ReferenceMetric
    message: string
  } {
    const reference = this.getReference(species, subtype, metric) as ReferenceMetric
    
    if (!reference) {
      return {
        valid: true,
        status: 'no_reference',
        message: 'Sem dados de referência disponíveis'
      }
    }
    
    if (value < reference.min) {
      return {
        valid: false,
        status: 'below_minimum',
        reference,
        message: `Valor abaixo do mínimo (${reference.min} ${reference.unit})`
      }
    }
    
    if (value > reference.max) {
      return {
        valid: false,
        status: 'above_maximum',
        reference,
        message: `Valor acima do máximo (${reference.max} ${reference.unit})`
      }
    }
    
    // Determinar status baseado nos valores ideais
    let status: 'acceptable' | 'good' | 'excellent' = 'acceptable'
    
    if (reference.ideal_min && reference.ideal_max) {
      if (value >= reference.ideal_min && value <= reference.ideal_max) {
        status = 'excellent'
      } else {
        status = 'good'
      }
    } else if (reference.ideal) {
      // Para dados EMBRAPA com valor ideal único
      const tolerance = reference.ideal * 0.1 // 10% de tolerância
      if (Math.abs(value - reference.ideal) <= tolerance) {
        status = 'excellent'
      } else {
        status = 'good'
      }
    }
    
    return {
      valid: true,
      status,
      reference,
      message: `Valor dentro dos parâmetros (${status})`
    }
  }
  
  /**
   * Retorna todas as métricas disponíveis para uma espécie/subtipo
   */
  static getAvailableMetrics(species: string, subtype?: string): string[] {
    const references = this.getReference(species, subtype)
    
    if (!references || typeof references !== 'object') {
      return []
    }
    
    return Object.keys(references)
  }
  
  /**
   * Retorna lista de espécies disponíveis
   */
  static getAvailableSpecies(): string[] {
    const nrcSpecies = Object.keys(NRC_REFERENCES)
    const embrapaSpecies = ['forage', 'sheep', 'goat', 'aquaculture']
    
    // Combina e remove duplicatas
    return [...new Set([...nrcSpecies, ...embrapaSpecies])]
  }
  
  /**
   * Retorna lista de subtipos para uma espécie
   */
  static getSubtypes(species: string): string[] {
    const subtypes: string[] = []
    
    // NRC
    const nrcData = NRC_REFERENCES[species]
    if (nrcData && typeof nrcData === 'object') {
      subtypes.push(...Object.keys(nrcData))
    }
    
    // EMBRAPA
    if (species === 'forage') {
      Object.keys(EMBRAPA_REFERENCES.forage).forEach(type => {
        const varieties = EMBRAPA_REFERENCES.forage[type]
        if (typeof varieties === 'object') {
          Object.keys(varieties).forEach(variety => {
            subtypes.push(`${type}_${variety}`)
          })
        }
      })
    } else if (species === 'aquaculture') {
      subtypes.push(...Object.keys(EMBRAPA_REFERENCES.aquaculture))
    }
    
    return [...new Set(subtypes)]
  }
  
  /**
   * Compara múltiplas métricas com referências
   */
  static compareMultipleMetrics(
    data: Record<string, number>,
    species: string,
    subtype?: string
  ): {
    comparisons: Array<{
      metric: string
      value: number
      validation: ReturnType<typeof ReferenceDataService.validateMetric>
    }>
    overallStatus: 'excellent' | 'good' | 'attention' | 'no_data'
    summary: {
      excellent: number
      good: number
      acceptable: number
      attention: number
      noReference: number
    }
  } {
    const comparisons: any[] = []
    const summary = {
      excellent: 0,
      good: 0,
      acceptable: 0,
      attention: 0,
      noReference: 0
    }
    
    Object.entries(data).forEach(([metric, value]) => {
      const validation = this.validateMetric(value, species, metric, subtype)
      
      comparisons.push({
        metric,
        value,
        validation
      })
      
      // Atualizar sumário
      switch (validation.status) {
        case 'excellent':
          summary.excellent++
          break
        case 'good':
          summary.good++
          break
        case 'acceptable':
          summary.acceptable++
          break
        case 'below_minimum':
        case 'above_maximum':
          summary.attention++
          break
        case 'no_reference':
          summary.noReference++
          break
      }
    })
    
    // Determinar status geral
    let overallStatus: 'excellent' | 'good' | 'attention' | 'no_data' = 'no_data'
    
    if (summary.attention > 0) {
      overallStatus = 'attention'
    } else if (summary.excellent > summary.good + summary.acceptable) {
      overallStatus = 'excellent'
    } else if (summary.good > 0 || summary.acceptable > 0) {
      overallStatus = 'good'
    }
    
    return {
      comparisons,
      overallStatus,
      summary
    }
  }
}
