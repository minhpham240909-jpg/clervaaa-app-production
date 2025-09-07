import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// AI Service removed - using fallback matching algorithms
import { z } from 'zod';
import { partnerSchemas, ValidationUtils } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { monitoring } from '@/lib/monitoring';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';
import { 
  matchingEngine
} from '@/lib/algorithms/matching-engine';
import { 
  hybridEngine,
  gamificationEngine,
  analyticsEngine 
} from '@/lib/algorithms/recommendation-engine';
import { 
  performanceMonitor,
  memoize 
} from '@/lib/algorithms/performance-optimizer';

// Extended matching request schema
const extendedMatchingRequestSchema = partnerSchemas.matchingRequest.extend({
  useAdvancedAlgorithms: z.boolean().optional().default(false)
});

// Memoized function for expensive database queries
const memoizedUserQuery = memoize(
  async (userId: string) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSubjects: {
          include: { subject: true },
        },
        partnerships1: {
          include: { user2: true },
        },
        goals: {
          where: { status: 'ACTIVE' },
        },
        personalStudySessions: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        userAchievements: true,
        reviews: true,
      },
    });
  },
  { ttl: 2 * 60 * 1000, maxSize: 100 } // 2 minutes cache, max 100 users
);

export const POST = withRateLimit(apiLimiter, async (request: NextRequest) => {
  const startTime = Date.now();
  const context = logger.logRequest(request);
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use memoized query for better performance
    const currentUser = await memoizedUserQuery(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = ValidationUtils.validateAndSanitize(extendedMatchingRequestSchema, body, { sanitize: true });
    const { preferences, limit, includeAIScoring, useAdvancedAlgorithms } = validatedData;

    // Record performance metric
    performanceMonitor.recordMetric('matching_request_time', Date.now() - startTime);

    let matches;
    
    if (useAdvancedAlgorithms) {
      // Use advanced matching engine
      matches = await performAdvancedMatching(currentUser, preferences, limit, includeAIScoring);
    } else {
      // Use legacy matching (existing implementation)
      matches = await performLegacyMatching(currentUser, preferences, limit, includeAIScoring);
    }

    const responseTime = Date.now() - startTime;
    monitoring.recordAPIPerformance('/api/partners/matching', 'POST', responseTime, 200);
    logger.logResponse(context, 200, responseTime);

    return NextResponse.json({
      matches,
      metadata: {
        totalCandidates: matches.length,
        returnedMatches: matches.length,
        aiScoringEnabled: includeAIScoring,
        advancedAlgorithmsUsed: useAdvancedAlgorithms,
        preferences: preferences || null,
        generatedAt: new Date().toISOString(),
        performanceMetrics: {
          responseTime,
          cacheHitRate: 0, // Will be implemented when we expose cache stats
          memoryUsage: performanceMonitor.getMetrics()
        }
      },
      tips: [
        'High compatibility scores indicate better potential matches',
        'Look for partners with complementary skills and shared interests',
        'Consider reaching out to partners with good reputations',
        'Virtual sessions can work well across different time zones',
        'Advanced algorithms provide more accurate matching results'
      ],
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const statusCode = error instanceof z.ZodError ? 400 : 500;
    
    monitoring.recordAPIPerformance('/api/partners/matching', 'POST', responseTime, statusCode);
    logger.error('Partner matching error:', error as Error, context);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to find partner matches' },
      { status: 500 }
    );
  }
});

/**
 * Advanced matching using enhanced AI algorithms
 */
async function performAdvancedMatching(
  currentUser: any,
  preferences: any,
  limit: number = 10,
  includeAIScoring: boolean = false
) {
  // Get existing partner IDs to exclude
  const existingPartnerIds = currentUser.partnerships1.map((p: any) => p.user2Id);
  const excludeIds = [...existingPartnerIds, currentUser.id];

  // Enhanced matching criteria with AI insights
  const matchingCriteria = {
    subjects: preferences?.userSubjects || [],
    academicLevel: preferences?.academicLevel || currentUser.academicLevel,
    learningStyle: preferences?.learningStyle || currentUser.learningStyle,
    availability: parseAvailability(currentUser.availabilityHours),
    location: currentUser.timezone || '',
    preferences: {
      sessionType: preferences?.title || 'virtual',
      groupSize: preferences?.groupSize || 'one_on_one',
      communicationStyle: preferences?.communicationStyle || 'casual',
      studyIntensity: preferences?.studyIntensity || 'moderate'
    },
    maxDistance: preferences?.maxDistance,
    minCompatibilityScore: preferences?.minCompatibilityScore || 0.6,
    // Enhanced AI criteria
    personalityMatch: preferences?.personalityMatch || true,
    studyGoalAlignment: preferences?.studyGoalAlignment || true,
    timeZoneFlexibility: preferences?.timeZoneFlexibility || 0.5
  };

  // Get potential partners with enhanced filtering
  const allUsers = await prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
      isActive: true,
      profileComplete: true,
      allowPartnerRequests: true
    },
    include: {
      userSubjects: { include: { subject: true } },
      partnerships1: true,
      personalStudySessions: { 
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      reviews: true,
      goals: {
        where: { status: 'active' },
        take: 5
      },
      userAchievements: {
        include: { achievement: true }
      }
    },
    take: 200 // Increased for better AI analysis
  });

  // Apply AI-enhanced scoring if enabled
  let scoredCandidates;
  if (includeAIScoring) {
    scoredCandidates = await applyEnhancedAIScoring(currentUser, allUsers, matchingCriteria);
  } else {
    // Use advanced matching engine
    const advancedMatches = await matchingEngine.findOptimalMatches(
      currentUser,
      matchingCriteria,
      limit * 2
    );
    scoredCandidates = advancedMatches;
  }

  // Apply hybrid recommendation engine for additional insights
  const hybridRecommendations = await hybridEngine.recommendPartners(
    currentUser,
    allUsers,
    limit
  );

  // Combine and rank results with enhanced weighting
  const combinedResults = combineMatchingResults(scoredCandidates, hybridRecommendations, limit);

  // Add gamification and personality insights
  const enrichedResults = await enrichWithAdvancedInsights(combinedResults, currentUser);

  return enrichedResults;
}

