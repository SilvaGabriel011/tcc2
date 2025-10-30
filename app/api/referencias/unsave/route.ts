import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL do artigo é obrigatória' }, { status: 400 })
    }

    // Remover artigo salvo
    const deletedArticle = await prisma.savedReference.deleteMany({
      where: {
        userId: session.user.id,
        url: url
      }
    })

    if (deletedArticle.count === 0) {
      return NextResponse.json({ 
        error: 'Artigo não encontrado ou não pertence ao usuário' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Artigo removido da biblioteca com sucesso!'
    })

  } catch (error) {
    console.error('Erro ao remover artigo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
