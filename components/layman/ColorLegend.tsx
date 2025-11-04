/**
 * ColorLegend - Display color legend for layman visualization
 */

'use client'

import { getColorLegend } from '@/lib/layman/colors'

export function ColorLegend() {
  const legend = getColorLegend()

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Legenda de Cores</h3>
      <div className="grid grid-cols-3 gap-4">
        {legend.map((entry) => (
          <div key={entry.color} className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: entry.hex }}
            >
              {entry.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground capitalize">
                {entry.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {entry.meaning}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
