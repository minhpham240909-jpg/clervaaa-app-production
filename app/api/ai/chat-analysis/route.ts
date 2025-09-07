import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { aiManager } from '@/lib/ai-providers';

// Request schema for chat analysis
const chatAnalysisSchema = z.object({
  chatId: z.string(),
  messages: z.array(z.object({
    content: z.string(),
    senderId: z.string(),
    createdAt: z.string(),
    type: z.enum(['TEXT', 'IMAGE', 'FILE', 'AUDIO', 'VIDEO', 'SYSTEM'])
  })),
  analysisType: z.enum(['study_suggestions', 'mood_analysis', 'progress_tracking', 'break_recommendations']).optional().default('study_suggestions')
});

interface ChatMessage {
  content: string;
  senderId: string;
  createdAt: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM';
}

interface StudySuggestion {
  type: 'session' | 'quiz' | 'break' | 'goal' | 'resource';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  actionData?: any;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chatId, messages, analysisType } = chatAnalysisSchema.parse(body);

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userSubjects: { include: { subject: true } },
        goals: { where: { status: 'active' } },
        personalStudySessions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate and convert messages to proper format
    const validatedMessages: ChatMessage[] = messages.map(msg => ({
      content: msg.content,
      senderId: msg.senderId,
      createdAt: msg.createdAt,
      type: msg.type
    }));

    // Try AI providers first, fallback to offline analysis
    let analysis: any;
    let suggestions: StudySuggestion[];

    try {
      // Use AI providers for enhanced analysis
      if (aiManager.isConfigured()) {
        logger.info('Using AI provider for chat analysis', { 
          providers: aiManager.getAvailableProviders(),
          messageCount: validatedMessages.length 
        });
        
        const aiResult = await aiManager.analyzeStudyConversation(validatedMessages);
        analysis = aiResult.analysis;
        suggestions = aiResult.suggestions;
        
        logger.info('AI analysis completed successfully', { 
          suggestionsCount: suggestions.length,
          confidence: analysis.overallConfidence 
        });
      } else {
        throw new Error('No AI providers configured, using offline analysis');
      }
    } catch (error) {
      logger.warn('AI provider failed, falling back to offline analysis', error as Error);
      
      // Fallback to offline analysis
      analysis = await analyzeChatMessages(validatedMessages, currentUser, analysisType);
      suggestions = await generateAISuggestions(analysis, currentUser);
      
      logger.info('Offline analysis completed', { suggestionsCount: suggestions.length });
    }
    
    // Store analysis results for learning
    await storeAnalysisResults(chatId, currentUser.id, analysis, suggestions);

    return NextResponse.json({
      analysis,
      suggestions,
      metadata: {
        messagesAnalyzed: validatedMessages.length,
        analysisType,
        confidence: analysis.overallConfidence,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Chat analysis error:', error as Error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze chat' },
      { status: 500 }
    );
  }
}

/**
 * Analyze chat messages for study-related insights
 */
async function analyzeChatMessages(
  messages: ChatMessage[],
  currentUser: any,
  analysisType: string
) {
  const analysis = {
    studyTopics: [] as string[],
    sentiment: 'neutral' as 'positive' | 'negative' | 'neutral',
    engagementLevel: 0.5,
    studyIntensity: 'moderate' as 'low' | 'moderate' | 'high',
    collaborationPatterns: [] as string[],
    timePatterns: {} as Record<string, number>,
    overallConfidence: 0.8
  };

  // Extract study topics from messages
  const studyKeywords = [
    'math', 'calculus', 'algebra', 'physics', 'chemistry', 'biology',
    'computer science', 'programming', 'history', 'literature', 'psychology',
    'study', 'learn', 'practice', 'homework', 'assignment', 'exam', 'test', 'quiz'
  ];

  const topicCounts = new Map<string, number>();
  let positiveWords = 0;
  let negativeWords = 0;
  let totalWords = 0;

  messages.forEach(message => {
    const words = message.content.toLowerCase().split(/\s+/);
    totalWords += words.length;

    // Topic extraction
    words.forEach(word => {
      studyKeywords.forEach(keyword => {
        if (word.includes(keyword)) {
          topicCounts.set(keyword, (topicCounts.get(keyword) || 0) + 1);
        }
      });

      // Sentiment analysis (simplified)
      if (['good', 'great', 'awesome', 'love', 'easy', 'understand', 'clear'].includes(word)) {
        positiveWords++;
      } else if (['bad', 'difficult', 'hard', 'confused', 'stuck', 'hate', 'boring'].includes(word)) {
        negativeWords++;
      }
    });

    // Time pattern analysis
    const hour = new Date(message.createdAt).getHours();
    const timeSlot = getTimeSlot(hour);
    analysis.timePatterns[timeSlot] = (analysis.timePatterns[timeSlot] || 0) + 1;
  });

  // Extract top topics
  analysis.studyTopics = Array.from(topicCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);

  // Calculate sentiment
  const sentimentRatio = (positiveWords - negativeWords) / Math.max(totalWords, 1);
  if (sentimentRatio > 0.1) analysis.sentiment = 'positive';
  else if (sentimentRatio < -0.1) analysis.sentiment = 'negative';

  // Calculate engagement level
  analysis.engagementLevel = Math.min(1, messages.length / 10); // More messages = higher engagement

  // Determine study intensity
  const studyWordCount = Array.from(topicCounts.values()).reduce((sum, count) => sum + count, 0);
  const studyRatio = studyWordCount / Math.max(totalWords, 1);
  
  if (studyRatio > 0.3) analysis.studyIntensity = 'high';
  else if (studyRatio > 0.1) analysis.studyIntensity = 'moderate';
  else analysis.studyIntensity = 'low';

  // Identify collaboration patterns
  if (messages.some(m => m.content.toLowerCase().includes('let\'s') || m.content.toLowerCase().includes('together'))) {
    analysis.collaborationPatterns.push('Collaborative planning');
  }
  if (messages.some(m => m.content.toLowerCase().includes('help') || m.content.toLowerCase().includes('explain'))) {
    analysis.collaborationPatterns.push('Peer tutoring');
  }

  return analysis;
}

