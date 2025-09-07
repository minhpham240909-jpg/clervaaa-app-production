import { User, PersonalStudySession, Goal, Partnership, Review } from '@prisma/client';
import { logger } from '@/lib/logger';

// ============================================================================
// IMPROVED ENGAGEMENT PREDICTION SYSTEM
// ============================================================================

export interface EngagementFeatures {
  // Core study behavior features (normalized)
  sessionFrequency: number;      // 0-1 normalized
  sessionDuration: number;       // 0-1 normalized  
  studyStreak: number;          // 0-1 normalized
  totalStudyTime: number;       // 0-1 normalized
  
  // Goal and progress features
  goalCompletionRate: number;    // 0-1
  goalProgress: number;          // 0-1 normalized
  activeGoals: number;          // 0-1 normalized
  
  // Social engagement features
  socialActivity: number;        // 0-1 normalized
  partnerEngagement: number;     // 0-1 normalized
  reviewActivity: number;        // 0-1 normalized
  
  // Temporal features
  recencyScore: number;         // 0-1 (recent activity)
  consistencyScore: number;     // 0-1 (regular patterns)
  weekendActivity: number;      // 0-1 normalized
  
  // Performance features
  performanceRating: number;     // 0-1 normalized
  skillLevel: number;           // 0-1 normalized
  subjectDiversity: number;     // 0-1 normalized
}

export interface EngagementPrediction {
  engagementScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  predictedDropoutDays: number;
  confidence: number;
  recommendations: string[];
  interventions: string[];
  featureImportance: Array<{ feature: string; importance: number }>;
  modelVersion: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  mse: number;
  mae: number;
}

export class ImprovedEngagementPredictor {
  private static readonly MODEL_VERSION = '2.0.0';
  private static readonly FEATURE_WEIGHTS = {
    sessionFrequency: 0.25,
    sessionDuration: 0.15,
    studyStreak: 0.20,
    goalCompletionRate: 0.15,
    socialActivity: 0.10,
    recencyScore: 0.10,
    consistencyScore: 0.05
  };

  private static readonly FEATURE_BOUNDS = {
    sessionFrequency: { min: 0, max: 7, optimal: 5 },
    sessionDuration: { min: 15, max: 240, optimal: 90 },
    studyStreak: { min: 0, max: 30, optimal: 7 },
    totalStudyTime: { min: 0, max: 50, optimal: 20 },
    goalCompletionRate: { min: 0, max: 1, optimal: 0.8 },
    socialActivity: { min: 0, max: 10, optimal: 3 },
    recencyScore: { min: 0, max: 30, optimal: 1 }
  };

