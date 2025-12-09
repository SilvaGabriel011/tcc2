/**
 * Gerador de Dados de Teste Zootécnicos
 * Cria planilhas CSV com dados realistas para demonstração
 */

import { normalizeSpeciesId } from './species-mapping'

export type Species =
  | 'bovino'
  | 'suino'
  | 'avicultura'
  | 'ovino'
  | 'caprino'
  | 'piscicultura'
  | 'forragem'
  | 'abelhas'
  | 'bovine'
  | 'swine'
  | 'poultry'
  | 'sheep'
  | 'goat'
  | 'aquaculture'
  | 'forage'
  | 'bees'

export interface TestDataConfig {
  rows: number
  species: Species
  subtype?: string
  includeNumeric: boolean
  includeCategorical: boolean
  includeMissing: boolean
  seed?: number
}

const BOVINO_RACAS = [
  'Nelore',
  'Angus',
  'Brahman',
  'Simental',
  'Hereford',
  'Gir',
  'Guzerá',
  'Caracu',
]
const SUINO_RACAS = ['Landrace', 'Large White', 'Duroc', 'Pietrain', 'Hampshire']
const OVINO_RACAS = ['Santa Inês', 'Dorper', 'Suffolk', 'Texel', 'Ile de France']
const CAPRINO_RACAS = ['Boer', 'Saanen', 'Anglo-Nubiana', 'Parda Alpina', 'Toggenburg']
const AVE_RACAS = ['Cobb', 'Ross', 'Hubbard', 'ISA Brown', 'Lohmann']
const PEIXE_ESPECIES = ['Tilápia', 'Tambaqui', 'Pacu', 'Pintado', 'Matrinxã']
const FORRAGEM_TIPOS = [
  'Brachiaria brizantha',
  'Brachiaria decumbens',
  'Panicum maximum',
  'Cynodon dactylon',
  'Pennisetum purpureum',
]
const ABELHA_RACAS = [
  'Apis mellifera',
  'Apis mellifera scutellata',
  'Apis mellifera ligustica',
  'Apis mellifera carnica',
  'Jataí',
  'Mandaçaia',
  'Uruçu',
]
const ABELHA_CATEGORIAS = ['Produção', 'Reprodução', 'Desenvolvimento', 'Manutenção']

const SEXO = ['Macho', 'Fêmea']
const ESTADOS = ['MT', 'MS', 'GO', 'SP', 'MG', 'RS', 'PR', 'BA']
const BOVINO_CATEGORIAS = ['Bezerro', 'Recria', 'Terminação', 'Leiteira', 'Reprodutor']
const SUINO_CATEGORIAS = ['Leitão', 'Crescimento', 'Terminação', 'Reprodutor']
const AVE_CATEGORIAS = ['Inicial', 'Crescimento', 'Terminação', 'Postura']
const OVINO_CATEGORIAS = ['Cordeiro', 'Borrego', 'Adulto', 'Matriz']
const CAPRINO_CATEGORIAS = ['Cabrito', 'Jovem', 'Adulto', 'Matriz']
const PEIXE_CATEGORIAS = ['Alevino', 'Juvenil', 'Adulto', 'Reprodutor']
const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

let rng: SeededRandom | null = null

function getRandom(): number {
  return rng ? rng.next() : Math.random()
}

function randomBetween(min: number, max: number, decimals: number = 2): number {
  const value = getRandom() * (max - min) + min
  return Number(value.toFixed(decimals))
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(getRandom() * array.length)]
}

// Função para gerar data aleatória
// function randomDate(start: Date, end: Date): string {
//   const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
//   return date.toISOString().split('T')[0]
// }

function possiblyNull<T>(value: T, probability: number = 0.05): T | null {
  return getRandom() < probability ? null : value
}

/**
 * Gera dataset de teste com dados zootécnicos realistas
 */
