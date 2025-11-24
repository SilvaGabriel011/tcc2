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

  for (let i = 1; i <= config.rows; i++) {
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

    const row: Record<string, unknown> = {
      ID: `BOV${String(i).padStart(5, '0')}`,
      ANIMAL: `BOV${String(i).padStart(4, '0')}`,
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.peso_nascimento = possiblyNull(pesoNasc, missingProb)
      row.peso_desmame = possiblyNull(pesoDesmame, missingProb)
      row.peso = possiblyNull(pesoAtual, missingProb)
      row.idade_meses = possiblyNull(idadeMeses, missingProb)
      row.gpd = possiblyNull(randomBetween(0.8, 1.4, 3), missingProb)
      row.conversao = possiblyNull(randomBetween(5.5, 8.5, 2), missingProb)
      row.rendimento_carcaca = possiblyNull(randomBetween(50, 58, 1), missingProb)
      row.escore_corporal = possiblyNull(randomBetween(3, 4, 1), missingProb)
      row.mortalidade = possiblyNull(randomBetween(0.5, 3.5, 2), missingProb)
      row.producao_leite =
        categoria === 'Leiteira' ? possiblyNull(randomBetween(25, 40, 1), missingProb) : null
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

    let pesoAtual, idadeDias

    if (categoria === 'Leitão') {
      pesoAtual = randomBetween(1.2, 1.8, 2)
      idadeDias = randomBetween(1, 21, 0)
    } else if (categoria === 'Crescimento') {
      pesoAtual = randomBetween(25, 60, 1)
      idadeDias = randomBetween(60, 100, 0)
    } else if (categoria === 'Terminação') {
      pesoAtual = randomBetween(100, 130, 1)
      idadeDias = randomBetween(150, 180, 0)
    } else {
      pesoAtual = sexo === 'Macho' ? randomBetween(250, 350, 1) : randomBetween(180, 250, 1)
      idadeDias = randomBetween(200, 400, 0)
    }

    const row: Record<string, unknown> = {
      ID: `SUI${String(i).padStart(5, '0')}`,
      ANIMAL: `SUI${String(i).padStart(4, '0')}`,
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.peso = possiblyNull(pesoAtual, missingProb)
      row.idade_dias = possiblyNull(idadeDias, missingProb)
      row.gpd = possiblyNull(randomBetween(0.75, 1.05, 3), missingProb)
      row.conversao = possiblyNull(randomBetween(2.5, 3.2, 2), missingProb)
      row.rendimento_carcaca = possiblyNull(randomBetween(76, 82, 1), missingProb)
      row.espessura_toucinho = possiblyNull(randomBetween(12, 18, 1), missingProb)
      row.mortalidade = possiblyNull(randomBetween(1, 4, 2), missingProb)
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

    let pesoAtual, idadeDias

    if (categoria === 'Inicial') {
      pesoAtual = randomBetween(0.04, 0.15, 3)
      idadeDias = randomBetween(1, 7, 0)
    } else if (categoria === 'Crescimento') {
      pesoAtual = randomBetween(0.8, 1.5, 2)
      idadeDias = randomBetween(21, 35, 0)
    } else if (categoria === 'Terminação') {
      pesoAtual = randomBetween(2.5, 3.2, 2)
      idadeDias = randomBetween(42, 49, 0)
    } else {
      pesoAtual = randomBetween(1.8, 2.2, 2)
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
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.peso = possiblyNull(pesoAtual, missingProb) // Em kg
      row.idade_dias = possiblyNull(idadeDias, missingProb)
      row.gpd = possiblyNull(randomBetween(0.045, 0.065, 3), missingProb) // kg/dia
      row.conversao = possiblyNull(randomBetween(1.6, 2.0, 2), missingProb)
      row.mortalidade = possiblyNull(randomBetween(2, 6, 1), missingProb)
      row.viabilidade = possiblyNull(randomBetween(94, 98, 1), missingProb)
      row.iep = possiblyNull(randomBetween(320, 380, 0), missingProb) // Índice de Eficiência Produtiva
      row.producao_ovos =
        categoria === 'Postura' ? possiblyNull(randomBetween(280, 320, 0), missingProb) : null
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

    let pesoAtual = 45
    if (categoria === 'Cordeiro') {
      pesoAtual = randomBetween(25, 35, 1)
    } else if (categoria === 'Borrego') {
      pesoAtual = randomBetween(35, 45, 1)
    } else if (categoria === 'Adulto') {
      pesoAtual = randomBetween(45, 70, 1)
    } else {
      pesoAtual = randomBetween(40, 55, 1)
    }

    const row: Record<string, unknown> = {
      ID: `OVI${String(i).padStart(5, '0')}`,
      ANIMAL: `OVI${String(i).padStart(4, '0')}`,
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.peso = possiblyNull(pesoAtual, missingProb)
      row.idade_meses = possiblyNull(randomBetween(6, 36, 0), missingProb)
      row.gpd = possiblyNull(randomBetween(0.15, 0.28, 3), missingProb)
      row.conversao = possiblyNull(randomBetween(4.5, 6.5, 2), missingProb)
      row.rendimento_carcaca = possiblyNull(randomBetween(44, 50, 1), missingProb)
      row.mortalidade = possiblyNull(randomBetween(2, 6, 1), missingProb)
      row.prolificidade =
        categoria === 'Matriz' ? possiblyNull(randomBetween(1.2, 1.8, 2), missingProb) : null
      row.producao_la = possiblyNull(randomBetween(2, 5, 1), missingProb) // kg/ano
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

    let pesoAtual = 40
    if (categoria === 'Cabrito') {
      pesoAtual = randomBetween(15, 25, 1)
    } else if (categoria === 'Jovem') {
      pesoAtual = randomBetween(25, 40, 1)
    } else if (categoria === 'Adulto') {
      pesoAtual = randomBetween(40, 65, 1)
    } else {
      pesoAtual = randomBetween(35, 50, 1)
    }

    const row: Record<string, unknown> = {
      ID: `CAP${String(i).padStart(5, '0')}`,
      ANIMAL: `CAP${String(i).padStart(4, '0')}`,
    }

    if (config.includeCategorical) {
      row.RACA = possiblyNull(raca, missingProb)
      row.SEXO = possiblyNull(sexo, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.peso = possiblyNull(pesoAtual, missingProb)
      row.idade_meses = possiblyNull(randomBetween(6, 36, 0), missingProb)
      row.gpd = possiblyNull(randomBetween(0.12, 0.22, 3), missingProb)
      row.conversao = possiblyNull(randomBetween(5, 7, 2), missingProb)
      row.rendimento_carcaca = possiblyNull(randomBetween(42, 48, 1), missingProb)
      row.mortalidade = possiblyNull(randomBetween(3, 7, 1), missingProb)
      row.prolificidade =
        categoria === 'Matriz' ? possiblyNull(randomBetween(1.5, 2.2, 2), missingProb) : null
      row.producao_leite =
        categoria === 'Matriz' ? possiblyNull(randomBetween(1.5, 3.5, 2), missingProb) : null
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

    let pesoAtual = 1
    if (categoria === 'Alevino') {
      pesoAtual = randomBetween(0.005, 0.03, 3)
    } else if (categoria === 'Juvenil') {
      pesoAtual = randomBetween(0.1, 0.5, 2)
    } else if (categoria === 'Adulto') {
      pesoAtual = randomBetween(0.8, 2.5, 2)
    } else {
      pesoAtual = randomBetween(2, 4, 2)
    }

    const row: Record<string, unknown> = {
      ID: `PEI${String(i).padStart(5, '0')}`,
      TANQUE: `T${String(Math.ceil(i / 50)).padStart(2, '0')}`,
    }

    if (config.includeCategorical) {
      row.ESPECIE = possiblyNull(especie, missingProb)
      row.CATEGORIA = possiblyNull(categoria, missingProb)
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.peso = possiblyNull(pesoAtual, missingProb)
      row.idade_dias = possiblyNull(randomBetween(30, 240, 0), missingProb)
      row.gpd = possiblyNull(randomBetween(0.003, 0.015, 4), missingProb) // kg/dia
      row.conversao = possiblyNull(randomBetween(1.2, 2.0, 2), missingProb)
      row.mortalidade = possiblyNull(randomBetween(3, 10, 1), missingProb)
      row.biomassa_kg_ha = possiblyNull(randomBetween(2000, 8000, 0), missingProb)
      row.oxigenio_mg_l = possiblyNull(randomBetween(4, 7, 1), missingProb)
      row.ph_agua = possiblyNull(randomBetween(6.5, 8.5, 1), missingProb)
      row.temperatura_agua = possiblyNull(randomBetween(24, 30, 1), missingProb)
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
      row.ESTADO = possiblyNull(randomChoice(ESTADOS), missingProb)
      row.MES = possiblyNull(randomChoice(MESES), missingProb)
      row.ESTACAO = possiblyNull(randomChoice(['Águas', 'Seca']), missingProb)
    }

    if (config.includeNumeric) {
      row.ANO = possiblyNull(randomBetween(2023, 2025, 0), missingProb)
      row.biomassa_kg_ha = possiblyNull(randomBetween(3000, 8000, 0), missingProb)
      row.altura_cm = possiblyNull(randomBetween(25, 80, 1), missingProb)
      row.proteina_bruta = possiblyNull(randomBetween(8, 16, 1), missingProb) // %
      row.fdn = possiblyNull(randomBetween(55, 72, 1), missingProb) // % fibra detergente neutro
      row.fda = possiblyNull(randomBetween(30, 45, 1), missingProb) // % fibra detergente ácido
      row.digestibilidade = possiblyNull(randomBetween(55, 75, 1), missingProb) // %
      row.materia_seca = possiblyNull(randomBetween(20, 35, 1), missingProb) // %
      row.producao_anual = possiblyNull(randomBetween(15000, 40000, 0), missingProb) // kg/ha/ano
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
export function generateAndDownloadTestData(rows: number = 100, species: Species = 'bovino'): void {
  const data = generateTestData({
    rows,
    species,
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

  const filename = `dados_teste_${speciesLabel}_${rows}_registros_${new Date().toISOString().split('T')[0]}.csv`

  downloadCSV(filename, csv)
}
