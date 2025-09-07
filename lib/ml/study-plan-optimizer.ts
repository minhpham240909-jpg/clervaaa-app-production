// ============================================================================
// STUDY PLAN OPTIMIZATION WITH MACHINE LEARNING
// ============================================================================

import { User, PersonalStudySession, Goal } from '@prisma/client';
import { LinearRegressionModel, MultiLayerPerceptron, DecisionTreeRegressor } from './models';
import { exponentialMovingAverage } from './ml-utils';
import { logger } from '@/lib/logger';

export interface StudySessionOptimization {
  optimalDuration: number; // in minutes
  optimalTimeOfDay: number; // hour 0-23
  recommendedBreakInterval: number; // in minutes
  expectedProductivity: number; // 0-1 score
  confidenceLevel: number; // 0-1 score
  factors: {
    timeOfDay: number;
    duration: number;
    breakPattern: number;
    subjectDifficulty: number;
    energyLevel: number;
    environment: number;
  };
}

export interface StudyPlanRecommendation {
  weeklySchedule: Array<{
    day: string;
    sessions: Array<{
      startTime: string;
      duration: number;
      subject: string;
      type: 'focus' | 'review' | 'practice' | 'break';
      priority: number;
    }>;
  }>;
  optimization: StudySessionOptimization;
  insights: {
    bestStudyTimes: string[];
    productivityTrends: string[];
    recommendations: string[];
    warnings: string[];
  };
  performanceMetrics: {
    expectedEfficiency: number;
    burnoutRisk: number;
    goalProgressRate: number;
  };
}

export interface StudySessionData {
  userId: string;
  user1Id?: string; // Alias for userId (for compatibility)
  startTime: Date;
  endTime: Date;
  scheduledAt?: Date; // Alias for startTime (for compatibility)
  createdAt?: Date; // Alias for endTime (for compatibility)
  subject: string;
  rating: number; // 1-5 productivity rating
  completionStatus?: number; // Alias for rating (for compatibility)
  pomodoros: number;
  breaksTaken: number;
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  sessionType: string;
  focusScore: number; // Derived metric
  energyBefore: number; // 1-5 self-reported
  energyAfter: number; // 1-5 self-reported
  environment: string; // home, library, cafe, etc.
  distractions: number; // Count of interruptions
}

/**
 * ML-Powered Study Plan Optimizer
 * Learns from user's study patterns to optimize session timing, duration, and structure
 */
export class StudyPlanOptimizer {
  private productivityModel: LinearRegressionModel;
  private durationModel: MultiLayerPerceptron;
  private timeOptimizer: DecisionTreeRegressor;
  private isTrainedFlag: boolean = false;
  private userPatterns: Map<string, StudyPattern> = new Map();

  constructor() {
    // Linear regression for basic productivity prediction
    this.productivityModel = new LinearRegressionModel();

    // Neural network for complex duration optimization
    this.durationModel = new MultiLayerPerceptron([
      { size: 10 }, // Input features
      { size: 16, activation: 'relu' },
      { size: 8, activation: 'relu' },
      { size: 1, activation: 'linear' } // Optimal duration output
    ]);

    // Decision tree for interpretable time recommendations
    this.timeOptimizer = new DecisionTreeRegressor(6, 3);
  }