export function generateTestData(
  config: TestDataConfig = {
    rows: 100,
    species: 'bovino',
    includeNumeric: true,
    includeCategorical: true,
    includeMissing: false,
  }
): Record<string, unknown>[] {
  if (config.seed !== undefined) {
    rng = new SeededRandom(config.seed)
  } else {
    rng = null
  }

  // Normalize species ID to backend format
  const normalizedSpecies = normalizeSpeciesId(config.species)

  switch (normalizedSpecies) {
    case 'bovino':
      return generateBovinoData(config)
    case 'suino':
      return generateSuinoData(config)
    case 'avicultura':
      return generateAviculturaData(config)
    case 'ovino':
      return generateOvinoData(config)
    case 'caprino':
      return generateCaprinoData(config)
    case 'piscicultura':
      return generatePisciculturaData(config)
    case 'forragem':
      return generateForragemData(config)
    case 'abelhas':
      return generateBeesData(config)
    default:
      return generateBovinoData(config)
  }
}

function generateBovinoData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0
  const isDairy = config.subtype === 'dairy'

  for (let i = 1; i <= config.rows; i++) {
    const row: Record<string, unknown> = {
      id: `BOV${String(i).padStart(5, '0')}`,
    }

    if (isDairy) {
      const baseDate = new Date(2025, 0, 1)
      const randomDays = Math.floor(getRandom() * 365)
      const date = new Date(baseDate.getTime() + randomDays * 24 * 60 * 60 * 1000)
      row.date = date.toISOString().split('T')[0]

      if (config.includeNumeric) {
        row.producao_leite = possiblyNull(randomBetween(25, 40, 1), missingProb)
        row.gordura_leite = possiblyNull(randomBetween(3.5, 4.0, 2), missingProb)
        row.proteina_leite = possiblyNull(randomBetween(3.0, 3.4, 2), missingProb)
        row.celulas_somaticas = possiblyNull(randomBetween(50000, 200000, 0), missingProb)
      }
    } else {
      const sexo = randomChoice(SEXO)
      const raca = randomChoice(BOVINO_RACAS)
      const categoria = randomChoice(BOVINO_CATEGORIAS)

      let pesoNasc, pesoDesmame, pesoAtual

      if (categoria === 'Bezerro') {
        pesoNasc = randomBetween(28, 38, 1)
        pesoDesmame = randomBetween(160, 200, 1)
        pesoAtual = randomBetween(200, 280, 1)
      } else if (categoria === 'Recria') {
        pesoNasc = randomBetween(28, 38, 1)
        pesoDesmame = randomBetween(180, 220, 1)
        pesoAtual = randomBetween(280, 380, 1)
      } else if (categoria === 'Terminação') {
        pesoNasc = randomBetween(30, 40, 1)
        pesoDesmame = randomBetween(190, 230, 1)
        pesoAtual = randomBetween(450, 550, 1)
      } else {
        pesoNasc = randomBetween(30, 38, 1)
        pesoDesmame = randomBetween(180, 220, 1)
        pesoAtual = sexo === 'Macho' ? randomBetween(700, 900, 1) : randomBetween(450, 550, 1)
      }

      let idadeMeses: number
      if (categoria === 'Bezerro') {
        idadeMeses = randomBetween(3, 8, 0)
      } else if (categoria === 'Recria') {
        idadeMeses = randomBetween(8, 18, 0)
      } else if (categoria === 'Terminação') {
        idadeMeses = randomBetween(18, 30, 0)
      } else {
        idadeMeses = randomBetween(30, 72, 0)
      }

      if (config.includeCategorical) {
        row.RACA = possiblyNull(raca, missingProb)
        row.SEXO = possiblyNull(sexo, missingProb)
        row.CATEGORIA = possiblyNull(categoria, missingProb)
      }

      if (config.includeNumeric) {
        row.peso_vivo = possiblyNull(pesoAtual, missingProb)
        row.gpd = possiblyNull(randomBetween(0.8, 1.4, 3), missingProb)
        row.escore_corporal = possiblyNull(randomBetween(3, 4, 1), missingProb)
        row.peso_nascimento = possiblyNull(pesoNasc, missingProb)
        row.peso_desmame = possiblyNull(pesoDesmame, missingProb)
        row.idade_meses = possiblyNull(idadeMeses, missingProb)
        row.conversao_alimentar = possiblyNull(randomBetween(5.5, 8.5, 2), missingProb)
        row.consumo_ms = possiblyNull(randomBetween(8, 14, 1), missingProb)
        row.altura_cernelha = possiblyNull(randomBetween(120, 150, 1), missingProb)
        row.perimetro_toracico = possiblyNull(randomBetween(160, 220, 1), missingProb)
      }
    }

    data.push(row)
  }

  return data
}

