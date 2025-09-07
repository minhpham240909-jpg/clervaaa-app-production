import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import AIService from '@/lib/ai';

const quizRequestSchema = z.object({
  content: z.string().min(10).max(10000),
  questionCount: z.number().min(1).max(15).optional(),
  questionTypes: z.array(z.enum(['multiple-choice', 'true-false', 'short-answer'])).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export async function POST(request: NextRequest) {

  let body: any = {};
  
  try {

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {

      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    body = await request.json();

    const { content, questionCount, questionTypes, difficulty } = quizRequestSchema.parse(body);

    const questions = await AIService.generateQuiz({
      content,
      questionCount,
      questionTypes,
      difficulty,
    });
    
    console.log('📋 Quiz generation result:', {
      questionsGenerated: questions.length,
      questionTypes: questions.map(q => q.type),
      success: questions.length > 0
    });

    const response = {
      questions,
      metadata: {
        originalLength: content.length,
        questionCount: questions.length,
        difficulty: difficulty || 'medium',
        types: questionTypes || ['multiple-choice', 'true-false'],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Quiz API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
      content: body?.content ? `${body.content.slice(0, 100)}...` : 'No content',
      questionCount: body?.questionCount,
      difficulty: body?.difficulty
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}