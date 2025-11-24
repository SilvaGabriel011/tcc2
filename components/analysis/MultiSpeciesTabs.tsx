/**
 * EN: Multi-Species Tabs Component - Species selection interface for zootechnical analysis
 * PT-BR: Componente de Abas Multi-Espécie - Interface de seleção de espécies para análise zootécnica
 *
 * EN: This component provides a tabbed interface for selecting animal species and subtypes,
 *     loads species-specific reference data from NRC/EMBRAPA, and displays available metrics.
 *     Supports bovine, swine, poultry, sheep, goat, aquaculture, and forage analysis.
 * PT-BR: Este componente fornece uma interface com abas para selecionar espécies animais e subtipos,
 *        carrega dados de referência específicos da espécie do NRC/EMBRAPA e exibe métricas disponíveis.
 *        Suporta análise de bovinos, suínos, aves, ovinos, caprinos, piscicultura e forragem.
 */
'use client'

import { useState, useEffect } from 'react'
import { Tabs } from '@/components/tabs'
import { Bird, Beef, Fish, Wheat, Activity, ChevronDown, Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Species } from '@/lib/generate-test-data'

/**
 * EN: Custom icon for swine species
 * PT-BR: Ícone customizado para espécie suína
 */
const PigIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
    <circle cx="9" cy="10" r="1.5" />
    <circle cx="15" cy="10" r="1.5" />
    <path d="M8 15 Q12 17 16 15" strokeLinecap="round" />
  </svg>
)

const SheepIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="7" />
    <path d="M8 8 Q12 6 16 8" strokeLinecap="round" />
    <circle cx="9" cy="10" r="1" />
    <circle cx="15" cy="10" r="1" />
  </svg>
)

const GoatIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="6" />
    <path d="M8 7 L8 5" strokeLinecap="round" />
    <path d="M16 7 L16 5" strokeLinecap="round" />
    <circle cx="9" cy="10" r="1" />
    <circle cx="15" cy="10" r="1" />
    <path d="M12 16 L12 18" strokeLinecap="round" />
  </svg>
)

const BeeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="12" rx="5" ry="6" />
    <path d="M7 10 L5 8" strokeLinecap="round" />
    <path d="M17 10 L19 8" strokeLinecap="round" />
    <path d="M7 9 L17 9" strokeLinecap="round" />
    <path d="M7 12 L17 12" strokeLinecap="round" />
    <path d="M7 15 L17 15" strokeLinecap="round" />
    <circle cx="10" cy="10" r="0.5" fill="currentColor" />
    <circle cx="14" cy="10" r="0.5" fill="currentColor" />
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
  description: string
  color: string
}

