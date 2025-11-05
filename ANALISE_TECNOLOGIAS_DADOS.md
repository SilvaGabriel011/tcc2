# Análise de Tecnologias de Análise de Dados para AgroInsight

**Data:** 05 de Novembro de 2025  
**Objetivo:** Identificar novas tecnologias e metodologias de análise de dados que podem melhorar a interpretação dos inputs do usuário no AgroInsight

---

## 1. ANÁLISE DO ESTADO ATUAL

### 1.1 Dados Coletados Atualmente

O AgroInsight coleta os seguintes tipos de dados por espécie:

#### Bovinos (Leite e Corte)
- **Produção:** peso_nascimento, peso_desmame, producao_leite, proteina_leite, gordura_leite
- **Performance:** gpd (ganho de peso diário), conversao_alimentar, rendimento_carcaca
- **Qualidade:** celulas_somaticas, escore_corporal, area_olho_lombo, espessura_gordura, marmoreiro
- **Reprodução:** dias_lactacao, intervalo_partos

#### Suínos (Creche, Crescimento, Terminação, Reprodução)
- **Peso:** peso_desmame, peso_saida_creche, peso_inicial, peso_final, peso_abate
- **Performance:** gpd_creche, gpd, conversao_creche, conversao
- **Qualidade:** espessura_toucinho, carne_magra, profundidade_lombo
- **Reprodução:** leitoes_nascidos_vivos, leitoes_desmamados, peso_medio_nascimento, intervalo_desmame_cio, taxa_concepcao, partos_porca_ano
- **Sanidade:** mortalidade_creche

#### Aves (Frango de Corte e Poedeiras)
- **Peso:** peso_7d, peso_21d, peso_35d, peso_42d
- **Performance:** gpd_total, conversao_alimentar, iep (Índice de Eficiência Produtiva)
- **Qualidade:** rendimento_carcaca, rendimento_peito
- **Produção (Poedeiras):** idade_inicio_postura, pico_postura, producao_ovos, peso_ovo, conversao_duzia, massa_ovos
- **Sanidade:** mortalidade

#### Ovinos e Caprinos
- **Peso:** peso_nascimento, peso_desmame, peso_abate
- **Performance:** gpd_cria, rendimento_carcaca
- **Produção (Caprinos):** producao_leite, gordura_leite, proteina_leite
- **Reprodução:** prolificidade, intervalo_partos, mortalidade_cria, escore_corporal

#### Piscicultura (Tilápia, Tambaqui, Pintado, Pacu)
- **Densidade:** densidade_estocagem_intensivo, densidade_estocagem_semi
- **Performance:** conversao_alimentar, gpd, peso_abate, sobrevivencia
- **Qualidade da Água:** oxigenio_dissolvido, temperatura, ph, amonia_total

#### Forragem (Brachiaria, Panicum, Leguminosas)
- **Biomassa:** biomassa_seca_aguas, biomassa_seca_seca
- **Qualidade Nutricional:** proteina_bruta, fdn (fibra em detergente neutro), fda (fibra em detergente ácido), digestibilidade
- **Manejo:** altura_pastejo_entrada, altura_pastejo_saida, altura_entrada, altura_saida
- **Capacidade:** taxa_lotacao_aguas, taxa_lotacao_seca
- **Leguminosas:** fixacao_n, tanino

### 1.2 Métodos de Análise Atuais

#### Estatísticas Descritivas
- **Medidas de Tendência Central:** média, mediana, moda
- **Medidas de Dispersão:** desvio padrão, variância, amplitude, IQR
- **Medidas de Variabilidade:** coeficiente de variação (CV%)
- **Distribuição:** quartis (Q1, Q3), assimetria (skewness)
- **Outliers:** detecção via método IQR (1.5 × IQR)

#### Validação e Comparação
- **Comparação com Referências:** NRC (National Research Council) e EMBRAPA
- **Validação de Ranges:** min, ideal_min, ideal_max, max
- **Status de Métricas:** excellent, good, acceptable, attention, no_reference
- **Interpretação Simplificada:** sistema de cores (verde/amarelo/vermelho) para leigos

#### Detecção de Variáveis
- **Classificação de Tipos:** quantitativa contínua/discreta, qualitativa nominal/ordinal, temporal, identificador
- **Identificação Zootécnica:** baseada em palavras-chave (peso, gpd, conversão, etc.)
- **Detecção de Unidades:** inferência automática de unidades (kg, %, kg/dia, etc.)

### 1.3 Limitações Identificadas

1. **Análise Temporal Ausente:** não há análise de séries temporais ou tendências ao longo do tempo
2. **Falta de Contexto Ambiental:** não considera temperatura, umidade, estação do ano
3. **Análise Univariada:** cada métrica é analisada isoladamente, sem correlações
4. **Benchmarking Limitado:** apenas comparação com referências fixas, sem percentis de pares
5. **Validação Básica:** apenas ranges simples, sem testes estatísticos de significância
6. **Ausência de Predição:** não há modelos preditivos ou forecasting
7. **Detecção de Anomalias Simples:** apenas outliers via IQR, sem métodos mais sofisticados
8. **Falta de Normalização por Estágio:** não ajusta métricas por idade, peso ou fase produtiva
9. **Dois Pipelines de Análise:** `calculateBasicStatistics` (multi-species route) vs `analyzeDataset` (AnalysisService)
10. **Gaps de Referência:** alguns subtipos (ex: bovine.dual) não têm dados de referência

---

## 2. TECNOLOGIAS E METODOLOGIAS RECOMENDADAS

### 2.1 Análise Estatística Avançada

#### 2.1.1 Modelos Lineares Generalizados Mistos (GLMM)
**Propósito:** Analisar efeitos de tratamento considerando efeitos aleatórios de fazenda/lote

**Bibliotecas:**
- Python: `statsmodels`, `pymer4`, `lme4` (via rpy2)
- R: `lme4`, `nlme`

**Aplicações:**
- Comparar performance entre diferentes manejos considerando variabilidade entre fazendas
- Identificar efeitos de raça, dieta, sistema produtivo controlando por lote
- Análise de dados de mortalidade (Poisson/Binomial Negativo)

