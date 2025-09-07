'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { logger } from '@/lib/logger'

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  color_scheme: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  font_size: 'small' | 'medium' | 'large' | 'extra-large'
  sidebar_style: 'default' | 'compact' | 'minimal'
  animations: boolean
  high_contrast: boolean
  reduce_motion: boolean
  show_profile_photos: boolean
  compact_mode: boolean
  focus_mode: boolean
}

interface StudyPreferences {
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  preferred_time: 'morning' | 'afternoon' | 'evening' | 'night'
  session_duration: number
  break_frequency: number
  group_size_preference: 'individual' | 'small' | 'medium' | 'large'
  difficulty_preference: 'beginner' | 'intermediate' | 'advanced' | 'mixed'
  study_environment: 'quiet' | 'background_music' | 'ambient' | 'collaborative'
  reminder_advance: number
  availability_buffer: number
  auto_scheduling: boolean
  break_type: 'short' | 'long' | 'flexible'
  // New onboarding fields
  age_group?: 'elementary' | 'middle' | 'high' | 'college'
  grade_level?: string
  selected_goals?: string[]
  subjects: Array<{
    id: string
    name: string
    level: 'beginner' | 'intermediate' | 'advanced'
  }>
  study_goals: {
    daily_study_time: number
    weekly_sessions: number
    focus_improvement: boolean
    skill_development: boolean
    exam_preparation: boolean
    collaborative_learning: boolean
  }
  availability: Record<string, {
    available: boolean
    start: string
    end: string
  }>
}

interface NotificationSettings {
  email_enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  sound_enabled: boolean
  do_not_disturb: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  categories: Record<string, {
    email: boolean
    push: boolean
    inApp: boolean
  }>
}

interface Settings {
  appearance: AppearanceSettings
  study: StudyPreferences
  notifications: NotificationSettings
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (section: keyof Settings, newSettings: Partial<Settings[keyof Settings]>) => Promise<void>
  updateAppearanceSettings: (newSettings: Partial<AppearanceSettings>) => Promise<void>
  updateStudyPreferences: (newSettings: Partial<StudyPreferences>) => Promise<void>
  updateNotificationSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>
  isLoading: boolean
  error: string | null
}

const defaultSettings: Settings = {
  appearance: {
    theme: 'light',
    color_scheme: 'blue',
    font_size: 'medium',
    sidebar_style: 'default',
    animations: true,
    high_contrast: false,
    reduce_motion: false,
    show_profile_photos: true,
    compact_mode: false,
    focus_mode: false
  },
  study: {
    learning_style: 'visual',
    preferred_time: 'morning',
    session_duration: 60,
    break_frequency: 25,
    group_size_preference: 'small',
    difficulty_preference: 'intermediate',
    study_environment: 'quiet',
    reminder_advance: 15,
    availability_buffer: 30,
    auto_scheduling: true,
    break_type: 'short',
    age_group: undefined,
    grade_level: undefined,
    selected_goals: [],
    subjects: [
      { id: '1', name: 'Mathematics', level: 'intermediate' },
      { id: '2', name: 'Computer Science', level: 'advanced' },
      { id: '3', name: 'Physics', level: 'beginner' }
    ],
    study_goals: {
      daily_study_time: 120,
      weekly_sessions: 10,
      focus_improvement: true,
      skill_development: true,
      exam_preparation: false,
      collaborative_learning: true
    },
    availability: {
      monday: { available: true, start: '09:00', end: '17:00' },
      tuesday: { available: true, start: '09:00', end: '17:00' },
      wednesday: { available: true, start: '09:00', end: '17:00' },
      thursday: { available: true, start: '09:00', end: '17:00' },
      friday: { available: true, start: '09:00', end: '17:00' },
      saturday: { available: true, start: '10:00', end: '16:00' },
      sunday: { available: false, start: '10:00', end: '16:00' }
    }
  },
  notifications: {
    email_enabled: true,
    push_enabled: true,
    in_app_enabled: true,
    sound_enabled: true,
    do_not_disturb: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    categories: {
      study_reminders: { email: true, push: true, inApp: true },
      partner_requests: { email: true, push: true, inApp: true },
      messages: { email: false, push: true, inApp: true },
      session_updates: { email: true, push: true, inApp: true },
      goal_progress: { email: true, push: false, inApp: true },
      achievements: { email: false, push: true, inApp: true }
    }
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      loadSettings()
    } else {
      // Load from localStorage for non-authenticated users
      loadLocalSettings()
      setIsLoading(false)
    }
  }, [session])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      } else {
        throw new Error('Failed to load settings')
      }
    } catch (err) {
      logger.error('Failed to load settings', err instanceof Error ? err : new Error(String(err)))
      setError('Failed to load settings')
      // Fallback to localStorage
      loadLocalSettings()
    } finally {
      setIsLoading(false)
    }
  }

  const loadLocalSettings = () => {
    try {
      const stored = localStorage.getItem('studybuddy-settings')
      if (stored) {
        const parsedSettings = JSON.parse(stored)
        setSettings({ ...defaultSettings, ...parsedSettings })
      }
    } catch (err) {
      logger.error('Failed to load local settings', err instanceof Error ? err : new Error(String(err)))
    }
  }

  const saveToLocal = (newSettings: Settings) => {
    try {
      localStorage.setItem('studybuddy-settings', JSON.stringify(newSettings))
    } catch (err) {
      logger.error('Failed to save to localStorage', err instanceof Error ? err : new Error(String(err)))
    }
  }

  const updateSettings = async (section: keyof Settings, newSettings: Partial<Settings[keyof Settings]>) => {
    try {
      setError(null)
      const updatedSettings = {
        ...settings,
        [section]: {
          ...settings[section],
          ...newSettings
        }
      }

      // Optimistically update local state first
      setSettings(updatedSettings)
      saveToLocal(updatedSettings)

      if (session?.user) {
        const response = await fetch('/api/user/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ [section]: updatedSettings[section] })
        })

        if (!response.ok) {
          throw new Error('Failed to save settings to server')
        }
      }

      toast.success('Settings updated successfully!')
      
      // Trigger custom event for other components to react to settings changes
      window.dispatchEvent(new CustomEvent('settingsUpdated', {
        detail: { section, newSettings, fullSettings: updatedSettings }
      }))
      
    } catch (err) {
      logger.error('Failed to update settings', err instanceof Error ? err : new Error(String(err)))
      setError('Failed to save settings')
      toast.error('Failed to update settings')
      // Revert local changes
      loadSettings()
    }
  }

  const updateAppearanceSettings = (newSettings: Partial<AppearanceSettings>) => {
    return updateSettings('appearance', newSettings)
  }

  const updateStudyPreferences = (newSettings: Partial<StudyPreferences>) => {
    return updateSettings('study', newSettings)
  }

  const updateNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
    return updateSettings('notifications', newSettings)
  }

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    updateAppearanceSettings,
    updateStudyPreferences,
    updateNotificationSettings,
    isLoading,
    error
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}