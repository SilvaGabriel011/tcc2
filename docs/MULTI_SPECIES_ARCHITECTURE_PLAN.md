# 🐮 Plano de Arquitetura - Sistema de Análise Zootécnica Multi-Espécie

## 📋 Resumo Executivo

Sistema completo para análise de dados zootécnicos de múltiplas espécies (aves, suínos, bovinos, caprinos, ovinos, forragem e piscicultura) com dados de referência científicos (NRC/EMBRAPA) e interpretação robusta para leigos.

## 🎯 Objetivos Principais

1. **Suporte Multi-Espécie** - Abas específicas com subtipos (corte/leite/postura)
2. **Base Científica** - Dados NRC, EMBRAPA e literatura atualizada
3. **Interpretação Robusta** - Analogias práticas e insights acionáveis
4. **IA Híbrida** - 80% regras, 20% IA com fallback garantido

## 🏗️ Arquitetura do Sistema

### Estrutura de Pastas

```
components/analysis/
├── MultiSpeciesTabs.tsx      # Sistema de abas principal
├── SpeciesUploadForm.tsx     # Upload adaptativo por espécie
└── species/                  # Componentes específicos
    ├── PoultryAnalysis.tsx
    ├── SwineAnalysis.tsx
    ├── BovineAnalysis.tsx
    ├── ForageAnalysis.tsx
    └── AquacultureAnalysis.tsx

lib/
├── references/               # Dados de referência
│   ├── nrc-data.ts
│   ├── embrapa-data.ts
│   └── species-references.ts
├── analysis/                 # Motores de análise
│   ├── multi-species-engine.ts
│   └── reference-comparator.ts
└── interpretation/          # Sistema de interpretação
    ├── enhanced-layman.ts
    └── analogy-generator.ts

app/api/
├── reference/[species]/     # APIs de referência
├── analysis/multi-species/  # Análise contextualizada
└── interpretation/enhanced/ # Interpretação robusta
```

## 📊 Modelos de Dados (Prisma)

```prisma
model AnimalSpecies {
  id            String   @id @default(cuid())
  code          String   @unique // 'bovine','swine','poultry'
  name          String   // 'Bovinos','Suínos','Aves'
  hasSubtypes   Boolean  @default(false)
  subtypes      AnimalSubtype[]
  references    ReferenceData[]
  @@map("animal_species")
}

model AnimalSubtype {
  id          String   @id @default(cuid())
  speciesId   String
  code        String   // 'dairy','beef','broiler'
  name        String   // 'Leite','Corte','Frango'
  species     AnimalSpecies @relation(fields: [speciesId], references: [id])
  references  ReferenceData[]
  @@map("animal_subtypes")
}

model ReferenceData {
  id            String   @id @default(cuid())
  speciesId     String
  subtypeId     String?
  metric        String   // 'gpd','peso_nascimento'
  minValue      Float
  idealMinValue Float?
  idealMaxValue Float?
  maxValue      Float
  unit          String   // 'kg','%','g/dia'
  source        String   // 'NRC 2016','EMBRAPA 2023'
  species       AnimalSpecies  @relation(fields: [speciesId], references: [id])
  subtype       AnimalSubtype? @relation(fields: [subtypeId], references: [id])
  @@index([speciesId, metric])
  @@map("reference_data")
}

model ForageReference {
  id          String   @id @default(cuid())
  forageType  String   // 'brachiaria','panicum'
  metric      String   // 'biomassa','proteina_bruta'
  minValue    Float
  idealValue  Float
  maxValue    Float
  unit        String
  season      String?  // 'seca','aguas'
  source      String
  @@map("forage_references")
}
```

## 🐄 Espécies e Métricas

### AVES

**Frango de Corte**

- Peso 42 dias: 2.5-2.8kg (ideal)
- Conversão alimentar: 1.6-1.8 (ideal)
- Mortalidade: <3% (aceitável)
- IEP: 320-380 (excelente)

