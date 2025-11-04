/**
 * ForagePanel - Display forage/pasture status with visual overlay
 */

'use client'

import { getColorHex, getLabelText } from '@/lib/layman/colors'
import type { ColorCategory, LabelCategory, Annotation } from '@/lib/layman/types'

interface ForagePanelProps {
  color: ColorCategory
  label: LabelCategory
  annotation?: Annotation
}

export function ForagePanel({ color, label, annotation }: ForagePanelProps) {
  const colorHex = getColorHex(color)
  const labelText = getLabelText(label)

  // If we have an image_url from annotation, display it
  if (annotation?.mode === 'image_url' && annotation.image_url) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Status da Forragem</h3>
        </div>
        <div className="relative">
          <img 
            src={annotation.image_url} 
            alt="Anotação da forragem"
            className="w-full h-auto rounded-lg"
          />
          <div 
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg"
            style={{ backgroundColor: colorHex }}
          >
            {labelText}
          </div>
        </div>
      </div>
    )
  }

  // Otherwise, render visual representation with color overlay
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Status da Forragem</h3>
      </div>
      
      <div className="relative">
        {/* Forage representation */}
        <div className="aspect-video rounded-lg overflow-hidden relative">
          {/* Gradient background simulating pasture */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-600"
            style={{
              filter: color === 'red' ? 'saturate(0.3)' : color === 'yellow' ? 'saturate(0.7)' : 'saturate(1)'
            }}
          />
          
          {/* Color overlay */}
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: colorHex,
              opacity: 0.3
            }}
          />

          {/* Grass texture pattern */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grass" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <line x1="0" y1="40" x2="0" y2="25" stroke="#2d5016" strokeWidth="2" />
                <line x1="10" y1="40" x2="8" y2="20" stroke="#2d5016" strokeWidth="2" />
                <line x1="20" y1="40" x2="22" y2="22" stroke="#2d5016" strokeWidth="2" />
                <line x1="30" y1="40" x2="28" y2="28" stroke="#2d5016" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grass)" opacity="0.4" />
          </svg>

          {/* Label overlay */}
          <div 
            className="absolute top-4 right-4 px-4 py-2 rounded-full text-white font-bold shadow-lg"
            style={{ backgroundColor: colorHex }}
          >
            {labelText}
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {color === 'green' && '✓ Pastagem em ótimo estado'}
          {color === 'yellow' && '⚠ Monitorar biomassa'}
          {color === 'red' && '✗ Pastagem necessita recuperação'}
        </p>
      </div>
    </div>
  )
}
