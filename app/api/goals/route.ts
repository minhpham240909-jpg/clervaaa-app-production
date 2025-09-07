import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ValidationUtils } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { monitoring } from '@/lib/monitoring';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';

const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  target: z.number().positive(),
  unit: z.string().max(50), // e.g., 'hours', 'sessions', 'chapters', 'pages'
  goalType: z.enum(['STUDY_HOURS', 'STUDY_SESSIONS', 'ASSIGNMENTS', 'POINTS', 'CUSTOM']).default('CUSTOM'),
  deadline: z.string().datetime().optional(),
  isPublic: z.boolean().default(false),
});

const updateProgressSchema = z.object({
  value: z.number().min(0),
  note: z.string().max(300).optional(),
});

export async function GET(request: NextRequest) {
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
    const status = searchParams.get('status') as 'ACTIVE' | 'COMPLETED' | 'PAUSED' | null;
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    let whereClause: any = { userId: user.id };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.category = category;
    }

    const goals = await prisma.goal.findMany({
      where: whereClause,
      orderBy: [
        { status: 'asc' }, // Active goals first
        { priority: 'desc' },
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      // Include related data if needed - progressEntries doesn't exist in schema
      // include: {
      //   user: {
      //     select: { name: true }
      //   }
      // },
    });

    const processedGoals = goals.map((goal: any) => {
      const progress = goal.targetDate > 0 ? (goal.progress / goal.targetDate) * 100 : 0;
      const isOverdue = goal.targetDate ? new Date(goal.targetDate) < new Date() && goal.status === 'ACTIVE' : false;
      const daysLeft = goal.targetDate ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

      return {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        target: goal.targetDate,
        current: goal.progress,
        targetValue: goal.targetValue || goal.targetDate, // For ML compatibility
        currentValue: goal.currentValue || goal.progress, // For ML compatibility
        unit: goal.unit,
        progress: Math.min(progress, 100),
        category: goal.category,
        priority: goal.priority,
        status: goal.status,
        deadline: goal.targetDate,
        isPublic: goal.isPublic,
        isOverdue,
        daysLeft,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
        recentProgress: goal.progressEntries.map((entry: any) => ({
          value: entry.value,
          notes: entry.notes,
          createdAt: entry.createdAt,
        })),
      };
    });

    // Calculate stats
    const stats = {
      total: goals.length,
      active: goals.filter((g: any) => g.status === 'ACTIVE').length,
      completed: goals.filter((g: any) => g.status === 'COMPLETED').length,
      overdue: processedGoals.filter((g: any) => g.isOverdue).length,
      completionRate: goals.length > 0 ? (goals.filter((g: any) => g.status === 'COMPLETED').length / goals.length) * 100 : 0,
    };

    return NextResponse.json({
      goals: processedGoals,
      stats,
      filters: { status, category },
    });

  } catch (error) {
    logger.error('Goals fetch error', error as Error, {
      endpoint: '/api/goals',
      method: 'GET'
    });
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
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
    const validatedData = ValidationUtils.validateAndSanitize(createGoalSchema, body, { sanitize: true });

    // Check active goals limit (e.g., 20 active goals max)
    const activeGoalsCount = await prisma.goal.count({
      where: { 
        userId: user.id,
        status: 'ACTIVE'
      }
    });

    if (activeGoalsCount >= 20) {
      return NextResponse.json(
        { error: 'You can have a maximum of 20 active goals' },
        { status: 403 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        description: validatedData.description,
        target: validatedData.target || 100,
        targetValue: validatedData.target || 100, // For ML compatibility  
        targetDate: validatedData.deadline ? new Date(validatedData.deadline) : null,
        status: 'active',
        current: 0,
        currentValue: 0, // For ML compatibility
      },
    });

    // Award points for setting a goal
    await prisma.user.update({
      where: { id: user.id },
      data: { totalPoints: { increment: 15 } },
    });

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/goals', 'POST', responseTime, 201);
    logger.logResponse(context, 201, responseTime);

    return NextResponse.json({
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        target: goal.target,
        current: goal.current,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        status: goal.status,
        deadline: goal.targetDate,
        progress: goal.progress,
        createdAt: goal.createdAt,
      },
      message: 'Goal created successfully! +15 points earned.',
    }, { status: 201 });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    
    monitoring.recordAPIPerformance('/api/goals', 'POST', responseTime, statusCode);
    logger.error('Goal creation error:', error as Error, context);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid goal data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
});

// Update goal progress
export async function PATCH(request: NextRequest) {
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
    const goalId = searchParams.get('id');

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    const goal = await prisma.goal.findFirst({
      where: { 
        id: goalId,
        userId: user.id,
        status: 'ACTIVE'
      }
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found or not active' }, { status: 404 });
    }

    const body = await request.json();
    const { value, note } = ValidationUtils.validateAndSanitize(updateProgressSchema, body, { sanitize: true });

    const newCurrentValue = value;
    const wasCompleted = (goal.currentValue || 0) >= (goal.targetValue || 1);
    const isNowCompleted = newCurrentValue >= (goal.targetValue || 1);
    
    // Update goal
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue: newCurrentValue,
        status: isNowCompleted ? 'COMPLETED' : 'ACTIVE',
      },
    });

    // Create progress entry - ProgressEntry model doesn't exist in current schema
    // await prisma.progressEntry.create({
    //   data: {
    //     goalId: goalId,
    //     value: newCurrentValue,
    //     notes: note,
    //   },
    // });

    let pointsAwarded = 5; // Base points for progress update
    let message = 'Progress updated! +5 points earned.';

    // Award bonus points for completing goal
    if (isNowCompleted && !wasCompleted) {
      const bonusPoints = Math.min((goal.targetValue || 1) * 2, 100); // Up to 100 bonus points
      pointsAwarded += bonusPoints;
      message = `Goal completed! +${pointsAwarded} points earned (including completion bonus).`;
      
      // Check for streak achievement
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          totalPoints: { increment: pointsAwarded },
          currentStreak: { increment: 1 }
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { totalPoints: { increment: pointsAwarded } },
      });
    }

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/goals', 'PATCH', responseTime, 200);
    logger.logResponse(context, 200, responseTime);

    return NextResponse.json({
      goal: {
        id: updatedGoal.id,
        title: updatedGoal.title,
        currentValue: updatedGoal.currentValue,
        targetValue: updatedGoal.targetValue,
        progress: ((updatedGoal.currentValue || 0) / (updatedGoal.targetValue || 1)) * 100,
        status: updatedGoal.status,
      },
      pointsAwarded,
      message,
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    
    monitoring.recordAPIPerformance('/api/goals', 'PATCH', responseTime, statusCode);
    logger.error('Goal progress update error:', error as Error, context);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid progress data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update goal progress' },
      { status: 500 }
    );
  }
}