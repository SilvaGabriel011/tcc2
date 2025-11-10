/**
 * Gerador de Diagnóstico Zootécnico Inteligente
 * Analisa dados reais e gera insights relevantes
 */

interface Statistics {
  numericStats?: Record<
    string,
    {
      mean: number
      median?: number
      stdDev?: number
      cv?: number
      min?: number
      max?: number
      count?: number
    }
  >
  means?: Record<string, number>
  medians?: Record<string, number>
  stdDevs?: Record<string, number>
  cvs?: Record<string, number>
  mins?: Record<string, number>
  maxs?: Record<string, number>
  counts?: Record<string, number>
}

interface References {
  comparisons: Array<{
    metric: string
    value: number
    reference?: { min: number; max: number }
    status: string
    deviation?: number
  }>
  overallStatus: string
  summary: string
}

interface Correlations {
  report?: {
    topCorrelations?: Array<{
      var1: string
      var2: string
      coefficient: number
      significant: boolean
    }>
  }
}

interface DiagnosticoData {
  species: string
  subtype?: string
  statistics: Statistics
  references: References
  correlations?: Correlations
  metadata?: Record<string, unknown>
}

interface DiagnosticoResult {
  resumoExecutivo: string
  analiseNumericas: Array<{
    variavel: string
    status: 'Excelente' | 'Bom' | 'Regular' | 'Preocupante'
    interpretacao: string
    comparacaoLiteratura?: string
  }>
  pontosFortes: string[]
  pontosAtencao: string[]
  recomendacoesPrioritarias: Array<{
    titulo: string
    descricao: string
    prioridade: 'Alta' | 'Média' | 'Baixa'
  }>
  conclusao: string
  fontes: string[]
}

/**
 * Gera diagnóstico baseado nos dados reais da análise
 */
export function generateDiagnostico(data: DiagnosticoData): DiagnosticoResult {
  const { species, subtype, statistics, references, correlations } = data

  // Análise das variáveis numéricas
  const analiseNumericas = analyzeNumericVariables(statistics, references, species)

  // Identificar pontos fortes e de atenção
  const { pontosFortes, pontosAtencao } = identifyStrengthsAndWeaknesses(
    analiseNumericas,
    correlations,
    species
  )

  // Gerar recomendações específicas
  const recomendacoesPrioritarias = generateRecommendations(
    pontosAtencao,
    species,
    subtype,
    statistics
  )

  // Criar resumo executivo
  const resumoExecutivo = createExecutiveSummary(
    species,
    subtype,
    statistics,
    analiseNumericas,
    pontosFortes.length,
    pontosAtencao.length
  )

  // Conclusão
  const conclusao = generateConclusion(
    species,
    pontosFortes,
    pontosAtencao,
    recomendacoesPrioritarias
  )

  return {
    resumoExecutivo,
    analiseNumericas,
    pontosFortes,
    pontosAtencao,
    recomendacoesPrioritarias,
    conclusao,
    fontes: [
      'NRC - National Research Council (2021)',
      'EMBRAPA - Empresa Brasileira de Pesquisa Agropecuária (2023)',
      'Tabelas Brasileiras para Aves e Suínos (2017)',
      'Manual de Bovinocultura de Corte - EMBRAPA (2022)',
    ],
  }
}