  /**
   * Train models on historical study session data
   */
  async trainModels(sessionsData: StudySessionData[]): Promise<void> {
    if (sessionsData.length < 20) {
      logger.warn('Insufficient data for study plan optimization. Need at least 20 sessions.');
      return;
    }

    logger.info(`Training study optimization models on ${sessionsData.length} sessions...`);

    try {
      // Prepare features and targets
      const features = sessionsData.map((session: any) => this.extractSessionFeatures(session));
      const productivityTargets = sessionsData.map((session: any) => session.completionStatus / 5); // Normalize
      const durationTargets = sessionsData.map((session: any) => 
        (session.scheduledAt.getTime() - session.createdAt.getTime()) / (1000 * 60) // Minutes
      );

      // Train productivity model
      await this.productivityModel.fit(features, productivityTargets);

      // Train duration optimization model
      const durationNormalized = durationTargets.map((d: any) => [d / 120]); // Normalize to ~0-1
      await this.durationModel.fit(features, durationNormalized);

      // Train time optimizer
      await this.timeOptimizer.fit(features, productivityTargets);

      // Extract user patterns
      this.extractUserPatterns(sessionsData);

      // Evaluate models
      const { train: trainFeatures, test: testFeatures } = this.splitData(features, 0.8);
      const { train: trainProd, test: testProd } = this.splitData(productivityTargets, 0.8);

      const prodMetrics = await this.productivityModel.evaluate(testFeatures, testProd);
      logger.info('Productivity Model metrics:', {
        r2: prodMetrics.r2?.toFixed(3),
        rmse: prodMetrics.rmse?.toFixed(3)
      });

      this.isTrainedFlag = true;

    } catch (error) {
      logger.error('Error training study plan models', error as Error);
      this.isTrainedFlag = false;
    }
  }

  /**
   * Generate optimized study plan for a user
   */
  async optimizeStudyPlan(
    user: User & {
      personalStudySessions: PersonalStudySession[];
      goals: Goal[];
    },
    preferences: {
      weeklyHours: number;
      preferredTimes: string[];
      subjectPriorities: Record<string, number>;
      breakPreference: number; // minutes
    }
  ): Promise<StudyPlanRecommendation> {
    const userPattern = this.userPatterns.get(user.id);
    
    if (!this.isTrainedFlag && !userPattern) {
      // Return basic recommendation based on general principles
      return this.generateBasicRecommendation(preferences);
    }

    // Get session optimization
    const optimization = await this.optimizeSessionParameters(user);

    // Generate weekly schedule
    const weeklySchedule = await this.generateWeeklySchedule(user, preferences, optimization);

    // Generate insights
    const insights = this.generateInsights(user, userPattern);

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(user, userPattern);

    return {
      weeklySchedule,
      optimization,
      insights,
      performanceMetrics
    };
  }

