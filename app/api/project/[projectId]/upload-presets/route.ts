import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Schema for upload preset validation
const uploadPresetSchema = z.object({
  intervals: z.record(z.object({
    min: z.number(),
    max: z.number()
  })),
  defaultFieldMappings: z.record(z.string()),
  reviewRequired: z.boolean().optional()
})

// GET /api/project/{projectId}/upload-presets
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params

    // Check if user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Get upload presets for the project
    const presets = await prisma.projectUploadPreset.findMany({
      where: {
        projectId: projectId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      projectId,
      presets: presets.map(preset => ({
        id: preset.id,
        intervals: JSON.parse(preset.intervals),
        defaultFieldMappings: JSON.parse(preset.defaultFieldMappings),
        reviewRequired: preset.reviewRequired,
        createdAt: preset.createdAt,
        updatedAt: preset.updatedAt
      }))
    })

  } catch (error) {
    console.error('Error fetching upload presets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/project/{projectId}/upload-presets
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params

    // Check if user is admin or project owner
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.user.id
      }
    })

    if (!project && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin or owner access required' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = uploadPresetSchema.parse(body)

    // Create or update upload preset
    const existingPreset = await prisma.projectUploadPreset.findFirst({
      where: { projectId: projectId }
    })

    const preset = existingPreset 
      ? await prisma.projectUploadPreset.update({
          where: { id: existingPreset.id },
          data: {
            intervals: JSON.stringify(validatedData.intervals),
            defaultFieldMappings: JSON.stringify(validatedData.defaultFieldMappings),
            reviewRequired: validatedData.reviewRequired ?? true,
            updatedAt: new Date()
          }
        })
      : await prisma.projectUploadPreset.create({
          data: {
            projectId: projectId,
            intervals: JSON.stringify(validatedData.intervals),
            defaultFieldMappings: JSON.stringify(validatedData.defaultFieldMappings),
            reviewRequired: validatedData.reviewRequired ?? true
          }
        })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'project_upload_presets',
        resourceId: preset.id,
        changes: JSON.stringify(validatedData)
      }
    })

    return NextResponse.json({
      message: 'Upload preset updated successfully',
      preset: {
        id: preset.id,
        intervals: JSON.parse(preset.intervals),
        defaultFieldMappings: JSON.parse(preset.defaultFieldMappings),
        reviewRequired: preset.reviewRequired,
        updatedAt: preset.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Error updating upload presets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