function analyzeNumericVariables(
  statistics: Statistics,
  references: References,
  species: string
): DiagnosticoResult['analiseNumericas'] {
  const result: DiagnosticoResult['analiseNumericas'] = []

  if (!statistics?.numericStats) {
    return result
  }

  // Mapear variáveis conhecidas para análise específica
  const variableMapping: Record<
    string,
    {
      name: string
      ideal: { min: number; max: number }
      unit: string
      interpretation: (value: number, species: string) => string
    }
  > = {
    peso: {
      name: 'Peso Corporal',
      ideal: { min: getIdealWeight(species, 'min'), max: getIdealWeight(species, 'max') },
      unit: 'kg',
      interpretation: (value, species) => {
        const ideal = getIdealWeight(species, 'avg')
        const diff = ((value - ideal) / ideal) * 100
        if (Math.abs(diff) < 5) {
          return 'Peso dentro da faixa ideal para a espécie'
        }
        if (diff > 5) {
          return `Peso ${diff.toFixed(1)}% acima do ideal - avaliar dieta`
        }
        return `Peso ${Math.abs(diff).toFixed(1)}% abaixo do ideal - revisar nutrição`
      },
    },
    gpd: {
      name: 'Ganho de Peso Diário',
      ideal: { min: 0.8, max: 1.5 },
      unit: 'kg/dia',
      interpretation: (value) => {
        if (value < 0.8) {
          return 'GPD abaixo do esperado - revisar manejo nutricional'
        }
        if (value > 1.5) {
          return 'Excelente GPD - manter programa atual'
        }
        return 'GPD dentro dos padrões zootécnicos'
      },
    },
    conversao: {
      name: 'Conversão Alimentar',
      ideal: { min: 1.5, max: 3.0 },
      unit: 'kg/kg',
      interpretation: (value) => {
        if (value < 2.0) {
          return 'Excelente eficiência alimentar'
        }
        if (value > 3.0) {
          return 'Conversão alta - otimizar formulação da dieta'
        }
        return 'Conversão alimentar adequada'
      },
    },
    mortalidade: {
      name: 'Taxa de Mortalidade',
      ideal: { min: 0, max: 3 },
      unit: '%',
      interpretation: (value) => {
        if (value < 1) {
          return 'Excelente controle sanitário'
        }
        if (value > 3) {
          return 'Mortalidade elevada - revisar programa sanitário urgentemente'
        }
        return 'Mortalidade dentro dos limites aceitáveis'
      },
    },
    producao_leite: {
      name: 'Produção de Leite',
      ideal: { min: 25, max: 40 },
      unit: 'L/dia',
      interpretation: (value) => {
        if (value < 25) {
          return 'Produção abaixo do potencial - avaliar nutrição e genética'
        }
        if (value > 35) {
          return 'Excelente produtividade leiteira'
        }
        return 'Produção leiteira satisfatória'
      },
    },
  }

  for (const [variable, stats] of Object.entries(
    statistics.numericStats as Record<
      string,
      {
        mean: number
        median?: number
        stdDev?: number
        cv?: number
        min?: number
        max?: number
        count?: number
      }
    >
  )) {
    const mapping = variableMapping[variable.toLowerCase()]

    if (mapping && stats.mean) {
      const value = stats.mean
      let status: DiagnosticoResult['analiseNumericas'][0]['status'] = 'Regular'

      if (mapping.ideal) {
        if (value >= mapping.ideal.min && value <= mapping.ideal.max) {
          status = 'Excelente'
        } else if (value >= mapping.ideal.min * 0.9 && value <= mapping.ideal.max * 1.1) {
          status = 'Bom'
        } else if (value >= mapping.ideal.min * 0.8 && value <= mapping.ideal.max * 1.2) {
          status = 'Regular'
        } else {
          status = 'Preocupante'
        }
      }

      result.push({
        variavel: mapping.name || variable,
        status,
        interpretacao: mapping.interpretation(value, species),
        comparacaoLiteratura: `Referência ${mapping.unit}: ${mapping.ideal.min}-${mapping.ideal.max} (NRC/EMBRAPA)`,
      })
    } else if (stats.mean) {
      // Variáveis não mapeadas - análise genérica baseada em CV
      const cv = stats.cv ?? 0
      let status: DiagnosticoResult['analiseNumericas'][0]['status'] = 'Regular'
      let interpretation = ''

      if (cv < 15) {
        status = 'Excelente'
        interpretation = 'Baixa variabilidade - lote uniforme'
      } else if (cv < 25) {
        status = 'Bom'
        interpretation = 'Variabilidade aceitável'
      } else if (cv < 35) {
        status = 'Regular'
        interpretation = 'Variabilidade moderada - considerar uniformização'
      } else {
        status = 'Preocupante'
        interpretation = 'Alta variabilidade - necessária intervenção'
      }

      result.push({
        variavel: variable,
        status,
        interpretacao: `${interpretation}. Média: ${stats.mean}, CV: ${cv}%`,
      })
    }
  }

  return result
}

