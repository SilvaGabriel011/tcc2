/**
 * Number Formatting Utilities
 *
 * Provides pt-BR locale-aware number formatting for charts and displays.
 */

/**
 * Format number using Brazilian Portuguese locale
 * Examples: 1234.56 -> "1.234,56", 0.5 -> "0,50"
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format number with automatic decimal places (removes trailing zeros)
 * Examples: 1234.50 -> "1.234,5", 1234.00 -> "1.234"
 */
export function formatNumberAuto(value: number, maxDecimals: number = 2): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  })
}

/**
 * Format percentage using Brazilian Portuguese locale
 * Examples: 0.5 -> "50%", 0.123 -> "12,3%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`
}

/**
 * Format integer using Brazilian Portuguese locale
 * Examples: 1234 -> "1.234", 1000000 -> "1.000.000"
 */
export function formatInteger(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
