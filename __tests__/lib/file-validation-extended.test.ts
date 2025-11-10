import {
  validateCSVFile,
  validateImageFile,
  validatePDFFile,
  validateFile,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} from '@/lib/file-validation'

describe('file-validation extended', () => {
  describe('validateCSVFile', () => {
    it('should validate valid CSV file', () => {
      const file = new File(['col1,col2\n1,2'], 'test.csv', { type: 'text/csv' })
      const result = validateCSVFile(file)

      expect(result.valid).toBe(true)
      expect(result.details?.type).toBe('text/csv')
      expect(result.details?.extension).toBe('.csv')
    })

    it('should reject oversized CSV file', () => {
      const largeContent = 'x'.repeat(FILE_SIZE_LIMITS.CSV + 1)
      const file = new File([largeContent], 'large.csv', { type: 'text/csv' })
      const result = validateCSVFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('muito grande')
    })

    it('should reject CSV with invalid MIME type', () => {
      const file = new File(['data'], 'test.csv', { type: 'application/json' })
      const result = validateCSVFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitido')
    })

    it('should reject CSV with invalid extension', () => {
      const file = new File(['data'], 'test.json', { type: 'text/csv' })
      const result = validateCSVFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitida')
    })

    it('should accept CSV with text/plain MIME type', () => {
      const file = new File(['col1,col2\n1,2'], 'test.csv', { type: 'text/plain' })
      const result = validateCSVFile(file)

      expect(result.valid).toBe(true)
    })

    it('should accept CSV with .txt extension', () => {
      const file = new File(['col1,col2\n1,2'], 'test.txt', { type: 'text/csv' })
      const result = validateCSVFile(file)

      expect(result.valid).toBe(true)
    })
  })

  describe('validateImageFile', () => {
    it('should validate valid image file', () => {
      const file = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(file)

      expect(result.valid).toBe(true)
      expect(result.details?.type).toBe('image/jpeg')
      expect(result.details?.extension).toBe('.jpg')
    })

    it('should reject oversized image file', () => {
      const largeContent = 'x'.repeat(FILE_SIZE_LIMITS.IMAGE + 1)
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('muito grande')
    })

    it('should reject image with invalid MIME type', () => {
      const file = new File(['data'], 'photo.jpg', { type: 'application/pdf' })
      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitido')
    })

    it('should reject image with invalid extension', () => {
      const file = new File(['data'], 'photo.txt', { type: 'image/jpeg' })
      const result = validateImageFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitida')
    })

    it('should accept PNG images', () => {
      const file = new File(['image data'], 'photo.png', { type: 'image/png' })
      const result = validateImageFile(file)

      expect(result.valid).toBe(true)
    })

    it('should accept WebP images', () => {
      const file = new File(['image data'], 'photo.webp', { type: 'image/webp' })
      const result = validateImageFile(file)

      expect(result.valid).toBe(true)
    })

    it('should accept GIF images', () => {
      const file = new File(['image data'], 'photo.gif', { type: 'image/gif' })
      const result = validateImageFile(file)

      expect(result.valid).toBe(true)
    })
  })

  describe('validatePDFFile', () => {
    it('should validate valid PDF file', () => {
      const file = new File(['%PDF-1.4'], 'document.pdf', { type: 'application/pdf' })
      const result = validatePDFFile(file)

      expect(result.valid).toBe(true)
      expect(result.details?.type).toBe('application/pdf')
      expect(result.details?.extension).toBe('.pdf')
    })

    it('should reject oversized PDF file', () => {
      const largeContent = 'x'.repeat(FILE_SIZE_LIMITS.PDF + 1)
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' })
      const result = validatePDFFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('muito grande')
    })

    it('should reject PDF with invalid MIME type', () => {
      const file = new File(['data'], 'document.pdf', { type: 'text/plain' })
      const result = validatePDFFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitido')
    })

    it('should reject PDF with invalid extension', () => {
      const file = new File(['data'], 'document.txt', { type: 'application/pdf' })
      const result = validatePDFFile(file)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitida')
    })
  })

  describe('validateFile', () => {
    it('should validate file with default options', () => {
      const file = new File(['data'], 'file.txt', { type: 'text/plain' })
      const result = validateFile(file)

      expect(result.valid).toBe(true)
      expect(result.details?.maxSize).toBe(FILE_SIZE_LIMITS.GENERAL)
    })

    it('should validate file with custom max size', () => {
      const file = new File(['data'], 'file.txt', { type: 'text/plain' })
      const result = validateFile(file, { maxSize: 1000 })

      expect(result.valid).toBe(true)
    })

    it('should reject file exceeding custom max size', () => {
      const file = new File(['x'.repeat(2000)], 'file.txt', { type: 'text/plain' })
      const result = validateFile(file, { maxSize: 1000 })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('muito grande')
    })

    it('should validate file with custom allowed types', () => {
      const file = new File(['data'], 'file.json', { type: 'application/json' })
      const result = validateFile(file, {
        allowedTypes: ['application/json'],
      })

      expect(result.valid).toBe(true)
    })

    it('should reject file with disallowed type', () => {
      const file = new File(['data'], 'file.json', { type: 'application/json' })
      const result = validateFile(file, {
        allowedTypes: ['text/plain'],
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitido')
    })

    it('should validate file with custom allowed extensions', () => {
      const file = new File(['data'], 'file.json', { type: 'application/json' })
      const result = validateFile(file, {
        allowedExtensions: ['.json'],
      })

      expect(result.valid).toBe(true)
    })

    it('should reject file with disallowed extension', () => {
      const file = new File(['data'], 'file.json', { type: 'application/json' })
      const result = validateFile(file, {
        allowedExtensions: ['.txt'],
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitida')
    })

    it('should validate file with all custom options', () => {
      const file = new File(['data'], 'file.json', { type: 'application/json' })
      const result = validateFile(file, {
        maxSize: 10000,
        allowedTypes: ['application/json'],
        allowedExtensions: ['.json'],
      })

      expect(result.valid).toBe(true)
      expect(result.details?.size).toBe(4)
      expect(result.details?.maxSize).toBe(10000)
      expect(result.details?.type).toBe('application/json')
      expect(result.details?.extension).toBe('.json')
    })

    it('should skip MIME validation when not specified', () => {
      const file = new File(['data'], 'file.txt', { type: 'application/unknown' })
      const result = validateFile(file, {
        allowedExtensions: ['.txt'],
      })

      expect(result.valid).toBe(true)
    })

    it('should skip extension validation when not specified', () => {
      const file = new File(['data'], 'file.unknown', { type: 'text/plain' })
      const result = validateFile(file, {
        allowedTypes: ['text/plain'],
      })

      expect(result.valid).toBe(true)
    })
  })

  describe('ALLOWED_MIME_TYPES', () => {
    it('should have CSV MIME types defined', () => {
      expect(ALLOWED_MIME_TYPES.CSV).toContain('text/csv')
      expect(ALLOWED_MIME_TYPES.CSV).toContain('application/csv')
      expect(ALLOWED_MIME_TYPES.CSV).toContain('text/plain')
    })

    it('should have PDF MIME types defined', () => {
      expect(ALLOWED_MIME_TYPES.PDF).toContain('application/pdf')
    })

    it('should have IMAGE MIME types defined', () => {
      expect(ALLOWED_MIME_TYPES.IMAGE).toContain('image/jpeg')
      expect(ALLOWED_MIME_TYPES.IMAGE).toContain('image/png')
      expect(ALLOWED_MIME_TYPES.IMAGE).toContain('image/gif')
      expect(ALLOWED_MIME_TYPES.IMAGE).toContain('image/webp')
    })

    it('should have DOCUMENT MIME types defined', () => {
      expect(ALLOWED_MIME_TYPES.DOCUMENT).toContain('application/pdf')
      expect(ALLOWED_MIME_TYPES.DOCUMENT).toContain('application/msword')
    })
  })

  describe('ALLOWED_EXTENSIONS', () => {
    it('should have CSV extensions defined', () => {
      expect(ALLOWED_EXTENSIONS.CSV).toContain('.csv')
      expect(ALLOWED_EXTENSIONS.CSV).toContain('.txt')
    })

    it('should have PDF extensions defined', () => {
      expect(ALLOWED_EXTENSIONS.PDF).toContain('.pdf')
    })

    it('should have IMAGE extensions defined', () => {
      expect(ALLOWED_EXTENSIONS.IMAGE).toContain('.jpg')
      expect(ALLOWED_EXTENSIONS.IMAGE).toContain('.jpeg')
      expect(ALLOWED_EXTENSIONS.IMAGE).toContain('.png')
      expect(ALLOWED_EXTENSIONS.IMAGE).toContain('.gif')
      expect(ALLOWED_EXTENSIONS.IMAGE).toContain('.webp')
    })

    it('should have DOCUMENT extensions defined', () => {
      expect(ALLOWED_EXTENSIONS.DOCUMENT).toContain('.pdf')
      expect(ALLOWED_EXTENSIONS.DOCUMENT).toContain('.doc')
      expect(ALLOWED_EXTENSIONS.DOCUMENT).toContain('.docx')
    })
  })
})
