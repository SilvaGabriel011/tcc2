import {
  LAYMAN_COLORS,
  getColorHex,
  getColorTailwind,
  getLabelText,
  colorToLabel,
  getColorLegend,
  getColorBackground,
  getColorText,
  getColorBorder,
} from '@/lib/layman/colors'

describe('layman-colors', () => {
  describe('LAYMAN_COLORS constant', () => {
    it('should have EXCELLENT color defined', () => {
      expect(LAYMAN_COLORS.EXCELLENT).toBeDefined()
      expect(LAYMAN_COLORS.EXCELLENT.hex).toBeDefined()
      expect(LAYMAN_COLORS.EXCELLENT.rgb).toBeDefined()
      expect(LAYMAN_COLORS.EXCELLENT.tailwind).toBeDefined()
    })

    it('should have OK color defined', () => {
      expect(LAYMAN_COLORS.OK).toBeDefined()
      expect(LAYMAN_COLORS.OK.hex).toBeDefined()
      expect(LAYMAN_COLORS.OK.rgb).toBeDefined()
      expect(LAYMAN_COLORS.OK.tailwind).toBeDefined()
    })

    it('should have RUIM color defined', () => {
      expect(LAYMAN_COLORS.RUIM).toBeDefined()
      expect(LAYMAN_COLORS.RUIM.hex).toBeDefined()
      expect(LAYMAN_COLORS.RUIM.rgb).toBeDefined()
      expect(LAYMAN_COLORS.RUIM.tailwind).toBeDefined()
    })

    it('should use valid hex color format', () => {
      expect(LAYMAN_COLORS.EXCELLENT.hex).toMatch(/^#[0-9A-F]{6}$/i)
      expect(LAYMAN_COLORS.OK.hex).toMatch(/^#[0-9A-F]{6}$/i)
      expect(LAYMAN_COLORS.RUIM.hex).toMatch(/^#[0-9A-F]{6}$/i)
    })

    it('should use valid RGB format', () => {
      expect(LAYMAN_COLORS.EXCELLENT.rgb).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/)
      expect(LAYMAN_COLORS.OK.rgb).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/)
      expect(LAYMAN_COLORS.RUIM.rgb).toMatch(/^rgb\(\d+,\s*\d+,\s*\d+\)$/)
    })
  })

  describe('getColorHex', () => {
    it('should return green hex for green category', () => {
      const hex = getColorHex('green')
      expect(hex).toBe(LAYMAN_COLORS.EXCELLENT.hex)
    })

    it('should return yellow hex for yellow category', () => {
      const hex = getColorHex('yellow')
      expect(hex).toBe(LAYMAN_COLORS.OK.hex)
    })

    it('should return red hex for red category', () => {
      const hex = getColorHex('red')
      expect(hex).toBe(LAYMAN_COLORS.RUIM.hex)
    })

    it('should return valid hex colors', () => {
      expect(getColorHex('green')).toMatch(/^#[0-9A-F]{6}$/i)
      expect(getColorHex('yellow')).toMatch(/^#[0-9A-F]{6}$/i)
      expect(getColorHex('red')).toMatch(/^#[0-9A-F]{6}$/i)
    })
  })

  describe('getColorTailwind', () => {
    it('should return green Tailwind class for green category', () => {
      const tailwind = getColorTailwind('green')
      expect(tailwind).toBe(LAYMAN_COLORS.EXCELLENT.tailwind)
    })

    it('should return yellow Tailwind class for yellow category', () => {
      const tailwind = getColorTailwind('yellow')
      expect(tailwind).toBe(LAYMAN_COLORS.OK.tailwind)
    })

    it('should return red Tailwind class for red category', () => {
      const tailwind = getColorTailwind('red')
      expect(tailwind).toBe(LAYMAN_COLORS.RUIM.tailwind)
    })

    it('should return valid Tailwind classes', () => {
      expect(getColorTailwind('green')).toContain('bg-')
      expect(getColorTailwind('yellow')).toContain('bg-')
      expect(getColorTailwind('red')).toContain('bg-')
    })
  })

  describe('getLabelText', () => {
    it('should return "Ótimo" for ótimo label', () => {
      expect(getLabelText('ótimo')).toBe('Ótimo')
    })

    it('should return "Ok" for ok label', () => {
      expect(getLabelText('ok')).toBe('Ok')
    })

    it('should return "Ruim" for ruim label', () => {
      expect(getLabelText('ruim')).toBe('Ruim')
    })
  })

  describe('colorToLabel', () => {
    it('should map green to ótimo', () => {
      expect(colorToLabel('green')).toBe('ótimo')
    })

    it('should map yellow to ok', () => {
      expect(colorToLabel('yellow')).toBe('ok')
    })

    it('should map red to ruim', () => {
      expect(colorToLabel('red')).toBe('ruim')
    })
  })

  describe('getColorLegend', () => {
    it('should return array of legend entries', () => {
      const legend = getColorLegend()
      expect(Array.isArray(legend)).toBe(true)
      expect(legend.length).toBe(3)
    })

    it('should include green entry', () => {
      const legend = getColorLegend()
      const greenEntry = legend.find((e) => e.color === 'green')

      expect(greenEntry).toBeDefined()
      expect(greenEntry?.label).toBe('ótimo')
      expect(greenEntry?.hex).toBe(LAYMAN_COLORS.EXCELLENT.hex)
      expect(greenEntry?.icon).toBeDefined()
    })

    it('should include yellow entry', () => {
      const legend = getColorLegend()
      const yellowEntry = legend.find((e) => e.color === 'yellow')

      expect(yellowEntry).toBeDefined()
      expect(yellowEntry?.label).toBe('ok')
      expect(yellowEntry?.hex).toBe(LAYMAN_COLORS.OK.hex)
      expect(yellowEntry?.icon).toBeDefined()
    })

    it('should include red entry', () => {
      const legend = getColorLegend()
      const redEntry = legend.find((e) => e.color === 'red')

      expect(redEntry).toBeDefined()
      expect(redEntry?.label).toBe('ruim')
      expect(redEntry?.hex).toBe(LAYMAN_COLORS.RUIM.hex)
      expect(redEntry?.icon).toBeDefined()
    })

    it('should include meaning for each entry', () => {
      const legend = getColorLegend()
      legend.forEach((entry) => {
        expect(entry.meaning).toBeDefined()
        expect(entry.meaning.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getColorBackground', () => {
    it('should return light background by default', () => {
      const bg = getColorBackground('green')
      expect(bg).toContain('bg-green-10')
    })

    it('should return light background when specified', () => {
      const bg = getColorBackground('green', 'light')
      expect(bg).toContain('bg-green-10')
    })

    it('should return medium background when specified', () => {
      const bg = getColorBackground('green', 'medium')
      expect(bg).toContain('bg-green-30')
    })

    it('should return dark background when specified', () => {
      const bg = getColorBackground('green', 'dark')
      expect(bg).toContain('bg-green-50')
    })

    it('should work for all color categories', () => {
      expect(getColorBackground('green')).toContain('bg-green')
      expect(getColorBackground('yellow')).toContain('bg-amber')
      expect(getColorBackground('red')).toContain('bg-red')
    })
  })

  describe('getColorText', () => {
    it('should return text color for green', () => {
      const text = getColorText('green')
      expect(text).toContain('text-green')
    })

    it('should return text color for yellow', () => {
      const text = getColorText('yellow')
      expect(text).toContain('text-amber')
    })

    it('should return text color for red', () => {
      const text = getColorText('red')
      expect(text).toContain('text-red')
    })

    it('should include dark mode variants', () => {
      expect(getColorText('green')).toContain('dark:')
      expect(getColorText('yellow')).toContain('dark:')
      expect(getColorText('red')).toContain('dark:')
    })
  })

  describe('getColorBorder', () => {
    it('should return border color for green', () => {
      const border = getColorBorder('green')
      expect(border).toBe('border-green-500')
    })

    it('should return border color for yellow', () => {
      const border = getColorBorder('yellow')
      expect(border).toBe('border-amber-500')
    })

    it('should return border color for red', () => {
      const border = getColorBorder('red')
      expect(border).toBe('border-red-500')
    })

    it('should return valid Tailwind border classes', () => {
      expect(getColorBorder('green')).toContain('border-')
      expect(getColorBorder('yellow')).toContain('border-')
      expect(getColorBorder('red')).toContain('border-')
    })
  })

  describe('Color consistency', () => {
    it('should use consistent colors across all functions', () => {
      const greenHex = getColorHex('green')
      const legend = getColorLegend()
      const greenLegend = legend.find((e) => e.color === 'green')

      expect(greenLegend?.hex).toBe(greenHex)
    })

    it('should map colors to labels consistently', () => {
      const greenLabel = colorToLabel('green')
      getLabelText(greenLabel)
      const legend = getColorLegend()
      const greenLegend = legend.find((e) => e.color === 'green')

      expect(greenLegend?.label).toBe(greenLabel)
    })
  })
})
