import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ImprovedEngagementPredictor } from '@/lib/ml/engagement-predictor-improved';
import { logger } from '@/lib/logger';

// ============================================================================
// ENGAGEMENT PREDICTION API ROUTE
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { includeRecommendations = true } = body;

    // Get user data with related tables
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        personalStudySessions: true,
        goals: true,
        partnerships1: true,
        reviews: {
          where: {
            authorId: { not: null }
          }
        }
      }
    }) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract features
    const features = ImprovedEngagementPredictor.extractFeatures(
      user,
      user.personalStudySessions || [],
      user.goals || [],
      user.partnerships1 || [],
      user.reviews || []
    );

    // Make prediction using improved predictor
    const prediction = ImprovedEngagementPredictor.predictEngagement(features);

    logger.info('Engagement prediction completed', {
      userId: user.id,
      engagementScore: prediction.engagementScore,
      riskLevel: prediction.riskLevel
    });

    return NextResponse.json({
      ...prediction,
      features: includeRecommendations ? features : undefined
    });

  } catch (error) {
    logger.error('Error in engagement prediction API', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeFeatures = searchParams.get('includeFeatures') === 'true';

    // Get user data with related tables
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        personalStudySessions: true,
        goals: true,
        partnerships1: true,
        reviews: {
          where: {
            authorId: { not: null }
          }
        }
      }
    }) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract features
    const features = ImprovedEngagementPredictor.extractFeatures(
      user,
      user.personalStudySessions || [],
      user.goals || [],
      user.partnerships1 || [],
      user.reviews || []
    );

    // Make prediction using improved predictor
    const prediction = ImprovedEngagementPredictor.predictEngagement(features);

    return NextResponse.json({
      ...prediction,
      features: includeFeatures ? features : undefined
    });

  } catch (error) {
    logger.error('Error in engagement prediction GET API', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