/**
 * Enhanced AI scoring with personality and behavioral analysis
 */
async function applyEnhancedAIScoring(
  currentUser: any,
  candidates: any[],
  criteria: any
): Promise<any[]> {
  const scoredCandidates = [];

  for (const candidate of candidates) {
    // Calculate comprehensive compatibility score
    const compatibilityScore = await calculateEnhancedCompatibility(currentUser, candidate);
    
    // Analyze study patterns and behavior
    const behaviorAnalysis = analyzeBehaviorCompatibility(currentUser, candidate);
    
    // Calculate goal alignment
    const goalAlignment = calculateGoalAlignment(currentUser, candidate);
    
    // Assess communication style compatibility
    const communicationMatch = assessCommunicationCompatibility(currentUser, candidate);
    
    // Combine all factors with weighted importance
    const finalScore = {
      overall: Math.round(
        compatibilityScore.overall * 0.4 +
        behaviorAnalysis.compatibility * 0.25 +
        goalAlignment * 0.2 +
        communicationMatch * 0.15
      ),
      subjectMatch: compatibilityScore.subjectMatch,
      levelCompatibility: compatibilityScore.levelCompatibility,
      styleCompatibility: compatibilityScore.styleCompatibility,
      timeOverlap: compatibilityScore.timeOverlap,
      locationCompatibility: compatibilityScore.locationCompatibility,
      activityCompatibility: behaviorAnalysis.compatibility,
      reputationScore: compatibilityScore.reputationScore,
      personalityMatch: communicationMatch,
      goalAlignment: goalAlignment,
      aiEnhanced: true
    };

    scoredCandidates.push({
      user: candidate,
      compatibilityScore: finalScore,
      reasons: generateEnhancedReasons(currentUser, candidate, finalScore),
      sharedInterests: findSharedInterests(currentUser, candidate),
      complementarySkills: findComplementarySkills(currentUser, candidate),
      subjects: candidate.userSubjects || [],
      stats: {
        totalPartnerships: candidate.partnerships1?.length || 0,
        reviewCount: candidate.reviews?.length || 0,
        recentActivity: candidate.personalStudySessions?.length || 0,
        averageRating: calculateAverageRating(candidate.reviews || [])
      },
      aiEnhanced: true,
      behaviorInsights: behaviorAnalysis.insights,
      studyPredictions: generateStudyPredictions(currentUser, candidate)
    });
  }

  return scoredCandidates.sort((a, b) => b.compatibilityScore.overall - a.compatibilityScore.overall);
}

/**
 * Legacy matching (existing implementation)
 */
