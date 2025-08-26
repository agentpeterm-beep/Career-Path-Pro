
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { interest, priority } = await request.json()

    const userInterest = await prisma.userInterest.create({
      data: {
        userId: session.user.id,
        interest,
        priority: priority || 3,
      }
    })

    return NextResponse.json({ success: true, interest: userInterest })
  } catch (error) {
    console.error('Error creating user interest:', error)
    return NextResponse.json({ error: 'Failed to save interest' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const interests = await prisma.userInterest.findMany({
      where: { userId: session.user.id },
      orderBy: { priority: 'desc' }
    })

    return NextResponse.json({ interests })
  } catch (error) {
    console.error('Error fetching user interests:', error)
    return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Interest ID required' }, { status: 400 })
    }

    // Verify the interest belongs to the user
    const interest = await prisma.userInterest.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!interest) {
      return NextResponse.json({ error: 'Interest not found' }, { status: 404 })
    }

    await prisma.userInterest.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user interest:', error)
    return NextResponse.json({ error: 'Failed to delete interest' }, { status: 500 })
  }
}
