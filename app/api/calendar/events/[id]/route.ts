import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  type: z.enum(['study_session', 'group_study', 'exam', 'assignment', 'meeting', 'reminder']).optional(),
  location: z.string().optional(),
  isAllDay: z.boolean().optional(),
  color: z.string().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const eventId = params.id
    const body = await request.json()
    const updateData = updateEventSchema.parse(body)

    // Parse event ID to determine source
    const [source, realId] = eventId.split('-')

    // Validate end time is after start time if both are provided
    if (updateData.startTime && updateData.endTime && updateData.endTime <= updateData.startTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    let updatedEvent
    
    switch (source) {
      case 'event':
        // Update personal event
        try {
          // Check if user is attendee of this event
          const eventWithAttendees = await prisma.event.findFirst({
            where: { 
              id: realId,
              attendees: {
                some: { userId: userId }
              }
            }
          })
          
          if (!eventWithAttendees) {
            throw new Error('Event not found or access denied')
          }
          
          updatedEvent = await prisma.event.update({
            where: { id: realId },
            data: updateData
          })
        } catch (error) {
          return NextResponse.json(
            { error: 'Event not found or access denied' },
            { status: 404 }
          )
        }
        break

      case 'session':
        // Update study session (limited fields)
        const session = await prisma.studySession.findFirst({
          where: {
            id: realId,
            OR: [
              { organizerId: userId }, // User is organizer
              { 
                studyGroup: { 
                  members: { 
                    some: { 
                      userId: userId, 
                      role: "ADMIN" 
                    } 
                  } 
                } 
              },
              { participants: { some: { userId: userId } } }
            ]
          }
        })
        
        if (!session) {
          return NextResponse.json(
            { error: 'Study session not found or access denied' },
            { status: 404 }
          )
        }

        // Only allow updating certain fields for study sessions
        const sessionUpdateData: any = {}
        if (updateData.startTime) sessionUpdateData.startTime = updateData.startTime
        if (updateData.endTime) sessionUpdateData.endTime = updateData.endTime
        if (updateData.location) sessionUpdateData.location = updateData.location
        if (updateData.description) sessionUpdateData.description = updateData.description

        updatedEvent = await prisma.studySession.update({
          where: { id: realId },
          data: sessionUpdateData
        })
        break

      case 'goal':
        // Update goal deadline
        const goal = await prisma.goal.findFirst({
          where: {
            id: realId,
            userId: userId
          }
        })
        
        if (!goal) {
          return NextResponse.json(
            { error: 'Goal not found or access denied' },
            { status: 404 }
          )
        }

        if (updateData.startTime) {
          updatedEvent = await prisma.goal.update({
            where: { id: realId },
            data: {
              targetDate: updateData.startTime,
              ...(updateData.title && { title: updateData.title }),
              ...(updateData.description && { description: updateData.description })
            }
          })
        }
        break

      case 'reminder':
        // Update reminder
        try {
          updatedEvent = await prisma.reminder.update({
            where: { 
              id: realId,
              userId: userId // Ensure user owns the reminder
            },
            data: {
              ...(updateData.title && { title: updateData.title }),
              ...(updateData.description && { description: updateData.description }),
              ...(updateData.startTime && { reminderTime: updateData.startTime })
            }
          })
        } catch (error) {
          return NextResponse.json(
            { error: 'Reminder not found or access denied' },
            { status: 404 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        )
    }

    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      event: {
        ...updatedEvent,
        id: eventId,
        type: updateData.type,
        color: updateData.color
      }
    })

  } catch (error) {
    console.error('Calendar event update error:', error)
    
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
      { error: 'Failed to update calendar event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const eventId = params.id

    // Parse event ID to determine source
    const [source, realId] = eventId.split('-')

    let deleted = false
    
    switch (source) {
      case 'event':
        // Delete personal event
        try {
          // Check if user is attendee of this event first
          const eventWithAttendees = await prisma.event.findFirst({
            where: { 
              id: realId,
              attendees: {
                some: { userId: userId }
              }
            }
          })
          
          if (!eventWithAttendees) {
            throw new Error('Event not found or access denied')
          }
          
          await prisma.event.delete({
            where: { id: realId }
          })
          deleted = true
        } catch (error) {
          return NextResponse.json(
            { error: 'Event not found or access denied' },
            { status: 404 }
          )
        }
        break

      case 'session':
        // For study sessions, only remove user's participation
        // Don't delete the actual session unless user is admin
        const session = await prisma.studySession.findFirst({
          where: {
            id: realId,
            participants: { some: { userId: userId } }
          },
          include: {
            studyGroup: { 
              select: { 
                members: {
                  where: { role: "moderator" },
                  select: { userId: true }
                }
              } 
            }
          }
        })
        
        if (!session) {
          return NextResponse.json(
            { error: 'Study session not found' },
            { status: 404 }
          )
        }

        const isAdmin = session.studyGroup?.members.some(member => member.userId === userId)
        
        if (isAdmin) {
          // Admin can cancel the session
          await prisma.studySession.update({
            where: { id: realId },
            data: { status: 'cancelled' }
          })
        } else {
          // Regular participant leaves the session
          await prisma.studySessionParticipant.delete({
            where: {
              userId_studySessionId: {
                studySessionId: realId,
                userId: userId
              }
            }
          })
        }
        deleted = true
        break

      case 'goal':
        // Delete goal (this will remove the deadline event)
        const goal = await prisma.goal.findFirst({
          where: {
            id: realId,
            userId: userId
          }
        })
        
        if (!goal) {
          return NextResponse.json(
            { error: 'Goal not found or access denied' },
            { status: 404 }
          )
        }

        await prisma.goal.delete({
          where: { id: realId }
        })
        deleted = true
        break

      case 'reminder':
        // Delete reminder
        try {
          await prisma.reminder?.delete({
            where: { id: realId }
          })
          deleted = true
        } catch (error) {
          return NextResponse.json(
            { error: 'Reminder not found or access denied' },
            { status: 404 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        )
    }

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Calendar event deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    )
  }
}