function generateSuinoData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(SUINO_RACAS)
    const categoria = randomChoice(SUINO_CATEGORIAS)

    let pesoNasc, pesoDesmame, pesoFinal, idadeDias

    if (categoria === 'Leitão') {
      pesoNasc = randomBetween(1.2, 1.8, 2)
      pesoDesmame = randomBetween(5, 8, 2)
      pesoFinal = randomBetween(8, 15, 1)
      idadeDias = randomBetween(1, 21, 0)
    } else if (categoria === 'Crescimento') {
      pesoNasc = randomBetween(1.3, 1.7, 2)
      pesoDesmame = randomBetween(6, 8, 2)
      pesoFinal = randomBetween(25, 60, 1)
      idadeDias = randomBetween(60, 100, 0)
    } else if (categoria === 'Terminação') {
      pesoNasc = randomBetween(1.4, 1.8, 2)
      pesoDesmame = randomBetween(6, 8, 2)
      pesoFinal = randomBetween(100, 130, 1)
      idadeDias = randomBetween(150, 180, 0)
    } else {
      pesoNasc = randomBetween(1.4, 1.8, 2)
      pesoDesmame = randomBetween(6, 8, 2)
      pesoFinal = sexo === 'Macho' ? randomBetween(250, 350, 1) : randomBetween(180, 250, 1)
      idadeDias = randomBetween(200, 400, 0)
    }

    const row: Record<string, unknown> = {
      ID: `SUI${String(i).padStart(5, '0')}`,
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
    }

    if (config.includeNumeric) {
      row.peso_nascimento = possiblyNull(pesoNasc, missingProb)
      row.peso_desmame = possiblyNull(pesoDesmame, missingProb)
      row.peso_final = possiblyNull(pesoFinal, missingProb)
      row.idade_dias = possiblyNull(idadeDias, missingProb)
      row.gpd = possiblyNull(randomBetween(0.75, 1.05, 3), missingProb)
      row.consumo_racao = possiblyNull(randomBetween(2.0, 3.5, 2), missingProb)
      row.conversao_alimentar = possiblyNull(randomBetween(2.5, 3.2, 2), missingProb)
      row.espessura_toucinho = possiblyNull(randomBetween(12, 18, 1), missingProb)
      row.profundidade_lombo = possiblyNull(randomBetween(55, 75, 1), missingProb)
      row.rendimento_carcaca = possiblyNull(randomBetween(76, 82, 1), missingProb)
      row.percentual_carne_magra = possiblyNull(randomBetween(54, 62, 1), missingProb)
      row.mortalidade = possiblyNull(randomBetween(1, 4, 2), missingProb)
      row.numero_leitoes =
        sexo === 'Fêmea' && categoria === 'Reprodutor'
          ? possiblyNull(randomBetween(10, 14, 0), missingProb)
          : null
    }

    data.push(row)
  }

  return data
}

