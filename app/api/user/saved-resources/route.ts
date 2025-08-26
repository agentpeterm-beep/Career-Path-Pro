
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savedResources = await prisma.savedResource.findMany({
      where: { userId: session.user.id },
      include: {
        resource: true
      },
      orderBy: { savedAt: 'desc' }
    })

    return NextResponse.json({ savedResources })
  } catch (error) {
    console.error('Error fetching saved resources:', error)
    return NextResponse.json({ error: 'Failed to fetch saved resources' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resourceId, notes } = await request.json()

    // Check if already saved
    const existing = await prisma.savedResource.findUnique({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId: resourceId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Resource already saved' }, { status: 400 })
    }

    const savedResource = await prisma.savedResource.create({
      data: {
        userId: session.user.id,
        resourceId,
        notes: notes || null,
      },
      include: {
        resource: true
      }
    })

    return NextResponse.json({ success: true, savedResource })
  } catch (error) {
    console.error('Error saving resource:', error)
    return NextResponse.json({ error: 'Failed to save resource' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const resourceId = url.searchParams.get('resourceId')

    if (!resourceId) {
      return NextResponse.json({ error: 'Resource ID required' }, { status: 400 })
    }

    await prisma.savedResource.delete({
      where: {
        userId_resourceId: {
          userId: session.user.id,
          resourceId: resourceId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing saved resource:', error)
    return NextResponse.json({ error: 'Failed to remove saved resource' }, { status: 500 })
  }
}
