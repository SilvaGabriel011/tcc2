import { logger } from '@/lib/logger'

describe('logger extended', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleDebugSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleDebugSpy.mockRestore()
  })

  describe('debug logging', () => {
    it('should call console.debug for debug messages', () => {
      logger.debug('Debug message')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleDebugSpy).toHaveBeenCalled()
        expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('Debug message'), '')
      }
    })

    it('should accept data parameter', () => {
      logger.debug('Debug message', { key: 'value' })

      if (process.env.NODE_ENV === 'development') {
        expect(consoleDebugSpy).toHaveBeenCalled()
      }
    })
  })

  describe('success logging', () => {
    it('should call console.log for success messages', () => {
      logger.success('Success message')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Success message'), '')
      }
    })

    it('should accept data parameter', () => {
      logger.success('Success message', { result: 'ok' })

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
      }
    })
  })

  describe('cache logging', () => {
    it('should log cache hit', () => {
      logger.cache.hit('user:123')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Cache HIT'), '')
      }
    })

    it('should log cache miss', () => {
      logger.cache.miss('user:456')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Cache MISS'), '')
      }
    })

    it('should log cache set', () => {
      logger.cache.set('user:789')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleDebugSpy).toHaveBeenCalled()
        expect(consoleDebugSpy).toHaveBeenCalledWith(expect.stringContaining('Cache SET'), '')
      }
    })

    it('should log cache invalidate', () => {
      logger.cache.invalidate('user:*')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Cache invalidado'), '')
      }
    })
  })

  describe('api logging', () => {
    it('should log API request', () => {
      logger.api.request('GET', '/api/users')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('GET /api/users'), '')
      }
    })

    it('should log API response without duration', () => {
      logger.api.response('POST', '/api/users', 201)

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('POST /api/users - 201'),
          ''
        )
      }
    })

    it('should log API response with duration', () => {
      logger.api.response('GET', '/api/users', 200, 150)

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET /api/users - 200'),
          ''
        )
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('150ms'), '')
      }
    })

    it('should log API error', () => {
      const error = new Error('Connection failed')
      logger.api.error('GET', '/api/users', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/users falhou'),
        error
      )
    })
  })

  describe('db logging', () => {
    it('should log database query', () => {
      logger.db.query('SELECT', 'users')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleDebugSpy).toHaveBeenCalled()
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining('DB SELECT em users'),
          ''
        )
      }
    })

    it('should log database error', () => {
      const error = new Error('Connection timeout')
      logger.db.error('INSERT', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('DB INSERT falhou'),
        error
      )
    })
  })

  describe('auth logging', () => {
    it('should log successful login', () => {
      logger.auth.login('user@example.com')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('Login: user@example.com'),
          ''
        )
      }
    })

    it('should log logout', () => {
      logger.auth.logout('user@example.com')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('Logout: user@example.com'),
          ''
        )
      }
    })

    it('should log failed login', () => {
      logger.auth.failed('user@example.com')

      if (process.env.NODE_ENV === 'development') {
        expect(consoleWarnSpy).toHaveBeenCalled()
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Falha no login: user@example.com'),
          ''
        )
      }
    })
  })

  describe('logging with options', () => {
    it('should accept custom emoji', () => {
      logger.error('Error message', undefined, { emoji: '🔥' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('🔥'), '')
    })

    it('should accept custom prefix', () => {
      logger.error('Error message', undefined, { prefix: '[CUSTOM] ' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[CUSTOM]'), '')
    })

    it('should accept both emoji and prefix', () => {
      logger.error('Error message', undefined, { emoji: '🔥', prefix: '[FIRE] ' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('🔥'), '')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[FIRE]'), '')
    })
  })

  describe('logging with data', () => {
    it('should log with object data', () => {
      logger.error('Error occurred', { userId: '123', action: 'delete' })

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error occurred'), {
        userId: '123',
        action: 'delete',
      })
    })

    it('should log with error object', () => {
      const error = new Error('Something went wrong')
      logger.error('Operation failed', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Operation failed'),
        error
      )
    })

    it('should log with string data', () => {
      logger.error('Error message', 'Additional context')

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message'),
        'Additional context'
      )
    })
  })
})
