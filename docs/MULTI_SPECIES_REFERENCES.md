# 📚 Dados de Referência Científicos - NRC e EMBRAPA

## 🇺🇸 NRC - National Research Council

```typescript
// lib/references/nrc-data.ts
export const NRC_REFERENCES = {
  // BOVINOS - NRC 2016
  bovine: {
    dairy: {
      peso_nascimento: {
        min: 35,
        ideal_min: 38,
        ideal_max: 42,
        max: 45,
        unit: 'kg',
        source: 'NRC Dairy Cattle 2016',
      },
      producao_leite: {
        min: 15,
        ideal_min: 25,
        ideal_max: 35,
        max: 45,
        unit: 'L/dia',
        source: 'NRC Dairy Cattle 2016',
      },
      proteina_leite: {
        min: 2.8,
        ideal_min: 3.0,
        ideal_max: 3.4,
        max: 3.8,
        unit: '%',
        source: 'NRC Dairy Cattle 2016',
      },
      gordura_leite: {
        min: 3.0,
        ideal_min: 3.5,
        ideal_max: 4.0,
        max: 4.5,
        unit: '%',
        source: 'NRC Dairy Cattle 2016',
      },
      celulas_somaticas: {
        min: 50000,
        ideal_min: 100000,
        ideal_max: 200000,
        max: 400000,
        unit: 'cel/mL',
        source: 'NRC Dairy Cattle 2016',
      },
      escore_corporal: {
        min: 2.0,
        ideal_min: 3.0,
        ideal_max: 3.5,
        max: 4.0,
        unit: 'pontos',
        source: 'NRC Dairy Cattle 2016',
      },
    },
    beef: {
      gpd: {
        min: 0.8,
        ideal_min: 1.2,
        ideal_max: 1.5,
        max: 1.8,
        unit: 'kg/dia',
        source: 'NRC Beef Cattle 2016',
      },
      rendimento_carcaca: {
        min: 48,
        ideal_min: 52,
        ideal_max: 58,
        max: 62,
        unit: '%',
        source: 'NRC Beef Cattle 2016',
      },
      area_olho_lombo: {
        min: 65,
        ideal_min: 75,
        ideal_max: 90,
        max: 100,
        unit: 'cm²',
        source: 'NRC Beef Cattle 2016',
      },
      marmoreiro: {
        min: 2,
        ideal_min: 3,
        ideal_max: 5,
        max: 7,
        unit: 'score',
        source: 'NRC Beef Cattle 2016',
      },
    },
  },

  // SUÍNOS - NRC 2012
  swine: {
    nursery: {
      peso_desmame: {
        min: 5.5,
        ideal_min: 6.5,
        ideal_max: 7.5,
        max: 8.5,
        unit: 'kg',
        source: 'NRC Swine 2012',
      },
      gpd_creche: {
        min: 0.35,
        ideal_min: 0.42,
        ideal_max: 0.5,
        max: 0.58,
        unit: 'kg/dia',
        source: 'NRC Swine 2012',
      },
      conversao_creche: {
        min: 1.3,
        ideal_min: 1.4,
        ideal_max: 1.6,
        max: 1.8,
        unit: 'kg/kg',
        source: 'NRC Swine 2012',
      },
    },
    finishing: {
      gpd: {
        min: 0.75,
        ideal_min: 0.85,
        ideal_max: 1.0,
        max: 1.15,
        unit: 'kg/dia',
        source: 'NRC Swine 2012',
      },
      conversao: {
        min: 2.3,
        ideal_min: 2.5,
        ideal_max: 2.8,
        max: 3.2,
        unit: 'kg/kg',
        source: 'NRC Swine 2012',
      },
      espessura_toucinho: {
        min: 10,
        ideal_min: 12,
        ideal_max: 16,
        max: 20,
        unit: 'mm',
        source: 'NRC Swine 2012',
      },
      carne_magra: {
        min: 52,
        ideal_min: 56,
        ideal_max: 60,
        max: 64,
        unit: '%',
        source: 'NRC Swine 2012',
      },
    },
  },

  // AVES - NRC 1994
  poultry: {
    broiler: {
      peso_42d: {
        min: 2.4,
        ideal_min: 2.6,
        ideal_max: 2.9,
        max: 3.1,
        unit: 'kg',
        source: 'NRC Poultry 1994',
      },
      conversao_alimentar: {
        min: 1.5,
        ideal_min: 1.6,
        ideal_max: 1.75,
        max: 1.9,
        unit: 'kg/kg',
        source: 'NRC Poultry 1994',
      },
      mortalidade: {
        min: 0,
        ideal_min: 2,
        ideal_max: 3.5,
        max: 5,
        unit: '%',
        source: 'NRC Poultry 1994',
      },
      iep: {
        min: 280,
        ideal_min: 320,
        ideal_max: 380,
        max: 420,
        unit: 'pontos',
        source: 'NRC Poultry 1994',
      },
    },
    layer: {
      producao_ovos: {
        min: 75,
        ideal_min: 85,
        ideal_max: 92,
        max: 95,
        unit: '%',
        source: 'NRC Poultry 1994',
      },
      peso_ovo: {
        min: 55,
        ideal_min: 58,
        ideal_max: 63,
        max: 68,
        unit: 'g',
        source: 'NRC Poultry 1994',
      },
      conversao_duzia: {
        min: 1.4,
        ideal_min: 1.5,
        ideal_max: 1.7,
        max: 1.9,
        unit: 'kg/dz',
        source: 'NRC Poultry 1994',
      },
    },
  },
}
```

