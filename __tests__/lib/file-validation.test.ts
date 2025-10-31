/**
 * File Validation Unit Tests
 * 
 * This test suite validates file validation utilities including:
 * - Byte formatting for human-readable file sizes
 * - File size validation against limits
 * - MIME type validation for security
 * - File extension validation
 * - Configuration constants verification
 * 
 * These tests ensure file upload security and proper error handling
 * for the AgroInsight agricultural data platform.
 */

import {
  validateFileSize,
  validateMimeType,
  validateExtension,
  formatBytes,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} from '@/lib/file-validation'

/**
 * Main test suite for file validation functionality
 */
describe('File Validation', () => {
  /**
   * Test suite for formatBytes utility function
   * Verifies proper conversion of bytes to human-readable format
   */
  describe('formatBytes', () => {
    /**
     * Test basic byte formatting for common sizes
     */
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(52428800)).toBe('50 MB')
    })

    /**
     * Test decimal precision in byte formatting
     */
    it('should handle decimals', () => {
      expect(formatBytes(1536, 2)).toBe('1.5 KB')
      expect(formatBytes(5242880, 1)).toBe('5 MB')
    })
  })

  /**
   * Test suite for file size validation
   * Ensures files don't exceed configured limits
   */
  describe('validateFileSize', () => {
    /**
     * Test validation passes for files within size limit
     */
    it('should pass for valid file size', () => {
      const result = validateFileSize(1024, 2048)
      expect(result.valid).toBe(true)
    })

    /**
     * Test validation fails for oversized files
     */
    it('should fail for oversized file', () => {
      const result = validateFileSize(3000, 2048)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('muito grande')
    })

    /**
     * Test that validation provides detailed error information
     */
    it('should provide size details in error', () => {
      const result = validateFileSize(1000000, 50000)
      expect(result.valid).toBe(false)
      expect(result.details?.size).toBe(1000000)
      expect(result.details?.maxSize).toBe(50000)
    })
  })

  /**
   * Test suite for MIME type validation
   * Ensures only allowed file types are accepted for security
   */
  describe('validateMimeType', () => {
    /**
     * Test validation passes for allowed MIME types
     */
    it('should pass for allowed MIME type', () => {
      const result = validateMimeType('text/csv', ALLOWED_MIME_TYPES.CSV)
      expect(result.valid).toBe(true)
    })

    /**
     * Test validation fails for disallowed MIME types
     */
    it('should fail for disallowed MIME type', () => {
      const result = validateMimeType('application/json', ALLOWED_MIME_TYPES.CSV)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitido')
    })
  })

  /**
   * Test suite for file extension validation
   * Provides additional security layer beyond MIME type checking
   */
  describe('validateExtension', () => {
    /**
     * Test validation passes for allowed extensions
     */
    it('should pass for allowed extension', () => {
      const result = validateExtension('data.csv', ALLOWED_EXTENSIONS.CSV)
      expect(result.valid).toBe(true)
    })

    /**
     * Test validation fails for disallowed extensions
     */
    it('should fail for disallowed extension', () => {
      const result = validateExtension('data.json', ALLOWED_EXTENSIONS.CSV)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('não permitida')
    })

    /**
     * Test validation is case insensitive for user convenience
     */
    it('should be case insensitive', () => {
      const result = validateExtension('data.CSV', ALLOWED_EXTENSIONS.CSV)
      expect(result.valid).toBe(true)
    })
  })

  /**
   * Test suite for configuration constants
   * Verifies file size limits are properly configured
   */
  describe('FILE_SIZE_LIMITS', () => {
    /**
     * Test that size limits match expected values
     */
    it('should have correct limits defined', () => {
      expect(FILE_SIZE_LIMITS.CSV).toBe(50 * 1024 * 1024) // 50 MB
      expect(FILE_SIZE_LIMITS.PDF).toBe(10 * 1024 * 1024) // 10 MB
      expect(FILE_SIZE_LIMITS.IMAGE).toBe(5 * 1024 * 1024) // 5 MB
    })
  })
})