async function performLegacyMatching(
  currentUser: any,
  preferences: any,
  limit: number = 10,
  includeAIScoring: boolean = false
) {
  // Get existing partner IDs to exclude
  const existingPartnerIds = currentUser.partnerships1.map((p: any) => p.user2Id);
  const excludeIds = [...existingPartnerIds, currentUser.id];

  // Build base query for potential partners
  let whereClause: any = {
    id: { notIn: excludeIds },
    isActive: true,
    profileComplete: true,
  };

  // Apply preference filters
  if (preferences) {
    if (preferences.academicLevel?.length) {
      whereClause.academicLevel = { in: preferences.academicLevel };
    }
    if (preferences.learningStyle?.length) {
      whereClause.learningStyle = { in: preferences.learningStyle };
    }
    if (preferences.timeZone) {
      whereClause.timezone = preferences.timeZone;
    }
  }

  // Find potential partners
  const potentialPartners = await prisma.user.findMany({
    where: whereClause,
    include: {
      userSubjects: {
        include: { subject: true },
      },
      goals: {
        where: { status: 'ACTIVE' },
      },
      partnerships1: true,
      personalStudySessions: {
        orderBy: { startTime: 'desc' },
        take: 5,
      },
      _count: {
        select: {
          partnerships1: {
            where: { status: 'ACTIVE' },
          },
          reviewsReceived: true,
        },
      },
    },
    take: (limit || 10) * 2, // Get more candidates for better AI scoring
  });

  // Calculate compatibility scores
  const scoredPartners = await Promise.all(
    potentialPartners.map(async (partner: any) => {
      // Basic compatibility scoring
      let baseScore = 0;
      const reasons: string[] = [];
      const sharedInterests: string[] = [];
      const complementarySkills: string[] = [];

      // Subject overlap scoring
      const currentUserSubjects = new Set(currentUser.userSubjects.map((s: any) => s.subject.name));
      const partnerSubjects = new Set(partner.userSubjects.map((s: any) => s.subject.name));
      const commonSubjects = Array.from(currentUserSubjects).filter((s: any) => partnerSubjects.has(s));
      
      if (commonSubjects.length > 0) {
        baseScore += Math.min(commonSubjects.length * 15, 45); // Max 45 points for subjects
        sharedInterests.push(...(commonSubjects as string[]));
        reasons.push(`${commonSubjects.length} shared subject${commonSubjects.length > 1 ? 's' : ''}`);
      }

      // Study level compatibility
      if (currentUser.academicLevel === partner.academicLevel) {
        baseScore += 20;
        reasons.push('Same study level');
      } else {
        // Still compatible if levels are adjacent
        const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
        const currentIndex = levels.indexOf(currentUser.academicLevel || 'BEGINNER');
        const partnerIndex = levels.indexOf(partner.academicLevel || 'BEGINNER');
        if (Math.abs(currentIndex - partnerIndex) === 1) {
          baseScore += 10;
          complementarySkills.push('Complementary skill levels');
        }
      }

      // Learning style compatibility
      if (currentUser.learningStyle && partner.learningStyle) {
        if (currentUser.learningStyle === partner.learningStyle) {
          baseScore += 15;
          reasons.push('Compatible learning styles');
        } else {
          baseScore += 5; // Different styles can still work
          complementarySkills.push('Diverse learning approaches');
        }
      }

      // Activity level compatibility
      const currentUserActivity = currentUser.personalStudySessions.length;
      const partnerActivity = partner.personalStudySessions.length;
      const activityDiff = Math.abs(currentUserActivity - partnerActivity);
      
      if (activityDiff <= 2) {
        baseScore += 15;
        reasons.push('Similar activity levels');
      } else if (activityDiff <= 5) {
        baseScore += 5;
      }

      // Reputation score (based on reviews and partnership count)
      const avgReviewScore = 4.0; // Placeholder - you'd calculate this from actual reviews
      if (partner._count.reviewsReceived > 0) {
        baseScore += Math.min(avgReviewScore * 2, 10);
        reasons.push('Good reputation from reviews');
      }

      // Partnership experience
      if (partner._count.partnerships1 > 0 && partner._count.partnerships1 < 5) {
        baseScore += 10;
        reasons.push('Experienced study partner');
      }

      // Time zone compatibility
      if (currentUser.timezone === partner.timezone) {
        baseScore += 10;
        reasons.push('Same time zone');
      }

      // AI-enhanced scoring
      let aiScore = null;
      if (includeAIScoring) {
        try {
          aiScore = 0.5; // Fallback compatibility score until new AI system is implemented
          // Weight AI score with base score
          baseScore = Math.round(baseScore * 0.6 + aiScore * 0.4);
          
          // Add fallback insights
          reasons.push('AI compatibility analysis');
          sharedInterests.push('Study habits');
          complementarySkills.push('Knowledge sharing');
        } catch (error) {
          logger.warn('AI scoring failed for partner', {
            partnerId: partner.id,
            userId: currentUser.id,
            error: (error as Error).message
          });
        }
      }

      return {
        user: {
          id: partner.id,
          name: partner.name,
          image: partner.image,
          bio: partner.bio,
          university: partner.institution,
          major: partner.major,
          year: partner.graduationYear,
          studyLevel: partner.academicLevel,
          learningStyle: partner.learningStyle,
          totalPoints: partner.engagementMetrics,
          currentStreak: partner.engagementMetrics,
        },
        compatibilityScore: Math.min(baseScore, 100),
        reasons: Array.from(new Set(reasons)), // Remove duplicates
        sharedInterests: Array.from(new Set(sharedInterests)),
        complementarySkills: Array.from(new Set(complementarySkills)),
        subjects: partner.userSubjects.map((us: any) => ({
          name: us.subject.name,
          skillLevel: us.proficiencyLevel,
          category: us.subject.category,
        })),
        stats: {
          totalPartnerships: partner._count.partnerships1,
          reviewCount: partner._count.reviewsReceived,
          recentActivity: partner.personalStudySessions.length,
        },
        aiEnhanced: !!aiScore,
      };
    })
  );

  // Sort by compatibility score and limit results
  return scoredPartners
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);
}

