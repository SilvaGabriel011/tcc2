# Sistema de Análise de Dados - AgroInsight

## 📊 Visão Geral

O AgroInsight agora possui um **sistema robusto e inteligente de análise de dados** que detecta automaticamente tipos de variáveis e aplica análises estatísticas apropriadas.

## 🎯 Funcionalidades Principais

### 1. Detecção Automática de Tipos de Dados

O sistema classifica automaticamente cada coluna do CSV em:

#### **Variáveis Quantitativas**
- **Contínuas**: Valores numéricos com decimais (peso, altura, rendimento)
- **Discretas**: Valores numéricos inteiros/contáveis (número de animais, idade em meses)

#### **Variáveis Qualitativas**
- **Nominais**: Categorias sem ordem (raça, sexo, estado)
- **Ordinais**: Categorias com ordem (escore corporal, classificação)

#### **Outros Tipos**
- **Temporais**: Datas, anos, meses, trimestres
- **Identificadores**: IDs, códigos únicos

### 2. Identificação Zootécnica

O sistema reconhece automaticamente colunas relacionadas à zootecnia através de palavras-chave expandidas:

**Categorias Reconhecidas:**
- Identificação: raça, sexo, idade, era
- Pesos e Medidas: peso, altura, perímetro torácico
- Performance: GPD, GMD, conversão alimentar
- Carcaça: rendimento, AOL, escore corporal, gordura, marbling
- Sanidade: vacinação, vermifugação
- Manejo: sistema de produção, dieta, consumo
- Econômico: valor, preço, custo, arroba
- Temporal: ano, mês, trimestre
- Geográfico: estado, região

## 📈 Análises Estatísticas

### Para Variáveis Numéricas

**Estatísticas Básicas:**
- Contagem (total, válidos, ausentes)
- Média, Mediana, Moda
- Desvio Padrão e Variância
- Valores Mínimo e Máximo
- Amplitude (Range)

**Estatísticas Avançadas:**
- **Quartis**: Q1 (25%), Q2 (50%), Q3 (75%)
- **IQR**: Intervalo Interquartil (Q3 - Q1)
- **CV**: Coeficiente de Variação (%)
- **Assimetria**: Skewness da distribuição
- **Outliers**: Detecção automática via método IQR

### Para Variáveis Categóricas

- Contagem de valores únicos
- Distribuição de frequências (absoluta e relativa %)
- Valor mais comum e menos comum
- Entropia (medida de diversidade)

## 📊 Visualizações Disponíveis

### 1. **BoxPlot (Gráfico de Caixa)**
- Mostra a distribuição de variáveis numéricas
- Exibe quartis, mediana, média e outliers
- Permite comparação visual entre múltiplas variáveis

### 2. **Histograma**
- Distribuição de frequências
- Visualiza a forma da distribuição dos dados
- Identifica normalidade, assimetria e modas

### 3. **Gráfico de Pizza**
- Distribuição de variáveis categóricas
- Mostra proporção de cada categoria
- Agrupa categorias menos frequentes em "Outros"

### 4. **Gráfico de Dispersão (Scatter)**
- Correlação entre duas variáveis numéricas
- Identifica padrões e relacionamentos
- Útil para análises de regressão

### 5. **Tabela Estatística Detalhada**
- Todas as métricas em formato tabular
- Incluindo CV%, quartis e outliers
- Ideal para exportação e relatórios

## 🔧 Curadoria Inteligente de Dados

O sistema aplica **curadoria automática** para garantir análises corretas:

### Decisões Automáticas:

1. **Tipo Numérico vs Categórico**
   - Se >90% dos valores são numéricos → Quantitativa
   - Caso contrário → Qualitativa

2. **Contínuo vs Discreto**
   - Possui decimais → Contínua
   - Poucos valores únicos sem decimais → Discreta

3. **Nominal vs Ordinal**
   - Palavras-chave de ordem (escore, classificação) → Ordinal
   - Caso contrário → Nominal

4. **Identificador**
   - Todos valores únicos → Identificador
   - Contém "ID" ou "código" → Identificador

## 📋 Colunas Suportadas

