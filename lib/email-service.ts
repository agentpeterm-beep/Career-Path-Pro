
import nodemailer, { Transporter } from 'nodemailer'

interface EmailData {
  to: string
  subject: string
  html: string
  text: string
}

interface EmailResult {
  success: boolean
  error?: string
  messageId?: string
}

// Create transporter based on environment variables
function createTransporter(): Transporter {
  // Option 1: Using SendGrid SMTP
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    })
  }

  // Option 2: Using Gmail SMTP
  if (process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })
  }

  // Option 3: Using custom SMTP
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    })
  }

  // Fallback: Development mode (logs to console)
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true
  })
}

export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@yourapp.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    }

    const info = await transporter.sendMail(mailOptions)
    
    // In development mode, log the email content
    if (!process.env.SENDGRID_API_KEY && !process.env.GMAIL_APP_PASSWORD && !process.env.SMTP_HOST) {
      console.log('📧 Email would be sent in production:')
      console.log('To:', emailData.to)
      console.log('Subject:', emailData.subject)
      console.log('Content:', emailData.text)
      console.log('---')
    }

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error('Email sending error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    }
  }
}

// Utility function to send login notification
export async function sendLoginNotification(userDetails: {
  userId: string
  userName?: string
  userEmail: string
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userDetails,
        loginTime: new Date().toISOString()
      })
    })
  } catch (error) {
    console.error('Failed to send login notification:', error)
  }
}

// Utility function to send subscription notification
export async function sendSubscriptionNotification(details: {
  userId: string
  oldTier?: string
  newTier: string
  adminAction?: boolean
}) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/subscription-changed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    })
  } catch (error) {
    console.error('Failed to send subscription notification:', error)
  }
}
