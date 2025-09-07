// ============================================================================
// CONTENT RECOMMENDATIONS WITH MACHINE LEARNING
// ============================================================================

import { User, UserSubject, PersonalStudySession, Goal } from '@prisma/client';
import { MultiLayerPerceptron, KNearestNeighbors, DecisionTreeRegressor } from './models';
// Unused ML utilities: cosineSimilarity, kMeansCluster, calculateFeatureImportance
// import { cosineSimilarity, kMeansCluster, calculateFeatureImportance } from './ml-utils';
import { logger } from '@/lib/logger';

export interface ContentRecommendation {
  id: string;
  type: 'material' | 'practice' | 'video' | 'article' | 'quiz' | 'exercise';
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number; // in minutes
  relevanceScore: number; // 0-1
  confidenceScore: number; // 0-1
  reason: string;
  tags: string[];
  url?: string;
  metadata: {
    contentQuality: number;
    userRating: number;
    completionRate: number;
    conceptsCovered: string[];
    prerequisites: string[];
  };
}

export interface LearningStyleProfile {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
  social: number;
  solitary: number;
}

export interface ContentInteraction {
  userId: string;
  user1Id?: string; // Alias for userId (for compatibility)
  contentId: string;
  contentType: string;
  subject: string;
  difficulty: string;
  timeSpent: number; // minutes
  completed: boolean;
  rating: number; // 1-5
  completionStatus?: number; // Alias for rating (for compatibility)
  learningOutcome: number; // 0-1 (improvement score)
  timestamp: Date;
  context: {
    timeOfDay: number;
    sessionType: string;
    title?: string; // Title for context (for compatibility)
    energyLevel: number;
    studyGoal: string;
  };
}

export interface ContentFeatures {
  difficultyLevel: number; // 0-1
  conceptDensity: number; // concepts per minute
  interactivity: number; // 0-1
  visualElements: number; // 0-1
  textDensity: number; // 0-1
  practiceOpportunities: number; // 0-1
  prerequisiteComplexity: number; // 0-1
  contentFreshness: number; // 0-1 (how recent)
  userRating: number; // 0-1
  completionRate: number; // 0-1
  subjectRelevance: number; // 0-1
  learningStyleMatch: number; // 0-1
}

/**
 * ML-Powered Content Recommendation System
 * Recommends study materials based on learning style, progress, and preferences
 */
export class ContentRecommendationEngine {
  private collaborativeModel: KNearestNeighbors;
  private contentModel: MultiLayerPerceptron;
  private difficultyModel: DecisionTreeRegressor;
  private isTrainedFlag: boolean = false;
  private userProfiles: Map<string, LearningStyleProfile> = new Map();
  private contentDatabase: Map<string, ContentRecommendation> = new Map();
  private userContentMatrix: Map<string, Map<string, number>> = new Map();

  constructor() {
    // KNN for collaborative filtering
    this.collaborativeModel = new KNearestNeighbors(10);

    // Neural network for content-based recommendations
    this.contentModel = new MultiLayerPerceptron([
      { size: 18 }, // Combined user + content features
      { size: 32, activation: 'relu' },
      { size: 16, activation: 'relu' },
      { size: 8, activation: 'relu' },
      { size: 1, activation: 'sigmoid' } // Recommendation score
    ]);

    // Decision tree for difficulty matching
    this.difficultyModel = new DecisionTreeRegressor(8, 3);
  }

