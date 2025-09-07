import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { logger } from '@/lib/logger'

interface OnboardingData {
  studyStyle: string
  subjects: string[]
  ageGroup: string
  gradeLevel: string
  studyGoals: string[]
  preferredTime: string
  sessionDuration: number
  studyEnvironment: string
}

export const useOnboardingData = () => {
  const { data: session } = useSession()
  const { updateStudyPreferences } = useSettings()
  const [isLoading, setIsLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)

  useEffect(() => {
    if (session?.user) {
      loadOnboardingData()
    }
  }, [session])

  const loadOnboardingData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/onboarding')
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.completed && result.data) {
          setOnboardingData(result.data)
          
          // Apply onboarding data to settings if not already applied
          if (!result.data.appliedToSettings) {
            await applyOnboardingToSettings(result.data)
          }
        }
      }
    } catch (error) {
      logger.error('Error loading onboarding data', error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyOnboardingToSettings = async (data: OnboardingData) => {
    try {
      const studyPreferences = {
        learning_style: data.studyStyle as 'visual' | 'auditory' | 'kinesthetic' | 'reading',
        preferred_time: data.preferredTime as 'morning' | 'afternoon' | 'evening' | 'night',
        session_duration: data.sessionDuration,
        study_environment: data.studyEnvironment as 'quiet' | 'background_music' | 'ambient' | 'collaborative',
        age_group: data.ageGroup as 'elementary' | 'middle' | 'high' | 'college',
        grade_level: data.gradeLevel,
        selected_goals: data.studyGoals,
        subjects: data.subjects?.map((subject: string, index: number) => ({
          id: `onboarding-${Date.now()}-${index}`,
          name: subject,
          level: 'intermediate' as const
        })) || []
      }

      await updateStudyPreferences(studyPreferences)
      
      // Mark as applied to prevent re-application
      await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appliedToSettings: true
        })
      })

      logger.info('Onboarding data applied to settings successfully')
    } catch (error) {
      logger.error('Error applying onboarding data to settings', error as Error)
    }
  }

  return {
    onboardingData,
    isLoading,
    loadOnboardingData,
    applyOnboardingToSettings
  }
}
