import { User, PersonalStudySession, Goal, Partnership, Review } from '@prisma/client';
import { logger } from '@/lib/logger';

// ============================================================================
// SIMPLIFIED ENGAGEMENT PREDICTION SYSTEM
// ============================================================================

export interface EngagementFeatures {
  // User behavior features
  totalStudyHours: number;
  averageSessionLength: number;
  sessionFrequency: number;
  streakLength: number;
  completionRate: number;
  
  // Social features
  partnerCount: number;
  groupParticipation: number;
  messageFrequency: number;
  reviewCount: number;
  
  // Goal-related features
  activeGoals: number;
  goalCompletionRate: number;
  daysSinceLastGoal: number;
  
  // Time-based features
  daysSinceRegistration: number;
  lastActivityDays: number;
  weekendActivity: number;
  
  // Performance features
  averageRating: number;
  skillLevel: number;
  subjectCount: number;
}

export interface EngagementPrediction {
  engagementScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  predictedDropoutDays: number;
  confidence: number;
  recommendations: string[];
  interventions: string[];
}

export class SimpleEngagementPredictor {
  /**
   * Extract features from user data for engagement prediction
   */
  static extractFeatures(
    user: User,
    sessions: PersonalStudySession[],
    goals: Goal[],
    partnerships: Partnership[],
    reviews: Review[]
  ): EngagementFeatures {
    const now = new Date();
    const registrationDate = new Date(user.createdAt);
    const daysSinceRegistration = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate study behavior features
    const totalStudyHours = sessions.reduce((sum, session) => {
      const duration = session.scheduledAt && session.createdAt 
        ? (new Date(session.scheduledAt).getTime() - new Date(session.createdAt).getTime()) / (1000 * 60 * 60)
        : 0;
      return sum + duration;
    }, 0);
    
    const averageSessionLength = sessions.length > 0 ? totalStudyHours / sessions.length : 0;
    const sessionFrequency = sessions.length / Math.max(daysSinceRegistration, 1);
    
    // Calculate streak and completion rate
    const sortedSessions = sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const streakLength = this.calculateStreak(sortedSessions);
    const completionRate = goals.length > 0 ? goals.filter((g: any) => g.status === 'COMPLETED').length / goals.length : 0;

    // Calculate social features
    const partnerCount = partnerships.length;
    const messageFrequency = 0; // TODO: Add message count from chat data
    const reviewCount = reviews.length;

    // Calculate goal features
    const activeGoals = goals.filter((g: any) => g.status !== 'COMPLETED').length;
    const lastGoalDate = goals.length > 0 ? new Date(Math.max(...goals.map((g: any) => new Date(g.createdAt).getTime()))) : null;
    const daysSinceLastGoal = lastGoalDate ? Math.floor((now.getTime() - lastGoalDate.getTime()) / (1000 * 60 * 60 * 24)) : daysSinceRegistration;

    // Calculate time-based features
    const lastActivityDays = sessions.length > 0 ? 
      Math.floor((now.getTime() - new Date(sortedSessions[0].createdAt).getTime()) / (1000 * 60 * 60 * 24)) : daysSinceRegistration;
    
    const weekendActivity = sessions.filter((session: any) => {
      const day = new Date(session.createdAt).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length;

    // Calculate performance features
    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 3), 0) / reviews.length : 0;
    const skillLevel = this.skillLevelToNumber(user.academicLevel || 'BEGINNER');
    const subjectCount = 0; // TODO: Add subject count from user subjects

    return {
      totalStudyHours,
      averageSessionLength,
      sessionFrequency,
      streakLength,
      completionRate,
      partnerCount,
      groupParticipation: 0, // TODO: Add group participation data
      messageFrequency,
      reviewCount,
      activeGoals,
      goalCompletionRate: completionRate,
      daysSinceLastGoal,
      daysSinceRegistration,
      lastActivityDays,
      weekendActivity,
      averageRating,
      skillLevel,
      subjectCount
    };
  }

