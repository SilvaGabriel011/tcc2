# Arquitetura: Modo Leigo com Resumo de Ações

## 1. Visão Geral do Fluxo de Dados

O novo modo leigo com resumo de ações é construído sobre o pipeline de análise estatística existente. O fluxo completo é:

```
CSV Upload
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  PIPELINE DE ANÁLISE (app/api/analysis/multi-species/route.ts) │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. parseFile() ──► Leitura e validação do CSV                 │
│         │                                                       │
│         ▼                                                       │
│  2. analyzeDataset() ──► Análise estatística completa          │
│         │                 (lib/dataAnalysis.ts)                │
│         │                                                       │
│         ├──► numericStats (média, mediana, CV, quartis, etc.)  │
│         ├──► categoricalStats (distribuição, frequências)      │
│         └──► variablesInfo (tipo, se é zootécnico)             │
│                                                                 │
│  3. ReferenceDataService.compareMultipleMetrics()              │
│         │    (lib/references/species-references.ts)            │
│         │                                                       │
│         └──► Comparação com referências EMBRAPA/NRC            │
│              - status: excellent/good/acceptable/attention     │
│              - overallStatus consolidado                       │
│                                                                 │
│  4. analyzeCorrelations() ──► Análise de correlações           │
│         │    (lib/correlations/correlation-analysis.ts)        │
│         │                                                       │
│         └──► topCorrelations com relevância biológica          │
│              - coeficiente de Pearson                          │
│              - pValue e significância                          │
│              - relevanceScore (1-10)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  Dataset (Banco de Dados) │
              │  ─────────────────────── │
              │  data: {                 │
              │    numericStats,         │
              │    categoricalStats,     │
              │    references,           │
              │    correlations          │
              │  }                       │
              │  metadata: {             │
              │    species, subtype,     │
              │    totalRows, etc.       │
              │  }                       │
              └─────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  GERAÇÃO DE DIAGNÓSTICO (app/api/analise/diagnostico/[id])     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Entrada: numericStats + references + correlations             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  generateAIDiagnostic() (lib/ai-diagnostic.ts)          │   │
│  │  ───────────────────────────────────────────────────────│   │
│  │                                                         │   │
│  │  Tentativa 1: Google Gemini (1.5-pro/flash/pro)        │   │
│  │       │                                                 │   │
│  │       ▼ (se falhar)                                     │   │
│  │  Tentativa 2: OpenAI (gpt-4o-mini)                     │   │
│  │       │                                                 │   │
│  │       ▼ (se falhar)                                     │   │
│  │  Fallback: generateDiagnostico()                       │   │
│  │            (lib/diagnostico-generator.ts)              │   │
│  │            - Regras baseadas em EMBRAPA/NRC            │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Saída: DiagnosticResult                                       │
│  {                                                              │
│    resumoExecutivo,                                            │
│    analiseNumericas[],                                         │
│    pontosFortes[],                                             │
│    pontosAtencao[],                                            │
│    recomendacoesPrioritarias[],  ◄── BASE DO RESUMO DE AÇÕES  │
│    conclusao,                                                  │
│    fontes[]                                                    │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  MODO LEIGO (components/layman/LaymanTab.tsx)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Props atuais:                                                 │
│  - analysisData: Record<string, unknown>                       │
│  - entityType: EntityType                                      │
│                                                                 │
│  Props NOVAS:                                                  │
│  - diagnostic?: DiagnosticResult | null                        │
│  - loadingDiagnostic?: boolean                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Layout Atual (2 colunas):                              │   │
│  │  ┌──────────────────┬──────────────────┐                │   │
│  │  │  AnimalSilhouette │   MetricCards    │                │   │
│  │  │  ou ForagePanel   │   (avaliação de  │                │   │
│  │  │  (SERÁ OCULTO)    │   métricas)      │                │   │
│  │  └──────────────────┴──────────────────┘                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Layout NOVO (2 colunas):                               │   │
│  │  ┌──────────────────┬──────────────────┐                │   │
│  │  │  ActionSummary   │   MetricCards    │                │   │
│  │  │  (resumo de      │   (avaliação de  │                │   │
│  │  │  ações)          │   métricas)      │                │   │
│  │  └──────────────────┴──────────────────┘                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Como a Análise Estatística Alimenta o Diagnóstico

### 2.1 Estatísticas Descritivas (lib/dataAnalysis.ts)

A função `analyzeDataset()` processa cada coluna do CSV e calcula:

**Para variáveis numéricas (NumericStats):**

- `mean` - Média aritmética
- `median` - Mediana (valor central)
- `stdDev` - Desvio padrão (variância amostral com n-1)
- `cv` - Coeficiente de variação (%) - indica uniformidade do lote
- `q1`, `q3`, `iqr` - Quartis e intervalo interquartil
- `min`, `max`, `range` - Valores extremos
- `outliers[]` - Valores atípicos (critério IQR: < Q1-1.5*IQR ou > Q3+1.5*IQR)
- `skewness` - Assimetria da distribuição

**Para variáveis categóricas (CategoricalStats):**

- `distribution` - Contagem por categoria
- `frequencies` - Frequências relativas (%)
- `entropy` - Medida de diversidade
- `mostCommon`, `leastCommon` - Valores mais/menos frequentes

### 2.2 Comparação com Referências EMBRAPA/NRC (lib/references/species-references.ts)

O `ReferenceDataService` compara as médias calculadas com faixas de referência científicas:

```typescript
// Exemplo de validação de métrica
ReferenceDataService.validateMetric(value, species, metric, subtype)
// Retorna:
{
  valid: boolean,
  status: 'excellent' | 'good' | 'acceptable' | 'below_minimum' | 'above_maximum',
  reference: { min, ideal_min, ideal_max, max, unit, source },
  message: string
}
```

**Fontes de referência:**

- `lib/references/embrapa-data.ts` - Dados brasileiros (EMBRAPA)
- `lib/references/nrc-data.ts` - Dados internacionais (NRC)

A EMBRAPA é priorizada para contexto brasileiro, com NRC como complemento.

### 2.3 Análise de Correlações (lib/correlations/correlation-analysis.ts)

O motor de correlações identifica relações biologicamente relevantes:

```typescript
analyzeCorrelations(data, species, options)
// Retorna:
{
  totalCorrelations: number,
  significantCorrelations: number,
  highRelevanceCorrelations: number,
  topCorrelations: [{
    var1, var2,
    coefficient,      // Pearson (-1 a 1)
    pValue,           // Significância estatística
    significant,      // p < 0.05
    relevanceScore,   // 1-10 (relevância biológica)
    category,         // Ex: "Crescimento", "Eficiência"
    interpretation    // Texto explicativo
  }],
  warnings: string[],
  recommendations: string[]
}
```

## 3. Lógica de Geração das Recomendações

### 3.1 Caminho IA (Gemini/OpenAI)

Quando a IA está disponível, o prompt inclui:

1. **Estatísticas descritivas** de todas as variáveis numéricas
2. **Comparações com referências** (status e desvios)
3. **Correlações significativas** (top 5)

A IA é instruída a retornar um JSON estruturado com `recomendacoesPrioritarias`.

### 3.2 Caminho Fallback (lib/diagnostico-generator.ts)

Quando a IA não está disponível, o gerador baseado em regras executa:

```
┌─────────────────────────────────────────────────────────────────┐
│  generateDiagnostico(data)                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. analyzeNumericVariables(statistics, references, species)   │
│     │                                                           │
│     │  Para cada variável conhecida (peso, GPD, conversão...): │
│     │  - Compara média com faixa ideal por espécie             │
│     │  - Define status: Excelente/Bom/Regular/Preocupante      │
│     │                                                           │
│     │  Para variáveis não mapeadas:                            │
│     │  - Usa CV para classificar uniformidade:                 │
│     │    CV < 15% → Excelente (lote uniforme)                  │
│     │    CV < 25% → Bom                                        │
│     │    CV < 35% → Regular                                    │
│     │    CV >= 35% → Preocupante (alta variabilidade)          │
│     │                                                           │
│     ▼                                                           │
│  2. identifyStrengthsAndWeaknesses(analises, correlations)     │
│     │                                                           │
│     │  - Status Excelente/Bom → pontosFortes[]                 │
│     │  - Status Preocupante → pontosAtencao[]                  │
│     │  - Correlações fortes positivas → pontosFortes[]         │
│     │  - Correlações fortes negativas → pontosAtencao[]        │
│     │                                                           │
│     ▼                                                           │
│  3. generateRecommendations(pontosAtencao, species)            │
│     │                                                           │
│     │  Pattern matching nos pontos de atenção:                 │
│     │                                                           │
│     │  "peso" ou "GPD" mencionado:                             │
│     │  → "Otimizar Programa Nutricional" (Alta)                │
│     │                                                           │
│     │  "mortalidade" mencionado:                               │
│     │  → "Revisar Protocolo Sanitário" (Alta)                  │
│     │                                                           │
│     │  "conversão" mencionado:                                 │
│     │  → "Melhorar Eficiência Alimentar" (Média)               │
│     │                                                           │
│     │  + Recomendação específica por espécie:                  │
│     │    bovine → "Implementar Manejo de Pastagens" (Média)    │
│     │    swine → "Otimizar Ambiência" (Média)                  │
│     │    poultry → "Melhorar Programa de Luz" (Baixa)          │
│     │                                                           │
│     │  Máximo: 5 recomendações                                 │
│     │                                                           │
│     ▼                                                           │
│  4. Saída: DiagnosticResult                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Estrutura do ActionSummary

