import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user info before deletion for logging
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Start a transaction to delete all user-related data
    await prisma.$transaction(async (tx: any) => {
      // Delete user's achievements
      await tx.userAchievement.deleteMany({
        where: { userId: userId }
      })

      // Delete user's goals
      await tx.goal.deleteMany({
        where: { userId: userId }
      })

      // Delete user's personal study sessions
      await tx.personalStudySession.deleteMany({
        where: { userId: userId }
      })

      // Delete user's chat messages
      await tx.chatbotMessage.deleteMany({
        where: { senderId: userId }
      })

      // Delete user's notifications
      await tx.notification.deleteMany({
        where: { userId: userId }
      })

      // Delete user's partnerships (both as user and partner)
      await tx.partnership.deleteMany({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      })

      // Delete user's study group participations
      await tx.studyGroupMember.deleteMany({
        where: { userId: userId }
      })

      // Delete user's study session participations
      await tx.studySessionParticipant.deleteMany({
        where: { userId: userId }
      })

      // Update study groups where user is admin (transfer ownership or delete)
      const userGroups = await tx.studyGroup.findMany({
        where: { 
          members: {
            some: {
              userId: userId,
              role: "ADMIN"
            }
          }
        },
        include: { members: true }
      })

      for (const group of userGroups) {
        if (group.members.length > 1) {
          // Transfer ownership to another member
          const newAdmin = group.members.find(member => member.user1Id !== userId)
          if (newAdmin) {
            await tx.studyGroupMember.updateMany({
              where: { 
                studyGroupId: group.id,
                userId: newAdmin.user1Id
              },
              data: { role: "ADMIN" }
            })
            await tx.studyGroupMember.deleteMany({
              where: { 
                studyGroupId: group.id,
                userId: userId
              }
            })
          }
        } else {
          // Delete the group if no other members
          await tx.studyGroup.delete({
            where: { id: group.id }
          })
        }
      }

      // Delete user's reviews (given and received)
      await tx.review.deleteMany({
        where: {
          OR: [
            { reviewerId: userId },
            { revieweeId: userId }
          ]
        }
      })

      // Delete user's call participations
      await tx.callParticipant.deleteMany({
        where: { userId: userId }
      })

      // Delete user's reminder assignments
      // Delete user's reminders
      await tx.reminder.deleteMany({
        where: { userId: userId }
      })

      // Delete user's chatbot messages
      await tx.chatbotMessage.deleteMany({
        where: { userId: userId }
      })

      // Delete user's subject associations
      await tx.userSubject.deleteMany({
        where: { userId: userId }
      })

      // Delete user's accounts (OAuth connections)
      await tx.account.deleteMany({
        where: { userId: userId }
      })

      // Delete user's sessions
      await tx.session.deleteMany({
        where: { userId: userId }
      })

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    // Log the account deletion
    // Account deletion logged
    // User registration date noted

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Delete account error:', error)
    
    // If it's a foreign key constraint error, provide more helpful message
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { 
          error: 'Unable to delete account due to existing data dependencies. Please contact support.' 
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}