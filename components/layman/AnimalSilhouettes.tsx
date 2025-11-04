/**
 * AnimalSilhouettes - Realistic SVG representations for each animal species
 */

'use client'

import { getColorHex, getLabelText } from '@/lib/layman/colors'
import type { ColorCategory, LabelCategory } from '@/lib/layman/types'

interface AnimalSilhouetteProps {
  species: 'bovine' | 'swine' | 'poultry' | 'sheep' | 'goat' | 'fish'
  color: ColorCategory
  label: LabelCategory
}

// Bovino (Boi/Vaca) - Vista lateral realista
const BovineSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 400 250" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo principal */}
    <ellipse cx="200" cy="140" rx="90" ry="50" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Cabeça */}
    <ellipse cx="110" cy="120" rx="35" ry="30" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Focinho */}
    <ellipse cx="85" cy="125" rx="15" ry="12" fill={color} stroke="#333" strokeWidth="2"/>
    <ellipse cx="80" cy="125" rx="3" ry="2" fill="#333"/>
    <ellipse cx="90" cy="125" rx="3" ry="2" fill="#333"/>
    
    {/* Chifres */}
    <path d="M100 105 L95 95" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M115 105 L120 95" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Orelhas */}
    <ellipse cx="100" cy="115" rx="8" ry="12" fill={color} stroke="#333" strokeWidth="2" transform="rotate(-30 100 115)"/>
    <ellipse cx="120" cy="115" rx="8" ry="12" fill={color} stroke="#333" strokeWidth="2" transform="rotate(30 120 115)"/>
    
    {/* Olho */}
    <circle cx="105" cy="120" r="3" fill="#333"/>
    
    {/* Pernas */}
    <rect x="130" y="160" width="12" height="50" fill={color} stroke="#333" strokeWidth="2"/>
    <rect x="160" y="160" width="12" height="50" fill={color} stroke="#333" strokeWidth="2"/>
    <rect x="230" y="160" width="12" height="50" fill={color} stroke="#333" strokeWidth="2"/>
    <rect x="260" y="160" width="12" height="50" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Cascos */}
    <ellipse cx="136" cy="210" rx="8" ry="5" fill="#333"/>
    <ellipse cx="166" cy="210" rx="8" ry="5" fill="#333"/>
    <ellipse cx="236" cy="210" rx="8" ry="5" fill="#333"/>
    <ellipse cx="266" cy="210" rx="8" ry="5" fill="#333"/>
    
    {/* Rabo */}
    <path d="M280 140 Q300 160 295 190" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"/>
    <ellipse cx="295" cy="195" rx="8" ry="12" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Úbere (para vacas leiteiras) */}
    <ellipse cx="200" cy="170" rx="25" ry="15" fill="#ffb3d9" stroke="#333" strokeWidth="2" opacity="0.8"/>
  </svg>
)

// Suíno (Porco) - Vista lateral realista
const SwineSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 400 250" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo principal - mais roliço */}
    <ellipse cx="200" cy="140" rx="85" ry="55" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Cabeça */}
    <ellipse cx="120" cy="130" rx="32" ry="28" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Focinho característico */}
    <ellipse cx="95" cy="135" rx="18" ry="14" fill="#ff99cc" stroke="#333" strokeWidth="2"/>
    <ellipse cx="90" cy="135" rx="4" ry="3" fill="#333"/>
    <ellipse cx="100" cy="135" rx="4" ry="3" fill="#333"/>
    
    {/* Orelhas triangulares */}
    <path d="M110 115 L105 100 L115 108 Z" fill={color} stroke="#333" strokeWidth="2"/>
    <path d="M130 115 L135 100 L125 108 Z" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Olhos */}
    <circle cx="110" cy="125" r="3" fill="#333"/>
    <circle cx="125" cy="125" r="3" fill="#333"/>
    
    {/* Pernas mais curtas */}
    <rect x="140" y="170" width="14" height="40" fill={color} stroke="#333" strokeWidth="2"/>
    <rect x="170" y="170" width="14" height="40" fill={color} stroke="#333" strokeWidth="2"/>
    <rect x="220" y="170" width="14" height="40" fill={color} stroke="#333" strokeWidth="2"/>
    <rect x="250" y="170" width="14" height="40" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Cascos */}
    <ellipse cx="147" cy="210" rx="8" ry="5" fill="#333"/>
    <ellipse cx="177" cy="210" rx="8" ry="5" fill="#333"/>
    <ellipse cx="227" cy="210" rx="8" ry="5" fill="#333"/>
    <ellipse cx="257" cy="210" rx="8" ry="5" fill="#333"/>
    
    {/* Rabo encaracolado característico */}
    <path d="M275 140 Q285 130 280 120 Q275 115 280 110 Q285 105 280 100" 
          stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"/>
  </svg>
)

