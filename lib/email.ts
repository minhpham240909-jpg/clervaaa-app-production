/**
 * Email service for the StudyBuddy application
 * 
 * Handles sending notifications and emails to users and administrators
 */

import { logger } from './logger'

interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
}

interface FeedbackNotificationData {
  feedbackId: string
  type: string
  content: string
  rating?: number
  userEmail?: string | null
  userId?: string | null
}

export class EmailService {
  private isConfigured: boolean
  private fromEmail: string

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@studybuddy.app'
    this.isConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    )

    if (!this.isConfigured) {
      logger.warn('Email service not configured - emails will be logged instead of sent')
    }
  }

  /**
   * Send an email (or log it if SMTP not configured)
   */
  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        // Log the email instead of sending it
        logger.info('Email would be sent (SMTP not configured)', {
          to: options.to,
          subject: options.subject,
          contentLength: (options.html || options.text || '').length
        })
        return true
      }

      // Here you would integrate with your preferred email service
      // Examples: SendGrid, Resend, Nodemailer, etc.
      
      // For now, we'll use a simple nodemailer setup if SMTP is configured
      const nodemailer = await import('nodemailer').catch(() => null)
      
      if (!nodemailer) {
        logger.warn('Nodemailer not installed - logging email instead')
        logger.info('Email content', options)
        return true
      }

      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      await transporter.sendMail({
        from: this.fromEmail,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject
      })

      return true
    } catch (error) {
      logger.error('Failed to send email', error, {
        to: options.to,
        subject: options.subject
      })
      return false
    }
  }

  /**
   * Send feedback notification to administrators
   */
  async sendFeedbackNotification(data: FeedbackNotificationData): Promise<boolean> {
    const adminEmails = (process.env.FOUNDER_EMAILS || process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0)

    if (adminEmails.length === 0) {
      logger.warn('No admin emails configured for feedback notifications')
      return false
    }

    const subject = `New ${data.type} feedback received - StudyBuddy`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Feedback Received</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">Feedback Details</h3>
          <p><strong>Type:</strong> ${data.type}</p>
          <p><strong>Feedback ID:</strong> ${data.feedbackId}</p>
          ${data.rating ? `<p><strong>Rating:</strong> ${data.rating}/5 stars</p>` : ''}
          ${data.userEmail ? `<p><strong>User Email:</strong> ${data.userEmail}</p>` : ''}
          ${data.userId ? `<p><strong>User ID:</strong> ${data.userId}</p>` : ''}
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #374151;">Message:</h4>
          <p style="white-space: pre-wrap; line-height: 1.6;">${data.content}</p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-radius: 8px;">
          <p style="margin: 0; color: #92400e;">
            <strong>Action Required:</strong> Please review this feedback and respond appropriately.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          This email was sent automatically by the StudyBuddy feedback system.
        </p>
      </div>
    `

    const text = `
New ${data.type} feedback received - StudyBuddy

Feedback Details:
- Type: ${data.type}
- Feedback ID: ${data.feedbackId}
${data.rating ? `- Rating: ${data.rating}/5 stars` : ''}
${data.userEmail ? `- User Email: ${data.userEmail}` : ''}
${data.userId ? `- User ID: ${data.userId}` : ''}

Message:
${data.content}

Action Required: Please review this feedback and respond appropriately.

---
This email was sent automatically by the StudyBuddy feedback system.
    `

    return this.sendEmail({
      to: adminEmails,
      subject,
      html,
      text
    })
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userEmail: string, userName?: string): Promise<boolean> {
    const subject = 'Welcome to StudyBuddy! 🎉'
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to StudyBuddy${userName ? `, ${userName}` : ''}!</h1>
        
        <p>We're excited to have you join our community of learners and study partners.</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0369a1; margin: 0 0 15px 0;">Get started with these steps:</h3>
          <ol style="color: #374151;">
            <li>Complete your profile to find better study partners</li>
            <li>Set your study subjects and preferences</li>
            <li>Find and connect with compatible study partners</li>
            <li>Schedule your first study session</li>
          </ol>
        </div>
        
        <p>If you have any questions or feedback, don't hesitate to reach out to us!</p>
        
        <p>Happy studying!<br>The StudyBuddy Team</p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    const subject = 'Reset your StudyBuddy password'
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        
        <p>You requested to reset your password for your StudyBuddy account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset My Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          ${resetUrl}
        </p>
      </div>
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    })
  }
}

// Export singleton instance
export const emailService = new EmailService()

// Export the specific function that's imported in the feedback route
export const sendFeedbackNotification = (data: FeedbackNotificationData) => {
  return emailService.sendFeedbackNotification(data)
}

// Export other convenience functions
export const sendWelcomeEmail = (userEmail: string, userName?: string) => {
  return emailService.sendWelcomeEmail(userEmail, userName)
}

export const sendPasswordResetEmail = (userEmail: string, resetToken: string) => {
  return emailService.sendPasswordResetEmail(userEmail, resetToken)
}

export default EmailService