function generateAviculturaData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(AVE_RACAS)
    const categoria = randomChoice(AVE_CATEGORIAS)

    let pesoInicial, peso7d, peso14d, peso21d, pesoFinal, idadeDias

    if (categoria === 'Inicial') {
      pesoInicial = randomBetween(0.04, 0.05, 3)
      peso7d = randomBetween(0.15, 0.18, 3)
      peso14d = randomBetween(0.4, 0.5, 3)
      peso21d = randomBetween(0.8, 1.0, 3)
      pesoFinal = randomBetween(0.8, 1.0, 2)
      idadeDias = randomBetween(1, 7, 0)
    } else if (categoria === 'Crescimento') {
      pesoInicial = randomBetween(0.04, 0.05, 3)
      peso7d = randomBetween(0.16, 0.19, 3)
      peso14d = randomBetween(0.45, 0.55, 3)
      peso21d = randomBetween(0.9, 1.1, 3)
      pesoFinal = randomBetween(1.5, 2.0, 2)
      idadeDias = randomBetween(21, 35, 0)
    } else if (categoria === 'Terminação') {
      pesoInicial = randomBetween(0.04, 0.05, 3)
      peso7d = randomBetween(0.17, 0.2, 3)
      peso14d = randomBetween(0.5, 0.6, 3)
      peso21d = randomBetween(1.0, 1.2, 3)
      pesoFinal = randomBetween(2.5, 3.2, 2)
      idadeDias = randomBetween(42, 49, 0)
    } else {
      pesoInicial = randomBetween(0.04, 0.05, 3)
      peso7d = randomBetween(0.12, 0.15, 3)
      peso14d = randomBetween(0.25, 0.35, 3)
      peso21d = randomBetween(0.45, 0.55, 3)
      pesoFinal = randomBetween(1.8, 2.2, 2)
      idadeDias = randomBetween(120, 500, 0)
    }

    const row: Record<string, unknown> = {
      ID: `AVE${String(i).padStart(5, '0')}`,
      LOTE: `L${String(Math.ceil(i / 100)).padStart(3, '0')}`,
    }

    if (config.includeCategorical) {
      row.LINHAGEM = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
    }

    if (config.includeNumeric) {
      row.peso_inicial = possiblyNull(pesoInicial, missingProb)
      row.peso_7d = possiblyNull(peso7d, missingProb)
      row.peso_14d = possiblyNull(peso14d, missingProb)
      row.peso_21d = possiblyNull(peso21d, missingProb)
      row.peso_final = possiblyNull(pesoFinal, missingProb)
      row.idade_dias = possiblyNull(idadeDias, missingProb)
      row.gpd = possiblyNull(randomBetween(0.045, 0.065, 3), missingProb)
      row.consumo_racao = possiblyNull(randomBetween(3.5, 5.5, 2), missingProb)
      row.conversao_alimentar = possiblyNull(randomBetween(1.6, 2.0, 2), missingProb)
      row.mortalidade = possiblyNull(randomBetween(2, 6, 1), missingProb)
      row.viabilidade = possiblyNull(randomBetween(94, 98, 1), missingProb)
      row.iep = possiblyNull(randomBetween(320, 380, 0), missingProb)
      row.producao_ovos =
        categoria === 'Postura' ? possiblyNull(randomBetween(280, 320, 0), missingProb) : null
      row.peso_ovos =
        categoria === 'Postura' ? possiblyNull(randomBetween(58, 68, 1), missingProb) : null
      row.massa_ovos =
        categoria === 'Postura' ? possiblyNull(randomBetween(18, 22, 1), missingProb) : null
    }

    data.push(row)
  }

  return data
}

function generateOvinoData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(OVINO_RACAS)
    const categoria = randomChoice(OVINO_CATEGORIAS)

    let pesoNasc, pesoDesmame, pesoAtual
    if (categoria === 'Cordeiro') {
      pesoNasc = randomBetween(3.5, 5.0, 2)
      pesoDesmame = randomBetween(18, 25, 1)
      pesoAtual = randomBetween(25, 35, 1)
    } else if (categoria === 'Borrego') {
      pesoNasc = randomBetween(3.8, 5.2, 2)
      pesoDesmame = randomBetween(20, 28, 1)
      pesoAtual = randomBetween(35, 45, 1)
    } else if (categoria === 'Adulto') {
      pesoNasc = randomBetween(4.0, 5.5, 2)
      pesoDesmame = randomBetween(22, 30, 1)
      pesoAtual = randomBetween(45, 70, 1)
    } else {
      pesoNasc = randomBetween(3.8, 5.0, 2)
      pesoDesmame = randomBetween(20, 26, 1)
      pesoAtual = randomBetween(40, 55, 1)
    }

    const row: Record<string, unknown> = {
      ID: `OVI${String(i).padStart(5, '0')}`,
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
    }

    if (config.includeNumeric) {
      row.peso_nascimento = possiblyNull(pesoNasc, missingProb)
      row.peso_desmame = possiblyNull(pesoDesmame, missingProb)
      row.peso_atual = possiblyNull(pesoAtual, missingProb)
      row.idade_meses = possiblyNull(randomBetween(6, 36, 0), missingProb)
      row.gpd = possiblyNull(randomBetween(0.15, 0.28, 3), missingProb)
      row.altura_cernelha = possiblyNull(randomBetween(55, 75, 1), missingProb)
      row.perimetro_toracico = possiblyNull(randomBetween(70, 100, 1), missingProb)
      row.escore_corporal = possiblyNull(randomBetween(2.5, 4.0, 1), missingProb)
      row.producao_la = possiblyNull(randomBetween(2, 5, 1), missingProb)
      row.diametro_fibra = possiblyNull(randomBetween(18, 28, 1), missingProb)
      row.numero_cordeiros =
        categoria === 'Matriz' ? possiblyNull(randomBetween(1, 3, 0), missingProb) : null
    }

    data.push(row)
  }

  return data
}

