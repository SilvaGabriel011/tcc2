// app/api/reference/species/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/reference/species
 * Lista todas as espécies disponíveis com seus subtipos
 */
export async function GET() {
  try {
    // Buscar todas as espécies com seus subtipos
    const species = await prisma.animalSpecies.findMany({
      include: {
        subtypes: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true
          },
          orderBy: {
            name: 'asc'
          }
        },
        _count: {
          select: {
            references: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Formatar resposta
    const formattedSpecies = species.map(sp => ({
      id: sp.id,
      code: sp.code,
      name: sp.name,
      hasSubtypes: sp.hasSubtypes,
      subtypes: sp.subtypes,
      referenceCount: sp._count.references
    }))

    return NextResponse.json({
      success: true,
      data: formattedSpecies,
      count: formattedSpecies.length
    })
    
  } catch (error) {
    console.error('Erro ao buscar espécies:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar espécies'
      },
      { status: 500 }
    )
  }
}
