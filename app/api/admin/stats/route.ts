
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simple admin check - in production, use proper role-based access
    const adminEmails = ['admin@example.com', 'your-email@example.com']
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get today's date for filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch stats
    const [
      totalUsers,
      freeUsers,
      premiumUsers,
      newUsersToday,
      subscriptionsToday
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionTier: 'free' } }),
      prisma.user.count({ where: { subscriptionTier: 'premium' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.user.count({
        where: {
          subscriptionTier: 'premium',
          updatedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ])

    // Calculate estimated revenue (this is a simple calculation)
    // In a real app, you'd integrate with Stripe to get actual revenue data
    const totalRevenue = premiumUsers * 29.99 // Assuming $29.99/month

    const stats = {
      totalUsers,
      freeUsers,
      premiumUsers,
      totalRevenue: Math.round(totalRevenue),
      newUsersToday,
      subscriptionsToday
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