// Frango/Ave - Vista lateral
const PoultrySVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 400 250" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo */}
    <ellipse cx="200" cy="140" rx="60" ry="45" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Pescoço */}
    <rect x="145" y="110" width="25" height="40" fill={color} stroke="#333" strokeWidth="2" transform="rotate(-15 157 130)"/>
    
    {/* Cabeça */}
    <circle cx="150" cy="95" r="20" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Bico */}
    <path d="M130 95 L118 95 L130 100 Z" fill="#ff9933" stroke="#333" strokeWidth="2"/>
    
    {/* Crista */}
    <path d="M150 75 Q145 70 140 75 Q135 70 130 75" fill="#ff3333" stroke="#333" strokeWidth="2"/>
    
    {/* Barbela */}
    <ellipse cx="145" cy="105" rx="6" ry="8" fill="#ff3333" stroke="#333" strokeWidth="2"/>
    
    {/* Olho */}
    <circle cx="145" cy="90" r="3" fill="#333"/>
    <circle cx="145" cy="90" r="1" fill="white"/>
    
    {/* Asa */}
    <ellipse cx="190" cy="140" rx="40" ry="25" fill={color} stroke="#333" strokeWidth="2" transform="rotate(-10 190 140)"/>
    <path d="M165 140 Q175 145 185 140" stroke="#333" strokeWidth="1"/>
    <path d="M175 145 Q185 150 195 145" stroke="#333" strokeWidth="1"/>
    
    {/* Pernas */}
    <rect x="175" y="175" width="6" height="35" fill="#ff9933" stroke="#333" strokeWidth="2"/>
    <rect x="210" y="175" width="6" height="35" fill="#ff9933" stroke="#333" strokeWidth="2"/>
    
    {/* Pés */}
    <path d="M178 210 L170 215 M178 210 L178 218 M178 210 L186 215" stroke="#ff9933" strokeWidth="3" strokeLinecap="round"/>
    <path d="M213 210 L205 215 M213 210 L213 218 M213 210 L221 215" stroke="#ff9933" strokeWidth="3" strokeLinecap="round"/>
    
    {/* Cauda */}
    <path d="M250 130 Q265 120 270 110 M250 135 Q265 130 270 125 M250 140 Q265 140 270 140" 
          stroke={color} strokeWidth="4" fill="none" strokeLinecap="round"/>
  </svg>
)

// Ovino (Ovelha) - Vista lateral
const SheepSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 400 250" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo com textura de lã */}
    <ellipse cx="200" cy="140" rx="75" ry="50" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Círculos para simular lã */}
    <circle cx="170" cy="130" r="12" fill={color} stroke="#333" strokeWidth="1" opacity="0.7"/>
    <circle cx="190" cy="125" r="12" fill={color} stroke="#333" strokeWidth="1" opacity="0.7"/>
    <circle cx="210" cy="130" r="12" fill={color} stroke="#333" strokeWidth="1" opacity="0.7"/>
    <circle cx="230" cy="135" r="12" fill={color} stroke="#333" strokeWidth="1" opacity="0.7"/>
    <circle cx="180" cy="150" r="12" fill={color} stroke="#333" strokeWidth="1" opacity="0.7"/>
    <circle cx="200" cy="145" r="12" fill={color} stroke="#333" strokeWidth="1" opacity="0.7"/>
    <circle cx="220" cy="150" r="12" fill={color} stroke="#333" strokeWidth="1" opacity="0.7"/>
    
    {/* Cabeça */}
    <ellipse cx="130" cy="130" rx="25" ry="20" fill="#333" stroke="#333" strokeWidth="2"/>
    
    {/* Orelhas caídas */}
    <ellipse cx="115" cy="135" rx="8" ry="12" fill="#333" stroke="#333" strokeWidth="2" transform="rotate(-45 115 135)"/>
    <ellipse cx="145" cy="135" rx="8" ry="12" fill="#333" stroke="#333" strokeWidth="2" transform="rotate(45 145 135)"/>
    
    {/* Olhos */}
    <circle cx="125" cy="125" r="2" fill="white"/>
    <circle cx="135" cy="125" r="2" fill="white"/>
    
    {/* Focinho */}
    <ellipse cx="115" cy="130" rx="8" ry="6" fill="#ffb3ba" stroke="#333" strokeWidth="1"/>
    
    {/* Pernas */}
    <rect x="155" y="170" width="10" height="40" fill="#333" stroke="#333" strokeWidth="2"/>
    <rect x="180" y="170" width="10" height="40" fill="#333" stroke="#333" strokeWidth="2"/>
    <rect x="210" y="170" width="10" height="40" fill="#333" stroke="#333" strokeWidth="2"/>
    <rect x="235" y="170" width="10" height="40" fill="#333" stroke="#333" strokeWidth="2"/>
    
    {/* Cascos */}
    <ellipse cx="160" cy="210" rx="6" ry="4" fill="#333"/>
    <ellipse cx="185" cy="210" rx="6" ry="4" fill="#333"/>
    <ellipse cx="215" cy="210" rx="6" ry="4" fill="#333"/>
    <ellipse cx="240" cy="210" rx="6" ry="4" fill="#333"/>
    
    {/* Rabo pequeno */}
    <ellipse cx="270" cy="145" rx="10" ry="8" fill={color} stroke="#333" strokeWidth="2"/>
  </svg>
)

