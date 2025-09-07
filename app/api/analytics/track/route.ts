import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface DeviceInfo {
  userAgent?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
  screenSize?: string
}

interface LocationInfo {
  country?: string
  city?: string
  timezone?: string
}

interface ActivityEvent {
  action: string
  category: string
  label?: string
  value?: number
  page?: string
  metadata?: Record<string, any>
  duration?: number
}

interface TrackingPayload {
  sessionId: string
  userId?: string
  events: ActivityEvent[]
  deviceInfo?: DeviceInfo
  location?: LocationInfo
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingPayload = await request.json()
    const { sessionId, userId, events, deviceInfo, location } = body

    if (!sessionId || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: sessionId and events are required' },
        { status: 400 }
      )
    }

    // Get IP address for geo tracking
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown'

    // Process each event
    const results = await Promise.allSettled(
      events.map(async (event: any) => {
        // Create user activity record
        const activityData = {
          userId: userId || null,
          sessionId,
          action: event.action,
          category: event.category,
          label: event.label || null,
          value: event.value || null,
          page: event.page || '/',
          referrer: event.metadata?.referrer || null,
          userAgent: deviceInfo?.userAgent || request.headers.get('user-agent') || null,
          ipAddress,
          deviceType: deviceInfo?.deviceType || null,
          browser: deviceInfo?.browser || null,
          os: deviceInfo?.os || null,
          screenSize: deviceInfo?.screenSize || null,
          country: location?.country || null,
          city: location?.city || null,
          timezone: location?.timezone || null,
          metadata: event.metadata ? JSON.stringify(event.metadata) : null,
          duration: event.duration || null
        }

        // Save activity to database
        const activity = await prisma.userActivity.create({ data: activityData })

        // Handle specific event types with additional processing
        await processSpecialEvents(event, sessionId, userId, deviceInfo)

        return activity
      })
    )

    // Update or create session record
    await updateSessionRecord(sessionId, events, userId, deviceInfo, location, ipAddress)

    // Update real-time analytics
    await updateRealTimeAnalytics(events, userId)

    // Log successful tracking
    const successCount = results.filter((r: any) => r.status === 'fulfilled').length
    const errorCount = results.filter((r: any) => r.status === 'rejected').length

    logger.info('Analytics tracked', {
      sessionId,
      userId: userId || 'anonymous',
      eventsProcessed: successCount,
      errors: errorCount,
      eventTypes: events.map((e: any) => e.action)
    })

    return NextResponse.json({
      success: true,
      processed: successCount,
      errors: errorCount
    })

  } catch (error) {
    logger.error('Analytics tracking error', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processSpecialEvents(
  event: ActivityEvent,
  sessionId: string,
  userId?: string,
  deviceInfo?: DeviceInfo
) {
  try {
    switch (event.action) {
      case 'page_view':
        await handlePageView(event, sessionId, userId, deviceInfo)
        break
      
      case 'session_start':
        await handleSessionStart(sessionId, event, userId, deviceInfo)
        break
      
      case 'session_end':
        await handleSessionEnd(sessionId, event.value || 0)
        break

      case 'feature_used':
      case 'ai_feature_used':
        await handleFeatureUsage(event, userId, deviceInfo)
        break

      case 'study_session_started':
      case 'study_session_completed':
        await handleStudyActivity(event, userId)
        break

      case 'error_occurred':
        await handleErrorEvent(event, sessionId, userId)
        break
    }
  } catch (error) {
    logger.warn('Error processing special event', { event: event.action, error })
    // Don't throw - we don't want to fail the entire request
  }
}

async function handlePageView(
  event: ActivityEvent,
  sessionId: string,
  userId?: string,
  deviceInfo?: DeviceInfo
) {
  const pageViewData = {
    userId: userId || null,
    sessionId,
    page: event.label || event.page || '/',
    title: event.metadata?.title || null,
    referrer: event.metadata?.referrer || null
  }

  await prisma.pageView.create({ data: pageViewData })
}

async function handleSessionStart(
  sessionId: string,
  event: ActivityEvent,
  userId?: string,
  deviceInfo?: DeviceInfo
) {
  const sessionData = {
    userId: userId!,
    sessionId,
    userAgent: deviceInfo?.userAgent || null,
    ipAddress: null
  }

  await prisma.userSession.upsert({
    where: { id: sessionId },
    create: sessionData,
    update: {}
  })
}

async function handleSessionEnd(sessionId: string, duration: number) {
  await prisma.userSession.updateMany({
    where: { sessionId },
    data: {
      endTime: new Date(),
      duration
    }
  })
}

async function handleFeatureUsage(
  event: ActivityEvent,
  userId?: string,
  deviceInfo?: DeviceInfo
) {
  if (!userId || !event.label) return

  const featureName = event.label
  const category = event.category
  const success = event.value === 1
  const duration = event.duration || 0

  // Get current hour for time-of-day analysis
  const now = new Date()
  const hour = now.getHours()
  let timeOfDay: string
  if (hour < 6) timeOfDay = 'night'
  else if (hour < 12) timeOfDay = 'morning'
  else if (hour < 18) timeOfDay = 'afternoon'
  else timeOfDay = 'evening'

  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

  // Feature usage tracking disabled (FeatureUsage model doesn't exist)
  /*await prisma.featureUsage.upsert({
    where: {
      userId_featureName: {
        userId,
        featureName
      }
    },
    create: {
      userId,
      featureName,
      featureCategory: category,
      usageCount: 1,
      totalDuration: duration,
      completionRate: success ? 100 : 0,
      errorRate: success ? 0 : 100,
      deviceType: deviceInfo?.deviceType,
      timeOfDay,
      dayOfWeek,
      firstUsed: now,
      lastUsed: now
    },
    update: {
      usageCount: { increment: 1 },
      totalDuration: { increment: duration },
      lastUsed: now,
      // Update completion and error rates with rolling average
      completionRate: {
        set: prisma.$queryRaw`
          CASE 
            WHEN usageCount = 0 THEN ${success ? 100 : 0}
            ELSE (completionRate * usageCount + ${success ? 100 : 0}) / (usageCount + 1)
          END
        `
      },
      errorRate: {
        set: prisma.$queryRaw`
          CASE 
            WHEN usageCount = 0 THEN ${success ? 0 : 100}
            ELSE (errorRate * usageCount + ${success ? 0 : 100}) / (usageCount + 1)
          END
        `
      }
    }
  })*/
}

async function handleStudyActivity(event: ActivityEvent, userId?: string) {
  if (!userId) return

  // Update user behavior patterns
  const isStart = event.action === 'study_session_started'
  const isComplete = event.action === 'study_session_completed'

  if (isStart || isComplete) {
    const duration = event.metadata?.duration || event.value || 0
    const subject = event.metadata?.subject || 'unknown'

    // User behavior tracking disabled (UserBehavior model doesn't exist)
    /*await prisma.userBehavior.upsert({
      where: { userId },
      create: {
        userId,
        avgSessionLength: duration,
        studyFrequency: 1,
        avgSessionsPerWeek: 1,
        avgTimePerSession: duration,
        subjectPreferences: JSON.stringify([subject])
      },
      update: {
        // Update averages with rolling calculation
        avgSessionLength: {
          set: prisma.$queryRaw`
            (avgSessionLength * studyFrequency + ${duration}) / (studyFrequency + 1)
          `
        },
        studyFrequency: { increment: 1 },
        lastActiveDate: new Date()
      }
    })*/
  }
}

async function handleErrorEvent(event: ActivityEvent, sessionId: string, userId?: string) {
  // Log error for debugging
  logger.error('User-reported error', undefined, {
    error: event.label,
    userId,
    sessionId,
    context: event.metadata
  })

  // Could also send to error tracking service like Sentry
}

async function updateSessionRecord(
  sessionId: string,
  events: ActivityEvent[],
  userId?: string,
  deviceInfo?: DeviceInfo,
  location?: LocationInfo,
  ipAddress?: string
) {
  // Calculate session metrics
  const clickEvents = events.filter((e: any) => e.action === 'click')
  const pageViews = events.filter((e: any) => e.action === 'page_view')
  const aiEvents = events.filter((e: any) => e.category === 'ai')
  const socialEvents = events.filter((e: any) => e.category === 'social')
  const studyEvents = events.filter((e: any) => e.category === 'study')

  const sessionUpdate = {
    userId: userId || null,
    pageCount: pageViews.length,
    clickCount: clickEvents.length,
    aiInteractions: aiEvents.length,
    socialActions: socialEvents.length,
    studyTime: studyEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / 1000, // Convert to seconds
    ipAddress,
    country: location?.country || null,
    city: location?.city || null
  }

  await prisma.userSession.updateMany({
    where: { sessionId },
    data: sessionUpdate
  })
}

async function updateRealTimeAnalytics(events: ActivityEvent[], userId?: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Count different event types
  const aiEvents = events.filter((e: any) => e.category === 'ai').length
  const studyTime = events
    .filter((e: any) => e.category === 'study')
    .reduce((sum, e) => sum + (e.duration || 0), 0) / (1000 * 60 * 60) // Convert to hours

  const partnerEvents = events.filter((e: any) => 
    e.action === 'partner_matched' || e.action === 'message_sent'
  ).length

  const sessionStarts = events.filter((e: any) => e.action === 'session_start').length

  // System analytics tracking disabled (SystemAnalytics model doesn't exist)
  /*await prisma.systemAnalytics.upsert({
    where: { 
      recordedAt: today 
    },
    create: {
      activeUsers: userId ? 1 : 0,
      totalSessions: sessionStarts,
      newSignups: 0, // Will be updated by auth events
      studyHours: studyTime,
      avgLoadTime: 0, // Will be calculated from page load events
      errorRate: 0,
      serverResponse: 0,
      aiGenerations: aiEvents,
      partnerMatches: 0,
      messagesExchanged: partnerEvents,
      recordedAt: today
    },
    update: {
      totalSessions: { increment: sessionStarts },
      studyHours: { increment: studyTime },
      aiGenerations: { increment: aiEvents },
      messagesExchanged: { increment: partnerEvents }
    }
  })*/
}