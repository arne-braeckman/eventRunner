import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeadCaptureForm } from '~/components/forms/LeadCaptureForm'

// Mock Convex
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn().mockResolvedValue({ success: true })
}))

describe('LeadCaptureForm', () => {
  it('renders the form with all required fields', () => {
    render(<LeadCaptureForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lead source/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lead heat/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create contact/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LeadCaptureForm />)
    
    const submitButton = screen.getByRole('button', { name: /create contact/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('accepts valid form data', async () => {
    const user = userEvent.setup()
    render(<LeadCaptureForm />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.selectOptions(screen.getByLabelText(/lead source/i), 'WEBSITE')
    await user.selectOptions(screen.getByLabelText(/lead heat/i), 'WARM')
    
    const submitButton = screen.getByRole('button', { name: /create contact/i })
    await user.click(submitButton)
    
    // Form should not show validation errors
    expect(screen.queryByText(/name must be at least 2 characters/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
  })
})