**Exemplo de Uso:**
```python
# Modelo para GPD considerando fazenda como efeito aleatório
import statsmodels.api as sm
from statsmodels.regression.mixed_linear_model import MixedLM

model = MixedLM.from_formula(
    "gpd ~ dieta + raca + idade",
    data=df,
    groups=df["fazenda_id"]
)
result = model.fit()
```

#### 2.1.2 Modelos Aditivos Generalizados (GAM)
**Propósito:** Capturar relações não-lineares entre variáveis (ex: temperatura vs performance)

**Bibliotecas:**
- Python: `pygam`, `statsmodels`
- R: `mgcv`

**Aplicações:**
- Relação entre temperatura e produção de leite (curva não-linear)
- Efeito da idade sobre peso (curvas de crescimento)
- Impacto da densidade de estocagem sobre conversão alimentar

#### 2.1.3 Regressão Quantílica
**Propósito:** Benchmarking robusto usando percentis em vez de médias

**Bibliotecas:**
- Python: `statsmodels.regression.quantile_regression`
- R: `quantreg`

**Aplicações:**
- Estabelecer metas de performance (P75, P90) em vez de apenas médias
- Identificar produtores top performers (P90+)
- Análise robusta menos sensível a outliers

**Exemplo:**
```python
import statsmodels.formula.api as smf

# Regressão no percentil 75
model = smf.quantreg('gpd ~ idade + peso_inicial', data=df)
result = model.fit(q=0.75)
```

#### 2.1.4 Intervalos de Confiança e Testes de Hipótese
**Propósito:** Determinar significância estatística das diferenças observadas

**Implementação:**
- Calcular IC 95% para médias usando bootstrap ou t-distribution
- Testes t para comparar com valores de referência
- Correção de Bonferroni para múltiplas comparações

**Exemplo:**
```python
from scipy import stats
import numpy as np

# IC 95% para média
mean = np.mean(data)
sem = stats.sem(data)
ci = stats.t.interval(0.95, len(data)-1, loc=mean, scale=sem)

# Teste t vs referência
t_stat, p_value = stats.ttest_1samp(data, reference_value)
```

### 2.2 Análise de Séries Temporais e Controle Estatístico de Processo (SPC)

#### 2.2.1 Gráficos de Controle (Control Charts)
**Propósito:** Detectar desvios e tendências precocemente

**Tipos de Gráficos:**
- **EWMA (Exponentially Weighted Moving Average):** detecta pequenos desvios persistentes
- **CUSUM (Cumulative Sum):** identifica mudanças graduais no processo
- **Shewhart:** detecta grandes desvios pontuais

**Bibliotecas:**
- Python: `scipy.stats`, implementação customizada
- R: `qcc`, `spc`

**Aplicações:**
- Monitorar mortalidade diária em aviários
- Acompanhar conversão alimentar semanal em suinocultura
- Detectar queda gradual na produção de leite

**Exemplo EWMA:**
```python
import numpy as np

def ewma_control_chart(data, lambda_=0.2, L=3):
    """
    EWMA control chart
    lambda_: peso (0.2 típico para detectar pequenos desvios)
    L: limites de controle (3 sigma típico)
    """
    mean = np.mean(data)
    std = np.std(data)
    
    ewma = [data[0]]
    for i in range(1, len(data)):
        ewma.append(lambda_ * data[i] + (1 - lambda_) * ewma[-1])
    
    sigma_ewma = std * np.sqrt(lambda_ / (2 - lambda_))
    ucl = mean + L * sigma_ewma
    lcl = mean - L * sigma_ewma
    
    return ewma, ucl, lcl
```

#### 2.2.2 Forecasting e Predição
**Propósito:** Prever performance futura e antecipar problemas

**Modelos:**
- **Prophet (Facebook):** fácil de usar, lida bem com sazonalidade e feriados
- **ARIMA/SARIMA:** modelos clássicos para séries temporais
- **Exponential Smoothing:** simples e efetivo para tendências
- **LSTM/GRU:** redes neurais para padrões complexos

**Bibliotecas:**
- Python: `prophet`, `statsmodels`, `darts`, `tensorflow`

**Aplicações:**
- Prever peso ao abate baseado em crescimento atual
- Estimar produção de leite futura baseada em curva de lactação
- Projetar mortalidade acumulada em lotes de frangos

**Exemplo com Prophet:**
```python
from prophet import Prophet

# Preparar dados
df = pd.DataFrame({
    'ds': dates,  # datas
    'y': weights  # pesos
})

# Treinar modelo
model = Prophet(yearly_seasonality=True)
model.fit(df)

# Prever próximos 30 dias
future = model.make_future_dataframe(periods=30)
forecast = model.predict(future)
```

### 2.3 Detecção de Anomalias Avançada

#### 2.3.1 Isolation Forest
**Propósito:** Detectar anomalias multivariadas sem assumir distribuição normal

**Biblioteca:** `scikit-learn`

**Aplicações:**
- Identificar animais com padrão anormal de crescimento
- Detectar lotes com múltiplas métricas fora do padrão
- Encontrar registros com combinações improváveis de valores

**Exemplo:**
```python
from sklearn.ensemble import IsolationForest

# Treinar modelo
clf = IsolationForest(contamination=0.05, random_state=42)
predictions = clf.fit_predict(X)

# -1 = anomalia, 1 = normal
anomalies = X[predictions == -1]
```

#### 2.3.2 Local Outlier Factor (LOF)
**Propósito:** Detectar outliers baseado na densidade local

**Biblioteca:** `scikit-learn`

**Aplicações:**
- Identificar animais com performance muito diferente de seus pares
- Detectar fazendas com padrão atípico de produção

#### 2.3.3 Decomposição STL para Séries Temporais
**Propósito:** Separar tendência, sazonalidade e resíduos para detectar anomalias

**Biblioteca:** `statsmodels`

**Aplicações:**
- Detectar anomalias em produção de leite removendo sazonalidade
- Identificar desvios em mortalidade considerando padrões sazonais