// Caprino (Cabra/Bode) - Vista lateral
const GoatSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 400 250" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo mais esguio */}
    <ellipse cx="200" cy="140" rx="70" ry="40" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Cabeça alongada */}
    <ellipse cx="130" cy="125" rx="28" ry="22" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Focinho */}
    <ellipse cx="108" cy="130" rx="12" ry="8" fill={color} stroke="#333" strokeWidth="2"/>
    <ellipse cx="105" cy="130" rx="3" ry="2" fill="#333"/>
    <ellipse cx="112" cy="130" rx="3" ry="2" fill="#333"/>
    
    {/* Chifres curvos para trás */}
    <path d="M125 110 Q120 100 122 90" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M135 110 Q140 100 138 90" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
    
    {/* Barbicha característica */}
    <path d="M120 140 L120 155" stroke={color} strokeWidth="6" strokeLinecap="round"/>
    
    {/* Orelhas caídas */}
    <ellipse cx="120" cy="125" rx="6" ry="12" fill={color} stroke="#333" strokeWidth="2" transform="rotate(-60 120 125)"/>
    <ellipse cx="140" cy="125" rx="6" ry="12" fill={color} stroke="#333" strokeWidth="2" transform="rotate(60 140 125)"/>
    
    {/* Olhos */}
    <circle cx="125" cy="120" r="3" fill="#333"/>
    <circle cx="125" cy="120" r="1" fill="white"/>
    
    {/* Pernas longas e finas */}
    <rect x="155" y="165" width="9" height="45" fill={color} stroke="#333" strokeWidth="2"/>
    <rect x="180" y="165" width="9" height="45" fill={color} stroke="#333" strokeWidth="2"/>
    <rect x="215" y="165" width="9" height="45" fill={color} stroke="#333" strokeWidth="2"/>
    <rect x="240" y="165" width="9" height="45" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Cascos */}
    <ellipse cx="159" cy="210" rx="6" ry="4" fill="#333"/>
    <ellipse cx="184" cy="210" rx="6" ry="4" fill="#333"/>
    <ellipse cx="219" cy="210" rx="6" ry="4" fill="#333"/>
    <ellipse cx="244" cy="210" rx="6" ry="4" fill="#333"/>
    
    {/* Rabo erguido */}
    <path d="M265 135 Q275 125 275 115" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"/>
  </svg>
)

