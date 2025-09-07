import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PartnerMatching from '@/components/partners/PartnerMatching';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock fetch
global.fetch = jest.fn();

const mockMatch = {
  user: {
    id: 'user-123',
    name: 'John Doe',
    image: 'https://example.com/avatar.jpg',
    bio: 'Computer Science student passionate about learning',
    university: 'MIT',
    major: 'Computer Science',
    year: 'Junior',
    studyLevel: 'INTERMEDIATE',
    learningStyle: 'visual',
    totalPoints: 1250,
    currentStreak: 7,
  },
  compatibilityScore: 85,
  reasons: [
    'Shared interest in Computer Science',
    'Similar study level',
    'Compatible learning styles',
  ],
  sharedInterests: ['JavaScript', 'React', 'Algorithms'],
  complementarySkills: ['Frontend Development', 'Data Structures'],
  subjects: [
    {
      name: 'Computer Science',
      skillLevel: 'INTERMEDIATE',
      category: 'Technology',
    },
    {
      name: 'Mathematics',
      skillLevel: 'ADVANCED',
      category: 'Science',
    },
  ],
  stats: {
    totalPartnerships: 5,
    reviewCount: 12,
    recentActivity: 8,
  },
  aiEnhanced: true,
};

const mockApiResponse = {
  matches: [mockMatch],
  metadata: {
    totalCandidates: 10,
    returnedMatches: 1,
    aiScoringEnabled: true,
    preferences: null,
    generatedAt: new Date().toISOString(),
  },
};

const mockFiltersResponse = {
  filters: {
    subjects: ['Computer Science', 'Mathematics', 'Physics'],
    studyLevels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    learningStyles: ['visual', 'auditory', 'kinesthetic', 'reading'],
    sessionTypes: ['virtual', 'in_person', 'hybrid'],
  },
};

