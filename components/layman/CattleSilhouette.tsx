/**
 * CattleSilhouette - Display cattle silhouette with color coding
 */

'use client'

import Image from 'next/image'
import { getColorHex, getLabelText } from '@/lib/layman/colors'
import type { ColorCategory, LabelCategory, Annotation } from '@/lib/layman/types'

interface CattleSilhouetteProps {
  color: ColorCategory
  label: LabelCategory
  annotation?: Annotation
}

export function CattleSilhouette({ color, label, annotation }: CattleSilhouetteProps) {
  const colorHex = getColorHex(color)
  const labelText = getLabelText(label)

  if (annotation?.mode === 'image_url' && annotation.image_url) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Status do Gado</h3>
        </div>
        <div className="relative w-full h-64">
          <Image 
            src={annotation.image_url} 
            alt="Anotação do gado"
            fill
            className="rounded-lg object-cover"
          />
          <div 
            className="absolute top-4 right-4 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg z-10"
            style={{ backgroundColor: colorHex }}
          >
            {labelText}
          </div>
        </div>
      </div>
    )
  }

  // Otherwise, render SVG silhouette
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Status do Gado</h3>
      </div>
      
      <div className="relative">
        {/* SVG Silhouette */}
        <svg 
          viewBox="0 0 400 250" 
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cattle silhouette path */}
          <path
            d="M 50 180 Q 60 160 80 150 L 100 140 Q 120 130 140 130 L 160 130 Q 180 130 200 130 L 240 130 Q 260 130 280 140 L 300 150 Q 320 160 330 180 L 330 200 Q 320 210 300 210 L 280 210 L 280 230 L 260 230 L 260 210 L 200 210 L 200 230 L 180 230 L 180 210 L 120 210 L 120 230 L 100 230 L 100 210 L 80 210 Q 60 210 50 200 Z M 80 140 Q 70 130 70 115 Q 70 100 80 90 Q 90 80 105 80 Q 120 80 130 90 Q 140 100 140 115 Q 140 130 130 140 M 85 110 Q 85 105 90 105 Q 95 105 95 110 Q 95 115 90 115 Q 85 115 85 110"
            fill={colorHex}
            stroke="#000"
            strokeWidth="2"
            opacity="0.9"
          />
        </svg>

        {/* Label overlay */}
        <div 
          className="absolute top-4 right-4 px-4 py-2 rounded-full text-white font-bold shadow-lg"
          style={{ backgroundColor: colorHex }}
        >
          {labelText}
        </div>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {color === 'green' && '✓ Gado engordando bem'}
          {color === 'yellow' && '⚠ Monitorar de perto'}
          {color === 'red' && '✗ Precisa de atenção'}
        </p>
      </div>
    </div>
  )
}
