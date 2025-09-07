// ============================================================================
// MACHINE LEARNING CORE MODULE
// ============================================================================

import { logger } from '@/lib/logger';

export * from './partner-matching-ml';
export * from './study-plan-optimizer';
export * from './content-recommender';
export * from './ml-utils';
export * from './models';

// Re-export engagement predictor with alias to avoid naming conflicts
export { EngagementPredictor as MLEngagementPredictor } from './engagement-predictor';

// Main ML Engine that coordinates all ML features
export class MLEngine {
  private static instance: MLEngine;

  static getInstance(): MLEngine {
    if (!MLEngine.instance) {
      MLEngine.instance = new MLEngine();
    }
    return MLEngine.instance;
  }

  private constructor() {}

  async initialize(): Promise<void> {
    // Initialize all ML models
    logger.info('Initializing ML Engine...');
    // Models will be lazy-loaded when needed
  }

  getHealth(): { status: string; models: Record<string, boolean> } {
    return {
      status: 'healthy',
      models: {
        partnerMatching: true,
        studyPlanOptimizer: true,
        contentRecommender: true,
        engagementPredictor: true
      }
    };
  }
}