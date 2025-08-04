import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadDashboard } from '../../../src/components/features/leads/LeadDashboard';
import { useQuery } from 'convex/react';

// Mock Convex hooks
let callCount = 0;

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => {
    callCount++;
    if (callCount === 1) {
      // First call - return contacts
      return [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Tech Corp',
          leadSource: 'WEBSITE',
          leadHeat: 'HOT',
          leadHeatScore: 18,
          status: 'QUALIFIED',
          createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
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
          createdAt: Date.now() - (14 * 24 * 60 * 60 * 1000), // 14 days ago
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
          status: 'PROSPECT',
          createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
          updatedAt: Date.now()
        }
      ];
    } else {
      // Second call - return interactions
      return { totalInteractions: 15, interactionsByType: {}, interactionsByPlatform: { facebook: 10, linkedin: 5 } };
    }
  }),
}));

// Mock Recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  Pie: () => <div data-testid="pie" />,
  Bar: () => <div data-testid="bar" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  TrendingUpIcon: () => <div data-testid="trending-up-icon" />,
  TrendingDownIcon: () => <div data-testid="trending-down-icon" />,
  UsersIcon: () => <div data-testid="users-icon" />,
  ThermometerIcon: () => <div data-testid="thermometer-icon" />,
  FilterIcon: () => <div data-testid="filter-icon" />,
  RefreshCwIcon: () => <div data-testid="refresh-icon" />,
  DownloadIcon: () => <div data-testid="download-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
  MessageSquareIcon: () => <div data-testid="message-square-icon" />,
  PhoneIcon: () => <div data-testid="phone-icon" />,
  CalendarIcon: () => <div data-testid="calendar-icon" />,
  ExternalLinkIcon: () => <div data-testid="external-link-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  Check: () => <div data-testid="check-icon" />,
}));

describe('LeadDashboard', () => {
  beforeEach(() => {
    // Reset call count for each test
    callCount = 0;
  });

  it('renders dashboard header correctly', () => {
    render(<LeadDashboard />);
    
    expect(screen.getByText('Lead Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive lead analytics and heat visualization')).toBeInTheDocument();
  });

  it('displays key metrics cards', () => {
    render(<LeadDashboard />);
    
    expect(screen.getByText('Total Leads')).toBeInTheDocument();
    expect(screen.getByText('Hot Leads')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Heat Score')).toBeInTheDocument();
  });

  it('calculates metrics correctly', () => {
    render(<LeadDashboard />);
    
    // Should show 3 total leads from mock data
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Should show 1 hot lead
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders filter components', () => {
    render(<LeadDashboard />);
    
    expect(screen.getByText('Dashboard Filters')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Lead Source')).toBeInTheDocument();
    expect(screen.getByText('Lead Heat')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders chart components', () => {
    render(<LeadDashboard />);
    
    expect(screen.getByText('Lead Heat Trends')).toBeInTheDocument();
    expect(screen.getByText('Lead Source Distribution')).toBeInTheDocument();
    expect(screen.getByText('Social Engagement')).toBeInTheDocument();
    expect(screen.getByText('Heat Score Distribution')).toBeInTheDocument();
    
    // Check that chart components are rendered
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(4);
  });

  it('displays social engagement metrics', () => {
    render(<LeadDashboard />);
    
    expect(screen.getByText('Social Engagement')).toBeInTheDocument();
    expect(screen.getByText('Total Interactions')).toBeInTheDocument();
    expect(screen.getByText('Avg per Lead')).toBeInTheDocument();
    expect(screen.getByText('Top Platforms:')).toBeInTheDocument();
  });

  it('handles refresh button click', () => {
    render(<LeadDashboard />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
    
    fireEvent.click(refreshButton);
    // Button should be disabled during refresh
    expect(refreshButton).toBeDisabled();
  });

  it('handles export button click', () => {
    render(<LeadDashboard />);
    
    const exportButton = screen.getByRole('button', { name: /export/i });
    expect(exportButton).toBeInTheDocument();
    
    fireEvent.click(exportButton);
    // Export functionality should be triggered (would normally download file)
  });

  it('allows filtering by date range', async () => {
    render(<LeadDashboard />);
    
    // Find date range select
    const dateRangeSelect = screen.getByDisplayValue('Last 30 days');
    expect(dateRangeSelect).toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(dateRangeSelect);
    
    // Should show date range options
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 days')).toBeInTheDocument();
    expect(screen.getByText('All time')).toBeInTheDocument();
  });

  it('allows filtering by lead source', async () => {
    render(<LeadDashboard />);
    
    // Find lead source select (should show "All Sources" initially)
    const leadSourceSelect = screen.getByDisplayValue('All Sources');
    expect(leadSourceSelect).toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(leadSourceSelect);
    
    // Should show lead source options
    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('allows filtering by lead heat level', async () => {
    render(<LeadDashboard />);
    
    // Find lead heat select
    const leadHeatSelect = screen.getByDisplayValue('All Heat Levels');
    expect(leadHeatSelect).toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(leadHeatSelect);
    
    // Should show heat level options with emojis
    expect(screen.getByText('🔥 Hot')).toBeInTheDocument();
    expect(screen.getByText('🌤️ Warm')).toBeInTheDocument();
    expect(screen.getByText('❄️ Cold')).toBeInTheDocument();
  });

  it('shows loading state when data is not available', () => {
    // Mock useQuery to return undefined (loading state)
    vi.mocked(useQuery).mockReturnValue(undefined);
    
    render(<LeadDashboard />);
    
    // Should show skeleton loading state
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    
    // Restore original mock for next tests
    callCount = 0;
    vi.mocked(useQuery).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return [];
      } else {
        return { totalInteractions: 0, interactionsByType: {}, interactionsByPlatform: {} };
      }
    });
  });

  it('handles empty data gracefully', () => {
    // Reset call count and mock useQuery to return empty arrays
    callCount = 0;
    vi.mocked(useQuery).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return [];
      } else {
        return { totalInteractions: 0, interactionsByType: {}, interactionsByPlatform: {} };
      }
    });
    
    render(<LeadDashboard />);
    
    // Should show zero values
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });
});