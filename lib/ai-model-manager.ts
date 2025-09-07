// AI Model Management Utility for Clerva
// Provides easy switching between different OpenAI models for each feature

import { AI_FEATURE_CONFIG, getFeatureConfig } from './ai-routing-config';

export type AIFeature = 'summary' | 'flashcards' | 'quiz' | 'partnerMatching' | 'progressAnalysis' | 'chatbot';

export type OpenAIModel = 
  | 'gpt-3.5-turbo'      // Cost-effective, fast
  | 'gpt-4o-mini'        // Balanced cost/quality  
  | 'gpt-4o'             // High quality, more expensive
  | 'gpt-4-turbo'        // Legacy high-quality model
  | 'gpt-4';             // Legacy premium model

export interface ModelRecommendation {
  feature: AIFeature;
  recommended: OpenAIModel;
  alternatives: OpenAIModel[];
  reasoning: string;
  estimatedCostPerRequest: string;
}

export const MODEL_RECOMMENDATIONS: Record<AIFeature, ModelRecommendation> = {
  summary: {
    feature: 'summary',
    recommended: 'gpt-3.5-turbo',
    alternatives: ['gpt-4o-mini'],
    reasoning: 'Simple text summarization works well with cost-effective models',
    estimatedCostPerRequest: '$0.002'
  },
  flashcards: {
    feature: 'flashcards',
    recommended: 'gpt-3.5-turbo',
    alternatives: ['gpt-4o-mini'],
    reasoning: 'Q&A generation is straightforward, GPT-3.5 provides good quality',
    estimatedCostPerRequest: '$0.003'
  },
  chatbot: {
    feature: 'chatbot',
    recommended: 'gpt-3.5-turbo',
    alternatives: ['gpt-4o-mini', 'gpt-4o'],
    reasoning: 'Conversational AI works well with GPT-3.5, upgrade for personality',
    estimatedCostPerRequest: '$0.002'
  },
  quiz: {
    feature: 'quiz',
    recommended: 'gpt-4o-mini',
    alternatives: ['gpt-4o', 'gpt-3.5-turbo'],
    reasoning: 'Quiz generation benefits from better reasoning and question variety',
    estimatedCostPerRequest: '$0.008'
  },
  partnerMatching: {
    feature: 'partnerMatching',
    recommended: 'gpt-4o',
    alternatives: ['gpt-4o-mini', 'gpt-4-turbo'],
    reasoning: 'Complex psychological analysis requires advanced reasoning capabilities',
    estimatedCostPerRequest: '$0.025'
  },
  progressAnalysis: {
    feature: 'progressAnalysis',
    recommended: 'gpt-4o',
    alternatives: ['gpt-4o-mini', 'gpt-4-turbo'],
    reasoning: 'Detailed analytics and insights benefit from premium model capabilities',
    estimatedCostPerRequest: '$0.030'
  }
};

export class AIModelManager {
  /**
   * Get the current model configuration for a feature
   */
  static getCurrentConfig(feature: AIFeature) {
    return getFeatureConfig(feature);
  }

  /**
   * Get model recommendation for a feature
   */
  static getRecommendation(feature: AIFeature): ModelRecommendation {
    return MODEL_RECOMMENDATIONS[feature];
  }

  /**
   * Calculate estimated monthly cost based on usage
   */
  static calculateMonthlyCost(usage: Record<AIFeature, number>): {
    totalCost: number;
    breakdown: Record<AIFeature, { requests: number; cost: number; model: string }>;
  } {
    const breakdown: any = {};
    let totalCost = 0;

    Object.entries(usage).forEach(([feature, requests]) => {
      const config = getFeatureConfig(feature as AIFeature);
      const costPerRequest = parseFloat(config.estimatedCost.replace(/[$per request]/g, ''));
      const featureCost = requests * costPerRequest;
      
      breakdown[feature] = {
        requests,
        cost: featureCost,
        model: config.model
      };
      
      totalCost += featureCost;
    });

    return { totalCost, breakdown };
  }

  /**
   * Get optimal model configuration for different budget levels
   */
  static getBudgetRecommendations(monthlyBudget: number) {
    if (monthlyBudget < 10) {
      return {
        budget: 'Low ($5-10/month)',
        configuration: {
          summary: 'gpt-3.5-turbo',
          flashcards: 'gpt-3.5-turbo',
          chatbot: 'gpt-3.5-turbo',
          quiz: 'gpt-3.5-turbo',
          partnerMatching: 'gpt-3.5-turbo',
          progressAnalysis: 'gpt-3.5-turbo'
        },
        description: 'All features use GPT-3.5-turbo for maximum cost efficiency'
      };
    } else if (monthlyBudget < 25) {
      return {
        budget: 'Medium ($10-25/month)',
        configuration: {
          summary: 'gpt-3.5-turbo',
          flashcards: 'gpt-3.5-turbo',
          chatbot: 'gpt-3.5-turbo',
          quiz: 'gpt-4o-mini',
          partnerMatching: 'gpt-4o-mini',
          progressAnalysis: 'gpt-4o-mini'
        },
        description: 'Basic features use GPT-3.5, complex features use GPT-4o-mini'
      };
    } else {
      return {
        budget: 'High ($25+/month)',
        configuration: {
          summary: 'gpt-3.5-turbo',
          flashcards: 'gpt-4o-mini',
          chatbot: 'gpt-4o-mini',
          quiz: 'gpt-4o',
          partnerMatching: 'gpt-4o',
          progressAnalysis: 'gpt-4o'
        },
        description: 'Premium configuration with GPT-4o for complex features'
      };
    }
  }

  /**
   * Generate environment variable configuration
   */
  static generateEnvConfig(models: Partial<Record<AIFeature, OpenAIModel>>): string {
    const envVars: string[] = [];
    
    Object.entries(models).forEach(([feature, model]) => {
      const envVar = `OPENAI_MODEL_${feature.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '')}`;
      envVars.push(`${envVar}="${model}"`);
    });

    return envVars.join('\n');
  }
}

export default AIModelManager;
