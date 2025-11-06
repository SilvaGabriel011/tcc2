/**
 * Archival Cron Job API
 * 
 * Runs daily to archive old data to S3.
 * 
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/archive",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { archivalService } from '@/services/archival.service'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!archivalService.isEnabled()) {
      return NextResponse.json({
        success: false,
        message: 'S3 archival not configured',
        archived: 0,
        errors: 0,
      })
    }

    const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true'

    const [datasetsResult, logsResult, glacierResult] = await Promise.all([
      archivalService.archiveDatasets(dryRun),
      archivalService.archiveAuditLogs(dryRun),
      archivalService.moveToGlacier(dryRun),
    ])

    const totalArchived = datasetsResult.archived + logsResult.archived
    const totalErrors = datasetsResult.errors + logsResult.errors

    return NextResponse.json({
      success: true,
      dryRun,
      timestamp: new Date().toISOString(),
      results: {
        datasets: datasetsResult,
        auditLogs: logsResult,
        glacier: glacierResult,
      },
      summary: {
        totalArchived,
        totalErrors,
        glacierMoved: glacierResult.moved,
      },
    })
  } catch (error) {
    console.error('❌ Archival cron job failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
