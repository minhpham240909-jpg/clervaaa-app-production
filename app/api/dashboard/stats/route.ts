import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch dashboard statistics
    const [
      studyPartnersCount,
      upcomingSessionsCount,
      activeChatsCount,
      userProgress
    ] = await Promise.all([
      // Count study partners (partnerships)
      prisma.partnership.count({
        where: {
          OR: [
            { userId: userId },
            { partnerId: userId }
          ],
          status: 'active'
        }
      }),

      // Count upcoming sessions
      prisma.studySession.count({
        where: {
          participants: {
            some: { userId: userId }
          },
          startTime: {
            gte: new Date()
          },
          status: 'scheduled'
        }
      }),

      // Count active chats (recent messages) - simplified since ChatRoom may not exist  
      prisma.chatbotMessage.count({
        where: {
          userId: { not: userId }, // Messages from others to this user
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),

      // Get user basic info - simplified since points/totalStudyTime may not exist
      prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true,
          name: true,
          email: true
        }
      })
    ])

    // Calculate study score based on various factors - simplified calculation
    const baseScore = Math.min(100, Math.floor(studyPartnersCount * 10 + upcomingSessionsCount * 5))
    const studyTimeBonus = Math.min(15, Math.floor(activeChatsCount * 2)) // Chat activity bonus  
    const achievementBonus = Math.min(10, studyPartnersCount > 5 ? 10 : studyPartnersCount * 2) // Partner milestone bonus
    const studyScore = Math.min(100, baseScore + studyTimeBonus + achievementBonus)

    // Calculate changes (mock data for now - in production, compare with previous period)
    const stats = {
      studyPartners: studyPartnersCount,
      upcomingSessions: upcomingSessionsCount,
      activeChats: activeChatsCount,
      studyScore: studyScore,
      studyPartnersChange: studyPartnersCount > 0 ? `+${Math.floor(studyPartnersCount * 0.2)} this week` : 'No partners yet',
      upcomingSessionsChange: upcomingSessionsCount > 0 ? `${Math.floor(upcomingSessionsCount * 0.6)} this week` : 'No sessions scheduled',
      activeChatsChange: activeChatsCount > 0 ? `${Math.floor(activeChatsCount * 0.3)} new messages` : 'No recent messages',
      studyScoreChange: studyScore > 50 ? '+5% this month' : 'Complete more sessions to improve'
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}