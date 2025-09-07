import { User, UserSubject, Partnership, PersonalStudySession, Goal, Review } from '@prisma/client';

// ============================================================================
// RECOMMENDATION ALGORITHMS
// ============================================================================

/**
 * Collaborative Filtering Recommendation Engine
 * Uses user-based and item-based collaborative filtering
 */
export class CollaborativeFilteringEngine {
  private userSimilarityMatrix = new Map<string, Map<string, number>>();
  private itemSimilarityMatrix = new Map<string, Map<string, number>>();

  /**
   * User-based collaborative filtering
   * Time Complexity: O(n²) for similarity calculation, O(n) for prediction
   */
  async recommendPartners(
    targetUser: User,
    allUsers: User[],
    limit: number = 10
  ): Promise<Array<{ user: User; score: number; reason: string }>> {
    // Calculate user similarities
    const similarities = await this.calculateUserSimilarities(targetUser, allUsers);
    
    // Find most similar users
    const similarUsers = similarities
      .filter((sim: any) => sim.similarity > 0.3) // Threshold for meaningful similarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20); // Top 20 similar users
    
    // Generate recommendations based on similar users' preferences
    const recommendations = await this.generateRecommendationsFromSimilarUsers(
      targetUser,
      similarUsers,
      allUsers
    );
    
    return recommendations.slice(0, limit);
  }

  /**
   * Calculate similarity between users using Pearson correlation
   * Time Complexity: O(n) where n is number of common items
   */
  private async calculateUserSimilarities(
    targetUser: User,
    allUsers: User[]
  ): Promise<Array<{ user: User; similarity: number }>> {
    const similarities: Array<{ user: User; similarity: number }> = [];
    
    for (const otherUser of allUsers) {
      if (otherUser.id === targetUser.id) continue;
      
      const similarity = this.calculatePearsonCorrelation(targetUser, otherUser);
      similarities.push({ user: otherUser, similarity });
    }
    
    return similarities;
  }

  /**
   * Pearson correlation coefficient for user similarity
   */
  private calculatePearsonCorrelation(user1: User, user2: User): number {
    // Get common subjects
    const subjects1 = new Set((user1 as any).userSubjects?.map((s: any) => s.subjectId) || []);
    const subjects2 = new Set((user2 as any).userSubjects?.map((s: any) => s.subjectId) || []);
    const commonSubjects = Array.from(subjects1).filter((s: any) => subjects2.has(s));
    
    if (commonSubjects.length < 2) return 0;
    
    // Calculate ratings for common subjects (using skill levels as ratings)
    const ratings1 = commonSubjects.map((subjectId: any) => {
      const subject = (user1 as any).userSubjects?.find((s: any) => s.subjectId === subjectId);
      return this.skillLevelToRating(subject?.proficiencyLevel || 'BEGINNER');
    });
    
    const ratings2 = commonSubjects.map((subjectId: any) => {
      const subject = (user2 as any).userSubjects?.find((s: any) => s.subjectId === subjectId);
      return this.skillLevelToRating(subject?.proficiencyLevel || 'BEGINNER');
    });
    
    // Calculate Pearson correlation
    return this.pearsonCorrelation(ratings1, ratings2);
  }

  /**
   * Convert skill level to numerical rating
   */
  private skillLevelToRating(skillLevel: string): number {
    const ratings = {
      'BEGINNER': 1,
      'INTERMEDIATE': 2,
      'ADVANCED': 3,
      'EXPERT': 4
    };
    return ratings[skillLevel as keyof typeof ratings] || 1;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Generate recommendations from similar users
   */
  private async generateRecommendationsFromSimilarUsers(
    targetUser: User,
    similarUsers: Array<{ user: User; similarity: number }>,
    allUsers: User[]
  ): Promise<Array<{ user: User; score: number; reason: string }>> {
    const recommendations = new Map<string, { user: User; score: number; reason: string }>();
    
    for (const { user: similarUser, similarity } of similarUsers) {
      // Get partners of similar user
      const partners = (similarUser as any).partnerships1 || [];
      
      for (const partnership of partners) {
        const partnerId = partnership.user2Id;
        const partner = allUsers.find(u => u.id === partnerId);
        
        if (!partner || partner.id === targetUser.id) continue;
        
        // Check if target user already has this partner
        const existingPartnership = (targetUser as any).partnerships1?.find((p: any) => p.user2Id === partnerId);
        if (existingPartnership) continue;
        
        // Calculate recommendation score
        const currentScore = recommendations.get(partnerId)?.score || 0;
        const newScore = currentScore + similarity;
        
        recommendations.set(partnerId, {
          user: partner,
          score: newScore,
          reason: `Recommended by users similar to you (similarity: ${similarity.toFixed(2)})`
        });
      }
    }
    
    return Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score);
  }
}

