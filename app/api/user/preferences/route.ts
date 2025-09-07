import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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
        userSubjects: {
          include: {
            subject: true
          }
        },
        goals: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse user preferences
    const preferences = {
      subjects: user.userSubjects.map(us => us.subject.name),
      learningStyle: user.learningStyle || '',
      studyTime: user.availabilityHours ? JSON.parse(user.availabilityHours)[0] || '' : '',
      timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      goals: user.goals.map(g => g.title),
      studyEnvironment: user.studyEnvironment || '',
      communicationPreference: user.communicationPreference || '',
      studyIntensity: user.studyIntensity || ''
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subjects, learningStyle, studyTime, timezone, goals, studyEnvironment, communicationPreference, studyIntensity } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user preferences
    await prisma.user.update({
      where: { id: user.id },
      data: {
        learningStyle,
        availabilityHours: JSON.stringify([studyTime]),
        timezone,
        studyEnvironment,
        communicationPreference,
        studyIntensity
      }
    })

    // Update user subjects
    if (subjects && subjects.length > 0) {
      // Remove existing subjects
      await prisma.userSubject.deleteMany({
        where: { userId: user.id }
      })

      // Add new subjects
      for (const subjectName of subjects) {
        // Find or create subject
        let subject = await prisma.subject.findUnique({
          where: { name: subjectName }
        })

        if (!subject) {
          subject = await prisma.subject.create({
            data: { name: subjectName }
          })
        }

        // Create user subject relationship
        await prisma.userSubject.create({
          data: {
            userId: user.id,
            subjectId: subject.id,
            proficiencyLevel: 'intermediate'
          }
        })
      }
    }

    // Update goals
    if (goals && goals.length > 0) {
      // Remove existing goals
      await prisma.goal.deleteMany({
        where: { userId: user.id }
      })

      // Add new goals
      for (const goalTitle of goals) {
        await prisma.goal.create({
          data: {
            userId: user.id,
            title: goalTitle,
            description: goalTitle,
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            status: 'active'
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
