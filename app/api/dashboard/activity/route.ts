import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      // Return empty activities instead of error to prevent loading issues
      return NextResponse.json([])
    }

    const userId = session.user.id

    // Fetch various types of recent activities
    const [
      recentMessages,
      newPartnerships,
      completedSessions,
      scheduledSessions,
      achievements
    ] = await Promise.all([
      // Recent messages using correct model name
      prisma.message.findMany({
        where: {
          senderId: { not: userId }, // Only messages from others
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          sender: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      }).catch(() => []), // Fallback to empty array if error

      // New partnerships using correct field names
      prisma.partnership.findMany({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ],
          startDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user1: { select: { name: true } },
          user2: { select: { name: true } }
        },
        orderBy: { startDate: 'desc' },
        take: 2
      }).catch(() => []), // Fallback to empty array if error

      // Completed sessions using correct model structure
      prisma.studySession.findMany({
        where: {
          participants: {
            some: { userId: userId }
          },
          status: 'completed',
          endTime: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          studyGroup: {
            select: { name: true }
          }
        },
        orderBy: { endTime: 'desc' },
        take: 2
      }).catch(() => []), // Fallback to empty array if error

      // Recently scheduled sessions
      prisma.studySession.findMany({
        where: {
          participants: {
            some: { userId: userId }
          },
          status: 'scheduled',
          createdAt: {
            gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Last 3 days
          }
        },
        include: {
          studyGroup: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 2
      }).catch(() => []), // Fallback to empty array if error

      // Recent achievements
      prisma.userAchievement.findMany({
        where: {
          userId: userId,
          unlockedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          achievement: { select: { name: true, description: true } }
        },
        orderBy: { unlockedAt: 'desc' },
        take: 2
      }).catch(() => []) // Fallback to empty array if error
    ])

    // Transform activities into a unified format
    const activities: any[] = []

    // Add message activities
    recentMessages.forEach(message => {
      activities.push({
        id: `message-${message.id}`,
        type: 'message',
        content: `${message.sender.name} sent you a message`,
        time: getRelativeTime(message.createdAt),
        icon: 'MessageCircle',
        color: 'text-primary-600',
        bgColor: 'bg-primary-100',
        actionable: true,
        actionUrl: '/messages',
        actionText: 'Reply'
      })
    })

    // Add partnership activities
    newPartnerships.forEach(partnership => {
      const partnerName = partnership.user1Id === userId 
        ? partnership.user2.name 
        : partnership.user1.name
      activities.push({
        id: `partner-${partnership.id}`,
        type: 'new_partner',
        content: `You matched with ${partnerName} for study`,
        time: getRelativeTime(partnership.startDate),
        icon: 'UserPlus',
        color: 'text-accent-600',
        bgColor: 'bg-accent-100',
        actionable: true,
        actionUrl: '/partners',
        actionText: 'View Profile'
      })
    })

    // Add completed session activities
    completedSessions.forEach(session => {
      const sessionName = session.studyGroup?.name || session.title || 'Study Session'
      activities.push({
        id: `completed-${session.id}`,
        type: 'session_completed',
        content: `Completed study session: ${sessionName}`,
        time: getRelativeTime(session.scheduledAt),
        icon: 'Award',
        color: 'text-secondary-600',
        bgColor: 'bg-secondary-100',
        actionable: true,
        actionUrl: `/sessions/${session.id}/feedback`,
        actionText: 'Rate Session'
      })
    })

    // Add scheduled session activities
    scheduledSessions.forEach(session => {
      const sessionName = session.studyGroup?.name || session.title || 'Study Session'
      activities.push({
        id: `scheduled-${session.id}`,
        type: 'session_scheduled',
        content: `New session scheduled: ${sessionName}`,
        time: getRelativeTime(session.createdAt),
        icon: 'Calendar',
        color: 'text-learning-dark',
        bgColor: 'bg-learning-light',
        actionable: true,
        actionUrl: '/calendar',
        actionText: 'View Calendar'
      })
    })

    // Add achievement activities
    achievements.forEach(userAchievement => {
      activities.push({
        id: `achievement-${userAchievement.id}`,
        type: 'achievement',
        content: `Achievement unlocked: ${userAchievement.achievement.name}`,
        time: getRelativeTime(userAchievement.unlockedAt),
        icon: 'Award',
        color: 'text-secondary-600',
        bgColor: 'bg-secondary-100',
        actionable: true,
        actionUrl: '/profile',
        actionText: 'View Achievements'
      })
    })

    // Sort by most recent first and limit to 8 items
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const limitedActivities = activities.slice(0, 8)

    return NextResponse.json(limitedActivities)

  } catch (error) {
    const logContext = logger.logRequest(request)
    logger.error('Dashboard activity error', error instanceof Error ? error : new Error(String(error)), logContext)
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}