**Exemplo:**
```python
from statsmodels.tsa.seasonal import STL

# Decomposição
stl = STL(timeseries, seasonal=13)
result = stl.fit()

# Anomalias nos resíduos
residuals = result.resid
threshold = 3 * np.std(residuals)
anomalies = np.abs(residuals) > threshold
```

### 2.4 Modelos de Crescimento e Produção

#### 2.4.1 Curvas de Crescimento
**Modelos:**
- **Gompertz:** crescimento sigmoidal, comum em aves e suínos
- **Brody:** crescimento assintótico, usado em bovinos
- **von Bertalanffy:** crescimento com maturidade assintótica
- **Logístico:** crescimento em S

**Aplicações:**
- Ajustar curva de crescimento individual e identificar desvios
- Prever peso futuro baseado em trajetória atual
- Comparar taxa de crescimento com curva padrão da raça

**Exemplo Gompertz:**
```python
from scipy.optimize import curve_fit

def gompertz(t, A, b, k):
    """
    A: peso assintótico
    b: deslocamento
    k: taxa de crescimento
    """
    return A * np.exp(-b * np.exp(-k * t))

# Ajustar curva
params, _ = curve_fit(gompertz, ages, weights)
predicted_weights = gompertz(ages, *params)
```

#### 2.4.2 Curvas de Lactação (Wood's Model)
**Propósito:** Modelar produção de leite ao longo da lactação

**Modelo:** `y = a * t^b * e^(-c*t)`
- a: produção inicial
- b: taxa de aumento até o pico
- c: taxa de declínio pós-pico

**Aplicações:**
- Identificar vacas com curva de lactação atípica
- Prever produção total da lactação
- Detectar problemas de manejo ou saúde

### 2.5 Análise de Sobrevivência

#### 2.5.1 Kaplan-Meier e Curvas de Sobrevivência
**Propósito:** Analisar mortalidade e tempo até eventos

**Bibliotecas:**
- Python: `lifelines`
- R: `survival`

**Aplicações:**
- Curvas de sobrevivência por lote/tratamento
- Tempo médio até descarte em poedeiras
- Análise de risco de mortalidade por fase

**Exemplo:**
```python
from lifelines import KaplanMeierFitter

kmf = KaplanMeierFitter()
kmf.fit(durations=time_to_event, event_observed=died)
kmf.plot_survival_function()
```

#### 2.5.2 Modelo de Cox (Proportional Hazards)
**Propósito:** Identificar fatores de risco para mortalidade

**Aplicações:**
- Avaliar impacto de dieta, densidade, temperatura sobre mortalidade
- Identificar períodos críticos de maior risco

### 2.6 Machine Learning para Diagnóstico e Predição

#### 2.6.1 Árvores de Decisão e Random Forest
**Propósito:** Identificar regras de decisão e importância de variáveis

**Bibliotecas:**
- Python: `scikit-learn`, `xgboost`, `lightgbm`

**Aplicações:**
- Classificar performance (excelente/bom/ruim) baseado em múltiplas métricas
- Identificar variáveis mais importantes para performance
- Gerar regras interpretáveis para diagnóstico

#### 2.6.2 XGBoost/LightGBM com SHAP
**Propósito:** Modelos preditivos com explicabilidade

**Bibliotecas:**
- Python: `xgboost`, `lightgbm`, `shap`

**Aplicações:**
- Prever conversão alimentar final baseado em dados iniciais
- Identificar fatores que mais contribuem para boa/má performance
- Gerar explicações para cada predição (reason codes)

**Exemplo com SHAP:**
```python
import xgboost as xgb
import shap

# Treinar modelo
model = xgb.XGBRegressor()
model.fit(X_train, y_train)

# Explicar predições
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Visualizar importância
shap.summary_plot(shap_values, X_test)
```

### 2.7 Integração de Dados Ambientais e Contextuais

#### 2.7.1 Índice de Temperatura e Umidade (THI)
**Propósito:** Avaliar estresse térmico em bovinos e aves

**Fórmula:** `THI = (1.8 × T + 32) - [(0.55 - 0.0055 × RH) × (1.8 × T - 26)]`
- T: temperatura (°C)
- RH: umidade relativa (%)

**Aplicações:**
- Correlacionar THI com produção de leite
- Ajustar benchmarks por condição climática
- Alertas de estresse térmico

#### 2.7.2 APIs de Clima e Sensoriamento Remoto
**Fontes de Dados:**
- **OpenWeatherMap:** dados climáticos históricos e atuais
- **NASA POWER:** dados agroclimáticos
- **Sentinel/Landsat:** NDVI, EVI para qualidade de pastagem
- **INMET (Brasil):** dados meteorológicos oficiais

**Aplicações:**
- Ajustar referências por região e estação
- Correlacionar NDVI com biomassa de forragem
- Normalizar performance por condições climáticas

#### 2.7.3 Qualidade da Água (Piscicultura)
**Métricas Compostas:**
- **Índice de Qualidade da Água (IQA)**
- **Índice de Estado Trófico (IET)**

**Aplicações:**
- Score único de qualidade da água
- Alertas de condições críticas
- Correlação com mortalidade e crescimento

### 2.8 Benchmarking e Análise de Pares

#### 2.8.1 Percentis e Z-Scores
**Propósito:** Comparar com pares em vez de apenas referências absolutas

**Implementação:**
- Armazenar dados anonimizados agregados por espécie/subtipo/região/estação
- Calcular percentis (P25, P50, P75, P90)
- Mostrar posição relativa (z-score, percentil)

**Exemplo:**
```python
from scipy import stats

# Calcular z-score
z_score = (value - peer_mean) / peer_std

# Calcular percentil
percentile = stats.percentileofscore(peer_data, value)
```

#### 2.8.2 Estratificação de Cohorts
**Critérios de Estratificação:**
- Região geográfica (estado, clima)
- Estação do ano
- Raça/linhagem genética
- Sistema produtivo (intensivo, semi-intensivo, extensivo)
- Faixa de idade/peso/DIM

**Aplicações:**
- Comparações mais justas (apples-to-apples)
- Identificar best practices regionais
- Ajustar metas por contexto

