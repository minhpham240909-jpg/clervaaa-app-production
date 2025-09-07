import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ValidationUtils } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { monitoring } from '@/lib/monitoring';

const joinGroupSchema = z.object({
  message: z.string().max(300).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const context = logger.logRequest(request);
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const groupId = params.id;
    
    const group = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        members: true,
        _count: {
          select: { members: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = group.members.find(m => m.userId === user.id);
    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this group' },
        { status: 400 }
      );
    }

    // Check if group is full
    if (group._count.members >= group.maxMembers) {
      return NextResponse.json(
        { error: 'This study group is full' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message } = ValidationUtils.validateAndSanitize(joinGroupSchema, body, { sanitize: true });

    // Add user to group
    await prisma.studyGroupMember.create({
      data: {
        userId: user.id,
        studyGroupId: groupId,
        role: 'MEMBER',
      },
    });

    // Create notification for group owner
    const owner = group.members.find(m => m.role === 'OWNER');
    if (owner) {
      await prisma.notification.create({
        data: {
          userId: owner.userId,
          title: 'New Member Joined',
          message: `${user.name} joined your study group "${group.name}"${message ? `: "${message}"` : ''}`,
          notificationType: 'GROUP_JOIN',
          relatedId: groupId,
          isRead: false,
        },
      });
    }

    // Award points for joining a group
    await prisma.user.update({
      where: { id: user.id },
      data: { totalPoints: { increment: 10 } },
    });

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance(`/api/study-groups/${groupId}/join`, 'POST', responseTime, 200);
    logger.logResponse(context, 200, responseTime);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the study group! +10 points earned.',
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    
    monitoring.recordAPIPerformance(`/api/study-groups/${params.id}/join`, 'POST', responseTime, statusCode);
    logger.error('Study group join error:', error as Error, context);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to join study group' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const startTime = Date.now();
  const context = logger.logRequest(request);
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const groupId = params.id;
    
    const membership = await prisma.studyGroupMember.findFirst({
      where: {
        userId: user.id,
        studyGroupId: groupId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 400 }
      );
    }

    // Check if user is the only owner
    if (membership.role === 'OWNER') {
      const ownerCount = await prisma.studyGroupMember.count({
        where: {
          studyGroupId: groupId,
          role: 'OWNER',
        },
      });
      
      const totalMembers = await prisma.studyGroupMember.count({
        where: { studyGroupId: groupId },
      });

      if (ownerCount === 1 && totalMembers > 1) {
        return NextResponse.json(
          { 
            error: 'You are the only owner. Please promote another member to owner before leaving or delete the group.' 
          },
          { status: 400 }
        );
      }
      
      // If owner is the only member, delete the group
      if (totalMembers === 1) {
        await prisma.studyGroup.delete({
          where: { id: groupId },
        });
        
        const responseTime = Date.now() - startTime;
        monitoring.recordAPIPerformance(`/api/study-groups/${groupId}/join`, 'DELETE', responseTime, 200);
        logger.logResponse(context, 200, responseTime);
        
        return NextResponse.json({
          success: true,
          message: 'Group deleted as you were the only member.',
        });
      }
    }

    // Remove user from group
    await prisma.studyGroupMember.delete({
      where: { id: membership.id },
    });

    // Note: Owner notification removed - would require separate query to get group owner

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance(`/api/study-groups/${groupId}/join`, 'DELETE', responseTime, 200);
    logger.logResponse(context, 200, responseTime);

    return NextResponse.json({
      success: true,
      message: 'Successfully left the study group.',
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    monitoring.recordAPIPerformance(`/api/study-groups/${params.id}/join`, 'DELETE', responseTime, 500);
    logger.error('Study group leave error:', error as Error, context);

    return NextResponse.json(
      { error: 'Failed to leave study group' },
      { status: 500 }
    );
  }
}