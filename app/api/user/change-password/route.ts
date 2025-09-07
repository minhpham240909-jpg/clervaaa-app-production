import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // Find user with current password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        email: true, 
        name: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Note: In a real implementation with local authentication,
    // you would verify the current password against the stored hash.
    // Since this app uses OAuth (Google/GitHub), users might not have passwords.
    // For demo purposes, we'll simulate password validation.
    
    // Check if user has an account record (for OAuth users who set up passwords later)
    const account = await prisma.account.findFirst({
      where: { 
        userId: user.id,
        provider: 'credentials' // Assuming you have a credentials provider for password auth
      }
    })

    if (!account) {
      // For OAuth-only users, we would need to create a password entry
      // This is a simplified implementation
      const hashedPassword = await hash(newPassword, 12)
      
      // Create a new account record for password authentication
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id,
          // Note: In a real system, you'd store the password hash differently
          refresh_token: hashedPassword // Using this field temporarily for demo
        }
      })

      // Log this activity
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Password Set',
          message: 'Your password has been set successfully',
          type: 'SECURITY'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Password set successfully'
      })
    }

    // For existing password users, verify current password
    if (account.refresh_token) {
      const isCurrentPasswordValid = await compare(currentPassword, account.refresh_token)
      
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Hash the new password
    const hashedNewPassword = await hash(newPassword, 12)

    // Update the password
    await prisma.account.update({
      where: { id: account.id },
      data: {
        refresh_token: hashedNewPassword,
        // Update the token expiry or related fields if needed
        expires_at: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Password Changed',
        message: 'Your password has been changed successfully',
        type: 'SECURITY'
      }
    })

    // Log the password change for security
    // Password change logged

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid password requirements', 
          details: error.errors.map((e: any) => e.message)
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}