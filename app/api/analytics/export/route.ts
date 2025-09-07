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
    const format = searchParams.get('format') || 'csv'

    // Calculate date range
    const now = new Date()
    const ranges = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    const startDate = ranges[range as keyof typeof ranges] || ranges['7d']

    // Get comprehensive analytics data
    const [
      userActivities,
      userSessions,
      pageViews,
      featureUsage,
      userBehavior
    ] = await Promise.all([
      // User activities
      prisma.userActivity.findMany({
        where: {
          timestamp: { gte: startDate }
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { timestamp: 'desc' }
      }),

      // User sessions
      prisma.userSession.findMany({
        where: {
          startTime: { gte: startDate }
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { startTime: 'desc' }
      }),

      // Page views
      prisma.pageView.findMany({
        where: {
          timestamp: { gte: startDate }
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { timestamp: 'desc' }
      }),

      // Feature usage (mock data - FeatureUsage model doesn't exist)
      Promise.resolve([]),

      // User behavior (mock data - UserBehavior model doesn't exist)
      Promise.resolve([])
    ])

    if (format === 'csv') {
      const csv = generateCSV({
        userActivities,
        userSessions,
        pageViews,
        featureUsage,
        userBehavior
      })

      logger.info('Analytics data exported', {
        user: session.user.email,
        range,
        format,
        recordCount: userActivities.length + userSessions.length + pageViews.length
      })

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="studybuddy-analytics-${range}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      const data = {
        userActivities,
        userSessions,
        pageViews,
        featureUsage,
        userBehavior,
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          range,
          recordCounts: {
            activities: userActivities.length,
            sessions: userSessions.length,
            pageViews: pageViews.length,
            featureUsage: featureUsage.length,
            userBehavior: userBehavior.length
          }
        }
      }

      return NextResponse.json(data, {
        headers: {
          'Content-Disposition': `attachment; filename="studybuddy-analytics-${range}-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use csv or json.' },
        { status: 400 }
      )
    }

  } catch (error) {
    logger.error('Error exporting analytics data', error as Error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateCSV(data: any): string {
  const csvRows: string[] = []

  // User Activities CSV
  csvRows.push('\n=== USER ACTIVITIES ===')
  csvRows.push('Timestamp,User Name,User Email,Action,Category,Label,Value,Page,Device Type,Browser,Duration (ms),Metadata')
  
  data.userActivities.forEach((activity: any) => {
    const row = [
      activity.createdAt.toISOString(),
      activity.user?.name || 'Anonymous',
      activity.user?.email || 'N/A',
      activity.action,
      activity.category,
      activity.label || '',
      activity.value || '',
      activity.page || '',
      activity.deviceType || '',
      activity.browser || '',
      activity.duration || '',
      activity.metadata || ''
    ].map((field: any) => `"${String(field).replace(/"/g, '""')}"`)
    
    csvRows.push(row.join(','))
  })

  // User Sessions CSV
  csvRows.push('\n\n=== USER SESSIONS ===')
  csvRows.push('Session ID,User Name,User Email,Started At,Ended At,Duration (sec),Entry Page,Page Count,Click Count,Device Type,Browser,Country,City,Is Active')
  
  data.userSessions.forEach((session: any) => {
    const row = [
      session.sessionId,
      session.user?.name || 'Anonymous',
      session.user?.email || 'N/A',
      session.startedAt.toISOString(),
      session.endedAt?.toISOString() || '',
      session.duration || '',
      session.entryPage || '',
      session.pageCount || 0,
      session.clickCount || 0,
      session.deviceType || '',
      session.browser || '',
      session.country || '',
      session.city || '',
      session.allowPartnerRequests ? 'Yes' : 'No'
    ].map((field: any) => `"${String(field).replace(/"/g, '""')}"`)
    
    csvRows.push(row.join(','))
  })

  // Page Views CSV
  csvRows.push('\n\n=== PAGE VIEWS ===')
  csvRows.push('Timestamp,User Name,User Email,Path,Title,Referrer,Session ID,User Agent')
  
  data.pageViews.forEach((view: any) => {
    const row = [
      view.viewedAt.toISOString(),
      view.user?.name || 'Anonymous',
      view.user?.email || 'N/A',
      view.path,
      view.title || '',
      view.referrer || '',
      view.sessionId,
      view.userAgent || ''
    ].map((field: any) => `"${String(field).replace(/"/g, '""')}"`)
    
    csvRows.push(row.join(','))
  })

  // Feature Usage CSV
  csvRows.push('\n\n=== FEATURE USAGE ===')
  csvRows.push('User Name,User Email,Feature Name,Category,Usage Count,Total Duration (sec),Completion Rate (%),Error Rate (%),Device Type,Time of Day,Day of Week,First Used,Last Used')
  
  data.featureUsage.forEach((usage: any) => {
    const row = [
      usage.user?.name || 'Anonymous',
      usage.user?.email || 'N/A',
      usage.featureName,
      usage.featureCategory || '',
      usage.usageCount || 0,
      usage.totalDuration || 0,
      usage.completionRate || 0,
      usage.errorRate || 0,
      usage.deviceType || '',
      usage.timeOfDay || '',
      usage.dayOfWeek || '',
      usage.firstUsed?.toISOString() || '',
      usage.lastUsed?.toISOString() || ''
    ].map((field: any) => `"${String(field).replace(/"/g, '""')}"`)
    
    csvRows.push(row.join(','))
  })

  // User Behavior CSV
  csvRows.push('\n\n=== USER BEHAVIOR ANALYTICS ===')
  csvRows.push('User Name,User Email,Avg Session Length (min),Study Frequency,Avg Sessions Per Week,Avg Time Per Session (min),Satisfaction Score,Churn Risk (%),Subject Preferences,Last Active Date')
  
  data.userBehavior.forEach((behavior: any) => {
    const row = [
      behavior.user?.name || 'Anonymous',
      behavior.user?.email || 'N/A',
      behavior.avgSessionLength || 0,
      behavior.studyFrequency || 0,
      behavior.avgSessionsPerWeek || 0,
      behavior.avgTimePerSession || 0,
      behavior.satisfactionScore || 0,
      (behavior.churnRisk || 0) * 100,
      behavior.subjectPreferences || '',
      behavior.lastActiveDate?.toISOString() || ''
    ].map((field: any) => `"${String(field).replace(/"/g, '""')}"`)
    
    csvRows.push(row.join(','))
  })

  return csvRows.join('\n')
}

// Helper function to check if user is founder
function isFounder(user: any): boolean {
  const founderEmails = process.env.FOUNDER_EMAILS?.split(',') || process.env.ADMIN_EMAILS?.split(',') || []
  return founderEmails.includes(user.email)
}