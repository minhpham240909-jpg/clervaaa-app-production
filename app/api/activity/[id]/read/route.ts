import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const activityId = params.id

    // Parse activity ID to determine type and actual ID
    const [type, realId] = activityId.split('-')

    let result = null

    switch (type) {
      case 'message':
        // Mark message notification as read
        result = await prisma.notification.updateMany({
          where: {
            userId: userId,
            notificationType: 'CHAT_MESSAGE',
            relatedId: realId,
            isRead: false
          },
          data: {
            isRead: true
          }
        })
        break

      case 'partner':
        // Mark partnership notification as read
        result = await prisma.notification.updateMany({
          where: {
            userId: userId,
            notificationType: 'PARTNERSHIP',
            relatedId: realId,
            isRead: false
          },
          data: {
            isRead: true
          }
        })
        break

      case 'completed':
        // Mark session completion notification as read
        result = await prisma.notification.updateMany({
          where: {
            userId: userId,
            notificationType: 'SESSION_COMPLETED',
            relatedId: realId,
            isRead: false
          },
          data: {
            isRead: true
          }
        })
        break

      case 'scheduled':
        // Mark session scheduled notification as read
        result = await prisma.notification.updateMany({
          where: {
            userId: userId,
            notificationType: 'SESSION_SCHEDULED',
            relatedId: realId,
            isRead: false
          },
          data: {
            isRead: true
          }
        })
        break

      case 'achievement':
        // Mark achievement notification as read
        result = await prisma.notification.updateMany({
          where: {
            userId: userId,
            notificationType: 'ACHIEVEMENT',
            relatedId: realId,
            isRead: false
          },
          data: {
            isRead: true
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid activity type' },
          { status: 400 }
        )
    }

    // If no specific notification found, we'll still consider it successful
    // as the activity might be from cached data

    return NextResponse.json({
      success: true,
      message: 'Activity marked as read',
      updatedCount: result?.count || 1
    })

  } catch (error) {
    console.error('Mark activity as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark activity as read' },
      { status: 500 }
    )
  }
}