// Peixe (Tilápia genérica) - Vista lateral
const FishSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 400 250" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo do peixe */}
    <ellipse cx="200" cy="125" rx="90" ry="45" fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Cabeça */}
    <path d="M110 125 Q100 110 110 100 Q120 95 130 100 Q140 105 145 115" 
          fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Olho */}
    <circle cx="130" cy="115" r="8" fill="white" stroke="#333" strokeWidth="2"/>
    <circle cx="130" cy="115" r="5" fill="#333"/>
    <circle cx="132" cy="113" r="2" fill="white"/>
    
    {/* Boca */}
    <path d="M110 125 Q115 128 120 125" stroke="#333" strokeWidth="2" fill="none"/>
    
    {/* Guelras */}
    <path d="M150 110 Q155 125 150 140" stroke="#333" strokeWidth="2" fill="none"/>
    <path d="M160 110 Q165 125 160 140" stroke="#333" strokeWidth="2" fill="none"/>
    
    {/* Barbatana dorsal */}
    <path d="M180 80 Q200 75 240 80 Q230 95 200 100 Q170 95 180 80 Z" 
          fill={color} stroke="#333" strokeWidth="2" opacity="0.8"/>
    
    {/* Barbatana anal */}
    <path d="M190 170 Q210 175 230 170 Q220 160 210 155 Q190 160 190 170 Z" 
          fill={color} stroke="#333" strokeWidth="2" opacity="0.8"/>
    
    {/* Barbatanas peitorais */}
    <ellipse cx="160" cy="130" rx="20" ry="15" fill={color} stroke="#333" strokeWidth="2" 
             opacity="0.8" transform="rotate(-20 160 130)"/>
    
    {/* Cauda */}
    <path d="M290 125 L320 105 Q315 125 320 145 L290 125 Z" 
          fill={color} stroke="#333" strokeWidth="2"/>
    
    {/* Escamas (linhas decorativas) */}
    <path d="M170 105 Q175 110 180 105 M180 105 Q185 110 190 105 M190 105 Q195 110 200 105" 
          stroke="#333" strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M175 115 Q180 120 185 115 M185 115 Q190 120 195 115 M195 115 Q200 120 205 115" 
          stroke="#333" strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M170 125 Q175 130 180 125 M180 125 Q185 130 190 125 M190 125 Q195 130 200 125" 
          stroke="#333" strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M175 135 Q180 140 185 135 M185 135 Q190 140 195 135 M195 135 Q200 140 205 135" 
          stroke="#333" strokeWidth="1" fill="none" opacity="0.5"/>
  </svg>
)

export function AnimalSilhouette({ species, color, label }: AnimalSilhouetteProps) {
  const colorHex = getColorHex(color)
  const labelText = getLabelText(label)

  // Mapa de títulos por espécie
  const speciesTitles: Record<string, string> = {
    bovine: 'Status do Gado',
    swine: 'Status do Suíno',
    poultry: 'Status da Ave',
    sheep: 'Status do Ovino',
    goat: 'Status do Caprino',
    fish: 'Status do Peixe'
  }

  // Mapa de mensagens de status por espécie
  const statusMessages: Record<string, Record<ColorCategory, string>> = {
    bovine: {
      green: '✓ Gado saudável e produtivo',
      yellow: '⚠ Monitorar de perto',
      red: '✗ Necessita intervenção'
    },
    swine: {
      green: '✓ Suínos em bom desenvolvimento',
      yellow: '⚠ Atenção aos parâmetros',
      red: '✗ Ajustes necessários'
    },
    poultry: {
      green: '✓ Aves com boa performance',
      yellow: '⚠ Revisar manejo',
      red: '✗ Corrigir problemas'
    },
    sheep: {
      green: '✓ Rebanho saudável',
      yellow: '⚠ Verificar nutrição',
      red: '✗ Intervenção urgente'
    },
    goat: {
      green: '✓ Caprinos produtivos',
      yellow: '⚠ Ajustar alimentação',
      red: '✗ Ação imediata'
    },
    fish: {
      green: '✓ Peixes em boas condições',
      yellow: '⚠ Verificar qualidade da água',
      red: '✗ Corrigir parâmetros'
    }
  }

  // Selecionar o componente SVG apropriado
  const getSVGComponent = () => {
    switch (species) {
      case 'bovine':
        return <BovineSVG color={colorHex} />
      case 'swine':
        return <SwineSVG color={colorHex} />
      case 'poultry':
        return <PoultrySVG color={colorHex} />
      case 'sheep':
        return <SheepSVG color={colorHex} />
      case 'goat':
        return <GoatSVG color={colorHex} />
      case 'fish':
        return <FishSVG color={colorHex} />
      default:
        return <BovineSVG color={colorHex} />
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {speciesTitles[species] || 'Status do Animal'}
        </h3>
      </div>
      
      <div className="relative">
        {/* Renderizar o SVG apropriado */}
        {getSVGComponent()}

        {/* Label de status */}
        <div 
          className="absolute top-4 right-4 px-4 py-2 rounded-full text-white font-bold shadow-lg text-sm"
          style={{ backgroundColor: colorHex }}
        >
          {labelText}
        </div>
      </div>

      {/* Mensagem de status */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {statusMessages[species]?.[color] || statusMessages.bovine[color]}
        </p>
      </div>
    </div>
  )
}

// Exportar o componente antigo para compatibilidade
export function CattleSilhouette({ color, label }: Omit<AnimalSilhouetteProps, 'species'>) {
  return <AnimalSilhouette species="bovine" color={color} label={label} />
}