export const SPECIES_CONFIGS: SpeciesConfig[] = [
  {
    id: 'bovine',
    name: 'Bovinos',
    code: 'bovine',
    icon: <Beef className="w-4 h-4" />,
    color: 'brown',
    subtypes: [
      { id: 'dairy', name: 'Leite', code: 'dairy', description: 'Produção leiteira' },
      { id: 'beef', name: 'Corte', code: 'beef', description: 'Produção de carne' },
      { id: 'dual', name: 'Dupla Aptidão', code: 'dual', description: 'Leite e carne' },
    ],
    description: 'Análise completa para bovinocultura de leite e corte',
  },
  {
    id: 'swine',
    name: 'Suínos',
    code: 'swine',
    icon: <PigIcon />,
    color: 'pink',
    subtypes: [
      { id: 'nursery', name: 'Creche', code: 'nursery', description: 'Leitões de 21 a 63 dias' },
      { id: 'growing', name: 'Crescimento', code: 'growing', description: 'Fase de 63 a 120 dias' },
      {
        id: 'finishing',
        name: 'Terminação',
        code: 'finishing',
        description: 'Fase final até o abate',
      },
      {
        id: 'breeding',
        name: 'Reprodução',
        code: 'breeding',
        description: 'Matrizes e reprodutores',
      },
    ],
    description: 'Gestão completa da suinocultura com análise por fase de produção',
  },
  {
    id: 'poultry',
    name: 'Aves',
    code: 'poultry',
    icon: <Bird className="w-4 h-4" />,
    color: 'orange',
    subtypes: [
      {
        id: 'broiler',
        name: 'Frango de Corte',
        code: 'broiler',
        description: 'Produção de carne de frango',
      },
      { id: 'layer', name: 'Poedeiras', code: 'layer', description: 'Produção de ovos comerciais' },
      { id: 'breeder', name: 'Matrizes', code: 'breeder', description: 'Reprodução e incubação' },
    ],
    description: 'Análise completa para produção avícola com métricas de desempenho zootécnico',
  },
  {
    id: 'sheep',
    name: 'Ovinos',
    code: 'sheep',
    icon: <SheepIcon />,
    color: 'gray',
    subtypes: [
      { id: 'meat', name: 'Corte', code: 'meat', description: 'Produção de carne ovina' },
      { id: 'wool', name: 'Lã', code: 'wool', description: 'Produção de lã' },
      { id: 'milk', name: 'Leite', code: 'milk', description: 'Produção de leite ovino' },
    ],
    description: 'Análise para ovinocultura com métricas específicas',
  },
  {
    id: 'goat',
    name: 'Caprinos',
    code: 'goat',
    icon: <GoatIcon />,
    color: 'amber',
    subtypes: [
      { id: 'meat', name: 'Corte', code: 'meat', description: 'Produção de carne caprina' },
      { id: 'milk', name: 'Leite', code: 'milk', description: 'Produção de leite caprino' },
      { id: 'skin', name: 'Pele', code: 'skin', description: 'Produção de peles' },
    ],
    description: 'Análise para caprinocultura com foco em produtividade',
  },
  {
    id: 'aquaculture',
    name: 'Piscicultura',
    code: 'aquaculture',
    icon: <Fish className="w-4 h-4" />,
    color: 'blue',
    subtypes: [
      { id: 'tilapia', name: 'Tilápia', code: 'tilapia', description: 'Produção de tilápia' },
      { id: 'tambaqui', name: 'Tambaqui', code: 'tambaqui', description: 'Produção de tambaqui' },
      { id: 'pintado', name: 'Pintado', code: 'pintado', description: 'Produção de pintado' },
      { id: 'pacu', name: 'Pacu', code: 'pacu', description: 'Produção de pacu' },
    ],
    description: 'Análise completa para piscicultura com controle de qualidade da água',
  },
  {
    id: 'forage',
    name: 'Forragem',
    code: 'forage',
    icon: <Wheat className="w-4 h-4" />,
    color: 'green',
    subtypes: [
      {
        id: 'brachiaria',
        name: 'Brachiaria',
        code: 'brachiaria',
        description: 'Braquiária - forrageira tropical',
      },
      {
        id: 'panicum',
        name: 'Panicum',
        code: 'panicum',
        description: 'Panicum maximum - Mombaça, Tanzânia',
      },
      { id: 'cynodon', name: 'Cynodon', code: 'cynodon', description: 'Tifton, Coast-cross' },
      { id: 'mixed', name: 'Misto', code: 'mixed', description: 'Consórcio de forrageiras' },
    ],
    description: 'Análise de produção e qualidade de pastagens e forragens para nutrição animal',
  },
  {
    id: 'bees',
    name: 'Abelhas',
    code: 'bees',
    icon: <BeeIcon />,
    color: 'yellow',
    subtypes: [
      {
        id: 'apis_mellifera',
        name: 'Apis mellifera',
        code: 'apis_mellifera',
        description: 'Abelhas africanizadas e europeias',
      },
      {
        id: 'abelhas_nativas',
        name: 'Abelhas Nativas',
        code: 'abelhas_nativas',
        description: 'Meliponíneos - abelhas sem ferrão',
      },
    ],
    description:
      'Análise completa para apicultura e meliponicultura com métricas de produção, sanidade e qualidade',
  },
]

interface ReferenceData {
  [metric: string]: {
    min: number
    max: number
    ideal_min?: number
    ideal_max?: number
    unit: string
    source: string
  }
}

interface MultiSpeciesTabsProps {
  onSpeciesChange?: (species: Species, subtype?: string) => void
  children?: (species: Species, subtype?: string, referenceData?: ReferenceData) => React.ReactNode
}

