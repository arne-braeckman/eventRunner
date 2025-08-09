import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplateLibrary } from '@/components/features/proposals/TemplateLibrary';

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => [
    {
      _id: 'template1',
      name: 'Wedding Template',
      eventTypes: ['WEDDING'],
      content: { sections: [], dynamicFields: [] },
      version: 1,
      isActive: true,
      updatedAt: Date.now(),
    },
    {
      _id: 'template2',
      name: 'Corporate Template',
      eventTypes: ['CORPORATE'],
      content: { sections: [], dynamicFields: [] },
      version: 2,
      isActive: true,
      updatedAt: Date.now(),
    },
  ]),
  useMutation: vi.fn(() => vi.fn()),
}));

describe('TemplateLibrary', () => {
  it('renders template library with templates', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getByText('Template Library')).toBeInTheDocument();
    expect(screen.getByText('Wedding Template')).toBeInTheDocument();
    expect(screen.getByText('Corporate Template')).toBeInTheDocument();
  });

  it('shows new template button when not in selection mode', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getByText('New Template')).toBeInTheDocument();
  });

  it('shows select buttons when in selection mode', () => {
    const mockOnTemplateSelect = vi.fn();
    render(<TemplateLibrary selectionMode={true} onTemplateSelect={mockOnTemplateSelect} />);
    
    const selectButtons = screen.getAllByText('Select');
    expect(selectButtons.length).toBeGreaterThan(0);
  });

  it('displays event type badges for templates', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getByText('wedding')).toBeInTheDocument();
    expect(screen.getByText('corporate')).toBeInTheDocument();
  });

  it('shows version numbers for templates', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getByText('v1')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
  });

  it('provides search functionality', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();
  });

  it('provides event type filter', () => {
    render(<TemplateLibrary />);
    
    expect(screen.getByText('All Event Types')).toBeInTheDocument();
  });
});