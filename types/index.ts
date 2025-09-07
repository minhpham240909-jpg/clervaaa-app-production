import { 
  User, 
  Subject, 
  StudyGroup, 
  StudySession, 
  StudyRequest, 
  Message, 
  Review,
  PersonalStudySession,
  Partnership,
  Goal,
  Achievement,
  UserAchievement,
  ChatbotMessage,
  UserSubject,
  StudyGroupMember,
  StudySessionParticipant,
  ChatParticipant,
  MessageReaction,
  Call,
  CallParticipant,
  Reminder,
  Assignment,
  Event,
  EventAttendee,
  UserMetric
} from '@prisma/client'

// Extended types with relations
export type UserWithSubjects = User & {
  subjects: (UserSubject & {
    subject: Subject
  })[]
}

export type StudyGroupWithDetails = StudyGroup & {
  subject: Subject
  members: (StudyGroupMember & {
    user: User
  })[]
  _count: {
    members: number
  }
}

export type StudySessionWithDetails = StudySession & {
  organizer: User
  studyGroup?: StudyGroup & {
    subject: Subject
  }
  _count: {
    messages: number
  }
}

export type StudyRequestWithUsers = StudyRequest & {
  sender: User
  receiver: User
}

export type MessageWithUser = Message & {
  sender: User
}

export type ReviewWithUsers = Review & {
  author: User
  target: User
}

// Form types
export interface OnboardingFormData {
  name: string
  bio?: string
  university?: string
  major?: string
  year?: string
  location?: string
  timezone?: string
  studyGoals: string[]
  subjects: {
    id: string
    skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
    isTeaching: boolean
    isLearning: boolean
  }[]
  availability: {
    [key: string]: {
      available: boolean
      times: { start: string; end: string }[]
    }
  }
}

export interface StudyGroupFormData {
  name: string
  description?: string
  subjectId: string
  maxMembers: number
  isPrivate: boolean
  meetingType: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID'
  location?: string
  tags: string[]
  schedule?: {
    recurring: boolean
    frequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
    dayOfWeek?: number
    time?: string
  }
}

export interface StudySessionFormData {
  title: string
  description?: string
  studyGroupId?: string
  startTime: Date
  endTime: Date
  location?: string
  meetingLink?: string
  maxParticipants?: number
}

export interface SearchFilters {
  subjects?: string[]
  skillLevels?: string[]
  meetingTypes?: string[]
  availability?: {
    days: string[]
    timeRange: { start: string; end: string }
  }
  location?: string
  university?: string
  maxDistance?: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Real-time types
export interface ChatMessage {
  id: string
  content: string
  senderId: string
  sender: {
    id: string
    name: string
    image?: string
  }
  timestamp: Date
  type: 'text' | 'image' | 'file'
}

export interface OnlineUser {
  id: string
  name: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen?: Date
}

// Notification types
export interface Notification {
  id: string
  type: 'STUDY_REQUEST' | 'GROUP_INVITE' | 'SESSION_REMINDER' | 'NEW_MESSAGE' | 'REVIEW_RECEIVED'
  title: string
  message: string
  read: boolean
  createdAt: Date
  data?: any
}

// Matching algorithm types
export interface MatchScore {
  userId: string
  score: number
  factors: {
    subjectCompatibility: number
    scheduleCompatibility: number
    locationCompatibility: number
    skillLevelCompatibility: number
    personalityCompatibility: number
  }
}

export interface StudyMatch {
  user: User
  score: MatchScore
  sharedSubjects: Subject[]
  compatibilityReasons: string[]
}

// New Study-Focused Types

export type UserWithProfile = User & {
  subjects: (UserSubject & {
    subject: Subject
  })[]
  partnerships: (Partnership & {
    partner: User
    subject?: Subject
  })[]
  goals: (Goal & {
    subject?: Subject
  })[]
  achievements: (UserAchievement & {
    achievement: Achievement
  })[]
  personalStudySessions: PersonalStudySession[]
}

export type PersonalStudySessionWithDetails = PersonalStudySession & {
  user: User
  subject?: Subject
}

export type PartnershipWithDetails = Partnership & {
  user: User
  partner: User
  subject?: Subject
}

export type GoalWithDetails = Goal & {
  user: User
  subject?: Subject
}

export type AchievementWithProgress = Achievement & {
  userAchievements: UserAchievement[]
}



export type ChatbotMessageWithUser = ChatbotMessage & {
  user: User
}

// Form Types for New Features

export interface PersonalStudySessionFormData {
  title: string
  description?: string
  subjectId?: string
  startTime: Date
  endTime?: Date
  sessionType: string
  topics: string[]
  notes?: string
  location?: string
  planned: boolean
}

export interface PartnershipFormData {
  partnerId: string
  type: string
  subjectId?: string
  notes?: string
}

export interface GoalFormData {
  title: string
  description?: string
  type: string
  targetValue: number
  unit: string
  deadline?: Date
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category?: string
  subjectId?: string
  isPublic: boolean
  rewards: string[]
}

export interface ProgressFormData {
  metric: string
  value: number
  subjectId?: string
  goalId?: string
  sessionId?: string
  notes?: string
  date: Date
}

export interface ChatbotFormData {
  message: string
  messageType: string
  context?: any
  sessionId?: string
}

// Analytics and Dashboard Types

export interface StudyAnalytics {
  totalHours: number
  totalSessions: number
  averageSessionLength: number
  currentStreak: number
  longestStreak: number
  totalPoints: number
  goalsCompleted: number
  partnershipsFormed: number
  subjectsStudied: number
  weeklyProgress: {
    week: string
    hours: number
    sessions: number
  }[]
  subjectBreakdown: {
    subject: Subject
    hours: number
    sessions: number
    progress: number
  }[]
  achievements: {
    total: number
    recent: UserAchievement[]
    byCategory: {
      category: string
      count: number
    }[]
  }
}

export interface StudyStreakData {
  current: number
  longest: number
  dates: Date[]
  isActive: boolean
}

export interface StudyGoalProgress {
  goal: Goal
  progress: number
  daysRemaining?: number
  isOnTrack: boolean
  projection: number
}

export interface PartnershipStats {
  total: number
  active: number
  byType: {
    type: string
    count: number
  }[]
  topPartners: (User & {
    sessionsCount: number
    rating: number
  })[]
}

// Gamification Types

export interface LevelSystem {
  currentLevel: number
  pointsInLevel: number
  pointsToNextLevel: number
  totalPoints: number
  levelName: string
  levelIcon: string
}

export interface AchievementProgress {
  achievement: Achievement
  progress: number
  isUnlocked: boolean
  unlockedAt?: Date
  criteria: any
}

// AI Chatbot Types

export interface ChatbotContext {
  currentGoals: Goal[]
  recentSessions: PersonalStudySession[]
  studyLevel: string
  subjects: Subject[]
  preferences: any
  streak: number
}

export interface ChatbotResponse {
  message: string
  type: 'text' | 'action' | 'suggestion'
  actions?: {
    type: 'create_goal' | 'schedule_session' | 'find_partner' | 'set_reminder'
    data: any
  }[]
  suggestions?: string[]
}