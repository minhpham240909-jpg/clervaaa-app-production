import { EngagementPredictor, EngagementFeatures, ModelMetrics } from './engagement-predictor';
import { User } from '@prisma/client';
// Unused types: PersonalStudySession, Goal, Partnership, Review
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

// ============================================================================
// ML MODEL TRAINING & EVALUATION UTILITIES
// ============================================================================

export interface TrainingConfig {
  minDataPoints: number;
  testSplit: number;
  validationSplit: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
  earlyStoppingPatience: number;
}

export interface TrainingResult {
  modelMetrics: ModelMetrics;
  trainingConfig: TrainingConfig;
  dataPoints: number;
  trainingTime: number;
  modelPath: string;
  timestamp: Date;
}

export interface ModelEvaluation {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
  confusionMatrix: number[][];
  featureImportance: Array<{ feature: string; importance: number }>;
  recommendations: string[];
}

export class ModelTrainer {
  private defaultConfig: TrainingConfig = {
    minDataPoints: 100,
    testSplit: 0.2,
    validationSplit: 0.2,
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    earlyStoppingPatience: 10
  };

  /**
   * Prepare training data from database
   */
  async prepareTrainingData(): Promise<Array<{ features: EngagementFeatures; engagementScore: number }>> {
    try {
      logger.info('Preparing training data for engagement prediction model');

      // Fetch users with their related data
      const users = await prisma.user.findMany({
        include: {
          personalStudySessions: true,
          goals: true,
          partnerships1: true,
          reviews: {
            where: {
              authorId: { not: null } // Only reviews given by others
            }
          }
        },
        where: {
          createdAt: {
            // Only users who have been active for at least 7 days
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const trainingData: Array<{ features: EngagementFeatures; engagementScore: number }> = [];

      for (const user of users) {
        try {
          // Extract features
          const features = EngagementPredictor.extractFeatures(
            user,
            user.personalStudySessions,
            user.goals,
            user.partnerships1,
            user.reviews
          );

          // Calculate engagement score (ground truth)
          const engagementScore = this.calculateEngagementScore(user, features);

          // Only include users with sufficient data
          if (this.hasSufficientData(features)) {
            trainingData.push({ features, engagementScore });
          }
        } catch (error) {
          logger.warn('Error processing user for training data', { userId: user.id, error });
        }
      }

      logger.info('Training data preparation completed', { 
        totalUsers: users.length, 
        validDataPoints: trainingData.length 
      });

      return trainingData;

    } catch (error) {
      logger.error('Error preparing training data', error);
      throw error;
    }
  }

  /**
   * Train the engagement prediction model
   */
  async trainModel(config?: Partial<TrainingConfig>): Promise<TrainingResult> {
    const trainingConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();

    try {
      logger.info('Starting model training', trainingConfig);

      // Prepare training data
      const allData = await this.prepareTrainingData();

      if (allData.length < trainingConfig.minDataPoints) {
        throw new Error(`Insufficient data: ${allData.length} points, need at least ${trainingConfig.minDataPoints}`);
      }

      // Split data
      const { trainingData, testData } = this.splitData(allData, trainingConfig.testSplit);

      // Create and train model
      const predictor = new EngagementPredictor();
      const modelMetrics = await predictor.trainModel(trainingData);

      // Evaluate on test set
      const evaluation = await this.evaluateModel(predictor, testData);

      // Save model
      const modelPath = `./models/engagement-predictor-${Date.now()}`;
      await predictor.saveModel();

      const trainingTime = Date.now() - startTime;

      const result: TrainingResult = {
        modelMetrics: evaluation,
        trainingConfig,
        dataPoints: allData.length,
        trainingTime,
        modelPath,
        timestamp: new Date()
      };

      logger.info('Model training completed successfully', result);
      return result;

    } catch (error) {
      logger.error('Error training model', error);
      throw error;
    }
  }

  /**
   * Evaluate a trained model
   */
  async evaluateModel(
    predictor: EngagementPredictor, 
    testData: Array<{ features: EngagementFeatures; engagementScore: number }>
  ): Promise<ModelEvaluation> {
    try {
      const predictions: number[] = [];
      const actuals: number[] = [];

      // Make predictions
      for (const dataPoint of testData) {
        try {
          const prediction = await predictor.predictEngagement(dataPoint.features);
          predictions.push(prediction.engagementScore);
          actuals.push(dataPoint.engagementScore);
        } catch (error) {
          logger.warn('Error making prediction during evaluation', error);
        }
      }

      if (predictions.length === 0) {
        throw new Error('No valid predictions for evaluation');
      }

      // Calculate metrics
      const metrics = this.calculateEvaluationMetrics(actuals, predictions);
      const confusionMatrix = this.calculateConfusionMatrix(actuals, predictions);
      const featureImportance = this.calculateFeatureImportance(testData, predictions);
      const recommendations = this.generateEvaluationRecommendations(metrics);

      return {
        ...metrics,
        confusionMatrix,
        featureImportance,
        recommendations
      };

    } catch (error) {
      logger.error('Error evaluating model', error);
      throw error;
    }
  }

  /**
   * Cross-validate the model
   */
  async crossValidate(
    data: Array<{ features: EngagementFeatures; engagementScore: number }>,
    folds: number = 5
  ): Promise<{
    meanAccuracy: number;
    meanPrecision: number;
    meanRecall: number;
    meanF1Score: number;
    stdAccuracy: number;
    foldResults: ModelMetrics[];
  }> {
    try {
      logger.info(`Starting ${folds}-fold cross-validation`);

      const foldResults: ModelMetrics[] = [];
      const foldSize = Math.floor(data.length / folds);

      for (let i = 0; i < folds; i++) {
        const startIdx = i * foldSize;
        const endIdx = i === folds - 1 ? data.length : (i + 1) * foldSize;
        
        const testData = data.slice(startIdx, endIdx);
        const trainingData = [
          ...data.slice(0, startIdx),
          ...data.slice(endIdx)
        ];

        const predictor = new EngagementPredictor();
        await predictor.trainModel(trainingData);
        
        const evaluation = await this.evaluateModel(predictor, testData);
        foldResults.push(evaluation);

        logger.info(`Fold ${i + 1}/${folds} completed`, {
          accuracy: evaluation.accuracy,
          precision: evaluation.precision,
          recall: evaluation.recall
        });
      }

      // Calculate mean and standard deviation
      const accuracies = foldResults.map((r: any) => r.accuracy);
      const precisions = foldResults.map((r: any) => r.precision);
      const recalls = foldResults.map((r: any) => r.recall);
      const f1Scores = foldResults.map((r: any) => r.f1Score);

      const meanAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
      const meanPrecision = precisions.reduce((a, b) => a + b, 0) / precisions.length;
      const meanRecall = recalls.reduce((a, b) => a + b, 0) / recalls.length;
      const meanF1Score = f1Scores.reduce((a, b) => a + b, 0) / f1Scores.length;

      const stdAccuracy = this.calculateStandardDeviation(accuracies);

      logger.info('Cross-validation completed', {
        meanAccuracy,
        meanPrecision,
        meanRecall,
        meanF1Score,
        stdAccuracy
      });

      return {
        meanAccuracy,
        meanPrecision,
        meanRecall,
        meanF1Score,
        stdAccuracy,
        foldResults
      };

    } catch (error) {
      logger.error('Error during cross-validation', error);
      throw error;
    }
  }

  /**
   * Hyperparameter tuning using grid search
   */
  async hyperparameterTuning(
    data: Array<{ features: EngagementFeatures; engagementScore: number }>
  ): Promise<{
    bestConfig: TrainingConfig;
    bestScore: number;
    allResults: Array<{ config: TrainingConfig; score: number }>;
  }> {
    try {
      logger.info('Starting hyperparameter tuning');

      const learningRates = [0.0001, 0.001, 0.01];
      const batchSizes = [16, 32, 64];
      const epochs = [50, 100, 150];

      const allResults: Array<{ config: TrainingConfig; score: number }> = [];
      let bestScore = 0;
      let bestConfig = this.defaultConfig;

      for (const lr of learningRates) {
        for (const batchSize of batchSizes) {
          for (const epoch of epochs) {
            const config: TrainingConfig = {
              ...this.defaultConfig,
              learningRate: lr,
              batchSize,
              epochs: epoch
            };

            try {
              const predictor = new EngagementPredictor();
              await predictor.trainModel(data);
              
              const evaluation = await this.evaluateModel(predictor, data.slice(0, 20)); // Use subset for speed
              const score = evaluation.f1Score; // Use F1 score as optimization metric

              allResults.push({ config, score });

              if (score > bestScore) {
                bestScore = score;
                bestConfig = config;
              }

              logger.info('Hyperparameter combination tested', { config, score });

            } catch (error) {
              logger.warn('Error testing hyperparameter combination', { config, error });
            }
          }
        }
      }

      logger.info('Hyperparameter tuning completed', { bestConfig, bestScore });

      return {
        bestConfig,
        bestScore,
        allResults
      };

    } catch (error) {
      logger.error('Error during hyperparameter tuning', error);
      throw error;
    }
  }

  // Private helper methods

  private calculateEngagementScore(user: User, features: EngagementFeatures): number {
    // Calculate engagement score based on user behavior
    let score = 0;

    // Session frequency (0-25 points)
    score += Math.min(25, features.sessionFrequency * 10);

    // Streak length (0-20 points)
    score += Math.min(20, features.streakLength * 2);

    // Goal completion (0-20 points)
    score += features.goalCompletionRate * 20;

    // Social engagement (0-15 points)
    score += Math.min(15, features.partnerCount * 3 + features.reviewCount * 2);

    // Study time (0-20 points)
    score += Math.min(20, features.totalStudyHours / 10);

    return Math.min(100, Math.max(0, score));
  }

  private hasSufficientData(features: EngagementFeatures): boolean {
    return (
      features.daysSinceRegistration >= 7 &&
      features.totalStudyHours > 0 &&
      features.sessionFrequency > 0
    );
  }

  private splitData<T>(
    data: T[], 
    testSplit: number
  ): { trainingData: T[]; testData: T[] } {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const splitIndex = Math.floor(data.length * (1 - testSplit));
    
    return {
      trainingData: shuffled.slice(0, splitIndex),
      testData: shuffled.slice(splitIndex)
    };
  }

  private calculateEvaluationMetrics(actuals: number[], predictions: number[]): ModelMetrics {
    const n = actuals.length;
    
    let mse = 0;
    let mae = 0;
    let correct = 0;
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < n; i++) {
      const error = actuals[i] - predictions[i];
      mse += error * error;
      mae += Math.abs(error);

      // For classification metrics (high engagement = score > 50)
      const actualClass = actuals[i] > 50 ? 1 : 0;
      const predictedClass = predictions[i] > 50 ? 1 : 0;

      if (actualClass === predictedClass) correct++;
      if (actualClass === 1 && predictedClass === 1) truePositives++;
      if (actualClass === 0 && predictedClass === 1) falsePositives++;
      if (actualClass === 1 && predictedClass === 0) falseNegatives++;
    }

    mse /= n;
    mae /= n;
    const accuracy = correct / n;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return { accuracy, precision, recall, f1Score, mse, mae };
  }

  private calculateConfusionMatrix(actuals: number[], predictions: number[]): number[][] {
    const matrix = [[0, 0], [0, 0]]; // [[TN, FP], [FN, TP]]

    for (let i = 0; i < actuals.length; i++) {
      const actualClass = actuals[i] > 50 ? 1 : 0;
      const predictedClass = predictions[i] > 50 ? 1 : 0;
      matrix[actualClass][predictedClass]++;
    }

    return matrix;
  }

  private calculateFeatureImportance(
    testData: Array<{ features: EngagementFeatures; engagementScore: number }>,
    predictions: number[]
  ): Array<{ feature: string; importance: number }> {
    // Simple feature importance using correlation
    const features = [
      'totalStudyHours', 'averageSessionLength', 'sessionFrequency',
      'streakLength', 'completionRate', 'partnerCount', 'groupParticipation',
      'messageFrequency', 'reviewCount', 'activeGoals', 'goalCompletionRate',
      'daysSinceLastGoal', 'daysSinceRegistration', 'lastActivityDays',
      'weekendActivity', 'averageRating', 'skillLevel', 'subjectCount'
    ];

    const importance: Array<{ feature: string; importance: number }> = [];

    for (const feature of features) {
      const featureValues = testData.map((d: any) => (d.features as any)[feature]);
      const correlation = this.calculateCorrelation(featureValues, predictions);
      importance.push({ feature, importance: Math.abs(correlation) });
    }

    return importance.sort((a, b) => b.importance - a.importance);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private generateEvaluationRecommendations(metrics: ModelMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.accuracy < 0.7) {
      recommendations.push('Consider collecting more training data');
      recommendations.push('Review feature engineering process');
    }

    if (metrics.precision < 0.6) {
      recommendations.push('Model has high false positive rate - consider threshold adjustment');
    }

    if (metrics.recall < 0.6) {
      recommendations.push('Model misses many positive cases - consider feature selection');
    }

    if (metrics.f1Score < 0.65) {
      recommendations.push('Balance between precision and recall needs improvement');
    }

    if (metrics.mse > 500) {
      recommendations.push('High prediction error - consider model architecture changes');
    }

    return recommendations;
  }
}

// Export singleton instance
export const modelTrainer = new ModelTrainer();
