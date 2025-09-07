import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { completed, skipped, data } = await request.json()

    // Prepare user update data
    const updateData: any = {
      profileComplete: completed
    }

    // If not skipped, save the onboarding data to user preferences
    if (!skipped && data) {
      // Map onboarding data to user fields
      if (data.studyStyle) {
        updateData.learningStyle = data.studyStyle
      }

      if (data.subjects && data.subjects.length > 0) {
        updateData.preferredSubjects = JSON.stringify(data.subjects)
      }

      if (data.ageGroup || data.gradeLevel) {
        updateData.academicLevel = data.ageGroup || 'college'
        updateData.year = data.gradeLevel || ''
      }

      if (data.studyGoals && data.studyGoals.length > 0) {
        updateData.studyGoals = JSON.stringify(data.studyGoals)
      }

      // Create or update study preferences
      const studyPreferences = {
        learning_style: data.studyStyle,
        preferred_time: data.preferredTime || 'morning',
        session_duration: data.sessionDuration || 60,
        study_environment: data.studyEnvironment || 'quiet',
        subjects: data.subjects?.map((subject: string, index: number) => ({
          id: `${Date.now()}-${index}`,
          name: subject,
          level: 'intermediate'
        })) || [],
        study_goals: {
          daily_study_time: data.sessionDuration || 60,
          weekly_sessions: 5,
          focus_improvement: data.studyGoals?.includes('focus_improvement') || false,
          skill_development: data.studyGoals?.includes('skill_development') || false,
          exam_preparation: data.studyGoals?.includes('exam_prep') || false,
          collaborative_learning: data.studyGoals?.includes('collaborative_learning') || false
        },
        availability: {
          monday: { available: true, start: '09:00', end: '17:00' },
          tuesday: { available: true, start: '09:00', end: '17:00' },
          wednesday: { available: true, start: '09:00', end: '17:00' },
          thursday: { available: true, start: '09:00', end: '17:00' },
          friday: { available: true, start: '09:00', end: '17:00' },
          saturday: { available: true, start: '10:00', end: '16:00' },
          sunday: { available: true, start: '10:00', end: '16:00' }
        },
        group_size_preference: 'small',
        break_frequency: 25,
        reminder_advance: 15,
        auto_scheduling: false
      }

      updateData.preferences = JSON.stringify({
        study: studyPreferences,
        onboardingCompleted: true,
        onboardingData: data
      })
    }

    // Update user in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    })

    logger.info('User onboarding completed', {
      userId: session.user.id,
      skipped,
      completed
    })

    return NextResponse.json({ 
      success: true, 
      message: skipped ? 'Onboarding skipped' : 'Onboarding completed successfully' 
    })

  } catch (error) {
    logger.error('Error saving onboarding data', error as Error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        profileComplete: true,
        preferences: true,
        learningStyle: true,
        preferredSubjects: true,
        academicLevel: true,
        year: true,
        studyGoals: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse stored preferences
    let onboardingData = null
    if (user.preferences) {
      try {
        const preferences = JSON.parse(user.preferences)
        onboardingData = preferences.onboardingData || null
      } catch (error) {
        logger.error('Error parsing user preferences', error as Error)
      }
    }

    return NextResponse.json({
      completed: user.profileComplete || false,
      data: onboardingData,
      userProfile: {
        learningStyle: user.learningStyle,
        subjects: user.preferredSubjects ? JSON.parse(user.preferredSubjects) : [],
        academicLevel: user.academicLevel,
        year: user.year,
        studyGoals: user.studyGoals ? JSON.parse(user.studyGoals) : []
      }
    })

  } catch (error) {
    logger.error('Error fetching onboarding data', error as Error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding data' },
      { status: 500 }
    )
  }
}