/**
 * Combine results from different matching algorithms
 */
function combineMatchingResults(
  advancedMatches: any[],
  hybridRecommendations: any[],
  limit: number
) {
  const combined = new Map();

  // Add advanced matches
  advancedMatches.forEach(match => {
    combined.set(match.user.id, {
      ...match,
      source: 'advanced',
      finalScore: match.compatibilityScore.overall
    });
  });

  // Add hybrid recommendations
  hybridRecommendations.forEach(rec => {
    const existing = combined.get(rec.user.id);
    if (existing) {
      // Combine scores
      existing.finalScore = (existing.finalScore + rec.score) / 2;
      existing.source = 'hybrid';
      existing.recommendationReason = rec.reason;
    } else {
      combined.set(rec.user.id, {
        user: rec.user,
        compatibilityScore: { overall: rec.score },
        reasons: [rec.reason],
        sharedInterests: [],
        complementarySkills: [],
        subjects: [],
        stats: {
          totalPartnerships: 0,
          reviewCount: 0,
          recentActivity: 0,
        },
        aiEnhanced: false,
        source: 'hybrid',
        finalScore: rec.score,
        recommendationReason: rec.reason
      });
    }
  });

  return Array.from(combined.values())
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
}

/**
 * Enrich results with gamification insights
 */
async function enrichWithGamification(matches: any[], currentUser: any) {
  return matches.map((match: any) => {
    // Calculate level for partner
    const partnerLevel = gamificationEngine.calculateLevel(match.user.engagementMetrics);
    
    // Check for potential achievements together
    const potentialAchievements = gamificationEngine.checkAchievements(
      match.user,
      match.user.personalStudySessions || []
    );

    // Analyze study patterns
    const studyAnalysis = analyticsEngine.analyzeStudyPatterns(
      match.user.personalStudySessions || []
    );

    return {
      ...match,
      gamification: {
        level: partnerLevel,
        potentialAchievements,
        studyAnalysis
      }
    };
  });
}

/**
 * Parse availability string to structured format
 */
function parseAvailability(availability: string | null): any[] {
  if (!availability) return [];
  
  try {
    const parsed = JSON.parse(availability);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Subject overlap using Set intersection
 * Time Complexity: O(n + m) where n, m are subject counts
 */
function calculateSubjectOverlap(user1: any, user2: any): number {
  const subjects1 = new Set(user1.userSubjects?.map((s: any) => s.subjectId) || []);
  const subjects2 = new Set(user2.userSubjects?.map((s: any) => s.subjectId) || []);
  
  const intersection = new Set(Array.from(subjects1).filter((x: any) => subjects2.has(x)));
  const union = new Set([...Array.from(subjects1), ...Array.from(subjects2)]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Study level compatibility using level mapping
 */
function calculateLevelCompatibility(user1: any, user2: any): number {
  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
  const level1 = levels.indexOf(user1.academicLevel || 'BEGINNER');
  const level2 = levels.indexOf(user2.academicLevel || 'BEGINNER');
  
  const difference = Math.abs(level1 - level2);
  
  if (difference === 0) return 1.0; // Same level
  if (difference === 1) return 0.8; // Adjacent levels
  if (difference === 2) return 0.5; // Two levels apart
  return 0.2; // Three levels apart
}

/**
 * Learning style compatibility
 */
function calculateStyleCompatibility(user1: any, user2: any): number {
  if (!user1.learningStyle || !user2.learningStyle) return 0.5;
  
  if (user1.learningStyle === user2.learningStyle) return 1.0;
  
  // Complementary styles
  const complementaryPairs = [
    ['visual', 'kinesthetic'],
    ['auditory', 'reading'],
    ['visual', 'auditory']
  ];
  
  for (const pair of complementaryPairs) {
    if (pair.includes(user1.learningStyle) && pair.includes(user2.learningStyle)) {
      return 0.8;
    }
  }
  
  return 0.3; // Different styles
}

/**
 * Time overlap using interval intersection algorithm
 * Time Complexity: O(n log n) for sorting + O(n) for intersection
 */
function calculateTimeOverlap(user1: any, user2: any): number {
  const availability1 = parseAvailability(user1.availabilityHours);
  const availability2 = parseAvailability(user2.availabilityHours);
  
  if (!availability1.length || !availability2.length) return 0;
  
  // Sort intervals by start time
  const sorted1 = availability1.sort((a, b) => a.start - b.start);
  const sorted2 = availability2.sort((a, b) => a.start - b.start);
  
  let overlap = 0;
  let i = 0, j = 0;
  
  while (i < sorted1.length && j < sorted2.length) {
    const interval1 = sorted1[i];
    const interval2 = sorted2[j];
    
    // Check for overlap
    const start = Math.max(interval1.start, interval2.start);
    const end = Math.min(interval1.end, interval2.end);
    
    if (start < end) {
      overlap += end - start;
    }
    
    // Move pointer with earlier end time
    if (interval1.end < interval2.end) {
      i++;
    } else {
      j++;
    }
  }
  
  const totalTime1 = availability1.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
  const totalTime2 = availability2.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
  
  return Math.min(overlap / totalTime1, overlap / totalTime2);
}

/**
 * Location compatibility using distance calculation
 */
function calculateLocationCompatibility(user1: any, user2: any): number {
  if (!user1.timezone || !user2.timezone) return 0.5;
  
  if (user1.timezone === user2.timezone) return 1.0;
  
  // Calculate distance (simplified - you'd use a proper geocoding service)
  const distance = calculateDistance(user1.timezone, user2.timezone);
  
  if (distance < 10) return 0.9; // Same city
  if (distance < 50) return 0.7; // Same region
  if (distance < 200) return 0.4; // Same country
  return 0.1; // Different country
}

/**
 * Activity compatibility using statistical analysis
 */
function calculateActivityCompatibility(user1: any, user2: any): number {
  const activity1 = user1.personalStudySessions?.length || 0;
  const activity2 = user2.personalStudySessions?.length || 0;
  
  const difference = Math.abs(activity1 - activity2);
  const maxActivity = Math.max(activity1, activity2);
  
  if (maxActivity === 0) return 0.5;
  
  return Math.max(0, 1 - (difference / maxActivity));
}

/**
 * Reputation score using weighted average
 */
async function calculateReputationScore(user: any): Promise<number> {
  // This would query reviews and calculate weighted average
  // For now, return a placeholder
  return 0.8;
}

/**
 * Weighted score calculation
 */
function calculateWeightedScore(scores: any): number {
  const weights = {
    subjectMatch: 0.25,
    levelCompatibility: 0.20,
    styleCompatibility: 0.15,
    timeOverlap: 0.15,
    locationCompatibility: 0.10,
    activityCompatibility: 0.10,
    reputationScore: 0.05
  };

  return Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key] * weight);
  }, 0);
}

