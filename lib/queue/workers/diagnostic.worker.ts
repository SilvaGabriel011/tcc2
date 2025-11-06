import { Worker, Job } from 'bullmq'
import { getRedisConnection } from '../connection'
import { DiagnosticJobData } from '../queues'
import { prisma } from '@/lib/prisma'
import { gerarDiagnosticoLocal } from '@/lib/diagnostico-local'
import type { NumericStats } from '@/types/api'

export function createDiagnosticWorker() {
  const connection = getRedisConnection()

  const worker = new Worker<DiagnosticJobData>(
    'diagnostic-generation',
    async (job: Job<DiagnosticJobData>) => {
      const { analysisId, datasetName, numericStats, categoricalStats } = job.data

      console.log(`🔬 Processing diagnostic job ${job.id} for analysis ${analysisId}`)

      try {
        await job.updateProgress(10)

        const analysis = await prisma.dataset.findUnique({
          where: { id: analysisId },
        })

        if (!analysis) {
          throw new Error(`Analysis ${analysisId} not found`)
        }

        await job.updateProgress(30)

        const metaObj = analysis.metadata ? JSON.parse(analysis.metadata) as Record<string, unknown> : {}
        const totalRows = (metaObj.totalRows as number) || 0

        const diagnostico = gerarDiagnosticoLocal(
          numericStats as Record<string, NumericStats>,
          categoricalStats as Record<string, unknown>,
          datasetName,
          totalRows
        )

        await job.updateProgress(70)

        await prisma.dataset.update({
          where: { id: analysisId },
          data: {
            metadata: JSON.stringify({
              ...metaObj,
              diagnostico,
              diagnosticoGeneratedAt: new Date().toISOString(),
            }),
          },
        })

        await job.updateProgress(100)

        console.log(`✅ Diagnostic generated for analysis ${analysisId}`)

        return {
          success: true,
          analysisId,
          diagnostico,
        }
      } catch (error) {
        console.error(`❌ Error generating diagnostic for ${analysisId}:`, error)
        throw error
      }
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 10,
        duration: 60000,
      },
    }
  )

  worker.on('completed', (job) => {
    console.log(`✅ Diagnostic job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`❌ Diagnostic job ${job?.id} failed:`, err)
  })

  worker.on('error', (err) => {
    console.error('❌ Diagnostic worker error:', err)
  })

  return worker
}
