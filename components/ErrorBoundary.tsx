'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    logger.error('Error boundary caught an error:', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
                <code className="text-xs text-red-700 whitespace-pre-wrap">
                  {this.state.error.message}
                </code>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium text-red-800">
                      Component Stack
                    </summary>
                    <code className="text-xs text-red-700 whitespace-pre-wrap mt-1 block">
                      {this.state.errorInfo.componentStack}
                    </code>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specialized error boundaries for different contexts
export const APIErrorBoundary: React.FC<Props> = ({ children, onError }) => (
  <ErrorBoundary
    onError={onError}
    fallback={
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 font-medium">Failed to load data</span>
        </div>
        <p className="text-red-600 text-sm mt-1">
          Please refresh the page or try again later.
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<Props> = ({ children, onError }) => (
  <ErrorBoundary
    onError={onError}
    fallback={
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
          <span className="text-yellow-700 font-medium">Component Error</span>
        </div>
        <p className="text-yellow-600 text-sm mt-1">
          This component failed to render properly.
        </p>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    logger.error('Error caught by useErrorHandler:', error, errorInfo);
  };
}

export default ErrorBoundary;
