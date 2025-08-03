import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navigation } from '~/components/layout/Navigation'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/'
}))

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button">UserButton</div>,
  useUser: () => ({ user: { firstName: 'John', emailAddresses: [{ emailAddress: 'john@example.com' }] } })
}))

// Mock Convex
vi.mock('convex/react', () => ({
  useConvexAuth: () => ({ isAuthenticated: true })
}))

describe('Navigation', () => {
  it('renders the eventRunner brand', () => {
    render(<Navigation />)
    expect(screen.getByText('event')).toBeInTheDocument()
    expect(screen.getByText('Runner')).toBeInTheDocument()
  })

  it('shows navigation links when authenticated', () => {
    render(<Navigation />)
    
    expect(screen.getAllByText('Dashboard')).toHaveLength(2) // Desktop and mobile
    expect(screen.getAllByText('Contacts')).toHaveLength(2)
    expect(screen.getAllByText('Projects')).toHaveLength(2)
  })

  it('shows welcome message for authenticated user', () => {
    render(<Navigation />)
    expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
  })

  it('shows user button when authenticated', () => {
    render(<Navigation />)
    expect(screen.getByTestId('user-button')).toBeInTheDocument()
  })
})