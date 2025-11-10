/**
 * EN: Analysis error handling utilities with stage-specific error tracking
 * PT-BR: Utilitários de tratamento de erros de análise com rastreamento de erros específicos por etapa
 */

/**
 * EN: Analysis pipeline stages
 * PT-BR: Etapas do pipeline de análise
 */
export type AnalysisStage =
  | 'parse' // Parsing e validação do arquivo
  | 'validation' // Validação de dados (mínimo de linhas, colunas, etc.)
  | 'statistics' // Cálculo de estatísticas
  | 'reference' // Busca de dados de referência (NRC/EMBRAPA)
  | 'comparison' // Comparação com dados de referência
  | 'diagnosis' // Geração de diagnóstico/interpretação
  | 'persistence' // Salvamento no banco de dados
  | 'unknown' // Erro desconhecido

/**
 * EN: Structured error response with stage information
 * PT-BR: Resposta de erro estruturada com informação de etapa
 */
export interface AnalysisError {
  stage: AnalysisStage
  code: string
  message: string
  details?: unknown
  correlationId?: string
}

/**
 * EN: Error codes for each stage
 * PT-BR: Códigos de erro para cada etapa
 */
export const ERROR_CODES = {
  PARSE_FAILED: 'PARSE_FAILED',
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  DUPLICATE_HEADERS: 'DUPLICATE_HEADERS',
  RAGGED_ROWS: 'RAGGED_ROWS',

  EMPTY_FILE: 'EMPTY_FILE',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  NO_NUMERIC_COLUMNS: 'NO_NUMERIC_COLUMNS',

  STATISTICS_FAILED: 'STATISTICS_FAILED',

  REFERENCE_NOT_FOUND: 'REFERENCE_NOT_FOUND',
  REFERENCE_FETCH_FAILED: 'REFERENCE_FETCH_FAILED',

  COMPARISON_FAILED: 'COMPARISON_FAILED',
  METRICS_MISSING: 'METRICS_MISSING',

  DIAGNOSIS_FAILED: 'DIAGNOSIS_FAILED',

  DATABASE_ERROR: 'DATABASE_ERROR',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',

  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const

/**
 * EN: User-friendly error messages in Portuguese
 * PT-BR: Mensagens de erro amigáveis em português
 */
export const ERROR_MESSAGES: Record<string, string> = {
  PARSE_FAILED: 'Falha ao processar o arquivo. Verifique se o formato está correto.',
  INVALID_FILE_FORMAT: 'Formato de arquivo inválido. Use CSV ou Excel (.xls, .xlsx).',
  DUPLICATE_HEADERS: 'Cabeçalhos duplicados encontrados no arquivo.',
  RAGGED_ROWS: 'Linhas com número inconsistente de colunas encontradas.',

  EMPTY_FILE: 'Arquivo vazio ou sem dados válidos.',
  INSUFFICIENT_DATA:
    'Número insuficiente de dados. São necessários pelo menos 3 registros para análise estatística.',
  NO_NUMERIC_COLUMNS: 'Nenhuma coluna numérica encontrada para análise.',

  STATISTICS_FAILED: 'Falha ao calcular estatísticas dos dados.',

  REFERENCE_NOT_FOUND: 'Dados de referência não encontrados para a espécie/subtipo selecionado.',
  REFERENCE_FETCH_FAILED: 'Falha ao buscar dados de referência (NRC/EMBRAPA).',

  COMPARISON_FAILED: 'Falha ao comparar dados com referências.',
  METRICS_MISSING: 'Métricas necessárias ausentes nos dados.',

  DIAGNOSIS_FAILED: 'Falha ao gerar diagnóstico e interpretação.',

  DATABASE_ERROR: 'Erro ao salvar análise no banco de dados.',
  PROJECT_NOT_FOUND: 'Projeto não encontrado.',

  UNEXPECTED_ERROR: 'Erro inesperado ao processar análise.',
}

/**
 * EN: Create a structured error response
 * PT-BR: Criar uma resposta de erro estruturada
 */
export function createAnalysisError(
  stage: AnalysisStage,
  code: string,
  details?: unknown,
  correlationId?: string
): AnalysisError {
  return {
    stage,
    code,
    message: ERROR_MESSAGES[code] || ERROR_MESSAGES.UNEXPECTED_ERROR,
    details,
    correlationId,
  }
}

/**
 * EN: Safe execution wrapper for pipeline stages
 * PT-BR: Wrapper de execução segura para etapas do pipeline
 */
export async function safeStep<T>(
  stage: AnalysisStage,
  fn: () => T | Promise<T>,
  correlationId?: string
): Promise<{ ok: true; data: T } | { ok: false; error: AnalysisError }> {
  try {
    const data = await fn()
    return { ok: true, data }
  } catch (error) {
    console.error(`[${correlationId}] [${stage}] Error:`, error)

    let code: string = ERROR_CODES.UNEXPECTED_ERROR
    let details: unknown = undefined

    if (error instanceof Error) {
      if (error.message.includes('Cabeçalhos duplicados')) {
        code = ERROR_CODES.DUPLICATE_HEADERS
        details = { message: error.message }
      } else if (error.message.includes('Linhas com número inconsistente')) {
        code = ERROR_CODES.RAGGED_ROWS
        details = { message: error.message }
      } else if (error.message.includes('Prisma') || error.message.includes('database')) {
        code = ERROR_CODES.DATABASE_ERROR
        details = { message: error.message.split('\n')[0] }
      } else {
        details = { message: error.message }
      }
    }

    return {
      ok: false,
      error: createAnalysisError(stage, code, details, correlationId),
    }
  }
}

/**
 * EN: Generate a unique correlation ID for request tracking
 * PT-BR: Gerar um ID de correlação único para rastreamento de requisição
 */
export function generateCorrelationId(): string {
  return `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
