import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ValidationUtils } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { monitoring } from '@/lib/monitoring';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  subjectId: z.string().optional(),
  maxMembers: z.number().int().min(2).max(50).default(10),
  isPrivate: z.boolean().default(false),
  location: z.string().max(200).optional(),
  timezone: z.string().max(50).optional(),
  schedule: z.record(z.any()).optional(), // JSON object for recurring schedule
  tags: z.array(z.string()).optional(),
});

// Schema for joining groups (currently unused in this file)
const _joinGroupSchema = z.object({
  message: z.string().max(300).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const subjectId = searchParams.get('subjectId');
    const search = searchParams.get('search');
    const myGroups = searchParams.get('myGroups') === 'true';
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let whereClause: any = {};

    if (myGroups) {
      whereClause.members = {
        some: { userId: user.id }
      };
    } else {
      // Only show non-private groups or private groups user is member of
      whereClause = {
        OR: [
          { isPrivate: false },
          { 
            isPrivate: true,
            members: { some: { userId: user.id } }
          }
        ]
      };
    }

    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [groups, total] = await Promise.all([
      prisma.studyGroup.findMany({
        where: whereClause,
        include: {
          subject: true,
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  studyLevel: true,
                },
              },
            },
          },
          _count: {
            select: { members: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.studyGroup.count({ where: whereClause }),
    ]);

    const processedGroups = groups.map((group: any) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      subject: group.subject ? {
        id: group.subject.id,
        name: group.subject.name,
        category: group.subject.category,
      } : null,
      maxMembers: group.maxMembers,
      currentMembers: group._count.members,
      isPrivate: group.isPrivate,
      location: group.timezone,
      schedule: group.schedule ? JSON.parse(group.schedule) : null,
      tags: group.tags ? group.tags.split(',').map((tag: any) => tag.trim()) : [],
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      members: group.members.map((member: any) => ({
        id: member.user.id,
        name: member.user.name,
        image: member.user.image,
        studyLevel: member.user.academicLevel,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
      canJoin: group._count.members < group.maxMembers && 
               !group.members.some(m => m.user1Id === user.id),
      isMember: group.members.some(m => m.user1Id === user.id),
      isOwner: group.members.some(m => m.user1Id === user.id && m.role === 'OWNER'),
    }));

    return NextResponse.json({
      groups: processedGroups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      filters: {
        subjectId,
        search,
        myGroups,
      },
    });

  } catch (error) {
    logger.error('Study groups fetch error', error as Error, {
      endpoint: '/api/study-groups',
      method: 'GET'
    });
    return NextResponse.json(
      { error: 'Failed to fetch study groups' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(apiLimiter, async (request: NextRequest) => {
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

    const body = await request.json();
    const validatedData = ValidationUtils.validateAndSanitize(createGroupSchema, body, { sanitize: true });

    // Check if user has reached max groups limit (e.g., 10)
    const userGroupCount = await prisma.studyGroupMember.count({
      where: { 
        userId: user.id,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });

    if (userGroupCount >= 5) {
      return NextResponse.json(
        { error: 'You can only create/admin up to 5 study groups' },
        { status: 403 }
      );
    }

    const groupData = {
      name: validatedData.name,
      description: validatedData.description,
      subjectId: validatedData.subjectId,
      maxMembers: validatedData.maxMembers,
      isPrivate: validatedData.isPrivate,
      timezone: validatedData.timezone,
    };

    const group = await prisma.studyGroup.create({
      data: {
        ...groupData,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        subject: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                studyLevel: true,
              },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    // Award points for creating a study group
    await prisma.user.update({
      where: { id: user.id },
      data: { totalPoints: { increment: 25 } },
    });

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/study-groups', 'POST', responseTime, 201);
    logger.logResponse(context, 201, responseTime);

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        subject: group.subject,
        maxMembers: group.maxMembers,
        currentMembers: group.members.length,
        isPrivate: group.isPrivate,
        location: group.timezone,
        createdAt: group.createdAt,
        members: group.members.map((member: any) => ({
          id: member.user.id,
          name: member.user.name,
          image: member.user.image,
          studyLevel: member.user.academicLevel,
          role: member.role,
          joinedAt: member.joinedAt,
        })),
      },
      message: 'Study group created successfully! +25 points earned.',
    }, { status: 201 });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    
    monitoring.recordAPIPerformance('/api/study-groups', 'POST', responseTime, statusCode);
    logger.error('Study group creation error:', error as Error, context);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid group data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create study group' },
      { status: 500 }
    );
  }
});