/**
 * Sistema de Métricas Canônicas
 *
 * Define métricas padronizadas com aliases, unidades aceitas e regras de validação.
 * Permite mapeamento automático de colunas do usuário para métricas conhecidas.
 */

export interface CanonicalMetric {
  key: string // Chave canônica (ex: 'gpd')
  aliases: string[] // Aliases (ex: ['gmd', 'ganho_diario', 'daily_gain'])
  unit: string // Unidade padrão (ex: 'kg/dia')
  acceptedUnits: string[] // Unidades aceitas (ex: ['kg/dia', 'g/dia', 'lb/day'])
  species: string[] // Espécies aplicáveis
  category: string // Categoria (peso, performance, reprodução, etc.)
  description: string // Descrição
  validationRules?: {
    min?: number
    max?: number
    mustBePositive?: boolean
  }
}

export const CANONICAL_METRICS: CanonicalMetric[] = [
  {
    key: 'gpd',
    aliases: [
      'gmd',
      'ganho_diario',
      'ganho_peso_diario',
      'daily_gain',
      'adg',
      'average_daily_gain',
    ],
    unit: 'kg/dia',
    acceptedUnits: ['kg/dia', 'kg/day', 'g/dia', 'g/day', 'lb/day'],
    species: ['bovine', 'swine', 'sheep', 'goat', 'aquaculture'],
    category: 'performance',
    description: 'Ganho de Peso Diário',
    validationRules: {
      min: 0,
      max: 3,
      mustBePositive: true,
    },
  },
  {
    key: 'conversao_alimentar',
    aliases: ['ca', 'fcr', 'feed_conversion', 'conversao', 'feed_conversion_ratio'],
    unit: 'kg/kg',
    acceptedUnits: ['kg/kg', 'g/g', 'lb/lb'],
    species: ['bovine', 'swine', 'poultry', 'aquaculture'],
    category: 'performance',
    description: 'Conversão Alimentar',
    validationRules: {
      min: 0.5,
      max: 20,
      mustBePositive: true,
    },
  },
  {
    key: 'mortalidade',
    aliases: ['mortality', 'morte', 'death_rate', 'taxa_mortalidade'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'decimal'],
    species: ['bovine', 'swine', 'poultry', 'sheep', 'goat', 'aquaculture'],
    category: 'performance',
    description: 'Taxa de Mortalidade',
    validationRules: {
      min: 0,
      max: 100,
      mustBePositive: true,
    },
  },

  {
    key: 'peso',
    aliases: ['weight', 'peso_vivo', 'live_weight', 'body_weight'],
    unit: 'kg',
    acceptedUnits: ['kg', 'g', 'lb', 'arroba'],
    species: ['bovine', 'swine', 'sheep', 'goat'],
    category: 'peso',
    description: 'Peso Corporal',
    validationRules: {
      min: 0,
      max: 1500,
      mustBePositive: true,
    },
  },
  {
    key: 'peso_nascimento',
    aliases: ['birth_weight', 'peso_nasc', 'peso_ao_nascer'],
    unit: 'kg',
    acceptedUnits: ['kg', 'g', 'lb'],
    species: ['bovine', 'swine', 'sheep', 'goat'],
    category: 'peso',
    description: 'Peso ao Nascimento',
    validationRules: {
      min: 0.5,
      max: 60,
      mustBePositive: true,
    },
  },
  {
    key: 'peso_desmame',
    aliases: ['weaning_weight', 'peso_desmama', 'peso_ao_desmame'],
    unit: 'kg',
    acceptedUnits: ['kg', 'g', 'lb'],
    species: ['bovine', 'swine', 'sheep', 'goat'],
    category: 'peso',
    description: 'Peso ao Desmame',
    validationRules: {
      min: 5,
      max: 350,
      mustBePositive: true,
    },
  },
  {
    key: 'peso_abate',
    aliases: ['slaughter_weight', 'peso_final', 'final_weight'],
    unit: 'kg',
    acceptedUnits: ['kg', 'g', 'lb', 'arroba'],
    species: ['bovine', 'swine', 'sheep', 'goat', 'aquaculture'],
    category: 'peso',
    description: 'Peso ao Abate',
    validationRules: {
      min: 10,
      max: 800,
      mustBePositive: true,
    },
  },

  {
    key: 'producao_leite',
    aliases: ['milk_production', 'leite', 'milk_yield', 'producao_leiteira'],
    unit: 'L/dia',
    acceptedUnits: ['L/dia', 'L/day', 'kg/dia', 'kg/day'],
    species: ['bovine', 'goat'],
    category: 'producao',
    description: 'Produção de Leite',
    validationRules: {
      min: 0,
      max: 80,
      mustBePositive: true,
    },
  },
  {
    key: 'proteina_leite',
    aliases: ['milk_protein', 'proteina', 'protein'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'g/L'],
    species: ['bovine', 'goat'],
    category: 'qualidade',
    description: 'Proteína do Leite',
    validationRules: {
      min: 2,
      max: 5,
      mustBePositive: true,
    },
  },
  {
    key: 'gordura_leite',
    aliases: ['milk_fat', 'gordura', 'fat'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'g/L'],
    species: ['bovine', 'goat'],
    category: 'qualidade',
    description: 'Gordura do Leite',
    validationRules: {
      min: 2,
      max: 6,
      mustBePositive: true,
    },
  },
  {
    key: 'celulas_somaticas',
    aliases: ['scc', 'somatic_cells', 'ccs'],
    unit: 'cel/mL',
    acceptedUnits: ['cel/mL', 'cells/mL', 'x1000'],
    species: ['bovine', 'goat'],
    category: 'qualidade',
    description: 'Contagem de Células Somáticas',
    validationRules: {
      min: 0,
      max: 2000000,
      mustBePositive: true,
    },
  },

  {
    key: 'rendimento_carcaca',
    aliases: ['carcass_yield', 'rendimento', 'dressing_percentage'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'decimal'],
    species: ['bovine', 'swine', 'sheep', 'goat', 'poultry'],
    category: 'carcaca',
    description: 'Rendimento de Carcaça',
    validationRules: {
      min: 40,
      max: 80,
      mustBePositive: true,
    },
  },
  {
    key: 'area_olho_lombo',
    aliases: ['aol', 'ribeye_area', 'loin_eye_area'],
    unit: 'cm²',
    acceptedUnits: ['cm²', 'cm2', 'in²', 'in2'],
    species: ['bovine', 'swine'],
    category: 'carcaca',
    description: 'Área de Olho de Lombo',
    validationRules: {
      min: 30,
      max: 150,
      mustBePositive: true,
    },
  },
  {
    key: 'espessura_gordura',
    aliases: ['backfat', 'fat_thickness', 'espessura_toucinho'],
    unit: 'mm',
    acceptedUnits: ['mm', 'cm', 'in'],
    species: ['bovine', 'swine'],
    category: 'carcaca',
    description: 'Espessura de Gordura',
    validationRules: {
      min: 0,
      max: 30,
      mustBePositive: true,
    },
  },

  {
    key: 'intervalo_partos',
    aliases: ['calving_interval', 'intervalo_entre_partos', 'farrowing_interval'],
    unit: 'dias',
    acceptedUnits: ['dias', 'days', 'meses', 'months'],
    species: ['bovine', 'swine', 'sheep', 'goat'],
    category: 'reproducao',
    description: 'Intervalo Entre Partos',
    validationRules: {
      min: 200,
      max: 600,
      mustBePositive: true,
    },
  },
  {
    key: 'leitoes_nascidos_vivos',
    aliases: ['born_alive', 'leitoes_vivos', 'piglets_born_alive'],
    unit: 'leitões',
    acceptedUnits: ['leitões', 'piglets', 'unidades'],
    species: ['swine'],
    category: 'reproducao',
    description: 'Leitões Nascidos Vivos',
    validationRules: {
      min: 0,
      max: 20,
      mustBePositive: true,
    },
  },
  {
    key: 'taxa_concepcao',
    aliases: ['conception_rate', 'taxa_prenhez', 'pregnancy_rate'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'decimal'],
    species: ['bovine', 'swine', 'sheep', 'goat'],
    category: 'reproducao',
    description: 'Taxa de Concepção',
    validationRules: {
      min: 0,
      max: 100,
      mustBePositive: true,
    },
  },

  {
    key: 'iep',
    aliases: ['epi', 'production_efficiency_index', 'indice_eficiencia'],
    unit: 'pontos',
    acceptedUnits: ['pontos', 'points', 'index'],
    species: ['poultry'],
    category: 'performance',
    description: 'Índice de Eficiência Produtiva',
    validationRules: {
      min: 0,
      max: 500,
      mustBePositive: true,
    },
  },
  {
    key: 'producao_ovos',
    aliases: ['egg_production', 'postura', 'laying_rate'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'decimal'],
    species: ['poultry'],
    category: 'producao',
    description: 'Taxa de Postura',
    validationRules: {
      min: 0,
      max: 100,
      mustBePositive: true,
    },
  },
  {
    key: 'peso_ovo',
    aliases: ['egg_weight', 'peso_medio_ovo'],
    unit: 'g',
    acceptedUnits: ['g', 'kg', 'oz'],
    species: ['poultry'],
    category: 'producao',
    description: 'Peso do Ovo',
    validationRules: {
      min: 40,
      max: 80,
      mustBePositive: true,
    },
  },

  {
    key: 'oxigenio_dissolvido',
    aliases: ['dissolved_oxygen', 'od', 'do', 'oxigenio'],
    unit: 'mg/L',
    acceptedUnits: ['mg/L', 'ppm'],
    species: ['aquaculture'],
    category: 'qualidade_agua',
    description: 'Oxigênio Dissolvido',
    validationRules: {
      min: 0,
      max: 15,
      mustBePositive: true,
    },
  },
  {
    key: 'temperatura',
    aliases: ['temperature', 'temp', 'temperatura_agua'],
    unit: '°C',
    acceptedUnits: ['°C', 'C', '°F', 'F'],
    species: ['aquaculture', 'bovine', 'swine', 'poultry'],
    category: 'ambiente',
    description: 'Temperatura',
    validationRules: {
      min: -10,
      max: 50,
    },
  },
  {
    key: 'ph',
    aliases: ['ph_agua', 'water_ph'],
    unit: '',
    acceptedUnits: ['', 'pH'],
    species: ['aquaculture'],
    category: 'qualidade_agua',
    description: 'pH da Água',
    validationRules: {
      min: 4,
      max: 11,
      mustBePositive: true,
    },
  },
  {
    key: 'densidade_estocagem',
    aliases: ['stocking_density', 'densidade', 'density'],
    unit: 'peixes/m³',
    acceptedUnits: ['peixes/m³', 'fish/m³', 'peixes/m²', 'fish/m²'],
    species: ['aquaculture'],
    category: 'manejo',
    description: 'Densidade de Estocagem',
    validationRules: {
      min: 0,
      max: 50,
      mustBePositive: true,
    },
  },

  {
    key: 'biomassa_seca',
    aliases: ['dry_matter', 'biomassa', 'dm', 'materia_seca'],
    unit: 'kg/ha',
    acceptedUnits: ['kg/ha', 't/ha', 'ton/ha'],
    species: ['forage'],
    category: 'producao',
    description: 'Biomassa Seca',
    validationRules: {
      min: 0,
      max: 15000,
      mustBePositive: true,
    },
  },
  {
    key: 'proteina_bruta',
    aliases: ['crude_protein', 'cp', 'pb', 'protein'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'g/kg'],
    species: ['forage'],
    category: 'qualidade',
    description: 'Proteína Bruta',
    validationRules: {
      min: 0,
      max: 30,
      mustBePositive: true,
    },
  },
  {
    key: 'fdn',
    aliases: ['ndf', 'neutral_detergent_fiber', 'fibra_neutro'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'g/kg'],
    species: ['forage'],
    category: 'qualidade',
    description: 'Fibra em Detergente Neutro',
    validationRules: {
      min: 30,
      max: 85,
      mustBePositive: true,
    },
  },
  {
    key: 'digestibilidade',
    aliases: ['digestibility', 'dig', 'digestibilidade_ms'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'decimal'],
    species: ['forage'],
    category: 'qualidade',
    description: 'Digestibilidade',
    validationRules: {
      min: 30,
      max: 90,
      mustBePositive: true,
    },
  },

  {
    key: 'escore_corporal',
    aliases: ['bcs', 'body_condition_score', 'ecc', 'condicao_corporal'],
    unit: 'pontos',
    acceptedUnits: ['pontos', 'points', 'score'],
    species: ['bovine', 'sheep', 'goat'],
    category: 'condicao',
    description: 'Escore de Condição Corporal',
    validationRules: {
      min: 1,
      max: 9,
      mustBePositive: true,
    },
  },

  // ABELHAS - Métricas de Apicultura
  {
    key: 'producao_mel_colmeia_ano',
    aliases: ['producao_mel', 'mel_colmeia', 'honey_production', 'mel_ano'],
    unit: 'kg/colmeia/ano',
    acceptedUnits: ['kg/colmeia/ano', 'kg/hive/year', 'kg/ano'],
    species: ['bees'],
    category: 'producao',
    description: 'Produção de Mel por Colmeia por Ano',
    validationRules: {
      min: 0,
      max: 100,
      mustBePositive: true,
    },
  },
  {
    key: 'producao_propolis_colmeia_ano',
    aliases: ['producao_propolis', 'propolis', 'propolis_production'],
    unit: 'g/colmeia/ano',
    acceptedUnits: ['g/colmeia/ano', 'g/hive/year', 'kg/colmeia/ano'],
    species: ['bees'],
    category: 'producao',
    description: 'Produção de Própolis por Colmeia por Ano',
    validationRules: {
      min: 0,
      max: 500,
      mustBePositive: true,
    },
  },
  {
    key: 'producao_polen_colmeia_ano',
    aliases: ['producao_polen', 'polen', 'pollen_production'],
    unit: 'kg/colmeia/ano',
    acceptedUnits: ['kg/colmeia/ano', 'g/colmeia/ano', 'kg/hive/year'],
    species: ['bees'],
    category: 'producao',
    description: 'Produção de Pólen por Colmeia por Ano',
    validationRules: {
      min: 0,
      max: 10,
      mustBePositive: true,
    },
  },
  {
    key: 'producao_cera_colmeia_ano',
    aliases: ['producao_cera', 'cera', 'wax_production'],
    unit: 'kg/colmeia/ano',
    acceptedUnits: ['kg/colmeia/ano', 'g/colmeia/ano', 'kg/hive/year'],
    species: ['bees'],
    category: 'producao',
    description: 'Produção de Cera por Colmeia por Ano',
    validationRules: {
      min: 0,
      max: 5,
      mustBePositive: true,
    },
  },
  {
    key: 'producao_geleia_real_colmeia_ano',
    aliases: ['producao_geleia', 'geleia_real', 'royal_jelly', 'geleia'],
    unit: 'g/colmeia/ano',
    acceptedUnits: ['g/colmeia/ano', 'g/hive/year', 'kg/colmeia/ano'],
    species: ['bees'],
    category: 'producao',
    description: 'Produção de Geleia Real por Colmeia por Ano',
    validationRules: {
      min: 0,
      max: 1000,
      mustBePositive: true,
    },
  },
  {
    key: 'populacao_abelhas_colmeia',
    aliases: ['populacao_abelhas', 'populacao', 'bee_population', 'abelhas'],
    unit: 'abelhas',
    acceptedUnits: ['abelhas', 'bees', 'individuos'],
    species: ['bees'],
    category: 'populacao',
    description: 'População de Abelhas por Colmeia',
    validationRules: {
      min: 500,
      max: 80000,
      mustBePositive: true,
    },
  },
  {
    key: 'quadros_cria',
    aliases: ['cria', 'brood_frames', 'quadros_de_cria'],
    unit: 'quadros',
    acceptedUnits: ['quadros', 'frames', 'unidades'],
    species: ['bees'],
    category: 'manejo',
    description: 'Número de Quadros de Cria',
    validationRules: {
      min: 0,
      max: 20,
      mustBePositive: true,
    },
  },
  {
    key: 'quadros_mel',
    aliases: ['mel_quadros', 'honey_frames', 'quadros_de_mel'],
    unit: 'quadros',
    acceptedUnits: ['quadros', 'frames', 'unidades'],
    species: ['bees'],
    category: 'manejo',
    description: 'Número de Quadros de Mel',
    validationRules: {
      min: 0,
      max: 20,
      mustBePositive: true,
    },
  },
  {
    key: 'taxa_enxameacao',
    aliases: ['enxameacao', 'swarming_rate', 'taxa_enxame'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'decimal'],
    species: ['bees'],
    category: 'comportamento',
    description: 'Taxa de Enxameação',
    validationRules: {
      min: 0,
      max: 100,
      mustBePositive: true,
    },
  },
  {
    key: 'mortalidade_colmeias',
    aliases: ['mortalidade', 'mortality_rate', 'perda_colmeias'],
    unit: '%/ano',
    acceptedUnits: ['%/ano', '%', 'percent'],
    species: ['bees'],
    category: 'sanidade',
    description: 'Taxa de Mortalidade de Colmeias',
    validationRules: {
      min: 0,
      max: 100,
      mustBePositive: true,
    },
  },
  {
    key: 'umidade_mel',
    aliases: ['umidade', 'moisture', 'humidity_honey'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'decimal'],
    species: ['bees'],
    category: 'qualidade',
    description: 'Umidade do Mel',
    validationRules: {
      min: 10,
      max: 40,
      mustBePositive: true,
    },
  },
  {
    key: 'acidez_mel',
    aliases: ['acidez', 'acidity', 'acidez_livre'],
    unit: 'meq/kg',
    acceptedUnits: ['meq/kg', 'mEq/kg'],
    species: ['bees'],
    category: 'qualidade',
    description: 'Acidez do Mel',
    validationRules: {
      min: 0,
      max: 100,
      mustBePositive: true,
    },
  },
  {
    key: 'hidroximetilfurfural',
    aliases: ['hmf', 'hydroxymethylfurfural', 'hidroximetilfurfural_hmf'],
    unit: 'mg/kg',
    acceptedUnits: ['mg/kg', 'ppm'],
    species: ['bees'],
    category: 'qualidade',
    description: 'Hidroximetilfurfural (HMF)',
    validationRules: {
      min: 0,
      max: 80,
      mustBePositive: true,
    },
  },
  {
    key: 'atividade_diastatica',
    aliases: ['diastase', 'diastatic_activity', 'atividade_diastase'],
    unit: 'unidades Gothe',
    acceptedUnits: ['unidades Gothe', 'Gothe', 'unidades'],
    species: ['bees'],
    category: 'qualidade',
    description: 'Atividade Diastásica',
    validationRules: {
      min: 0,
      max: 50,
      mustBePositive: true,
    },
  },
  {
    key: 'taxa_postura_rainha',
    aliases: ['postura_rainha', 'egg_laying', 'ovos_dia', 'postura'],
    unit: 'ovos/dia',
    acceptedUnits: ['ovos/dia', 'eggs/day', 'ovos'],
    species: ['bees'],
    category: 'reproducao',
    description: 'Taxa de Postura da Rainha',
    validationRules: {
      min: 0,
      max: 3000,
      mustBePositive: true,
    },
  },
  {
    key: 'longevidade_rainha',
    aliases: ['idade_rainha', 'queen_age', 'longevidade'],
    unit: 'anos',
    acceptedUnits: ['anos', 'years', 'meses'],
    species: ['bees'],
    category: 'reproducao',
    description: 'Longevidade da Rainha',
    validationRules: {
      min: 0,
      max: 5,
      mustBePositive: true,
    },
  },
  {
    key: 'taxa_fecundacao_rainha',
    aliases: ['fecundacao_rainha', 'mating_success', 'fecundacao'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'decimal'],
    species: ['bees'],
    category: 'reproducao',
    description: 'Taxa de Fecundação da Rainha',
    validationRules: {
      min: 0,
      max: 100,
      mustBePositive: true,
    },
  },
  {
    key: 'defensividade',
    aliases: ['agressividade', 'defensive_behavior', 'comportamento_defensivo'],
    unit: 'escala 1-5',
    acceptedUnits: ['escala 1-5', 'pontos', 'score'],
    species: ['bees'],
    category: 'comportamento',
    description: 'Defensividade',
    validationRules: {
      min: 1,
      max: 5,
      mustBePositive: true,
    },
  },
  {
    key: 'higienicidade',
    aliases: ['comportamento_higienico', 'hygienic_behavior', 'higiene'],
    unit: '%',
    acceptedUnits: ['%', 'percent', 'decimal'],
    species: ['bees'],
    category: 'comportamento',
    description: 'Comportamento Higiênico',
    validationRules: {
      min: 0,
      max: 100,
      mustBePositive: true,
    },
  },
]

