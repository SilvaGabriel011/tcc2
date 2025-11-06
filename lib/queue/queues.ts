import { Queue } from 'bullmq'
import { getRedisConnection } from './connection'

export interface DiagnosticJobData {
  analysisId: string
  userId: string
  datasetName: string
  numericStats: Record<string, unknown>
  categoricalStats: Record<string, unknown>
}

export interface UploadJobData {
  userId: string
  fileName: string
  fileSize: number
  csvData: string
  projectId?: string
  species?: string
  subtype?: string
}

export interface CorrelationJobData {
  analysisId: string
  userId: string
  data: Record<string, unknown>[]
  species: string
  subtype?: string
}

let diagnosticQueue: Queue<DiagnosticJobData> | null = null
let uploadQueue: Queue<UploadJobData> | null = null
let correlationQueue: Queue<CorrelationJobData> | null = null

export function getDiagnosticQueue(): Queue<DiagnosticJobData> {
  if (!diagnosticQueue) {
    const connection = getRedisConnection()
    diagnosticQueue = new Queue<DiagnosticJobData>('diagnostic-generation', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    })
  }
  return diagnosticQueue
}

export function getUploadQueue(): Queue<UploadJobData> {
  if (!uploadQueue) {
    const connection = getRedisConnection()
    uploadQueue = new Queue<UploadJobData>('upload-processing', {
      connection,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 500,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    })
  }
  return uploadQueue
}

export function getCorrelationQueue(): Queue<CorrelationJobData> {
  if (!correlationQueue) {
    const connection = getRedisConnection()
    correlationQueue = new Queue<CorrelationJobData>('correlation-analysis', {
      connection,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 1500,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 500,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    })
  }
  return correlationQueue
}

export async function closeAllQueues(): Promise<void> {
  const queues = [diagnosticQueue, uploadQueue, correlationQueue]
  await Promise.all(
    queues.filter(q => q !== null).map(q => q!.close())
  )
  diagnosticQueue = null
  uploadQueue = null
  correlationQueue = null
}
