
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailNotifications: true,
        marketingEmails: true,
        weeklyDigest: true,
        instantAlerts: true,
      }
    })

    return NextResponse.json({
      notifications: {
        emailNotifications: user?.emailNotifications ?? true,
        marketingEmails: user?.marketingEmails ?? false,
        weeklyDigest: user?.weeklyDigest ?? true,
        instantAlerts: user?.instantAlerts ?? false,
      }
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emailNotifications, marketingEmails, weeklyDigest, instantAlerts } = await request.json()

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotifications: emailNotifications ?? true,
        marketingEmails: marketingEmails ?? false,
        weeklyDigest: weeklyDigest ?? true,
        instantAlerts: instantAlerts ?? false,
      },
      select: {
        emailNotifications: true,
        marketingEmails: true,
        weeklyDigest: true,
        instantAlerts: true,
      }
    })

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      notifications: updatedUser
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
