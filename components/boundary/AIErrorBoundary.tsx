'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Brain, RefreshCw, Wifi } from 'lucide-react';

interface AIErrorBoundaryProps {
  children: React.ReactNode;
}

const AIErrorFallback = () => (
  <div className="flex flex-col items-center justify-center h-64 p-6 bg-blue-50 rounded-lg border border-blue-200">
    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
      <Brain className="h-8 w-8 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold text-blue-900 mb-2">AI Service Unavailable</h3>
    <p className="text-blue-700 text-center mb-6 max-w-md">
      Our AI services are temporarily unavailable. Please try again in a moment or check your connection.
    </p>
    <div className="flex space-x-3">
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry AI Service
      </button>
      <button
        onClick={() => navigator.onLine ? location.reload() : alert('Please check your internet connection')}
        className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
      >
        <Wifi className="h-4 w-4 mr-2" />
        Check Connection
      </button>
    </div>
  </div>
);

export function AIErrorBoundary({ children }: AIErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={<AIErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}