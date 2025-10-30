/**
 * Configuração e validação de uploads de arquivos
 */

export const uploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxRows: 100000, // 100k linhas
  allowedTypes: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/csv',
    'text/x-csv',
    'application/x-csv',
    'text/comma-separated-values',
    'text/x-comma-separated-values'
  ],
  allowedExtensions: ['.csv']
}

export interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

/**
 * Valida um arquivo antes do upload
 */
export function validateFile(file: File): ValidationResult {
  const warnings: string[] = []

  // Validar tamanho
  if (file.size > uploadConfig.maxFileSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${formatBytes(uploadConfig.maxFileSize)}`
    }
  }

  // Validar tipo MIME
  if (!uploadConfig.allowedTypes.includes(file.type)) {
    // Alguns browsers não setam o MIME type corretamente para CSV
    // então também checamos a extensão
    const extension = getFileExtension(file.name)
    if (!uploadConfig.allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: 'Tipo de arquivo inválido. Apenas arquivos CSV são aceitos.'
      }
    }
    warnings.push('Tipo MIME não reconhecido, mas extensão é válida.')
  }

  // Validar extensão
  const extension = getFileExtension(file.name)
  if (!uploadConfig.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Extensão inválida. Use arquivos .csv'
    }
  }

  // Avisos para arquivos muito grandes (mas ainda válidos)
  if (file.size > 10 * 1024 * 1024) { // > 10MB
    warnings.push('Arquivo grande detectado. O processamento pode levar alguns segundos.')
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Valida o conteúdo do CSV após parse
 */
export function validateCSVContent(data: any[]): ValidationResult {
  if (!data || data.length === 0) {
    return {
      valid: false,
      error: 'Arquivo CSV vazio ou sem dados válidos.'
    }
  }

  if (data.length > uploadConfig.maxRows) {
    return {
      valid: false,
      error: `Número de linhas excede o limite. Máximo: ${uploadConfig.maxRows.toLocaleString()} linhas`
    }
  }

  // Verificar se tem pelo menos uma coluna
  const firstRow = data[0]
  if (!firstRow || Object.keys(firstRow).length === 0) {
    return {
      valid: false,
      error: 'CSV não possui colunas válidas.'
    }
  }

  const warnings: string[] = []

  // Avisar se houver muitas linhas
  if (data.length > 50000) {
    warnings.push(`Dataset grande: ${data.length.toLocaleString()} linhas. Análise pode levar mais tempo.`)
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Formata bytes em formato legível
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Extrai extensão do arquivo
 */
function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase()
}

/**
 * Valida se o arquivo é seguro (não contém scripts maliciosos)
 */
export async function scanFileForThreats(file: File): Promise<ValidationResult> {
  // Ler primeiros 1KB do arquivo para verificar conteúdo suspeito
  const chunk = file.slice(0, 1024)
  const text = await chunk.text()

  // Padrões suspeitos em CSV
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /<iframe/i,
    /eval\(/i,
    /=IMPORTXML\(/i, // Excel formula injection
    /=WEBSERVICE\(/i
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      return {
        valid: false,
        error: 'Arquivo contém conteúdo potencialmente malicioso e foi bloqueado.'
      }
    }
  }

  return { valid: true }
}
