import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Standard API response structure
 */
export interface StandardApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId?: string
    cached?: boolean
  }
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Paginated response structure
 */
export interface PaginatedApiResponse<T> extends StandardApiResponse<T[]> {
  pagination?: PaginationMeta
}

/**
 * Response builder class for consistent API responses
 */
export class ApiResponse {
  /**
   * Success response
   */
  static success<T>(
    data: T,
    options?: {
      message?: string
      cached?: boolean
      requestId?: string
      status?: number
    }
  ): NextResponse<StandardApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          cached: options?.cached,
          requestId: options?.requestId,
        },
      },
      { status: options?.status || 200 }
    )
  }

  /**
   * Success response with pagination
   */
  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    options?: {
      cached?: boolean
      requestId?: string
    }
  ): NextResponse<PaginatedApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      pagination,
      meta: {
        timestamp: new Date().toISOString(),
        cached: options?.cached,
        requestId: options?.requestId,
      },
    })
  }

  /**
   * Error response
   */
  static error(
    code: string,
    message: string,
    options?: {
      details?: unknown
      status?: number
      requestId?: string
    }
  ): NextResponse<StandardApiResponse<never>> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          details: options?.details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: options?.requestId,
        },
      },
      { status: options?.status || 400 }
    )
  }

  /**
   * Validation error response
   */
  static validationError(
    errors: z.ZodError,
    requestId?: string
  ): NextResponse<StandardApiResponse<never>> {
    return this.error(
      'VALIDATION_ERROR',
      'Request validation failed',
      {
        details: errors.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
        status: 400,
        requestId,
      }
    )
  }

  /**
   * Unauthorized error
   */
  static unauthorized(
    message = 'Unauthorized',
    requestId?: string
  ): NextResponse<StandardApiResponse<never>> {
    return this.error('UNAUTHORIZED', message, {
      status: 401,
      requestId,
    })
  }

  /**
   * Forbidden error
   */
  static forbidden(
    message = 'Forbidden',
    requestId?: string
  ): NextResponse<StandardApiResponse<never>> {
    return this.error('FORBIDDEN', message, {
      status: 403,
      requestId,
    })
  }

  /**
   * Not found error
   */
  static notFound(
    resource: string,
    requestId?: string
  ): NextResponse<StandardApiResponse<never>> {
    return this.error(
      'NOT_FOUND',
      `${resource} not found`,
      {
        status: 404,
        requestId,
      }
    )
  }

  /**
   * Conflict error
   */
  static conflict(
    message: string,
    details?: unknown,
    requestId?: string
  ): NextResponse<StandardApiResponse<never>> {
    return this.error('CONFLICT', message, {
      details,
      status: 409,
      requestId,
    })
  }

  /**
   * Rate limit exceeded error
   */
  static rateLimitExceeded(
    retryAfter?: number,
    requestId?: string
  ): NextResponse<StandardApiResponse<never>> {
    const response = this.error(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests',
      {
        details: retryAfter ? { retryAfter } : undefined,
        status: 429,
        requestId,
      }
    )

    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString())
    }

    return response
  }

  /**
   * Internal server error
   */
  static serverError(
    message = 'Internal server error',
    details?: unknown,
    requestId?: string
  ): NextResponse<StandardApiResponse<never>> {
    if (process.env.NODE_ENV === 'development') {
      console.error('Server Error:', { message, details })
    }

    return this.error('INTERNAL_ERROR', message, {
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      status: 500,
      requestId,
    })
  }

  /**
   * Bad request error
   */
  static badRequest(
    message: string,
    details?: unknown,
    requestId?: string
  ): NextResponse<StandardApiResponse<never>> {
    return this.error('BAD_REQUEST', message, {
      details,
      status: 400,
      requestId,
    })
  }

  /**
   * Created response (201)
   */
  static created<T>(
    data: T,
    options?: {
      message?: string
      requestId?: string
    }
  ): NextResponse<StandardApiResponse<T>> {
    return this.success(data, {
      ...options,
      status: 201,
    })
  }

  /**
   * No content response (204)
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }

  /**
   * Accepted response (202) - for async operations
   */
  static accepted<T>(
    data: T,
    options?: {
      message?: string
      requestId?: string
    }
  ): NextResponse<StandardApiResponse<T>> {
    return this.success(data, {
      ...options,
      status: 202,
    })
  }
}

/**
 * Helper to generate request IDs
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Helper to extract request ID from headers or generate new one
 */
export function getRequestId(request: Request): string {
  return request.headers.get('x-request-id') || generateRequestId()
}
