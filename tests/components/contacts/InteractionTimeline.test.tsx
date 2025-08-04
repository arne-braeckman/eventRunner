import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InteractionTimeline, InteractionStats, type TimelineInteraction } from '../../../src/components/features/contacts/InteractionTimeline';
import type { InteractionType, SocialPlatform } from '../../../src/lib/types/contact';

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((date: Date) => `${Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))} days ago`),
  format: vi.fn((date: Date) => date.toISOString()),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  CalendarIcon: () => <div data-testid="calendar-icon" />,
  FilterIcon: () => <div data-testid="filter-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon" />,
  PhoneIcon: () => <div data-testid="phone-icon" />,
  MailIcon: () => <div data-testid="mail-icon" />,
  MessageSquareIcon: () => <div data-testid="message-square-icon" />,
  MousePointerClickIcon: () => <div data-testid="mouse-pointer-click-icon" />,
  UsersIcon: () => <div data-testid="users-icon" />,
  QuoteIcon: () => <div data-testid="quote-icon" />,
  MapPinIcon: () => <div data-testid="map-pin-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
  PlusIcon: () => <div data-testid="plus-icon" />,
  MoreHorizontalIcon: () => <div data-testid="more-horizontal-icon" />,
  Check: () => <div data-testid="check-icon" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronUp: () => <div data-testid="chevron-up" />,
}));

// Helper function for tests
const getInteractionWeight = (type: InteractionType): number => {
  const weights: Record<InteractionType, number> = {
    SOCIAL_FOLLOW: 1,
    SOCIAL_LIKE: 1,
    SOCIAL_COMMENT: 2,
    SOCIAL_MESSAGE: 3,
    WEBSITE_VISIT: 2,
    INFO_REQUEST: 5,
    PRICE_QUOTE: 8,
    SITE_VISIT: 10,
    EMAIL_OPEN: 1,
    EMAIL_CLICK: 2,
    PHONE_CALL: 5,
    MEETING: 8,
    OTHER: 1,
  };
  return weights[type] || 0;
};

