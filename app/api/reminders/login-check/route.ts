import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        reminders: {
          where: {
            title: 'Welcome Back - Study Reminder',
            isActive: true
          }
        },
        userSubjects: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has preferences set and no existing login reminder
    const hasPreferences = user.userSubjects.length > 0 && user.learningStyle && user.availabilityHours
    const hasLoginReminder = user.reminders.length > 0

    if (hasPreferences && !hasLoginReminder) {
      // Create a welcome back reminder
      const reminder = await prisma.reminder.create({
        data: {
          userId: user.id,
          title: 'Welcome Back - Study Reminder',
          description: 'Welcome back! Don\'t forget to check your study goals and connect with your study partners. Keep up the great work!',
          reminderTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
          isActive: true,
          completed: false,
          recurring: false
        }
      })

      // Also create a study session reminder for later
      await prisma.reminder.create({
        data: {
          userId: user.id,
          title: 'Time to Study!',
          description: 'Based on your preferences, it\'s a great time to start a study session. Find a partner or review your materials.',
          reminderTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          isActive: true,
          completed: false,
          recurring: false
        }
      })

      return NextResponse.json({
        reminderCreated: true,
        reminder: {
          id: reminder.id,
          title: reminder.title,
          description: reminder.description,
          reminderTime: reminder.reminderTime
        }
      })
    }

    return NextResponse.json({
      reminderCreated: false,
      hasPreferences,
      hasLoginReminder
    })
  } catch (error) {
    console.error('Login reminder check error:', error)
    return NextResponse.json(
      { error: 'Failed to check login reminders' },
      { status: 500 }
    )
  }
}
