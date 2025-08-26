
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, oldTier, newTier, adminAction } = await request.json()

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionExpires: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const emailData = {
      to: process.env.ADMIN_EMAIL || 'admin@yourapp.com',
      subject: `💳 Subscription Update - ${user.name || user.email} upgraded to ${newTier}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">🎉 Subscription Update Alert</h2>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #059669;">User Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;"><strong>Name:</strong> ${user.name || 'Not provided'}</li>
              <li style="margin: 8px 0;"><strong>Email:</strong> ${user.email}</li>
              <li style="margin: 8px 0;"><strong>User ID:</strong> ${userId}</li>
              <li style="margin: 8px 0;"><strong>Member Since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</li>
            </ul>
          </div>

          <div style="background-color: ${newTier === 'premium' ? '#fef3c7' : '#f1f5f9'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: ${newTier === 'premium' ? '#d97706' : '#64748b'};">Subscription Changes:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;"><strong>Previous Plan:</strong> ${oldTier?.charAt(0).toUpperCase() + oldTier?.slice(1) || 'Unknown'}</li>
              <li style="margin: 8px 0;"><strong>New Plan:</strong> ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}</li>
              <li style="margin: 8px 0;"><strong>Update Time:</strong> ${new Date().toLocaleString()}</li>
              ${user.subscriptionExpires ? `<li style="margin: 8px 0;"><strong>Expires:</strong> ${new Date(user.subscriptionExpires).toLocaleDateString()}</li>` : ''}
              <li style="margin: 8px 0;"><strong>Update Method:</strong> ${adminAction ? 'Admin Action' : 'User Payment'}</li>
            </ul>
          </div>

          ${newTier === 'premium' ? `
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2563eb;">💰 Revenue Impact:</h3>
              <p style="font-size: 18px; font-weight: bold; color: #1d4ed8;">+$29.99 Monthly Recurring Revenue</p>
              <p style="font-size: 14px; color: #64748b;">This user is now contributing to your monthly revenue!</p>
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 14px; color: #6b7280;">
              This is an automated notification from your Career Guidance App.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="color: #3b82f6;">View Admin Dashboard</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/users/${userId}" style="color: #3b82f6;">View User Profile</a>
            </p>
          </div>
        </div>
      `,
      text: `
Subscription Update Alert

User Details:
- Name: ${user.name || 'Not provided'}
- Email: ${user.email}
- User ID: ${userId}
- Member Since: ${new Date(user.createdAt).toLocaleDateString()}

Subscription Changes:
- Previous Plan: ${oldTier?.charAt(0).toUpperCase() + oldTier?.slice(1) || 'Unknown'}
- New Plan: ${newTier.charAt(0).toUpperCase() + newTier.slice(1)}
- Update Time: ${new Date().toLocaleString()}
${user.subscriptionExpires ? `- Expires: ${new Date(user.subscriptionExpires).toLocaleDateString()}` : ''}
- Update Method: ${adminAction ? 'Admin Action' : 'User Payment'}

${newTier === 'premium' ? 'Revenue Impact: +$29.99 Monthly Recurring Revenue' : ''}

View Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin
      `
    }

    const result = await sendEmail(emailData)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Subscription notification sent' })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error sending subscription notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
