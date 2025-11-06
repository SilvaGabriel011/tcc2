import {
  validateFile,
  validateCSVContent,
  formatBytes,
  scanFileForThreats,
  uploadConfig
} from '@/lib/upload-validation'

describe('upload-validation', () => {
  describe('validateFile', () => {
    it('should accept valid CSV file', () => {
      const file = new File(['col1,col2\n1,2'], 'test.csv', { type: 'text/csv' })
      const result = validateFile(file)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject file exceeding size limit', () => {
      const largeContent = 'x'.repeat(uploadConfig.maxFileSize + 1)
      const file = new File([largeContent], 'large.csv', { type: 'text/csv' })
      const result = validateFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('muito grande')
    })

    it('should reject non-CSV file types', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = validateFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('inválido')
    })

    it('should reject invalid file extensions', () => {
      const file = new File(['content'], 'test.xlsx', { type: 'application/vnd.ms-excel' })
      const result = validateFile(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Extensão inválida')
    })

    it('should accept CSV with valid extension even if MIME type is wrong', () => {
      const file = new File(['col1,col2\n1,2'], 'test.csv', { type: 'application/octet-stream' })
      const result = validateFile(file)
      
      expect(result.valid).toBe(true)
      expect(result.warnings).toBeDefined()
    })

    it('should warn about large files', () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024)
      const file = new File([largeContent], 'large.csv', { type: 'text/csv' })
      const result = validateFile(file)
      
      expect(result.valid).toBe(true)
      expect(result.warnings).toBeDefined()
      expect(result.warnings?.[0]).toContain('grande')
    })

    it('should accept all allowed MIME types', () => {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/csv',
        'text/x-csv',
        'application/x-csv',
        'text/comma-separated-values',
        'text/x-comma-separated-values'
      ]
      
      allowedTypes.forEach(type => {
        const file = new File(['col1,col2\n1,2'], 'test.csv', { type })
        const result = validateFile(file)
        expect(result.valid).toBe(true)
      })
    })

    it('should handle files with uppercase extensions', () => {
      const file = new File(['col1,col2\n1,2'], 'test.CSV', { type: 'text/csv' })
      const result = validateFile(file)
      
      expect(result.valid).toBe(true)
    })
  })

  describe('validateCSVContent', () => {
    it('should accept valid CSV data', () => {
      const data = [
        { col1: 1, col2: 2 },
        { col1: 3, col2: 4 }
      ]
      const result = validateCSVContent(data)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty data', () => {
      const result = validateCSVContent([])
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('vazio')
    })

    it('should reject data exceeding row limit', () => {
      const data = Array.from({ length: uploadConfig.maxRows + 1 }, (_, i) => ({ id: i }))
      const result = validateCSVContent(data)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('excede o limite')
    })

    it('should reject data without columns', () => {
      const data = [{}]
      const result = validateCSVContent(data)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('colunas válidas')
    })

    it('should warn about large datasets', () => {
      const data = Array.from({ length: 51000 }, (_, i) => ({ id: i, value: i * 2 }))
      const result = validateCSVContent(data)
      
      expect(result.valid).toBe(true)
      expect(result.warnings).toBeDefined()
      expect(result.warnings?.[0]).toContain('grande')
    })

    it('should handle null data', () => {
      const result = validateCSVContent(null as any)
      
      expect(result.valid).toBe(false)
    })

    it('should accept data with multiple columns', () => {
      const data = [
        { col1: 1, col2: 2, col3: 3, col4: 4 },
        { col1: 5, col2: 6, col3: 7, col4: 8 }
      ]
      const result = validateCSVContent(data)
      
      expect(result.valid).toBe(true)
    })
  })

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    it('should format bytes', () => {
      expect(formatBytes(500)).toBe('500 Bytes')
    })

    it('should format kilobytes', () => {
      const result = formatBytes(1024)
      expect(result).toContain('KB')
    })

    it('should format megabytes', () => {
      const result = formatBytes(1024 * 1024)
      expect(result).toContain('MB')
    })

    it('should format gigabytes', () => {
      const result = formatBytes(1024 * 1024 * 1024)
      expect(result).toContain('GB')
    })

    it('should round to 2 decimal places', () => {
      const result = formatBytes(1536)
      expect(result).toBe('1.5 KB')
    })

    it('should handle large numbers', () => {
      const result = formatBytes(5 * 1024 * 1024)
      expect(result).toBe('5 MB')
    })
  })

  describe('scanFileForThreats', () => {
    beforeEach(() => {
      global.Blob.prototype.text = async function() {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsText(this as Blob)
        })
      }
    })

    it('should accept safe CSV content', async () => {
      const file = new File(['col1,col2\n1,2\n3,4'], 'safe.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject files with script tags', async () => {
      const file = new File(['<script>alert("xss")</script>'], 'malicious.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('malicioso')
    })

    it('should reject files with javascript: protocol', async () => {
      const file = new File(['javascript:alert(1)'], 'malicious.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('malicioso')
    })

    it('should reject files with onerror attribute', async () => {
      const file = new File(['<img onerror="alert(1)">'], 'malicious.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('malicioso')
    })

    it('should reject files with onclick attribute', async () => {
      const file = new File(['<div onclick="alert(1)">'], 'malicious.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('malicioso')
    })

    it('should reject files with iframe tags', async () => {
      const file = new File(['<iframe src="evil.com"></iframe>'], 'malicious.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('malicioso')
    })

    it('should reject files with eval function', async () => {
      const file = new File(['eval("malicious code")'], 'malicious.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('malicioso')
    })

    it('should reject files with Excel formula injection', async () => {
      const file = new File(['=IMPORTXML("http://evil.com")'], 'malicious.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('malicioso')
    })

    it('should reject files with WEBSERVICE formula', async () => {
      const file = new File(['=WEBSERVICE("http://evil.com")'], 'malicious.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('malicioso')
    })

    it('should be case-insensitive for threat detection', async () => {
      const file = new File(['<SCRIPT>alert(1)</SCRIPT>'], 'malicious.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(false)
    })

    it('should only scan first 1KB of file', async () => {
      const safeContent = 'col1,col2\n'.repeat(1000)
      const file = new File([safeContent], 'large.csv', { type: 'text/csv' })
      const result = await scanFileForThreats(file)
      
      expect(result.valid).toBe(true)
    })
  })

  describe('uploadConfig', () => {
    it('should have maxFileSize defined', () => {
      expect(uploadConfig.maxFileSize).toBeDefined()
      expect(uploadConfig.maxFileSize).toBeGreaterThan(0)
    })

    it('should have maxRows defined', () => {
      expect(uploadConfig.maxRows).toBeDefined()
      expect(uploadConfig.maxRows).toBeGreaterThan(0)
    })

    it('should have allowedTypes array', () => {
      expect(Array.isArray(uploadConfig.allowedTypes)).toBe(true)
      expect(uploadConfig.allowedTypes.length).toBeGreaterThan(0)
    })

    it('should have allowedExtensions array', () => {
      expect(Array.isArray(uploadConfig.allowedExtensions)).toBe(true)
      expect(uploadConfig.allowedExtensions).toContain('.csv')
    })
  })
})
