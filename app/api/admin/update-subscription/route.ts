
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simple admin check
    const adminEmails = ['admin@example.com', 'your-email@example.com']
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { userId, tier, testMode } = await request.json()

    if (!userId || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate expiration date for premium plans
    let subscriptionExpires = null
    if (tier === 'premium') {
      const expireDate = new Date()
      expireDate.setMonth(expireDate.getMonth() + 1) // Add 1 month
      subscriptionExpires = expireDate
    }

    // Update user subscription
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionExpires,
        updatedAt: new Date()
      }
    })

    // Send notification email (optional)
    if (!testMode) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/subscription-changed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: updatedUser.id,
            oldTier: 'unknown', // You could track this if needed
            newTier: tier,
            adminAction: true
          })
        })
      } catch (error) {
        console.error('Failed to send notification:', error)
        // Don't fail the main operation if notification fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: `User subscription updated to ${tier}${testMode ? ' (test mode)' : ''}` 
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