### 2.9 Índices Compostos e KPIs Econômicos

#### 2.9.1 Índices Zootécnicos Compostos
**Existente:**
- IEP (Índice de Eficiência Produtiva) para frangos

**Novos Índices Sugeridos:**
- **Índice de Eficiência Reprodutiva (IER):** para matrizes suínas e bovinos
- **Índice de Qualidade de Carcaça (IQC):** para bovinos e suínos
- **Índice de Sustentabilidade Produtiva (ISP):** combinando performance e impacto ambiental

#### 2.9.2 Indicadores Econômicos
**Métricas:**
- **IOFC (Income Over Feed Cost):** receita menos custo de alimentação
- **Margem sobre Alimentação:** lucro por animal considerando ração
- **Custo por kg de ganho:** eficiência econômica
- **ROI de Intervenções:** retorno de investimento em melhorias

**Aplicações:**
- Priorizar recomendações por impacto econômico
- Calcular viabilidade de mudanças de manejo
- Comparar sistemas produtivos economicamente

---

## 3. DADOS ADICIONAIS A COLETAR

### 3.1 Dados Temporais (CRÍTICO)

#### 3.1.1 Timestamps e Idades
**Campos Necessários:**
- `measurement_date`: data da medição (formato ISO 8601)
- `age_days`: idade em dias no momento da medição
- `dim`: dias em lactação (para vacas leiteiras)
- `batch_id`: identificador do lote/ciclo produtivo
- `cycle_id`: identificador do ciclo (para múltiplos ciclos)

**Justificativa:**
- Habilita análise de séries temporais
- Permite normalização por idade/estágio
- Essencial para SPC e forecasting

#### 3.1.2 Datas de Eventos
**Eventos Importantes:**
- Data de nascimento
- Data de desmame
- Data de entrada no lote
- Data de vacinação/vermifugação
- Data de mudança de dieta
- Data de eventos sanitários

### 3.2 Dados Ambientais

#### 3.2.1 Clima e Ambiente (Bovinos, Suínos, Aves)
**Campos:**
- `temperature_avg`: temperatura média (°C)
- `temperature_min`: temperatura mínima (°C)
- `temperature_max`: temperatura máxima (°C)
- `humidity_avg`: umidade relativa média (%)
- `thi`: índice de temperatura e umidade (calculado ou medido)
- `rainfall_mm`: precipitação (mm)
- `wind_speed`: velocidade do vento (m/s)

**Instalações (Confinado):**
- `ventilation_rate`: taxa de ventilação (m³/h)
- `ammonia_ppm`: concentração de amônia (ppm)
- `co2_ppm`: concentração de CO₂ (ppm)
- `light_hours`: horas de luz por dia
- `litter_moisture`: umidade da cama (%)

#### 3.2.2 Qualidade da Água (Piscicultura) - EXPANDIDO
**Parâmetros Físico-Químicos:**
- `dissolved_oxygen`: oxigênio dissolvido (mg/L) - JÁ EXISTE
- `temperature`: temperatura (°C) - JÁ EXISTE
- `ph`: pH - JÁ EXISTE
- `ammonia_total`: amônia total (mg/L) - JÁ EXISTE
- `ammonia_ionized`: amônia ionizada (mg/L) - NOVO
- `nitrite`: nitrito (mg/L) - NOVO
- `nitrate`: nitrato (mg/L) - NOVO
- `alkalinity`: alcalinidade (mg/L CaCO₃) - NOVO
- `hardness`: dureza (mg/L CaCO₃) - NOVO
- `turbidity`: turbidez (NTU) - NOVO
- `transparency_cm`: transparência (cm - disco de Secchi) - NOVO

**Medições Temporais:**
- Horário da medição (manhã/tarde/noite)
- Frequência de medição

#### 3.2.3 Forragem e Pastagem
**Condições de Pastagem:**
- `sward_height_cm`: altura do dossel forrageiro (cm)
- `biomass_kg_ha`: biomassa disponível (kg/ha)
- `botanical_composition`: composição botânica (% gramíneas, leguminosas, invasoras)
- `soil_moisture`: umidade do solo (%)
- `ndvi`: índice de vegetação (via satélite)
- `evi`: índice de vegetação melhorado

**Manejo:**
- `grazing_days`: dias de pastejo
- `rest_days`: dias de descanso
- `stocking_rate`: taxa de lotação (UA/ha)
- `fertilization_date`: data de adubação
- `fertilization_type`: tipo de adubo aplicado

### 3.3 Dados Nutricionais

#### 3.3.1 Composição da Dieta
**Campos:**
- `diet_id`: identificador da dieta/ração
- `diet_name`: nome da dieta
- `crude_protein_pct`: proteína bruta (%)
- `ndf_pct`: fibra em detergente neutro (%)
- `adf_pct`: fibra em detergente ácido (%)
- `energy_mcal_kg`: energia metabolizável (Mcal/kg)
- `dry_matter_pct`: matéria seca (%)
- `cost_per_kg`: custo por kg de ração (R$/kg)

#### 3.3.2 Consumo
**Campos:**
- `feed_intake_kg`: consumo de ração (kg/animal/dia)
- `water_intake_l`: consumo de água (L/animal/dia)
- `feed_refusal_kg`: sobras de ração (kg)
- `feeding_frequency`: frequência de alimentação (vezes/dia)

### 3.4 Dados Genéticos e de Identificação

#### 3.4.1 Genética
**Campos:**
- `breed`: raça
- `genetic_line`: linhagem genética
- `strain`: strain (para aves)
- `crossbreed`: cruzamento (se aplicável)
- `sire_id`: identificador do pai
- `dam_id`: identificador da mãe
- `pedigree`: pedigree (se disponível)

#### 3.4.2 Identificação Individual
**Campos:**
- `animal_id`: identificador único do animal
- `birth_order`: ordem de nascimento (em leitegadas)
- `sex`: sexo (M/F)
- `birth_weight`: peso ao nascer
- `birth_date`: data de nascimento

### 3.5 Dados de Manejo

