'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MessageSquare, RefreshCw } from 'lucide-react';

interface ChatErrorBoundaryProps {
  children: React.ReactNode;
}

const ChatErrorFallback = () => (
  <div className="flex flex-col items-center justify-center h-64 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
    <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Unavailable</h3>
    <p className="text-gray-600 text-center mb-4">
      We're having trouble loading the chat. Please try refreshing or check back later.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Refresh Chat
    </button>
  </div>
);

export function ChatErrorBoundary({ children }: ChatErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={<ChatErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}