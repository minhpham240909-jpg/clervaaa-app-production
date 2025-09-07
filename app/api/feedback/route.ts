import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// Email notification service (you can integrate with SendGrid, Resend, etc.)
import { sendFeedbackNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Parse the feedback data
    const body = await request.json()
    const { type, content, rating, metadata } = body

    // Validate required fields
    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      )
    }

    // Validate feedback type
    const validTypes = ['general', 'bug', 'feature', 'complaint']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type. Must be one of: general, bug, feature, complaint' },
        { status: 400 }
      )
    }

    // Get user information
    const userId = session?.user?.id || null
    const userEmail = session?.user?.email || null

    // Create feedback entry in database
    const feedbackEntry = await prisma.feedback.create({
      data: {
        category: type,
        message: content.trim(),
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} feedback`,
        userId,
        email: userEmail,
        status: 'open',
        priority: determinePriority(type, rating, content),
      },
    })

    // Log the feedback submission
    logger.info('New feedback submitted', {
      id: feedbackEntry.id,
      type,
      userId,
      userEmail,
      rating,
      contentLength: content.length
    })

    // Send email notification to founders/admin
    try {
      await sendFeedbackNotification({
        feedbackId: feedbackEntry.id,
        type,
        content,
        rating,
        userEmail,
        userId
      })
    } catch (emailError) {
      logger.error('Failed to send feedback notification email', emailError)
      // Don't fail the request if email fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      id: feedbackEntry.id
    })

  } catch (error) {
    logger.error('Error submitting feedback', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for admin to retrieve feedback
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin (you'll need to implement admin role checking)
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query filters
    const where: any = {}
    if (type) where.category = type
    if (status) where.status = status

    // Get feedback with pagination
    const [feedback, totalCount] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }),
      prisma.feedback.count({ where })
    ])

    return NextResponse.json({
      feedback,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    logger.error('Error fetching feedback', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to determine feedback priority
function determinePriority(type: string, rating: number | null, content: string): 'low' | 'medium' | 'high' | 'critical' {
  // Critical: Bug reports or very low ratings
  if (type === 'bug' || rating === 1) {
    return 'critical'
  }
  
  // High: Low ratings or feature requests with detailed content
  if (rating === 2 || (type === 'feature' && content.length > 200)) {
    return 'high'
  }
  
  // Medium: Average ratings or substantial feedback
  if (rating === 3 || content.length > 100) {
    return 'medium'
  }
  
  // Low: High ratings or short feedback
  return 'low'
}

// Helper function to check if user is admin
function isAdmin(user: any): boolean {
  // Check if user is founder (has admin access)
  const founderEmails = (process.env.FOUNDER_EMAILS || process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0)
  
  return founderEmails.includes(user.email)
}