#### 3.5.1 Densidade e Alojamento
**Campos:**
- `stocking_density`: densidade de alojamento (animais/m² ou animais/m³)
- `pen_id`: identificador do box/baia/galpão
- `house_id`: identificador da instalação
- `floor_type`: tipo de piso (ripado, compacto, cama)
- `group_size`: tamanho do grupo

#### 3.5.2 Sanidade
**Campos:**
- `vaccination_program`: programa de vacinação (JSON com datas e vacinas)
- `deworming_dates`: datas de vermifugação
- `disease_events`: eventos de doença (JSON com tipo, data, tratamento)
- `antibiotic_use`: uso de antibióticos (tipo, dose, duração)
- `mortality_reason`: causa de mortalidade (quando aplicável)

### 3.6 Dados Geoespaciais e Contextuais

#### 3.6.1 Localização
**Campos:**
- `farm_id`: identificador da fazenda
- `farm_name`: nome da fazenda
- `state`: estado (UF)
- `municipality`: município
- `latitude`: latitude
- `longitude`: longitude
- `altitude_m`: altitude (metros)
- `climate_zone`: zona climática (tropical, subtropical, etc.)

#### 3.6.2 Contexto Produtivo
**Campos:**
- `production_system`: sistema produtivo (intensivo, semi-intensivo, extensivo, orgânico)
- `farm_size_ha`: tamanho da propriedade (hectares)
- `herd_size`: tamanho do rebanho/plantel
- `technology_level`: nível tecnológico (baixo, médio, alto)

### 3.7 Dados de Produção Específicos

#### 3.7.1 Bovinos Leite (Adicional)
**Campos:**
- `milking_frequency`: frequência de ordenha (2x, 3x/dia)
- `milking_time_min`: tempo de ordenha (minutos)
- `milk_flow_rate`: taxa de fluxo de leite (kg/min)
- `udder_health_score`: escore de saúde do úbere
- `locomotion_score`: escore de locomoção
- `calving_ease`: facilidade de parto (1-5)
- `calving_interval_days`: intervalo entre partos (dias)

#### 3.7.2 Suínos (Adicional)
**Campos:**
- `litter_size_total`: tamanho total da leitegada
- `litter_size_born_alive`: leitões nascidos vivos
- `litter_size_weaned`: leitões desmamados
- `mummified_piglets`: leitões mumificados
- `stillborn_piglets`: natimortos
- `weaning_age_days`: idade ao desmame (dias)
- `backfat_thickness_mm`: espessura de toucinho (mm)

#### 3.7.3 Aves (Adicional)
**Campos:**
- `egg_production_rate`: taxa de postura (%)
- `egg_weight_g`: peso médio do ovo (g)
- `egg_mass_g`: massa de ovos (g/ave/dia)
- `shell_thickness_mm`: espessura da casca (mm)
- `shell_strength_kg`: resistência da casca (kg)
- `yolk_color_score`: escore de cor da gema
- `haugh_unit`: unidade Haugh (qualidade interna)
- `dirty_eggs_pct`: percentual de ovos sujos (%)
- `cracked_eggs_pct`: percentual de ovos trincados (%)

#### 3.7.4 Piscicultura (Adicional)
**Campos:**
- `initial_stocking_number`: número inicial de peixes estocados
- `final_harvest_number`: número final de peixes colhidos
- `survival_rate_pct`: taxa de sobrevivência (%)
- `uniformity_cv`: uniformidade do lote (CV%)
- `harvest_weight_avg_g`: peso médio na despesca (g)
- `production_kg_m3`: produção por volume (kg/m³)
- `production_kg_ha`: produção por área (kg/ha)

---

## 4. ARQUITETURA PROPOSTA PARA IMPLEMENTAÇÃO

### 4.1 Unificação dos Pipelines de Análise

**Problema Atual:**
- Dois pipelines: `calculateBasicStatistics` (route.ts) vs `analyzeDataset` (dataAnalysis.ts)
- Risco de inconsistências e manutenção duplicada

**Solução:**
```typescript
// app/api/analysis/multi-species/route.ts
// ANTES:
const statistics = calculateBasicStatistics(parsed.data)

// DEPOIS:
const analysisResult = analyzeDataset(parsed.data)
const statistics = {
  means: Object.fromEntries(
    Object.entries(analysisResult.numericStats).map(([k, v]) => [k, v.mean])
  ),
  // ... outros campos necessários
}
```

### 4.2 Sistema de Mapeamento Canônico de Métricas

**Estrutura:**
```typescript
// lib/metrics/canonical-metrics.ts
export interface CanonicalMetric {
  key: string                    // Chave canônica (ex: 'gpd')
  aliases: string[]              // Aliases (ex: ['gmd', 'ganho_diario', 'daily_gain'])
  unit: string                   // Unidade padrão (ex: 'kg/dia')
  acceptedUnits: string[]        // Unidades aceitas (ex: ['kg/dia', 'g/dia', 'lb/day'])
  species: string[]              // Espécies aplicáveis
  category: string               // Categoria (peso, performance, reprodução, etc.)
  description: string            // Descrição
  validationRules?: {
    min?: number
    max?: number
    mustBePositive?: boolean
  }
}

export const CANONICAL_METRICS: CanonicalMetric[] = [
  {
    key: 'gpd',
    aliases: ['gmd', 'ganho_diario', 'ganho_peso_diario', 'daily_gain', 'adg'],
    unit: 'kg/dia',
    acceptedUnits: ['kg/dia', 'kg/day', 'g/dia', 'g/day', 'lb/day'],
    species: ['bovine', 'swine', 'sheep', 'goat'],
    category: 'performance',
    description: 'Ganho de Peso Diário',
    validationRules: {
      min: 0,
      max: 3,
      mustBePositive: true
    }
  },
  // ... mais métricas
]

// Função de resolução
export function resolveMetric(columnName: string): CanonicalMetric | null {
  const normalized = columnName.toLowerCase().trim()
  return CANONICAL_METRICS.find(m => 
    m.key === normalized || m.aliases.includes(normalized)
  ) || null
}

// Função de conversão de unidades
export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  const conversions: Record<string, Record<string, number>> = {
    'g/dia': { 'kg/dia': 0.001, 'lb/day': 0.0022 },
    'kg/dia': { 'g/dia': 1000, 'lb/day': 2.20462 },
    // ... mais conversões
  }
  
  if (fromUnit === toUnit) return value
  return value * (conversions[fromUnit]?.[toUnit] || 1)
}
```

