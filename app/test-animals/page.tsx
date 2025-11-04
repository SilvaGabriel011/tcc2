'use client'

import { AnimalSilhouette } from '@/components/layman/AnimalSilhouettes'
import { ColorLegend } from '@/components/layman/ColorLegend'
import type { ColorCategory, LabelCategory } from '@/lib/layman/types'

export default function TestAnimalsPage() {
  const animals: Array<{
    species: 'bovine' | 'swine' | 'poultry' | 'sheep' | 'goat' | 'fish'
    name: string
    description: string
  }> = [
    { species: 'bovine', name: 'Bovinos', description: 'Gado de leite e corte' },
    { species: 'swine', name: 'Suínos', description: 'Porcos em diferentes fases' },
    { species: 'poultry', name: 'Aves', description: 'Frangos e galinhas poedeiras' },
    { species: 'sheep', name: 'Ovinos', description: 'Ovelhas para lã e carne' },
    { species: 'goat', name: 'Caprinos', description: 'Cabras e bodes' },
    { species: 'fish', name: 'Peixes', description: 'Tilápia, Tambaqui e outros' }
  ]

  const states: Array<{ color: ColorCategory; label: LabelCategory }> = [
    { color: 'green', label: 'ótimo' },
    { color: 'yellow', label: 'ok' },
    { color: 'red', label: 'ruim' }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Teste de Visualização de Animais</h1>
        <p className="text-muted-foreground">
          Visualização das representações de cada espécie animal em diferentes estados
        </p>
      </div>

      {/* Legenda de cores */}
      <div className="mb-8">
        <ColorLegend />
      </div>

      {/* Grid de animais */}
      <div className="space-y-12">
        {animals.map((animal) => (
          <div key={animal.species}>
            <h2 className="text-2xl font-semibold mb-4">
              {animal.name}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({animal.description})
              </span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {states.map((state) => (
                <div key={`${animal.species}-${state.color}`}>
                  <AnimalSilhouette
                    species={animal.species}
                    color={state.color}
                    label={state.label}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Observações para melhorias:</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Esta é uma versão inicial das representações. Se você tiver SVGs específicos de cada animal
          ou sugestões de melhorias, por favor compartilhe para que possamos melhorar as visualizações.
        </p>
        <p className="text-sm text-muted-foreground">
          As cores são aplicadas dinamicamente baseadas no estado de saúde/produtividade do animal:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
          <li><strong className="text-green-600">Verde:</strong> Animal em ótimas condições</li>
          <li><strong className="text-yellow-600">Amarelo:</strong> Necessita monitoramento</li>
          <li><strong className="text-red-600">Vermelho:</strong> Requer intervenção imediata</li>
        </ul>
      </div>
    </div>
  )
}
