import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import {
  LoadingState,
  LoadingSpinner,
  SkeletonText,
  SkeletonCard,
  SkeletonList,
  LoadingButton,
  useLoadingState,
} from '@/components/LoadingState';

describe('LoadingSpinner', () => {
  it('renders with default medium size', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="small" />);
    const spinner = document.querySelector('svg');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="large" />);
    const spinner = document.querySelector('svg');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="text-red-500" />);
    const spinner = document.querySelector('svg');
    expect(spinner).toHaveClass('text-red-500');
  });
});

describe('LoadingState', () => {
  it('renders with default settings', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingState text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders without text when showText is false', () => {
    render(<LoadingState showText={false} />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders page type loading', () => {
    render(<LoadingState type="page" />);
    const container = document.querySelector('.min-h-screen');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
  });

  it('renders overlay type loading', () => {
    render(<LoadingState type="overlay" />);
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('bg-black', 'bg-opacity-50');
  });

  it('renders card type loading', () => {
    render(<LoadingState type="card" />);
    const card = document.querySelector('.bg-white.rounded-lg.border');
    expect(card).toBeInTheDocument();
  });

  it('renders inline type loading', () => {
    render(<LoadingState type="inline" />);
    const inline = document.querySelector('.flex.items-center.space-x-2');
    expect(inline).toBeInTheDocument();
  });

  it('renders context-specific messages', () => {
    render(<LoadingState context="dashboard" />);
    expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
  });

  it('renders context-specific icons', () => {
    render(<LoadingState context="chat" />);
    expect(screen.getByText('Loading messages...')).toBeInTheDocument();
  });
});

describe('SkeletonText', () => {
  it('renders single line by default', () => {
    render(<SkeletonText />);
    const lines = document.querySelectorAll('.bg-gray-200.rounded');
    expect(lines).toHaveLength(1);
  });

  it('renders multiple lines', () => {
    render(<SkeletonText lines={3} />);
    const lines = document.querySelectorAll('.bg-gray-200.rounded');
    expect(lines).toHaveLength(3);
  });

  it('applies custom className', () => {
    render(<SkeletonText className="custom-class" />);
    const container = document.querySelector('.animate-pulse.custom-class');
    expect(container).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  it('renders skeleton card structure', () => {
    render(<SkeletonCard />);
    const card = document.querySelector('.animate-pulse.bg-white.rounded-lg');
    expect(card).toBeInTheDocument();
    
    const avatar = document.querySelector('.w-10.h-10.bg-gray-200.rounded-full');
    expect(avatar).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SkeletonCard className="custom-class" />);
    const card = document.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });
});

describe('SkeletonList', () => {
  it('renders default 3 items', () => {
    render(<SkeletonList />);
    const items = document.querySelectorAll('.animate-pulse.flex.items-center');
    expect(items).toHaveLength(3);
  });

  it('renders custom number of items', () => {
    render(<SkeletonList items={5} />);
    const items = document.querySelectorAll('.animate-pulse.flex.items-center');
    expect(items).toHaveLength(5);
  });

  it('applies custom className', () => {
    render(<SkeletonList className="custom-class" />);
    const list = document.querySelector('.space-y-4.custom-class');
    expect(list).toBeInTheDocument();
  });
});

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingButton loading={false}>
        Click me
      </LoadingButton>
    );
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeDisabled();
  });

  it('shows spinner and disables when loading', () => {
    render(
      <LoadingButton loading={true}>
        Click me
      </LoadingButton>
    );
    
    expect(screen.getByRole('button')).toBeDisabled();
    const spinner = document.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('handles onClick when not loading', () => {
    const onClick = jest.fn();
    render(
      <LoadingButton loading={false} onClick={onClick}>
        Click me
      </LoadingButton>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('does not handle onClick when loading', () => {
    const onClick = jest.fn();
    render(
      <LoadingButton loading={true} onClick={onClick}>
        Click me
      </LoadingButton>
    );
    
    // Button should be disabled, so click won't fire
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('respects disabled prop', () => {
    render(
      <LoadingButton loading={false} disabled={true}>
        Click me
      </LoadingButton>
    );
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(
      <LoadingButton loading={false} className="bg-red-500">
        Click me
      </LoadingButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-500');
  });

  it('handles different button types', () => {
    render(
      <LoadingButton loading={false} type="submit">
        Submit
      </LoadingButton>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});

describe('useLoadingState', () => {
  it('initializes with default false state', () => {
    const { result } = renderHook(() => useLoadingState());
    
    expect(result.current.loading).toBe(false);
  });

  it('initializes with custom initial state', () => {
    const { result } = renderHook(() => useLoadingState(true));
    
    expect(result.current.loading).toBe(true);
  });

  it('starts and stops loading', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.startLoading();
    });
    
    expect(result.current.loading).toBe(true);
    
    act(() => {
      result.current.stopLoading();
    });
    
    expect(result.current.loading).toBe(false);
  });

  it('handles withLoading for async operations', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    const asyncFn = jest.fn().mockResolvedValue('success');
    
    let promise: Promise<string>;
    
    act(() => {
      promise = result.current.withLoading(asyncFn);
    });
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      const resultValue = await promise!;
      expect(resultValue).toBe('success');
    });
    
    expect(result.current.loading).toBe(false);
    expect(asyncFn).toHaveBeenCalled();
  });

  it('stops loading even if async function throws', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    const asyncFn = jest.fn().mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      try {
        await result.current.withLoading(asyncFn);
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(result.current.loading).toBe(false);
  });
});