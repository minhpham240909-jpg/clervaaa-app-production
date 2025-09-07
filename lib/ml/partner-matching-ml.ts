// ============================================================================
// ENHANCED PARTNER MATCHING WITH MACHINE LEARNING
// ============================================================================

import { User, UserSubject, Partnership, PersonalStudySession, Goal } from '@prisma/client';
import { MultiLayerPerceptron, KNearestNeighbors, DecisionTreeRegressor } from './models';
import { trainTestSplit } from './ml-utils';
import { logger } from '@/lib/logger';

export interface PartnerMatchingFeatures {
  subjectOverlap: number;
  levelCompatibility: number;
  learningStyleCompatibility: number;
  timeOverlap: number;
  locationCompatibility: number;
  activityCompatibility: number;
  goalSimilarity: number;
  pastSuccessRate: number;
  communicationPreference: number;
  studyIntensityMatch: number;
  personalityMatch: number;
  scheduleFlexibility: number;
}

export interface MLMatchResult {
  user: User;
  compatibilityScore: number;
  confidenceScore: number;
  matchReasons: string[];
  mlPrediction: {
    successProbability: number;
    expectedRating: number;
    riskFactors: string[];
    strengths: string[];
  };
  featureImportance: Record<string, number>;
}

export interface SuccessfulPartnership {
  user1Features: PartnerMatchingFeatures;
  user2Features: PartnerMatchingFeatures;
  combinedFeatures: number[];
  rating: number;
  sessionCount: number;
  duration: number; // in days
}

/**
 * ML-Enhanced Partner Matching System
 * Uses historical partnership data to predict compatibility
 */
export class MLPartnerMatchingEngine {
  private neuralNetwork: MultiLayerPerceptron;
  private knnModel: KNearestNeighbors;
  private decisionTree: DecisionTreeRegressor;
  private isTrainedFlag: boolean = false;
  private featureWeights: Record<string, number> = {};
  
  constructor() {
    // Neural network for complex pattern recognition
    this.neuralNetwork = new MultiLayerPerceptron([
      { size: 24 }, // Input features (12 base features * 2 users)
      { size: 32, activation: 'relu' },
      { size: 16, activation: 'relu' },
      { size: 8, activation: 'relu' },
      { size: 1, activation: 'sigmoid' } // Success probability
    ]);

    // KNN for similarity-based matching
    this.knnModel = new KNearestNeighbors(7);

    // Decision tree for interpretable rules
    this.decisionTree = new DecisionTreeRegressor(8, 5);
  }

  /**
   * Train models on historical partnership data
   */
  async trainModels(partnerships: SuccessfulPartnership[]): Promise<void> {
    if (partnerships.length < 10) {
      logger.warn('Insufficient training data for ML models. Using rule-based approach.');
      return;
    }

    logger.info(`Training ML models on ${partnerships.length} partnerships...`);

    // Prepare training data
    const features = partnerships.map((p: any) => p.combinedFeatures);
    const ratings = partnerships.map((p: any) => p.completionStatus / 5.0); // Normalize to 0-1
    const successLabels = partnerships.map((p: any) => p.completionStatus >= 4.0 ? 1 : 0);

    // Split data
    const { train: trainFeatures, test: testFeatures } = trainTestSplit(features, 0.8);
    const { train: trainRatings, test: testRatings } = trainTestSplit(ratings, 0.8);
    const { train: trainSuccess, test: testSuccess } = trainTestSplit(successLabels, 0.8);

    try {
      // Train neural network for success prediction
      const nnTrainData = trainFeatures.map((f: any) => [...f]);
      const nnTargets = trainSuccess.map((s: any) => [s]);
      await this.neuralNetwork.fit(nnTrainData, nnTargets);

      // Train KNN for rating prediction
      await this.knnModel.fit(trainFeatures, trainRatings);

      // Train decision tree for interpretable rules
      await this.decisionTree.fit(trainFeatures, trainRatings);

      // Calculate feature importance
      this.calculateFeatureImportance(trainFeatures, trainRatings);

      // Evaluate models
      const nnMetrics = await this.neuralNetwork.evaluate(
        testFeatures.map((f: any) => [...f]),
        testSuccess.map((s: any) => [s])
      );
      
      const knnMetrics = await this.knnModel.evaluate(testFeatures, testRatings);
      const treeMetrics = await this.decisionTree.evaluate(testFeatures, testRatings);

      logger.info('Model Training Complete:', {
        neuralNetwork: { r2: nnMetrics.r2?.toFixed(3), mse: nnMetrics.mse?.toFixed(3) },
        knn: { r2: knnMetrics.r2?.toFixed(3), mse: knnMetrics.mse?.toFixed(3) },
        decisionTree: { r2: treeMetrics.r2?.toFixed(3), mse: treeMetrics.mse?.toFixed(3) }
      });

      this.isTrainedFlag = true;

    } catch (error) {
      logger.error('Error training ML models', error as Error);
      this.isTrainedFlag = false;
    }
  }

