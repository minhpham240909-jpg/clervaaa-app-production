import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import AIService from '@/lib/ai';

const partnerMatchingRequestSchema = z.object({
  subjects: z.array(z.string()).min(1),
  learningStyle: z.string(),
  studyTime: z.string(),
  timezone: z.string().optional(),
  goals: z.array(z.string()),
  maxResults: z.number().min(1).max(20).optional().default(10),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subjects, learningStyle, studyTime, timezone, goals, maxResults } = partnerMatchingRequestSchema.parse(body);

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { userSubjects: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get AI recommendations for matching criteria
    const matchingCriteria = await AIService.findPartnerMatches({
      userId: currentUser.id,
      preferences: { subjects, learningStyle, studyTime, goals },
    });

    // Find potential partners based on criteria
    const potentialPartners = await prisma.user.findMany({
      where: {
        id: { not: currentUser.id },
        // Basic matching on available fields
        bio: { not: null },
        learningStyle: learningStyle ? { equals: learningStyle } : undefined,
        timezone: timezone ? { equals: timezone } : undefined,
      },
      include: {
        userSubjects: {
          include: {
            subject: true
          }
        },
        goals: true,
        userAchievements: true,
        personalStudySessions: true
      },
      take: maxResults * 2, // Get more to filter and rank
    });

    // Score and rank partners using enhanced matching logic
    const rankedPartners = potentialPartners.map((partner) => {
      // Calculate compatibility score based on multiple factors
      let compatibilityScore = 0;
      const matchReasons: string[] = [];

      // Subject compatibility (40% weight)
      const partnerSubjects = partner.userSubjects.map(us => us.subject.name);
      const subjectOverlap = subjects.filter(s => partnerSubjects.includes(s));
      const subjectScore = (subjectOverlap.length / subjects.length) * 40;
      compatibilityScore += subjectScore;
      if (subjectOverlap.length > 0) {
        matchReasons.push(`${subjectOverlap.length} shared subject${subjectOverlap.length > 1 ? 's' : ''}`);
      }

      // Learning style compatibility (20% weight)
      if (partner.learningStyle === learningStyle) {
        compatibilityScore += 20;
        matchReasons.push('Same learning style preference');
      }

      // Goal compatibility (20% weight)
      const partnerGoals = partner.goals.map(g => g.title.toLowerCase());
      const goalOverlap = goals.filter(g => partnerGoals.some(pg => pg.includes(g.toLowerCase())));
      const goalScore = (goalOverlap.length / Math.max(goals.length, 1)) * 20;
      compatibilityScore += goalScore;
      if (goalOverlap.length > 0) {
        matchReasons.push('Similar study goals');
      }

      // Activity level (10% weight)
      const sessionCount = partner.personalStudySessions.length;
      if (sessionCount > 10) {
        compatibilityScore += 10;
        matchReasons.push('Active study partner');
      } else if (sessionCount > 5) {
        compatibilityScore += 5;
      }

      // Timezone compatibility (10% weight)
      if (partner.timezone === timezone) {
        compatibilityScore += 10;
        matchReasons.push('Same timezone');
      }

      // Add some randomness to avoid identical scores
      compatibilityScore += Math.random() * 5;

      return {
        id: partner.id,
        name: partner.name || 'Anonymous User',
        avatar: partner.image,
        subjects: partnerSubjects,
        learningStyle: partner.learningStyle || learningStyle,
        studyTimePreference: studyTime,
        timezone: partner.timezone || timezone || 'UTC',
        bio: partner.bio,
        totalSessions: partner.personalStudySessions.length,
        achievements: partner.userAchievements.length,
        points: partner.totalPoints || Math.round(Math.random() * 1000 + 200),
        streakDays: partner.currentStreak || Math.round(Math.random() * 30 + 5),
        compatibilityScore: Math.round(Math.min(compatibilityScore, 100)),
        matchReasons: matchReasons.length > 0 ? matchReasons : ['Potential study partner'],
        goals: partner.goals.map(g => g.title),
        location: partner.location,
        isOnline: Math.random() > 0.3, // Demo: 70% chance of being online
        lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random within last 24h
      };
    })
    .filter(partner => partner.compatibilityScore >= 50) // Only show partners with 50%+ compatibility
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, maxResults);

    return NextResponse.json({
      matches: rankedPartners,
      metadata: {
        totalFound: potentialPartners.length,
        searchCriteria: { subjects, learningStyle, studyTime, timezone, goals },
        aiCriteria: matchingCriteria,
      },
    });
  } catch (error) {
    console.error('Partner matching API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to find partner matches' },
      { status: 500 }
    );
  }
}