**Poedeiras**

- Produção: 85-92% (ideal)
- Peso ovo: 58-63g (ideal)
- Conversão/dúzia: 1.5-1.7kg (ideal)

### SUÍNOS

**Terminação**

- GPD: 0.85-1.0kg/dia (ideal)
- Conversão: 2.5-2.8 (ideal)
- Espessura toucinho: 12-16mm (ideal)
- Carne magra: 56-60% (ideal)

### BOVINOS

**Leite**

- Produção: 20-30L/dia (ideal)
- Proteína: 3.0-3.4% (ideal)
- Gordura: 3.5-4.0% (ideal)
- ECC: 3.0-3.5 (ideal)

**Corte**

- GPD: 1.0-1.4kg/dia (ideal)
- Rendimento: 52-58% (ideal)
- AOL: 75-90cm² (ideal)

### FORRAGEM

**Brachiaria brizantha**

- Biomassa: 4500kg/ha (ideal águas)
- Proteína bruta: 10% (ideal)
- FDN: 62% (ideal)
- Digestibilidade: 65% (ideal)

## 💻 Componentes Principais

### 1. MultiSpeciesTabs.tsx

```typescript
export const SPECIES_CONFIGS = [
  {
    id: 'poultry',
    name: 'Aves',
    icon: <Bird />,
    subtypes: [
      { id: 'broiler', name: 'Frango de Corte' },
      { id: 'layer', name: 'Poedeiras' }
    ],
    metrics: ['peso_vivo','conversao_alimentar','mortalidade']
  },
  {
    id: 'bovine',
    name: 'Bovinos',
    icon: <Beef />,
    subtypes: [
      { id: 'dairy', name: 'Leite' },
      { id: 'beef', name: 'Corte' }
    ],
    hasForage: true,
    metrics: ['peso_vivo','gpd','producao_leite','escore_corporal']
  }
]
```

### 2. ReferenceService

```typescript
class ReferenceService {
  async compareWithReferences(data, species, subtype) {
    const references = await this.getReferenceData(species, subtype)
    return references.map((ref) => ({
      metric: ref.metric,
      value: data[ref.metric],
      status: this.evaluateStatus(data[ref.metric], ref),
      reference: ref,
    }))
  }

  evaluateStatus(value, ref) {
    if (value >= ref.idealMinValue && value <= ref.idealMaxValue) return 'excellent'
    if (value >= ref.minValue && value <= ref.maxValue) return 'good'
    return 'attention'
  }
}
```

### 3. EnhancedLaymanInterpretation

```typescript
class EnhancedLaymanInterpretation {
  analogies = {
    poultry: {
      gpd: (val) =>
        `Ganhando ${val}g/dia, como adicionar ${Math.round(val / 50)} grãos de milho extras`,
      mortalidade: (val) => `${val}% significa perder ${Math.round(val * 10)} aves a cada 1000`,
    },
    bovine: {
      gpd: (val) => `Ganhando ${val}kg/dia = ${Math.round(val * 10)} bifes a mais por mês`,
      producao_leite: (val) => `${val}L/dia = ${Math.round(val / 0.2)} copos de leite`,
    },
  }

  generateActionableInsights(result, species) {
    const insights = []
    if (species === 'bovine' && result.producao_leite < 20) {
      insights.push({
        priority: 'high',
        action: 'Revisar dieta',
        suggestion: 'Aumentar proteína em 2% e verificar silagem',
      })
    }
    return insights
  }
}
```

## 📡 APIs

### GET /api/reference/species

Lista todas as espécies disponíveis com subtipos

### GET /api/reference/[species]/data

Retorna dados de referência para a espécie

### POST /api/analysis/multi-species

```json
{
  "data": {
    /* métricas */
  },
  "species": "bovine",
  "subtype": "dairy",
  "options": {
    "targetAudience": "producer"
  }
}
```

### POST /api/interpretation/enhanced

