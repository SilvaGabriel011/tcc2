/**
 * Data Archival Rules Configuration
 * 
 * Defines rules for archiving data to S3 based on age and conditions.
 */

export interface ArchivalRule {
  table: string
  ageThreshold: number
  storageClass: 'S3_STANDARD' | 'S3_GLACIER_IR'
  retentionPolicy: 'ARCHIVE' | 'DELETE'
  conditions?: Record<string, string | number | boolean | null | { not: null }>
}

export const ARCHIVAL_RULES: ArchivalRule[] = [
  {
    table: 'datasets',
    ageThreshold: 90,
    storageClass: 'S3_STANDARD',
    retentionPolicy: 'ARCHIVE',
    conditions: { status: 'VALIDATED' }
  },
  {
    table: 'datasets',
    ageThreshold: 365,
    storageClass: 'S3_GLACIER_IR',
    retentionPolicy: 'ARCHIVE',
  },
  {
    table: 'audit_logs',
    ageThreshold: 30,
    storageClass: 'S3_STANDARD',
    retentionPolicy: 'ARCHIVE',
  },
  {
    table: 'audit_logs',
    ageThreshold: 365,
    storageClass: 'S3_GLACIER_IR',
    retentionPolicy: 'ARCHIVE',
  },
  {
    table: 'saved_references',
    ageThreshold: 180,
    storageClass: 'S3_STANDARD',
    retentionPolicy: 'ARCHIVE',
    conditions: { lastSyncedAt: { not: null } }
  },
]