### 4.3 Extensão do Schema do Banco de Dados

**Adicionar campos temporais e contextuais:**
```prisma
// prisma/schema.prisma

model Dataset {
  // ... campos existentes
  
  // Novos campos temporais
  measurementDate  DateTime?
  startDate        DateTime?
  endDate          DateTime?
  
  // Novos campos contextuais
  farmLocation     String?   // JSON: {state, municipality, lat, lon}
  environmentData  String?   // JSON: {temperature, humidity, thi, etc}
  productionSystem String?   // intensivo, semi-intensivo, extensivo
  
  // Metadados de qualidade
  dataQualityScore Float?
  hasTemporalData  Boolean   @default(false)
  hasEnvironmental Boolean   @default(false)
}

// Novo modelo para dados agregados de benchmarking
model BenchmarkData {
  id              String   @id @default(cuid())
  speciesId       String
  subtypeId       String?
  metric          String
  
  // Estratificação
  region          String?  // UF ou região
  season          String?  // verão, inverno, etc
  productionSystem String? // intensivo, etc
  
  // Estatísticas agregadas (anonimizadas)
  n               Int      // número de observações
  mean            Float
  median          Float
  stdDev          Float
  p25             Float
  p50             Float
  p75             Float
  p90             Float
  
  // Metadados
  periodStart     DateTime
  periodEnd       DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([speciesId, metric])
  @@index([region, season])
  @@unique([speciesId, subtypeId, metric, region, season, periodStart])
  @@map("benchmark_data")
}

// Modelo para armazenar séries temporais
model TimeSeriesData {
  id          String   @id @default(cuid())
  datasetId   String
  animalId    String?  // Opcional: ID do animal individual
  
  timestamp   DateTime
  ageDays     Int?
  dim         Int?     // Dias em lactação
  
  metrics     String   // JSON com métricas: {peso: 450, gpd: 1.2, etc}
  
  createdAt   DateTime @default(now())
  
  dataset     Dataset  @relation(fields: [datasetId], references: [id], onDelete: Cascade)
  
  @@index([datasetId, timestamp])
  @@index([animalId, timestamp])
  @@map("timeseries_data")
}
```

### 4.4 Microserviço Python para Análises Avançadas

**Arquitetura:**
```
┌─────────────────┐
│   Next.js API   │
│   (Node.js)     │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  FastAPI Python │
│  Microservice   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Models │ │ Cache  │
│ (pkl)  │ │ Redis  │
└────────┘ └────────┘
```

**Endpoints do Microserviço:**
```python
# analytics_service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
from typing import List, Dict, Optional

app = FastAPI()

class TimeSeriesRequest(BaseModel):
    data: List[Dict]
    metric: str
    frequency: str = 'D'  # Daily

class ForecastResponse(BaseModel):
    forecast: List[float]
    lower_bound: List[float]
    upper_bound: List[float]
    dates: List[str]

@app.post("/forecast", response_model=ForecastResponse)
async def forecast_timeseries(request: TimeSeriesRequest):
    """Forecast usando Prophet"""
    from prophet import Prophet
    
    df = pd.DataFrame(request.data)
    df = df.rename(columns={'date': 'ds', request.metric: 'y'})
    
    model = Prophet()
    model.fit(df)
    
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    
    return ForecastResponse(
        forecast=forecast['yhat'].tail(30).tolist(),
        lower_bound=forecast['yhat_lower'].tail(30).tolist(),
        upper_bound=forecast['yhat_upper'].tail(30).tolist(),
        dates=forecast['ds'].tail(30).dt.strftime('%Y-%m-%d').tolist()
    )

@app.post("/anomaly-detection")
async def detect_anomalies(data: List[Dict]):
    """Detecção de anomalias com Isolation Forest"""
    from sklearn.ensemble import IsolationForest
    
    df = pd.DataFrame(data)
    X = df.select_dtypes(include=[np.number])
    
    clf = IsolationForest(contamination=0.05, random_state=42)
    predictions = clf.fit_predict(X)
    
    anomalies = df[predictions == -1].to_dict('records')
    return {"anomalies": anomalies, "count": len(anomalies)}

@app.post("/growth-curve")
async def fit_growth_curve(data: List[Dict], model_type: str = 'gompertz'):
    """Ajustar curva de crescimento"""
    from scipy.optimize import curve_fit
    
    df = pd.DataFrame(data)
    ages = df['age_days'].values
    weights = df['weight'].values
    
    if model_type == 'gompertz':
        def model(t, A, b, k):
            return A * np.exp(-b * np.exp(-k * t))
    # ... outros modelos
    
    params, _ = curve_fit(model, ages, weights)
    predicted = model(ages, *params)
    
    return {
        "parameters": params.tolist(),
        "predicted": predicted.tolist(),
        "r_squared": calculate_r2(weights, predicted)
    }

@app.post("/spc-control-chart")
async def generate_control_chart(data: List[float], chart_type: str = 'ewma'):
    """Gerar gráfico de controle SPC"""
    if chart_type == 'ewma':
        ewma, ucl, lcl = calculate_ewma(data)
        violations = [i for i, v in enumerate(ewma) if v > ucl or v < lcl]
        
        return {
            "ewma": ewma,
            "ucl": ucl,
            "lcl": lcl,
            "violations": violations,
            "in_control": len(violations) == 0
        }
```

