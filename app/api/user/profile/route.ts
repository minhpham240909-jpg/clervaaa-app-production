import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ValidationUtils } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { monitoring } from '@/lib/monitoring';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  university: z.string().max(200).optional(),
  major: z.string().max(100).optional(),
  year: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  timezone: z.string().optional(),
  studyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
  focusTime: z.number().int().min(5).max(120).optional(),
  dailyGoalHours: z.number().min(0.5).max(24).optional(),
  studyGoals: z.string().max(1000).optional(),
  availability: z.record(z.any()).optional(), // JSON object
  preferences: z.record(z.any()).optional(), // JSON object
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userSubjects: {
          include: { subject: true },
        },
        userAchievements: {
          include: { achievement: true },
        },
        goals: {
          where: { status: 'ACTIVE' },
        },
        partnerships1: {
          where: { status: 'ACTIVE' },
          include: { user2: { select: { id: true, name: true, image: true } } },
        },
        partnerships2: {
          where: { status: 'ACTIVE' },
          include: { user1: { select: { id: true, name: true, image: true } } },
        },
        _count: {
          select: {
            personalStudySessions: true,
            reviewsReceived: true,
            partnerships1: { where: { status: 'ACTIVE' } },
            partnerships2: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse JSON fields safely  
    const preferences = user.preferences ? JSON.parse(user.preferences) : null;
    const studyGoals = user.studyGoals ? JSON.parse(user.studyGoals) : null;

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        timezone: user.timezone,
        learningStyle: user.learningStyle,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        studyGoals,
        preferences,
      },
      subjects: user.userSubjects?.map((us: any) => ({
        id: us.subject.id,
        name: us.subject.name,
        category: us.subject.category,
        skillLevel: us.proficiencyLevel,
        lastStudied: us.lastStudied,
      })) || [],
      achievements: user.userAchievements?.map((ua: any) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        category: ua.achievement.category,
        points: 0, // Achievement points not in schema
        earnedAt: ua.unlockedAt,
      })) || [],
      goals: user.goals.map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        progress: g.currentValue && g.targetValue ? g.currentValue / g.targetValue * 100 : 0,
        deadline: g.targetDate,
        status: g.status,
      })),
      partnerships: user.partnerships1.map((p: any) => ({
        id: p.id,
        partner: p.partner,
        status: p.status,
        rating: p.completionStatus,
        createdAt: p.createdAt,
      })),
      stats: {
        totalStudySessions: user._count.personalStudySessions,
        totalReviews: user._count.reviewsReceived,
        activePartnerships: user._count.partnerships1,
      },
    });

  } catch (error) {
    logger.error('Profile fetch error', error as Error, {
      endpoint: '/api/user/profile',
      method: 'GET'
    });
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const validatedData = ValidationUtils.validateAndSanitize(updateProfileSchema, body, { sanitize: true });

    // Prepare update data with proper JSON serialization
    const updateData: any = { ...validatedData };
    
    if (validatedData.availability) {
      updateData.availabilityHours = JSON.stringify(validatedData.availability);
    }
    
    if (validatedData.preferences) {
      updateData.preferences = JSON.stringify(validatedData.preferences);
    }

    if (validatedData.studyGoals) {
      updateData.studyGoals = JSON.stringify(validatedData.studyGoals);
    }

    // Check if profile becomes complete
    const requiredFields = ['name', 'bio', 'university', 'major', 'studyLevel', 'learningStyle'];
    const updatedUser = { ...user, ...updateData };
    const isComplete = requiredFields.every(field => updatedUser[field]);
    
    if (isComplete && !user.profileVisibility) {
      updateData.profileVisibility = true;
      updateData.engagementMetrics = user.engagementMetrics + 50; // Bonus for completing profile
    }

    const result = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        bio: true,
        university: true,
        major: true,
        year: true,
        location: true,
        timezone: true,
        studyLevel: true,
        learningStyle: true,
        focusTime: true,
        dailyGoalHours: true,
        totalPoints: true,
        profileComplete: true,
        updatedAt: true,
      },
    });

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/user/profile', 'PUT', responseTime, 200);
    logger.logResponse(context, 200, responseTime);

    return NextResponse.json({
      profile: result,
      message: isComplete && !user.profileVisibility ? 'Profile completed! +50 points earned.' : 'Profile updated successfully',
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    
    monitoring.recordAPIPerformance('/api/user/profile', 'PUT', responseTime, statusCode);
    logger.error('Profile update error:', error as Error, context);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}