describe('PartnerMatching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch to return appropriate responses based on request method
    (fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (options?.method === 'POST') {
        // POST request for fetching matches
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponse),
        });
      } else {
        // GET request for fetching filter options
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFiltersResponse),
        });
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    render(<PartnerMatching />);
    
    expect(screen.getByText('Finding your perfect study partners...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('renders partner match card after loading', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Computer Science • Junior')).toBeInTheDocument();
      expect(screen.getByText('MIT')).toBeInTheDocument();
      expect(screen.getByText('85% Match')).toBeInTheDocument();
    });
  });

  it('displays user bio', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('"Computer Science student passionate about learning"')).toBeInTheDocument();
    });
  });

  it('displays user stats correctly', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('1250')).toBeInTheDocument(); // Points
      expect(screen.getByText('7')).toBeInTheDocument();    // Streak
      expect(screen.getByText('5')).toBeInTheDocument();    // Partners
    });
  });

  it('displays study information', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('Study Level: INTERMEDIATE')).toBeInTheDocument();
      expect(screen.getByText('Learning Style: visual')).toBeInTheDocument();
    });
  });

  it('displays subjects with skill levels', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('Computer Science (INTERMEDIATE)')).toBeInTheDocument();
      expect(screen.getByText('Mathematics (ADVANCED)')).toBeInTheDocument();
    });
  });

  it('displays shared interests', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Algorithms')).toBeInTheDocument();
    });
  });

  it('displays compatibility reasons', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('Shared interest in Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Similar study level')).toBeInTheDocument();
      expect(screen.getByText('Compatible learning styles')).toBeInTheDocument();
    });
  });

  it('shows AI enhancement indicator', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      // AI enhancement is indicated by the Sparkles icon next to compatibility score
      const compatibilityDiv = screen.getByText('85% Match').closest('div');
      expect(compatibilityDiv?.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('handles like (connect) action', async () => {
    const user = userEvent.setup();
    
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFiltersResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });
    
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('Connect')).toBeInTheDocument();
    });
    
    const connectButton = screen.getByText('Connect');
    await user.click(connectButton);
    
    expect(fetch).toHaveBeenCalledWith('/api/partners/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiverId: 'user-123',
        message: "Hi! I'd love to be study partners. We have a 85% compatibility score!",
      }),
    });
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Study partner request sent to John Doe!');
    });
  });

  it('handles pass action', async () => {
    const user = userEvent.setup();
    
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('Pass')).toBeInTheDocument();
    });
    
    const passButton = screen.getByText('Pass');
    await user.click(passButton);
    
    // Should move to next match (or fetch more if needed)
    await waitFor(() => {
      expect(screen.getByText('Finding your perfect study partners...')).toBeInTheDocument();
    });
  });

  it('handles connection request errors', async () => {
    const user = userEvent.setup();
    
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFiltersResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      })
      .mockRejectedValueOnce(new Error('Request failed'));
    
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('Connect')).toBeInTheDocument();
    });
    
    const connectButton = screen.getByText('Connect');
    await user.click(connectButton);
    
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Failed to send partner request', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith('Failed to send partner request');
    });
  });

  it('displays filter button', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument(); // Filter button
    });
  });

  it('opens filter modal when filter button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<PartnerMatching />);
    
    await waitFor(() => {
      // Find the filter button (should be in header)
      const filterButton = document.querySelector('button[title="Filter"]') || 
                          document.querySelector('.p-2.text-gray-600');
      expect(filterButton).toBeInTheDocument();
    });
    
    // Click the filter button
    const filterButton = document.querySelector('.p-2.text-gray-600') as HTMLElement;
    await user.click(filterButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Filter Partners')).toBeInTheDocument();
      expect(screen.getByText('Study Level')).toBeInTheDocument();
      expect(screen.getByText('Learning Style')).toBeInTheDocument();
    });
  });

  it('handles filter selections', async () => {
    const user = userEvent.setup();
    
    render(<PartnerMatching />);
    
    // Open filter modal
    await waitFor(() => {
      const filterButton = document.querySelector('.p-2.text-gray-600') as HTMLElement;
      expect(filterButton).toBeInTheDocument();
    });
    
    const filterButton = document.querySelector('.p-2.text-gray-600') as HTMLElement;
    await user.click(filterButton!);
    
    await waitFor(() => {
      expect(screen.getByText('INTERMEDIATE')).toBeInTheDocument();
    });
    
    // Select a filter
    const intermediateCheckbox = screen.getByLabelText('INTERMEDIATE');
    await user.click(intermediateCheckbox);
    
    expect(intermediateCheckbox).toBeChecked();
  });

  it('applies filters when Apply Filters button is clicked', async () => {
    const user = userEvent.setup();
    
    // Mock additional fetch for filtered results
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFiltersResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });
    
    render(<PartnerMatching />);
    
    // Open filter modal
    await waitFor(() => {
      const filterButton = document.querySelector('.p-2.text-gray-600') as HTMLElement;
      expect(filterButton).toBeInTheDocument();
    });
    
    const filterButton = document.querySelector('.p-2.text-gray-600') as HTMLElement;
    await user.click(filterButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    });
    
    const applyButton = screen.getByText('Apply Filters');
    await user.click(applyButton);
    
    // Should close modal and fetch new matches
    await waitFor(() => {
      expect(screen.queryByText('Filter Partners')).not.toBeInTheDocument();
    });
  });

  it('clears filters when Clear All button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<PartnerMatching />);
    
    // Open filter modal
    await waitFor(() => {
      const filterButton = document.querySelector('.p-2.text-gray-600') as HTMLElement;
      expect(filterButton).toBeInTheDocument();
    });
    
    const filterButton = document.querySelector('.p-2.text-gray-600') as HTMLElement;
    await user.click(filterButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
    
    // Select a filter first
    const intermediateCheckbox = screen.getByLabelText('INTERMEDIATE');
    await user.click(intermediateCheckbox);
    expect(intermediateCheckbox).toBeChecked();
    
    // Clear all filters
    const clearButton = screen.getByText('Clear All');
    await user.click(clearButton);
    
    expect(intermediateCheckbox).not.toBeChecked();
  });

  it('shows no matches state when no matches available', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFiltersResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ matches: [] }),
      });
    
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('No more matches')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or check back later!')).toBeInTheDocument();
      expect(screen.getByText('Reset and Find More')).toBeInTheDocument();
    });
  });

  it('handles reset and find more action', async () => {
    const user = userEvent.setup();
    
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFiltersResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ matches: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });
    
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('Reset and Find More')).toBeInTheDocument();
    });
    
    const resetButton = screen.getByText('Reset and Find More');
    await user.click(resetButton);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('displays progress indicator', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('1 of 1 matches')).toBeInTheDocument();
    });
  });

  it('shows correct compatibility score colors', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      const scoreElement = screen.getByText('85% Match');
      expect(scoreElement.closest('div')).toHaveClass('text-green-600', 'bg-green-100');
    });
  });

  it('handles fetch errors gracefully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFiltersResponse),
      })
      .mockRejectedValueOnce(new Error('Fetch failed'));
    
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Failed to fetch matches', expect.any(Error));
      expect(toast.error).toHaveBeenCalledWith('Failed to load partner matches');
    });
  });

  it('displays user avatar or fallback', async () => {
    render(<PartnerMatching />);
    
    await waitFor(() => {
      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  it('truncates subject list when there are many subjects', async () => {
    const manySubjectsMatch = {
      ...mockMatch,
      subjects: [
        { name: 'Subject 1', skillLevel: 'BEGINNER', category: 'Cat1' },
        { name: 'Subject 2', skillLevel: 'INTERMEDIATE', category: 'Cat2' },
        { name: 'Subject 3', skillLevel: 'ADVANCED', category: 'Cat3' },
        { name: 'Subject 4', skillLevel: 'EXPERT', category: 'Cat4' },
        { name: 'Subject 5', skillLevel: 'BEGINNER', category: 'Cat5' },
        { name: 'Subject 6', skillLevel: 'INTERMEDIATE', category: 'Cat6' },
        { name: 'Subject 7', skillLevel: 'ADVANCED', category: 'Cat7' },
      ],
    };
    
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFiltersResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          matches: [manySubjectsMatch],
          metadata: mockApiResponse.metadata,
        }),
      });
    
    render(<PartnerMatching />);
    
    await waitFor(() => {
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });
  });

  it('closes filter modal when X button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<PartnerMatching />);
    
    // Open filter modal
    await waitFor(() => {
      const filterButton = document.querySelector('.p-2.text-gray-600') as HTMLElement;
      expect(filterButton).toBeInTheDocument();
    });
    
    const filterButton = document.querySelector('.p-2.text-gray-600') as HTMLElement;
    await user.click(filterButton!);
    
    await waitFor(() => {
      expect(screen.getByText('Filter Partners')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByRole('button', { name: 'Close filter modal' });
    await user.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Filter Partners')).not.toBeInTheDocument();
    });
  });
});