import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin/founder
    if (!session?.user || !isFounder(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized - Founder access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    const now = new Date()
    const ranges = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    const startDate = ranges[range as keyof typeof ranges] || ranges['7d']

    // Get all analytics data in parallel
    const [
      overview,
      realTime,
      userBehavior,
      studyAnalytics,
      engagement
    ] = await Promise.all([
      getOverviewData(startDate),
      getRealTimeData(),
      getUserBehaviorData(startDate),
      getStudyAnalytics(startDate),
      getEngagementData(startDate)
    ])

    const analyticsData = {
      overview,
      realTime,
      userBehavior,
      studyAnalytics,
      engagement
    }

    logger.info('Analytics dashboard accessed', { 
      user: session.user.email,
      range,
      dataPoints: Object.keys(analyticsData).length
    })

    return NextResponse.json(analyticsData)

  } catch (error) {
    logger.error('Error fetching dashboard analytics', error as Error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getOverviewData(startDate: Date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    totalUsers,
    activeUsers,
    newUsersToday,
    totalSessions,
    avgSessionData,
    studyHoursToday,
    aiUsageCount,
    retentionData
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Active users in range
    prisma.user.count({
      where: {
        userActivities: {
          some: {
            timestamp: { gte: startDate }
          }
        }
      }
    }),
    
    // New users today
    prisma.user.count({
      where: {
        createdAt: { gte: today }
      }
    }),
    
    // Total sessions in range
    prisma.userSession.count({
      where: {
        startTime: { gte: startDate }
      }
    }),
    
    // Average session duration
    prisma.userSession.aggregate({
      where: {
        startTime: { gte: startDate },
        duration: { not: null }
      },
      _avg: { duration: true }
    }),
    
    // Study hours today (using metadata for duration)
    prisma.userActivity.findMany({
      where: {
        timestamp: { gte: today },
        category: 'study'
      },
      select: { metadata: true }
    }),
    
    // AI usage count
    prisma.userActivity.count({
      where: {
        timestamp: { gte: startDate },
        category: 'ai'
      }
    }),
    
    // Retention calculation (simplified)
    prisma.user.count({
      where: {
        createdAt: { lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        userActivities: {
          some: {
            timestamp: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
          }
        }
      }
    })
  ])

  // Calculate study hours from metadata
  const studyHours = studyHoursToday.reduce((total, activity) => {
    if (activity.metadata) {
      try {
        const metadata = JSON.parse(activity.metadata)
        return total + (metadata.duration || 0)
      } catch {
        return total
      }
    }
    return total
  }, 0) / (1000 * 60 * 60)

  const avgSessionDuration = avgSessionData._avg?.duration 
    ? Math.round(avgSessionData._avg.duration / 60) 
    : 0

  const oldUsers = await prisma.user.count({
    where: {
      createdAt: { lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    }
  })

  const retentionRate = oldUsers > 0 ? (retentionData / oldUsers) * 100 : 0

  return {
    totalUsers,
    activeUsers,
    newUsersToday,
    totalSessions,
    avgSessionDuration,
    studyHoursToday: studyHours,
    aiUsageCount,
    retentionRate
  }
}

async function getRealTimeData() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [
    currentlyOnline,
    sessionsLast24h,
    popularPages,
    activeFeatures,
    recentActions
  ] = await Promise.all([
    // Currently online (active in last 5 minutes)
    prisma.user.count({
      where: {
        userActivities: {
          some: {
            timestamp: { gte: fiveMinutesAgo }
          }
        }
      }
    }),
    
    // Sessions in last 24h
    prisma.userSession.count({
      where: {
        startTime: { gte: twentyFourHoursAgo }
      }
    }),
    
    // Popular pages
    prisma.pageView.groupBy({
      by: ['page'],
      where: {
        timestamp: { gte: twentyFourHoursAgo }
      },
      _count: { page: true },
      orderBy: { _count: { page: 'desc' } },
      take: 10
    }),
    
    // Active features
    prisma.userActivity.groupBy({
      by: ['action'],
      where: {
        timestamp: { gte: twentyFourHoursAgo },
        category: { in: ['ai', 'study', 'social'] }
      },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 5
    }),
    
    // Recent actions
    prisma.userActivity.findMany({
      where: {
        timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    })
  ])

  return {
    currentlyOnline,
    sessionsLast24h,
    popularPages: popularPages.map((p: any) => ({
      path: p.page,
      views: p._count.page
    })),
    activeFeatures: activeFeatures.map((f: any) => ({
      feature: f.action,
      usage: f._count.action
    })),
    recentActions: recentActions.map((a: any) => ({
      action: a.action,
      timestamp: a.timestamp.toISOString(),
      user: a.user?.name
    }))
  }
}

async function getUserBehaviorData(startDate: Date) {
  const [
    deviceBreakdown,
    browserBreakdown,
    studyPatterns,
    popularFeatures,
    retentionCohorts
  ] = await Promise.all([
    // Device breakdown (no data yet - real app starting fresh)
    Promise.resolve([
      { _count: { deviceType: 0 }, deviceType: 'desktop' },
      { _count: { deviceType: 0 }, deviceType: 'mobile' },
      { _count: { deviceType: 0 }, deviceType: 'tablet' }
    ]),
    
    // Browser breakdown (no data yet - real app starting fresh)
    Promise.resolve([
      { _count: { browser: 0 }, browser: 'chrome' },
      { _count: { browser: 0 }, browser: 'safari' },
      { _count: { browser: 0 }, browser: 'firefox' },
      { _count: { browser: 0 }, browser: 'edge' }
    ]),
    
    // Study patterns by hour (simplified for SQLite)
    prisma.$queryRaw`
      SELECT 
        strftime('%H', timestamp) as hour,
        COUNT(*) as activity_count,
        COUNT(DISTINCT userId) as unique_users
      FROM UserActivity 
      WHERE timestamp >= ${startDate.toISOString()} 
        AND category = 'study'
      GROUP BY strftime('%H', timestamp)
      ORDER BY hour
    `,
    
    // Popular features (based on user activities)
    prisma.userActivity.groupBy({
      by: ['action'],
      where: {
        timestamp: { gte: startDate }
      },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 10
    }),
    
    // Basic retention cohorts (simplified)
    []
  ])

  const totalDevices = deviceBreakdown.reduce((sum, d) => sum + d._count.deviceType, 0)

  return {
    deviceBreakdown: deviceBreakdown.map((d: any) => ({
      device: d.deviceType || 'unknown',
      count: d._count.deviceType,
      percentage: totalDevices > 0 ? (d._count.deviceType / totalDevices) * 100 : 0
    })),
    browserBreakdown: browserBreakdown.map((b: any) => ({
      browser: b.browser || 'unknown',
      count: b._count.browser
    })),
    studyPatterns: Array.isArray(studyPatterns) ? studyPatterns.map((p: any) => ({
      hour: parseInt(p.hour) || 0,
      studyTime: parseInt(p.activity_count) || 0,
      users: parseInt(p.unique_users) || 0
    })) : [],
    popularFeatures: popularFeatures.map((f: any) => ({
      feature: f.action,
      usage: f._count.action,
      successRate: 85 // Mock success rate
    })),
    retentionCohorts: []
  }
}

async function getStudyAnalytics(startDate: Date) {
  const [
    totalStudyTime,
    avgSessionLength,
    popularSubjects,
    studyStreaks,
    aiFeatureUsage,
    partnershipStats
  ] = await Promise.all([
    // Total study time (from metadata)
    prisma.userActivity.findMany({
      where: {
        timestamp: { gte: startDate },
        category: 'study'
      },
      select: { metadata: true }
    }),
    
    // Average session length (no data yet - real app starting fresh)
    Promise.resolve({ _avg: { avgSessionLength: 0 } }),
    
    // Popular subjects (no data yet - real app starting fresh)
    Promise.resolve([]),
    
    // Study streaks (no data yet - real app starting fresh)
    Promise.resolve({
      avg: 0,
      max: 0,
      activeStreaks: 0
    }),
    
    // AI feature usage (based on activities)
    prisma.userActivity.groupBy({
      by: ['action'],
      where: {
        timestamp: { gte: startDate },
        category: 'ai'
      },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
      take: 8
    }),
    
    // Partnership stats (no data yet - real app starting fresh)
    Promise.resolve({
      totalMatches: 0,
      activePartnerships: 0,
      successRate: 0
    })
  ])

  // Calculate total study hours from metadata
  const totalHours = totalStudyTime.reduce((total, activity) => {
    if (activity.metadata) {
      try {
        const metadata = JSON.parse(activity.metadata)
        return total + (metadata.duration || 0)
      } catch {
        return total
      }
    }
    return total
  }, 0) / (1000 * 60 * 60)

      return {
    totalStudyTime: totalHours,
    avgSessionLength: avgSessionLength._avg.avgSessionLength || 0,
    popularSubjects,
    studyStreaks,
    aiFeatureUsage: aiFeatureUsage.map((f: any) => ({
      feature: f.action,
      usage: f._count.action,
      satisfaction: 0 // No satisfaction data yet
    })),
    partnershipStats
  }
}

async function getEngagementData(startDate: Date) {
  const [
    dailyActiveUsers,
    featureAdoption,
    userJourney,
    avgSatisfaction,
    npsScore,
    churnRisk
  ] = await Promise.all([
    // Daily active users (simplified)
    [],
    
    // Feature adoption (based on user activities)
    prisma.userActivity.groupBy({
      by: ['action'],
      _count: { userId: true }
    }),
    
    // User journey (no data yet - real app starting fresh)
    Promise.resolve([]),
    
    // Average satisfaction (no data yet - real app starting fresh)
    Promise.resolve({ _avg: { satisfactionScore: 0 } }),
    
    // NPS Score (no data yet - real app starting fresh)
    Promise.resolve(0),
    
    // Churn risk users (mock data - no UserBehavior model)
    Promise.resolve([])
  ])

  const totalUsers = await prisma.user.count()

  return {
    dailyActiveUsers: [], // Would be populated with actual data
    featureAdoption: featureAdoption.map((f: any) => ({
      feature: f.action,
      adopted: f._count.userId,
      total: totalUsers
    })),
    userJourney,
    satisfactionScore: avgSatisfaction._avg.satisfactionScore || 0,
    npsScore,
    churnRisk: [] // Empty array since no UserBehavior model
  }
}

// Helper function to check if user is founder
function isFounder(user: any): boolean {
  const founderEmails = process.env.FOUNDER_EMAILS?.split(',') || process.env.ADMIN_EMAILS?.split(',') || []
  return founderEmails.includes(user.email)
}