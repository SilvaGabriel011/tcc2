import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ErrorHandler, ErrorCodes } from '@/lib/errors'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Iniciando processo de cadastro...')
    
    const body = await request.json()
    console.log('📝 Dados recebidos:', { ...body, password: '[HIDDEN]' })
    
    // Validar dados de entrada
    try {
      const validatedData = signupSchema.parse(body)
      console.log('✅ Dados validados com sucesso')

      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findUnique({
        where: {
          email: validatedData.email
        }
      })

      if (existingUser) {
        const error = ErrorHandler.createError(
          ErrorCodes.AUTH_006,
          { email: validatedData.email },
          'signup'
        )
        ErrorHandler.logError(error)
        return NextResponse.json(
          { 
            error: error.code,
            message: error.userMessage 
          },
          { status: ErrorHandler.getHttpStatus(error.code) }
        )
      }

      // Hash da senha
      console.log('🔐 Gerando hash da senha...')
      const hashedPassword = await bcrypt.hash(validatedData.password, 12)

      // Criar usuário
      console.log('👤 Criando usuário no banco de dados...')
      const user = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: 'USER', // Novos usuários são criados como USER por padrão
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      })

      console.log('✅ Usuário criado com sucesso:', user.id)
      return NextResponse.json({
        success: true,
        message: 'Usuário criado com sucesso',
        user
      }, { status: 201 })

    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const error = ErrorHandler.createError(
          ErrorCodes.VAL_002,
          { errors: validationError.errors },
          'signup-validation'
        )
        ErrorHandler.logError(error)
        return NextResponse.json({
          error: error.code,
          message: error.userMessage,
          details: validationError.errors
        }, { status: ErrorHandler.getHttpStatus(error.code) })
      }
      throw validationError
    }

  } catch (error) {
    console.error('❌ Erro no cadastro:', error)
    
    // Verificar se é erro de banco de dados
    if (error instanceof Error && error.message.includes('database')) {
      const dbError = ErrorHandler.createError(
        ErrorCodes.DB_001,
        { originalError: error.message },
        'signup-database'
      )
      ErrorHandler.logError(dbError)
      return NextResponse.json(
        { 
          error: dbError.code,
          message: dbError.userMessage 
        },
        { status: ErrorHandler.getHttpStatus(dbError.code) }
      )
    }

    const genericError = ErrorHandler.createError(
      ErrorCodes.API_005,
      { originalError: error instanceof Error ? error.message : 'Unknown error' },
      'signup-generic'
    )
    ErrorHandler.logError(genericError)
    return NextResponse.json(
      { 
        error: genericError.code,
        message: genericError.userMessage 
      },
      { status: ErrorHandler.getHttpStatus(genericError.code) }
    )
  }
}