function identifyStrengthsAndWeaknesses(
  analiseNumericas: DiagnosticoResult['analiseNumericas'],
  correlations: Correlations,
  _species: string
): { pontosFortes: string[]; pontosAtencao: string[] } {
  const pontosFortes: string[] = []
  const pontosAtencao: string[] = []

  // Baseado na análise numérica
  for (const analise of analiseNumericas) {
    if (analise.status === 'Excelente' || analise.status === 'Bom') {
      pontosFortes.push(`${analise.variavel}: ${analise.interpretacao}`)
    } else if (analise.status === 'Preocupante') {
      pontosAtencao.push(`${analise.variavel}: ${analise.interpretacao}`)
    }
  }

  // Baseado em correlações significativas
  if (correlations?.report?.topCorrelations) {
    const strongCorrelations = correlations.report.topCorrelations.filter(
      (c) => Math.abs(c.coefficient) > 0.7 && c.significant
    )

    for (const corr of strongCorrelations.slice(0, 3)) {
      if (corr.coefficient > 0) {
        pontosFortes.push(
          `Forte correlação positiva entre ${corr.var1} e ${corr.var2} (r=${corr.coefficient.toFixed(2)}) indica sinergia produtiva`
        )
      } else {
        pontosAtencao.push(
          `Correlação negativa entre ${corr.var1} e ${corr.var2} (r=${corr.coefficient.toFixed(2)}) requer atenção no manejo`
        )
      }
    }
  }

  // Adicionar pontos gerais se poucos foram identificados
  if (pontosFortes.length === 0) {
    pontosFortes.push('Dados coletados e organizados para análise')
    pontosFortes.push('Sistema de monitoramento implementado')
  }

  if (pontosAtencao.length === 0) {
    pontosAtencao.push('Continuar monitoramento regular dos indicadores')
    pontosAtencao.push('Implementar coleta de mais variáveis zootécnicas')
  }

  return { pontosFortes, pontosAtencao }
}

function generateRecommendations(
  pontosAtencao: string[],
  species: string,
  _subtype?: string,
  _statistics?: Statistics
): DiagnosticoResult['recomendacoesPrioritarias'] {
  const recommendations: DiagnosticoResult['recomendacoesPrioritarias'] = []

  // Recomendações baseadas nos pontos de atenção
  pontosAtencao.forEach((ponto) => {
    if (ponto.includes('peso') || ponto.includes('GPD')) {
      recommendations.push({
        titulo: 'Otimizar Programa Nutricional',
        descricao:
          'Revisar formulação da dieta com nutricionista, ajustar níveis de proteína e energia conforme fase produtiva. Considerar análise bromatológica dos ingredientes.',
        prioridade: 'Alta',
      })
    } else if (ponto.includes('mortalidade')) {
      recommendations.push({
        titulo: 'Revisar Protocolo Sanitário',
        descricao:
          'Implementar programa vacinal completo, melhorar biosseguridade, revisar densidade populacional e condições ambientais.',
        prioridade: 'Alta',
      })
    } else if (ponto.includes('conversão')) {
      recommendations.push({
        titulo: 'Melhorar Eficiência Alimentar',
        descricao:
          'Avaliar qualidade dos ingredientes, ajustar granulometria da ração, verificar desperdício nos comedouros.',
        prioridade: 'Média',
      })
    }
  })

  // Recomendações específicas por espécie
  const speciesRecommendations: Record<string, DiagnosticoResult['recomendacoesPrioritarias'][0]> =
    {
      bovine: {
        titulo: 'Implementar Manejo de Pastagens',
        descricao:
          'Dividir piquetes para rotação, avaliar taxa de lotação, suplementar com minerais específicos para a região.',
        prioridade: 'Média',
      },
      swine: {
        titulo: 'Otimizar Ambiência',
        descricao:
          'Controlar temperatura e umidade, melhorar ventilação, implementar nebulização em períodos quentes.',
        prioridade: 'Média',
      },
      poultry: {
        titulo: 'Melhorar Programa de Luz',
        descricao:
          'Ajustar fotoperíodo conforme fase produtiva, intensidade luminosa adequada, distribuição uniforme.',
        prioridade: 'Baixa',
      },
    }

  if (speciesRecommendations[species] && recommendations.length < 3) {
    recommendations.push(speciesRecommendations[species])
  }

  // Garantir pelo menos uma recomendação
  if (recommendations.length === 0) {
    recommendations.push({
      titulo: 'Estabelecer Protocolo de Monitoramento',
      descricao:
        'Realizar avaliações periódicas dos principais indicadores, manter registros atualizados, estabelecer metas de desempenho.',
      prioridade: 'Alta',
    })
  }

  return recommendations.slice(0, 5) // Máximo 5 recomendações
}

