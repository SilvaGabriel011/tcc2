/**
 * EN: Species Data Validation - Validates if uploaded data matches the selected species
 * PT-BR: Validacao de Dados de Especie - Valida se os dados enviados correspondem a especie selecionada
 *
 * EN: This module provides functions to detect when a user uploads data that doesn't match
 *     the selected species, helping prevent analysis errors from mismatched data.
 * PT-BR: Este modulo fornece funcoes para detectar quando um usuario envia dados que nao correspondem
 *        a especie selecionada, ajudando a prevenir erros de analise por dados incompativeis.
 */

import {
  getSpeciesCorrelationConfig,
  getAllSpeciesCorrelationConfigs,
} from './correlations/species-correlations'
import { resolveMetric } from './metrics/canonical-metrics'

/**
 * EN: Result of species validation
 * PT-BR: Resultado da validacao de especie
 */
export interface SpeciesValidationResult {
  isValid: boolean
  selectedSpecies: string
  detectedSpecies: string | null
  matchScore: number
  detectedMatchScore: number
  errorMessage?: string
  details?: {
    selectedSpeciesMatches: string[]
    detectedSpeciesMatches: string[]
    allScores: Record<string, number>
  }
}

/**
 * EN: Normalizes a column name for comparison
 * PT-BR: Normaliza um nome de coluna para comparacao
 */
function normalizeColumnName(column: string): string {
  return column
    .toLowerCase()
    .trim()
    .replace(/[_\s-]+/g, '_')
    .replace(/[áàâã]/g, 'a')
    .replace(/[éèê]/g, 'e')
    .replace(/[íì]/g, 'i')
    .replace(/[óòôõ]/g, 'o')
    .replace(/[úù]/g, 'u')
    .replace(/ç/g, 'c')
}

/**
 * EN: Checks if a column matches any of the expected fields for a species
 * PT-BR: Verifica se uma coluna corresponde a algum dos campos esperados para uma especie
 */
function columnMatchesExpectedField(column: string, expectedFields: string[]): boolean {
  const normalizedColumn = normalizeColumnName(column)

  for (const field of expectedFields) {
    const normalizedField = normalizeColumnName(field)

    // Exact match
    if (normalizedColumn === normalizedField) {
      return true
    }

    // Partial match (column contains field or field contains column)
    if (normalizedColumn.includes(normalizedField) || normalizedField.includes(normalizedColumn)) {
      return true
    }
  }

  return false
}

/**
 * EN: Calculates the match score between CSV columns and a species' expected fields
 * PT-BR: Calcula a pontuacao de correspondencia entre colunas do CSV e campos esperados de uma especie
 */
function calculateMatchScore(
  columns: string[],
  species: string
): { score: number; matches: string[] } {
  const config = getSpeciesCorrelationConfig(species)
  if (!config) {
    return { score: 0, matches: [] }
  }

  const expectedFields = config.expectedFields
  const additionalMetrics = config.additionalMetrics ?? []
  const allExpectedFields = [...expectedFields, ...additionalMetrics]

  const matches: string[] = []

  for (const column of columns) {
    // Check against expected fields
    if (columnMatchesExpectedField(column, allExpectedFields)) {
      matches.push(column)
      continue
    }

    // Check using canonical metrics resolver
    const metric = resolveMetric(column, species)
    if (metric) {
      matches.push(column)
    }
  }

  // Calculate score as percentage of columns that match
  const score = columns.length > 0 ? (matches.length / columns.length) * 100 : 0

  return { score, matches }
}

/**
 * EN: Detects which species the data most likely belongs to
 * PT-BR: Detecta a qual especie os dados provavelmente pertencem
 */
function detectMostLikelySpecies(
  columns: string[]
): { species: string; score: number; matches: string[] } | null {
  const allConfigs = getAllSpeciesCorrelationConfigs()

  let bestMatch: { species: string; score: number; matches: string[] } | null = null

  for (const [species] of Object.entries(allConfigs)) {
    const { score, matches } = calculateMatchScore(columns, species)

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { species, score, matches }
    }
  }

  return bestMatch
}

