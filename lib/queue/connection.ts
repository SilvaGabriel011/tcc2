import { Redis } from 'ioredis'

let redisConnection: Redis | null = null

export function getRedisConnection(): Redis {
  if (!redisConnection) {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    
    if (!redisUrl) {
      throw new Error('UPSTASH_REDIS_REST_URL is not configured')
    }

    const url = new URL(redisUrl.replace('https://', 'rediss://'))
    
    redisConnection = new Redis({
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: process.env.UPSTASH_REDIS_REST_TOKEN,
      tls: {
        rejectUnauthorized: false
      },
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    })

    redisConnection.on('error', (error) => {
      console.error('Redis connection error:', error)
    })

    redisConnection.on('connect', () => {
      console.log('✅ Redis connected for BullMQ')
    })
  }

  return redisConnection
}

export function closeRedisConnection(): void {
  if (redisConnection) {
    redisConnection.disconnect()
    redisConnection = null
  }
}