Gera interpretação robusta com analogias

## 🚀 Implementação Por Fases

### FASE 1: Infraestrutura (Semana 1-2)

```bash
# 1. Atualizar banco de dados
npx prisma migrate dev --name add_multi_species

# 2. Popular dados de referência
npm run seed:species

# 3. Criar estrutura de pastas
mkdir components/analysis components/analysis/species
mkdir lib/references lib/analysis lib/interpretation
mkdir app/api/reference app/api/analysis/multi-species
```

### FASE 2: Interface (Semana 3-4)

- [ ] Implementar MultiSpeciesTabs
- [ ] Criar formulários adaptáveis
- [ ] Adicionar seleção de subtipos
- [ ] Integrar com upload existente

### FASE 3: Análise (Semana 5-6)

- [ ] Motor de análise por espécie
- [ ] Comparação com referências
- [ ] Geração de diagnósticos
- [ ] Gráficos comparativos

### FASE 4: Interpretação (Semana 7-8)

- [ ] Sistema de analogias
- [ ] Insights acionáveis
- [ ] Múltiplos níveis de detalhe
- [ ] Adaptação por público

### FASE 5: IA Opcional (Semana 9-10)

- [ ] Avaliar modelos apropriados
- [ ] Implementar híbrido regras+IA
- [ ] Validar qualidade
- [ ] Documentar limitações

## 🤖 Estratégia IA Híbrida

```typescript
class HybridAnalysisEngine {
  async analyze(data, options) {
    // Sempre começar com regras
    const ruleResult = await this.ruleEngine.analyze(data)

    // IA apenas se habilitada
    if (options.useAI && this.aiAvailable) {
      try {
        const aiResult = await this.aiEngine.enhance(ruleResult)
        return this.mergeResults(ruleResult, aiResult)
      } catch {
        return ruleResult // Fallback automático
      }
    }

    return ruleResult
  }
}
```

## 🧪 Testes

### Unitários

```typescript
describe('ReferenceService', () => {
  it('should return correct bovine dairy references', async () => {
    const refs = await service.getReferenceData('bovine', 'dairy')
    expect(refs).toContainEqual({
      metric: 'producao_leite',
      idealMinValue: 20,
      idealMaxValue: 30,
    })
  })
})
```

### Integração

- Fluxo completo por espécie
- Performance com múltiplas abas
- Cache de referências
- APIs com dados reais

## 📊 Métricas de Sucesso

**Técnicas**

- Tempo análise < 3s
- Cobertura referências > 80%
- Precisão diagnósticos > 90%

**Negócio**

- Aumento 50% no uso
- Redução 30% dúvidas
- Satisfação > 4.5/5

## 🔐 Segurança

- Validação por espécie
- Controle acesso referências
- Auditoria de mudanças
- Backup dados científicos

## 📝 Clean Code

**SOLID**

- Single Responsibility por serviço
- Open/Closed para novas espécies
- Interface Segregation específica
- Dependency Inversion com abstrações

**Padrões**

- Strategy: Diferentes espécies
- Factory: Criação analisadores
- Observer: Atualizações análise
- Adapter: Integração dados

## ⚡ Comandos Rápidos

```bash
# Desenvolvimento
git checkout -b feature/multi-species
npm install
npx prisma migrate dev
npm run seed:species
npm run dev

# Testes
npm test -- --coverage
npm run test:integration

# Deploy
npm run build
npm run start
```

## 📚 Documentação Adicional

Para implementação detalhada, criar arquivos:

- `MULTI_SPECIES_COMPONENTS.md` - Código dos componentes
- `REFERENCE_DATA_FULL.md` - Todos dados NRC/EMBRAPA
- `INTERPRETATION_RULES.md` - Regras de interpretação
- `API_IMPLEMENTATION.md` - Código das APIs

---

**Timeline**: 10 semanas | **Time**: 1-2 devs | **Metodologia**: Ágil/Sprints semanais
