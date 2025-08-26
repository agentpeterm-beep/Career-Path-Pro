
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, userEmail, loginTime, ipAddress, userAgent } = await request.json()

    const emailData = {
      to: process.env.ADMIN_EMAIL || 'admin@yourapp.com',
      subject: `🔔 New User Login - ${userName || userEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New User Login Alert</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">User Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;"><strong>Name:</strong> ${userName || 'Not provided'}</li>
              <li style="margin: 8px 0;"><strong>Email:</strong> ${userEmail}</li>
              <li style="margin: 8px 0;"><strong>User ID:</strong> ${userId}</li>
              <li style="margin: 8px 0;"><strong>Login Time:</strong> ${new Date(loginTime).toLocaleString()}</li>
            </ul>
          </div>

          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #64748b;">Technical Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;"><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</li>
              <li style="margin: 8px 0;"><strong>User Agent:</strong> ${userAgent || 'Unknown'}</li>
            </ul>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 14px; color: #6b7280;">
              This is an automated notification from your Career Guidance App.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="color: #3b82f6;">View Admin Dashboard</a>
            </p>
          </div>
        </div>
      `,
      text: `
New User Login Alert

User Details:
- Name: ${userName || 'Not provided'}
- Email: ${userEmail}
- User ID: ${userId}
- Login Time: ${new Date(loginTime).toLocaleString()}

Technical Details:
- IP Address: ${ipAddress || 'Unknown'}
- User Agent: ${userAgent || 'Unknown'}

View Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin
      `
    }

    const result = await sendEmail(emailData)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Login notification sent' })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Error sending login notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
