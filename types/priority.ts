/**
 * Priority Types and Configuration
 *
 * Type-safe priority definitions for diagnostic recommendations
 * to avoid magic strings and provide consistent styling across components.
 */

export type DiagnosticPriority = 'Alta' | 'Média' | 'Baixa'

export interface PriorityConfig {
  label: string
  badgeClass: string
  order: number
}

export const PRIORITY_CONFIG: Record<DiagnosticPriority, PriorityConfig> = {
  Alta: {
    label: 'Acao Imediata',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    order: 1,
  },
  Média: {
    label: 'Acao em Curto Prazo',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    order: 2,
  },
  Baixa: {
    label: 'Manter Pratica',
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    order: 3,
  },
}

/**
 * Get priority configuration with fallback for unknown priorities
 */
export function getPriorityConfig(priority: string): PriorityConfig {
  if (priority in PRIORITY_CONFIG) {
    return PRIORITY_CONFIG[priority as DiagnosticPriority]
  }
  // Fallback for unknown priorities
  return PRIORITY_CONFIG['Baixa']
}