function createExecutiveSummary(
  species: string,
  subtype: string | undefined,
  statistics: Statistics,
  analiseNumericas: DiagnosticoResult['analiseNumericas'],
  pontosFortes: number,
  pontosAtencao: number
): string {
  const excellentCount = analiseNumericas.filter((a) => a.status === 'Excelente').length
  const concernCount = analiseNumericas.filter((a) => a.status === 'Preocupante').length

  const speciesName = getSpeciesName(species)
  const subtypeName = subtype ?? 'geral'

  let summary = `Análise técnica de ${statistics?.numericStats ? Object.keys(statistics.numericStats).length : 0} variáveis zootécnicas `
  summary += `para sistema de ${speciesName} (${subtypeName}). `

  if (excellentCount > concernCount) {
    summary += `Resultado geral positivo com ${excellentCount} indicador(es) em excelente condição. `
  } else if (concernCount > 0) {
    summary += `Identificados ${concernCount} indicador(es) que necessitam intervenção. `
  } else {
    summary += `Sistema apresenta desempenho estável. `
  }

  summary += `Foram identificados ${pontosFortes} pontos fortes e ${pontosAtencao} pontos que requerem atenção. `
  summary += `Recomenda-se implementação das ações prioritárias para otimização dos resultados zootécnicos.`

  return summary
}

function generateConclusion(
  species: string,
  pontosFortes: string[],
  pontosAtencao: string[],
  recomendacoes: DiagnosticoResult['recomendacoesPrioritarias']
): string {
  const highPriorityCount = recomendacoes.filter((r) => r.prioridade === 'Alta').length

  let conclusion = `O sistema de produção de ${getSpeciesName(species)} apresenta `

  if (pontosFortes.length > pontosAtencao.length) {
    conclusion += 'indicadores majoritariamente positivos, '
  } else {
    conclusion += 'oportunidades significativas de melhoria, '
  }

  conclusion += `com ${pontosFortes.length} aspectos favoráveis identificados. `

  if (highPriorityCount > 0) {
    conclusion += `Existem ${highPriorityCount} ação(ões) de alta prioridade que devem ser implementadas imediatamente. `
  }

  conclusion += 'O monitoramento contínuo e a implementação das recomendações propostas '
  conclusion +=
    'resultarão em melhorias mensuráveis nos índices zootécnicos e na rentabilidade do sistema.'

  return conclusion
}

// Funções auxiliares
function getIdealWeight(species: string, type: 'min' | 'max' | 'avg'): number {
  const weights: Record<string, { min: number; max: number; avg: number }> = {
    bovine: { min: 450, max: 650, avg: 550 },
    swine: { min: 90, max: 130, avg: 110 },
    poultry: { min: 2.5, max: 3.5, avg: 3.0 },
    sheep: { min: 35, max: 55, avg: 45 },
    goat: { min: 30, max: 50, avg: 40 },
    aquaculture: { min: 0.5, max: 2.0, avg: 1.2 },
  }

  return weights[species]?.[type] || 100
}

function getSpeciesName(species: string): string {
  const names: Record<string, string> = {
    bovine: 'bovinos',
    swine: 'suínos',
    poultry: 'aves',
    sheep: 'ovinos',
    goat: 'caprinos',
    aquaculture: 'peixes',
    forage: 'forragem',
  }

  return names[species] || species
}

export default generateDiagnostico
