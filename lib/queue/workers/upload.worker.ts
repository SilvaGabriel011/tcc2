import { Worker, Job } from 'bullmq'
import { getRedisConnection } from '../connection'
import { UploadJobData } from '../queues'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'
import { analyzeDataset } from '@/lib/dataAnalysis'

export function createUploadWorker() {
  const connection = getRedisConnection()

  const worker = new Worker<UploadJobData>(
    'upload-processing',
    async (job: Job<UploadJobData>) => {
      const { userId, fileName, csvData, projectId, species, subtype } = job.data

      console.log(`📤 Processing upload job ${job.id} for user ${userId}`)

      try {
        await job.updateProgress(10)

        const parseResult = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        })

        if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
          throw new Error('Failed to parse CSV: ' + parseResult.errors[0].message)
        }

        await job.updateProgress(30)

        const analysisResult = analyzeDataset(parseResult.data)

        await job.updateProgress(60)

        let project = null
        if (projectId) {
          project = await prisma.project.findUnique({
            where: { id: projectId },
          })
        }

        if (!project) {
          project = await prisma.project.create({
            data: {
              name: `Projeto - ${fileName}`,
              ownerId: userId,
            },
          })
        }

        await job.updateProgress(80)

        const analysis = await prisma.dataset.create({
          data: {
            projectId: project.id,
            name: fileName,
            filename: fileName,
            status: 'COMPLETED',
            data: parseResult.data.slice(0, 100),
            metadata: {
              totalRows: analysisResult.totalRows,
              totalColumns: analysisResult.totalColumns,
              variablesInfo: analysisResult.variablesInfo,
              numericStats: analysisResult.numericStats,
              categoricalStats: analysisResult.categoricalStats,
              species,
              subtype,
              uploadedAt: new Date().toISOString(),
            },
          },
        })

        await job.updateProgress(100)

        console.log(`✅ Upload processed for analysis ${analysis.id}`)

        return {
          success: true,
          analysisId: analysis.id,
          totalRows: analysisResult.totalRows,
          totalColumns: analysisResult.totalColumns,
        }
      } catch (error) {
        console.error(`❌ Error processing upload job ${job.id}:`, error)
        throw error
      }
    },
    {
      connection,
      concurrency: 3,
      limiter: {
        max: 5,
        duration: 60000,
      },
    }
  )

  worker.on('completed', (job) => {
    console.log(`✅ Upload job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`❌ Upload job ${job?.id} failed:`, err)
  })

  worker.on('error', (err) => {
    console.error('❌ Upload worker error:', err)
  })

  return worker
}
