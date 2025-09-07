// AI Feature Routing Configuration for Clerva
// Optimized for cost-effectiveness and quality

export const AI_FEATURE_CONFIG = {
  // Cost-effective features using GPT-3.5-turbo
  summary: {
    model: process.env.OPENAI_MODEL_SUMMARY || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS_SUMMARY || '1500'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE_SUMMARY || '0.7'),
    estimatedCost: '$0.002 per request'
  },
  flashcards: {
    model: process.env.OPENAI_MODEL_FLASHCARDS || 'gpt-3.5-turbo', 
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS_FLASHCARDS || '1500'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE_FLASHCARDS || '0.8'),
    estimatedCost: '$0.003 per request'
  },
  chatbot: {
    model: process.env.OPENAI_MODEL_CHATBOT || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS_CHATBOT || '1000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE_CHATBOT || '0.9'),
    estimatedCost: '$0.002 per request'
  },
  
  // High-quality features using GPT-4
  quiz: {
    model: process.env.OPENAI_MODEL_QUIZ || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS_QUIZ || '2500'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE_QUIZ || '0.6'),
    estimatedCost: '$0.015 per request'
  },
  partnerMatching: {
    model: process.env.OPENAI_MODEL_PARTNERMATCHING || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS_PARTNER_MATCHING || '2000'), 
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE_PARTNER_MATCHING || '0.5'),
    estimatedCost: '$0.025 per request'
  },
  progressAnalysis: {
    model: process.env.OPENAI_MODEL_PROGRESSANALYSIS || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS_PROGRESS_ANALYSIS || '3000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE_PROGRESS_ANALYSIS || '0.4'),
    estimatedCost: '$0.030 per request'
  }
};

export const getFeatureConfig = (feature: string) => {
  return AI_FEATURE_CONFIG[feature as keyof typeof AI_FEATURE_CONFIG] || AI_FEATURE_CONFIG.summary;
};

export const getEstimatedMonthlyCost = (usage: { [key: string]: number }) => {
  let totalCost = 0;
  Object.entries(usage).forEach(([feature, requests]) => {
    const config = AI_FEATURE_CONFIG[feature as keyof typeof AI_FEATURE_CONFIG];
    if (config) {
      const costPerRequest = parseFloat(config.estimatedCost.replace(/[$per request]/g, ''));
      totalCost += requests * costPerRequest;
    }
  });
  return totalCost;
};
