/**
 * LaymanToggle - Toggle between Layman and Technical views
 */

'use client'

import { User, Microscope } from 'lucide-react'

interface LaymanToggleProps {
  mode: 'layman' | 'technical'
  onChange: (mode: 'layman' | 'technical') => void
}

export function LaymanToggle({ mode, onChange }: LaymanToggleProps) {
  return (
    <div className="inline-flex items-center bg-muted rounded-lg p-1">
      <button
        onClick={() => onChange('layman')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          mode === 'layman'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={mode === 'layman'}
      >
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">Leigo</span>
      </button>
      <button
        onClick={() => onChange('technical')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
          mode === 'technical'
            ? 'bg-background shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-pressed={mode === 'technical'}
      >
        <Microscope className="h-4 w-4" />
        <span className="text-sm font-medium">Técnico</span>
      </button>
    </div>
  )
}
