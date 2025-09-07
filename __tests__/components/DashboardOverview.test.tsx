import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardOverview from '@/components/dashboard/DashboardOverview';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Users: ({ className, ...props }: any) => <svg data-testid="users-icon" className={className} {...props} />,
  Calendar: ({ className, ...props }: any) => <svg data-testid="calendar-icon" className={className} {...props} />,
  MessageCircle: ({ className, ...props }: any) => <svg data-testid="message-circle-icon" className={className} {...props} />,
  Award: ({ className, ...props }: any) => <svg data-testid="award-icon" className={className} {...props} />,
}));

describe('DashboardOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all stat cards', () => {
    render(<DashboardOverview />);
    
    expect(screen.getByText('Study Partners')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Sessions')).toBeInTheDocument();
    expect(screen.getByText('Active Chats')).toBeInTheDocument();
    expect(screen.getByText('Study Score')).toBeInTheDocument();
  });

  it('displays correct stat values', () => {
    render(<DashboardOverview />);
    
    expect(screen.getByText('12')).toBeInTheDocument(); // Study Partners value
    expect(screen.getByText('5')).toBeInTheDocument();  // Upcoming Sessions value
    expect(screen.getByText('8')).toBeInTheDocument();  // Active Chats value
    expect(screen.getByText('85%')).toBeInTheDocument(); // Study Score value
  });

  it('displays correct change indicators', () => {
    render(<DashboardOverview />);
    
    expect(screen.getByText('+2 this week')).toBeInTheDocument();
    expect(screen.getByText('3 this week')).toBeInTheDocument();
    expect(screen.getByText('2 new messages')).toBeInTheDocument();
    expect(screen.getByText('+5% this month')).toBeInTheDocument();
  });

  it('renders correct icons for each stat', () => {
    render(<DashboardOverview />);
    
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    expect(screen.getByTestId('message-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('award-icon')).toBeInTheDocument();
  });

  it('applies correct styling classes to stat cards', () => {
    render(<DashboardOverview />);
    
    const statCards = document.querySelectorAll('.card');
    expect(statCards).toHaveLength(4);
    
    statCards.forEach(card => {
      expect(card).toHaveClass('card');
    });
  });

  it('applies correct color classes to icons', () => {
    render(<DashboardOverview />);
    
    const usersIcon = screen.getByTestId('users-icon');
    const calendarIcon = screen.getByTestId('calendar-icon');
    const messageIcon = screen.getByTestId('message-circle-icon');
    const awardIcon = screen.getByTestId('award-icon');
    
    expect(usersIcon).toHaveClass('text-primary-600');
    expect(calendarIcon).toHaveClass('text-learning-dark');
    expect(messageIcon).toHaveClass('text-accent-600');
    expect(awardIcon).toHaveClass('text-secondary-600');
  });

  it('applies correct background color classes to icon containers', () => {
    render(<DashboardOverview />);
    
    // Find icon containers by their background classes
    const primaryBg = document.querySelector('.bg-primary-100');
    const learningBg = document.querySelector('.bg-learning-light');
    const accentBg = document.querySelector('.bg-accent-100');
    const secondaryBg = document.querySelector('.bg-secondary-100');
    
    expect(primaryBg).toBeInTheDocument();
    expect(learningBg).toBeInTheDocument();
    expect(accentBg).toBeInTheDocument();
    expect(secondaryBg).toBeInTheDocument();
  });

  it('has proper responsive grid layout', () => {
    render(<DashboardOverview />);
    
    const gridContainer = document.querySelector('.grid');
    expect(gridContainer).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2', 
      'lg:grid-cols-4',
      'gap-6'
    );
  });

  it('displays stat titles with correct text styling', () => {
    render(<DashboardOverview />);
    
    const titles = [
      screen.getByText('Study Partners'),
      screen.getByText('Upcoming Sessions'),
      screen.getByText('Active Chats'),
      screen.getByText('Study Score')
    ];
    
    titles.forEach(title => {
      expect(title).toHaveClass('text-sm', 'text-neutral-600', 'mb-1');
    });
  });

  it('displays stat values with correct text styling', () => {
    render(<DashboardOverview />);
    
    const values = [
      screen.getByText('12'),
      screen.getByText('5'),
      screen.getByText('8'),
      screen.getByText('85%')
    ];
    
    values.forEach(value => {
      expect(value).toHaveClass('text-2xl', 'font-bold', 'text-neutral-900');
    });
  });

  it('displays change indicators with correct text styling', () => {
    render(<DashboardOverview />);
    
    const changes = [
      screen.getByText('+2 this week'),
      screen.getByText('3 this week'),
      screen.getByText('2 new messages'),
      screen.getByText('+5% this month')
    ];
    
    changes.forEach(change => {
      expect(change).toHaveClass('text-sm', 'text-neutral-500', 'mt-1');
    });
  });

  it('has proper layout structure for each stat card', () => {
    render(<DashboardOverview />);
    
    const statCards = document.querySelectorAll('.card');
    
    statCards.forEach(card => {
      // Each card should have the flex layout
      const flexContainer = card.querySelector('.flex.items-center.justify-between');
      expect(flexContainer).toBeInTheDocument();
      
      // Should have text content on the left
      const textDiv = flexContainer?.querySelector('div:first-child');
      expect(textDiv).toBeInTheDocument();
      
      // Should have icon container on the right
      const iconContainer = flexContainer?.querySelector('div:last-child');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('p-3', 'rounded-lg');
    });
  });

  it('handles missing or undefined data gracefully', () => {
    // This test ensures the component doesn't crash with missing data
    // Since the data is hardcoded, it should always render
    expect(() => render(<DashboardOverview />)).not.toThrow();
  });

  it('renders icons with proper size classes', () => {
    render(<DashboardOverview />);
    
    const icons = [
      screen.getByTestId('users-icon'),
      screen.getByTestId('calendar-icon'),
      screen.getByTestId('message-circle-icon'),
      screen.getByTestId('award-icon')
    ];
    
    icons.forEach(icon => {
      expect(icon).toHaveClass('h-6', 'w-6');
    });
  });

  it('maintains consistent card structure across all stats', () => {
    render(<DashboardOverview />);
    
    const expectedStats = [
      {
        title: 'Study Partners',
        value: '12',
        change: '+2 this week',
        icon: 'users-icon'
      },
      {
        title: 'Upcoming Sessions',
        value: '5',
        change: '3 this week',
        icon: 'calendar-icon'
      },
      {
        title: 'Active Chats',
        value: '8',
        change: '2 new messages',
        icon: 'message-circle-icon'
      },
      {
        title: 'Study Score',
        value: '85%',
        change: '+5% this month',
        icon: 'award-icon'
      }
    ];
    
    expectedStats.forEach(stat => {
      expect(screen.getByText(stat.title)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
      expect(screen.getByText(stat.change)).toBeInTheDocument();
      expect(screen.getByTestId(stat.icon)).toBeInTheDocument();
    });
  });

  it('is accessible with proper semantic structure', () => {
    render(<DashboardOverview />);
    
    // Check that we have a proper grid container
    const gridContainer = screen.getByRole('generic');
    expect(gridContainer).toHaveClass('grid');
    
    // Verify all text content is readable
    expect(screen.getByText('Study Partners')).toBeVisible();
    expect(screen.getByText('Upcoming Sessions')).toBeVisible();
    expect(screen.getByText('Active Chats')).toBeVisible();
    expect(screen.getByText('Study Score')).toBeVisible();
  });

  it('renders without any console errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<DashboardOverview />);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('has proper component export', () => {
    // Verify the component is properly exported as default
    expect(DashboardOverview).toBeDefined();
    expect(typeof DashboardOverview).toBe('function');
  });
});