function generateCaprinoData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const sexo = randomChoice(SEXO)
    const raca = randomChoice(CAPRINO_RACAS)
    const categoria = randomChoice(CAPRINO_CATEGORIAS)

    let pesoNasc, pesoDesmame, pesoAtual
    if (categoria === 'Cabrito') {
      pesoNasc = randomBetween(2.5, 4.0, 2)
      pesoDesmame = randomBetween(10, 15, 1)
      pesoAtual = randomBetween(15, 25, 1)
    } else if (categoria === 'Jovem') {
      pesoNasc = randomBetween(2.8, 4.2, 2)
      pesoDesmame = randomBetween(12, 18, 1)
      pesoAtual = randomBetween(25, 40, 1)
    } else if (categoria === 'Adulto') {
      pesoNasc = randomBetween(3.0, 4.5, 2)
      pesoDesmame = randomBetween(14, 20, 1)
      pesoAtual = randomBetween(40, 65, 1)
    } else {
      pesoNasc = randomBetween(2.8, 4.0, 2)
      pesoDesmame = randomBetween(12, 16, 1)
      pesoAtual = randomBetween(35, 50, 1)
    }

    const row: Record<string, unknown> = {
      ID: `CAP${String(i).padStart(5, '0')}`,
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
    }

    if (config.includeNumeric) {
      row.peso_nascimento = possiblyNull(pesoNasc, missingProb)
      row.peso_desmame = possiblyNull(pesoDesmame, missingProb)
      row.peso_atual = possiblyNull(pesoAtual, missingProb)
      row.idade_meses = possiblyNull(randomBetween(6, 36, 0), missingProb)
      row.gpd = possiblyNull(randomBetween(0.12, 0.22, 3), missingProb)
      row.altura_cernelha = possiblyNull(randomBetween(50, 70, 1), missingProb)
      row.perimetro_toracico = possiblyNull(randomBetween(60, 90, 1), missingProb)
      row.escore_corporal = possiblyNull(randomBetween(2.5, 4.0, 1), missingProb)
      row.producao_leite =
        categoria === 'Matriz' ? possiblyNull(randomBetween(1.5, 3.5, 2), missingProb) : null
      row.gordura_leite =
        categoria === 'Matriz' ? possiblyNull(randomBetween(3.5, 5.0, 2), missingProb) : null
      row.proteina_leite =
        categoria === 'Matriz' ? possiblyNull(randomBetween(3.2, 4.2, 2), missingProb) : null
      row.numero_cabritos =
        categoria === 'Matriz' ? possiblyNull(randomBetween(1, 3, 0), missingProb) : null
    }

    data.push(row)
  }

  return data
}

