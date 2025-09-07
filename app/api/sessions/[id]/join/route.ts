import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const sessionId = params.id

    // Check if the session exists and user is a participant
    const studySession = await prisma.studySession.findFirst({
      where: {
        id: sessionId,
        participants: {
          some: { userId: userId }
        },
        status: 'scheduled'
      },
      include: {
        participants: true,
        studyGroup: true
      }
    })

    if (!studySession) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      )
    }

    // Check if session is ready to join (within 15 minutes of start time)
    const now = new Date()
    const sessionStart = new Date(studySession.createdAt)
    const timeDiff = sessionStart.getTime() - now.getTime()
    const minutesUntilStart = timeDiff / (1000 * 60)

    if (minutesUntilStart > 15) {
      return NextResponse.json(
        { 
          error: 'Session not ready to join yet',
          message: `Session starts at ${sessionStart.toLocaleTimeString()}. You can join 15 minutes before.`
        },
        { status: 400 }
      )
    }

    // Update session status to in-progress if it's time
    if (minutesUntilStart <= 0 && studySession.status === 'scheduled') {
      await prisma.studySession.update({
        where: { id: sessionId },
        data: { status: 'in-progress' }
      })
    }

    // Log the join activity
    await prisma.personalStudySession.create({
      data: {
        userId: userId,
        title: 'Study Session Joined',
        duration: 60, // 60 minutes default
        startTime: now,
        endTime: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour default
        sessionType: 'group'
      }
    })

    // Create notification for other participants
    const otherParticipants = studySession.participants
      .filter((p: any) => p.userId !== userId)
      .map((p: any) => p.userId)

    if (otherParticipants.length > 0) {
      await prisma.notification.createMany({
        data: otherParticipants.map((participantId: any) => ({
          userId: participantId,
          type: 'session_joined',
          notificationType: 'session_joined',
          title: 'Participant Joined',
          message: `${session.user.name} has joined the study session`,
          relatedId: sessionId,
          relatedType: 'study_session'
        }))
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the session',
      session: {
        id: studySession.id,
        name: studySession.studyGroup?.name || 'Study Session',
        location: studySession.studyGroup?.timezone,
        participants: studySession.participants.length
      }
    })

  } catch (error) {
    console.error('Join session error:', error)
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    )
  }
}