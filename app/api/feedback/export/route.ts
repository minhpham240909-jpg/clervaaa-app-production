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

    // Get all feedback with user information
    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Type',
      'Content',
      'Rating',
      'User Name',
      'User Email',
      'Status',
      'Priority',
      'Created At',
      'Updated At'
    ].join(',')

    const csvRows = feedback.map((item: any) => [
      item.id,
      item.category,
      `"${item.message.replace(/"/g, '""')}"`, // Escape quotes in content
      '', // Rating not available in current schema
      `"${item.user?.name || 'Anonymous'}"`,
      item.email || item.user?.email || '',
      item.status,
      item.priority,
      item.createdAt.toISOString(),
      item.updatedAt.toISOString()
    ].join(','))

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    logger.info('Feedback exported', { 
      adminUser: session.user.email,
      recordCount: feedback.length
    })

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=feedback-export-${new Date().toISOString().split('T')[0]}.csv`
      }
    })

  } catch (error) {
    logger.error('Error exporting feedback', error)
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