  /**
   * Calculate current streak from study sessions
   */
  private static calculateStreak(sessions: PersonalStudySession[]): number {
    if (sessions.length === 0) return 0;

    const now = new Date();
    let streak = 0;
    let currentDate = new Date(now);

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const hasSession = sessions.some(session => {
        const sessionDate = new Date(session.createdAt);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      if (hasSession) {
        streak++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  /**
   * Convert skill level to numerical value
   */
  private static skillLevelToNumber(skillLevel: string): number {
    const levels = {
      'BEGINNER': 1,
      'INTERMEDIATE': 2,
      'ADVANCED': 3,
      'EXPERT': 4
    };
    return levels[skillLevel as keyof typeof levels] || 1;
  }

  /**
   * Predict engagement using rule-based approach
   */
  static predictEngagement(features: EngagementFeatures): EngagementPrediction {
    // Calculate engagement score using weighted formula
    let score = 0;

    // Study behavior (40% weight)
    score += Math.min(40, features.sessionFrequency * 8); // Max 5 sessions/week = 40 points
    score += Math.min(20, features.streakLength * 2); // Max 10 day streak = 20 points
    score += Math.min(20, features.totalStudyHours / 2); // Max 40 hours = 20 points

    // Goal completion (25% weight)
    score += features.goalCompletionRate * 25;

    // Social engagement (20% weight)
    score += Math.min(10, features.partnerCount * 2); // Max 5 partners = 10 points
    score += Math.min(10, features.reviewCount * 1); // Max 10 reviews = 10 points

    // Activity recency (15% weight)
    const recencyScore = Math.max(0, 15 - features.lastActivityDays * 0.5); // Lose 0.5 points per day
    score += recencyScore;

    // Ensure score is between 0-100
    score = Math.min(100, Math.max(0, score));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (score >= 70) riskLevel = 'low';
    else if (score >= 40) riskLevel = 'medium';
    else riskLevel = 'high';

    // Predict dropout days
    const predictedDropoutDays = this.predictDropoutDays(score, features);

    // Calculate confidence
    const confidence = this.calculateConfidence(features);

    // Generate recommendations and interventions
    const { recommendations, interventions } = this.generateRecommendations(features, score);

    return {
      engagementScore: Math.round(score),
      riskLevel,
      predictedDropoutDays,
      confidence,
      recommendations,
      interventions
    };
  }

  /**
   * Predict days until potential dropout
   */
  private static predictDropoutDays(engagementScore: number, features: EngagementFeatures): number {
    // Simple heuristic based on engagement score and recent activity
    const baseDays = Math.max(1, Math.floor((100 - engagementScore) / 10));
    const activityMultiplier = features.lastActivityDays > 7 ? 0.5 : 1.0;
    const streakMultiplier = features.streakLength > 0 ? 1.5 : 0.8;
    
    return Math.round(baseDays * activityMultiplier * streakMultiplier);
  }

  /**
   * Calculate prediction confidence
   */
  private static calculateConfidence(features: EngagementFeatures): number {
    // Confidence based on data completeness and consistency
    let confidence = 0.8; // Base confidence

    // Reduce confidence for new users
    if (features.daysSinceRegistration < 7) confidence *= 0.7;
    if (features.daysSinceRegistration < 3) confidence *= 0.5;

    // Reduce confidence for users with limited activity
    if (features.totalStudyHours < 5) confidence *= 0.8;
    if (features.sessionFrequency < 0.1) confidence *= 0.7;

    return Math.min(0.95, Math.max(0.3, confidence));
  }

  /**
   * Generate personalized recommendations and interventions
   */
  private static generateRecommendations(features: EngagementFeatures, engagementScore: number): { recommendations: string[]; interventions: string[] } {
    const recommendations: string[] = [];
    const interventions: string[] = [];

    // Low engagement interventions
    if (engagementScore < 40) {
      interventions.push('Send motivational notification with study tips');
      interventions.push('Recommend study partners with similar interests');
      interventions.push('Offer personalized study plan');
      
      if (features.streakLength === 0) {
        interventions.push('Start a 3-day study challenge');
      }
    }

    // Medium engagement recommendations
    if (engagementScore >= 40 && engagementScore < 70) {
      recommendations.push('Try studying at your most productive time');
      recommendations.push('Join a study group to stay motivated');
      recommendations.push('Set smaller, achievable daily goals');
    }

    // High engagement maintenance
    if (engagementScore >= 70) {
      recommendations.push('Maintain your excellent study habits');
      recommendations.push('Consider mentoring other students');
      recommendations.push('Explore advanced study techniques');
    }

    // Specific recommendations based on features
    if (features.averageSessionLength > 120) {
      recommendations.push('Consider shorter, more frequent study sessions');
    }

    if (features.weekendActivity < features.sessionFrequency * 0.3) {
      recommendations.push('Try studying on weekends to maintain consistency');
    }

    if (features.partnerCount === 0) {
      recommendations.push('Find a study partner to increase motivation');
    }

    return { recommendations, interventions };
  }
}
