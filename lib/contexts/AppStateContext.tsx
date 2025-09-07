'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSettings } from './SettingsContext'
import { toast } from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface UserProfile {
  id?: string
  name: string
  email: string
  bio: string
  university: string
  major: string
  year: string
  location: string
  studyGoals: string
  studyLevel: string
  learningStyle: string
  preferredStudyTime: string
  subjectInterests: string[]
  points: number
  totalStudyTime: number
  streak: number
  memberSince: string
  profileVisibility: string
  showStudyHistory: boolean
  avatar?: string
  lastActive?: Date
}

interface DashboardStats {
  studyPartners: number
  upcomingSessions: number
  activeChats: number
  studyScore: number
  studyPartnersChange: string
  upcomingSessionsChange: string
  activeChatsChange: string
  studyScoreChange: string
  totalStudyTime: number
  completedSessions: number
  currentStreak: number
  monthlyGoalProgress: number
}

interface AppStateContextType {
  // User Profile
  userProfile: UserProfile | null
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshUserProfile: () => Promise<void>
  
  // Dashboard Stats
  dashboardStats: DashboardStats | null
  refreshDashboardStats: () => Promise<void>
  
  // Real-time updates
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  
  // Force refresh functions
  forceRefresh: () => Promise<void>
  subscribeToUpdates: (callback: () => void) => () => void
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}

interface AppStateProviderProps {
  children: ReactNode
}

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const { data: session } = useSession()
  const { settings } = useSettings()
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [updateCallbacks, setUpdateCallbacks] = useState<Set<() => void>>(new Set())

  // Initialize data when session is available
  useEffect(() => {
    if (session?.user) {
      initializeData()
    } else {
      setIsLoading(false)
    }
  }, [session])

  // Watch for settings changes and trigger profile updates
  useEffect(() => {
    if (userProfile && settings) {
      // When settings change, update related profile fields
      const profileUpdates: Partial<UserProfile> = {
        learningStyle: settings.study.learning_style,
        preferredStudyTime: settings.study.preferred_time,
        studyLevel: settings.study.difficulty_preference,
      }
      
      // Only update if there are actual changes
      const hasChanges = Object.entries(profileUpdates).some(
        ([key, value]) => userProfile[key as keyof UserProfile] !== value
      )
      
      if (hasChanges) {
        setUserProfile(prev => prev ? { ...prev, ...profileUpdates } : null)
        notifySubscribers()
      }
    }
  }, [
    settings?.study?.learning_style,
    settings?.study?.preferred_time, 
    settings?.study?.difficulty_preference,
    userProfile?.id
  ]) // More specific dependencies

  const initializeData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchDashboardStats()
      ])
    } catch (err) {
      logger.error('Failed to initialize app state', err instanceof Error ? err : new Error(String(err)))
      setError('Failed to load app data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        const profile: UserProfile = {
          name: data.name || session?.user?.name || '',
          email: data.email || session?.user?.email || '',
          bio: data.bio || '',
          university: data.institution || '',
          major: data.major || '',
          year: data.graduationYear || '',
          location: data.timezone || '',
          studyGoals: data.studyGoals || '',
          studyLevel: data.academicLevel || settings.study.difficulty_preference,
          learningStyle: data.learningStyle || settings.study.learning_style,
          preferredStudyTime: data.preferredStudyTime || settings.study.preferred_time,
          subjectInterests: data.subjectInterests || (settings.study.subjects || []).map((s: any) => s.name),
          points: data.points || 0,
          totalStudyTime: data.totalStudyTime || 0,
          streak: data.streak || 0,
          memberSince: data.memberSince || 'Jan 2024',
          profileVisibility: data.profileVisibility || 'everyone',
          showStudyHistory: data.showStudyHistory !== undefined ? data.showStudyHistory : true,
          avatar: data.avatar,
          lastActive: data.lastActive ? new Date(data.lastActive) : new Date(),
          id: data.id
        }
        
        setUserProfile(profile)
        setLastUpdated(new Date())
      }
    } catch (err) {
      logger.error('Failed to fetch user profile', err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }

  const fetchDashboardStats = async () => {
    try {
      // Try the comprehensive stats endpoint first, fallback to test endpoint
      let response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        response = await fetch('/api/dashboard/test')
      }
      
      if (response.ok) {
        const data = await response.json()
        const stats: DashboardStats = {
          studyPartners: data.studyPartners || 12,
          upcomingSessions: data.upcomingSessions || 5,
          activeChats: data.activeChats || 8,
          studyScore: data.studyScore || 85,
          studyPartnersChange: data.studyPartnersChange || '+2 this week',
          upcomingSessionsChange: data.upcomingSessionsChange || '3 this week',
          activeChatsChange: data.activeChatsChange || '2 new messages',
          studyScoreChange: data.studyScoreChange || '+5% this month',
          totalStudyTime: data.totalStudyTime || userProfile?.totalStudyTime || 124,
          completedSessions: data.completedSessions || 28,
          currentStreak: data.engagementMetrics || userProfile?.streak || 24,
          monthlyGoalProgress: data.monthlyGoalProgress || 68
        }
        
        setDashboardStats(stats)
        setLastUpdated(new Date())
      }
    } catch (err) {
      logger.error('Failed to fetch dashboard stats', err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return

    const optimisticUpdate = { ...userProfile, ...updates }
    setUserProfile(optimisticUpdate)
    notifySubscribers()

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedData = await response.json()
        setUserProfile(prev => prev ? { ...prev, ...updatedData } : null)
        setLastUpdated(new Date())
        toast.success('Profile updated successfully!')
        
        // If study-related fields changed, refresh dashboard stats
        const studyFields = ['studyLevel', 'learningStyle', 'preferredStudyTime', 'subjectInterests']
        const hasStudyUpdates = studyFields.some(field => updates.hasOwnProperty(field))
        if (hasStudyUpdates) {
          await refreshDashboardStats()
        }
      } else {
        // Revert optimistic update on failure
        setUserProfile(userProfile)
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update profile')
        throw new Error('Failed to update profile')
      }
    } catch (err) {
      setUserProfile(userProfile)
      logger.error('Failed to update user profile', err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }

  const refreshUserProfile = async () => {
    try {
      await fetchUserProfile()
      notifySubscribers()
    } catch (err) {
      setError('Failed to refresh profile')
      throw err
    }
  }

  const refreshDashboardStats = async () => {
    try {
      await fetchDashboardStats()
      notifySubscribers()
    } catch (err) {
      setError('Failed to refresh dashboard stats')
      throw err
    }
  }

  const forceRefresh = async () => {
    setIsLoading(true)
    try {
      await initializeData()
      notifySubscribers()
      toast.success('Data refreshed!')
    } catch (err) {
      toast.error('Failed to refresh data')
      throw err
    }
  }

  const subscribeToUpdates = useCallback((callback: () => void) => {
    setUpdateCallbacks(prev => new Set(prev).add(callback))
    
    return () => {
      setUpdateCallbacks(prev => {
        const next = new Set(prev)
        next.delete(callback)
        return next
      })
    }
  }, [])

  const notifySubscribers = useCallback(() => {
    updateCallbacks.forEach(callback => {
      try {
        callback()
      } catch (err) {
        logger.error('Error in update callback', err instanceof Error ? err : new Error(String(err)))
      }
    })
  }, [updateCallbacks])

  const contextValue: AppStateContextType = {
    userProfile,
    updateUserProfile,
    refreshUserProfile,
    dashboardStats,
    refreshDashboardStats,
    isLoading,
    error,
    lastUpdated,
    forceRefresh,
    subscribeToUpdates
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  )
}