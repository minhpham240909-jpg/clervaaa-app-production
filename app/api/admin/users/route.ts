import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/admin/users - Get all users (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with basic info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        university: true,
        major: true,
        year: true,
        location: true,
        studyLevel: true,
        learningStyle: true,
        totalPoints: true,
        currentStreak: true,
        profileComplete: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Don't include sensitive data
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get total count
    const totalUsers = await prisma.user.count()

    // Get active users (signed in recently)
    const activeUsers = await prisma.session.count({
      where: {
        expires: {
          gt: new Date()
        }
      }
    })

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        activeUsers,
        newUsersToday: users.filter((user: any) => 
          user.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      }
    })

  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}