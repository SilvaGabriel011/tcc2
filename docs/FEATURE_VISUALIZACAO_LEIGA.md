# Feature: Visualização Leiga

## Visão Geral

A **Visualização Leiga** é uma **ABA** dentro do sistema de análise de dados que traduz métricas técnicas em visualizações intuitivas e acessíveis para usuários sem conhecimento técnico, incluindo analfabetos funcionais.

## Objetivos

- ✅ Traduzir dados técnicos em visualizações universais
- ✅ Usar código de cores intuitivo (Verde/Amarelo/Vermelho)
- ✅ Fornecer textos simples e claros
- ✅ Mostrar silhuetas e imagens anotadas
- ✅ Permitir alternância entre modo leigo e técnico

## Localização no App

```
Dashboard → Análise → Resultados → **ABA "Visualização Leiga"**
```

Esta é uma **FEATURE ADICIONAL**, não um app separado.

## Arquitetura

### 1. Estrutura de Arquivos

```
lib/layman/
├── types.ts              # Tipos TypeScript baseados em schemas pre.dev
├── colors.ts             # Sistema de cores universal
└── evaluate.ts           # Lógica de avaliação (futuro)

services/
└── layman.service.ts     # Service para chamadas API

components/layman/
├── LaymanTab.tsx         # Componente principal da aba
├── LaymanToggle.tsx      # Toggle leigo/técnico
├── ColorLegend.tsx       # Legenda de cores
├── CattleSilhouette.tsx  # Silhueta do gado
├── ForagePanel.tsx       # Painel da forragem
├── MetricCard.tsx        # Card de métrica individual
└── index.ts              # Barrel exports

app/api/layman/
├── evaluate/
│   └── route.ts          # POST /api/layman/evaluate
├── annotations/
│   └── [entityId]/
│       └── route.ts      # GET /api/layman/annotations/{entityId}
└── thresholds/
    └── route.ts          # GET/PUT /api/layman/thresholds
```

### 2. Sistema de Cores Universal

```typescript
Verde (#10B981)   = Ótimo     = Sem ação necessária     ✓
Amarelo (#F59E0B) = Ok        = Monitorar               ⚠
Vermelho (#EF4444)= Ruim      = Ação necessária         ✗
```

### 3. Tipos de Entidade

#### Gado (cattle)
- **Métricas**: peso_kg, meta_peso_kg, gmd_7d, gmd_30d, bcs
- **Visualização**: Silhueta bovina colorida
- **Texto**: "Gado engordando bem" / "Precisa atenção"

#### Forragem (forage)
- **Métricas**: biomassa_kg_ha, cobertura_pct, indice_visual
- **Visualização**: Foto com overlay colorido
- **Texto**: "Pastagem ótima" / "Precisa recuperação"

### 4. Fluxo de Dados

```
Análise CSV → Service → POST /api/layman/evaluate → Avaliação
                                                        ↓
                                        Categorização por Thresholds
                                                        ↓
                                        Cor Final + Label
                                                        ↓
                                        LaymanTab Component
                                                        ↓
                                        Visualização (Silhueta/Foto + Cards)
```

### 5. Schemas (pre.dev)

#### EvaluationRequest
```typescript
{
  entity_id: string
  farm_id: string
  entity_type: 'gado' | 'forragem'
  photo_url?: string
  metric_values: {
    peso_kg?: number
    meta_peso_kg?: number
    gmd_7d_kg_per_day?: number
    gmd_30d_kg_per_day?: number
    bcs?: number
    biomassa_kg_ha?: number
    cobertura_pct?: number
    indice_visual?: number
  }
}
```

#### EvaluationResponse
```typescript
{
  entity_id: string
  final_color: 'red' | 'yellow' | 'green'
  short_label: 'ruim' | 'ok' | 'ótimo'
  annotation: {
    mode: 'image_url' | 'composition_metadata'
    image_url?: string
    composition_metadata?: object
  }
  metric_summaries: Array<{
    metric_key: string
    value: number
    category: 'excellent' | 'ok' | 'ruim'
    display_label: string
  }>
  thresholds_version: string
}
```

### 6. Thresholds Configuráveis

Cada fazenda pode configurar seus próprios thresholds:

```typescript
{
  metric_key: 'peso_vs_meta_pct',
  ranges: {
    excellent: { min: 1.00, max: 10.0 },
    ok: { min: 0.95, max: 0.999 },
    ruim: { min: 0.0, max: 0.949 }
  },
  weight: 50,  // Peso na priorização
  active: true
}
```

