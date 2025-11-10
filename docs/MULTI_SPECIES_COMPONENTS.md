# 🎨 Componentes React - Sistema Multi-Espécie

## 1. MultiSpeciesTabs - Componente Principal

```typescript
// components/analysis/MultiSpeciesTabs.tsx
'use client'

import { useState, useEffect } from 'react'
import { Tabs } from '@/components/tabs'
import {
  Bird, Beef, Fish, Wheat, Activity, ChevronDown,
  Info, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

// Ícone customizado para Suínos
const PigIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8"/>
    <circle cx="9" cy="10" r="1.5"/>
    <circle cx="15" cy="10" r="1.5"/>
    <path d="M8 15 Q12 17 16 15" strokeLinecap="round"/>
  </svg>
)

interface AnimalSubtype {
  id: string
  name: string
  code: string
  description?: string
}

interface SpeciesConfig {
  id: string
  name: string
  code: string
  icon: React.ReactNode
  subtypes?: AnimalSubtype[]
  hasForage?: boolean
  description: string
  color: string
}

export const SPECIES_CONFIGS: SpeciesConfig[] = [
  {
    id: 'poultry',
    name: 'Aves',
    code: 'aves',
    icon: <Bird className="w-4 h-4" />,
    color: 'orange',
    subtypes: [
      { id: 'broiler', name: 'Frango de Corte', code: 'frango_corte' },
      { id: 'layer', name: 'Poedeiras', code: 'poedeiras' },
      { id: 'breeder', name: 'Matrizes', code: 'matrizes' }
    ],
    description: 'Análise completa para produção avícola'
  },
  {
    id: 'swine',
    name: 'Suínos',
    code: 'suinos',
    icon: <PigIcon />,
    color: 'pink',
    subtypes: [
      { id: 'nursery', name: 'Creche', code: 'creche' },
      { id: 'growing', name: 'Crescimento', code: 'crescimento' },
      { id: 'finishing', name: 'Terminação', code: 'terminacao' },
      { id: 'breeding', name: 'Reprodução', code: 'reproducao' }
    ],
    description: 'Gestão completa da suinocultura'
  },
  {
    id: 'bovine',
    name: 'Bovinos',
    code: 'bovinos',
    icon: <Beef className="w-4 h-4" />,
    color: 'brown',
    subtypes: [
      { id: 'dairy', name: 'Leite', code: 'leite' },
      { id: 'beef', name: 'Corte', code: 'corte' },
      { id: 'dual', name: 'Dupla Aptidão', code: 'dupla' }
    ],
    hasForage: true,
    description: 'Análise para bovinocultura com integração de pastagem'
  }
]

export function MultiSpeciesTabs({ onSpeciesChange, children }) {
  const [selectedSpecies, setSelectedSpecies] = useState('bovine')
  const [selectedSubtype, setSelectedSubtype] = useState(null)
  const [referenceData, setReferenceData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReferenceData(selectedSpecies, selectedSubtype)
  }, [selectedSpecies, selectedSubtype])

  const loadReferenceData = async (species, subtype) => {
    setLoading(true)
    try {
      const url = `/api/reference/${species}/data`
      const response = await fetch(subtype ? `${url}?subtype=${subtype}` : url)
      if (response.ok) {
        const data = await response.json()
        setReferenceData(data)
      }
    } catch (error) {
      toast.error('Erro ao carregar dados de referência')
    } finally {
      setLoading(false)
    }
  }

  const tabs = SPECIES_CONFIGS.map(species => ({
    id: species.id,
    label: species.name,
    icon: species.icon,
    content: (
      <div className="space-y-6">
        {/* Seletor de Subtipo */}
        {species.subtypes && (
          <SubtypeSelector
            subtypes={species.subtypes}
            selected={selectedSubtype}
            onChange={setSelectedSubtype}
          />
        )}

        {/* Indicador de Forragem */}
        {species.hasForage && <ForageIntegrationBanner />}

        {/* Conteúdo Dinâmico */}
        {children(species.id, selectedSubtype, referenceData)}
      </div>
    )
  }))

  return <Tabs tabs={tabs} defaultTab="bovine" />
}
```

## 2. SpeciesUploadForm - Upload Adaptativo

