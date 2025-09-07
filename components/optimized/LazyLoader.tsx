'use client';

import React, { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Lazy loading wrapper component for better performance
interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyLoader({ children, fallback }: LazyLoaderProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  );
}

// AI components will be reimplemented with new features
// LazyAIChatbot and LazyStudyPlanGenerator temporarily removed

export const LazyProgressDashboard = lazy(() =>
  import('@/components/analytics/ProgressDashboard').then(module => ({ default: module.default }))
);

export const LazyPartnerMatching = lazy(() =>
  import('@/components/partners/PartnerMatching').then(module => ({ default: module.default }))
);

export const LazyChatInterface = lazy(() =>
  import('@/components/chat/ChatInterface').then(module => ({ default: module.default }))
);

export const LazyStudyCalendar = lazy(() =>
  import('@/components/calendar/StudyCalendar').then(module => ({ default: module.default }))
);

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyLoader fallback={fallback}>
        <Component {...props} />
      </LazyLoader>
    );
  };
}

// Pre-load components on interaction
export function preloadComponent(componentImport: () => Promise<any>) {
  if (typeof window !== 'undefined') {
    // Only preload in browser
    const timer = setTimeout(() => {
      componentImport().catch(() => {
        // Fail silently - component will load when actually needed
      });
    }, 2000); // Preload after 2 seconds

    return () => clearTimeout(timer);
  }
  return () => {};
}

// Usage example:
// const cleanupPreload = preloadComponent(() => import('@/components/some-component'));