/**
 * Content-Based Recommendation Engine
 * Recommends based on user's own preferences and characteristics
 */
export class ContentBasedEngine {
  /**
   * Content-based partner recommendations
   * Time Complexity: O(n * m) where n is users, m is features
   */
  async recommendPartners(
    targetUser: User,
    allUsers: User[],
    limit: number = 10
  ): Promise<Array<{ user: User; score: number; reason: string }>> {
    const recommendations: Array<{ user: User; score: number; reason: string }> = [];
    
    for (const candidate of allUsers) {
      if (candidate.id === targetUser.id) continue;
      
      const score = this.calculateContentSimilarity(targetUser, candidate);
      const reason = this.generateRecommendationReason(targetUser, candidate, score);
      
      recommendations.push({ user: candidate, score, reason });
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Calculate content similarity using TF-IDF and cosine similarity
   */
  private calculateContentSimilarity(user1: User, user2: User): number {
    // Create feature vectors
    const features1 = this.createFeatureVector(user1);
    const features2 = this.createFeatureVector(user2);
    
    // Calculate cosine similarity
    return this.cosineSimilarity(features1, features2);
  }

  /**
   * Create feature vector for user
   */
  private createFeatureVector(user: User): Map<string, number> {
    const features = new Map<string, number>();
    
    // Subject features
    const subjects = (user as any).userSubjects || [];
    for (const subject of subjects) {
      const featureKey = `subject_${subject.subjectId}`;
      features.set(featureKey, this.skillLevelToWeight(subject.proficiencyLevel));
    }
    
    // Study level feature
    features.set(`level_${user.academicLevel || 'BEGINNER'}`, 1);
    
    // Learning style feature
    if (user.learningStyle) {
      features.set(`style_${user.learningStyle}`, 1);
    }
    
    // University feature
    if (user.institution) {
      features.set(`university_${user.institution}`, 1);
    }
    
    // Major feature
    if (user.major) {
      features.set(`major_${user.major}`, 1);
    }
    
    // Year feature
    if (user.graduationYear) {
      features.set(`year_${user.graduationYear}`, 1);
    }
    
    return features;
  }

  /**
   * Convert skill level to weight
   */
  private skillLevelToWeight(skillLevel: string): number {
    const weights = {
      'BEGINNER': 1,
      'INTERMEDIATE': 2,
      'ADVANCED': 3,
      'EXPERT': 4
    };
    return weights[skillLevel as keyof typeof weights] || 1;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number {
    const allKeys = new Set([...Array.from(vec1.keys()), ...Array.from(vec2.keys())]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const key of allKeys) {
      const val1 = vec1.get(key) || 0;
      const val2 = vec2.get(key) || 0;
      
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }
    
    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Generate recommendation reason
   */
  private generateRecommendationReason(
    targetUser: User,
    candidate: User,
    score: number
  ): string {
    const reasons: string[] = [];
    
    // Subject overlap
    const subjects1 = new Set((targetUser as any).userSubjects?.map((s: any) => s.subjectId) || []);
    const subjects2 = new Set((candidate as any).userSubjects?.map((s: any) => s.subjectId) || []);
    const commonSubjects = Array.from(subjects1).filter((s: any) => subjects2.has(s));
    
    if (commonSubjects.length > 0) {
      reasons.push(`${commonSubjects.length} shared subjects`);
    }
    
    // Study level
    if (targetUser.academicLevel === candidate.academicLevel) {
      reasons.push('Same study level');
    }
    
    // Learning style
    if (targetUser.learningStyle === candidate.learningStyle) {
      reasons.push('Same learning style');
    }
    
    // University
    if (targetUser.institution === candidate.institution) {
      reasons.push('Same university');
    }
    
    return reasons.length > 0 
      ? `High compatibility: ${reasons.join(', ')}`
      : 'Good overall match';
  }
}

/**
 * Hybrid Recommendation Engine
 * Combines collaborative filtering and content-based approaches
 */
export class HybridRecommendationEngine {
  private collaborativeEngine = new CollaborativeFilteringEngine();
  private contentEngine = new ContentBasedEngine();

  /**
   * Hybrid recommendation combining multiple approaches
   * Time Complexity: O(n²) for collaborative + O(n*m) for content-based
   */
  async recommendPartners(
    targetUser: User,
    allUsers: User[],
    limit: number = 10
  ): Promise<Array<{ user: User; score: number; reason: string; method: string }>> {
    // Get recommendations from both engines
    const [collaborativeRecs, contentRecs] = await Promise.all([
      this.collaborativeEngine.recommendPartners(targetUser, allUsers, limit * 2),
      this.contentEngine.recommendPartners(targetUser, allUsers, limit * 2)
    ]);
    
    // Combine recommendations using weighted approach
    const combinedRecs = this.combineRecommendations(
      collaborativeRecs,
      contentRecs,
      { collaborative: 0.6, content: 0.4 }
    );
    
    return combinedRecs.slice(0, limit);
  }

  /**
   * Combine recommendations from different engines
   */
  private combineRecommendations(
    collaborativeRecs: Array<{ user: User; score: number; reason: string }>,
    contentRecs: Array<{ user: User; score: number; reason: string }>,
    weights: { collaborative: number; content: number }
  ): Array<{ user: User; score: number; reason: string; method: string }> {
    const combined = new Map<string, {
      user: User;
      collaborativeScore: number;
      contentScore: number;
      combinedScore: number;
      reason: string;
      method: string;
    }>();
    
    // Add collaborative recommendations
    for (const rec of collaborativeRecs) {
      combined.set(rec.user.id, {
        user: rec.user,
        collaborativeScore: rec.score,
        contentScore: 0,
        combinedScore: rec.score * weights.collaborative,
        reason: rec.reason,
        method: 'collaborative'
      });
    }
    
    // Add content-based recommendations
    for (const rec of contentRecs) {
      const existing = combined.get(rec.user.id);
      if (existing) {
        existing.contentScore = rec.score;
        existing.combinedScore += rec.score * weights.content;
        existing.method = 'hybrid';
        existing.reason = `${existing.reason}; ${rec.reason}`;
      } else {
        combined.set(rec.user.id, {
          user: rec.user,
          collaborativeScore: 0,
          contentScore: rec.score,
          combinedScore: rec.score * weights.content,
          reason: rec.reason,
          method: 'content'
        });
      }
    }
    
    return Array.from(combined.values())
      .map((rec: any) => ({
        user: rec.user,
        score: rec.combinedScore,
        reason: rec.reason,
        method: rec.method
      }))
      .sort((a, b) => b.score - a.score);
  }
}

// ============================================================================
// GAMIFICATION ALGORITHMS
// ============================================================================

/**
 * Gamification Engine for points, achievements, and streaks
 */
export class GamificationEngine {
  /**
   * Calculate points for study session
   * Time Complexity: O(1)
   */
  calculateSessionPoints(session: PersonalStudySession): number {
    let points = 0;
    
    // Base points for duration (1 point per 15 minutes)
    const durationHours = (session.scheduledAt.getTime() - session.createdAt.getTime()) / (1000 * 60 * 60);
    points += Math.floor(durationHours * 4);
    
    // Bonus for Pomodoro sessions
    points += session.duration * 2;
    
    // Bonus for high rating
    if (session.completionStatus && session.completionStatus >= 4) {
      points += 5;
    }
    
    // Bonus for consistent timing
    const expectedDuration = 25; // minutes
    const actualDuration = durationHours * 60;
    if (Math.abs(actualDuration - expectedDuration) <= 5) {
      points += 3; // Consistency bonus
    }
    
    return Math.max(points, 1); // Minimum 1 point
  }

  /**
   * Calculate streak bonus
   * Time Complexity: O(1)
   */
  calculateStreakBonus(currentStreak: number): number {
    if (currentStreak <= 1) return 0;
    
    // Exponential bonus: 2^(streak-1) points
    return Math.pow(2, Math.min(currentStreak - 1, 7)); // Cap at 7 days
  }

  /**
   * Check for achievement unlocks
   * Time Complexity: O(n) where n is number of achievements
   */
  checkAchievements(
    user: User,
    recentActivity: PersonalStudySession[]
  ): Array<{ achievementId: string; name: string; description: string; points: number }> {
    const unlocked: Array<{ achievementId: string; name: string; description: string; points: number }> = [];
    
    // Study streak achievements
    if ((user.currentStreak || 0) >= 7 && !(user as any).userAchievements?.some((a: any) => a.achievementId === 'week_streak')) {
      unlocked.push({
        achievementId: 'week_streak',
        name: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        points: 50
      });
    }
    
    if ((user.currentStreak || 0) >= 30 && !(user as any).userAchievements?.some((a: any) => a.achievementId === 'month_streak')) {
      unlocked.push({
        achievementId: 'month_streak',
        name: 'Monthly Master',
        description: 'Maintain a 30-day study streak',
        points: 200
      });
    }
    
    // Total points achievements
    if ((user.totalPoints || 0) >= 1000 && !(user as any).userAchievements?.some((a: any) => a.achievementId === 'points_1000')) {
      unlocked.push({
        achievementId: 'points_1000',
        name: 'Point Collector',
        description: 'Earn 1,000 total points',
        points: 100
      });
    }
    
    // Study session achievements
    const totalSessions = recentActivity.length;
    if (totalSessions >= 50 && !(user as any).userAchievements?.some((a: any) => a.achievementId === 'sessions_50')) {
      unlocked.push({
        achievementId: 'sessions_50',
        name: 'Session Specialist',
        description: 'Complete 50 study sessions',
        points: 75
      });
    }
    
    // Subject diversity achievements
    const uniqueSubjects = new Set(recentActivity.map((s: any) => s.title)).size;
    if (uniqueSubjects >= 5 && !(user as any).userAchievements?.some((a: any) => a.achievementId === 'diverse_study')) {
      unlocked.push({
        achievementId: 'diverse_study',
        name: 'Diverse Learner',
        description: 'Study 5 different subjects',
        points: 60
      });
    }
    
    return unlocked;
  }

  /**
   * Calculate level based on total points
   * Time Complexity: O(1)
   */
  calculateLevel(totalPoints: number): { level: number; title: string; nextLevelPoints: number } {
    const levels = [
      { level: 1, title: 'Novice', points: 0 },
      { level: 2, title: 'Apprentice', points: 100 },
      { level: 3, title: 'Scholar', points: 300 },
      { level: 4, title: 'Academic', points: 600 },
      { level: 5, title: 'Expert', points: 1000 },
      { level: 6, title: 'Master', points: 1500 },
      { level: 7, title: 'Grandmaster', points: 2500 },
      { level: 8, title: 'Legend', points: 4000 },
      { level: 9, title: 'Mythic', points: 6000 },
      { level: 10, title: 'Transcendent', points: 10000 }
    ];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalPoints >= levels[i].points) {
        const nextLevel = levels[i + 1];
        return {
          level: levels[i].level,
          title: levels[i].title,
          nextLevelPoints: nextLevel ? nextLevel.points : levels[i].points
        };
      }
    }
    
    return { level: 1, title: 'Novice', nextLevelPoints: 100 };
  }
}

// ============================================================================
// ANALYTICS ALGORITHMS
// ============================================================================

/**
 * Analytics Engine for study insights and patterns
 */
export class AnalyticsEngine {
  /**
   * Analyze study patterns and provide insights
   * Time Complexity: O(n log n) for sorting + O(n) for analysis
   */
  analyzeStudyPatterns(sessions: PersonalStudySession[]): {
    totalHours: number;
    averageSessionLength: number;
    mostProductiveTime: string;
    mostProductiveDay: string;
    consistencyScore: number;
    productivityTrend: 'improving' | 'declining' | 'stable';
    recommendations: string[];
  } {
    if (sessions.length === 0) {
      return {
        totalHours: 0,
        averageSessionLength: 0,
        mostProductiveTime: 'N/A',
        mostProductiveDay: 'N/A',
        consistencyScore: 0,
        productivityTrend: 'stable',
        recommendations: ['Start your first study session to get insights!']
      };
    }
    
    // Calculate total hours
    const totalHours = sessions.reduce((sum, session) => {
      const duration = (session.scheduledAt.getTime() - session.createdAt.getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);
    
    // Calculate average session length
    const averageSessionLength = totalHours / sessions.length;
    
    // Find most productive time
    const timeSlots = new Map<string, number>();
    sessions.forEach(session => {
      const hour = session.createdAt.getHours();
      const timeSlot = this.getTimeSlot(hour);
      timeSlots.set(timeSlot, (timeSlots.get(timeSlot) || 0) + 1);
    });
    
    const mostProductiveTime = Array.from(timeSlots.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
    
    // Find most productive day
    const dayCounts = new Map<string, number>();
    sessions.forEach(session => {
      const day = session.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });
    
    const mostProductiveDay = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
    
    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(sessions);
    
    // Analyze productivity trend
    const productivityTrend = this.analyzeProductivityTrend(sessions);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(sessions, {
      totalHours,
      averageSessionLength,
      mostProductiveTime,
      mostProductiveDay,
      consistencyScore,
      productivityTrend
    });
    
    return {
      totalHours,
      averageSessionLength,
      mostProductiveTime,
      mostProductiveDay,
      consistencyScore,
      productivityTrend,
      recommendations
    };
  }

  /**
   * Get time slot from hour
   */
  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'Morning (6 AM - 12 PM)';
    if (hour >= 12 && hour < 18) return 'Afternoon (12 PM - 6 PM)';
    if (hour >= 18 && hour < 24) return 'Evening (6 PM - 12 AM)';
    return 'Night (12 AM - 6 AM)';
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(sessions: PersonalStudySession[]): number {
    if (sessions.length < 2) return 0;
    
    // Sort sessions by date
    const sortedSessions = sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Calculate intervals between sessions
    const intervals: number[] = [];
    for (let i = 1; i < sortedSessions.length; i++) {
      const interval = sortedSessions[i].createdAt.getTime() - sortedSessions[i-1].createdAt.getTime();
      intervals.push(interval / (1000 * 60 * 60 * 24)); // Convert to days
    }
    
    // Calculate standard deviation
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Consistency score: lower std dev = higher consistency
    return Math.max(0, 100 - (stdDev * 20));
  }

  /**
   * Analyze productivity trend
   */
  private analyzeProductivityTrend(sessions: PersonalStudySession[]): 'improving' | 'declining' | 'stable' {
    if (sessions.length < 4) return 'stable';
    
    // Sort by date and get recent sessions
    const sortedSessions = sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const recentSessions = sortedSessions.slice(-10);
    
    // Calculate average rating for first and second half
    const midPoint = Math.floor(recentSessions.length / 2);
    const firstHalf = recentSessions.slice(0, midPoint);
    const secondHalf = recentSessions.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, s) => sum + (s.completionStatus || 3), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, s) => sum + (s.completionStatus || 3), 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    sessions: PersonalStudySession[],
    analysis: any
  ): string[] {
    const recommendations: string[] = [];
    
    if (analysis.averageSessionLength < 0.5) {
      recommendations.push('Try longer study sessions (30+ minutes) for better focus');
    }
    
    if (analysis.consistencyScore < 70) {
      recommendations.push('Establish a more consistent study schedule');
    }
    
    if (analysis.productivityTrend === 'declining') {
      recommendations.push('Consider taking breaks or changing study techniques');
    }
    
    if (sessions.length < 10) {
      recommendations.push('Increase study frequency to build better habits');
    }
    
    recommendations.push(`Your most productive time is ${analysis.mostProductiveTime} - schedule important sessions then`);
    
    return recommendations;
  }
}

// Export engines
export const collaborativeEngine = new CollaborativeFilteringEngine();
export const contentEngine = new ContentBasedEngine();
export const hybridEngine = new HybridRecommendationEngine();
export const gamificationEngine = new GamificationEngine();
export const analyticsEngine = new AnalyticsEngine();
