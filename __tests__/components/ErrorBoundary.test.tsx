import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, APIErrorBoundary, ComponentErrorBoundary, withErrorBoundary } from '@/components/ErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child throws an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText("We're sorry, but something unexpected happened. Please try refreshing the page.")).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('has refresh button that reloads the page', () => {
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByText('Refresh Page');
    fireEvent.click(refreshButton);

    expect(reloadMock).toHaveBeenCalled();
  });

  it('renders error icon', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // The error icon is an SVG, not an img element
    const errorIcon = document.querySelector('svg');
    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon).toHaveClass('w-6', 'h-6', 'text-red-600');
  });

  it('applies correct styling classes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Find the main container div
    const container = document.querySelector('.min-h-screen');
    expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-gray-50');
  });

  it('handles multiple errors gracefully', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('logs errors to console', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('APIErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders API-specific error message', () => {
    render(
      <APIErrorBoundary>
        <ThrowError shouldThrow={true} />
      </APIErrorBoundary>
    );

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    expect(screen.getByText('Please refresh the page or try again later.')).toBeInTheDocument();
  });
});

describe('ComponentErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders component-specific error message', () => {
    render(
      <ComponentErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    );

    expect(screen.getByText('Component Error')).toBeInTheDocument();
    expect(screen.getByText('This component failed to render properly.')).toBeInTheDocument();
  });
});

describe('withErrorBoundary HOC', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('wraps component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
  });

  it('sets correct display name', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
});

describe('useErrorHandler hook', () => {
  it('should be exported', () => {
    const { useErrorHandler } = require('@/components/ErrorBoundary');
    expect(useErrorHandler).toBeDefined();
    expect(typeof useErrorHandler).toBe('function');
  });
});
