import { NextResponse } from 'next/server'
import { swaggerSpec } from '@/lib/swagger/config'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json(swaggerSpec)
}
