import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { withRateLimit } from '@/lib/rate-limit'
import { forgotPasswordSchema } from '@/lib/validation/schemas'
import { ApiResponse, getRequestId } from '@/lib/api/response'
import { validateRequestBody } from '@/lib/validation/middleware'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, 'AUTH')
  if (rateLimitResponse) return rateLimitResponse
  
  const requestId = getRequestId(request)
  
  try {
    console.log('🔐 Iniciando processo de recuperação de senha...')
    
    const validation = await validateRequestBody(request, forgotPasswordSchema)
    
    if (!validation.success) {
      console.log('❌ Validação falhou')
      return ApiResponse.validationError(validation.errors!, requestId)
    }
    
    const validatedData = validation.data!
    console.log('📝 Dados validados:', { email: validatedData.email })

    const user = await prisma.user.findUnique({
      where: {
        email: validatedData.email
      }
    })

    if (!user) {
      console.log('⚠️ Usuário não encontrado, mas retornando sucesso por segurança')
      return ApiResponse.success(
        {
          message: 'Se o email existir, você receberá um link de recuperação.'
        },
        { requestId }
      )
    }

    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    console.log('🔑 Gerando token de reset...')
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
    console.log('📧 Link de recuperação gerado:')
    console.log('═'.repeat(60))
    console.log(`Para: ${user.email}`)
    console.log(`Link: ${resetLink}`)
    console.log('═'.repeat(60))

    console.log('✅ Token salvo com sucesso')
    return ApiResponse.success(
      {
        message: 'Se o email existir, você receberá um link de recuperação.',
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      },
      { requestId }
    )

  } catch (error) {
    console.error('❌ Erro na recuperação de senha:', error)
    return ApiResponse.serverError(
      'Erro ao processar recuperação de senha',
      error instanceof Error ? error.message : 'Erro desconhecido',
      requestId
    )
  }
}