## 🇧🇷 EMBRAPA - Empresa Brasileira de Pesquisa Agropecuária

```typescript
// lib/references/embrapa-data.ts
export const EMBRAPA_REFERENCES = {
  // FORRAGEM - EMBRAPA Gado de Corte
  forage: {
    brachiaria: {
      brizantha: {
        biomassa_seca_aguas: {
          min: 2000,
          ideal: 4500,
          max: 7000,
          unit: 'kg/ha',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        biomassa_seca_seca: {
          min: 800,
          ideal: 1800,
          max: 3000,
          unit: 'kg/ha',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        proteina_bruta: {
          min: 7,
          ideal: 10,
          max: 13,
          unit: '%',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        fdn: {
          min: 55,
          ideal: 62,
          max: 70,
          unit: '%',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        fda: {
          min: 28,
          ideal: 32,
          max: 38,
          unit: '%',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        digestibilidade: {
          min: 55,
          ideal: 65,
          max: 72,
          unit: '%',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        altura_pastejo_entrada: {
          min: 25,
          ideal: 30,
          max: 35,
          unit: 'cm',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        altura_pastejo_saida: {
          min: 10,
          ideal: 15,
          max: 20,
          unit: 'cm',
          source: 'EMBRAPA Gado de Corte 2023',
        },
      },
      decumbens: {
        biomassa_seca_aguas: {
          min: 1800,
          ideal: 3800,
          max: 5500,
          unit: 'kg/ha',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        proteina_bruta: {
          min: 6,
          ideal: 9,
          max: 12,
          unit: '%',
          source: 'EMBRAPA Gado de Corte 2023',
        },
      },
      ruziziensis: {
        biomassa_seca_aguas: {
          min: 1500,
          ideal: 3200,
          max: 4800,
          unit: 'kg/ha',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        proteina_bruta: {
          min: 8,
          ideal: 11,
          max: 14,
          unit: '%',
          source: 'EMBRAPA Gado de Corte 2023',
        },
      },
    },
    panicum: {
      maximum: {
        biomassa_seca_aguas: {
          min: 3000,
          ideal: 6000,
          max: 9000,
          unit: 'kg/ha',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        proteina_bruta: {
          min: 8,
          ideal: 11,
          max: 14,
          unit: '%',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        altura_entrada: {
          min: 70,
          ideal: 90,
          max: 110,
          unit: 'cm',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        altura_saida: {
          min: 30,
          ideal: 40,
          max: 50,
          unit: 'cm',
          source: 'EMBRAPA Gado de Corte 2023',
        },
      },
      mombaca: {
        biomassa_seca_aguas: {
          min: 3500,
          ideal: 6500,
          max: 10000,
          unit: 'kg/ha',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        proteina_bruta: {
          min: 9,
          ideal: 12,
          max: 15,
          unit: '%',
          source: 'EMBRAPA Gado de Corte 2023',
        },
      },
      tanzania: {
        biomassa_seca_aguas: {
          min: 2800,
          ideal: 5500,
          max: 8000,
          unit: 'kg/ha',
          source: 'EMBRAPA Gado de Corte 2023',
        },
        proteina_bruta: {
          min: 9,
          ideal: 12,
          max: 15,
          unit: '%',
          source: 'EMBRAPA Gado de Corte 2023',
        },
      },
    },
    leguminosas: {
      stylosanthes: {
        proteina_bruta: {
          min: 12,
          ideal: 16,
          max: 20,
          unit: '%',
          source: 'EMBRAPA Cerrados 2022',
        },
        fixacao_n: {
          min: 80,
          ideal: 120,
          max: 180,
          unit: 'kg/ha/ano',
          source: 'EMBRAPA Cerrados 2022',
        },
      },
      leucena: {
        proteina_bruta: {
          min: 18,
          ideal: 22,
          max: 26,
          unit: '%',
          source: 'EMBRAPA Cerrados 2022',
        },
        tanino: {
          min: 1,
          ideal: 2,
          max: 4,
          unit: '%',
          source: 'EMBRAPA Cerrados 2022',
        },
      },
    },
  },

  // OVINOS E CAPRINOS - EMBRAPA Caprinos e Ovinos
  sheep_goat: {
    ovinos: {
      peso_nascimento: {
        min: 3,
        ideal: 4,
        max: 5,
        unit: 'kg',
        source: 'EMBRAPA Caprinos e Ovinos 2023',
      },
      gpd_cria: {
        min: 0.15,
        ideal: 0.25,
        max: 0.35,
        unit: 'kg/dia',
        source: 'EMBRAPA Caprinos e Ovinos 2023',
      },
      peso_desmame: {
        min: 15,
        ideal: 20,
        max: 25,
        unit: 'kg',
        source: 'EMBRAPA Caprinos e Ovinos 2023',
      },
      prolificidade: {
        min: 1.2,
        ideal: 1.5,
        max: 1.8,
        unit: 'crias/parto',
        source: 'EMBRAPA Caprinos e Ovinos 2023',
      },
      intervalo_partos: {
        min: 240,
        ideal: 270,
        max: 300,
        unit: 'dias',
        source: 'EMBRAPA Caprinos e Ovinos 2023',
      },
    },
    caprinos: {
      peso_nascimento: {
        min: 2.5,
        ideal: 3.5,
        max: 4.5,
        unit: 'kg',
        source: 'EMBRAPA Caprinos e Ovinos 2023',
      },
      gpd_cria: {
        min: 0.1,
        ideal: 0.18,
        max: 0.25,
        unit: 'kg/dia',
        source: 'EMBRAPA Caprinos e Ovinos 2023',
      },
      peso_desmame: {
        min: 12,
        ideal: 16,
        max: 20,
        unit: 'kg',
        source: 'EMBRAPA Caprinos e Ovinos 2023',
      },
      producao_leite: {
        min: 1,
        ideal: 2,
        max: 3,
        unit: 'L/dia',
        source: 'EMBRAPA Caprinos e Ovinos 2023',
      },
    },
  },

  // PISCICULTURA - EMBRAPA Pesca e Aquicultura
  aquaculture: {
    tilapia: {
      densidade_estocagem: {
        min: 1,
        ideal: 3,
        max: 5,
        unit: 'peixes/m²',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
      conversao_alimentar: {
        min: 1.2,
        ideal: 1.5,
        max: 1.8,
        unit: 'kg/kg',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
      oxigenio_dissolvido: {
        min: 4,
        ideal: 6,
        max: 8,
        unit: 'mg/L',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
      temperatura: {
        min: 25,
        ideal: 28,
        max: 32,
        unit: '°C',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
      ph: {
        min: 6.5,
        ideal: 7.5,
        max: 8.5,
        unit: '',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
      gpd: {
        min: 2,
        ideal: 4,
        max: 6,
        unit: 'g/dia',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
    },
    tambaqui: {
      densidade_estocagem: {
        min: 0.5,
        ideal: 1.5,
        max: 2.5,
        unit: 'peixes/m²',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
      conversao_alimentar: {
        min: 1.5,
        ideal: 1.8,
        max: 2.2,
        unit: 'kg/kg',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
      gpd: {
        min: 3,
        ideal: 5,
        max: 8,
        unit: 'g/dia',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
    },
    pintado: {
      densidade_estocagem: {
        min: 0.3,
        ideal: 0.8,
        max: 1.2,
        unit: 'peixes/m²',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
      conversao_alimentar: {
        min: 1.8,
        ideal: 2.2,
        max: 2.6,
        unit: 'kg/kg',
        source: 'EMBRAPA Pesca e Aquicultura 2023',
      },
    },
  },
}
```