  /**
   * Find optimal matches using ML predictions
   */
  async findMLEnhancedMatches(
    targetUser: User & {
      subjects: UserSubject[];
      partnerships: Partnership[];
      goals: Goal[];
      personalStudySessions: PersonalStudySession[];
    },
    candidates: Array<User & {
      subjects: UserSubject[];
      partnerships: Partnership[];
      goals: Goal[];
      personalStudySessions: PersonalStudySession[];
    }>,
    limit: number = 10
  ): Promise<MLMatchResult[]> {
    const results: MLMatchResult[] = [];

    for (const candidate of candidates) {
      if (candidate.id === targetUser.id) continue;

      // Extract features for both users
      const targetFeatures = this.extractUserFeatures(targetUser);
      const candidateFeatures = this.extractUserFeatures(candidate);

      // Combine features for ML prediction
      const combinedFeatures = this.combineUserFeatures(targetFeatures, candidateFeatures);

      // Get ML predictions
      let mlPrediction;
      if (this.isTrainedFlag) {
        mlPrediction = await this.getPredictions(combinedFeatures);
      } else {
        // Fallback to rule-based approach
        mlPrediction = this.getRuleBasedPrediction(targetFeatures, candidateFeatures);
      }

      // Calculate overall compatibility score
      const compatibilityScore = this.calculateCompatibilityScore(
        targetFeatures,
        candidateFeatures,
        mlPrediction
      );

      // Generate explanations
      const matchReasons = this.generateMatchReasons(targetFeatures, candidateFeatures);

      results.push({
        user: candidate,
        compatibilityScore,
        confidenceScore: mlPrediction.confidenceScore,
        matchReasons,
        mlPrediction: {
          successProbability: mlPrediction.successProbability,
          expectedRating: mlPrediction.expectedRating,
          riskFactors: mlPrediction.riskFactors,
          strengths: mlPrediction.strengths
        },
        featureImportance: this.featureWeights
      });
    }

    // Sort by compatibility score and limit results
    return results
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);
  }

  /**
   * Extract comprehensive features for a user
   */
  private extractUserFeatures(user: User & {
    subjects: UserSubject[];
    partnerships: Partnership[];
    goals: Goal[];
    personalStudySessions: PersonalStudySession[];
  }): PartnerMatchingFeatures {
    const partnerships = user.partnerships || [];
    const sessions = user.personalStudySessions || [];
    const goals = user.goals || [];

    // Calculate past success rate
    const completedPartnerships = partnerships.filter((p: any) => p.status === 'COMPLETED');
    const pastSuccessRate = completedPartnerships.length > 0 
      ? completedPartnerships.reduce((sum, p) => sum + (p.completionStatus || 3), 0) / (completedPartnerships.length * 5)
      : 0.6; // Default neutral score

    // Calculate activity level
    const recentSessions = sessions.filter((s: any) => 
      s.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    const activityLevel = Math.min(recentSessions.length / 20, 1); // Normalize to 0-1

    // Calculate goal alignment score
    const activeGoals = goals.filter((g: any) => g.status === 'IN_PROGRESS');
    const goalComplexity = activeGoals.length > 0 
      ? activeGoals.reduce((sum, g) => sum + this.calculateGoalComplexity(g), 0) / activeGoals.length
      : 0.5;

    return {
      subjectOverlap: 0, // Will be calculated when comparing users
      levelCompatibility: this.mapStudyLevel(user.academicLevel || 'BEGINNER'),
      learningStyleCompatibility: this.mapLearningStyle(user.learningStyle || ''),
      timeOverlap: 0, // Will be calculated when comparing users  
      locationCompatibility: 0, // Will be calculated when comparing users
      activityCompatibility: activityLevel,
      goalSimilarity: goalComplexity,
      pastSuccessRate,
      communicationPreference: this.mapCommunicationStyle(user.communicationPreference || 'mixed'),
      studyIntensityMatch: this.mapStudyIntensity(user.studyIntensity || 'moderate'),
      personalityMatch: 0, // Will be calculated when comparing users
      scheduleFlexibility: this.calculateScheduleFlexibility(user.availabilityHours)
    };
  }

  /**
   * Combine features from two users for ML input
   */
  private combineUserFeatures(
    user1Features: PartnerMatchingFeatures,
    user2Features: PartnerMatchingFeatures
  ): number[] {
    // Calculate comparative features
    const combinedFeatures = {
      ...user1Features,
      subjectOverlap: this.calculateSubjectOverlap(user1Features, user2Features),
      timeOverlap: this.calculateTimeOverlap(user1Features, user2Features),
      locationCompatibility: this.calculateLocationCompatibility(user1Features, user2Features),
      personalityMatch: this.calculatePersonalityMatch(user1Features, user2Features)
    };

    // Convert to feature vector
    return [
      combinedFeatures.subjectOverlap,
      Math.abs(user1Features.levelCompatibility - user2Features.levelCompatibility),
      Math.abs(user1Features.learningStyleCompatibility - user2Features.learningStyleCompatibility),
      combinedFeatures.timeOverlap,
      combinedFeatures.locationCompatibility,
      Math.abs(user1Features.activityCompatibility - user2Features.activityCompatibility),
      Math.abs(user1Features.goalSimilarity - user2Features.goalSimilarity),
      (user1Features.pastSuccessRate + user2Features.pastSuccessRate) / 2,
      Math.abs(user1Features.communicationPreference - user2Features.communicationPreference),
      Math.abs(user1Features.studyIntensityMatch - user2Features.studyIntensityMatch),
      combinedFeatures.personalityMatch,
      Math.abs(user1Features.scheduleFlexibility - user2Features.scheduleFlexibility),
      // Add user1 individual features
      user1Features.levelCompatibility,
      user1Features.learningStyleCompatibility,
      user1Features.activityCompatibility,
      user1Features.goalSimilarity,
      user1Features.pastSuccessRate,
      user1Features.communicationPreference,
      user1Features.studyIntensityMatch,
      user1Features.scheduleFlexibility,
      // Add user2 individual features  
      user2Features.levelCompatibility,
      user2Features.learningStyleCompatibility,
      user2Features.activityCompatibility,
      user2Features.goalSimilarity,
      user2Features.pastSuccessRate,
      user2Features.communicationPreference,
      user2Features.studyIntensityMatch,
      user2Features.scheduleFlexibility
    ];
  }

  /**
   * Get ML model predictions
   */
  private async getPredictions(features: number[]): Promise<{
    successProbability: number;
    expectedRating: number;
    confidenceScore: number;
    riskFactors: string[];
    strengths: string[];
  }> {
    try {
      // Get predictions from all models
      const nnPrediction = await this.neuralNetwork.predict(features);
      const knnRating = await this.knnModel.predict(features);
      const treeRating = await this.decisionTree.predict(features);

      const successProbability = nnPrediction[0];
      const expectedRating = (knnRating + treeRating) / 2;

      // Calculate confidence based on model agreement
      const modelVariance = Math.abs(knnRating - treeRating);
      const confidenceScore = Math.max(0, 1 - modelVariance);

      // Analyze risk factors and strengths
      const riskFactors = this.identifyRiskFactors(features);
      const strengths = this.identifyStrengths(features);

      return {
        successProbability,
        expectedRating,
        confidenceScore,
        riskFactors,
        strengths
      };

    } catch (error) {
      logger.error('Error getting ML predictions', error as Error);
      return this.getRuleBasedPrediction({} as any, {} as any);
    }
  }

  /**
   * Fallback rule-based prediction when ML models aren't available
   */
  private getRuleBasedPrediction(
    user1Features: PartnerMatchingFeatures,
    user2Features: PartnerMatchingFeatures
  ): {
    successProbability: number;
    expectedRating: number;
    confidenceScore: number;
    riskFactors: string[];
    strengths: string[];
  } {
    const levelDiff = Math.abs(user1Features.levelCompatibility - user2Features.levelCompatibility);
    const activityDiff = Math.abs(user1Features.activityCompatibility - user2Features.activityCompatibility);
    
    const successProbability = Math.max(0, 0.8 - levelDiff * 0.2 - activityDiff * 0.1);
    const expectedRating = 3.5 + successProbability;

    return {
      successProbability,
      expectedRating,
      confidenceScore: 0.6, // Lower confidence for rule-based
      riskFactors: levelDiff > 0.3 ? ['Significant study level difference'] : [],
      strengths: activityDiff < 0.2 ? ['Similar activity levels'] : []
    };
  }

  /**
   * Calculate overall compatibility score
   */
  private calculateCompatibilityScore(
    user1Features: PartnerMatchingFeatures,
    user2Features: PartnerMatchingFeatures,
    mlPrediction: any
  ): number {
    // Combine ML prediction with traditional scoring
    const mlWeight = this.isTrainedFlag ? 0.7 : 0.3;
    const traditionalWeight = 1 - mlWeight;

    const mlScore = mlPrediction.successProbability;
    
    // Traditional rule-based score
    const traditionalScore = (
      user1Features.subjectOverlap * 0.25 +
      (1 - Math.abs(user1Features.levelCompatibility - user2Features.levelCompatibility)) * 0.20 +
      user1Features.timeOverlap * 0.15 +
      user1Features.locationCompatibility * 0.15 +
      (user1Features.pastSuccessRate + user2Features.pastSuccessRate) / 2 * 0.15 +
      (1 - Math.abs(user1Features.activityCompatibility - user2Features.activityCompatibility)) * 0.10
    );

    return mlWeight * mlScore + traditionalWeight * traditionalScore;
  }

  /**
   * Generate human-readable match reasons
   */
  private generateMatchReasons(
    user1Features: PartnerMatchingFeatures,
    user2Features: PartnerMatchingFeatures
  ): string[] {
    const reasons: string[] = [];

    if (user1Features.subjectOverlap > 0.6) {
      reasons.push('Strong subject overlap');
    }

    const levelDiff = Math.abs(user1Features.levelCompatibility - user2Features.levelCompatibility);
    if (levelDiff < 0.2) {
      reasons.push('Similar study levels');
    }

    if (user1Features.timeOverlap > 0.4) {
      reasons.push('Good schedule compatibility');
    }

    const successRate = (user1Features.pastSuccessRate + user2Features.pastSuccessRate) / 2;
    if (successRate > 0.7) {
      reasons.push('Both users have positive partnership history');
    }

    if (reasons.length === 0) {
      reasons.push('Potential for complementary learning styles');
    }

    return reasons;
  }

  // Helper methods for feature extraction
  private mapStudyLevel(level: string): number {
    const mapping = { 'BEGINNER': 0.2, 'INTERMEDIATE': 0.4, 'ADVANCED': 0.7, 'EXPERT': 1.0 };
    return mapping[level as keyof typeof mapping] || 0.2;
  }

  private mapLearningStyle(style: string): number {
    const mapping = { 'visual': 0.2, 'auditory': 0.4, 'kinesthetic': 0.6, 'reading': 0.8 };
    return mapping[style as keyof typeof mapping] || 0.5;
  }

  private mapCommunicationStyle(style: string): number {
    const mapping = { 'formal': 0.2, 'casual': 0.8, 'mixed': 0.5 };
    return mapping[style as keyof typeof mapping] || 0.5;
  }

  private mapStudyIntensity(intensity: string): number {
    const mapping = { 'relaxed': 0.3, 'moderate': 0.6, 'intensive': 0.9 };
    return mapping[intensity as keyof typeof mapping] || 0.6;
  }

  private calculateGoalComplexity(goal: Goal): number {
    // Simple heuristic based on target value and deadline
    const daysLeft = goal.targetDate ? 
      Math.max(0, (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;
    const targetValue = goal.targetValue || 1;
    return Math.min(1, targetValue / (daysLeft / 7)); // Normalize by weeks
  }

  private calculateScheduleFlexibility(availability: string | null): number {
    if (!availability) return 0.5;
    
    try {
      const slots = JSON.parse(availability);
      return Math.min(1, slots.length / 10); // More slots = more flexibility
    } catch {
      return 0.5;
    }
  }

  private calculateSubjectOverlap(_user1: PartnerMatchingFeatures, _user2: PartnerMatchingFeatures): number {
    // This would need access to actual subject data - simplified for now
    return Math.random() * 0.5 + 0.3; // Placeholder
  }

  private calculateTimeOverlap(_user1: PartnerMatchingFeatures, _user2: PartnerMatchingFeatures): number {
    // This would need access to actual availability data - simplified for now
    return Math.random() * 0.5 + 0.3; // Placeholder
  }

  private calculateLocationCompatibility(_user1: PartnerMatchingFeatures, _user2: PartnerMatchingFeatures): number {
    // This would need access to actual location data - simplified for now
    return Math.random() * 0.5 + 0.3; // Placeholder
  }

  private calculatePersonalityMatch(user1: PartnerMatchingFeatures, user2: PartnerMatchingFeatures): number {
    // Based on communication style and study intensity compatibility
    const commDiff = Math.abs(user1.communicationPreference - user2.communicationPreference);
    const intensityDiff = Math.abs(user1.studyIntensityMatch - user2.studyIntensityMatch);
    return 1 - (commDiff + intensityDiff) / 2;
  }

  private calculateFeatureImportance(features: number[][], targets: number[]): void {
    // Simple correlation-based feature importance
    const featureNames = [
      'subjectOverlap', 'levelDifference', 'learningStyleDifference', 'timeOverlap',
      'locationCompatibility', 'activityDifference', 'goalSimilarityDifference',
      'averageSuccessRate', 'communicationDifference', 'intensityDifference',
      'personalityMatch', 'scheduleFlexibilityDifference'
    ];

    this.featureWeights = {};
    
    for (let i = 0; i < featureNames.length && i < features[0].length; i++) {
      const featureValues = features.map((row: any) => row[i]);
      const correlation = this.calculateCorrelation(featureValues, targets);
      this.featureWeights[featureNames[i]] = Math.abs(correlation);
    }
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private identifyRiskFactors(features: number[]): string[] {
    const risks: string[] = [];
    
    if (features[1] > 0.5) risks.push('Significant study level difference');
    if (features[3] < 0.3) risks.push('Limited schedule overlap');
    if (features[7] < 0.5) risks.push('Below average partnership success history');
    
    return risks;
  }

  private identifyStrengths(features: number[]): string[] {
    const strengths: string[] = [];
    
    if (features[0] > 0.7) strengths.push('Excellent subject match');
    if (features[3] > 0.7) strengths.push('Great schedule compatibility');
    if (features[7] > 0.8) strengths.push('Strong partnership track record');
    
    return strengths;
  }

  /**
   * Get model status and performance metrics
   */
  getModelStatus(): {
    isTrained: boolean;
    featureImportance: Record<string, number>;
    lastTrainingDate: Date | null;
  } {
    return {
      isTrained: this.isTrainedFlag,
      featureImportance: this.featureWeights,
      lastTrainingDate: null // Would store actual training date
    };
  }

  /**
   * Save trained models to string format
   */
  saveModels(): string {
    return JSON.stringify({
      neuralNetwork: this.neuralNetwork.save(),
      knnModel: this.knnModel.save(),
      decisionTree: this.decisionTree.save(),
      featureWeights: this.featureWeights,
      isTrainedFlag: this.isTrainedFlag
    });
  }

  /**
   * Load trained models from string format
   */
  loadModels(modelsData: string): void {
    try {
      const data = JSON.parse(modelsData);
      
      this.neuralNetwork.load(data.neuralNetwork);
      this.knnModel.load(data.knnModel);
      this.decisionTree.load(data.decisionTree);
      this.featureWeights = data.featureWeights;
      this.isTrainedFlag = data.isTrainedFlag;
      
    } catch (error) {
      logger.error('Error loading models', error as Error);
      this.isTrainedFlag = false;
    }
  }
}

// Export singleton instance
export const mlPartnerMatchingEngine = new MLPartnerMatchingEngine();