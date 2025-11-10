/**
 * File Parser Utility
 *
 * Handles parsing of CSV and Excel files (XLS/XLSX) for agricultural data analysis.
 * Converts all file types to a standardized format for processing.
 */

import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParseResult {
  data: Record<string, unknown>[]
  errors: Array<{ message: string; row?: number }>
}

/**
 * Detect file type based on extension and MIME type
 */
function detectFileType(file: File): 'csv' | 'excel' | 'unknown' {
  const extension = file.name.toLowerCase().split('.').pop()

  if (extension === 'csv') {
    return 'csv'
  }

  if (extension === 'xls' || extension === 'xlsx') {
    return 'excel'
  }

  if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
    return 'excel'
  }

  if (file.type.includes('csv')) {
    return 'csv'
  }

  return 'unknown'
}

/**
 * Detect if CSV uses semicolon as delimiter (common in Brazilian Excel exports)
 */
function detectDelimiter(text: string): ',' | ';' {
  const firstLine = text.split('\n')[0] || ''
  const commaCount = (firstLine.match(/,/g) || []).length
  const semicolonCount = (firstLine.match(/;/g) || []).length

  return semicolonCount > commaCount ? ';' : ','
}

/**
 * Normalize decimal comma to decimal point for numeric parsing
 * Only applies to Brazilian format CSVs (semicolon delimiter)
 */
function normalizeDecimalComma(data: Record<string, unknown>[]): Record<string, unknown>[] {
  return data.map((row) => {
    const normalizedRow: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string') {
        const trimmed = value.trim()
        const commaDecimal = trimmed.replace(',', '.')
        const numValue = parseFloat(commaDecimal)

        if (!isNaN(numValue) && /^-?\d+,\d+$/.test(trimmed)) {
          normalizedRow[key] = numValue
        } else {
          normalizedRow[key] = value
        }
      } else {
        normalizedRow[key] = value
      }
    }

    return normalizedRow
  })
}

/**
 * Validate CSV headers for duplicates
 */
function validateHeaders(headers: string[]): string | null {
  const seen = new Set<string>()
  const duplicates: string[] = []

  for (const header of headers) {
    if (seen.has(header)) {
      duplicates.push(header)
    }
    seen.add(header)
  }

  if (duplicates.length > 0) {
    return `Cabeçalhos duplicados encontrados: ${duplicates.join(', ')}`
  }

  return null
}

/**
 * Parse CSV file using Papa Parse
 */
async function parseCSV(file: File): Promise<ParseResult> {
  const text = await file.text()

  const delimiter = detectDelimiter(text)

  const parsed = Papa.parse(text, {
    header: true,
    dynamicTyping: delimiter === ',',
    skipEmptyLines: true,
    delimiter,
  })

  let data = parsed.data as Record<string, unknown>[]
  const errors: Array<{ message: string; row?: number }> = []

  errors.push(
    ...parsed.errors.map((err) => ({
      message: err.message,
      row: err.row,
    }))
  )

  if (data.length > 0) {
    const headers = Object.keys(data[0])
    const headerError = validateHeaders(headers)
    if (headerError) {
      errors.push({ message: headerError })
    }
  }

  if (delimiter === ';') {
    data = normalizeDecimalComma(data)
  }

  return {
    data,
    errors,
  }
}

/**
 * Parse Excel file (XLS/XLSX) using SheetJS
 */
async function parseExcel(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    if (workbook.SheetNames.length === 0) {
      return {
        data: [],
        errors: [{ message: 'Arquivo Excel não contém planilhas' }],
      }
    }

    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      raw: false,
    }) as unknown[][]

    if (jsonData.length === 0) {
      return {
        data: [],
        errors: [{ message: 'Planilha Excel está vazia' }],
      }
    }

    const headers = jsonData[0] as string[]
    const rows = jsonData.slice(1)

    const errors: Array<{ message: string; row?: number }> = []

    const headerError = validateHeaders(headers)
    if (headerError) {
      errors.push({ message: headerError })
    }

    const expectedColumnCount = headers.length

    const data: Record<string, unknown>[] = rows.map((row, index) => {
      const obj: Record<string, unknown> = {}

      if (row.length !== expectedColumnCount) {
        errors.push({
          message: `Linha ${index + 2} tem ${row.length} colunas, esperado ${expectedColumnCount}`,
          row: index + 2,
        })
      }

      headers.forEach((header, colIndex) => {
        const value = row[colIndex]

        if (value === null || value === undefined || value === '') {
          obj[header] = null
          return
        }

        if (typeof value === 'string') {
          const numValue = parseFloat(value.replace(',', '.'))
          if (!isNaN(numValue)) {
            obj[header] = numValue
          } else {
            obj[header] = value
          }
        } else {
          obj[header] = value
        }
      })
      return obj
    })

    return {
      data,
      errors,
    }
  } catch (error) {
    return {
      data: [],
      errors: [
        {
          message: `Erro ao processar arquivo Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        },
      ],
    }
  }
}

/**
 * Parse file (CSV or Excel) and return standardized data
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const fileType = detectFileType(file)

  if (fileType === 'unknown') {
    return {
      data: [],
      errors: [{ message: 'Tipo de arquivo não suportado. Use CSV, XLS ou XLSX.' }],
    }
  }

  if (fileType === 'csv') {
    return parseCSV(file)
  }

  return parseExcel(file)
}

/**
 * Validate file type is supported
 */
export function isSupportedFileType(file: File): boolean {
  const fileType = detectFileType(file)
  return fileType === 'csv' || fileType === 'excel'
}

/**
 * Get file type display name
 */
export function getFileTypeDisplayName(file: File): string {
  const fileType = detectFileType(file)

  switch (fileType) {
    case 'csv':
      return 'CSV'
    case 'excel':
      return 'Excel'
    default:
      return 'Desconhecido'
  }
}