### 4.1 Componente Proposto (components/layman/ActionSummary.tsx)

```typescript
interface ActionSummaryProps {
  diagnostic: DiagnosticResult | null
  loading?: boolean
  onRequestDiagnostic?: () => void
}

// Estrutura de recomendação do diagnóstico:
interface Recomendacao {
  titulo: string // Ex: "Otimizar Programa Nutricional"
  descricao: string // Ex: "Revisar formulação da dieta..."
  prioridade: 'Alta' | 'Média' | 'Baixa'
}
```

### 4.2 Mapeamento Visual de Prioridades

| Prioridade | Cor      | Significado              | Ação            |
| ---------- | -------- | ------------------------ | --------------- |
| Alta       | Vermelho | Ação imediata necessária | Intervir agora  |
| Média      | Amarelo  | Monitorar de perto       | Planejar ação   |
| Baixa      | Verde    | Manutenção               | Continuar assim |

### 4.3 Fluxo de Renderização

```
┌─────────────────────────────────────────────────────────────────┐
│  ActionSummary                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SE loading = true:                                            │
│  └─► Mostrar "Gerando diagnóstico..."                          │
│                                                                 │
│  SE diagnostic = null:                                         │
│  └─► Mostrar "Clique em 'Diagnóstico IA' para ver o resumo"   │
│                                                                 │
│  SE diagnostic existe:                                         │
│  │                                                              │
│  │  ┌────────────────────────────────────────────────────┐     │
│  │  │  Resumo Executivo (simplificado)                   │     │
│  │  │  "De forma geral, o lote está indo bem, mas há     │     │
│  │  │   X pontos que exigem atenção imediata."           │     │
│  │  └────────────────────────────────────────────────────┘     │
│  │                                                              │
│  │  ┌────────────────────────────────────────────────────┐     │
│  │  │  O Que Fazer Agora                                 │     │
│  │  │  ──────────────────                                │     │
│  │  │                                                    │     │
│  │  │  🔴 [Alta] Otimizar Programa Nutricional          │     │
│  │  │     Revisar formulação da dieta com nutricionista │     │
│  │  │                                                    │     │
│  │  │  🟡 [Média] Implementar Manejo de Pastagens       │     │
│  │  │     Dividir piquetes para rotação                 │     │
│  │  │                                                    │     │
│  │  │  🟢 [Baixa] Estabelecer Protocolo de Monitoramento│     │
│  │  │     Realizar avaliações periódicas                │     │
│  │  └────────────────────────────────────────────────────┘     │
│  │                                                              │
│  │  ┌────────────────────────────────────────────────────┐     │
│  │  │  Fontes: NRC (2021), EMBRAPA (2023)               │     │
│  │  └────────────────────────────────────────────────────┘     │
│  │                                                              │
│  └──────────────────────────────────────────────────────────────│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Alterações Necessárias

### 5.1 LaymanTab.tsx

```typescript
// ANTES
interface LaymanTabProps {
  analysisData: Record<string, unknown>
  entityType: EntityType
}

