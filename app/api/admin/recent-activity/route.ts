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

    // Get recent activities (this is mock data - you would implement actual activity logging)
    const recentActivity = [
      {
        id: '1',
        type: 'user_signup',
        message: 'New user registration: john.doe@email.com',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        severity: 'info'
      },
      {
        id: '2',
        type: 'content_generated',
        message: 'AI generated 15 flashcards for Mathematics',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        severity: 'success'
      },
      {
        id: '3',
        type: 'user_login',
        message: 'Admin user logged in from new IP',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        severity: 'warning'
      },
      {
        id: '4',
        type: 'system_error',
        message: 'Database connection timeout (resolved)',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        severity: 'error'
      },
      {
        id: '5',
        type: 'user_signup',
        message: 'New user registration: jane.smith@email.com',
        timestamp: new Date(Date.now() - 9000000).toISOString(),
        severity: 'info'
      }
    ]

    return NextResponse.json(recentActivity)
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
