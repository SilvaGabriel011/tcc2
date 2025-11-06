/**
 * Data Archival Service
 * 
 * Handles archiving old data to S3 for cost optimization.
 */

import { prisma } from '@/lib/prisma'
import { S3ArchivalService } from '@/lib/archival/s3-client'
import { ARCHIVAL_RULES } from '@/lib/archival/rules'
import { logger } from '@/lib/logger'

export class ArchivalService {
  private s3: S3ArchivalService

  constructor() {
    this.s3 = new S3ArchivalService()
  }

  /**
   * Check if archival is enabled
   */
  isEnabled(): boolean {
    return this.s3.isEnabled()
  }

  /**
   * Archive old datasets to S3
   */
  async archiveDatasets(dryRun = false): Promise<{
    archived: number
    errors: number
  }> {
    if (!this.isEnabled()) {
      logger.warn('S3 archival not enabled, skipping dataset archival')
      return { archived: 0, errors: 0 }
    }

    const rule = ARCHIVAL_RULES.find(r => r.table === 'datasets' && r.ageThreshold === 90)
    if (!rule) return { archived: 0, errors: 0 }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - rule.ageThreshold)

    const datasets = await prisma.dataset.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        archivedToS3: false,
        ...(rule.conditions || {}),
      },
      take: 100,
    })

    logger.info(`Found ${datasets.length} datasets to archive`)

    let archived = 0
    let errors = 0

    for (const dataset of datasets) {
      try {
        if (dryRun) {
          logger.info(`[DRY RUN] Would archive dataset ${dataset.id}`)
          continue
        }

        const s3Key = `datasets/${dataset.projectId}/${dataset.id}.json`

        const data = {
          id: dataset.id,
          name: dataset.name,
          filename: dataset.filename,
          data: dataset.data,
          metadata: dataset.metadata,
          createdAt: dataset.createdAt,
          updatedAt: dataset.updatedAt,
        }

        await this.s3.archiveData(s3Key, data, 'STANDARD')

        await prisma.dataset.update({
          where: { id: dataset.id },
          data: {
            archivedAt: new Date(),
            archivedToS3: true,
            s3Key,
            s3StorageClass: 'STANDARD',
            data: JSON.stringify({ archived: true, s3Key }),
          },
        })

        archived++
        logger.success(`Archived dataset ${dataset.id} to S3`)
      } catch (error) {
        errors++
        logger.error(`Failed to archive dataset ${dataset.id}`, error)
      }
    }

    return { archived, errors }
  }

  /**
   * Retrieve archived dataset from S3
   */
  async retrieveDataset(datasetId: string): Promise<any> {
    if (!this.isEnabled()) {
      throw new Error('S3 archival not enabled')
    }

    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
      select: { archivedToS3: true, s3Key: true },
    })

    if (!dataset?.archivedToS3 || !dataset.s3Key) {
      throw new Error('Dataset not archived or S3 key missing')
    }

    return await this.s3.retrieveData(dataset.s3Key)
  }

  /**
   * Archive old audit logs
   */
  async archiveAuditLogs(dryRun = false): Promise<{
    archived: number
    errors: number
  }> {
    if (!this.isEnabled()) {
      logger.warn('S3 archival not enabled, skipping audit log archival')
      return { archived: 0, errors: 0 }
    }

    const rule = ARCHIVAL_RULES.find(r => r.table === 'audit_logs' && r.ageThreshold === 30)
    if (!rule) return { archived: 0, errors: 0 }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - rule.ageThreshold)

    const logs = await prisma.auditLog.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        archivedToS3: false,
      },
      take: 1000,
    })

    logger.info(`Found ${logs.length} audit logs to archive`)

    let archived = 0
    let errors = 0

    const logsByUser = logs.reduce((acc, log) => {
      if (!acc[log.userId]) acc[log.userId] = []
      acc[log.userId].push(log)
      return acc
    }, {} as Record<string, typeof logs>)

    for (const [userId, userLogs] of Object.entries(logsByUser)) {
      try {
        if (dryRun) {
          logger.info(`[DRY RUN] Would archive ${userLogs.length} logs for user ${userId}`)
          continue
        }

        const timestamp = new Date().toISOString().split('T')[0]
        const s3Key = `audit-logs/${userId}/${timestamp}.json`

        await this.s3.archiveData(s3Key, userLogs, 'STANDARD')

        await prisma.auditLog.updateMany({
          where: {
            id: { in: userLogs.map(l => l.id) },
          },
          data: {
            archivedAt: new Date(),
            archivedToS3: true,
            s3Key,
          },
        })

        archived += userLogs.length
        logger.success(`Archived ${userLogs.length} logs for user ${userId}`)
      } catch (error) {
        errors += userLogs.length
        logger.error(`Failed to archive logs for user ${userId}`, error)
      }
    }

    return { archived, errors }
  }

  /**
   * Move data to Glacier for long-term storage
   */
  async moveToGlacier(dryRun = false): Promise<{
    moved: number
    errors: number
  }> {
    if (!this.isEnabled()) {
      logger.warn('S3 archival not enabled, skipping Glacier migration')
      return { moved: 0, errors: 0 }
    }

    const rule = ARCHIVAL_RULES.find(r => r.table === 'datasets' && r.ageThreshold === 365)
    if (!rule) return { moved: 0, errors: 0 }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - rule.ageThreshold)

    const datasets = await prisma.dataset.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        archivedToS3: true,
        s3StorageClass: 'STANDARD',
      },
      take: 50,
    })

    logger.info(`Found ${datasets.length} datasets to move to Glacier`)

    let moved = 0
    let errors = 0

    for (const dataset of datasets) {
      try {
        if (dryRun) {
          logger.info(`[DRY RUN] Would move dataset ${dataset.id} to Glacier`)
          continue
        }

        if (!dataset.s3Key) continue

        const data = await this.s3.retrieveData(dataset.s3Key)

        await this.s3.archiveData(dataset.s3Key, data, 'GLACIER_IR')

        await prisma.dataset.update({
          where: { id: dataset.id },
          data: {
            s3StorageClass: 'GLACIER_IR',
          },
        })

        moved++
        logger.success(`Moved dataset ${dataset.id} to Glacier`)
      } catch (error) {
        errors++
        logger.error(`Failed to move dataset ${dataset.id} to Glacier`, error)
      }
    }

    return { moved, errors }
  }
}

export const archivalService = new ArchivalService()