function generatePisciculturaData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const especie = randomChoice(PEIXE_ESPECIES)
    const categoria = randomChoice(PEIXE_CATEGORIAS)

    let pesoInicial, pesoFinal, comprimentoTotal
    if (categoria === 'Alevino') {
      pesoInicial = randomBetween(0.001, 0.005, 4)
      pesoFinal = randomBetween(0.005, 0.03, 3)
      comprimentoTotal = randomBetween(2, 5, 1)
    } else if (categoria === 'Juvenil') {
      pesoInicial = randomBetween(0.03, 0.1, 3)
      pesoFinal = randomBetween(0.1, 0.5, 2)
      comprimentoTotal = randomBetween(8, 15, 1)
    } else if (categoria === 'Adulto') {
      pesoInicial = randomBetween(0.3, 0.8, 2)
      pesoFinal = randomBetween(0.8, 2.5, 2)
      comprimentoTotal = randomBetween(25, 40, 1)
    } else {
      pesoInicial = randomBetween(1.5, 2.5, 2)
      pesoFinal = randomBetween(2, 4, 2)
      comprimentoTotal = randomBetween(35, 50, 1)
    }

    const row: Record<string, unknown> = {
      ID: `PEI${String(i).padStart(5, '0')}`,
      TANQUE: `T${String(Math.ceil(i / 50)).padStart(2, '0')}`,
    }

    if (config.includeCategorical) {
      row.ESPECIE = possiblyNull(especie, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
    }

    if (config.includeNumeric) {
      row.peso_inicial = possiblyNull(pesoInicial, missingProb)
      row.peso_final = possiblyNull(pesoFinal, missingProb)
      row.comprimento_total = possiblyNull(comprimentoTotal, missingProb)
      row.comprimento_padrao = possiblyNull(comprimentoTotal * 0.85, missingProb)
      row.idade_dias = possiblyNull(randomBetween(30, 240, 0), missingProb)
      row.tempo_cultivo = possiblyNull(randomBetween(90, 300, 0), missingProb)
      row.gpd = possiblyNull(randomBetween(0.003, 0.015, 4), missingProb)
      row.consumo_racao = possiblyNull(randomBetween(1.5, 4.0, 2), missingProb)
      row.conversao_alimentar = possiblyNull(randomBetween(1.2, 2.0, 2), missingProb)
      row.densidade_estocagem = possiblyNull(randomBetween(5, 25, 1), missingProb)
      row.biomassa = possiblyNull(randomBetween(2000, 8000, 0), missingProb)
      row.temperatura_agua = possiblyNull(randomBetween(24, 30, 1), missingProb)
      row.oxigenio_dissolvido = possiblyNull(randomBetween(4, 7, 1), missingProb)
      row.ph = possiblyNull(randomBetween(6.5, 8.5, 1), missingProb)
      row.sobrevivencia = possiblyNull(randomBetween(85, 98, 1), missingProb)
      row.mortalidade = possiblyNull(randomBetween(2, 15, 1), missingProb)
    }

    data.push(row)
  }

  return data
}

function generateForragemData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const tipo = randomChoice(FORRAGEM_TIPOS)
    const parcela = `P${String(i).padStart(3, '0')}`

    const row: Record<string, unknown> = {
      ID: `FOR${String(i).padStart(5, '0')}`,
      PARCELA: parcela,
    }

    if (config.includeCategorical) {
      row.TIPO_FORRAGEM = possiblyNull(tipo, missingProb)
    }

    if (config.includeNumeric) {
      row.altura_planta = possiblyNull(randomBetween(25, 80, 1), missingProb)
      row.massa_verde = possiblyNull(randomBetween(15000, 45000, 0), missingProb)
      row.massa_seca = possiblyNull(randomBetween(3000, 12000, 0), missingProb)
      row.producao_ms = possiblyNull(randomBetween(8000, 20000, 0), missingProb)
      row.proteina_bruta = possiblyNull(randomBetween(8, 16, 1), missingProb)
      row.fdn = possiblyNull(randomBetween(55, 72, 1), missingProb)
      row.fda = possiblyNull(randomBetween(30, 45, 1), missingProb)
      row.energia_metabolizavel = possiblyNull(randomBetween(1.8, 2.6, 2), missingProb)
      row.digestibilidade = possiblyNull(randomBetween(55, 75, 1), missingProb)
      row.densidade_forragem = possiblyNull(randomBetween(150, 400, 0), missingProb)
      row.taxa_acumulo = possiblyNull(randomBetween(50, 150, 1), missingProb)
      row.cobertura_solo = possiblyNull(randomBetween(70, 100, 1), missingProb)
      row.numero_perfilhos = possiblyNull(randomBetween(200, 800, 0), missingProb)
    }

    data.push(row)
  }

  return data
}

