/**
 * Math Utilities
 *
 * Shared mathematical functions for statistical calculations.
 * Provides consistent variance and standard deviation calculations
 * across the codebase.
 */

/**
 * Compute variance of a numeric array
 *
 * @param values - Array of numeric values
 * @param options - Configuration options
 * @param options.sample - If true (default), uses sample variance (n-1 denominator).
 *                         If false, uses population variance (n denominator).
 * @returns Variance value, or NaN if array is empty
 */
export function computeVariance(
  values: number[],
  options: { sample?: boolean } = { sample: true }
): number {
  if (values.length === 0) {
    return NaN
  }
  const n = values.length
  const mean = values.reduce((sum, v) => sum + v, 0) / n
  const sumSq = values.reduce((sum, v) => sum + (v - mean) ** 2, 0)
  const denom = options.sample && n > 1 ? n - 1 : n
  return denom > 0 ? sumSq / denom : NaN
}

/**
 * Compute standard deviation of a numeric array
 *
 * @param values - Array of numeric values
 * @param options - Configuration options (same as computeVariance)
 * @returns Standard deviation value, or NaN if array is empty
 */
export function computeStdDev(
  values: number[],
  options: { sample?: boolean } = { sample: true }
): number {
  return Math.sqrt(computeVariance(values, options))
}