  /**
   * Optimize individual session parameters
   */
  private async optimizeSessionParameters(
    user: User & { personalStudySessions: PersonalStudySession[] }
  ): Promise<StudySessionOptimization> {
    const recentSessions = user.personalStudySessions
      .filter((s: any) => s.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .slice(0, 50);

    if (recentSessions.length < 5) {
      return this.getDefaultOptimization();
    }

    // Calculate user's historical performance patterns
    const timePerformance = this.analyzeTimePerformance(recentSessions);
    const durationPerformance = this.analyzeDurationPerformance(recentSessions);

    let optimalDuration = 45; // Default
    let optimalTimeOfDay = 14; // Default 2 PM
    let recommendedBreakInterval = 25; // Pomodoro default

    if (this.isTrainedFlag) {
      try {
        // Use trained models for optimization
        const avgFeatures = this.calculateAverageFeatures(recentSessions);
        
        // Predict optimal duration
        const durationPrediction = await this.durationModel.predict(avgFeatures);
        optimalDuration = Math.max(15, Math.min(120, durationPrediction[0] * 120));

        // Find optimal time of day through evaluation
        optimalTimeOfDay = await this.findOptimalTimeOfDay(avgFeatures);

      } catch (error) {
        logger.error('Error in ML optimization, using pattern analysis', error as Error);
      }
    }

    // Use pattern analysis as fallback or enhancement
    const patternOptimalTime = this.findPeakPerformanceTime(timePerformance);
    const patternOptimalDuration = this.findPeakPerformanceDuration(durationPerformance);

    if (patternOptimalTime !== -1) {
      optimalTimeOfDay = patternOptimalTime;
    }
    if (patternOptimalDuration > 0) {
      optimalDuration = Math.round((optimalDuration + patternOptimalDuration) / 2);
    }

    // Calculate break interval based on session length and performance
    recommendedBreakInterval = Math.max(15, Math.min(45, optimalDuration / 2));

    const factors = this.calculateOptimizationFactors(recentSessions);
    const expectedProductivity = this.predictProductivity(factors);
    const confidenceLevel = Math.min(recentSessions.length / 20, 1);

    return {
      optimalDuration,
      optimalTimeOfDay,
      recommendedBreakInterval,
      expectedProductivity,
      confidenceLevel,
      factors
    };
  }

  /**
   * Generate weekly schedule based on optimization
   */
  private async generateWeeklySchedule(
    user: User,
    preferences: any,
    optimization: StudySessionOptimization
  ): Promise<StudyPlanRecommendation['weeklySchedule']> {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule: StudyPlanRecommendation['weeklySchedule'] = [];

    const totalWeeklyMinutes = preferences.weeklyHours * 60;
    const sessionsPerWeek = Math.ceil(totalWeeklyMinutes / optimization.optimalDuration);
    const sessionsPerDay = Math.ceil(sessionsPerWeek / 7);

    for (const day of daysOfWeek) {
      const daySessions = [];

      for (let i = 0; i < sessionsPerDay; i++) {
        const sessionTime = this.calculateOptimalSessionTime(
          day,
          i,
          optimization.optimalTimeOfDay,
          preferences.preferredTimes
        );

        const subject = this.selectOptimalSubject(preferences.subjectPriorities, i);
        const sessionType = this.determineSessionType(i, day);

        daySessions.push({
          startTime: sessionTime,
          duration: optimization.optimalDuration,
          subject,
          type: sessionType,
          priority: this.calculatePriority(subject, sessionType, preferences.subjectPriorities)
        });
      }

      schedule.push({
        day,
        sessions: daySessions
      });
    }

    return schedule;
  }

  /**
   * Extract features from study session for ML models
   */
  private extractSessionFeatures(session: StudySessionData): number[] {
    return [
      session.timeOfDay / 24, // Normalized hour
      session.dayOfWeek / 7, // Normalized day
      session.pomodoros / 8, // Normalized pomodoro count
      session.breaksTaken / 10, // Normalized break count
      session.energyBefore / 5, // Normalized energy
      session.distractions / 20, // Normalized distraction count
      this.encodeEnvironment(session.environment),
      this.encodeSubjectDifficulty(session.subject),
      (session.scheduledAt.getTime() - session.createdAt.getTime()) / (1000 * 60 * 120), // Normalized duration
      session.focusScore / 5 // Normalized focus score
    ];
  }

  /**
   * Extract user-specific patterns from historical data
   */
  private extractUserPatterns(sessionsData: StudySessionData[]): void {
    const userGroups = new Map<string, StudySessionData[]>();
    
    // Group sessions by user
    sessionsData.forEach(session => {
      if (!userGroups.has(session.user1Id)) {
        userGroups.set(session.user1Id, []);
      }
      userGroups.get(session.user1Id)!.push(session);
    });

    // Analyze patterns for each user
    userGroups.forEach((sessions, userId) => {
      const pattern = this.analyzeUserPattern(sessions);
      this.userPatterns.set(userId, pattern);
    });
  }

  /**
   * Analyze individual user's study patterns
   */
  private analyzeUserPattern(sessions: StudySessionData[]): StudyPattern {
    // Time of day analysis
    const hourlyPerformance = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);
    
    sessions.forEach(session => {
      const hour = session.timeOfDay;
      hourlyPerformance[hour] += session.completionStatus;
      hourlyCounts[hour]++;
    });

    // Calculate average performance by hour
    const avgHourlyPerformance = hourlyPerformance.map((total, hour) => 
      hourlyCounts[hour] > 0 ? total / hourlyCounts[hour] : 0
    );

    // Duration analysis
    const durationBuckets = new Map<number, number[]>();
    sessions.forEach(session => {
      const duration = Math.floor((session.scheduledAt.getTime() - session.createdAt.getTime()) / (1000 * 60));
      const bucket = Math.floor(duration / 15) * 15; // 15-minute buckets
      
      if (!durationBuckets.has(bucket)) {
        durationBuckets.set(bucket, []);
      }
      durationBuckets.get(bucket)!.push(session.completionStatus);
    });

    // Productivity trends
    const chronologicalSessions = sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const productivityTrend = exponentialMovingAverage(
      chronologicalSessions.map((s: any) => s.completionStatus),
      0.3
    );

    return {
      avgHourlyPerformance,
      optimalHours: this.findTopPerformanceHours(avgHourlyPerformance, 3),
      avgDurationPerformance: durationBuckets,
      productivityTrend: productivityTrend.slice(-10), // Last 10 sessions trend
      totalSessions: sessions.length,
      avgRating: sessions.reduce((sum, s) => sum + s.completionStatus, 0) / sessions.length,
      consistencyScore: this.calculateConsistency(sessions)
    };
  }

