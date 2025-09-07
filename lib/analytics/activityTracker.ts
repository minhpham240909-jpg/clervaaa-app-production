// Comprehensive user activity tracking system
'use client'

import { v4 as uuidv4 } from 'uuid'

interface ActivityData {
  action: string
  category: string
  label?: string
  value?: number
  page?: string
  metadata?: Record<string, any>
  duration?: number
}

interface SessionData {
  sessionId: string
  userId?: string
  startedAt: Date
  deviceInfo: {
    userAgent: string
    deviceType: 'desktop' | 'mobile' | 'tablet'
    browser: string
    os: string
    screenSize: string
  }
  location?: {
    country?: string
    city?: string
    timezone: string
  }
}

class ActivityTracker {
  private static instance: ActivityTracker
  private sessionId: string
  private userId?: string
  private sessionStartTime: Date
  private currentPage: string
  private pageStartTime: Date
  private isTracking: boolean = false
  private eventQueue: ActivityData[] = []
  private isOnline: boolean = true

  constructor() {
    this.sessionId = this.generateSessionId()
    this.sessionStartTime = new Date()
    this.currentPage = typeof window !== 'undefined' ? window.location.pathname : ''
    this.pageStartTime = new Date()
  }

  static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker()
    }
    return ActivityTracker.instance
  }

  // Initialize tracking
  initialize(userId?: string) {
    if (typeof window === 'undefined') return

    this.userId = userId
    this.isTracking = true
    
    // Track session start
    this.trackActivity({
      action: 'session_start',
      category: 'session',
      page: window.location.pathname
    })

    // Set up event listeners
    this.setupEventListeners()
    
    // Start periodic data flushing
    this.startPeriodicFlush()
    
    // Track initial page view
    this.trackPageView(window.location.pathname)
  }

  // Track any user activity
  trackActivity(data: ActivityData) {
    if (!this.isTracking) return

    const activity: ActivityData = {
      ...data,
      page: data.page || this.currentPage,
      metadata: {
        ...data.metadata,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        userId: this.userId
      }
    }

    this.eventQueue.push(activity)
    
    // Flush queue if it gets too large or for critical events
    if (this.eventQueue.length >= 10 || this.isCriticalEvent(data.action)) {
      this.flushEvents()
    }
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    // Track time on previous page
    if (this.currentPage && this.currentPage !== path) {
      const timeOnPage = Math.round((Date.now() - this.pageStartTime.getTime()) / 1000)
      this.trackActivity({
        action: 'page_leave',
        category: 'navigation',
        label: this.currentPage,
        value: timeOnPage,
        duration: timeOnPage * 1000
      })
    }

    // Track new page view
    this.currentPage = path
    this.pageStartTime = new Date()
    
    this.trackActivity({
      action: 'page_view',
      category: 'navigation',
      label: path,
      metadata: {
        title: title || document.title,
        referrer: document.referrer
      }
    })
  }

  // Track specific user actions
  trackStudyAction(action: string, metadata?: Record<string, any>) {
    this.trackActivity({
      action,
      category: 'study',
      metadata
    })
  }

  trackAIUsage(feature: string, success: boolean, duration?: number) {
    this.trackActivity({
      action: 'ai_feature_used',
      category: 'ai',
      label: feature,
      value: success ? 1 : 0,
      duration,
      metadata: {
        success,
        feature
      }
    })
  }

  trackSocialAction(action: string, targetUserId?: string, metadata?: Record<string, any>) {
    this.trackActivity({
      action,
      category: 'social',
      metadata: {
        ...metadata,
        targetUserId
      }
    })
  }

  trackSettingsChange(setting: string, oldValue: any, newValue: any) {
    this.trackActivity({
      action: 'settings_changed',
      category: 'settings',
      label: setting,
      metadata: {
        setting,
        oldValue,
        newValue
      }
    })
  }

  trackFormSubmission(formName: string, success: boolean, formData?: Record<string, any>) {
    this.trackActivity({
      action: 'form_submit',
      category: 'interaction',
      label: formName,
      value: success ? 1 : 0,
      metadata: {
        formName,
        success,
        fieldCount: formData ? Object.keys(formData).length : 0
      }
    })
  }

  trackError(error: string, context?: Record<string, any>) {
    this.trackActivity({
      action: 'error_occurred',
      category: 'error',
      label: error,
      metadata: {
        error,
        ...context
      }
    })
  }

  // Set up automatic event listeners
  private setupEventListeners() {
    if (typeof window === 'undefined') return

    // Track clicks
    document.addEventListener('click', (event: any) => {
      const target = event.targetDate as HTMLElement
      const elementType = target.tagName.toLowerCase()
      const elementId = target.id
      const elementClass = target.className
      const elementText = target.textContent?.slice(0, 50)

      this.trackActivity({
        action: 'click',
        category: 'interaction',
        label: elementType,
        metadata: {
          elementType,
          elementId,
          elementClass,
          elementText,
          x: event.clientX,
          y: event.clientY
        }
      })
    })

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackActivity({
        action: document.hidden ? 'page_hidden' : 'page_visible',
        category: 'engagement'
      })
    })

    // Track scroll depth
    let maxScrollDepth = 0
    window.addEventListener('scroll', this.throttle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollDepth = Math.round((scrollTop / docHeight) * 100)
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        this.trackActivity({
          action: 'scroll_depth',
          category: 'engagement',
          value: scrollDepth
        })
      }
    }, 1000))

    // Track session end
    window.addEventListener('beforeunload', () => {
      this.trackActivity({
        action: 'session_end',
        category: 'session',
        value: Math.round((Date.now() - this.sessionStartTime.getTime()) / 1000)
      })
      this.flushEventsSync() // Synchronous flush on page unload
    })

    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.trackActivity({
        action: 'connection_restored',
        category: 'system'
      })
      this.flushEvents() // Flush queued events when back online
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.trackActivity({
        action: 'connection_lost',
        category: 'system'
      })
    })
  }

  // Flush events to server
  private async flushEvents() {
    if (this.eventQueue.length === 0 || !this.isOnline) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          userId: this.userId,
          events,
          deviceInfo: this.getDeviceInfo(),
          location: await this.getLocationInfo()
        })
      })

      if (!response.ok) {
        console.warn('Failed to track analytics:', response.statusText)
        // Re-queue events if tracking fails
        this.eventQueue.unshift(...events)
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error)
      // Re-queue events if network fails
      this.eventQueue.unshift(...events)
    }
  }

  // Synchronous flush for page unload
  private flushEventsSync() {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    // Use sendBeacon for reliable delivery on page unload
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        sessionId: this.sessionId,
        userId: this.userId,
        events,
        deviceInfo: this.getDeviceInfo()
      })

      navigator.sendBeacon('/api/analytics/track', data)
    }
  }

  // Start periodic flushing
  private startPeriodicFlush() {
    setInterval(() => {
      this.flushEvents()
    }, 30000) // Flush every 30 seconds
  }

  // Get device information
  private getDeviceInfo() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return {}

    const userAgent = navigator.userAgent || ''
    const screenSize = `${window.screen.width}x${window.screen.height}`
    
    // Simple device detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isTablet = /iPad|Android.*Tablet|Windows.*Touch/i.test(userAgent)
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

    // Simple browser detection
    const getBrowser = () => {
      if (!userAgent) return 'Unknown'
      if (userAgent.includes('Chrome')) return 'Chrome'
      if (userAgent.includes('Firefox')) return 'Firefox'
      if (userAgent.includes('Safari')) return 'Safari'
      if (userAgent.includes('Edge')) return 'Edge'
      return 'Unknown'
    }

    // Simple OS detection
    const getOS = () => {
      if (!userAgent) return 'Unknown'
      if (userAgent.includes('Windows')) return 'Windows'
      if (userAgent.includes('Mac')) return 'macOS'
      if (userAgent.includes('Linux')) return 'Linux'
      if (userAgent.includes('Android')) return 'Android'
      if (userAgent.includes('iOS')) return 'iOS'
      return 'Unknown'
    }

    return {
      userAgent,
      deviceType,
      browser: getBrowser(),
      os: getOS(),
      screenSize
    }
  }

  // Get location information (basic)
  private async getLocationInfo() {
    try {
      // Use timezone as basic location info
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      return { timezone }
    } catch (error) {
      return { timezone: 'Unknown' }
    }
  }

  // Helper functions
  private generateSessionId(): string {
    return `session_${uuidv4()}_${Date.now()}`
  }

  private isCriticalEvent(action: string): boolean {
    const criticalEvents = [
      'session_start',
      'session_end', 
      'user_signup',
      'user_login',
      'error_occurred',
      'payment_completed'
    ]
    return criticalEvents.includes(action)
  }

  private throttle(func: Function, limit: number) {
    let inThrottle: boolean
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // Public API for manual tracking
  public track = {
    // Study-specific tracking
    studySessionStarted: (duration: number, subject: string) => {
      this.trackStudyAction('study_session_started', { duration, subject })
    },
    
    studySessionCompleted: (duration: number, subject: string, achievement?: string) => {
      this.trackStudyAction('study_session_completed', { duration, subject, achievement })
    },

    // AI feature tracking
    aiSummaryGenerated: (success: boolean, contentLength: number, processingTime: number) => {
      this.trackAIUsage('ai_summary', success, processingTime)
      this.trackActivity({
        action: 'ai_summary_generated',
        category: 'ai',
        value: success ? 1 : 0,
        metadata: { contentLength, processingTime }
      })
    },

    aiFlashcardsCreated: (cardCount: number, subject: string) => {
      this.trackAIUsage('ai_flashcards', true)
      this.trackActivity({
        action: 'ai_flashcards_created',
        category: 'ai',
        value: cardCount,
        metadata: { cardCount, subject }
      })
    },

    aiQuizTaken: (score: number, totalQuestions: number, subject: string) => {
      this.trackAIUsage('ai_quiz', true)
      this.trackActivity({
        action: 'ai_quiz_completed',
        category: 'ai',
        value: score,
        metadata: { score, totalQuestions, subject, percentage: (score / totalQuestions) * 100 }
      })
    },

    // Social/partnership tracking
    partnerMatched: (partnerId: string, matchScore: number) => {
      this.trackSocialAction('partner_matched', partnerId, { matchScore })
    },

    messagesSent: (recipientId: string, messageLength: number) => {
      this.trackSocialAction('message_sent', recipientId, { messageLength })
    },

    studySessionJoined: (sessionId: string, sessionType: string) => {
      this.trackSocialAction('study_session_joined', undefined, { sessionId, sessionType })
    },

    // Settings and preferences
    settingsChanged: (section: string, setting: string, oldValue: any, newValue: any) => {
      this.trackSettingsChange(`${section}_${setting}`, oldValue, newValue)
    },

    // Goal and achievement tracking
    goalCreated: (goalType: string, targetValue: number) => {
      this.trackActivity({
        action: 'goal_created',
        category: 'goals',
        label: goalType,
        value: targetValue
      })
    },

    goalCompleted: (goalType: string, actualValue: number, timeToComplete: number) => {
      this.trackActivity({
        action: 'goal_completed',
        category: 'goals',
        label: goalType,
        value: actualValue,
        metadata: { timeToComplete }
      })
    },

    // Feature usage tracking
    featureUsed: (featureName: string, category: string, success: boolean = true) => {
      this.trackActivity({
        action: 'feature_used',
        category,
        label: featureName,
        value: success ? 1 : 0
      })
    },

    // Error tracking
    errorOccurred: (errorType: string, errorMessage: string, context?: Record<string, any>) => {
      this.trackError(errorMessage, { errorType, ...context })
    },

    // Custom events
    customEvent: (action: string, category: string, label?: string, value?: number, metadata?: Record<string, any>) => {
      this.trackActivity({ action, category, label, value, metadata })
    }
  }

  // Update user ID when user logs in
  setUserId(userId: string) {
    this.userId = userId
    this.trackActivity({
      action: 'user_identified',
      category: 'auth',
      metadata: { userId }
    })
  }

  // Track page changes (for SPA)
  onPageChange(path: string, title?: string) {
    this.trackPageView(path, title)
  }

  // Get session statistics
  getSessionStats() {
    const now = new Date()
    const sessionDuration = Math.round((now.getTime() - this.sessionStartTime.getTime()) / 1000)
    const pageTime = Math.round((now.getTime() - this.pageStartTime.getTime()) / 1000)

    return {
      sessionId: this.sessionId,
      sessionDuration,
      currentPageTime: pageTime,
      eventsTracked: this.eventQueue.length,
      userId: this.userId
    }
  }

  // Disable tracking (for privacy)
  disable() {
    this.isTracking = false
    this.flushEvents() // Send remaining events
  }

  // Enable tracking
  enable() {
    this.isTracking = true
  }
}

// Export singleton instance
export const activityTracker = ActivityTracker.getInstance()

// Auto-initialize for client-side usage
if (typeof window !== 'undefined') {
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Will be initialized by the app with user ID
    })
  }
}