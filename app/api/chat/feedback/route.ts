import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const feedbackSchema = z.object({
  messageId: z.string(),
  helpful: z.boolean(),
  feedback: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { messageId, helpful, feedback } = feedbackSchema.parse(body);

    // Update the chatbot message with feedback
    const updatedMessage = await prisma.chatbotMessage.update({
      where: {
        id: messageId,
        userId: user.id, // Ensure user can only update their own messages
      },
      data: {
        rating: helpful ? 5 : 1,
        // You could add a feedback field to the schema if needed
      },
    });

    // If feedback is provided and the response was not helpful,
    // we could log this for model improvement
    if (!helpful && feedback) {
      logger.info('Negative feedback received for chatbot response', {
        messageId,
        feedback,
        userId: user.id,
        originalMessage: updatedMessage.message,
        originalResponse: updatedMessage.response,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
    });

  } catch (error) {
    logger.error('Chat feedback API error', error, {
      userId: session?.user?.email,
      endpoint: '/api/chat/feedback'
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}