/**
 * Resolve uma coluna do usuário para uma métrica canônica
 */
export function resolveMetric(columnName: string, species?: string): CanonicalMetric | null {
  const normalized = columnName
    .toLowerCase()
    .trim()
    .replace(/[_\s-]+/g, '_') // Normalizar separadores
    .replace(/[áàâã]/g, 'a')
    .replace(/[éèê]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óòôõ]/g, 'o')
    .replace(/[úù]/g, 'u')
    .replace(/ç/g, 'c')

  let metric = CANONICAL_METRICS.find((m) => m.key === normalized)

  if (!metric) {
    metric = CANONICAL_METRICS.find((m) =>
      m.aliases.some((alias) => {
        const normalizedAlias = alias.toLowerCase().replace(/[_\s-]+/g, '_')
        return normalized.includes(normalizedAlias) || normalizedAlias.includes(normalized)
      })
    )
  }

  if (metric && species && !metric.species.includes(species)) {
    return null
  }

  return metric || null
}

/**
 * Conversões de unidades
 */
const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  g: { kg: 0.001, lb: 0.00220462, arroba: 0.00003333 },
  kg: { g: 1000, lb: 2.20462, arroba: 0.03333 },
  lb: { kg: 0.453592, g: 453.592, arroba: 0.01512 },
  arroba: { kg: 30, g: 30000, lb: 66.1387 },

  'g/dia': { 'kg/dia': 0.001, 'g/day': 1, 'kg/day': 0.001, 'lb/day': 0.00220462 },
  'kg/dia': { 'g/dia': 1000, 'kg/day': 1, 'g/day': 1000, 'lb/day': 2.20462 },
  'g/day': { 'kg/day': 0.001, 'g/dia': 1, 'kg/dia': 0.001 },
  'kg/day': { 'g/day': 1000, 'kg/dia': 1, 'g/dia': 1000 },

  'L/dia': { 'L/day': 1, 'kg/dia': 1.03, 'kg/day': 1.03 },
  'L/day': { 'L/dia': 1, 'kg/day': 1.03, 'kg/dia': 1.03 },

  '°C': { C: 1 },
  C: { '°C': 1 },

  '%': { percent: 1, decimal: 0.01 },
  percent: { '%': 1, decimal: 0.01 },
  decimal: { '%': 100, percent: 100 },

  'cm²': { cm2: 1, 'in²': 0.155, in2: 0.155 },
  cm2: { 'cm²': 1, in2: 0.155, 'in²': 0.155 },
  'in²': { in2: 1, 'cm²': 6.4516, cm2: 6.4516 },
  in2: { 'in²': 1, cm2: 6.4516, 'cm²': 6.4516 },

  mm: { cm: 0.1, in: 0.0393701 },
  cm: { mm: 10, in: 0.393701 },
  in: { cm: 2.54, mm: 25.4 },

  dias: { days: 1, meses: 0.0333, months: 0.0333 },
  days: { dias: 1, months: 0.0333, meses: 0.0333 },
  meses: { months: 1, dias: 30, days: 30 },
  months: { meses: 1, days: 30, dias: 30 },

  'kg/ha': { 't/ha': 0.001, 'ton/ha': 0.001 },
  't/ha': { 'kg/ha': 1000, 'ton/ha': 1 },
  'ton/ha': { 'kg/ha': 1000, 't/ha': 1 },
}