export function MultiSpeciesTabs({ onSpeciesChange, children }: MultiSpeciesTabsProps) {
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('bovine')
  const [selectedSubtype, setSelectedSubtype] = useState<string>('dairy')
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSubtypeDropdown, setShowSubtypeDropdown] = useState(false)

  // Resetar subtipo quando espécie muda
  useEffect(() => {
    const currentSpeciesConfig = SPECIES_CONFIGS.find((s) => s.id === selectedSpecies)
    if (currentSpeciesConfig?.subtypes && currentSpeciesConfig.subtypes.length > 0) {
      const firstSubtype = currentSpeciesConfig.subtypes[0].id
      setSelectedSubtype(firstSubtype)
    }
  }, [selectedSpecies])

  // Carregar dados de referência quando mudar espécie/subtipo
  useEffect(() => {
    const controller = new AbortController()

    const loadData = async () => {
      // Limpar dados antigos imediatamente ao trocar de espécie/subtipo
      setReferenceData(null)
      setLoading(true)

      try {
        const url = `/api/reference/${selectedSpecies}/data`
        const response = await fetch(selectedSubtype ? `${url}?subtype=${selectedSubtype}` : url, {
          signal: controller.signal,
        })

        if (response.ok) {
          const result = await response.json()
          if (!controller.signal.aborted) {
            setReferenceData(result.data)
          }
        } else {
          if (!controller.signal.aborted) {
            console.warn('⚠️ Nenhuma referência encontrada para:', selectedSpecies, selectedSubtype)
            setReferenceData(null)
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Erro ao carregar referências:', error)
          toast.error('Erro ao carregar dados de referência')
          setReferenceData(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      controller.abort()
    }
  }, [selectedSpecies, selectedSubtype])

  const handleSubtypeChange = (subtypeId: string) => {
    setSelectedSubtype(subtypeId)
    setShowSubtypeDropdown(false)
    onSpeciesChange?.(selectedSpecies, subtypeId)
  }

  const handleSpeciesTabChange = (speciesId: string) => {
    setSelectedSpecies(speciesId as Species)
  }

  const tabs = SPECIES_CONFIGS.map((species) => {
    // Calcular subtipo atual para ESTA espécie específica
    const isActiveSpecies = selectedSpecies === species.id
    const activeSubtype = isActiveSpecies
      ? species.subtypes?.find((st) => st.id === selectedSubtype)
      : species.subtypes?.[0]

    return {
      id: species.id,
      label: species.name,
      icon: species.icon,
      content: (
        <div className="space-y-6" key={`${species.id}-${selectedSubtype}`}>
          {/* Seletor de Subtipo */}
          {species.subtypes && species.subtypes.length > 0 && (
            <div className="bg-card dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
              <label className="block text-sm font-medium text-foreground dark:text-gray-200 mb-2">
                Categoria de Produção
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowSubtypeDropdown(!showSubtypeDropdown)}
                  className="w-full md:w-64 px-4 py-2 text-left bg-background dark:bg-gray-900 border dark:border-gray-600 rounded-md flex items-center justify-between hover:bg-muted dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <span className="font-medium text-foreground dark:text-gray-200">
                      {activeSubtype?.name ?? 'Selecione...'}
                    </span>
                    {activeSubtype?.description && (
                      <span className="block text-xs text-muted-foreground dark:text-gray-400 mt-1">
                        {activeSubtype.description}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground dark:text-gray-400 transition-transform ${showSubtypeDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {showSubtypeDropdown && isActiveSpecies && (
                  <div className="absolute z-10 w-full md:w-64 mt-1 bg-card dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg">
                    {species.subtypes.map((subtype) => (
                      <button
                        key={subtype.id}
                        onClick={() => handleSubtypeChange(subtype.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-muted dark:hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md ${
                          selectedSubtype === subtype.id ? 'bg-muted dark:bg-gray-700' : ''
                        }`}
                      >
                        <div className="font-medium text-foreground dark:text-gray-200">
                          {subtype.name}
                        </div>
                        {subtype.description && (
                          <div className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                            {subtype.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descrição da Espécie */}
          <div className="bg-muted/50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h3 className="font-medium text-foreground dark:text-gray-200 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Sobre esta análise
            </h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
              {species.description}
            </p>

            {/* Indicador de Loading */}
            {loading && selectedSpecies === species.id && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando dados de referência...
              </div>
            )}

            {/* Métricas de Referência */}
            {!loading && referenceData && selectedSpecies === species.id && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-foreground dark:text-gray-200 mb-3">
                  Valores de Referência Disponíveis:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(referenceData)
                    .slice(0, 6)
                    .map(([metric, data]) => (
                      <div
                        key={metric}
                        className="bg-card dark:bg-gray-900 p-3 rounded-lg border dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground dark:text-gray-200">
                            {metric.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground dark:text-gray-400">
                            {data.unit}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground dark:text-gray-400">
                          Ideal: {data.ideal_min ?? data.min}-{data.ideal_max ?? data.max}{' '}
                          {data.unit}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {data.source}
                        </div>
                      </div>
                    ))}
                </div>
                {Object.keys(referenceData).length > 6 && (
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                    +{Object.keys(referenceData).length - 6} métricas disponíveis
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Área de Conteúdo Dinâmico */}
          <div className="mt-6">
            {children ? (
              children(species.id as Species, selectedSubtype, referenceData ?? undefined)
            ) : (
              <div className="text-center py-12 bg-card dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground dark:text-gray-400 mb-4" />
                <p className="text-muted-foreground dark:text-gray-400">
                  Faça upload de dados de {species.name.toLowerCase()} para começar a análise
                </p>
              </div>
            )}
          </div>
        </div>
      ),
    }
  })

  return (
    <div className="w-full">
      <Tabs tabs={tabs} defaultTab="bovine" onTabChange={handleSpeciesTabChange} />
    </div>
  )
}
