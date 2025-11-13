'use client'

import { useEffect, useState } from 'react'

export interface ThemeColors {
  primary: string
  secondary: string
  muted: string
  mutedForeground: string
  card: string
  cardForeground: string
  border: string
  background: string
  foreground: string
  destructive: string
  success: string
  warning: string
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  chart6: string
  chart7: string
  chart8: string
}

const fallbackColors: ThemeColors = {
  primary: '#10B981',
  secondary: '#3B82F6',
  muted: '#F3F4F6',
  mutedForeground: '#6B7280',
  card: '#FFFFFF',
  cardForeground: '#111827',
  border: '#E5E7EB',
  background: '#FFFFFF',
  foreground: '#111827',
  destructive: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  chart1: '#10B981',
  chart2: '#3B82F6',
  chart3: '#8B5CF6',
  chart4: '#F59E0B',
  chart5: '#EF4444',
  chart6: '#EC4899',
  chart7: '#14B8A6',
  chart8: '#84CC16',
}

function getCSSVariable(name: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(name)
  return value.trim() || null
}

function hslToHex(hsl: string): string {
  const match = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/)
  if (!match) {
    return hsl
  }

  const h = parseFloat(match[1])
  const s = parseFloat(match[2]) / 100
  const l = parseFloat(match[3]) / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    b = x
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getThemeColors(): ThemeColors {
  if (typeof window === 'undefined') {
    return fallbackColors
  }

  const resolveColor = (varName: string, fallback: string): string => {
    const value = getCSSVariable(varName)
    if (!value) {
      return fallback
    }

    if (value.includes('%')) {
      return hslToHex(value)
    }

    return value.startsWith('#') ? value : `#${value}`
  }

  return {
    primary: resolveColor('--primary', fallbackColors.primary),
    secondary: resolveColor('--secondary', fallbackColors.secondary),
    muted: resolveColor('--muted', fallbackColors.muted),
    mutedForeground: resolveColor('--muted-foreground', fallbackColors.mutedForeground),
    card: resolveColor('--card', fallbackColors.card),
    cardForeground: resolveColor('--card-foreground', fallbackColors.cardForeground),
    border: resolveColor('--border', fallbackColors.border),
    background: resolveColor('--background', fallbackColors.background),
    foreground: resolveColor('--foreground', fallbackColors.foreground),
    destructive: resolveColor('--destructive', fallbackColors.destructive),
    success: resolveColor('--success', fallbackColors.success),
    warning: resolveColor('--warning', fallbackColors.warning),
    chart1: resolveColor('--chart-1', fallbackColors.chart1),
    chart2: resolveColor('--chart-2', fallbackColors.chart2),
    chart3: resolveColor('--chart-3', fallbackColors.chart3),
    chart4: resolveColor('--chart-4', fallbackColors.chart4),
    chart5: resolveColor('--chart-5', fallbackColors.chart5),
    chart6: resolveColor('--chart-6', fallbackColors.chart6),
    chart7: resolveColor('--chart-7', fallbackColors.chart7),
    chart8: resolveColor('--chart-8', fallbackColors.chart8),
  }
}

export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(fallbackColors)

  useEffect(() => {
    const updateColors = () => {
      setColors(getThemeColors())
    }

    updateColors()

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
          updateColors()
          break
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    return () => observer.disconnect()
  }, [])

  return colors
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}