  // Analysis helper methods
  private analyzeTimePerformance(sessions: PersonalStudySession[]): Map<number, number> {
    const timePerformance = new Map<number, { total: number; count: number }>();
    
    sessions.forEach(session => {
      const hour = session.createdAt.getHours();
      const rating = session.completionStatus || 3;
      
      const existing = timePerformance.get(hour) || { total: 0, count: 0 };
      timePerformance.set(hour, {
        total: existing.total + rating,
        count: existing.count + 1
      } as any);
    });

    // Convert to averages
    const avgPerformance = new Map<number, number>();
    timePerformance.forEach((value: any, hour) => {
      avgPerformance.set(hour, value.total / value.count);
    });

    return avgPerformance;
  }

  private analyzeDurationPerformance(sessions: PersonalStudySession[]): Map<number, number> {
    const durationPerformance = new Map<number, { total: number; count: number }>();
    
    sessions.forEach(session => {
      const duration = Math.floor((session.scheduledAt.getTime() - session.createdAt.getTime()) / (1000 * 60));
      const bucket = Math.floor(duration / 15) * 15; // 15-minute buckets
      const rating = session.completionStatus || 3;
      
      const existing = durationPerformance.get(bucket) || { total: 0, count: 0 };
      durationPerformance.set(bucket, {
        total: existing.total + rating,
        count: existing.count + 1
      } as any);
    });

    // Convert to averages
    const avgPerformance = new Map<number, number>();
    durationPerformance.forEach((value: any, bucket) => {
      avgPerformance.set(bucket, value.total / value.count);
    });

    return avgPerformance;
  }

  private findPeakPerformanceTime(timePerformance: Map<number, number>): number {
    let bestHour = -1;
    let bestRating = 0;

    timePerformance.forEach((rating, hour) => {
      if (rating > bestRating) {
        bestRating = rating;
        bestHour = hour;
      }
    });

    return bestHour;
  }

  private findPeakPerformanceDuration(durationPerformance: Map<number, number>): number {
    let bestDuration = 0;
    let bestRating = 0;

    durationPerformance.forEach((rating, duration) => {
      if (rating > bestRating) {
        bestRating = rating;
        bestDuration = duration;
      }
    });

    return bestDuration;
  }

  // Utility methods
  private splitData<T>(data: T[], trainRatio: number): { train: T[]; test: T[] } {
    const splitIndex = Math.floor(data.length * trainRatio);
    return {
      train: data.slice(0, splitIndex),
      test: data.slice(splitIndex)
    };
  }

