/**
 * EN: Species mapping utility for converting between different ID formats
 * PT-BR: Utilitário de mapeamento de espécies para converter entre diferentes formatos de ID
 *
 * EN: This utility handles the conversion between frontend species IDs (English)
 *     and data generation/processing IDs (Portuguese)
 * PT-BR: Este utilitário gerencia a conversão entre IDs de espécies do frontend (inglês)
 *        e IDs de geração/processamento de dados (português)
 */

export const SPECIES_MAP = {
  // Frontend ID -> Data/Backend ID
  bovine: 'bovino',
  swine: 'suino',
  poultry: 'avicultura',
  sheep: 'ovino',
  goat: 'caprino',
  aquaculture: 'piscicultura',
  forage: 'forragem',
} as const

export const SPECIES_MAP_REVERSE = {
  // Data/Backend ID -> Frontend ID
  bovino: 'bovine',
  suino: 'swine',
  avicultura: 'poultry',
  ovino: 'sheep',
  caprino: 'goat',
  piscicultura: 'aquaculture',
  forragem: 'forage',
} as const

export type FrontendSpeciesId = keyof typeof SPECIES_MAP
export type BackendSpeciesId = keyof typeof SPECIES_MAP_REVERSE

/**
 * EN: Convert frontend species ID to backend/data format
 * PT-BR: Converter ID de espécie do frontend para formato backend/dados
 */
export function toBackendSpeciesId(frontendId: string): string {
  return SPECIES_MAP[frontendId as FrontendSpeciesId] || frontendId
}

/**
 * EN: Convert backend/data species ID to frontend format
 * PT-BR: Converter ID de espécie backend/dados para formato frontend
 */
export function toFrontendSpeciesId(backendId: string): string {
  return SPECIES_MAP_REVERSE[backendId as BackendSpeciesId] || backendId
}

/**
 * EN: Check if species ID is valid (either format)
 * PT-BR: Verificar se o ID de espécie é válido (qualquer formato)
 */
export function isValidSpeciesId(id: string): boolean {
  return id in SPECIES_MAP || id in SPECIES_MAP_REVERSE
}

/**
 * EN: Normalize species ID to backend format
 * PT-BR: Normalizar ID de espécie para formato backend
 */
export function normalizeSpeciesId(id: string): string {
  // If it's already in backend format, return as is
  if (id in SPECIES_MAP_REVERSE) {
    return id
  }
  // If it's in frontend format, convert to backend
  if (id in SPECIES_MAP) {
    return SPECIES_MAP[id as FrontendSpeciesId]
  }
  // Unknown format, return as is
  return id
}
