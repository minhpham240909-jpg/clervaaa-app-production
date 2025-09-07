import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AIService from '@/lib/ai';

async function handleProgressAnalysis(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's basic data from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For POST requests, try to get data from request body
    let customStudyData = null;
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        customStudyData = body.studyData;
      } catch {
        // If JSON parsing fails, use default data
      }
    }

    // Prepare demo study data for AI analysis (use custom data if provided)
    const studyData = customStudyData || {
      recentSessions: [
        { duration: 90, subject: 'Mathematics', completed: true, date: new Date() },
        { duration: 60, subject: 'Physics', completed: true, date: new Date() },
        { duration: 45, subject: 'Chemistry', completed: false, date: new Date() },
      ],
      goals: [
        { title: 'Complete calculus course', completed: false, progress: 3, deadline: new Date() },
        { title: 'Prepare for finals', completed: false, progress: 2, deadline: new Date() },
      ],
      personalSessions: [
        { duration: 120, topic: 'Linear Algebra', productivity: 8, date: new Date() },
        { duration: 75, topic: 'Organic Chemistry', productivity: 7, date: new Date() },
      ],
      achievements: 5,
      totalStudyTime: 1200,
      streakDays: 15,
      points: 850,
    };

    const analysis = await AIService.analyzeProgress(user.id, studyData);

    return NextResponse.json({
      analysis,
      userData: {
        totalSessions: 25,
        totalStudyTime: 1200,
        currentStreak: 15,
        points: 850,
        achievements: 5,
      },
      method: request.method, // For debugging
    });
  } catch (error) {
    console.error('Progress analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze progress' },
      { status: 500 }
    );
  }
}

// Support both GET and POST methods
export async function GET(request: NextRequest) {
  return handleProgressAnalysis(request);
}

export async function POST(request: NextRequest) {
  return handleProgressAnalysis(request);
}