/**
 * Converte valor de uma unidade para outra
 */
export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  const normalizeUnit = (unit: string) => unit.toLowerCase().trim()
  const from = normalizeUnit(fromUnit)
  const to = normalizeUnit(toUnit)

  if (from === to) {
    return value
  }

  const conversions = UNIT_CONVERSIONS[from]
  if (!conversions) {
    console.warn(`Conversão não encontrada para unidade: ${fromUnit}`)
    return value
  }

  const factor = conversions[to]
  if (factor === undefined) {
    console.warn(`Conversão não encontrada de ${fromUnit} para ${toUnit}`)
    return value
  }

  return value * factor
}

/**
 * Valida se um valor está dentro das regras da métrica
 */
export function validateMetricValue(
  value: number,
  metric: CanonicalMetric
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!metric.validationRules) {
    return { valid: true, errors: [] }
  }

  const rules = metric.validationRules

  if (rules.mustBePositive && value < 0) {
    errors.push(`${metric.description} deve ser positivo`)
  }

  if (rules.min !== undefined && value < rules.min) {
    errors.push(`${metric.description} abaixo do mínimo (${rules.min} ${metric.unit})`)
  }

  if (rules.max !== undefined && value > rules.max) {
    errors.push(`${metric.description} acima do máximo (${rules.max} ${metric.unit})`)
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Obtém métricas disponíveis para uma espécie
 */
export function getMetricsForSpecies(species: string): CanonicalMetric[] {
  return CANONICAL_METRICS.filter((m) => m.species.includes(species))
}

/**
 * Obtém métricas por categoria
 */
export function getMetricsByCategory(category: string): CanonicalMetric[] {
  return CANONICAL_METRICS.filter((m) => m.category === category)
}
