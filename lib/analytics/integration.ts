// Analytics Integration Guide and Helper Functions
// This file provides utilities for integrating the activity tracker throughout the app

import { activityTracker } from './activityTracker'

// Initialize tracking for authenticated users
export function initializeAnalytics(userId?: string) {
  if (typeof window !== 'undefined') {
    activityTracker.initialize(userId)
  }
}

// Common tracking patterns for Clerva app

// Authentication Events
export const trackAuth = {
  userLogin: (userId: string, method: 'email' | 'google' | 'github') => {
    activityTracker.setUserId(userId)
    activityTracker.track.customEvent('user_login', 'auth', method, 1, { loginMethod: method })
  },

  userSignup: (userId: string, method: 'email' | 'google' | 'github') => {
    activityTracker.setUserId(userId)
    activityTracker.track.customEvent('user_signup', 'auth', method, 1, { signupMethod: method })
  },

  userLogout: () => {
    activityTracker.track.customEvent('user_logout', 'auth')
  }
}

// Study Tracking Events
export const trackStudy = {
  sessionStarted: (subject: string, studyType: 'solo' | 'partner' | 'group', duration?: number) => {
    activityTracker.track.studySessionStarted(duration || 0, subject)
    activityTracker.track.customEvent('study_session_started', 'study', studyType, 1, { subject, studyType })
  },

  sessionCompleted: (subject: string, duration: number, achievements?: string[]) => {
    activityTracker.track.studySessionCompleted(duration, subject, achievements?.join(','))
  },

  goalSet: (goalType: 'daily' | 'weekly' | 'monthly', targetValue: number) => {
    activityTracker.track.goalCreated(goalType, targetValue)
  },

  goalAchieved: (goalType: string, actualValue: number, timeToComplete: number) => {
    activityTracker.track.goalCompleted(goalType, actualValue, timeToComplete)
  },

  flashcardReview: (cardCount: number, subject: string, correctAnswers: number) => {
    const accuracy = (correctAnswers / cardCount) * 100
    activityTracker.track.customEvent('flashcard_review', 'study', subject, accuracy, {
      cardCount,
      correctAnswers,
      accuracy
    })
  }
}

// AI Feature Tracking
export const trackAI = {
  summaryGenerated: (contentLength: number, processingTime: number, success: boolean = true) => {
    activityTracker.track.aiSummaryGenerated(success, contentLength, processingTime)
  },

  flashcardsCreated: (cardCount: number, subject: string) => {
    activityTracker.track.aiFlashcardsCreated(cardCount, subject)
  },

  quizCompleted: (score: number, totalQuestions: number, subject: string, timeTaken: number) => {
    activityTracker.track.aiQuizTaken(score, totalQuestions, subject)
    activityTracker.track.customEvent('quiz_completed', 'ai', subject, score, {
      totalQuestions,
      percentage: (score / totalQuestions) * 100,
      timeTaken
    })
  },

  chatbotInteraction: (messageCount: number, helpful: boolean, topic?: string) => {
    activityTracker.track.customEvent('chatbot_interaction', 'ai', topic, helpful ? 1 : 0, {
      messageCount,
      helpful,
      topic
    })
  }
}

// Social/Partnership Tracking
export const trackSocial = {
  partnerMatched: (partnerId: string, matchScore: number, preferences: any) => {
    activityTracker.track.partnerMatched(partnerId, matchScore)
    activityTracker.track.customEvent('partnership_created', 'social', 'match', matchScore, {
      partnerId,
      preferences: JSON.stringify(preferences)
    })
  },

  messageSent: (recipientId: string, messageLength: number, messageType: 'text' | 'voice' | 'file') => {
    activityTracker.track.messagesSent(recipientId, messageLength)
    activityTracker.track.customEvent('message_sent', 'social', messageType, messageLength, {
      recipientId,
      messageType
    })
  },

  studySessionJoined: (sessionId: string, sessionType: 'video' | 'voice' | 'text', participantCount: number) => {
    activityTracker.track.studySessionJoined(sessionId, sessionType)
    activityTracker.track.customEvent('group_session_joined', 'social', sessionType, participantCount, {
      sessionId,
      participantCount
    })
  },

  profileUpdated: (section: 'basic' | 'study_preferences' | 'goals' | 'privacy', changes: string[]) => {
    activityTracker.track.customEvent('profile_updated', 'social', section, changes.length, {
      section,
      changes: changes.join(',')
    })
  }
}

