
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const interestId = params.id

    // Verify the interest belongs to the user
    const interest = await prisma.userInterest.findFirst({
      where: {
        id: interestId,
        userId: session.user.id
      }
    })

    if (!interest) {
      return NextResponse.json({ error: 'Interest not found' }, { status: 404 })
    }

    await prisma.userInterest.delete({
      where: { id: interestId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user interest:', error)
    return NextResponse.json({ error: 'Failed to delete interest' }, { status: 500 })
  }
}