  /**
   * Extract and normalize features from user data
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
    const daysSinceRegistration = Math.max(1, Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate raw features
    const rawFeatures = this.calculateRawFeatures(user, sessions, goals, partnerships, reviews, daysSinceRegistration);
    
    // Normalize features using min-max scaling with optimal targets
    const normalizedFeatures = this.normalizeFeatures(rawFeatures);
    
    // Apply feature engineering
    const engineeredFeatures = this.engineerFeatures(normalizedFeatures, rawFeatures);
    
    return engineeredFeatures;
  }

  /**
   * Calculate raw features from user data
   */
  private static calculateRawFeatures(
    user: User,
    sessions: PersonalStudySession[],
    goals: Goal[],
    partnerships: Partnership[],
    reviews: Review[],
    daysSinceRegistration: number
  ): Record<string, number> {
    // Study behavior features
    const totalStudyHours = sessions.reduce((sum, session) => {
      const duration = session.scheduledAt && session.createdAt 
        ? (new Date(session.scheduledAt).getTime() - new Date(session.createdAt).getTime()) / (1000 * 60 * 60)
        : 0;
      return sum + duration;
    }, 0);

    const sessionFrequency = sessions.length / (daysSinceRegistration / 7); // sessions per week
    const averageSessionDuration = sessions.length > 0 ? totalStudyHours / sessions.length * 60 : 0; // minutes
    const studyStreak = this.calculateStudyStreak(sessions);
    
    // Goal features
    const completedGoals = goals.filter((g: any) => g.status === 'COMPLETED').length;
    const goalCompletionRate = goals.length > 0 ? completedGoals / goals.length : 0;
    const activeGoals = goals.filter((g: any) => g.status !== 'COMPLETED').length;
    
    // Calculate goal progress (weighted by deadline proximity)
    const goalProgress = this.calculateGoalProgress(goals);
    
    // Social features
    const socialActivity = partnerships.length + reviews.length;
    const partnerEngagement = partnerships.filter((p: any) => p.status === 'ACTIVE').length;
    const reviewActivity = reviews.length;
    
    // Temporal features
    const lastActivityDays = sessions.length > 0 
      ? Math.floor((new Date().getTime() - new Date(sessions[sessions.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : daysSinceRegistration;
    
    const consistencyScore = this.calculateConsistencyScore(sessions, daysSinceRegistration);
    const weekendActivity = sessions.filter((session: any) => {
      const day = new Date(session.createdAt).getDay();
      return day === 0 || day === 6;
    }).length;
    
    // Performance features
    const performanceRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + (r.rating || 3), 0) / reviews.length / 5 // Normalize to 0-1
      : 0.5; // Default neutral rating
    
    const skillLevel = this.skillLevelToNumber(user.academicLevel || 'BEGINNER') / 4; // Normalize to 0-1
    const subjectDiversity = Math.min(1, sessions.length / 10); // More sessions = more diversity

    return {
      sessionFrequency,
      sessionDuration: averageSessionDuration,
      studyStreak,
      totalStudyHours,
      goalCompletionRate,
      goalProgress,
      activeGoals,
      socialActivity,
      partnerEngagement,
      reviewActivity,
      lastActivityDays,
      consistencyScore,
      weekendActivity,
      performanceRating,
      skillLevel,
      subjectDiversity
    };
  }

  /**
   * Normalize features using min-max scaling with optimal targets
   */
  private static normalizeFeatures(rawFeatures: Record<string, number>): Record<string, number> {
    const normalized: Record<string, number> = {};
    
    for (const [feature, value] of Object.entries(rawFeatures)) {
      const bounds = this.FEATURE_BOUNDS[feature as keyof typeof this.FEATURE_BOUNDS];
      
      if (bounds) {
        // Min-max normalization with optimal target consideration
        const normalizedValue = Math.max(0, Math.min(1, (value - bounds.min) / (bounds.max - bounds.min)));
        
        // Apply optimal target bonus (features closer to optimal get bonus)
        const distanceFromOptimal = Math.abs(value - bounds.optimal) / (bounds.max - bounds.min);
        const optimalBonus = Math.max(0, 0.2 * (1 - distanceFromOptimal));
        
        normalized[feature] = Math.min(1, normalizedValue + optimalBonus);
      } else {
        // Default normalization for features without bounds
        normalized[feature] = Math.max(0, Math.min(1, value / 10));
      }
    }
    
    return normalized;
  }

  /**
   * Apply feature engineering to create derived features
   */
  private static engineerFeatures(
    normalized: Record<string, number>, 
    raw: Record<string, number>
  ): EngagementFeatures {
    // Create recency score (inverse of last activity days)
    const recencyScore = Math.max(0, 1 - (raw.lastActivityDays / 30));
    
    // Create composite social activity score
    const socialActivity = Math.min(1, (normalized.partnerEngagement + normalized.reviewActivity) / 2);
    
    return {
      sessionFrequency: normalized.sessionFrequency,
      sessionDuration: normalized.sessionDuration,
      studyStreak: normalized.studyStreak,
      totalStudyTime: normalized.totalStudyHours,
      goalCompletionRate: normalized.goalCompletionRate,
      goalProgress: normalized.goalProgress,
      activeGoals: normalized.activeGoals,
      socialActivity,
      partnerEngagement: normalized.partnerEngagement,
      reviewActivity: normalized.reviewActivity,
      recencyScore,
      consistencyScore: normalized.consistencyScore,
      weekendActivity: normalized.weekendActivity,
      performanceRating: normalized.performanceRating,
      skillLevel: normalized.proficiencyLevel,
      subjectDiversity: normalized.subjectDiversity
    };
  }

  /**
   * Calculate study streak with improved algorithm
   */
  private static calculateStudyStreak(sessions: PersonalStudySession[]): number {
    if (sessions.length === 0) return 0;

    const now = new Date();
    const sortedSessions = sessions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    let streak = 0;
    let currentDate = new Date(now);
    const maxDays = 30; // Limit streak calculation to 30 days

    for (let i = 0; i < maxDays; i++) {
      const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const hasSession = sortedSessions.some(session => {
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
   * Calculate goal progress with deadline weighting
   */
  private static calculateGoalProgress(goals: Goal[]): number {
    if (goals.length === 0) return 0;

    const now = new Date();
    let totalProgress = 0;
    let totalWeight = 0;

    for (const goal of goals) {
      if (goal.status === 'COMPLETED') {
        totalProgress += 1;
        totalWeight += 1;
      } else if (goal.targetDate) {
        const daysToDeadline = Math.max(0, (goal.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const deadlineWeight = Math.max(0.1, 1 - (daysToDeadline / 30)); // Closer deadline = higher weight
        const progress = goal.progress / (goal.target || 100);
        totalProgress += progress * deadlineWeight;
        totalWeight += deadlineWeight;
      } else {
        const progress = goal.progress / (goal.target || 100);
        totalProgress += progress * 0.5; // Default weight for goals without deadline
        totalWeight += 0.5;
      }
    }

    return totalWeight > 0 ? totalProgress / totalWeight : 0;
  }

  /**
   * Calculate consistency score based on study patterns
   */
  private static calculateConsistencyScore(sessions: PersonalStudySession[], daysSinceRegistration: number): number {
    if (sessions.length < 2) return 0;

    // Group sessions by week
    const weeklySessions = new Map<number, number>();
    
    for (const session of sessions) {
      const sessionDate = new Date(session.createdAt);
      const weekNumber = Math.floor(sessionDate.getTime() / (7 * 24 * 60 * 60 * 1000));
      weeklySessions.set(weekNumber, (weeklySessions.get(weekNumber) || 0) + 1);
    }

    const sessionCounts = Array.from(weeklySessions.values());
    const mean = sessionCounts.reduce((sum, count) => sum + count, 0) / sessionCounts.length;
    const variance = sessionCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / sessionCounts.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 1 - (standardDeviation / Math.max(1, mean)));
    
    return consistencyScore;
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
   * Predict engagement using improved algorithm
   */
  static predictEngagement(features: EngagementFeatures): EngagementPrediction {
    // Calculate weighted engagement score
    let score = 0;
    const featureImportance: Array<{ feature: string; importance: number }> = [];

    for (const [feature, weight] of Object.entries(this.FEATURE_WEIGHTS)) {
      const featureValue = features[feature as keyof EngagementFeatures] || 0;
      const contribution = featureValue * weight;
      score += contribution;
      
      featureImportance.push({
        feature,
        importance: contribution
      });
    }

    // Apply non-linear transformations for better modeling
    score = this.applyNonLinearTransformations(score, features);
    
    // Ensure score is between 0-100
    score = Math.min(100, Math.max(0, score));

    // Determine risk level with improved thresholds
    const riskLevel = this.determineRiskLevel(score, features);

    // Calculate confidence with uncertainty quantification
    const confidence = this.calculateConfidence(features, score);

    // Predict dropout with improved algorithm
    const predictedDropoutDays = this.predictDropoutDays(score, features);

    // Generate personalized recommendations
    const { recommendations, interventions } = this.generateRecommendations(features, score);

    return {
      engagementScore: Math.round(score),
      riskLevel,
      predictedDropoutDays,
      confidence,
      recommendations,
      interventions,
      featureImportance: featureImportance.sort((a, b) => b.importance - a.importance),
      modelVersion: this.MODEL_VERSION
    };
  }

  /**
   * Apply non-linear transformations for better modeling
   */
  private static applyNonLinearTransformations(score: number, features: EngagementFeatures): number {
    // Handle zero score case properly
    if (score === 0) {
      return 0;
    }
    
    // Apply sigmoid-like transformation for better score distribution
    const sigmoidScore = 100 / (1 + Math.exp(-(score - 50) / 20));
    
    // Apply penalty for very low consistency
    if (features.consistencyScore < 0.3) {
      return sigmoidScore * 0.8; // 20% penalty for low consistency
    }
    
    // Apply bonus for high social activity
    if (features.socialActivity > 0.7) {
      return Math.min(100, sigmoidScore * 1.1); // 10% bonus for high social activity
    }
    
    return sigmoidScore;
  }

  /**
   * Determine risk level with improved algorithm
   */
  private static determineRiskLevel(score: number, features: EngagementFeatures): 'low' | 'medium' | 'high' {
    // Base risk on score
    let baseRisk: 'low' | 'medium' | 'high';
    if (score >= 75) baseRisk = 'low';
    else if (score >= 50) baseRisk = 'medium';
    else baseRisk = 'high';

    // Adjust risk based on consistency and recency
    if (features.consistencyScore < 0.3 && baseRisk === 'low') {
      return 'medium'; // Downgrade low risk if inconsistent
    }
    
    if (features.recencyScore < 0.2 && baseRisk === 'low') {
      return 'medium'; // Downgrade low risk if not recent
    }
    
    if (features.consistencyScore > 0.8 && features.recencyScore > 0.8 && baseRisk === 'medium') {
      return 'low'; // Upgrade medium risk if very consistent and recent
    }

    return baseRisk;
  }

  /**
   * Calculate confidence with uncertainty quantification
   */
  private static calculateConfidence(features: EngagementFeatures, score: number): number {
    let confidence = 0.8; // Base confidence

    // Reduce confidence for new users (less data)
    if (features.totalStudyTime < 0.1) confidence *= 0.7;
    if (features.sessionFrequency < 0.1) confidence *= 0.7;

    // Reduce confidence for extreme scores (less reliable)
    if (score < 10 || score > 90) confidence *= 0.8;

    // Reduce confidence for inconsistent patterns
    if (features.consistencyScore < 0.3) confidence *= 0.9;

    // Increase confidence for consistent, active users
    if (features.consistencyScore > 0.8 && features.recencyScore > 0.8) confidence *= 1.1;

    return Math.min(0.95, Math.max(0.3, confidence));
  }

  /**
   * Predict dropout days with improved algorithm
   */
  private static predictDropoutDays(score: number, features: EngagementFeatures): number {
    // Base prediction on score
    const baseDays = Math.max(1, Math.floor((100 - score) / 8));
    
    // Adjust based on consistency
    const consistencyMultiplier = 0.5 + (features.consistencyScore * 0.5); // 0.5 to 1.0
    
    // Adjust based on recency
    const recencyMultiplier = 0.7 + (features.recencyScore * 0.6); // 0.7 to 1.3
    
    // Adjust based on social activity
    const socialMultiplier = 0.8 + (features.socialActivity * 0.4); // 0.8 to 1.2
    
    const adjustedDays = baseDays * consistencyMultiplier * recencyMultiplier * socialMultiplier;
    
    return Math.round(Math.max(1, Math.min(90, adjustedDays))); // Cap between 1-90 days
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(features: EngagementFeatures, score: number): { recommendations: string[]; interventions: string[] } {
    const recommendations: string[] = [];
    const interventions: string[] = [];

    // Low engagement interventions
    if (score < 40) {
      interventions.push('Send personalized motivational notification');
      interventions.push('Recommend compatible study partners');
      interventions.push('Offer guided study plan creation');
      
      if (features.studyStreak < 0.2) {
        interventions.push('Start a 3-day study challenge with rewards');
      }
      
      if (features.consistencyScore < 0.3) {
        interventions.push('Schedule regular study reminders');
      }
    }

    // Medium engagement recommendations
    if (score >= 40 && score < 70) {
      if (features.sessionDuration < 0.5) {
        recommendations.push('Try longer, more focused study sessions');
      }
      
      if (features.weekendActivity < 0.3) {
        recommendations.push('Consider weekend study sessions for consistency');
      }
      
      if (features.socialActivity < 0.5) {
        recommendations.push('Join study groups to increase motivation');
      }
      
      if (features.goalProgress < 0.6) {
        recommendations.push('Break down large goals into smaller milestones');
      }
    }

    // High engagement maintenance
    if (score >= 70) {
      recommendations.push('Maintain your excellent study habits');
      recommendations.push('Consider mentoring other students');
      recommendations.push('Explore advanced study techniques');
      
      if (features.socialActivity > 0.8) {
        recommendations.push('Share your study strategies with the community');
      }
    }

    // Specific recommendations based on feature analysis
    if (features.consistencyScore < 0.4) {
      recommendations.push('Establish a regular study schedule');
    }
    
    if (features.recencyScore < 0.3) {
      recommendations.push('Start with a short 15-minute study session today');
    }
    
    if (features.goalCompletionRate < 0.5) {
      recommendations.push('Review and adjust your study goals');
    }

    return { recommendations, interventions };
  }

  /**
   * Validate prediction quality
   */
  static validatePrediction(features: EngagementFeatures, prediction: EngagementPrediction): boolean {
    // Check for impossible values
    if (prediction.engagementScore < 0 || prediction.engagementScore > 100) return false;
    if (prediction.confidence < 0 || prediction.confidence > 1) return false;
    if (prediction.predictedDropoutDays < 1 || prediction.predictedDropoutDays > 365) return false;

    // Check for consistency issues
    if (prediction.engagementScore > 80 && prediction.riskLevel === 'high') return false;
    if (prediction.engagementScore < 20 && prediction.riskLevel === 'low') return false;

    // Check feature validity
    for (const [key, value] of Object.entries(features)) {
      if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 1) {
        logger.warn(`Invalid feature value: ${key} = ${value}`);
        return false;
      }
    }

    return true;
  }
}
