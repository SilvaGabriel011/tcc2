import { ErrorCodes, ErrorHandler } from '@/lib/errors'

describe('errors', () => {
  describe('ErrorHandler.createError', () => {
    it('should create error with code and messages', () => {
      const error = ErrorHandler.createError(ErrorCodes.AUTH_001)
      
      expect(error.code).toBe(ErrorCodes.AUTH_001)
      expect(error.message).toBeDefined()
      expect(error.userMessage).toBeDefined()
      expect(error.timestamp).toBeDefined()
    })

    it('should include details when provided', () => {
      const details = { email: 'test@example.com' }
      const error = ErrorHandler.createError(ErrorCodes.AUTH_002, details)
      
      expect(error.details).toEqual(details)
    })

    it('should include context when provided', () => {
      const context = 'authorize'
      const error = ErrorHandler.createError(ErrorCodes.AUTH_001, undefined, context)
      
      expect(error.context).toBe(context)
    })

    it('should generate ISO timestamp', () => {
      const error = ErrorHandler.createError(ErrorCodes.AUTH_001)
      
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should have different technical and user messages', () => {
      const error = ErrorHandler.createError(ErrorCodes.AUTH_001)
      
      expect(error.message).not.toBe(error.userMessage)
      expect(error.userMessage).toContain('Email ou senha')
    })
  })

  describe('ErrorHandler.logError', () => {
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should log error to console', () => {
      const error = ErrorHandler.createError(ErrorCodes.AUTH_001)
      ErrorHandler.logError(error)
      
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should include error code in log', () => {
      const error = ErrorHandler.createError(ErrorCodes.AUTH_001)
      ErrorHandler.logError(error)
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AUTH-001]'),
        expect.any(Object)
      )
    })

    it('should include error message in log', () => {
      const error = ErrorHandler.createError(ErrorCodes.AUTH_001)
      ErrorHandler.logError(error)
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid credentials'),
        expect.any(Object)
      )
    })

    it('should include timestamp in log details', () => {
      const error = ErrorHandler.createError(ErrorCodes.AUTH_001)
      ErrorHandler.logError(error)
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ timestamp: error.timestamp })
      )
    })

    it('should include context in log details when provided', () => {
      const error = ErrorHandler.createError(ErrorCodes.AUTH_001, undefined, 'testFunction')
      ErrorHandler.logError(error)
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ context: 'testFunction' })
      )
    })
  })

  describe('ErrorHandler.getHttpStatus', () => {
    it('should return 401 for AUTH errors', () => {
      expect(ErrorHandler.getHttpStatus(ErrorCodes.AUTH_001)).toBe(401)
      expect(ErrorHandler.getHttpStatus(ErrorCodes.AUTH_002)).toBe(401)
      expect(ErrorHandler.getHttpStatus(ErrorCodes.AUTH_003)).toBe(401)
    })

    it('should return 403 for PERM errors', () => {
      expect(ErrorHandler.getHttpStatus(ErrorCodes.PERM_001)).toBe(403)
      expect(ErrorHandler.getHttpStatus(ErrorCodes.PERM_002)).toBe(403)
    })

    it('should return 500 for DB errors', () => {
      expect(ErrorHandler.getHttpStatus(ErrorCodes.DB_001)).toBe(500)
      expect(ErrorHandler.getHttpStatus(ErrorCodes.DB_002)).toBe(500)
    })

    it('should return 400 for UPLOAD errors', () => {
      expect(ErrorHandler.getHttpStatus(ErrorCodes.UPLOAD_001)).toBe(400)
      expect(ErrorHandler.getHttpStatus(ErrorCodes.UPLOAD_002)).toBe(400)
    })

    it('should return 400 for API errors', () => {
      expect(ErrorHandler.getHttpStatus(ErrorCodes.API_001)).toBe(400)
      expect(ErrorHandler.getHttpStatus(ErrorCodes.API_002)).toBe(400)
    })

    it('should return 400 for VAL errors', () => {
      expect(ErrorHandler.getHttpStatus(ErrorCodes.VAL_001)).toBe(400)
      expect(ErrorHandler.getHttpStatus(ErrorCodes.VAL_002)).toBe(400)
    })
  })

  describe('ErrorCodes enum', () => {
    it('should have AUTH error codes', () => {
      expect(ErrorCodes.AUTH_001).toBe('AUTH-001')
      expect(ErrorCodes.AUTH_002).toBe('AUTH-002')
      expect(ErrorCodes.AUTH_006).toBe('AUTH-006')
    })

    it('should have DB error codes', () => {
      expect(ErrorCodes.DB_001).toBe('DB-001')
      expect(ErrorCodes.DB_002).toBe('DB-002')
    })

    it('should have UPLOAD error codes', () => {
      expect(ErrorCodes.UPLOAD_001).toBe('UPLOAD-001')
      expect(ErrorCodes.UPLOAD_002).toBe('UPLOAD-002')
    })

    it('should have API error codes', () => {
      expect(ErrorCodes.API_001).toBe('API-001')
      expect(ErrorCodes.API_002).toBe('API-002')
    })

    it('should have PERM error codes', () => {
      expect(ErrorCodes.PERM_001).toBe('PERM-001')
      expect(ErrorCodes.PERM_002).toBe('PERM-002')
    })

    it('should have VAL error codes', () => {
      expect(ErrorCodes.VAL_001).toBe('VAL-001')
      expect(ErrorCodes.VAL_002).toBe('VAL-002')
    })
  })

  describe('Error messages', () => {
    it('should have Portuguese user messages', () => {
      const authError = ErrorHandler.createError(ErrorCodes.AUTH_001)
      expect(authError.userMessage).toContain('Email ou senha')
      
      const dbError = ErrorHandler.createError(ErrorCodes.DB_001)
      expect(dbError.userMessage).toContain('Erro de conexão')
      
      const uploadError = ErrorHandler.createError(ErrorCodes.UPLOAD_001)
      expect(uploadError.userMessage).toContain('Nenhum arquivo')
    })

    it('should have English technical messages', () => {
      const authError = ErrorHandler.createError(ErrorCodes.AUTH_001)
      expect(authError.message).toContain('Invalid credentials')
      
      const dbError = ErrorHandler.createError(ErrorCodes.DB_001)
      expect(dbError.message).toContain('Database connection')
    })

    it('should provide actionable user messages', () => {
      const authError = ErrorHandler.createError(ErrorCodes.AUTH_006)
      expect(authError.userMessage).toContain('Tente fazer login')
      
      const uploadError = ErrorHandler.createError(ErrorCodes.UPLOAD_002)
      expect(uploadError.userMessage).toContain('Apenas arquivos CSV')
    })
  })

  describe('Error workflow', () => {
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should support complete error handling workflow', () => {
      const error = ErrorHandler.createError(
        ErrorCodes.AUTH_002,
        { email: 'test@example.com' },
        'authorize'
      )
      
      ErrorHandler.logError(error)
      const status = ErrorHandler.getHttpStatus(error.code)
      
      expect(error.code).toBe(ErrorCodes.AUTH_002)
      expect(status).toBe(401)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