  private calculateAverageFeatures(sessions: PersonalStudySession[]): number[] {
    const features = sessions.map((session: any) => [
      session.createdAt.getHours() / 24,
      session.createdAt.getDay() / 7,
      session.duration / 8,
      0.5, // Average breaks
      0.7, // Average energy before
      0.2, // Average distractions
      0.5, // Average environment score
      0.6, // Average subject difficulty
      (session.scheduledAt.getTime() - session.createdAt.getTime()) / (1000 * 60 * 120),
      (session.completionStatus || 3) / 5
    ]);

    // Calculate column averages
    const avgFeatures = new Array(features[0].length).fill(0);
    features.forEach(row => {
      row.forEach((val, i) => {
        avgFeatures[i] += val;
      });
    });

    return avgFeatures.map((sum: any) => sum / features.length);
  }

  private async findOptimalTimeOfDay(avgFeatures: number[]): Promise<number> {
    let bestHour = 14; // Default
    let bestScore = 0;

    // Test different hours
    for (let hour = 6; hour <= 22; hour++) {
      const testFeatures = [...avgFeatures];
      testFeatures[0] = hour / 24; // Update time of day feature

      try {
        const productivity = await this.productivityModel.predict(testFeatures);
        if (productivity > bestScore) {
          bestScore = productivity;
          bestHour = hour;
        }
      } catch (error) {
        // Continue with other hours
      }
    }

    return bestHour;
  }

  private encodeEnvironment(env: string): number {
    const mapping = {
      'home': 0.3,
      'library': 0.8,
      'cafe': 0.5,
      'office': 0.7,
      'outdoors': 0.4
    };
    return mapping[env as keyof typeof mapping] || 0.5;
  }

  private encodeSubjectDifficulty(subject: string): number {
    // Simplified subject difficulty mapping
    const difficulty = {
      'math': 0.9,
      'science': 0.8,
      'programming': 0.8,
      'language': 0.6,
      'history': 0.5,
      'literature': 0.6,
      'art': 0.4
    };
    return difficulty[subject.toLowerCase() as keyof typeof difficulty] || 0.6;
  }

  // Default and fallback methods
  private getDefaultOptimization(): StudySessionOptimization {
    return {
      optimalDuration: 45,
      optimalTimeOfDay: 14,
      recommendedBreakInterval: 25,
      expectedProductivity: 0.7,
      confidenceLevel: 0.3,
      factors: {
        timeOfDay: 0.7,
        duration: 0.6,
        breakPattern: 0.5,
        subjectDifficulty: 0.6,
        energyLevel: 0.7,
        environment: 0.5
      }
    };
  }

  private generateBasicRecommendation(preferences: any): StudyPlanRecommendation {
    // Return basic schedule based on general study principles
    const optimization = this.getDefaultOptimization();
    
    return {
      weeklySchedule: this.generateBasicSchedule(preferences),
      optimization,
      insights: {
        bestStudyTimes: ['9:00 AM - 11:00 AM', '2:00 PM - 4:00 PM'],
        productivityTrends: ['Insufficient data for trend analysis'],
        recommendations: [
          'Start with 45-minute study sessions',
          'Take 5-10 minute breaks between sessions',
          'Study during your naturally alert hours'
        ],
        warnings: ['More study history needed for personalized recommendations']
      },
      performanceMetrics: {
        expectedEfficiency: 0.7,
        burnoutRisk: 0.3,
        goalProgressRate: 0.6
      }
    };
  }

  private generateBasicSchedule(preferences: any): StudyPlanRecommendation['weeklySchedule'] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyHours = preferences.weeklyHours / 7;
    const sessionsPerDay = Math.ceil(dailyHours);

