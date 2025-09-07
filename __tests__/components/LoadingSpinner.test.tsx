import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('img', { name: 'Loading spinner' });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByRole('img', { name: 'Loading spinner' });
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="primary" />);
    
    const spinner = screen.getByRole('img', { name: 'Loading spinner' });
    expect(spinner).toHaveClass('text-blue-600');
  });

  it('renders with custom text', () => {
    const customText = 'Loading your study session...';
    render(<LoadingSpinner text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('renders without text when text is not provided', () => {
    render(<LoadingSpinner />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = screen.getByRole('img', { name: 'Loading spinner' }).parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('renders with all size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    
    sizes.forEach(size => {
      const { unmount } = render(<LoadingSpinner size={size} />);
      const spinner = screen.getByRole('img', { name: 'Loading spinner' });
      
      switch (size) {
        case 'sm':
          expect(spinner).toHaveClass('w-4', 'h-4');
          break;
        case 'md':
          expect(spinner).toHaveClass('w-6', 'h-6');
          break;
        case 'lg':
          expect(spinner).toHaveClass('w-8', 'h-8');
          break;
        case 'xl':
          expect(spinner).toHaveClass('w-12', 'h-12');
          break;
      }
      
      unmount();
    });
  });

  it('renders with all color variants', () => {
    const colors = ['primary', 'secondary', 'gray', 'white'] as const;
    
    colors.forEach(color => {
      const { unmount } = render(<LoadingSpinner color={color} />);
      const spinner = screen.getByRole('img', { name: 'Loading spinner' });
      
      switch (color) {
        case 'primary':
          expect(spinner).toHaveClass('text-blue-600');
          break;
        case 'secondary':
          expect(spinner).toHaveClass('text-yellow-600');
          break;
        case 'gray':
          expect(spinner).toHaveClass('text-gray-600');
          break;
        case 'white':
          expect(spinner).toHaveClass('text-white');
          break;
      }
      
      unmount();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner text="Loading content" />);
    
    const spinner = screen.getByRole('img', { name: 'Loading spinner' });
    expect(spinner).toHaveAttribute('aria-label', 'Loading spinner');
  });

  it('renders in a container with proper layout', () => {
    render(
      <div data-testid="container">
        <LoadingSpinner text="Loading..." />
      </div>
    );
    
    const container = screen.getByTestId('container');
    const spinner = screen.getByRole('img', { name: 'Loading spinner' });
    
    expect(container).toContainElement(spinner);
  });
});
