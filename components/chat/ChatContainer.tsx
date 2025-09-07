'use client';

import { useState } from 'react';
import SmartChatWindow from './SmartChatWindow';
import CallInterface from './CallInterface';
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';

interface Call {
  id: string;
  type: 'AUDIO' | 'VIDEO';
  chatRoomId: string;
  participants: any[];
}

interface ChatContainerProps {
  chatId: string;
  userId: string;
}

export default function ChatContainer({ chatId, userId }: ChatContainerProps) {
  const [activeCall, setActiveCall] = useState<Call | null>(null);

  const handleStartCall = (call: Call) => {
    logger.info('Starting call in ChatContainer', { 
      callId: call.id, 
      type: call.type, 
      chatId: call.chatRoomId 
    });
    setActiveCall(call);
  };

  const handleEndCall = () => {
    logger.info('Ending call in ChatContainer', { 
      callId: activeCall?.id 
    });
    setActiveCall(null);
  };

  const handleCallError = (error: Error) => {
    logger.error('Call error in ChatContainer', error, {
      callId: activeCall?.id,
      chatId
    });
    // Optionally show an error message to the user
    // For now, just end the call on error
    setActiveCall(null);
  };

  return (
    <ComponentErrorBoundary>
      {activeCall ? (
        <CallInterface 
          call={activeCall}
          userId={userId}
          onEndCall={handleEndCall}
          onError={handleCallError}
        />
      ) : (
        <SmartChatWindow
          chatId={chatId}
          userId={userId}
          partnerId="2" // Default partner ID - in real app this would come from chat data
          onStartCall={handleStartCall}
        />
      )}
    </ComponentErrorBoundary>
  );
}