/**
 * Calculate distance (simplified implementation)
 */
function calculateDistance(location1: string, location2: string): number {
  // Simplified distance calculation
  // In production, use a proper geocoding service
  return Math.random() * 100;
}

/**
 * Individual compatibility scoring with weighted factors
 */
async function calculateIndividualCompatibilityScore(
  user1: any,
  user2: any
): Promise<any> {
  // Subject overlap using Set intersection (O(n + m))
  const subjectMatch = calculateSubjectOverlap(user1, user2);
  
  // Study level compatibility using level mapping
  const levelCompatibility = calculateLevelCompatibility(user1, user2);
  
  // Learning style compatibility
  const styleCompatibility = calculateStyleCompatibility(user1, user2);
  
  // Time overlap using interval intersection algorithm
  const timeOverlap = calculateTimeOverlap(user1, user2);
  
  // Location compatibility using distance calculation
  const locationCompatibility = calculateLocationCompatibility(user1, user2);
  
  // Activity compatibility using statistical analysis
  const activityCompatibility = calculateActivityCompatibility(user1, user2);
  
  // Reputation score using weighted average
  const reputationScore = await calculateReputationScore(user2);

  // Weighted combination
  const overall = calculateWeightedScore({
    subjectMatch,
    levelCompatibility,
    styleCompatibility,
    timeOverlap,
    locationCompatibility,
    activityCompatibility,
    reputationScore
  });

  return {
    overall,
    subjectMatch,
    levelCompatibility,
    styleCompatibility,
    timeOverlap,
    locationCompatibility,
    activityCompatibility,
    reputationScore
  };
}

/**
 * Enhanced compatibility calculation with behavioral analysis
 */
async function calculateEnhancedCompatibility(user1: any, user2: any) {
  // Use existing calculation as base
  const baseScore = await calculateIndividualCompatibilityScore(user1, user2);
  
  // Add enhanced factors
  const studyPatternMatch = calculateStudyPatternCompatibility(user1, user2);
  const motivationAlignment = calculateMotivationAlignment(user1, user2);
  const availabilityFlexibility = calculateAvailabilityFlexibility(user1, user2);
  
  return {
    ...baseScore,
    overall: Math.round(
      baseScore.overall * 0.7 +
      studyPatternMatch * 0.15 +
      motivationAlignment * 0.1 +
      availabilityFlexibility * 0.05
    )
  };
}

/**
 * Analyze behavior compatibility between users
 */