function generateBeesData(config: TestDataConfig): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = []
  const missingProb = config.includeMissing ? 0.05 : 0

  for (let i = 1; i <= config.rows; i++) {
    const raca = randomChoice(ABELHA_RACAS)
    const categoria = randomChoice(ABELHA_CATEGORIAS)

    const row: Record<string, unknown> = {
      ID: `ABE${String(i).padStart(5, '0')}`,
      COLMEIA: `C${String(i).padStart(4, '0')}`,
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)

      // Produção de mel (kg/colmeia/ano) - métrica principal
      row.producao_mel_colmeia_ano = possiblyNull(randomBetween(15, 60, 1), missingProb)

      // Produção de própolis (g/colmeia/ano)
      row.producao_propolis_colmeia_ano = possiblyNull(randomBetween(50, 300, 0), missingProb)

      // Produção de pólen (kg/colmeia/ano)
      row.producao_polen_colmeia_ano = possiblyNull(randomBetween(1, 8, 1), missingProb)

      // Produção de cera (kg/colmeia/ano)
      row.producao_cera_colmeia_ano = possiblyNull(randomBetween(0.5, 3, 1), missingProb)

      // Produção de geleia real (g/colmeia/ano)
      row.producao_geleia_real_colmeia_ano = possiblyNull(randomBetween(100, 600, 0), missingProb)

      // População de abelhas por colmeia
      row.populacao_abelhas_colmeia = possiblyNull(randomBetween(20000, 80000, 0), missingProb)

      // Quadros de cria
      row.quadros_cria = possiblyNull(randomBetween(4, 10, 0), missingProb)

      // Quadros de mel
      row.quadros_mel = possiblyNull(randomBetween(3, 12, 0), missingProb)

      // Taxa de enxameação (%)
      row.taxa_enxameacao = possiblyNull(randomBetween(5, 25, 1), missingProb)

      // Mortalidade de colmeias (%/ano)
      row.mortalidade_colmeias = possiblyNull(randomBetween(5, 20, 1), missingProb)

      // Qualidade do mel - Umidade (%)
      row.umidade_mel = possiblyNull(randomBetween(15, 20, 1), missingProb)

      // Qualidade do mel - Acidez (meq/kg)
      row.acidez_mel = possiblyNull(randomBetween(10, 40, 1), missingProb)

      // Qualidade do mel - HMF (mg/kg)
      row.hidroximetilfurfural = possiblyNull(randomBetween(5, 30, 1), missingProb)

      // Qualidade do mel - Atividade diastática (unidades Gothe)
      row.atividade_diastatica = possiblyNull(randomBetween(8, 30, 1), missingProb)

      // Taxa de postura da rainha (ovos/dia)
      row.taxa_postura_rainha = possiblyNull(randomBetween(1000, 2500, 0), missingProb)

      // Longevidade da rainha (anos)
      row.longevidade_rainha = possiblyNull(randomBetween(1, 5, 1), missingProb)

      // Taxa de fecundação da rainha (%)
      row.taxa_fecundacao_rainha = possiblyNull(randomBetween(70, 95, 1), missingProb)

      // Defensividade (escala 1-5)
      row.defensividade = possiblyNull(randomBetween(1, 5, 0), missingProb)

      // Higienicidade (%)
      row.higienicidade = possiblyNull(randomBetween(60, 95, 1), missingProb)
    }

    data.push(row)
  }

  return data
}

/**
 * Converte array de objetos para CSV
 */
export function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) {
    return ''
  }

  // Headers
  const headers = Object.keys(data[0])
  let csv = `${headers.join(',')}\n`

  // Rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      // Se valor tem vírgula ou aspas, envolve em aspas
      if (value === null || value === undefined || value === '') {
        return ''
      }
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    csv += `${values.join(',')}\n`
  }

  return csv
}

/**
 * Faz download do CSV gerado
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Função principal para gerar e baixar dados de teste
 */
export function generateAndDownloadTestData(
  rows: number = 100,
  species: Species = 'bovino',
  subtype?: string
): void {
  const data = generateTestData({
    rows,
    species,
    subtype,
    includeNumeric: true,
    includeCategorical: true,
    includeMissing: true,
  })

  // Normalize species ID for label lookup
  const normalizedSpecies = normalizeSpeciesId(species)

  const csv = convertToCSV(data)
  const speciesLabel =
    {
      bovino: 'bovinos',
      suino: 'suinos',
      avicultura: 'aves',
      ovino: 'ovinos',
      caprino: 'caprinos',
      piscicultura: 'peixes',
      forragem: 'forragem',
      abelhas: 'abelhas',
    }[normalizedSpecies] ?? normalizedSpecies

  const subtypeLabel = subtype ? `_${subtype}` : ''
  const filename = `dados_teste_${speciesLabel}${subtypeLabel}_${rows}_registros_${new Date().toISOString().split('T')[0]}.csv`

  downloadCSV(filename, csv)
}