// DEPOIS
interface LaymanTabProps {
  analysisData: Record<string, unknown>
  entityType: EntityType
  diagnostic?: DiagnosticResult | null // NOVO
  loadingDiagnostic?: boolean // NOVO
  onRequestDiagnostic?: () => void // NOVO (opcional)
}

// Constante para controlar exibição de imagens
const SHOW_IMAGES = false // Oculta silhuetas sem excluir código
```

### 5.2 resultados/page.tsx

```typescript
// Passar diagnóstico para LaymanTab
<LaymanTab
  analysisData={analysisData as Record<string, unknown>}
  entityType="gado"
  diagnostic={diagnostico}              // NOVO
  loadingDiagnostic={loadingDiagnostico} // NOVO
/>
```

### 5.3 Novos Arquivos

- `components/layman/ActionSummary.tsx` - Componente de resumo de ações

## 6. Garantias de Qualidade

### 6.1 Rastreabilidade

O resumo de ações é 100% rastreável até a análise estatística original:

1. **Estatísticas** → calculadas por `analyzeDataset()` com fórmulas padrão
2. **Referências** → comparadas via `ReferenceDataService` com dados EMBRAPA/NRC
3. **Correlações** → calculadas via Pearson com teste de significância
4. **Diagnóstico** → gerado por IA ou regras baseadas nos dados acima
5. **Resumo de Ações** → extração direta de `recomendacoesPrioritarias`

### 6.2 Fontes Científicas

Todas as recomendações são baseadas em:

- NRC - National Research Council (2021)
- EMBRAPA - Empresa Brasileira de Pesquisa Agropecuária (2023)
- Tabelas Brasileiras para Aves e Suínos (2017)
- Manual de Bovinocultura de Corte - EMBRAPA (2022)

### 6.3 Fallback Garantido

Mesmo sem acesso à IA, o sistema gera recomendações válidas usando:

- Faixas de referência codificadas por espécie
- Regras de interpretação baseadas em literatura zootécnica
- Análise de coeficiente de variação para uniformidade de lote

## 7. Resumo das Mudanças

| Componente              | Mudança                                           | Impacto                     |
| ----------------------- | ------------------------------------------------- | --------------------------- |
| `LaymanTab.tsx`         | Adicionar `SHOW_IMAGES = false`                   | Oculta silhuetas            |
| `LaymanTab.tsx`         | Adicionar props `diagnostic`, `loadingDiagnostic` | Recebe dados do diagnóstico |
| `ActionSummary.tsx`     | Novo componente                                   | Exibe resumo de ações       |
| `resultados/page.tsx`   | Passar `diagnostico` para `LaymanTab`             | Integração de dados         |
| `AnimalSilhouettes.tsx` | Nenhuma                                           | Mantido para uso futuro     |
| `ForagePanel.tsx`       | Nenhuma                                           | Mantido para uso futuro     |