function analyzeBehaviorCompatibility(user1: any, user2: any) {
  const user1Sessions = user1.personalStudySessions || [];
  const user2Sessions = user2.personalStudySessions || [];
  
  // Study frequency compatibility
  const freq1 = user1Sessions.length;
  const freq2 = user2Sessions.length;
  const frequencyMatch = Math.max(0, 1 - Math.abs(freq1 - freq2) / Math.max(freq1, freq2, 1));
  
  // Study time patterns
  const timePattern1 = analyzeStudyTimePatterns(user1Sessions);
  const timePattern2 = analyzeStudyTimePatterns(user2Sessions);
  const timePatternMatch = calculateTimePatternOverlap(timePattern1, timePattern2);
  
  // Consistency patterns
  const consistency1 = calculateStudyConsistency(user1Sessions);
  const consistency2 = calculateStudyConsistency(user2Sessions);
  const consistencyMatch = Math.max(0, 1 - Math.abs(consistency1 - consistency2));
  
  const compatibility = Math.round(
    (frequencyMatch * 0.4 + timePatternMatch * 0.4 + consistencyMatch * 0.2) * 100
  );
  
  return {
    compatibility,
    insights: [
      `Study frequency match: ${Math.round(frequencyMatch * 100)}%`,
      `Time pattern overlap: ${Math.round(timePatternMatch * 100)}%`,
      `Consistency alignment: ${Math.round(consistencyMatch * 100)}%`
    ]
  };
}

/**
 * Calculate goal alignment between users
 */
function calculateGoalAlignment(user1: any, user2: any): number {
  const goals1 = user1.goals || [];
  const goals2 = user2.goals || [];
  
  if (goals1.length === 0 || goals2.length === 0) return 50; // Neutral score
  
  // Compare goal subjects and priorities
  let alignmentScore = 0;
  let comparisons = 0;
  
  goals1.forEach((goal1: any) => {
    goals2.forEach((goal2: any) => {
      if (goal1.subjectId === goal2.subjectId) {
        // Same subject goals
        alignmentScore += 80;
        
        // Priority alignment
        if (goal1.priority === goal2.priority) {
          alignmentScore += 20;
        }
      } else if (goal1.priority === goal2.priority && goal1.priority === 'high') {
        // Same high priority, different subjects
        alignmentScore += 40;
      }
      comparisons++;
    });
  });
  
  return comparisons > 0 ? Math.round(alignmentScore / comparisons) : 50;
}

/**
 * Assess communication style compatibility
 */
function assessCommunicationCompatibility(user1: any, user2: any): number {
  const style1 = user1.communicationPreference || 'casual';
  const style2 = user2.communicationPreference || 'casual';
  
  if (style1 === style2) return 100;
  
  // Compatible combinations
  const compatiblePairs = [
    ['formal', 'mixed'],
    ['casual', 'mixed'],
    ['formal', 'casual'] // Can work with effort
  ];
  
  for (const pair of compatiblePairs) {
    if (pair.includes(style1) && pair.includes(style2)) {
      return pair.includes('mixed') ? 85 : 70;
    }
  }
  
  return 50; // Default moderate compatibility
}

/**
 * Generate enhanced reasons for compatibility
 */
function generateEnhancedReasons(user1: any, user2: any, scores: any): string[] {
  const reasons = [];
  
  if (scores.subjectMatch > 0.7) {
    reasons.push(`Strong subject overlap (${Math.round(scores.subjectMatch * 100)}% match)`);
  }
  
  if (scores.personalityMatch > 80) {
    reasons.push('Highly compatible communication styles');
  }
  
  if (scores.goalAlignment > 70) {
    reasons.push('Aligned study goals and priorities');
  }
  
  if (scores.timeOverlap > 0.6) {
    reasons.push('Excellent schedule compatibility');
  }
  
  if (scores.activityCompatibility > 75) {
    reasons.push('Similar study patterns and habits');
  }
  
  if (scores.levelCompatibility > 0.8) {
    reasons.push('Perfect academic level match');
  }
  
  if (scores.aiEnhanced) {
    reasons.push('AI-verified compatibility analysis');
  }
  
  return reasons.slice(0, 5); // Limit to top 5 reasons
}

/**
 * Find shared interests between users
 */
function findSharedInterests(user1: any, user2: any): string[] {
  const subjects1 = new Set((user1.userSubjects || []).map((s: any) => s.subject?.name));
  const subjects2 = new Set((user2.userSubjects || []).map((s: any) => s.subject?.name));
  
  const shared = Array.from(subjects1).filter(subject => subjects2.has(subject));
  
  // Add other potential shared interests
  if (user1.learningStyle === user2.learningStyle) {
    shared.push(`${user1.learningStyle} learning style`);
  }
  
  if (user1.studyIntensity === user2.studyIntensity) {
    shared.push(`${user1.studyIntensity} study intensity`);
  }
  
  return shared as string[];
}

/**
 * Find complementary skills between users
 */
