import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


// Helper function to check if user is founder
function isFounder(user: any): boolean {
  if (!user?.email) return false
  const founderEmails = (process.env.FOUNDER_EMAILS || '').split(',').map((e: any) => e.trim()).filter((e: any) => e.length > 0)
  return founderEmails.includes(user.email)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isFounder(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      avgStudyTime
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.personalStudySession.aggregate({
        _avg: { duration: true }
      })
    ])

    const stats = {
      totalUsers,
      activeUsers,
      suspendedUsers: 0, // Calculate from actual data
      bannedUsers: 0, // Calculate from actual data
      newUsersToday,
      newUsersThisWeek,
      averageStudyTime: Math.round((avgStudyTime._avg.duration || 0) / 60), // Convert to hours
      topStudiers: [] // Calculate from actual data
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