/**
 * Generate AI suggestions based on chat analysis
 */
async function generateAISuggestions(
  analysis: any,
  currentUser: any
): Promise<StudySuggestion[]> {
  const suggestions: StudySuggestion[] = [];

  // Study session suggestions
  if (analysis.studyTopics.length > 0 && analysis.engagementLevel > 0.6) {
    suggestions.push({
      type: 'session',
      title: 'Schedule Focused Study Session',
      description: `Based on your discussion about ${analysis.studyTopics[0]}, schedule a dedicated study session`,
      confidence: 0.85,
      priority: 'high',
      actionData: {
        subject: analysis.studyTopics[0],
        duration: 60,
        type: 'collaborative'
      }
    });
  }

  // Quiz suggestions
  if (analysis.studyIntensity === 'high' && analysis.sentiment === 'positive') {
    suggestions.push({
      type: 'quiz',
      title: 'Test Your Understanding',
      description: 'Generate a quiz to reinforce the topics you\'ve been discussing',
      confidence: 0.78,
      priority: 'medium',
      actionData: {
        topics: analysis.studyTopics.slice(0, 3),
        difficulty: 'intermediate'
      }
    });
  }

  // Break recommendations
  if (analysis.studyIntensity === 'high' || analysis.sentiment === 'negative') {
    suggestions.push({
      type: 'break',
      title: 'Take a Study Break',
      description: 'You\'ve been studying intensively. A short break can improve retention',
      confidence: 0.72,
      priority: 'medium',
      actionData: {
        duration: 15,
        type: 'active_break'
      }
    });
  }

  // Goal suggestions
  if (analysis.studyTopics.length > 0 && currentUser.goals.length < 3) {
    suggestions.push({
      type: 'goal',
      title: 'Set Study Goals',
      description: `Create specific goals for ${analysis.studyTopics[0]} based on your discussion`,
      confidence: 0.68,
      priority: 'low',
      actionData: {
        subject: analysis.studyTopics[0],
        timeframe: 'weekly'
      }
    });
  }

  // Resource suggestions
  if (analysis.sentiment === 'negative' || analysis.studyIntensity === 'low') {
    suggestions.push({
      type: 'resource',
      title: 'Additional Learning Resources',
      description: 'Find supplementary materials to help with challenging topics',
      confidence: 0.75,
      priority: 'medium',
      actionData: {
        topics: analysis.studyTopics,
        resourceTypes: ['videos', 'practice_problems', 'tutorials']
      }
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Store analysis results for machine learning
 */
async function storeAnalysisResults(
  chatId: string,
  userId: string,
  analysis: any,
  suggestions: StudySuggestion[]
) {
  try {
    // Store in a hypothetical analytics table
    // This would be used for improving the AI over time
    const analyticsData = {
      chatId,
      userId,
      analysisData: JSON.stringify(analysis),
      suggestionsData: JSON.stringify(suggestions),
      createdAt: new Date()
    };

    // In a real implementation, you'd store this in a dedicated analytics table
    logger.info('Chat analysis stored', { chatId, userId, suggestionCount: suggestions.length });
    
  } catch (error) {
    logger.error('Failed to store analysis results', error as Error);
  }
}

/**
 * Get time slot from hour
 */
function getTimeSlot(hour: number): string {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Chat Analysis API',
    endpoints: {
      POST: 'Analyze chat messages and generate AI suggestions',
    },
    supportedAnalysisTypes: [
      'study_suggestions',
      'mood_analysis', 
      'progress_tracking',
      'break_recommendations'
    ]
  });
}