O sistema está preparado para analisar **qualquer coluna** presente no CSV, incluindo mas não limitado a:

```
ANO, TRIMESTRE, MÊS
ESTADO, REGIÃO
RAÇA, GÊNERO, ERA
IDADE_MESES
PESO_NASCIMENTO_KG, PESO_ATUAL_KG, PESO (KG)
ALTURA_CM
PERIMETRO_TORACICO_CM
ESCORE_CORPORAL
RENDIMENTO_CARCACA_%
VACINACAO, VERMIFUGACAO
CERTIFICACAO_ORGANICA, BRANDING
SISTEMA_PRODUCAO
DIETA_PRINCIPAL, CONSUMO_DIARIO_KG
GMD_GRAMAS_DIA, GMD_MENSAL_KG
CONVERSÃO_ALIMENTAR
VIA, VIA_COMPRA
ORIGEM_VENDEDOR
DOCUMENTACAO, GARANTIA_MESES
VALOR, VALOR_UNITARIO_R$, VALOR_TOTAL_R$
QUANTIDADE_ANIMAIS
TAXA_NEGOCIACAO_%
TRANSPORTE_INCLUIDO, DISTANCIA_TRANSPORTE_KM, CUSTO_TRANSPORTE_R$
CLASSIFICACAO_CARCACA
MARBING_SCORE, ACABAMENTO_GORDURA
PREÇO_MERCADO_LOCAL_R$, DIFERENCIAL_PRECO_%
SAZONALIDADE
PREÇO_POR_KG, TIPO GADO GORDO
ARROBA_GORDO_R$, ARROBA_MAGRO_R$
% ÁGIO
PESO_AJUSTADO_205_DIAS
RENDIMENTO_FINANCEIRO_R$
SCORE_QUALIDADE
CUSTO_TOTAL_R$, CUSTO_POR_KG_R$
```

## 🚀 Como Usar

1. **Faça Upload do CSV**
   - Arraste e solte ou clique para selecionar
   - Primeira linha deve conter nomes das colunas

2. **Aguarde a Análise Automática**
   - Detecção de tipos
   - Cálculo de estatísticas
   - Geração de visualizações

3. **Explore os Resultados**
   - Veja a classificação das variáveis
   - Analise estatísticas descritivas
   - Explore gráficos interativos
   - Exporte para PDF ou Excel

## 📊 Exemplo de Análise

**Entrada**: CSV com colunas "PESO_KG", "RAÇA", "GMD_GRAMAS_DIA"

**Saída Automática**:
- **PESO_KG**: Quantitativa Contínua, Zootécnica
  - Estatísticas: média, mediana, DP, quartis, outliers
  - Gráficos: BoxPlot, Histograma
  
- **RAÇA**: Qualitativa Nominal, Zootécnica
  - Estatísticas: distribuição, frequências, entropia
  - Gráficos: Pizza, Tabela de frequências
  
- **GMD_GRAMAS_DIA**: Quantitativa Contínua, Zootécnica
  - Estatísticas completas
  - Gráficos: BoxPlot, Histograma, Dispersão vs PESO_KG

## 🔍 Vantagens do Sistema

✅ **Flexibilidade**: Aceita qualquer estrutura de dados zootécnicos
✅ **Inteligência**: Detecção automática sem configuração manual
✅ **Completude**: Estatísticas descritivas e inferenciais
✅ **Visualização**: Múltiplos tipos de gráficos apropriados
✅ **Precisão**: Curadoria automática evita análises incorretas
✅ **Escalabilidade**: Lida com datasets grandes e complexos

## 🛠️ Tecnologias

- **TypeScript**: Tipagem forte para confiabilidade
- **Recharts**: Biblioteca de gráficos interativos
- **Papa Parse**: Parser CSV robusto
- **Next.js**: Framework React para performance

## 📝 Notas Importantes

- O sistema salva apenas os primeiros 100 registros para economia de espaço
- Estatísticas são calculadas sobre todos os dados
- Outliers são identificados mas não removidos automaticamente
- Variáveis com >50% de valores ausentes são sinalizadas

---

**Desenvolvido para pesquisas zootécnicas brasileiras** 🇧🇷🐄