  /**
   * Train models on content interaction data
   */
  async trainModels(interactions: ContentInteraction[]): Promise<void> {
    if (interactions.length < 50) {
      logger.warn('Insufficient content interaction data for training. Need at least 50 interactions.');
      return;
    }

    logger.info(`Training content recommendation models on ${interactions.length} interactions...`);

    try {
      // Build user profiles and content features
      this.buildUserProfiles(interactions);
      this.buildContentDatabase(interactions);
      this.buildUserContentMatrix(interactions);

      // Prepare training data
      const features = interactions.map((interaction: any) => this.extractInteractionFeatures(interaction));
      const outcomes = interactions.map((interaction: any) => 
        this.calculateInteractionSuccess(interaction)
      );

      // Train collaborative filtering model
      const userIds = Array.from(new Set(interactions.map((i: any) => i.user1Id || i.userId)));
      const collaborativeFeatures = userIds.map((userId: any) => this.getUserVector(userId));
      const collaborativeTargets = userIds.map((userId: any) => this.getUserSatisfactionScore(userId));
      
      if (collaborativeFeatures.length > 0) {
        await this.collaborativeModel.fit(collaborativeFeatures, collaborativeTargets);
      }

      // Train content-based model
      const contentTargets = outcomes.map((outcome: any) => [outcome]);
      await this.contentModel.fit(features, contentTargets);

      // Train difficulty matching model
      const difficultyFeatures = interactions.map((i: any) => this.extractUserDifficultyFeatures(i));
      const difficultyTargets = interactions.map((i: any) => 
        (i.completionStatus || i.rating || 3) >= 4 && i.completed ? 1 : 0 // Success metric
      );
      await this.difficultyModel.fit(difficultyFeatures, difficultyTargets);

      // Evaluate models
      const testSize = Math.floor(features.length * 0.2);
      const testFeatures = features.slice(-testSize);
      const testOutcomes = outcomes.slice(-testSize);

      const contentMetrics = await this.contentModel.evaluate(
        testFeatures,
        testOutcomes.map((o: any) => [o])
      );

      logger.info('Content Model metrics:', {
        r2: contentMetrics.r2?.toFixed(3),
        rmse: contentMetrics.rmse?.toFixed(3)
      });

      this.isTrainedFlag = true;

    } catch (error) {
      logger.error('Error training content recommendation models', error as Error);
      this.isTrainedFlag = false;
    }
  }

