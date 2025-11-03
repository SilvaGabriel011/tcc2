import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for this test route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test database connection and get sample data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    })

    const projects = await prisma.project.findMany({
      include: {
        uploadPresets: true,
        _count: {
          select: {
            datasets: true,
            validationSettings: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'AgroInsight API is working!',
      data: {
        users: users.length,
        projects: projects.length,
        sampleProject: projects[0] ? {
          ...projects[0],
          uploadPresets: projects[0].uploadPresets.map(preset => ({
            ...preset,
            intervals: JSON.parse(preset.intervals),
            defaultFieldMappings: JSON.parse(preset.defaultFieldMappings),
          }))
        } : null
      }
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    )
  }
}