## 🔄 Serviço de Integração de Referências

```typescript
// lib/references/species-references.ts
import { NRC_REFERENCES } from './nrc-data'
import { EMBRAPA_REFERENCES } from './embrapa-data'

export class ReferenceDataService {
  /**
   * Busca dados de referência combinando NRC e EMBRAPA
   */
  static getReference(species: string, subtype?: string, metric?: string) {
    const nrcData = this.getNRCData(species, subtype)
    const embrapaData = this.getEMBRAPAData(species, subtype)

    // Combina as duas fontes, priorizando EMBRAPA para dados brasileiros
    const combined = {
      ...nrcData,
      ...embrapaData,
      sources: {
        nrc: nrcData ? true : false,
        embrapa: embrapaData ? true : false,
      },
    }

    if (metric) {
      return combined[metric] || null
    }

    return combined
  }

  /**
   * Busca dados específicos do NRC
   */
  static getNRCData(species: string, subtype?: string) {
    if (!NRC_REFERENCES[species]) return null

    if (subtype && NRC_REFERENCES[species][subtype]) {
      return NRC_REFERENCES[species][subtype]
    }

    return NRC_REFERENCES[species]
  }

  /**
   * Busca dados específicos da EMBRAPA
   */
  static getEMBRAPAData(species: string, subtype?: string) {
    // EMBRAPA tem estrutura diferente para algumas espécies
    if (species === 'forage') {
      return EMBRAPA_REFERENCES.forage
    }

    if (species === 'sheep' || species === 'goat') {
      return EMBRAPA_REFERENCES.sheep_goat[species === 'sheep' ? 'ovinos' : 'caprinos']
    }

    if (species === 'aquaculture') {
      return EMBRAPA_REFERENCES.aquaculture
    }

    return null
  }

  /**
   * Valida se um valor está dentro dos parâmetros de referência
   */
  static validateMetric(value: number, species: string, metric: string, subtype?: string) {
    const reference = this.getReference(species, subtype, metric)

    if (!reference) {
      return {
        valid: true,
        status: 'no_reference',
        message: 'Sem dados de referência disponíveis',
      }
    }

    if (value < reference.min) {
      return {
        valid: false,
        status: 'below_minimum',
        message: `Valor abaixo do mínimo (${reference.min} ${reference.unit})`,
      }
    }

    if (value > reference.max) {
      return {
        valid: false,
        status: 'above_maximum',
        message: `Valor acima do máximo (${reference.max} ${reference.unit})`,
      }
    }

    let status = 'acceptable'
    if (reference.ideal_min && reference.ideal_max) {
      if (value >= reference.ideal_min && value <= reference.ideal_max) {
        status = 'excellent'
      } else {
        status = 'good'
      }
    }

    return {
      valid: true,
      status,
      reference,
      message: `Valor dentro dos parâmetros (${status})`,
    }
  }
}
```