**Chamada do Next.js:**
```typescript
// lib/analytics/python-service.ts
export class PythonAnalyticsService {
  private baseUrl = process.env.PYTHON_ANALYTICS_URL || 'http://localhost:8000'
  
  async forecastTimeSeries(data: any[], metric: string) {
    const response = await fetch(`${this.baseUrl}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, metric })
    })
    
    if (!response.ok) throw new Error('Forecast failed')
    return response.json()
  }
  
  async detectAnomalies(data: any[]) {
    const response = await fetch(`${this.baseUrl}/anomaly-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) throw new Error('Anomaly detection failed')
    return response.json()
  }
}
```

### 4.5 UI para Mapeamento de Campos

**Componente de Mapeamento:**
```typescript
// components/analysis/FieldMappingStep.tsx
'use client'

import { useState } from 'react'
import { CANONICAL_METRICS } from '@/lib/metrics/canonical-metrics'

interface FieldMappingStepProps {
  detectedColumns: string[]
  onMappingComplete: (mappings: FieldMapping[]) => void
}

interface FieldMapping {
  sourceField: string
  targetField: string
  unit: string
}

export function FieldMappingStep({ detectedColumns, onMappingComplete }: FieldMappingStepProps) {
  const [mappings, setMappings] = useState<FieldMapping[]>([])
  
  const suggestMapping = (column: string) => {
    // Auto-sugerir mapeamento baseado em aliases
    const metric = CANONICAL_METRICS.find(m => 
      m.aliases.some(alias => column.toLowerCase().includes(alias))
    )
    return metric?.key || ''
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Mapeamento de Campos</h3>
      <p className="text-sm text-muted-foreground">
        Mapeie as colunas do seu arquivo para as métricas padrão do sistema
      </p>
      
      <div className="space-y-3">
        {detectedColumns.map(column => (
          <div key={column} className="flex items-center gap-4 p-3 border rounded">
            <div className="flex-1">
              <span className="font-medium">{column}</span>
            </div>
            
            <select 
              className="w-48 px-3 py-2 border rounded"
              defaultValue={suggestMapping(column)}
              onChange={(e) => handleMappingChange(column, e.target.value)}
            >
              <option value="">Ignorar</option>
              {CANONICAL_METRICS.map(metric => (
                <option key={metric.key} value={metric.key}>
                  {metric.description} ({metric.unit})
                </option>
              ))}
            </select>
            
            <select className="w-32 px-3 py-2 border rounded">
              {/* Seletor de unidade */}
            </select>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => onMappingComplete(mappings)}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        Continuar
      </button>
    </div>
  )
}
```

### 4.6 Sistema de Validação Aprimorado

**Validação com Zod:**
```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const BovineDataSchema = z.object({
  measurement_date: z.string().datetime().optional(),
  age_days: z.number().int().min(0).max(3650).optional(),
  
  // Métricas
  peso: z.number().min(0).max(1500),
  gpd: z.number().min(0).max(3),
  conversao_alimentar: z.number().min(0).max(20).optional(),
  
  // Validação cruzada
}).refine(data => {
  // Validação: GPD deve ser consistente com peso
  if (data.peso_inicial && data.peso_final && data.dias) {
    const gpd_calculated = (data.peso_final - data.peso_inicial) / data.dias
    const gpd_reported = data.gpd || gpd_calculated
    const diff = Math.abs(gpd_calculated - gpd_reported)
    return diff < 0.1 // Tolerância de 100g
  }
  return true
}, {
  message: "GPD informado não é consistente com peso inicial/final e dias"
})

// Função de validação
export function validateDataset(
  data: any[],
  species: string,
  subtype: string
): { valid: boolean; errors: string[]; warnings: string[] } {
  const schema = getSchemaForSpecies(species, subtype)
  const errors: string[] = []
  const warnings: string[] = []
  
  data.forEach((row, index) => {
    const result = schema.safeParse(row)
    if (!result.success) {
      result.error.errors.forEach(err => {
        errors.push(`Linha ${index + 1}: ${err.path.join('.')} - ${err.message}`)
      })
    }
  })
  
  return { valid: errors.length === 0, errors, warnings }
}
```

---

## 5. ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Fundação (2-3 semanas)

#### Sprint 1.1: Unificação e Mapeamento
- [ ] Unificar pipelines de análise (usar `analyzeDataset` em todos os lugares)
- [ ] Criar sistema de métricas canônicas com aliases
- [ ] Implementar conversão de unidades
- [ ] Adicionar UI de mapeamento de campos no upload

#### Sprint 1.2: Dados Temporais
- [ ] Estender schema do banco com campos temporais
- [ ] Adicionar campos de data no formulário de upload
- [ ] Implementar validação de datas
- [ ] Criar modelo `TimeSeriesData`

### Fase 2: Estatísticas Avançadas (3-4 semanas)

#### Sprint 2.1: Intervalos de Confiança e Testes
- [ ] Implementar cálculo de IC 95% para médias
- [ ] Adicionar testes t vs referências
- [ ] Mostrar significância estatística na UI
- [ ] Implementar correção de Bonferroni

#### Sprint 2.2: Benchmarking de Pares
- [ ] Criar modelo `BenchmarkData`
- [ ] Implementar agregação anônima de dados
- [ ] Calcular percentis por cohort
- [ ] Mostrar z-scores e percentis na UI

### Fase 3: Análise Temporal e SPC (4-5 semanas)

#### Sprint 3.1: Microserviço Python
- [ ] Configurar FastAPI service
- [ ] Implementar endpoints de forecasting (Prophet)
- [ ] Implementar SPC (EWMA, CUSUM)
- [ ] Configurar deploy (Docker + Cloud Run/Heroku)

#### Sprint 3.2: Integração Temporal
- [ ] Criar endpoints Next.js para chamar Python service
- [ ] Implementar UI de gráficos de controle
- [ ] Adicionar forecasting na página de resultados
- [ ] Implementar alertas de desvios

### Fase 4: Detecção de Anomalias (2-3 semanas)

#### Sprint 4.1: Anomalias Multivariadas
- [ ] Implementar Isolation Forest no Python service
- [ ] Implementar LOF
- [ ] Criar endpoint de detecção de anomalias
- [ ] Adicionar visualização de anomalias na UI

#### Sprint 4.2: Anomalias Temporais
- [ ] Implementar decomposição STL
- [ ] Detectar anomalias em resíduos
- [ ] Integrar com sistema de alertas

### Fase 5: Modelos de Domínio (3-4 semanas)

#### Sprint 5.1: Curvas de Crescimento
- [ ] Implementar modelos Gompertz, Brody, von Bertalanffy
- [ ] Criar endpoint para ajuste de curvas
- [ ] Visualizar curvas vs dados reais
- [ ] Identificar desvios de crescimento

#### Sprint 5.2: Curvas de Lactação
- [ ] Implementar Wood's model
- [ ] Prever produção total de lactação
- [ ] Detectar problemas de lactação

### Fase 6: Dados Ambientais (3-4 semanas)

#### Sprint 6.1: Clima e THI
- [ ] Integrar API de clima (OpenWeatherMap/INMET)
- [ ] Calcular THI automaticamente
- [ ] Adicionar campos ambientais no upload
- [ ] Correlacionar THI com performance

#### Sprint 6.2: Sensoriamento Remoto
- [ ] Integrar Sentinel/Landsat para NDVI
- [ ] Correlacionar NDVI com biomassa de forragem
- [ ] Adicionar mapas de NDVI na UI

### Fase 7: Machine Learning (4-5 semanas)

#### Sprint 7.1: Modelos Preditivos
- [ ] Treinar modelos XGBoost para predição
- [ ] Implementar SHAP para explicabilidade
- [ ] Criar endpoint de predição
- [ ] Mostrar reason codes na UI

#### Sprint 7.2: Classificação e Diagnóstico
- [ ] Treinar classificadores de performance
- [ ] Gerar diagnósticos automáticos com ML
- [ ] Implementar sistema de recomendações

### Fase 8: Qualidade de Dados (2-3 semanas)

#### Sprint 8.1: Validação Robusta
- [ ] Implementar schemas Zod por espécie
- [ ] Adicionar validações cruzadas
- [ ] Implementar score de qualidade de dados
- [ ] Mostrar qualidade na UI

#### Sprint 8.2: Detecção de Inconsistências
- [ ] Detectar valores biologicamente implausíveis
- [ ] Identificar inconsistências temporais
- [ ] Sugerir correções automáticas

---

## 6. PRIORIZAÇÃO E QUICK WINS

### Quick Wins (1-2 semanas)

1. **Intervalos de Confiança** ⭐⭐⭐
   - Impacto: Alto
   - Esforço: Baixo
   - Implementação: Adicionar cálculo de IC 95% nas estatísticas existentes

2. **Mapeamento de Campos** ⭐⭐⭐
   - Impacto: Alto
   - Esforço: Médio
   - Implementação: UI de mapeamento + sistema de aliases

3. **Validação Cruzada** ⭐⭐
   - Impacto: Médio
   - Esforço: Baixo
   - Implementação: Validar GPD vs peso/dias

4. **Detecção de Outliers Robusta (MAD)** ⭐⭐
   - Impacto: Médio
   - Esforço: Baixo
   - Implementação: Substituir IQR por MAD em alguns casos

### Médio Prazo (1-2 meses)

1. **Benchmarking de Pares** ⭐⭐⭐
   - Impacto: Alto
   - Esforço: Alto
   - Valor: Comparação com pares é muito valorizada

2. **Dados Temporais + SPC** ⭐⭐⭐
   - Impacto: Alto
   - Esforço: Alto
   - Valor: Monitoramento contínuo é essencial

3. **Microserviço Python** ⭐⭐
   - Impacto: Alto
   - Esforço: Alto
   - Valor: Habilita análises avançadas

### Longo Prazo (3-6 meses)

1. **Machine Learning Preditivo** ⭐⭐⭐
   - Impacto: Muito Alto
   - Esforço: Muito Alto
   - Valor: Diferencial competitivo

2. **Integração Climática** ⭐⭐
   - Impacto: Médio
   - Esforço: Médio
   - Valor: Ajustes contextuais importantes

3. **Curvas de Crescimento/Lactação** ⭐⭐
   - Impacto: Médio
   - Esforço: Médio
   - Valor: Análise sofisticada para usuários avançados

---

## 7. CONSIDERAÇÕES FINAIS

### 7.1 Gaps de Referência

**Problema:** Alguns subtipos não têm dados de referência completos
- bovine.dual (dupla aptidão)
- sheep.wool, sheep.milk
- goat.skin

**Solução:**
1. Adicionar referências faltantes baseadas em literatura
2. Mostrar UI clara quando não há referência
3. Usar benchmarking de pares como fallback

### 7.2 Privacidade e Anonimização

Para benchmarking de pares:
- Agregar dados por cohort (mínimo 10 fazendas)
- Remover identificadores
- Calcular apenas estatísticas agregadas
- Permitir opt-out

### 7.3 Performance e Escalabilidade

- Usar Upstash Redis para cache de análises pesadas
- Processar análises ML de forma assíncrona
- Implementar rate limiting no Python service
- Considerar batch processing para análises em lote

### 7.4 Custos

**APIs Externas:**
- OpenWeatherMap: $0 (free tier) até $40/mês
- Sentinel Hub: $0 (free tier) até $50/mês
- Python microservice: $10-50/mês (Cloud Run/Heroku)

**Total estimado:** $20-140/mês dependendo do uso

---

## 8. REFERÊNCIAS E RECURSOS

### Bibliotecas Python Recomendadas
```
# requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
pandas==2.1.3
numpy==1.26.2
scipy==1.11.4
scikit-learn==1.3.2
statsmodels==0.14.0
prophet==1.1.5
xgboost==2.0.2
lightgbm==4.1.0
shap==0.43.0
lifelines==0.27.8
```

### Literatura Científica
- NRC (2016). Nutrient Requirements of Beef Cattle (8th Edition)
- NRC (2012). Nutrient Requirements of Swine (11th Edition)
- NRC (1994). Nutrient Requirements of Poultry (9th Edition)
- EMBRAPA (2023). Parâmetros Zootécnicos de Referência

### Cursos e Tutoriais
- Coursera: Applied Data Science with Python
- DataCamp: Time Series Analysis in Python
- Fast.ai: Practical Deep Learning for Coders

---

**Documento preparado por:** Devin AI  
**Data:** 05 de Novembro de 2025  
**Versão:** 1.0
