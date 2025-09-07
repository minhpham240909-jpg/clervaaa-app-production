import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { status, priority, adminNotes, assignedTo, resolution } = body

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value. Must be one of: open, in_progress, resolved, closed' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical']
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (resolution !== undefined) updateData.resolution = resolution

    // Set updatedAt timestamp for any changes
    updateData.updatedAt = new Date()

    // Update the feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
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
    })

    logger.info('Feedback updated by admin', {
      feedbackId: id,
      adminUser: session.user.email,
      changes: updateData
    })

    return NextResponse.json({
      success: true,
      feedback: updatedFeedback
    })

  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    logger.error('Error updating feedback', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = params

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
        // responses: { // Model doesn't have responses field - removed
        //   orderBy: { createdAt: 'desc' }
        // }
      }
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(feedback)

  } catch (error) {
    logger.error('Error fetching feedback details', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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