  /**
   * Generate personalized content recommendations
   */
  async recommendContent(
    user: User & {
      subjects: UserSubject[];
      personalStudySessions: PersonalStudySession[];
      goals: Goal[];
    },
    context: {
      currentSubject?: string;
      sessionType: 'study' | 'review' | 'practice' | 'exploration';
      difficultyPreference?: 'challenge' | 'comfort' | 'adaptive';
      timeAvailable: number; // minutes
      learningObjective?: string;
    },
    limit: number = 10
  ): Promise<ContentRecommendation[]> {
    try {
      // Get user's learning profile
      const learningProfile = this.userProfiles.get(user.id) || this.inferLearningProfile(user);
      
      // Get relevant content from database
      const candidateContent = this.getCandidateContent(user, context);
      
      // Score and rank content
      const scoredContent = await Promise.all(
        candidateContent.map(async content => {
          const score = await this.scoreContent(user, content, learningProfile, context);
          return { ...content, relevanceScore: score.relevance, confidenceScore: score.confidence };
        })
      );

      // Apply diversity and freshness filters
      const diverseContent = this.applyDiversityFilter(scoredContent, limit);

      // Sort by relevance and return top recommendations
      return diverseContent
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)
        .map((content: any) => this.enrichRecommendation(content, user, context));

    } catch (error) {
      logger.error('Error generating content recommendations', error as Error);
      return this.getFallbackRecommendations(user, context, limit);
    }
  }

  /**
   * Recommend practice problems at appropriate difficulty
   */
  async recommendPracticeProblems(
    user: User & { subjects: UserSubject[]; personalStudySessions: PersonalStudySession[] },
    subject: string,
    currentDifficulty: number, // 0-1
    count: number = 5
  ): Promise<ContentRecommendation[]> {
    try {
      // Get user's performance history in this subject
      const subjectSessions = user.personalStudySessions.filter(
        session => session.title.includes(subject.toLowerCase())
      );

      // Calculate adaptive difficulty
      const adaptiveDifficulty = this.calculateAdaptiveDifficulty(
        subjectSessions,
        currentDifficulty
      );

      // Find practice content at appropriate difficulty
      const practiceContent = Array.from(this.contentDatabase.values())
        .filter((content: any) => 
          content.subject.toLowerCase() === subject.toLowerCase() &&
          content.type === 'practice' &&
          Math.abs(this.mapDifficultyToNumber(content.difficulty) - adaptiveDifficulty) < 0.2
        );

      // Score and select best problems
      const scoredProblems = await Promise.all(
        practiceContent.map(async content => {
          const userFeatures = this.extractUserFeatures(user);
          const contentFeatures = this.extractContentFeatures(content);
          const combinedFeatures = [...userFeatures, ...contentFeatures];

          let score = 0.5; // Default score
          
          if (this.isTrainedFlag) {
            try {
              const prediction = await this.contentModel.predict(combinedFeatures);
              score = prediction[0];
            } catch (error) {
              // Use rule-based scoring as fallback
              score = this.calculateRuleBasedScore(user, content);
            }
          } else {
            score = this.calculateRuleBasedScore(user, content);
          }

          return { ...content, relevanceScore: score };
        })
      );

      return scoredProblems
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, count);

    } catch (error) {
      logger.error('Error recommending practice problems', error as Error);
      return this.generateFallbackPracticeProblems(subject, currentDifficulty, count);
    }
  }

  /**
   * Predict which topics need more focus based on user performance
   */
  async predictFocusTopics(
    user: User & { subjects: UserSubject[]; personalStudySessions: PersonalStudySession[]; goals: Goal[] },
    timeHorizon: number = 7 // days
  ): Promise<Array<{
    topic: string;
    subject: string;
    urgency: number; // 0-1
    reason: string;
    recommendedContent: ContentRecommendation[];
  }>> {
    try {
      const focusAreas = [];

      // Analyze each subject
      for (const userSubject of user.subjects || []) {
        const subjectSessions = user.personalStudySessions.filter(
          session => session.title.includes(userSubject.subjectId)
        );

        if (subjectSessions.length === 0) continue;

        // Calculate performance trends
        const recentSessions = subjectSessions
          .filter((session: any) => {
            const daysSince = (Date.now() - session.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            return daysSince <= timeHorizon;
          })
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        if (recentSessions.length < 2) continue;

        // Identify declining performance or difficulty areas
        const performanceTrend = this.analyzePerformanceTrend(recentSessions);
        const difficultySpots = this.identifyDifficultySpots(recentSessions);

        // Calculate urgency based on trends and goals
        const urgency = this.calculateTopicUrgency(
          performanceTrend,
          difficultySpots,
          userSubject
        );

        if (urgency > 0.3) { // Threshold for recommendation
          const recommendedContent = await this.recommendContent(
            user as User & {
              subjects: UserSubject[];
              personalStudySessions: PersonalStudySession[];
              goals: Goal[];
            },
            {
              currentSubject: userSubject.subjectId,
              sessionType: 'study',
              difficultyPreference: urgency > 0.7 ? 'comfort' : 'adaptive',
              timeAvailable: 60
            },
            3
          );

          focusAreas.push({
            topic: this.extractMainTopic(difficultySpots),
            subject: userSubject.subjectId,
            urgency,
            reason: this.generateFocusReason(performanceTrend, difficultySpots, urgency),
            recommendedContent
          });
        }
      }

      return focusAreas.sort((a, b) => b.urgency - a.urgency);

    } catch (error) {
      logger.error('Error predicting focus topics', error as Error);
      return [];
    }
  }

  // Private helper methods

  private buildUserProfiles(interactions: ContentInteraction[]): void {
    const userInteractions = new Map<string, ContentInteraction[]>();
    
    // Group interactions by user
    interactions.forEach(interaction => {
      const userId = interaction.user1Id || interaction.userId;
      if (!userInteractions.has(userId)) {
        userInteractions.set(userId, []);
      }
      userInteractions.get(userId)!.push(interaction);
    });

    // Build learning style profiles
    userInteractions.forEach((userInts, userId) => {
      const profile = this.inferLearningProfileFromInteractions(userInts);
      this.userProfiles.set(userId, profile);
    });
  }

  private buildContentDatabase(interactions: ContentInteraction[]): void {
    // Extract unique content from interactions and create content objects
    const contentMap = new Map<string, any>();
    
    interactions.forEach(interaction => {
      if (!contentMap.has(interaction.contentId)) {
        contentMap.set(interaction.contentId, {
          id: interaction.contentId,
          type: interaction.contentType as any,
          title: `Content ${interaction.contentId}`,
          description: `${interaction.subject} content`,
          subject: interaction.subject,
          difficulty: interaction.difficulty as any,
          estimatedTime: 30, // Default
          tags: [interaction.subject],
          metadata: {
            contentQuality: 0.8,
            userRating: 0,
            completionRate: 0,
            conceptsCovered: [],
            prerequisites: []
          }
        });
      }

      // Update content statistics
      const content = contentMap.get(interaction.contentId)!;
      const rating = interaction.completionStatus || interaction.rating || 3;
      content.metadata.userRating = 
        (content.metadata.userRating + rating / 5) / 2;
      content.metadata.completionRate = 
        (content.metadata.completionRate + (interaction.completed ? 1 : 0)) / 2;
    });

    // Convert to ContentRecommendation format
    contentMap.forEach((content, id) => {
      const recommendation: ContentRecommendation = {
        ...content,
        relevanceScore: 0,
        confidenceScore: 0,
        reason: ''
      };
      this.contentDatabase.set(id, recommendation);
    });
  }

  private buildUserContentMatrix(interactions: ContentInteraction[]): void {
    interactions.forEach(interaction => {
      const userId = interaction.user1Id || interaction.userId;
      if (!this.userContentMatrix.has(userId)) {
        this.userContentMatrix.set(userId, new Map());
      }
      
      const userMatrix = this.userContentMatrix.get(userId)!;
      const rating = this.calculateInteractionSuccess(interaction);
      userMatrix.set(interaction.contentId, rating);
    });
  }

  private extractInteractionFeatures(interaction: ContentInteraction): number[] {
    // User features
    const userFeatures = [
      interaction.context.timeOfDay / 24,
      interaction.context.energyLevel / 5,
      this.mapSessionType(interaction.context.sessionType || interaction.context.title || 'study'),
      this.mapDifficultyToNumber(interaction.difficulty),
    ];

    // Content features
    const contentFeatures = [
      this.mapContentType(interaction.contentType),
      this.mapDifficultyToNumber(interaction.difficulty),
      Math.min(1, interaction.timeSpent / 60), // Normalize time spent
      interaction.completed ? 1 : 0,
    ];

    // Interaction features
    const interactionFeatures = [
      interaction.timeSpent / 60, // Hours
      (interaction.completionStatus || interaction.rating || 3) / 5, // Normalized rating
      interaction.learningOutcome,
      this.getDayOfWeek(interaction.timestamp) / 7,
    ];

    // Learning style match (simplified)
    const learningStyleFeatures = [
      0.5, // Visual match placeholder
      0.5, // Auditory match placeholder
      0.5, // Kinesthetic match placeholder
      0.5, // Reading match placeholder
      0.5, // Social match placeholder
      0.5, // Solitary match placeholder
    ];

    return [...userFeatures, ...contentFeatures, ...interactionFeatures, ...learningStyleFeatures];
  }

  private calculateInteractionSuccess(interaction: ContentInteraction): number {
    // Weighted combination of different success metrics
    const completionWeight = 0.3;
    const ratingWeight = 0.4;
    const learningOutcomeWeight = 0.3;

    const rating = interaction.completionStatus || interaction.rating || 3;
    return (
      (interaction.completed ? 1 : 0) * completionWeight +
      (rating / 5) * ratingWeight +
      interaction.learningOutcome * learningOutcomeWeight
    );
  }

  private extractUserDifficultyFeatures(interaction: ContentInteraction): number[] {
    const rating = interaction.completionStatus || interaction.rating || 3;
    return [
      this.mapDifficultyToNumber(interaction.difficulty),
      interaction.context.energyLevel / 5,
      interaction.timeSpent / 60,
      rating / 5,
      interaction.completed ? 1 : 0,
      interaction.learningOutcome
    ];
  }

  private getUserVector(userId: string): number[] {
    const userMatrix = this.userContentMatrix.get(userId);
    if (!userMatrix) return new Array(10).fill(0.5);

    // Create a fixed-size vector representing user preferences
    const vector = new Array(10).fill(0);
    const entries = Array.from(userMatrix.entries()).slice(0, 10);
    
    entries.forEach(([contentId, rating], index) => {
      vector[index] = rating;
    });

    return vector;
  }

  private getUserSatisfactionScore(userId: string): number {
    const userMatrix = this.userContentMatrix.get(userId);
    if (!userMatrix) return 0.5;

    const ratings = Array.from(userMatrix.values());
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  private inferLearningProfile(user: User & { subjects?: UserSubject[] }): LearningStyleProfile {
    // Simplified inference based on user data
    return {
      visual: 0.6,
      auditory: 0.4,
      kinesthetic: 0.3,
      reading: 0.7,
      social: 0.5,
      solitary: 0.5
    };
  }

  private inferLearningProfileFromInteractions(interactions: ContentInteraction[]): LearningStyleProfile {
    // Analyze content type preferences to infer learning style
    const typePreferences = new Map<string, number>();
    
    interactions.forEach(interaction => {
      const success = this.calculateInteractionSuccess(interaction);
      const currentPref = typePreferences.get(interaction.contentType) || 0;
      typePreferences.set(interaction.contentType, currentPref + success);
    });

    // Map content types to learning styles (simplified)
    return {
      visual: (typePreferences.get('video') || 0) / interactions.length,
      auditory: (typePreferences.get('audio') || 0) / interactions.length,
      kinesthetic: (typePreferences.get('practice') || 0) / interactions.length,
      reading: (typePreferences.get('article') || 0) / interactions.length,
      social: 0.5, // Would need collaboration data
      solitary: 0.5  // Complement of social
    };
  }

  private getCandidateContent(
    user: User & { subjects?: UserSubject[] },
    context: any
  ): ContentRecommendation[] {
    const candidates = Array.from(this.contentDatabase.values());

    // Filter by subject if specified
    if (context.currentSubject) {
      return candidates.filter((content: any) => 
        content.subject.toLowerCase() === context.currentSubject.toLowerCase()
      );
    }

    // Filter by user's subjects
    const userSubjects = (user.subjects || []).map((s: any) => s.subjectId.toLowerCase());
    return candidates.filter((content: any) => 
      userSubjects.includes(content.subject.toLowerCase())
    );
  }

  private async scoreContent(
    user: User & { subjects?: UserSubject[] },
    content: ContentRecommendation,
    learningProfile: LearningStyleProfile,
    context: any
  ): Promise<{ relevance: number; confidence: number }> {
    try {
      if (this.isTrainedFlag) {
        const userFeatures = this.extractUserFeatures(user);
        const contentFeatures = this.extractContentFeatures(content);
        const contextFeatures = this.extractContextFeatures(context);
        
        const combinedFeatures = [...userFeatures, ...contentFeatures, ...contextFeatures];
        const prediction = await this.contentModel.predict(combinedFeatures);
        
        return {
          relevance: prediction[0],
          confidence: 0.8 // Could be calculated based on training metrics
        };
      } else {
        // Rule-based scoring
        const relevance = this.calculateRuleBasedScore(user, content);
        return { relevance, confidence: 0.6 };
      }
    } catch (error) {
      const relevance = this.calculateRuleBasedScore(user, content);
      return { relevance, confidence: 0.4 };
    }
  }

  private extractUserFeatures(user: User & { subjects?: UserSubject[] }): number[] {
    // Simplified user feature extraction
    const engagementData = user.engagementMetrics ? 
      (typeof user.engagementMetrics === 'string' ? JSON.parse(user.engagementMetrics) : user.engagementMetrics) : {};
    const totalEngagement = engagementData.totalTime || engagementData.sessionsCompleted || 0;
    
    return [
      this.mapStudyLevel(user.academicLevel || user.studyLevel || 'BEGINNER'),
      Math.min(1, totalEngagement / 1000), // Normalize engagement
      Math.min(1, (engagementData.streakDays || 0) / 30), // Normalize streak
      Math.min(1, (user.subjects?.length || 0) / 10), // Normalize subject count
    ];
  }

  private extractContentFeatures(content: ContentRecommendation): number[] {
    return [
      this.mapDifficultyToNumber(content.difficulty),
      this.mapContentType(content.type),
      Math.min(1, content.estimatedTime / 120), // Normalize time
      content.metadata.userRating,
      content.metadata.completionRate,
      content.metadata.contentQuality,
    ];
  }

  private extractContextFeatures(context: any): number[] {
    return [
      this.mapSessionType(context.sessionType || 'study'),
      Math.min(1, context.timeAvailable / 120), // Normalize time available
      context.difficultyPreference === 'challenge' ? 1 : 
      context.difficultyPreference === 'comfort' ? 0 : 0.5,
      Math.random() * 0.1, // Time of day (would use actual)
      Math.random() * 0.1, // Energy level (would use actual)
      Math.random() * 0.1, // Distraction level (would use actual)
      Math.random() * 0.1, // Motivation level (would use actual)
      Math.random() * 0.1, // Previous session success (would use actual)
    ];
  }

  private calculateRuleBasedScore(user: User & { subjects?: UserSubject[] }, content: ContentRecommendation): number {
    let score = 0.5; // Base score

    // Difficulty matching
    const userLevel = this.mapStudyLevel(user.academicLevel || 'BEGINNER');
    const contentLevel = this.mapDifficultyToNumber(content.difficulty);
    const levelDiff = Math.abs(userLevel - contentLevel);
    score += (1 - levelDiff) * 0.3;

    // Content quality
    score += content.metadata.contentQuality * 0.2;

    // User rating
    score += content.metadata.userRating * 0.2;

    // Completion rate
    score += content.metadata.completionRate * 0.2;

    // Time appropriateness (simplified)
    score += Math.random() * 0.1; // Would use actual time matching

    return Math.max(0, Math.min(1, score));
  }

  private applyDiversityFilter(
    content: ContentRecommendation[],
    limit: number
  ): ContentRecommendation[] {
    const selected: ContentRecommendation[] = [];
    const usedTypes = new Set<string>();
    const usedSubjects = new Set<string>();

    // First pass: Select diverse content types and subjects
    for (const item of content) {
      if (selected.length >= limit) break;
      
      const typeNotUsed = !usedTypes.has(item.type);
      const subjectNotUsed = !usedSubjects.has(item.subject);
      
      if (typeNotUsed || subjectNotUsed) {
        selected.push(item);
        usedTypes.add(item.type);
        usedSubjects.add(item.subject);
      }
    }

    // Second pass: Fill remaining slots with highest scoring content
    for (const item of content) {
      if (selected.length >= limit) break;
      if (!selected.includes(item)) {
        selected.push(item);
      }
    }

    return selected;
  }

  private enrichRecommendation(
    content: ContentRecommendation,
    user: User & { subjects?: UserSubject[] },
    context: any
  ): ContentRecommendation {
    return {
      ...content,
      reason: this.generateRecommendationReason(content, context),
      metadata: {
        ...content.metadata,
        conceptsCovered: this.inferConceptsCovered(content),
        prerequisites: this.inferPrerequisites(content)
      }
    };
  }

  private generateRecommendationReason(content: ContentRecommendation, context: any): string {
    const reasons = [];

    if (content.relevanceScore > 0.8) {
      reasons.push('High relevance to your learning goals');
    }

    if (content.metadata.userRating > 0.8) {
      reasons.push('Highly rated by other users');
    }

    if ((context.sessionType || context.title) === 'practice' && content.type === 'practice') {
      reasons.push('Perfect for practice session');
    }

    if (content.metadata.completionRate > 0.8) {
      reasons.push('High completion rate indicates engaging content');
    }

    return reasons.length > 0 ? reasons[0] : 'Recommended based on your preferences';
  }

  // Utility mapping methods
  private mapStudyLevel(level: string): number {
    const mapping = { 'BEGINNER': 0.25, 'INTERMEDIATE': 0.5, 'ADVANCED': 0.75, 'EXPERT': 1.0 };
    return mapping[level as keyof typeof mapping] || 0.25;
  }

  private mapDifficultyToNumber(difficulty: string): number {
    const mapping = { 'beginner': 0.25, 'intermediate': 0.5, 'advanced': 0.75, 'expert': 1.0 };
    return mapping[difficulty as keyof typeof mapping] || 0.5;
  }

  private mapContentType(type: string): number {
    const mapping = {
      'material': 0.2,
      'practice': 0.4,
      'video': 0.6,
      'article': 0.8,
      'quiz': 1.0,
      'exercise': 0.3
    };
    return mapping[type as keyof typeof mapping] || 0.5;
  }

  private mapSessionType(type: string): number {
    const mapping = {
      'study': 0.25,
      'review': 0.5,
      'practice': 0.75,
      'exploration': 1.0
    };
    return mapping[type as keyof typeof mapping] || 0.5;
  }

  private getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  // Additional helper methods for focus prediction
  private calculateAdaptiveDifficulty(
    sessions: PersonalStudySession[],
    currentDifficulty: number
  ): number {
    if (sessions.length === 0) return currentDifficulty;

    // Calculate recent performance trend
    const recentSessions = sessions.slice(-10);
    const avgRating = recentSessions.length > 0 ? 
      recentSessions.reduce((sum, s) => sum + (s.completionStatus || 3), 0) / recentSessions.length : 3;
    const performanceScore = avgRating / 5;

    // Adjust difficulty based on performance
    if (performanceScore > 0.8) {
      return Math.min(1, currentDifficulty + 0.1); // Increase difficulty
    } else if (performanceScore < 0.6) {
      return Math.max(0, currentDifficulty - 0.1); // Decrease difficulty
    }

    return currentDifficulty; // Maintain current difficulty
  }

  private analyzePerformanceTrend(sessions: PersonalStudySession[]): number {
    if (sessions.length < 3) return 0;

    const ratings = sessions.map((s: any) => s.completionStatus || s.rating || 3);
    const firstHalf = ratings.slice(0, Math.floor(ratings.length / 2));
    const secondHalf = ratings.slice(Math.floor(ratings.length / 2));

    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, r) => sum + r, 0) / firstHalf.length : 3;
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, r) => sum + r, 0) / secondHalf.length : 3;

    return (secondAvg - firstAvg) / 5; // Normalize to -1 to 1
  }

  private identifyDifficultySpots(sessions: PersonalStudySession[]): string[] {
    // Simplified: return session types with low ratings
    const lowPerformance = sessions
      .filter((s: any) => (s.completionStatus || s.rating || 3) < 3)
      .map((s: any) => s.title);

    return Array.from(new Set(lowPerformance));
  }

  private calculateTopicUrgency(
    performanceTrend: number,
    difficultySpots: string[],
    userSubject: any
  ): number {
    let urgency = 0;

    // Performance declining
    if (performanceTrend < -0.2) urgency += 0.4;

    // Many difficulty spots
    urgency += Math.min(0.4, difficultySpots.length * 0.1);

    // Subject skill level vs difficulty spots
    if (difficultySpots.length > 0) urgency += 0.2;

    return Math.min(1, urgency);
  }

  private extractMainTopic(difficultySpots: string[]): string {
    return difficultySpots.length > 0 ? difficultySpots[0] : 'General Review';
  }

  private generateFocusReason(
    performanceTrend: number,
    difficultySpots: string[],
    urgency: number
  ): string {
    if (performanceTrend < -0.2) {
      return 'Recent performance decline detected';
    }
    if (difficultySpots.length > 2) {
      return 'Multiple areas showing difficulty';
    }
    if (urgency > 0.7) {
      return 'High priority based on learning goals';
    }
    return 'Recommended for continued progress';
  }

  private inferConceptsCovered(content: ContentRecommendation): string[] {
    // Simplified concept inference based on title and subject
    return [content.subject, content.type].filter(Boolean);
  }

  private inferPrerequisites(content: ContentRecommendation): string[] {
    // Simplified prerequisite inference
    if (content.difficulty === 'advanced' || content.difficulty === 'expert') {
      return [`Basic ${content.subject}`];
    }
    return [];
  }

  // Fallback methods
  private getFallbackRecommendations(
    user: User & { subjects?: UserSubject[] },
    context: any,
    limit: number
  ): ContentRecommendation[] {
    // Generate basic recommendations based on user subjects
    const subjects = (user.subjects || []).map((s: any) => s.subjectId);
    if (subjects.length === 0) subjects.push('General');
    const recommendations: ContentRecommendation[] = [];

    subjects.slice(0, limit).forEach((subject, index) => {
      recommendations.push({
        id: `fallback-${index}`,
        type: 'material',
        title: `${subject} Study Materials`,
        description: `Recommended study materials for ${subject}`,
        subject,
        difficulty: 'intermediate',
        estimatedTime: 30,
        relevanceScore: 0.6,
        confidenceScore: 0.4,
        reason: 'Basic recommendation based on your subjects',
        tags: [subject],
        metadata: {
          contentQuality: 0.7,
          userRating: 0.7,
          completionRate: 0.6,
          conceptsCovered: [subject],
          prerequisites: []
        }
      });
    });

    return recommendations;
  }

  private generateFallbackPracticeProblems(
    subject: string,
    difficulty: number,
    count: number
  ): ContentRecommendation[] {
    const difficultyName = difficulty < 0.3 ? 'beginner' : 
                          difficulty < 0.6 ? 'intermediate' : 
                          difficulty < 0.8 ? 'advanced' : 'expert';

    return Array.from({ length: count }, (_, index) => ({
      id: `fallback-practice-${index}`,
      type: 'practice' as const,
      title: `${subject} Practice Problem ${index + 1}`,
      description: `${difficultyName} level practice problem for ${subject}`,
      subject,
      difficulty: difficultyName as any,
      estimatedTime: 15,
      relevanceScore: 0.6,
      confidenceScore: 0.4,
      reason: 'Basic practice problem',
      tags: [subject, 'practice'],
      metadata: {
        contentQuality: 0.7,
        userRating: 0.6,
        completionRate: 0.7,
        conceptsCovered: [subject],
        prerequisites: []
      }
    }));
  }
}

// Export singleton instance
export const contentRecommendationEngine = new ContentRecommendationEngine();