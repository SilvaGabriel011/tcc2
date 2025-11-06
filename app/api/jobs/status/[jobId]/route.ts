/**
 * @swagger
 * /api/jobs/status/{jobId}:
 *   get:
 *     summary: Get background job status
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDiagnosticQueue, getUploadQueue, getCorrelationQueue } from '@/lib/queue/queues'
import { ApiResponse, getRequestId } from '@/lib/api/response'
import { Job } from 'bullmq'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const requestId = getRequestId(request)
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return ApiResponse.unauthorized('Não autorizado', requestId)
    }

    const { jobId } = params

    const diagnosticQueue = getDiagnosticQueue()
    const uploadQueue = getUploadQueue()
    const correlationQueue = getCorrelationQueue()

    let job: Job | undefined = await diagnosticQueue.getJob(jobId)
    let queueType = 'diagnostic'

    if (!job) {
      job = await uploadQueue.getJob(jobId)
      queueType = 'upload'
    }

    if (!job) {
      job = await correlationQueue.getJob(jobId)
      queueType = 'correlation'
    }

    if (!job) {
      return ApiResponse.notFound('Job não encontrado', requestId)
    }

    const state = await job.getState()
    const progress = job.progress
    const returnValue = job.returnvalue
    const failedReason = job.failedReason

    return ApiResponse.success(
      {
        jobId: job.id,
        queueType,
        state,
        progress,
        data: job.data,
        result: returnValue,
        error: failedReason,
        createdAt: new Date(job.timestamp).toISOString(),
        processedAt: job.processedOn ? new Date(job.processedOn).toISOString() : null,
        finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
      },
      { requestId }
    )
  } catch (error) {
    console.error('❌ Error fetching job status:', error)
    return ApiResponse.serverError(
      'Erro ao buscar status do job',
      error instanceof Error ? error.message : 'Erro desconhecido',
      requestId
    )
  }
}
