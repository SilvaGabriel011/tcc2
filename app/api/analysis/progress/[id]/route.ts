/**
 * Analysis Progress API Endpoint
 *
 * GET /api/analysis/progress/[id]
 * Returns the current progress state for an analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProgress } from '@/lib/progress/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const analysisId = params.id

    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
    }

    const progress = await getProgress(analysisId)

    if (!progress) {
      return NextResponse.json({ error: 'Progress not found' }, { status: 404 })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