```typescript
// components/analysis/SpeciesUploadForm.tsx
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface SpeciesUploadFormProps {
  species: string
  subtype?: string
  referenceData?: any
  onAnalysis: (result: any) => void
}

export function SpeciesUploadForm({
  species,
  subtype,
  referenceData,
  onAnalysis
}: SpeciesUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [preview, setPreview] = useState<any[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setFile(file)

    // Preview das primeiras linhas
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').slice(0, 5)
      setPreview(lines.map(line => line.split(',')))
    }
    reader.readAsText(file.slice(0, 1024))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('species', species)
    if (subtype) formData.append('subtype', subtype)

    try {
      const response = await fetch('/api/analysis/multi-species', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Análise concluída com sucesso!')
        onAnalysis(result)
      } else {
        throw new Error('Erro na análise')
      }
    } catch (error) {
      toast.error('Erro ao processar arquivo')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Validações específicas por espécie
  const getRequiredColumns = () => {
    const base = ['id', 'date']

    switch(species) {
      case 'poultry':
        return [...base, 'peso', 'idade', 'mortalidade']
      case 'bovine':
        return subtype === 'dairy'
          ? [...base, 'producao_leite', 'gordura', 'proteina']
          : [...base, 'peso', 'gpd', 'escore_corporal']
      case 'swine':
        return [...base, 'peso', 'conversao', 'espessura_toucinho']
      default:
        return base
    }
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${file ? 'bg-green-50 dark:bg-green-950/20' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          {file ? (
            <>
              <CheckCircle className="w-12 h-12 text-green-600" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  Arraste o arquivo ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Formatos: CSV, XLS, XLSX
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Colunas Requeridas */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-blue-900 dark:text-blue-300">
              Colunas obrigatórias para {species}:
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
              {getRequiredColumns().join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-card rounded-lg p-4 overflow-x-auto">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Preview dos Dados
          </h4>
          <table className="text-sm">
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className={i === 0 ? 'font-semibold' : ''}>
                  {row.slice(0, 5).map((cell, j) => (
                    <td key={j} className="px-2 py-1">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botão Analisar */}
      <Button
        onClick={handleAnalyze}
        disabled={!file || isAnalyzing}
        className="w-full"
      >
        {isAnalyzing ? 'Analisando...' : 'Analisar Dados'}
      </Button>
    </div>
  )
}
```

## 3. PoultryAnalysis - Componente Específico de Aves

```typescript
// components/analysis/species/PoultryAnalysis.tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PoultryAnalysisProps {
  data: any
  subtype: 'broiler' | 'layer' | 'breeder'
  references: any
}

export function PoultryAnalysis({ data, subtype, references }: PoultryAnalysisProps) {
  const [selectedMetric, setSelectedMetric] = useState('peso')

  // Métricas específicas por subtipo
  const getMetrics = () => {
    switch(subtype) {
      case 'broiler':
        return {
          peso_42d: data.peso_42d || 0,
          conversao: data.conversao_alimentar || 0,
          mortalidade: data.mortalidade || 0,
          iep: data.iep || 0
        }
      case 'layer':
        return {
          producao: data.producao_ovos || 0,
          peso_ovo: data.peso_ovo || 0,
          conversao_dz: data.conversao_duzia || 0,
          mortalidade: data.mortalidade || 0
        }
      default:
        return {}
    }
  }

  const metrics = getMetrics()

  // Componente de Card de Métrica
  const MetricCard = ({ title, value, unit, reference, trend }) => {
    const status = getStatus(value, reference)

    return (
      <Card className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          <Badge variant={status === 'excellent' ? 'default' : status === 'good' ? 'secondary' : 'destructive'}>
            {status}
          </Badge>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
          {trend && <TrendIcon trend={trend} />}
        </div>

        {reference && (
          <div className="mt-2">
            <Progress
              value={getProgressValue(value, reference)}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ideal: {reference.idealMin}-{reference.idealMax} {unit}
            </p>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {subtype === 'broiler' && (
          <>
            <MetricCard
              title="Peso aos 42 dias"
              value={metrics.peso_42d}
              unit="kg"
              reference={references?.peso_42d}
              trend="up"
            />
            <MetricCard
              title="Conversão Alimentar"
              value={metrics.conversao}
              unit="kg/kg"
              reference={references?.conversao_alimentar}
              trend="down"
            />
            <MetricCard
              title="Mortalidade"
              value={metrics.mortalidade}
              unit="%"
              reference={references?.mortalidade}
              trend="down"
            />
            <MetricCard
              title="IEP"
              value={metrics.iep}
              unit="pontos"
              reference={references?.iep}
              trend="up"
            />
          </>
        )}
      </div>

      {/* Gráficos e Análises */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Análise Temporal</h3>
        {/* Implementar gráficos com Recharts */}
      </Card>
    </div>
  )
}

// Funções auxiliares
function getStatus(value: number, reference: any) {
  if (!reference) return 'unknown'

  if (reference.idealMin && reference.idealMax) {
    if (value >= reference.idealMin && value <= reference.idealMax) {
      return 'excellent'
    }
  }

  if (value >= reference.min && value <= reference.max) {
    return 'good'
  }

  return 'attention'
}

function getProgressValue(value: number, reference: any) {
  if (!reference) return 0

  const range = reference.max - reference.min
  const progress = ((value - reference.min) / range) * 100

  return Math.max(0, Math.min(100, progress))
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  switch(trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-green-600" />
    case 'down':
      return <TrendingDown className="w-4 h-4 text-red-600" />
    default:
      return <Minus className="w-4 h-4 text-gray-600" />
  }
}
```

## 4. Outros Componentes Auxiliares

```typescript
// components/analysis/SubtypeSelector.tsx
export function SubtypeSelector({ subtypes, selected, onChange }) {
  return (
    <div className="bg-card p-4 rounded-lg border">
      <label className="block text-sm font-medium mb-2">
        Categoria de Produção
      </label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border rounded-md"
      >
        {subtypes.map(subtype => (
          <option key={subtype.id} value={subtype.id}>
            {subtype.name}
          </option>
        ))}
      </select>
    </div>
  )
}

// components/analysis/ForageIntegrationBanner.tsx
export function ForageIntegrationBanner() {
  return (
    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200">
      <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
        <Wheat className="w-5 h-5" />
        <p className="text-sm font-medium">
          Esta espécie integra análise de forragem para nutrição
        </p>
      </div>
    </div>
  )
}
```