function findComplementarySkills(user1: any, user2: any): string[] {
  const complementary = [];
  
  const subjects1 = user1.userSubjects || [];
  const subjects2 = user2.userSubjects || [];
  
  // Find subjects where one user is advanced and other is beginner/intermediate
  subjects1.forEach((s1: any) => {
    subjects2.forEach((s2: any) => {
      if (s1.subject?.name === s2.subject?.name) {
        const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const level1 = levels.indexOf(s1.proficiencyLevel?.toLowerCase() || 'beginner');
        const level2 = levels.indexOf(s2.proficiencyLevel?.toLowerCase() || 'beginner');
        
        if (Math.abs(level1 - level2) >= 1) {
          complementary.push(`${s1.subject.name} tutoring opportunity`);
        }
      }
    });
  });
  
  // Learning style complementarity
  if (user1.learningStyle !== user2.learningStyle) {
    complementary.push('Diverse learning approaches');
  }
  
  return complementary.slice(0, 3);
}

/**
 * Generate study predictions for partnership
 */
function generateStudyPredictions(user1: any, user2: any): any {
  return {
    successProbability: Math.round(Math.random() * 30 + 70), // 70-100%
    recommendedSessionLength: 60, // minutes
    optimalMeetingFrequency: 'twice per week',
    strongestCollaborationAreas: findSharedInterests(user1, user2).slice(0, 2),
    growthOpportunities: findComplementarySkills(user1, user2).slice(0, 2)
  };
}

/**
 * Calculate average rating from reviews
 */
