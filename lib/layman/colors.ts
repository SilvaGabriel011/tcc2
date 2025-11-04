/**
 * Universal Color System for Layman Visualization
 * 
 * Provides intuitive color coding:
 * - Red (Vermelho) = Ruim = Action required
 * - Yellow (Amarelo) = Ok = Monitor
 * - Green (Verde) = Ótimo = Excellent
 */

import { ColorCategory, LabelCategory, ColorLegendEntry } from './types'

/**
 * Core color palette
 */
export const LAYMAN_COLORS = {
  EXCELLENT: {
    hex: '#10B981',      // Green 500
    rgb: 'rgb(16, 185, 129)',
    tailwind: 'bg-green-500'
  },
  OK: {
    hex: '#F59E0B',      // Amber 500
    rgb: 'rgb(245, 158, 11)',
    tailwind: 'bg-amber-500'
  },
  RUIM: {
    hex: '#EF4444',      // Red 500
    rgb: 'rgb(239, 68, 68)',
    tailwind: 'bg-red-500'
  }
} as const

/**
 * Map color categories to hex values
 */
export function getColorHex(category: ColorCategory): string {
  const colorMap: Record<ColorCategory, string> = {
    'green': LAYMAN_COLORS.EXCELLENT.hex,
    'yellow': LAYMAN_COLORS.OK.hex,
    'red': LAYMAN_COLORS.RUIM.hex
  }
  return colorMap[category]
}

/**
 * Map color categories to Tailwind classes
 */
export function getColorTailwind(category: ColorCategory): string {
  const colorMap: Record<ColorCategory, string> = {
    'green': LAYMAN_COLORS.EXCELLENT.tailwind,
    'yellow': LAYMAN_COLORS.OK.tailwind,
    'red': LAYMAN_COLORS.RUIM.tailwind
  }
  return colorMap[category]
}

/**
 * Map label categories to display text
 */
export function getLabelText(label: LabelCategory): string {
  const labelMap: Record<LabelCategory, string> = {
    'ótimo': 'Ótimo',
    'ok': 'Ok',
    'ruim': 'Ruim'
  }
  return labelMap[label]
}

/**
 * Map color category to label category
 */
export function colorToLabel(color: ColorCategory): LabelCategory {
  const map: Record<ColorCategory, LabelCategory> = {
    'green': 'ótimo',
    'yellow': 'ok',
    'red': 'ruim'
  }
  return map[color]
}

/**
 * Get full color legend for UI display
 */
export function getColorLegend(): ColorLegendEntry[] {
  return [
    {
      color: 'green',
      hex: LAYMAN_COLORS.EXCELLENT.hex,
      label: 'ótimo',
      meaning: 'Ótimo — sem ação necessária',
      icon: '✓'
    },
    {
      color: 'yellow',
      hex: LAYMAN_COLORS.OK.hex,
      label: 'ok',
      meaning: 'Ok — monitorar',
      icon: '⚠'
    },
    {
      color: 'red',
      hex: LAYMAN_COLORS.RUIM.hex,
      label: 'ruim',
      meaning: 'Ruim — ação necessária',
      icon: '✗'
    }
  ]
}

/**
 * Get background color class with opacity
 */
export function getColorBackground(category: ColorCategory, opacity: 'light' | 'medium' | 'dark' = 'light'): string {
  const opacityMap = {
    light: '10',
    medium: '30',
    dark: '50'
  }
  
  const baseMap: Record<ColorCategory, string> = {
    'green': `bg-green-${opacityMap[opacity]}`,
    'yellow': `bg-amber-${opacityMap[opacity]}`,
    'red': `bg-red-${opacityMap[opacity]}`
  }
  
  return baseMap[category]
}

/**
 * Get text color class
 */
export function getColorText(category: ColorCategory): string {
  const textMap: Record<ColorCategory, string> = {
    'green': 'text-green-700 dark:text-green-400',
    'yellow': 'text-amber-700 dark:text-amber-400',
    'red': 'text-red-700 dark:text-red-400'
  }
  return textMap[category]
}

/**
 * Get border color class
 */
export function getColorBorder(category: ColorCategory): string {
  const borderMap: Record<ColorCategory, string> = {
    'green': 'border-green-500',
    'yellow': 'border-amber-500',
    'red': 'border-red-500'
  }
  return borderMap[category]
}
