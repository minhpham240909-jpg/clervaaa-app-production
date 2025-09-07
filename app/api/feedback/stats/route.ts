import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || !isAdmin(session.user)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get current date and 30 days ago for trend calculation
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get all feedback stats
    const [
      totalCount,
      byType,
      byStatus,
      byPriority,
      avgRatingResult,
      recentCount
    ] = await Promise.all([
      // Total count
      prisma.feedback.count(),
      
      // Count by type
      prisma.feedback.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      
      // Count by status
      prisma.feedback.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Count by priority
      prisma.feedback.groupBy({
        by: ['priority'],
        _count: { priority: true }
      }),
      
      // Status distribution 
      Promise.resolve({ _avg: { priority: 0 } }),
      
      // Recent feedback count (last 30 days)
      prisma.feedback.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      })
    ])

    // Get previous 30 days count for trend
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const previousCount = await prisma.feedback.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    })

    // Calculate trend
    let recentTrend: 'up' | 'down' | 'stable'
    if (recentCount > previousCount) {
      recentTrend = 'up'
    } else if (recentCount < previousCount) {
      recentTrend = 'down'
    } else {
      recentTrend = 'stable'
    }

    // Format the results
    const stats = {
      total: totalCount,
      byType: Object.fromEntries(
        byType.map((item: any) => [item.category, item._count.category])
      ),
      byStatus: Object.fromEntries(
        byStatus.map((item: any) => [item.status, item._count.status])
      ),
      byPriority: Object.fromEntries(
        byPriority.map((item: any) => [item.priority, item._count.priority])
      ),
      avgRating: 0, // Rating not available in current schema
      recentTrend
    }

    logger.info('Feedback stats requested', { 
      adminUser: session.user.email,
      stats: { total: stats.total, trend: stats.recentTrend }
    })

    return NextResponse.json(stats)

  } catch (error) {
    logger.error('Error fetching feedback stats', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to check if user is admin
function isAdmin(user: any): boolean {
  // Check if user is founder (has admin access)
  const founderEmails = (process.env.FOUNDER_EMAILS || process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0)
  
  return founderEmails.includes(user.email)
}