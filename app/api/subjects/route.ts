import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ValidationUtils } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { monitoring } from '@/lib/monitoring';

const addUserSubjectSchema = z.object({
  subjectId: z.string(),
  skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('BEGINNER'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const userSubjects = searchParams.get('userSubjects') === 'true';
    
    if (userSubjects) {
      // Get user's subjects
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          userSubjects: {
            include: { subject: true },
            // include all subjects
          },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        subjects: user.userSubjects.map((us: any) => ({
          id: us.subject.id,
          name: us.subject.name,
          category: us.subject.category,
          description: us.subject.description,
          skillLevel: us.proficiencyLevel,
          isActive: us.allowPartnerRequests,
          addedAt: us.createdAt,
        })),
      });
    }

    // Get all subjects
    let whereClause: any = {};
    
    if (category) {
      whereClause.category = category;
    }

    const [subjects, categories] = await Promise.all([
      prisma.subject.findMany({
        where: whereClause,
        orderBy: [
          { category: 'asc' },
          { name: 'asc' },
        ],
        include: {
          _count: {
            select: {
              userSubjects: true,
              studyGroups: true,
            },
          },
        },
      }),
      prisma.subject.groupBy({
        by: ['category'],
        where: {},
        _count: {
          category: true,
        },
        orderBy: {
          category: 'asc',
        },
      }),
    ]);

    // If no subjects found, return demo data for testing
    const demoSubjects = subjects.length === 0 ? [
      {
        id: 'demo-math',
        name: 'Mathematics',
        category: 'STEM',
        description: 'Mathematical concepts and problem solving',
        userCount: 0,
        groupCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'demo-physics',
        name: 'Physics',
        category: 'STEM',
        description: 'Physical sciences and laws of nature',
        userCount: 0,
        groupCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'demo-chemistry',
        name: 'Chemistry',
        category: 'STEM',
        description: 'Chemical reactions and molecular structures',
        userCount: 0,
        groupCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'demo-biology',
        name: 'Biology',
        category: 'Life Sciences',
        description: 'Study of living organisms and life processes',
        userCount: 0,
        groupCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'demo-psychology',
        name: 'Psychology',
        category: 'Social Sciences',
        description: 'Human behavior and mental processes',
        userCount: 0,
        groupCount: 0,
        createdAt: new Date(),
      },
    ] : subjects.map((subject: any) => ({
      id: subject.id,
      name: subject.name,
      category: subject.category,
      description: subject.description,
      userCount: subject._count.userSubjects,
      groupCount: subject._count.studyGroups,
      createdAt: subject.createdAt,
    }));

    const demoCategories = categories.length === 0 ? [
      { name: 'STEM', count: 3 },
      { name: 'Life Sciences', count: 1 },
      { name: 'Social Sciences', count: 1 },
    ] : categories.map((cat: any) => ({
      name: cat.category,
      count: cat._count.category,
    }));

    return NextResponse.json({
      subjects: demoSubjects,
      categories: demoCategories,
      totalSubjects: demoSubjects.length,
      isDemo: subjects.length === 0,
    });

  } catch (error) {
    logger.error('Subjects fetch error', error as Error, {
      endpoint: '/api/subjects',
      method: 'GET'
    });
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const context = logger.logRequest(request);
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userSubjects: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { subjectId, skillLevel } = ValidationUtils.validateAndSanitize(addUserSubjectSchema, body, { sanitize: true });

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Check if user already has this subject
    const existingUserSubject = user.userSubjects.find(us => us.subjectId === subjectId);
    if (existingUserSubject) {
      if (existingUserSubject.allowPartnerRequests) {
        return NextResponse.json(
          { error: 'You already have this subject in your profile' },
          { status: 400 }
        );
      } else {
        // Reactivate the subject
        const reactivated = await prisma.userSubject.update({
          where: { id: existingUserSubject.id },
          data: { 
            proficiencyLevel: skillLevel,
          },
          include: { subject: true },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { totalPoints: { increment: 10 } },
        });

        const responseTime = Date.now() - startTime;
        monitoring.recordAPIPerformance('/api/subjects', 'POST', responseTime, 200);
        logger.logResponse(context, 200, responseTime);

        return NextResponse.json({
          userSubject: {
            id: reactivated.subject.id,
            name: reactivated.subject.name,
            category: reactivated.subject.category,
            skillLevel: reactivated.proficiencyLevel,
            isActive: reactivated.allowPartnerRequests,
          },
          message: 'Subject reactivated successfully! +10 points earned.',
        });
      }
    }

    // Check subjects limit (e.g., 15 subjects max)
    const activeSubjectsCount = user.userSubjects.filter((us: any) => us.allowPartnerRequests).length;
    if (activeSubjectsCount >= 15) {
      return NextResponse.json(
        { error: 'You can have a maximum of 15 active subjects' },
        { status: 403 }
      );
    }

    // Add new subject
    const userSubject = await prisma.userSubject.create({
      data: {
        userId: user.id,
        subjectId,
        proficiencyLevel: skillLevel || 'BEGINNER',
      },
      include: { subject: true },
    });

    // Award points for adding a subject
    await prisma.user.update({
      where: { id: user.id },
      data: { totalPoints: { increment: 10 } },
    });

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/subjects', 'POST', responseTime, 201);
    logger.logResponse(context, 201, responseTime);

    return NextResponse.json({
      userSubject: {
        id: userSubject.subject.id,
        name: userSubject.subject.name,
        category: userSubject.subject.category,
        skillLevel: userSubject.proficiencyLevel,
        isActive: true,
        addedAt: userSubject.createdAt,
      },
      message: 'Subject added successfully! +10 points earned.',
    }, { status: 201 });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    
    monitoring.recordAPIPerformance('/api/subjects', 'POST', responseTime, statusCode);
    logger.error('Add user subject error:', error as Error, context);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid subject data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add subject' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID required' }, { status: 400 });
    }

    const userSubject = await prisma.userSubject.findFirst({
      where: {
        userId: user.id,
        subjectId,
      },
    });

    if (!userSubject) {
      return NextResponse.json(
        { error: 'Subject not found in your profile' },
        { status: 404 }
      );
    }

    // Deactivate instead of deleting to preserve history
    await prisma.userSubject.update({
      where: { id: userSubject.id },
      data: { 
        lastStudied: new Date(),
      },
    });

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/subjects', 'DELETE', responseTime, 200);
    logger.logResponse(context, 200, responseTime);

    return NextResponse.json({
      success: true,
      message: 'Subject removed from your profile.',
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    monitoring.recordAPIPerformance('/api/subjects', 'DELETE', responseTime, 500);
    logger.error('Remove user subject error:', error as Error, context);

    return NextResponse.json(
      { error: 'Failed to remove subject' },
      { status: 500 }
    );
  }
}