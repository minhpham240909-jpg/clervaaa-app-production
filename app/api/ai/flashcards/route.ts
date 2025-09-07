import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import AIService from '@/lib/ai';

const flashcardRequestSchema = z.object({
  content: z.string().min(10).max(10000),
  count: z.number().min(1).max(20).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, count, difficulty } = flashcardRequestSchema.parse(body);

    const flashcards = await AIService.generateFlashcards({
      content,
      count,
      difficulty,
    });

    return NextResponse.json({
      flashcards,
      metadata: {
        originalLength: content.length,
        cardCount: flashcards.length,
        difficulty: difficulty || 'medium',
      },
    });
  } catch (error) {
    console.error('Flashcards API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}