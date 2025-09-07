'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
}

const DashboardErrorFallback = () => (
  <div className="flex flex-col items-center justify-center h-96 p-6 bg-red-50 rounded-lg border border-red-200">
    <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
      <AlertTriangle className="h-8 w-8 text-red-600" />
    </div>
    <h3 className="text-lg font-semibold text-red-900 mb-2">Dashboard Error</h3>
    <p className="text-red-700 text-center mb-6 max-w-md">
      We couldn't load your dashboard data. This might be a temporary issue with our servers.
    </p>
    <div className="flex space-x-3">
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Dashboard
      </button>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
      >
        Go Back
      </button>
    </div>
  </div>
);

export function DashboardErrorBoundary({ children }: DashboardErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={<DashboardErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}