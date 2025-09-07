'use client'

import { useEffect, useCallback, useState } from 'react'
import { useAppState } from '@/lib/contexts/AppStateContext'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { useSession } from 'next-auth/react'

interface UseReactiveUpdatesProps {
  onProfileUpdate?: () => void
  onSettingsUpdate?: (section: string, newSettings: any) => void
  onStatsUpdate?: () => void
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useReactiveUpdates = ({
  onProfileUpdate,
  onSettingsUpdate,
  onStatsUpdate,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}: UseReactiveUpdatesProps = {}) => {
  const { data: session } = useSession()
  const { 
    userProfile, 
    dashboardStats, 
    lastUpdated,
    subscribeToUpdates,
    forceRefresh
  } = useAppState()
  const { settings } = useSettings()
  
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Subscribe to profile and stats updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates(() => {
      onProfileUpdate?.()
      onStatsUpdate?.()
    })
    
    return unsubscribe
  }, []) // Remove dependencies to prevent infinite loops

  // Listen for settings updates via custom events
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      const { section, newSettings } = event.detail
      onSettingsUpdate?.(section, newSettings)
      
      // Trigger profile/stats callbacks since settings can affect them
      onProfileUpdate?.()
      onStatsUpdate?.()
    }

    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener)
    
    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener)
    }
  }, []) // Remove dependencies to prevent infinite loops

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !session?.user) return

    const interval = setInterval(async () => {
      try {
        setIsRefreshing(true)
        await forceRefresh()
      } catch (error) {
        console.error('Auto-refresh failed:', error)
      } finally {
        setIsRefreshing(false)
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, session?.user?.id, refreshInterval]) // Remove forceRefresh dependency

  // Manual refresh function
  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true)
      await forceRefresh()
    } catch (error) {
      console.error('Manual refresh failed:', error)
      throw error
    } finally {
      setIsRefreshing(false)
    }
  }, [forceRefresh])

  return {
    userProfile,
    dashboardStats,
    settings,
    lastUpdated,
    isRefreshing,
    refresh
  }
}

// Specialized hooks for specific components
export const useDashboardUpdates = () => {
  const [dashboardKey, setDashboardKey] = useState(0)
  
  return useReactiveUpdates({
    onProfileUpdate: () => setDashboardKey(prev => prev + 1),
    onSettingsUpdate: () => setDashboardKey(prev => prev + 1),
    onStatsUpdate: () => setDashboardKey(prev => prev + 1),
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute for dashboard
  })
}

export const useProfileUpdates = () => {
  const [profileKey, setProfileKey] = useState(0)
  
  return useReactiveUpdates({
    onProfileUpdate: () => setProfileKey(prev => prev + 1),
    onSettingsUpdate: (section: any) => {
      // Only refresh profile if study-related settings changed
      if (section === 'study' || section === 'appearance') {
        setProfileKey(prev => prev + 1)
      }
    }
  })
}

export const useSettingsUpdates = () => {
  const [settingsKey, setSettingsKey] = useState(0)
  
  return useReactiveUpdates({
    onSettingsUpdate: () => setSettingsKey(prev => prev + 1),
    onProfileUpdate: () => setSettingsKey(prev => prev + 1)
  })
}