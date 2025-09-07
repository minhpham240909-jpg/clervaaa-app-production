import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch upcoming study sessions for the user
    const sessions = await prisma.studySession.findMany({
      where: {
        participants: {
          some: { userId: userId }
        },
        startTime: {
          gte: new Date()
        },
        status: 'scheduled'
      },
      include: {
        studyGroup: {
          select: {
            name: true
          }
        },
        participants: {
          select: {
            user: {
              select: { name: true, image: true }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: 5
    })

    // Transform the sessions for the frontend
    const transformedSessions = sessions.map((session: any) => {
      const startTime = new Date(session.createdAt)
      const endTime = new Date(session.scheduledAt)
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 100)) / 10 // hours with 1 decimal

      // Format time display
      const now = new Date()
      const isToday = startTime.toDateString() === now.toDateString()
      const isTomorrow = startTime.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
      
      let timeDisplay = ''
      if (isToday) {
        timeDisplay = `Today, ${startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      } else if (isTomorrow) {
        timeDisplay = `Tomorrow, ${startTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      } else {
        timeDisplay = startTime.toLocaleDateString([], { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric', 
          minute: '2-digit' 
        })
      }

      return {
        id: session.id,
        title: session.group?.name || session.topics || 'Study Session',
        subject: 'General', // Default subject since no subject relation in schema
        time: timeDisplay,
        duration: `${duration} hours`,
        location: session.timezone || 'TBD',
        participants: session.participants.length,
        type: session.timezone && session.timezone.toLowerCase && session.timezone.toLowerCase().includes('virtual') ? 'virtual' : 'in-person',
        status: session.status
      }
    })

    return NextResponse.json(transformedSessions)

  } catch (error) {
    console.error('Dashboard sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming sessions' },
      { status: 500 }
    )
  }
}