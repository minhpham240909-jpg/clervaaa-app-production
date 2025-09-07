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
        status: { in: ['scheduled', 'in-progress'] }
      },
      include: {
        participants: true,
        studyGroup: {
          select: { name: true }
        }
      }
    })

    if (!studySession) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 404 }
      )
    }

    // Check if user has permission to cancel
    const isOnlyParticipant = studySession.participants.length === 1

    if (!isOnlyParticipant) {
      // If not admin and not the only participant, just remove user from session
      await prisma.studySessionParticipant.delete({
        where: {
          userId_studySessionId: {
            userId: userId,
            studySessionId: sessionId
          }
        }
      })

      // Notify other participants
      const otherParticipants = studySession.participants
        .filter((p: any) => p.user1Id !== userId)
        .map((p: any) => p.user1Id)

      if (otherParticipants.length > 0) {
        await prisma.notification.createMany({
          data: otherParticipants.map((participantId: any) => ({
            userId: participantId,
            type: 'session_participant_left',
            notificationType: 'session_participant_left',
            title: 'Participant Left',
            message: `${session.user.name} has left the study session`,
            relatedId: sessionId,
            relatedType: 'study_session'
          }))
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully left the session'
      })
    }

    // If admin or only participant, cancel the entire session
    const updatedSession = await prisma.studySession.update({
      where: { id: sessionId },
      data: { 
        status: 'cancelled'
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    })

    // Notify all participants about cancellation
    const allParticipants = updatedSession.participants
      .filter((p: any) => p.userId !== userId)
      .map((p: any) => p.userId)

    if (allParticipants.length > 0) {
      await prisma.notification.createMany({
        data: allParticipants.map((participantId: any) => ({
          userId: participantId,
          type: 'session_cancelled',
          notificationType: 'session_cancelled',
          title: 'Session Cancelled',
          message: `The study session "${studySession.studyGroup?.name || 'Study Session'}" has been cancelled`,
          relatedId: sessionId,
          relatedType: 'study_session'
        }))
      })
    }

    // Log the cancellation
    // Session cancellation logged

    return NextResponse.json({
      success: true,
      message: 'Session successfully cancelled',
      notifiedParticipants: allParticipants.length
    })

  } catch (error) {
    console.error('Cancel session error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel session' },
      { status: 500 }
    )
  }
}