    return days.map((day: any) => ({
      day,
      sessions: Array.from({ length: sessionsPerDay }, (_, i) => ({
        startTime: `${9 + i * 2}:00`,
        duration: 45,
        subject: Object.keys(preferences.subjectPriorities)[i % Object.keys(preferences.subjectPriorities).length] || 'General',
        type: i % 3 === 0 ? 'focus' : (i % 3 === 1 ? 'review' : 'practice') as any,
        priority: 1
      }))
    }));
  }

  // Additional helper methods
  private calculateOptimizationFactors(sessions: PersonalStudySession[]): StudySessionOptimization['factors'] {
    return {
      timeOfDay: 0.7,
      duration: 0.6,
      breakPattern: 0.5,
      subjectDifficulty: 0.6,
      energyLevel: 0.7,
      environment: 0.5
    };
  }

  private predictProductivity(factors: StudySessionOptimization['factors']): number {
    const weights = [0.2, 0.2, 0.15, 0.15, 0.15, 0.15];
    const values = Object.values(factors);
    
    return values.reduce((sum, value, index) => sum + value * weights[index], 0);
  }

  private calculateOptimalSessionTime(day: string, sessionIndex: number, optimalHour: number, preferredTimes: string[]): string {
    // Simple scheduling logic - could be enhanced
    const baseHour = Math.max(8, optimalHour - 2 + sessionIndex);
    return `${baseHour}:00`;
  }

  private selectOptimalSubject(priorities: Record<string, number>, sessionIndex: number): string {
    const subjects = Object.keys(priorities);
    return subjects[sessionIndex % subjects.length] || 'General';
  }

  private determineSessionType(sessionIndex: number, day: string): 'focus' | 'review' | 'practice' | 'break' {
    if (sessionIndex === 0) return 'focus';
    if (sessionIndex % 3 === 1) return 'review';
    if (sessionIndex % 3 === 2) return 'practice';
    return 'break';
  }

  private calculatePriority(subject: string, type: string, priorities: Record<string, number>): number {
    const basePriority = priorities[subject] || 1;
    const typeMultiplier = type === 'focus' ? 1.2 : (type === 'practice' ? 1.1 : 1.0);
    return basePriority * typeMultiplier;
  }

  private generateInsights(user: User, userPattern?: StudyPattern): StudyPlanRecommendation['insights'] {
    return {
      bestStudyTimes: userPattern?.optimalHours.map((h: any) => `${h}:00`) || ['9:00 AM', '2:00 PM'],
      productivityTrends: ['Stable performance over recent sessions'],
      recommendations: [
        'Maintain consistent study schedule',
        'Use active recall techniques',
        'Take regular breaks to maintain focus'
      ],
      warnings: userPattern?.consistencyScore < 0.5 ? ['Consider more consistent study timing'] : []
    };
  }

  private calculatePerformanceMetrics(user: User, userPattern?: StudyPattern): StudyPlanRecommendation['performanceMetrics'] {
    return {
      expectedEfficiency: userPattern?.avgRating / 5 || 0.7,
      burnoutRisk: userPattern && userPattern.consistencyScore < 0.4 ? 0.6 : 0.3,
      goalProgressRate: 0.7 // Would calculate based on actual goal progress
    };
  }

  private findTopPerformanceHours(hourlyPerformance: number[], count: number): number[] {
    return Array.from({ length: 24 }, (_, i) => ({ hour: i, performance: hourlyPerformance[i] }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, count)
      .map((item: any) => item.hour);
  }

  private calculateConsistency(sessions: StudySessionData[]): number {
    if (sessions.length < 2) return 0.5;
    
    // Calculate variance in session times
    const hours = sessions.map((s: any) => s.timeOfDay);
    const mean = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;
    
    // Lower variance = higher consistency
    return Math.max(0, 1 - variance / 50); // Normalize roughly to 0-1
  }
}

interface StudyPattern {
  avgHourlyPerformance: number[];
  optimalHours: number[];
  avgDurationPerformance: Map<number, number[]>;
  productivityTrend: number[];
  totalSessions: number;
  avgRating: number;
  consistencyScore: number;
}

// Export singleton instance
export const studyPlanOptimizer = new StudyPlanOptimizer();