### 7. Regra de Priorização

**A métrica com pior categoria define a cor final:**
- Se qualquer métrica está em "ruim" → Vermelho
- Se todas estão em "ok" ou "excellent" mas pelo menos uma em "ok" → Amarelo
- Se todas estão em "excellent" → Verde

## Integração com Análise Existente

### No componente `ResultadosPage`

```tsx
import { LaymanTab } from '@/components/layman'

// Dentro do componente
<Tabs defaultValue="analysis">
  <TabsList>
    <TabsTrigger value="analysis">Análise Técnica</TabsTrigger>
    <TabsTrigger value="layman">Visualização Leiga</TabsTrigger>
  </TabsList>
  
  <TabsContent value="analysis">
    {/* Análise técnica existente */}
  </TabsContent>
  
  <TabsContent value="layman">
    <LaymanTab 
      analysisData={analysisData}
      entityType="gado"
    />
  </TabsContent>
</Tabs>
```

## Endpoints API

### POST /api/layman/evaluate
Avalia métricas e retorna categorização com cor final

### GET /api/layman/annotations/{entityId}?view=layman|technical
Retorna anotação em modo leigo ou técnico

### GET /api/layman/thresholds?farmId={farmId}
Retorna thresholds configurados para uma fazenda

### PUT /api/layman/thresholds?farmId={farmId}
Atualiza thresholds de uma fazenda

### GET /api/layman/thresholds/history?farmId={farmId}
Retorna histórico de mudanças nos thresholds

## Componentes Principais

### LaymanTab
- Componente principal da aba
- Gerencia estado de visualização (leigo/técnico)
- Faz chamadas API e renderiza resultados

### LaymanToggle
- Botão toggle entre modos leigo e técnico
- Persiste preferência do usuário

### CattleSilhouette
- Renderiza silhueta bovina com cor
- Mostra label de status
- Exibe imagem anotada se disponível

### ForagePanel
- Renderiza foto da pastagem com overlay
- Mostra indicador visual de saúde
- Gradiente colorido baseado em status

### MetricCard
- Card individual para cada métrica
- Mostra valor, unidade e categoria
- Texto simplificado em modo leigo
- Detalhes técnicos em modo técnico

### ColorLegend
- Legenda explicativa das cores
- Verde/Amarelo/Vermelho com significados

## Acessibilidade

- ✅ Cores com contraste adequado
- ✅ Ícones universais (✓ ⚠ ✗)
- ✅ Textos simples e diretos
- ✅ Suporte a modo escuro
- ✅ Navegação por teclado (ARIA)

## Próximos Passos

1. **Banco de Dados**
   - Criar tabelas para thresholds
   - Criar tabelas para histórico
   - Criar tabelas para anotações

2. **Processamento de Imagem**
   - Integrar com Sharp/Canvas para anotações
   - Upload para Supabase Storage
   - Geração de imagens anotadas

3. **Cache**
   - Implementar cache com Upstash Redis
   - Cache de anotações
   - Cache de thresholds

4. **Fila de Processamento**
   - Queue de renderização de imagens
   - Background jobs com Upstash

5. **Autenticação e Autorização**
   - RLS (Row Level Security) no Supabase
   - Scope por fazenda
   - Permissões de gerente vs operador

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL (Supabase)
- **Cache**: Upstash Redis
- **Storage**: Supabase Storage
- **Processamento**: Sharp (futuro)
- **Autenticação**: NextAuth.js

## Exemplos de Uso

### Para Gado
```typescript
const evaluation = await laymanService.evaluateMetrics({
  entity_id: 'animal_123',
  farm_id: 'farm_456',
  entity_type: 'gado',
  metric_values: {
    peso_kg: 385,
    meta_peso_kg: 420,
    gmd_7d_kg_per_day: 0.45,
    bcs: 3.0
  }
})

// Resultado: Vermelho (peso abaixo da meta)
```

### Para Forragem
```typescript
const evaluation = await laymanService.evaluateMetrics({
  entity_id: 'pasture_789',
  farm_id: 'farm_456',
  entity_type: 'forragem',
  metric_values: {
    biomassa_kg_ha: 2800,
    cobertura_pct: 85,
    indice_visual: 75
  }
})

// Resultado: Verde (todos os indicadores ótimos)
```

## Referências

- [AgroVisual MVP Document](./AgroVisual-mvp%20(1).md)
- [Pre.dev Specifications](./pre.dev-spec.md)
- [API Reference](./API_REFERENCE.md)
