import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { withRateLimit } from '@/lib/rate-limit'
import { resetPasswordSchema } from '@/lib/validation/schemas'
import { ApiResponse, getRequestId } from '@/lib/api/response'
import { validateRequestBody } from '@/lib/validation/middleware'

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, 'AUTH')
  if (rateLimitResponse) return rateLimitResponse
  
  const requestId = getRequestId(request)
  
  try {
    console.log('🔐 Iniciando processo de reset de senha...')
    
    const validation = await validateRequestBody(request, resetPasswordSchema)
    
    if (!validation.success) {
      console.log('❌ Validação falhou')
      return ApiResponse.validationError(validation.errors!, requestId)
    }
    
    const validatedData = validation.data!
    console.log('📝 Dados validados:', { token: validatedData.token?.substring(0, 10) + '...' })

    const user = await prisma.user.findFirst({
      where: {
        resetToken: validatedData.token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      console.log('❌ Token inválido ou expirado')
      return ApiResponse.unauthorized(
        'Token inválido ou expirado',
        requestId
      )
    }

    console.log('🔐 Gerando hash da nova senha...')
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    console.log('✅ Senha atualizada com sucesso para:', user.email)
    return ApiResponse.success(
      {
        message: 'Senha redefinida com sucesso. Você já pode fazer login.'
      },
      { requestId }
    )

  } catch (error) {
    console.error('❌ Erro no reset de senha:', error)
    return ApiResponse.serverError(
      'Erro ao processar reset de senha',
      error instanceof Error ? error.message : 'Erro desconhecido',
      requestId
    )
  }
}
