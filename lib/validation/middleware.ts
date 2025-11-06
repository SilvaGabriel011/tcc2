import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema } from 'zod'

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: z.ZodError
}

/**
 * Validates request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Validates FormData against a Zod schema
 * Note: File objects are not validated by the schema, only metadata fields
 */
export async function validateFormData<T>(
  formData: FormData,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const data: Record<string, unknown> = {}
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        continue
      }
      data[key] = value
    }
    
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, unknown> = {}
    
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    
    const data = schema.parse(params)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Higher-order function to wrap route handlers with body validation
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, validatedData: T, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const validation = await validateRequestBody(request, schema)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: validation.errors?.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      )
    }
    
    return handler(request, validation.data!, ...args)
  }
}

/**
 * Higher-order function to wrap route handlers with query parameter validation
 */
export function withQueryValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, validatedQuery: T, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const validation = validateQueryParams(request, schema)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameter validation failed',
            details: validation.errors?.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      )
    }
    
    return handler(request, validation.data!, ...args)
  }
}

/**
 * Format Zod errors into a user-friendly structure
 */
export function formatZodErrors(errors: z.ZodError) {
  return errors.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }))
}