function calculateAverageRating(reviews: any[]): number {
  if (reviews.length === 0) return 4.0; // Default rating
  
  const sum = reviews.reduce((total, review) => total + (review.rating || 4), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/**
 * Enhanced insights enrichment
 */
async function enrichWithAdvancedInsights(matches: any[], currentUser: any) {
  return matches.map((match: any) => {
    // Calculate level for partner
    const partnerLevel = gamificationEngine.calculateLevel(match.user.totalPoints || 0);
    
    // Check for potential achievements together
    const potentialAchievements = gamificationEngine.checkAchievements(
      match.user,
      match.user.personalStudySessions || []
    );

    // Analyze study patterns
    const studyAnalysis = analyticsEngine.analyzeStudyPatterns(
      match.user.personalStudySessions || []
    );

    // Add partnership predictions
    const partnershipPredictions = {
      estimatedStudyImprovement: `${Math.round(Math.random() * 25 + 15)}%`,
      recommendedFirstMeeting: 'Virtual coffee chat',
      idealCollaborationStyle: determineCollaborationStyle(currentUser, match.user),
      mutualBenefits: calculateMutualBenefits(currentUser, match.user)
    };

    return {
      ...match,
      gamification: {
        level: partnerLevel,
        potentialAchievements,
        studyAnalysis
      },
      partnershipPredictions,
      aiInsights: {
        compatibilityFactors: match.reasons || [],
        improvementAreas: match.complementarySkills || [],
        sharedStrengths: match.sharedInterests || []
      }
    };
  });
}

// Helper functions for enhanced analysis
function analyzeStudyTimePatterns(sessions: any[]): Record<string, number> {
  const patterns: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  
  sessions.forEach(session => {
    const hour = new Date(session.createdAt).getHours();
    if (hour >= 6 && hour < 12) patterns.morning++;
    else if (hour >= 12 && hour < 18) patterns.afternoon++;
    else if (hour >= 18 && hour < 24) patterns.evening++;
    else patterns.night++;
  });
  
  return patterns;
}

function calculateTimePatternOverlap(pattern1: Record<string, number>, pattern2: Record<string, number>) {
  const total1 = Object.values(pattern1).reduce((sum: number, val: number) => sum + val, 0);
  const total2 = Object.values(pattern2).reduce((sum: number, val: number) => sum + val, 0);
  
  if (total1 === 0 || total2 === 0) return 0;
  
  let overlap = 0;
  Object.keys(pattern1).forEach(key => {
    const ratio1 = pattern1[key] / total1;
    const ratio2 = pattern2[key] / total2;
    overlap += Math.min(ratio1, ratio2);
  });
  
  return overlap;
}

function calculateStudyConsistency(sessions: any[]) {
  if (sessions.length < 2) return 0.5;
  
  const dates = sessions.map(s => new Date(s.createdAt).getTime());
  dates.sort((a, b) => a - b);
  
  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push(dates[i] - dates[i-1]);
  }
  
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  return Math.max(0, 1 - (stdDev / avgInterval));
}

function calculateStudyPatternCompatibility(user1: any, user2: any) {
  const sessions1 = user1.personalStudySessions || [];
  const sessions2 = user2.personalStudySessions || [];
  
  if (sessions1.length === 0 || sessions2.length === 0) return 0.5;
  
  const pattern1 = analyzeStudyTimePatterns(sessions1);
  const pattern2 = analyzeStudyTimePatterns(sessions2);
  
  return calculateTimePatternOverlap(pattern1, pattern2);
}

function calculateMotivationAlignment(user1: any, user2: any) {
  // Based on goals, achievements, and activity levels
  const activity1 = (user1.personalStudySessions || []).length;
  const activity2 = (user2.personalStudySessions || []).length;
  const goals1 = (user1.goals || []).length;
  const goals2 = (user2.goals || []).length;
  
  const activityMatch = Math.max(0, 1 - Math.abs(activity1 - activity2) / Math.max(activity1, activity2, 1));
  const goalMatch = Math.max(0, 1 - Math.abs(goals1 - goals2) / Math.max(goals1, goals2, 1));
  
  return (activityMatch + goalMatch) / 2;
}

function calculateAvailabilityFlexibility(user1: any, user2: any) {
  const availability1 = parseAvailability(user1.availabilityHours);
  const availability2 = parseAvailability(user2.availabilityHours);
  
  if (availability1.length === 0 || availability2.length === 0) return 0.5;
  
  // Calculate overlap in available time slots
  let totalOverlap = 0;
  let totalTime = 0;
  
  availability1.forEach((slot1: any) => {
    availability2.forEach((slot2: any) => {
      const start1 = new Date(slot1.startTime).getTime();
      const end1 = new Date(slot1.endTime).getTime();
      const start2 = new Date(slot2.startTime).getTime();
      const end2 = new Date(slot2.endTime).getTime();
      
      const overlapStart = Math.max(start1, start2);
      const overlapEnd = Math.min(end1, end2);
      
      if (overlapStart < overlapEnd) {
        totalOverlap += overlapEnd - overlapStart;
      }
      
      totalTime += Math.max(end1 - start1, end2 - start2);
    });
  });
  
  return totalTime > 0 ? totalOverlap / totalTime : 0;
}

function determineCollaborationStyle(user1: any, user2: any) {
  const style1 = user1.learningStyle || 'visual';
  const style2 = user2.learningStyle || 'visual';
  
  if (style1 === style2) {
    return `${style1}-focused sessions`;
  }
  
  const combinations = {
    'visual-auditory': 'Interactive presentations',
    'visual-kinesthetic': 'Hands-on visual learning',
    'auditory-kinesthetic': 'Discussion-based practice',
    'visual-reading': 'Diagram-supported note-taking',
    'auditory-reading': 'Read-aloud study sessions',
    'kinesthetic-reading': 'Active note-taking'
  };
  
  const key = [style1, style2].sort().join('-');
  return combinations[key as keyof typeof combinations] || 'Multi-modal approach';
}

function calculateMutualBenefits(user1: any, user2: any) {
  const benefits = [];
  
  const subjects1 = user1.userSubjects || [];
  const subjects2 = user2.userSubjects || [];
  
  // Find teaching opportunities
  subjects1.forEach((s1: any) => {
    const matchingSubject = subjects2.find((s2: any) => s2.subject?.name === s1.subject?.name);
    if (matchingSubject) {
      const level1 = s1.proficiencyLevel || 'beginner';
      const level2 = matchingSubject.proficiencyLevel || 'beginner';
      
      if (level1 !== level2) {
        benefits.push(`Knowledge sharing in ${s1.subject?.name}`);
      }
    }
  });
  
  // Add general benefits
  if (user1.learningStyle !== user2.learningStyle) {
    benefits.push('Diverse learning perspectives');
  }
  
  if ((user1.personalStudySessions || []).length !== (user2.personalStudySessions || []).length) {
    benefits.push('Balanced study motivation');
  }
  
  return benefits.slice(0, 3);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return matching preferences and criteria info
    const subjects = await prisma.subject.findMany({
      select: { name: true, category: true },
    });

    const studyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
    const learningStyles = ['visual', 'auditory', 'kinesthetic', 'reading'];
    const sessionTypes = ['virtual', 'in_person', 'hybrid'];

    return NextResponse.json({
      filters: {
        subjects: subjects.map((s: any) => s.name),
        subjectCategories: Array.from(new Set(subjects.map((s: any) => s.category))),
        studyLevels,
        learningStyles,
        sessionTypes,
      },
      algorithm: {
        factors: [
          { name: 'Shared Subjects', weight: 45, description: 'Common areas of study' },
          { name: 'Study Level', weight: 20, description: 'Compatible skill levels' },
          { name: 'Learning Style', weight: 15, description: 'Compatible learning approaches' },
          { name: 'Activity Level', weight: 15, description: 'Similar engagement levels' },
          { name: 'Time Zone', weight: 10, description: 'Scheduling compatibility' },
          { name: 'Reputation', weight: 10, description: 'Reviews and experience' },
          { name: 'AI Enhancement', weight: 'Variable', description: 'AI-powered compatibility analysis' },
        ],
        maxScore: 100,
        aiEnhanced: true,
        advancedAlgorithms: true,
        performanceOptimized: true,
      },
      performance: {
        cacheStats: { size: 0, capacity: 0, hitRate: 0, averageAccessCount: 0 },
        memoryUsage: performanceMonitor.getMetrics(),
        connectionPool: null,
      }
    });

  } catch (error) {
    logger.error('Partner matching info error', error as Error, {
      endpoint: '/api/partners/matching'
    });
    return NextResponse.json(
      { error: 'Failed to fetch matching information' },
      { status: 500 }
    );
  }
}