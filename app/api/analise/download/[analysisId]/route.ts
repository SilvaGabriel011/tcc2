import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const analysisId = params.analysisId

    // Buscar análise garantindo propriedade do projeto pelo usuário
    const analysis = await prisma.dataset.findFirst({
      where: {
        id: analysisId,
        project: {
          ownerId: session.user.id
        }
      }
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 })
    }

    const data = JSON.parse(analysis.data)
    const metadata = analysis.metadata ? JSON.parse(analysis.metadata) : {}

    if (format === 'csv') {
      // Gerar CSV
      const csvData = data.rawData || []
      const csv = Papa.unparse(csvData)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${analysis.name.replace(/[^a-z0-9]/gi, '_')}.csv"`
        }
      })
    } else if (format === 'pdf') {
      // Para PDF, vamos retornar os dados para o frontend gerar
      // Isso é melhor porque jsPDF funciona melhor no cliente
      return NextResponse.json({
        success: true,
        analysis: {
          name: analysis.name,
          createdAt: analysis.createdAt,
          data,
          metadata
        }
      })
    }

    return NextResponse.json({ error: 'Formato não suportado' }, { status: 400 })

  } catch (error) {
    console.error('Erro ao fazer download:', error)
    return NextResponse.json(
      { error: 'Erro ao processar download' },
      { status: 500 }
    )
  }
}
