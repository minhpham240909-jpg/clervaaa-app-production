import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  type: z.enum(['study_session', 'group_study', 'exam', 'assignment', 'meeting', 'reminder']),
  location: z.string().optional(),
  isAllDay: z.boolean().default(false),
  color: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    // Fetch events from multiple sources
    const [personalEvents, studySessions, goals, reminders] = await Promise.all([
      // Personal events (via EventAttendees)
      prisma.event.findMany({
        where: {
          attendees: {
            some: { userId: userId }
          },
          ...(startDate && endDate ? {
            startTime: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        }
      }).catch(() => []), // Catch if Event model doesn't exist

      // Study sessions
      prisma.studySession.findMany({
        where: {
          participants: {
            some: { userId: userId }
          },
          ...(startDate && endDate ? {
            startTime: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        },
        include: {
          studyGroup: {
            select: { name: true }
          },
          participants: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        }
      }),

      // Goals with deadlines
      prisma.goal.findMany({
        where: {
          userId: userId,
          deadline: {
            not: null,
            ...(startDate && endDate ? {
              gte: new Date(startDate),
              lte: new Date(endDate)
            } : {})
          }
        }
      }),

      // Reminders
      prisma.reminder?.findMany({
        where: {
          userId: userId,
          dueDate: {
            ...(startDate && endDate ? {
              gte: new Date(startDate),
              lte: new Date(endDate)
            } : {})
          }
        },
        include: {
          user: {
            select: { name: true }
          }
        }
      }).catch(() => []) // Catch if Reminder model doesn't exist
    ])

    // Transform all events into a unified format
    const events = [
      // Personal events
      ...(personalEvents || []).map((event: any) => ({
        id: `event-${event.id}`,
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        type: event.eventType || 'study_session',
        color: '#0EA5E9',
        location: event.location,
        isAllDay: false,
        source: 'personal'
      })),

      // Study sessions
      ...studySessions.map((session: any) => ({
        id: `session-${session.id}`,
        title: session.studyGroup?.name || session.title || 'Study Session',
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        type: 'study_session',
        color: '#3B82F6',
        location: session.location,
        isAllDay: false,
        participants: session.participants?.map((p: any) => p.user.name) || [],
        source: 'study_session'
      })),

      // Goals as deadlines
      ...goals.map((goal: any) => ({
        id: `goal-${goal.id}`,
        title: `Goal: ${goal.title}`,
        description: goal.description,
        startTime: goal.targetDate,
        endTime: goal.targetDate,
        type: 'assignment',
        color: '#F59E0B',
        isAllDay: true,
        source: 'goal'
      })),

      // Reminders
      ...(reminders || []).map((reminder: any) => ({
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        description: reminder.description,
        startTime: reminder.reminderTime,
        endTime: reminder.reminderTime,
        type: 'reminder',
        color: '#EC4899',
        isAllDay: false,
        source: 'reminder'
      }))
    ]

    // Sort by start time
    events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    return NextResponse.json(events)

  } catch (error) {
    console.error('Calendar events fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const eventData = createEventSchema.parse(body)

    // Validate end time is after start time
    if (eventData.endTime <= eventData.startTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // For now, create a personal event
    // In a real app, you might create different types based on the event type
    const newEvent = {
      title: eventData.title,
      description: eventData.description,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      eventType: eventData.type,
      location: eventData.location
    }

    // Try to create in Event table if it exists, otherwise create as a PersonalStudySession
    let createdEvent
    try {
      createdEvent = await prisma.event.create({
        data: {
          ...newEvent,
          attendees: {
            create: {
              userId: userId,
              status: 'attending'
            }
          }
        }
      })
    } catch (error) {
      // If Event model doesn't exist, create as PersonalStudySession
      createdEvent = await prisma.personalStudySession.create({
        data: {
          userId: userId,
          title: eventData.title,
          description: eventData.description,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          duration: Math.floor((eventData.endTime.getTime() - eventData.startTime.getTime()) / 60000) // in minutes
        }
      })
      
      // Add type and color info for response
      createdEvent = {
        ...createdEvent,
        type: eventData.type,
        color: eventData.color || '#0EA5E9',
        location: eventData.location,
        isAllDay: eventData.isAllDay
      }
    }

    return NextResponse.json({
      success: true,
      event: {
        ...createdEvent,
        id: `event-${createdEvent.id}`
      }
    })

  } catch (error) {
    console.error('Calendar event creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid event data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}

function getEventColor(type: string): string {
  const colors = {
    'study_session': '#3B82F6',
    'group_study': '#10B981', 
    'exam': '#EF4444',
    'assignment': '#F59E0B',
    'meeting': '#8B5CF6',
    'reminder': '#EC4899'
  }
  return colors[type as keyof typeof colors] || colors.study_session
}