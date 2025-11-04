/**
 * Layman Annotations API
 * GET /api/layman/annotations/{entityId}?view=layman|technical
 * 
 * Retrieves annotation for an entity in layman or technical view
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { LaymanViewResponse } from '@/lib/layman/types'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { entityId: string } }
) {
  try {
    // Authenticate
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { entityId } = params
    const searchParams = request.nextUrl.searchParams
    const view = searchParams.get('view') || 'layman'

    // TODO: Load from database based on view (layman vs technical)
    // For now, return mock data
    console.log(`Fetching annotation for ${entityId} in ${view} mode`)
    const mockResponse: LaymanViewResponse = {
      entity_id: entityId,
      final_color: 'yellow',
      short_label: 'ok',
      annotation: {
        mode: 'composition_metadata',
        composition_metadata: null
      },
      metric_summaries: [],
      legend: [
        { color: 'red', meaning: 'Ruim — ação necessária' },
        { color: 'yellow', meaning: 'Ok — monitorar' },
        { color: 'green', meaning: 'Ótimo — sem ação' }
      ],
      technical_view_url: null,
      thresholds_version: 'v2025-11-04-01'
    }

    return NextResponse.json(mockResponse, { status: 200 })
  } catch (error) {
    console.error('Error in layman annotations:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar anotação' },
      { status: 500 }
    )
  }
}
