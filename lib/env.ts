import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),
  GOOGLE_GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  SERPAPI_API_KEY: z.string().optional(),
  DEVIN_API_KEY: z.string().optional(),
  DB_PROVIDER: z.enum(['sqlite', 'postgresql']).optional().default('sqlite'),
  DIRECT_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
})

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv
  }

  try {
    const env = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
      DEVIN_API_KEY: process.env.DEVIN_API_KEY,
      DB_PROVIDER: process.env.DB_PROVIDER,
      DIRECT_URL: process.env.DIRECT_URL,
      NODE_ENV: process.env.NODE_ENV,
    })

    cachedEnv = env
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      throw new Error(
        `Environment variable validation failed:\n${missingVars.join('\n')}\n\nPlease check your .env.local file and ensure all required variables are set.`
      )
    }
    throw error
  }
}

export function getEnv(): Env {
  if (!cachedEnv) {
    return validateEnv()
  }
  return cachedEnv
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development'
}

export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test'
}
