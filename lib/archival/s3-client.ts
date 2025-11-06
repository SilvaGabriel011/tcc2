/**
 * S3 Archival Client
 * 
 * Provides S3 operations for data archival.
 * 
 * Note: Requires @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner packages.
 * Install with: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 */

export class S3ArchivalService {
  private bucket: string
  private enabled: boolean

  constructor() {
    this.bucket = process.env.S3_ARCHIVE_BUCKET || 'agroinsight-archive'
    this.enabled = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.S3_ARCHIVE_BUCKET
    )

    if (!this.enabled) {
      console.warn('⚠️ S3 archival not configured. Set AWS credentials and S3_ARCHIVE_BUCKET to enable.')
    }
  }

  /**
   * Check if S3 archival is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Archive data to S3
   */
  async archiveData(
    key: string,
    data: Record<string, unknown> | unknown[],
    storageClass: 'STANDARD' | 'GLACIER_IR' = 'STANDARD'
  ): Promise<string> {
    if (!this.enabled) {
      throw new Error('S3 archival not configured')
    }

    try {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')

      const client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: JSON.stringify(data),
        ContentType: 'application/json',
        StorageClass: storageClass,
        Metadata: {
          archivedAt: new Date().toISOString(),
          version: '1.0',
        },
      })

      await client.send(command)
      return `s3://${this.bucket}/${key}`
    } catch (error) {
      console.error('❌ Failed to archive to S3:', error)
      throw error
    }
  }

  /**
   * Retrieve archived data from S3
   */
  async retrieveData(key: string): Promise<Record<string, unknown>> {
    if (!this.enabled) {
      throw new Error('S3 archival not configured')
    }

    try {
      const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')

      const client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      const response = await client.send(command)
      const body = await response.Body?.transformToString()
      return JSON.parse(body || '{}')
    } catch (error) {
      console.error('❌ Failed to retrieve from S3:', error)
      throw error
    }
  }

  /**
   * Generate presigned URL for direct access
   */
  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (!this.enabled) {
      throw new Error('S3 archival not configured')
    }

    try {
      const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

      const client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      return await getSignedUrl(client, command, { expiresIn })
    } catch (error) {
      console.error('❌ Failed to generate presigned URL:', error)
      throw error
    }
  }

  /**
   * Delete archived data
   */
  async deleteData(key: string): Promise<void> {
    if (!this.enabled) {
      throw new Error('S3 archival not configured')
    }

    try {
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')

      const client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      })

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      await client.send(command)
    } catch (error) {
      console.error('❌ Failed to delete from S3:', error)
      throw error
    }
  }
}
