/**
 * User Sign Up API Route
 * 
 * Endpoint: POST /api/auth/signup
 * 
 * This route handles new user registration with:
 * - Input validation using Zod schema
 * - Email uniqueness checking
 * - Password hashing with bcrypt
 * - User creation in database
 * - Structured error handling
 * 
 * Request body:
 * ```json
 * {
 *   "name": "João Silva",
 *   "email": "joao@example.com",
 *   "password": "securePassword123"
 * }
 * ```
 * 
 * Success response (201):
 * ```json
 * {
 *   "success": true,
 *   "message": "Usuário criado com sucesso",
 *   "user": { "id": "...", "name": "...", "email": "...", "role": "USER", "createdAt": "..." }
 * }
 * ```
 * 
 * Error responses:
 * - 400: Validation error or user already exists
 * - 500: Database or server error
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { withRateLimit } from '@/lib/rate-limit'
import { signupSchema } from '@/lib/validation/schemas'
import { ApiResponse, getRequestId } from '@/lib/api/response'
import { validateRequestBody } from '@/lib/validation/middleware'

/**
 * POST handler for user registration
 * 
 * Process:
 * 1. Validate request body against schema
 * 2. Check if user with email already exists
 * 3. Hash password with bcrypt (12 rounds)
 * 4. Create user in database with USER role
 * 5. Return user data (excluding password)
 * 
 * @param request - Next.js request object containing user data
 * @returns JSON response with created user or error
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting for authentication endpoints
  const rateLimitResponse = await withRateLimit(request, 'AUTH')
  if (rateLimitResponse) return rateLimitResponse
  
  const requestId = getRequestId(request)
  
  try {
    console.log('📝 Iniciando processo de cadastro...')
    
    // Step 1: Validate input data against schema
    const validation = await validateRequestBody(request, signupSchema)
    
    if (!validation.success) {
      console.log('❌ Validação falhou')
      return ApiResponse.validationError(validation.errors!, requestId)
    }
    
    const validatedData = validation.data!
    console.log('✅ Dados validados com sucesso')

    // Step 2: Check if user with this email already exists
    // This prevents duplicate accounts and ensures email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (existingUser) {
      console.log('⚠️ Usuário já existe:', validatedData.email)
      return ApiResponse.conflict(
        'Usuário já existe com este email',
        { email: validatedData.email },
        requestId
      )
    }

    // Step 3: Hash the password using bcrypt
    // Salt rounds: 12 (balance between security and performance)
    console.log('🔐 Gerando hash da senha...')
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Step 4: Create new user in database
    console.log('👤 Criando usuário no banco de dados...')
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'USER',  // All new users start with USER role (not ADMIN)
      },
      select: {
        // Select only safe fields to return (exclude password hash)
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    console.log('✅ Usuário criado com sucesso:', user.id)
    
    // Step 5: Return success response with user data
    return ApiResponse.created(
      {
        message: 'Usuário criado com sucesso',
        user
      },
      { requestId }
    )

  } catch (error) {
    // Outer catch block for unexpected errors
    console.error('❌ Erro no cadastro:', error)
    
    // Check if it's a database-related error
    if (error instanceof Error && error.message.includes('database')) {
      return ApiResponse.serverError(
        'Erro ao conectar com o banco de dados',
        error.message,
        requestId
      )
    }

    // Generic error for any other unexpected issues
    return ApiResponse.serverError(
      'Erro interno do servidor',
      error instanceof Error ? error.message : 'Unknown error',
      requestId
    )
  }
}