## 📊 Fórmulas e Cálculos Zootécnicos

```typescript
// lib/references/zootechnical-formulas.ts

export class ZootechnicalCalculations {
  /**
   * Índice de Eficiência Produtiva (IEP) para frangos
   */
  static calculateIEP(params: {
    pesoMedio: number // kg
    idade: number // dias
    viabilidade: number // %
    conversaoAlimentar: number // kg/kg
  }) {
    const { pesoMedio, idade, viabilidade, conversaoAlimentar } = params
    return (pesoMedio * viabilidade * 100) / (idade * conversaoAlimentar)
  }

  /**
   * Ganho de Peso Diário (GPD)
   */
  static calculateGPD(pesoFinal: number, pesoInicial: number, dias: number) {
    return (pesoFinal - pesoInicial) / dias
  }

  /**
   * Conversão Alimentar
   */
  static calculateFCR(consumoRacao: number, ganhoPeso: number) {
    return consumoRacao / ganhoPeso
  }

  /**
   * Taxa de Lotação de Pastagem
   */
  static calculateStockingRate(params: {
    biomassaTotal: number // kg/ha
    consumoDiario: number // kg/animal/dia
    periodoOcupacao: number // dias
    perdas: number // % de perdas (pisoteio, etc)
  }) {
    const { biomassaTotal, consumoDiario, periodoOcupacao, perdas } = params
    const biomassaDisponivel = biomassaTotal * (1 - perdas / 100)
    return biomassaDisponivel / (consumoDiario * periodoOcupacao)
  }

  /**
   * Produção de Leite Corrigida para Gordura
   */
  static calculateFCM(producaoLeite: number, gordura: number) {
    return 0.4 * producaoLeite + (15 * producaoLeite * gordura) / 100
  }

  /**
   * Escore de Condição Corporal (ECC) - interpretação
   */
  static interpretBCS(score: number, species: 'bovine' | 'ovine') {
    const ranges = {
      bovine: {
        muito_magro: [1, 2],
        magro: [2.1, 2.9],
        ideal: [3, 3.5],
        gordo: [3.6, 4],
        muito_gordo: [4.1, 5],
      },
      ovine: {
        muito_magro: [1, 1.5],
        magro: [1.6, 2.4],
        ideal: [2.5, 3.5],
        gordo: [3.6, 4],
        muito_gordo: [4.1, 5],
      },
    }

    const range = ranges[species]

    if (score <= range.muito_magro[1]) return 'muito_magro'
    if (score <= range.magro[1]) return 'magro'
    if (score <= range.ideal[1]) return 'ideal'
    if (score <= range.gordo[1]) return 'gordo'
    return 'muito_gordo'
  }
}
```
