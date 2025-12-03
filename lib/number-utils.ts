/**
 * Number Parsing Utilities
 *
 * Provides consistent number parsing across the codebase,
 * handling Brazilian decimal format (comma as decimal separator)
 * and various edge cases.
 */

/**
 * Parse a value to number, handling Brazilian decimal format
 *
 * Handles the following formats:
 * - Already numeric values
 * - Brazilian format: "1.234,56" (dot as thousands, comma as decimal)
 * - International format: "1,234.56" (comma as thousands, dot as decimal)
 * - Simple decimals: "10,5" or "10.5"
 *
 * Note: file-parser.ts already normalizes semicolon-delimited CSVs,
 * but this handles edge cases and provides consistent behavior
 * for correlation analysis and other numeric operations.
 *
 * @param value - The value to parse (can be number, string, null, undefined)
 * @returns The parsed number, or null if parsing fails
 */
export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    let s = value.trim()
    if (!s) {
      return null
    }

    // Handle Brazilian format: "1.234,56" -> "1234.56"
    // Only if comma is present (indicates Brazilian format)
    if (s.includes(',')) {
      // Check if it's Brazilian format (has both . and , with , after .)
      // or simple comma decimal (just "10,5")
      const lastComma = s.lastIndexOf(',')
      const lastDot = s.lastIndexOf('.')

      if (lastDot < lastComma) {
        // Brazilian format: dots are thousands separators, comma is decimal
        s = s.replace(/\./g, '').replace(',', '.')
      } else if (lastDot > lastComma) {
        // International format with comma thousands: "1,234.56"
        s = s.replace(/,/g, '')
      } else {
        // Only comma, no dot: simple Brazilian decimal "10,5"
        s = s.replace(',', '.')
      }
    }

    const num = parseFloat(s)
    return Number.isFinite(num) ? num : null
  }

  return null
}

/**
 * Check if a value can be parsed as a valid number
 *
 * @param value - The value to check
 * @returns true if the value can be parsed as a finite number
 */
export function isNumericValue(value: unknown): boolean {
  return parseNumber(value) !== null
}
