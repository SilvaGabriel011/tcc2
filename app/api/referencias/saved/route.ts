import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar artigos salvos do usuário
    const savedReferences = await prisma.savedReference.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Converter para formato esperado pelo frontend
    const articles = savedReferences.map(ref => {
      const content = JSON.parse(ref.content || '{}')
      return {
        id: ref.id,
        title: ref.title,
        authors: content.authors || [],
        abstract: content.abstract || '',
        year: content.year || new Date().getFullYear(),
        journal: content.journal || '',
        url: ref.url || '',
        source: content.source || 'unknown',
        saved: true
      }
    })

    return NextResponse.json({
      success: true,
      articles,
      total: articles.length
    })

  } catch (error) {
    console.error('Erro ao buscar artigos salvos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
