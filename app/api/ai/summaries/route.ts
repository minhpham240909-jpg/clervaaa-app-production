import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import AIService from '@/lib/ai';

const summaryRequestSchema = z.object({
  content: z.string().min(10).max(10000),
  maxLength: z.number().min(50).max(500).optional(),
  style: z.enum(['bullet', 'paragraph', 'outline']).optional(),
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
    const { content, maxLength, style } = summaryRequestSchema.parse(body);

    const summary = await AIService.generateSummary({
      content,
      maxLength,
      style,
    });

    return NextResponse.json({
      summary,
      metadata: {
        originalLength: content.length,
        summaryLength: summary.length,
        style: style || 'paragraph',
      },
    });
  } catch (error) {
    console.error('Summaries API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}