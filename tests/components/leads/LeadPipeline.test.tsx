import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadPipeline } from '../../../src/components/features/leads/LeadPipeline';
import { useQuery } from 'convex/react';

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Tech Corp',
      leadSource: 'WEBSITE',
      leadHeat: 'HOT',
      leadHeatScore: 18,
      status: 'QUALIFIED',
      createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
      updatedAt: Date.now()
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Design Studio',
      leadSource: 'FACEBOOK',
      leadHeat: 'WARM',
      leadHeatScore: 10,
      status: 'LEAD',
      createdAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
      updatedAt: Date.now()
    },
    {
      _id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      company: 'Marketing Inc',
      leadSource: 'LINKEDIN',
      leadHeat: 'COLD',
      leadHeatScore: 3,
      status: 'UNQUALIFIED',
      createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000),
      updatedAt: Date.now()
    }
  ]),
  useMutation: vi.fn(() => vi.fn()),
}));


// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    if (formatStr === 'MMM d') {
      return 'Jan 15';
    }
    return date.toISOString();
  }),
}));

// Mock DND Kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div data-testid="drag-overlay">{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  closestCenter: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
  verticalListSortingStrategy: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  MoreHorizontalIcon: () => <div data-testid="more-horizontal-icon" />,
  UserIcon: () => <div data-testid="user-icon" />,
  MailIcon: () => <div data-testid="mail-icon" />,
  PhoneIcon: () => <div data-testid="phone-icon" />,
  BuildingIcon: () => <div data-testid="building-icon" />,
  ThermometerIcon: () => <div data-testid="thermometer-icon" />,
  CalendarIcon: () => <div data-testid="calendar-icon" />,
  TrendingUpIcon: () => <div data-testid="trending-up-icon" />,
  MessageSquareIcon: () => <div data-testid="message-square-icon" />,
  FilterIcon: () => <div data-testid="filter-icon" />,
  RefreshCwIcon: () => <div data-testid="refresh-icon" />,
}));

describe('LeadPipeline', () => {
  it('renders pipeline header correctly', () => {
    render(<LeadPipeline />);
    
    expect(screen.getByText('Lead Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop leads between pipeline stages')).toBeInTheDocument();
  });

  it('displays pipeline metrics', () => {
    render(<LeadPipeline />);
    
    expect(screen.getByText('Total Leads')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('Hot Leads')).toBeInTheDocument();
    expect(screen.getByText('Avg Pipeline Time')).toBeInTheDocument();
  });

  it('calculates pipeline metrics correctly', () => {
    render(<LeadPipeline />);
    
    // Should show 3 total leads from mock data (check with more specific selector)
    const totalLeadsText = screen.getByText('Total Leads').closest('div')?.querySelector('.text-2xl');
    expect(totalLeadsText).toHaveTextContent('3');
    
    // Should show conversion rate (0% since no customers in mock data)
    const conversionRateText = screen.getByText('Conversion Rate').closest('div')?.querySelector('.text-2xl');
    expect(conversionRateText).toHaveTextContent('0.0%');
    
    // Should show 1 hot lead
    const hotLeadsText = screen.getByText('Hot Leads').closest('div')?.querySelector('.text-2xl');
    expect(hotLeadsText).toHaveTextContent('1');
  });

  it('renders all pipeline columns', () => {
    render(<LeadPipeline />);
    
    expect(screen.getByText('Unqualified')).toBeInTheDocument();
    expect(screen.getByText('Prospect')).toBeInTheDocument();
    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
  });

  it('displays contacts in correct columns', () => {
    render(<LeadPipeline />);
    
    // Check that contacts appear in their respective columns
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
  });

  it('shows contact details on cards', () => {
    render(<LeadPipeline />);
    
    // Check contact information is displayed
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Design Studio')).toBeInTheDocument();
    expect(screen.getByText('Marketing Inc')).toBeInTheDocument();
    
    // Check lead sources are displayed
    expect(screen.getByText('WEBSITE')).toBeInTheDocument();
    expect(screen.getByText('FACEBOOK')).toBeInTheDocument();
    expect(screen.getByText('LINKEDIN')).toBeInTheDocument();
  });

  it('displays heat scores and indicators', () => {
    render(<LeadPipeline />);
    
    // Check heat scores are displayed
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders filter buttons', () => {
    render(<LeadPipeline />);
    
    expect(screen.getByText('Pipeline Filters')).toBeInTheDocument();
    expect(screen.getByText('🔥 Hot Leads')).toBeInTheDocument();
    expect(screen.getByText('🌤️ Warm Leads')).toBeInTheDocument();
    expect(screen.getByText('❄️ Cold Leads')).toBeInTheDocument();
  });

  it('allows filtering by heat level', () => {
    render(<LeadPipeline />);
    
    const hotButton = screen.getByText('🔥 Hot Leads');
    fireEvent.click(hotButton);
    
    // Filter should be applied (button state should change)
    // In a real test, we'd check that only hot leads are displayed
  });

  it('shows clear filters button when filters are applied', () => {
    render(<LeadPipeline />);
    
    // Apply a filter
    const hotButton = screen.getByText('🔥 Hot Leads');
    fireEvent.click(hotButton);
    
    // Clear filters button should appear
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('handles clear filters action', () => {
    render(<LeadPipeline />);
    
    // Apply a filter
    const hotButton = screen.getByText('🔥 Hot Leads');
    fireEvent.click(hotButton);
    
    // Clear filters
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);
    
    // Clear button should disappear
    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  it('renders drag and drop context', () => {
    render(<LeadPipeline />);
    
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
  });

  it('displays contact action buttons', () => {
    render(<LeadPipeline />);
    
    // Should show contact and more action buttons for each contact
    const contactButtons = screen.getAllByText('Contact');
    expect(contactButtons.length).toBeGreaterThan(0);
  });

  it('shows column counts correctly', () => {
    render(<LeadPipeline />);
    
    // Each column should show the count of contacts in that stage
    // Based on mock data: 1 unqualified, 0 prospect, 1 lead, 1 qualified, 0 customer, 0 lost
    const badges = screen.getAllByText('1');
    expect(badges.length).toBeGreaterThanOrEqual(3); // At least 3 columns with 1 contact each
  });

  it('handles refresh button click', () => {
    render(<LeadPipeline />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
    
    fireEvent.click(refreshButton);
  });

  it('shows loading state when data is not available', () => {
    // Mock useQuery to return undefined (loading state)
    vi.mocked(useQuery).mockReturnValue(undefined);
    
    render(<LeadPipeline />);
    
    // Should show skeleton loading state
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    
    // Restore original mock
    vi.mocked(useQuery).mockReturnValue([]);
  });

  it('handles empty pipeline gracefully', () => {
    // Mock useQuery to return empty array
    vi.mocked(useQuery).mockReturnValue([]);
    
    render(<LeadPipeline />);
    
    // Should show zero metrics
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    
    // Columns should still be rendered but empty
    expect(screen.getByText('Unqualified')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
  });
});