// Settings and Configuration Tracking
export const trackSettings = {
  settingChanged: (category: 'privacy' | 'notifications' | 'study' | 'appearance', setting: string, oldValue: any, newValue: any) => {
    activityTracker.track.settingsChanged(category, setting, oldValue, newValue)
  },

  featureToggled: (featureName: string, enabled: boolean) => {
    activityTracker.track.customEvent('feature_toggled', 'settings', featureName, enabled ? 1 : 0, {
      enabled
    })
  },

  themeChanged: (oldTheme: string, newTheme: string) => {
    activityTracker.track.customEvent('theme_changed', 'settings', newTheme, 1, {
      oldTheme,
      newTheme
    })
  }
}

// Performance and Error Tracking
export const trackSystem = {
  pageLoadTime: (path: string, loadTime: number) => {
    activityTracker.track.customEvent('page_load_time', 'performance', path, loadTime, {
      path,
      loadTime
    })
  },

  errorOccurred: (errorType: 'js_error' | 'api_error' | 'network_error', errorMessage: string, context?: any) => {
    activityTracker.track.errorOccurred(errorType, errorMessage, context)
  },

  featureUsed: (featureName: string, category: string, success: boolean = true) => {
    activityTracker.track.featureUsed(featureName, category, success)
  },

  searchPerformed: (query: string, results: number, category: 'users' | 'content' | 'help') => {
    activityTracker.track.customEvent('search_performed', 'interaction', category, results, {
      query: query.length > 50 ? query.substring(0, 50) + '...' : query,
      queryLength: query.length,
      resultsCount: results
    })
  }
}

// Form and Interaction Tracking
export const trackInteraction = {
  formSubmitted: (formName: string, success: boolean, formData?: any, validationErrors?: string[]) => {
    activityTracker.trackFormSubmission(formName, success, formData)
    if (validationErrors && validationErrors.length > 0) {
      activityTracker.track.customEvent('form_validation_error', 'interaction', formName, validationErrors.length, {
        errors: validationErrors.join(',')
      })
    }
  },

  buttonClicked: (buttonName: string, context: string, value?: number) => {
    activityTracker.track.customEvent('button_clicked', 'interaction', buttonName, value, {
      context
    })
  },

  linkClicked: (linkText: string, destination: string, isExternal: boolean) => {
    activityTracker.track.customEvent('link_clicked', 'navigation', isExternal ? 'external' : 'internal', 1, {
      linkText: linkText.substring(0, 50),
      destination,
      isExternal
    })
  },

  modalOpened: (modalName: string, trigger: string) => {
    activityTracker.track.customEvent('modal_opened', 'interaction', modalName, 1, {
      trigger
    })
  },

  dropdownUsed: (dropdownName: string, selectedValue: string) => {
    activityTracker.track.customEvent('dropdown_used', 'interaction', dropdownName, 1, {
      selectedValue
    })
  }
}

// Engagement Tracking
export const trackEngagement = {
  timeSpentOnPage: (path: string, timeInSeconds: number) => {
    activityTracker.track.customEvent('time_on_page', 'engagement', path, timeInSeconds)
  },

  scrollDepthReached: (path: string, depthPercentage: number) => {
    if (depthPercentage % 25 === 0) { // Track at 25%, 50%, 75%, 100%
      activityTracker.track.customEvent('scroll_depth', 'engagement', path, depthPercentage)
    }
  },

  videoWatched: (videoId: string, duration: number, completionPercentage: number) => {
    activityTracker.track.customEvent('video_watched', 'engagement', videoId, completionPercentage, {
      duration,
      completionPercentage
    })
  },

  downloadInitiated: (fileName: string, fileType: string, fileSize?: number) => {
    activityTracker.track.customEvent('download_initiated', 'engagement', fileType, fileSize, {
      fileName,
      fileType
    })
  }
}

// Convenience function to track page changes in Next.js App Router
export function trackPageChange(path: string, title?: string) {
  activityTracker.onPageChange(path, title)
  
  // Also track as a custom event for additional context
  activityTracker.track.customEvent('page_changed', 'navigation', path, 1, {
    title: title || document.title,
    referrer: document.referrer
  })
}

// Initialize tracking when user authentication state changes
export function handleAuthStateChange(user: any) {
  if (user) {
    initializeAnalytics(user.id)
    trackAuth.userLogin(user.id, user.provider || 'email')
  } else {
    trackAuth.userLogout()
  }
}

// Export the main tracker for direct access when needed
export { activityTracker }

// Helper to get current session statistics
export function getSessionStats() {
  return activityTracker.getSessionStats()
}

// Privacy controls
export function disableTracking() {
  activityTracker.disable()
}

export function enableTracking() {
  activityTracker.enable()
}