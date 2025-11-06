/**
 * Archive Retrieval API
 * 
 * Retrieves archived data from S3.
 */

import { NextRequest, NextResponse } from 'next/server'
import { archivalService } from '@/services/archival.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!archivalService.isEnabled()) {
      return NextResponse.json(
        { error: 'S3 archival not configured' },
        { status: 503 }
      )
    }

    const datasetId = request.nextUrl.searchParams.get('datasetId')

    if (!datasetId) {
      return NextResponse.json(
        { error: 'datasetId parameter required' },
        { status: 400 }
      )
    }

    const data = await archivalService.retrieveDataset(datasetId)

    return NextResponse.json({
      success: true,
      datasetId,
      data,
      retrievedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Failed to retrieve archived data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