/**
 * EN: Validates if the uploaded data matches the selected species
 * PT-BR: Valida se os dados enviados correspondem a especie selecionada
 *
 * @param columns - EN: Column names from the uploaded CSV | PT-BR: Nomes das colunas do CSV enviado
 * @param selectedSpecies - EN: Species selected by the user | PT-BR: Especie selecionada pelo usuario
 * @returns EN: Validation result with details | PT-BR: Resultado da validacao com detalhes
 */
export function validateSpeciesData(
  columns: string[],
  selectedSpecies: string
): SpeciesValidationResult {
  // Calculate match score for selected species
  const { score: selectedScore, matches: selectedMatches } = calculateMatchScore(
    columns,
    selectedSpecies
  )

  // Detect the most likely species based on the data
  const detected = detectMostLikelySpecies(columns)

  // Calculate all scores for debugging
  const allConfigs = getAllSpeciesCorrelationConfigs()
  const allScores: Record<string, number> = {}
  for (const [species] of Object.entries(allConfigs)) {
    const { score } = calculateMatchScore(columns, species)
    allScores[species] = Math.round(score * 100) / 100
  }

  // If no species detected or selected species has reasonable match, it's valid
  if (!detected) {
    return {
      isValid: true,
      selectedSpecies,
      detectedSpecies: null,
      matchScore: selectedScore,
      detectedMatchScore: 0,
      details: {
        selectedSpeciesMatches: selectedMatches,
        detectedSpeciesMatches: [],
        allScores,
      },
    }
  }

  // Check if another species has a significantly better match
  // We use a threshold: if detected species has 20% more matches AND selected has less than 30% match
  const significantDifference = detected.score - selectedScore >= 20
  const selectedHasLowMatch = selectedScore < 30
  const detectedHasGoodMatch = detected.score >= 40

  // If the detected species is different and has significantly better match
  if (
    detected.species !== selectedSpecies &&
    significantDifference &&
    selectedHasLowMatch &&
    detectedHasGoodMatch
  ) {
    // Get Portuguese name for the detected species
    const speciesNames: Record<string, string> = {
      bovine: 'Bovinos',
      swine: 'Suinos',
      poultry: 'Aves',
      sheep: 'Ovinos',
      goat: 'Caprinos',
      forage: 'Forragem',
      aquaculture: 'Aquicultura',
      bees: 'Abelhas',
    }

    const selectedName = speciesNames[selectedSpecies] || selectedSpecies
    const detectedName = speciesNames[detected.species] || detected.species

    return {
      isValid: false,
      selectedSpecies,
      detectedSpecies: detected.species,
      matchScore: selectedScore,
      detectedMatchScore: detected.score,
      errorMessage: `Selecao de cultura errada: voce selecionou "${selectedName}" mas os dados parecem ser de "${detectedName}". Por favor, selecione a especie correta ou verifique seu arquivo CSV.`,
      details: {
        selectedSpeciesMatches: selectedMatches,
        detectedSpeciesMatches: detected.matches,
        allScores,
      },
    }
  }

  return {
    isValid: true,
    selectedSpecies,
    detectedSpecies: detected.species,
    matchScore: selectedScore,
    detectedMatchScore: detected.score,
    details: {
      selectedSpeciesMatches: selectedMatches,
      detectedSpeciesMatches: detected.matches,
      allScores,
    },
  }
}

/**
 * EN: Gets a user-friendly error message for species mismatch
 * PT-BR: Obtem uma mensagem de erro amigavel para incompatibilidade de especie
 */
export function getSpeciesMismatchError(result: SpeciesValidationResult): string {
  if (result.isValid) {
    return ''
  }

  return result.errorMessage ?? 'Selecao de cultura errada'
}
