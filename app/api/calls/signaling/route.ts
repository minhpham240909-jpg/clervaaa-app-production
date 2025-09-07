import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// WebRTC signaling message schema
const signalingSchema = z.object({
  callId: z.string(),
  type: z.enum(['offer', 'answer', 'ice-candidate', 'join', 'leave']),
  data: z.any().optional(),
  targetUserId: z.string().optional()
});

interface SignalingMessage {
  callId: string
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave'
  data?: any
  targetUserId?: string
  fromUserId: string
  timestamp: string
}

// In-memory store for active calls (in production, use Redis)
const activeCalls = new Map<string, {
  participants: Set<string>
  messages: SignalingMessage[]
  createdAt: Date
}>()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { callId, type, data, targetUserId } = signalingSchema.parse(body);

    const signalingMessage: SignalingMessage = {
      callId,
      type,
      data,
      targetUserId,
      fromUserId: currentUser.id,
      timestamp: new Date().toISOString()
    };

    // Handle different signaling message types
    switch (type) {
      case 'join':
        await handleJoinCall(callId, currentUser.id, signalingMessage);
        break;
      
      case 'leave':
        await handleLeaveCall(callId, currentUser.id);
        break;
      
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        await handleSignalingMessage(callId, signalingMessage);
        break;
    }

    // Store the call in database for persistence
    await storeCallEvent(callId, currentUser.id, type, data);

    return NextResponse.json({
      success: true,
      message: 'Signaling message processed',
      callId,
      type
    });

  } catch (error) {
    logger.error('Signaling error:', error as Error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid signaling message format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process signaling message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    const since = searchParams.get('since');

    if (!callId) {
      return NextResponse.json({ error: 'Call ID required' }, { status: 400 });
    }

    // Get signaling messages for the call
    const callData = activeCalls.get(callId);
    if (!callData) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    let messages = callData.messages;
    
    // Filter messages since timestamp if provided
    if (since) {
      const sinceDate = new Date(since);
      messages = messages.filter(msg => new Date(msg.timestamp) > sinceDate);
    }

    return NextResponse.json({
      callId,
      participants: Array.from(callData.participants),
      messages,
      totalMessages: callData.messages.length
    });

  } catch (error) {
    logger.error('Get signaling messages error:', error as Error);
    return NextResponse.json(
      { error: 'Failed to get signaling messages' },
      { status: 500 }
    );
  }
}

/**
 * Handle user joining a call
 */
async function handleJoinCall(
  callId: string, 
  userId: string, 
  message: SignalingMessage
): Promise<void> {
  let callData = activeCalls.get(callId);
  
  if (!callData) {
    callData = {
      participants: new Set(),
      messages: [],
      createdAt: new Date()
    };
    activeCalls.set(callId, callData);
  }

  callData.participants.add(userId);
  callData.messages.push(message);

  logger.info('User joined call', { callId, userId, participantCount: callData.participants.size });

  // Notify other participants
  await notifyParticipants(callId, message, userId);
}

/**
 * Handle user leaving a call
 */
async function handleLeaveCall(callId: string, userId: string): Promise<void> {
  const callData = activeCalls.get(callId);
  if (!callData) return;

  callData.participants.delete(userId);
  
  const leaveMessage: SignalingMessage = {
    callId,
    type: 'leave',
    fromUserId: userId,
    timestamp: new Date().toISOString()
  };
  
  callData.messages.push(leaveMessage);

  logger.info('User left call', { callId, userId, participantCount: callData.participants.size });

  // Clean up empty calls
  if (callData.participants.size === 0) {
    activeCalls.delete(callId);
    logger.info('Call cleaned up', { callId });
  } else {
    // Notify remaining participants
    await notifyParticipants(callId, leaveMessage, userId);
  }
}

/**
 * Handle WebRTC signaling messages (offer, answer, ICE candidates)
 */
async function handleSignalingMessage(
  callId: string, 
  message: SignalingMessage
): Promise<void> {
  const callData = activeCalls.get(callId);
  if (!callData) {
    throw new Error('Call not found');
  }

  callData.messages.push(message);

  logger.info('Signaling message processed', { 
    callId, 
    type: message.type, 
    fromUserId: message.fromUserId,
    targetUserId: message.targetUserId 
  });

  // Forward message to target user or all participants
  await notifyParticipants(callId, message, message.fromUserId);
}

/**
 * Notify other participants about signaling messages
 * In production, this would use WebSockets or Server-Sent Events
 */
async function notifyParticipants(
  callId: string, 
  message: SignalingMessage, 
  excludeUserId: string
): Promise<void> {
  const callData = activeCalls.get(callId);
  if (!callData) return;

  const targetParticipants = Array.from(callData.participants).filter(
    participantId => participantId !== excludeUserId
  );

  // In a real implementation, you would send this via WebSocket
  // For now, we just log it
  logger.info('Notifying participants', { 
    callId, 
    messageType: message.type, 
    targetParticipants: targetParticipants.length 
  });

  // Here you would typically:
  // 1. Use WebSocket connections to send real-time messages
  // 2. Or use Server-Sent Events
  // 3. Or use a message queue like Redis pub/sub
}

/**
 * Store call events in database for analytics and debugging
 */
async function storeCallEvent(
  callId: string, 
  userId: string, 
  eventType: string, 
  eventData?: any
): Promise<void> {
  try {
    // In a real implementation, store call events for analytics
    logger.info('Call event stored', { 
      callId, 
      userId, 
      eventType, 
      hasData: !!eventData 
    });
  } catch (error) {
    logger.error('Failed to store call event', error as Error, { callId, userId, eventType });
  }
}

/**
 * Cleanup old calls (should be run periodically)
 */
function cleanupOldCalls(): void {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  activeCalls.forEach((callData, callId) => {
    if (now.getTime() - callData.createdAt.getTime() > maxAge) {
      activeCalls.delete(callId);
      logger.info('Old call cleaned up', { callId });
    }
  });
}

// Clean up old calls every hour
setInterval(cleanupOldCalls, 60 * 60 * 1000);
