/**
 * Tipos compartilhados para Diagnóstico Zootécnico
 * Usado tanto no backend (ai-diagnostic.ts, diagnostico-generator.ts)
 * quanto no frontend (LaymanTab, ActionSummary, resultados/page.tsx)
 */

/**
 * Status de análise de uma variável numérica
 */
export type DiagnosticStatus = 'Excelente' | 'Bom' | 'Regular' | 'Preocupante'

/**
 * Prioridade de uma recomendação
 */
export type RecommendationPriority = 'Alta' | 'Média' | 'Baixa'

/**
 * Análise de uma variável numérica individual
 */
export interface DiagnosticNumericAnalysis {
  variavel: string
  status: DiagnosticStatus
  interpretacao: string
  comparacaoLiteratura?: string
}

/**
 * Recomendação prioritária com título, descrição e prioridade
 */
export interface DiagnosticRecommendation {
  titulo: string
  descricao: string
  prioridade: RecommendationPriority
}

/**
 * Resultado completo do diagnóstico zootécnico
 * Gerado por IA (Gemini/OpenAI) ou pelo sistema de regras (fallback)
 */
export interface DiagnosticResult {
  resumoExecutivo: string
  analiseNumericas: DiagnosticNumericAnalysis[]
  pontosFortes: string[]
  pontosAtencao: string[]
  recomendacoesPrioritarias: DiagnosticRecommendation[]
  conclusao: string
  fontes: string[]
  generatedBy?: 'gemini' | 'openai' | 'rule-based'
}

/**
 * Resposta da API de diagnóstico
 * Inclui metadados adicionais além do DiagnosticResult
 */
export interface DiagnosticResponse extends DiagnosticResult {
  diagnostico: string
  geradoEm: string
  metodo: string
}