const mockInteractions: TimelineInteraction[] = [
  {
    _id: '1',
    contactId: 'contact-1',
    type: 'PHONE_CALL' as InteractionType,
    description: 'Initial consultation call',
    metadata: { source: 'manual_entry', duration: '30min' },
    createdAt: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
    createdBy: 'user-1',
  },
  {
    _id: '2',
    contactId: 'contact-1',
    type: 'SOCIAL_FOLLOW' as InteractionType,
    platform: 'INSTAGRAM' as SocialPlatform,
    description: 'Followed company Instagram',
    metadata: { source: 'webhook', externalId: 'ig_follow_123' },
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    _id: '3',
    contactId: 'contact-1',
    type: 'WEBSITE_VISIT' as InteractionType,
    description: 'Visited pricing page',
    metadata: { source: 'analytics', page: '/pricing', duration: 45 },
    createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
  {
    _id: '4',
    contactId: 'contact-1',
    type: 'PRICE_QUOTE' as InteractionType,
    description: 'Requested quote for enterprise plan',
    metadata: { source: 'manual_entry', value: '$5000' },
    createdAt: Date.now() - (14 * 24 * 60 * 60 * 1000), // 2 weeks ago
  },
];

describe('InteractionTimeline', () => {
  it('renders timeline with interactions', () => {
    render(
      <InteractionTimeline
        interactions={mockInteractions}
        contactName="John Doe"
      />
    );

    expect(screen.getByText('Interaction Timeline')).toBeInTheDocument();
    expect(screen.getByText('Interaction history for John Doe')).toBeInTheDocument();
    
    // Check that interactions are displayed
    expect(screen.getByText('Initial consultation call')).toBeInTheDocument();
    expect(screen.getByText('Followed company Instagram')).toBeInTheDocument();
    expect(screen.getByText('Visited pricing page')).toBeInTheDocument();
    expect(screen.getByText('Requested quote for enterprise plan')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <InteractionTimeline
        interactions={[]}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading interaction history...')).toBeInTheDocument();
    // Check for loading skeleton elements by class instead of test-id
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements).toHaveLength(3);
  });

  it('shows empty state when no interactions', () => {
    render(
      <InteractionTimeline
        interactions={[]}
        isLoading={false}
      />
    );

    expect(screen.getByText('No interactions yet')).toBeInTheDocument();
    expect(screen.getByText('Interactions will appear here as they occur.')).toBeInTheDocument();
  });

  it('displays interaction types with correct badges', () => {
    render(
      <InteractionTimeline
        interactions={mockInteractions}
      />
    );

    expect(screen.getByText('Phone Call')).toBeInTheDocument();
    expect(screen.getByText('Social Follow')).toBeInTheDocument();
    expect(screen.getByText('Website Visit')).toBeInTheDocument();
    expect(screen.getByText('Price Quote')).toBeInTheDocument();
  });

  it('displays platforms for social interactions', () => {
    render(
      <InteractionTimeline
        interactions={mockInteractions}
      />
    );

    expect(screen.getByText('Instagram')).toBeInTheDocument();
  });

  it('shows heat score points for each interaction', () => {
    render(
      <InteractionTimeline
        interactions={mockInteractions}
      />
    );

    // Phone call = 5 points, Social follow = 1 point, Website visit = 2 points, Price quote = 8 points
    expect(screen.getByText('+5 pts')).toBeInTheDocument(); // Phone call
    expect(screen.getByText('+1 pts')).toBeInTheDocument(); // Social follow
    expect(screen.getByText('+2 pts')).toBeInTheDocument(); // Website visit
    expect(screen.getByText('+8 pts')).toBeInTheDocument(); // Price quote
  });

  it('shows filter button when showFilters is true', () => {
    render(
      <InteractionTimeline
        interactions={mockInteractions}
        showFilters={true}
      />
    );

    const filterButton = screen.getByRole('button', { name: /filter/i });
    expect(filterButton).toBeInTheDocument();
  });

  it('renders all interaction types correctly', () => {
    render(
      <InteractionTimeline
        interactions={mockInteractions}
      />
    );

    // All interactions should be visible by default
    expect(screen.getByText('Initial consultation call')).toBeInTheDocument();
    expect(screen.getByText('Followed company Instagram')).toBeInTheDocument();
    expect(screen.getByText('Visited pricing page')).toBeInTheDocument();
    expect(screen.getByText('Requested quote for enterprise plan')).toBeInTheDocument();
  });

  it('shows load more button when hasMore is true', () => {
    const mockLoadMore = vi.fn();
    render(
      <InteractionTimeline
        interactions={mockInteractions}
        hasMore={true}
        onLoadMore={mockLoadMore}
      />
    );

    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    expect(loadMoreButton).toBeInTheDocument();

    fireEvent.click(loadMoreButton);
    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('displays interaction metadata', () => {
    render(
      <InteractionTimeline
        interactions={mockInteractions}
      />
    );

    // Check that metadata sources are displayed (there are multiple with same source)
    expect(screen.getAllByText('Source: manual_entry')).toHaveLength(2);
    expect(screen.getByText('Source: webhook')).toBeInTheDocument();
    expect(screen.getByText('Source: analytics')).toBeInTheDocument();
  });
});

describe('InteractionStats', () => {
  it('displays correct statistics', () => {
    render(
      <InteractionStats interactions={mockInteractions} />
    );

    // Check by finding the specific container
    const totalContainer = screen.getByText('Total Interactions').closest('div');
    expect(totalContainer).toContainHTML('4');

    const heatScoreContainer = screen.getByText('Heat Score Points').closest('div');
    expect(heatScoreContainer).toContainHTML('16');

    // Time-based stats
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
  });

  it('handles empty interactions', () => {
    render(
      <InteractionStats interactions={[]} />
    );

    // Check for all the zeros with specific containers
    const container = screen.getByText('Total Interactions').closest('div');
    expect(container).toContainHTML('0');
  });

  it('calculates weekly and monthly stats correctly', () => {
    const now = Date.now();
    const recentInteractions: TimelineInteraction[] = [
      {
        _id: '1',
        contactId: 'contact-1',
        type: 'PHONE_CALL' as InteractionType,
        description: 'Recent call',
        metadata: {},
        createdAt: now - (2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        _id: '2',
        contactId: 'contact-1',
        type: 'EMAIL_CLICK' as InteractionType,
        description: 'Email click this week',
        metadata: {},
        createdAt: now - (5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        _id: '3',
        contactId: 'contact-1',
        type: 'WEBSITE_VISIT' as InteractionType,
        description: 'Old visit',
        metadata: {},
        createdAt: now - (45 * 24 * 60 * 60 * 1000), // 45 days ago
      },
    ];

    render(
      <InteractionStats interactions={recentInteractions} />
    );

    // Check by finding the specific containers
    const totalContainer = screen.getByText('Total Interactions').closest('div');
    expect(totalContainer).toContainHTML('3');

    const weekContainer = screen.getByText('This Week').closest('div');
    expect(weekContainer).toContainHTML('2');

    const monthContainer = screen.getByText('This Month').closest('div');
    expect(monthContainer).toContainHTML('2');
  });
});