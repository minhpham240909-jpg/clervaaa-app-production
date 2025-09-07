'use client';

import React from 'react';
import { Loader2, BookOpen, Users, MessageSquare, Calendar, BarChart } from 'lucide-react';

interface LoadingStateProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  type?: 'default' | 'page' | 'card' | 'inline' | 'overlay';
  context?: 'dashboard' | 'chat' | 'calendar' | 'analytics' | 'matching' | 'default';
  showText?: boolean;
}

const contextIcons = {
  dashboard: BookOpen,
  chat: MessageSquare,
  calendar: Calendar,
  analytics: BarChart,
  matching: Users,
  default: Loader2,
};

const contextMessages = {
  dashboard: 'Loading your dashboard...',
  chat: 'Loading messages...',
  calendar: 'Loading calendar...',
  analytics: 'Analyzing your progress...',
  matching: 'Finding study partners...',
  default: 'Loading...',
};

export const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' | 'large'; className?: string }> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'medium',
  text,
  type = 'default',
  context = 'default',
  showText = true,
}) => {
  const Icon = contextIcons[context];
  const defaultText = text || contextMessages[context];

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  if (type === 'overlay') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <Icon className={`${sizeClasses[size]} animate-spin text-blue-500`} />
            {showText && (
              <span className={`${textSizeClasses[size]} font-medium text-gray-900`}>
                {defaultText}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon className={`${sizeClasses.large} animate-spin text-blue-500 mx-auto mb-4`} />
          {showText && (
            <p className={`${textSizeClasses.large} font-medium text-gray-900 mb-2`}>
              {defaultText}
            </p>
          )}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <Icon className={`${sizeClasses[size]} animate-spin text-blue-500 mx-auto mb-2`} />
            {showText && (
              <p className={`${textSizeClasses[size]} text-gray-600`}>
                {defaultText}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'inline') {
    return (
      <div className="flex items-center space-x-2">
        <Icon className={`${sizeClasses[size]} animate-spin text-blue-500`} />
        {showText && (
          <span className={`${textSizeClasses[size]} text-gray-600`}>
            {defaultText}
          </span>
        )}
      </div>
    );
  }

  // Default type
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <Icon className={`${sizeClasses[size]} animate-spin text-blue-500 mx-auto mb-2`} />
        {showText && (
          <p className={`${textSizeClasses[size]} text-gray-600`}>
            {defaultText}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton loading components for specific UI elements
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`bg-gray-200 rounded ${
          i === lines - 1 && lines > 1 ? 'h-4 w-3/4 mt-2' : 'h-4 w-full mt-2'
        } ${i === 0 ? 'mt-0' : ''}`}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-4/6" />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Loading button component
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}> = ({ 
  loading, 
  children, 
  disabled = false, 
  className = '', 
  onClick,
  type = 'button'
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {loading && <LoadingSpinner size="small" className="mr-2" />}
    {children}
  </button>
);

// Hook for managing loading states
export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);
  
  const startLoading = React.useCallback(() => setLoading(true), []);
  const stopLoading = React.useCallback(() => setLoading(false), []);
  
  const withLoading = React.useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
  };
};

export default LoadingState;