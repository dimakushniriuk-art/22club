import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HapticButton, ActionButton, ConfirmButton } from '@/components/shared/ui/haptic-button'

describe('HapticButton component', () => {
  it('renders children correctly', () => {
    render(<HapticButton>Click me</HapticButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies correct variant classes', () => {
    const { rerender } = render(<HapticButton variant="primary">Primary</HapticButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(<HapticButton variant="secondary">Secondary</HapticButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-surface-200')

    rerender(<HapticButton variant="outline">Outline</HapticButton>)
    expect(screen.getByRole('button')).toHaveClass('border-primary')

    rerender(<HapticButton variant="ghost">Ghost</HapticButton>)
    expect(screen.getByRole('button')).toHaveClass('text-text-primary')

    rerender(<HapticButton variant="danger">Danger</HapticButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-error')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<HapticButton size="sm">Small</HapticButton>)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<HapticButton size="md">Medium</HapticButton>)
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-base')

    rerender(<HapticButton size="lg">Large</HapticButton>)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<HapticButton onClick={handleClick}>Click me</HapticButton>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state correctly', () => {
    render(<HapticButton loading>Loading</HapticButton>)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.queryByText('Loading')).not.toBeInTheDocument()
  })

  it('renders with icon on left side', () => {
    const icon = <span data-testid="icon">🏋️</span>
    render(
      <HapticButton icon={icon} iconPosition="left">
        With icon
      </HapticButton>,
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('With icon')).toBeInTheDocument()
  })

  it('renders with icon on right side', () => {
    const icon = <span data-testid="icon">🏋️</span>
    render(
      <HapticButton icon={icon} iconPosition="right">
        With icon
      </HapticButton>,
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('With icon')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<HapticButton disabled>Disabled</HapticButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

describe('ActionButton component', () => {
  it('renders success action correctly', () => {
    render(<ActionButton action="success">Success</ActionButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })

  it('renders error action correctly', () => {
    render(<ActionButton action="error">Error</ActionButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-error')
  })

  it('renders warning action correctly', () => {
    render(<ActionButton action="warning">Warning</ActionButton>)
    expect(screen.getByRole('button')).toHaveClass('border-primary')
  })

  it('renders info action correctly', () => {
    render(<ActionButton action="info">Info</ActionButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-surface-200')
  })
})

describe('ConfirmButton component', () => {
  it('shows initial state correctly', () => {
    const handleConfirm = vi.fn()
    render(<ConfirmButton onConfirm={handleConfirm}>Delete</ConfirmButton>)

    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.queryByText('Conferma')).not.toBeInTheDocument()
  })

  it('shows confirm state after first click', () => {
    const handleConfirm = vi.fn()
    render(<ConfirmButton onConfirm={handleConfirm}>Delete</ConfirmButton>)

    fireEvent.click(screen.getByText('Delete'))

    expect(screen.getByText('Conferma')).toBeInTheDocument()
    expect(screen.getByText('Annulla')).toBeInTheDocument()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirmed', () => {
    const handleConfirm = vi.fn()
    render(<ConfirmButton onConfirm={handleConfirm}>Delete</ConfirmButton>)

    fireEvent.click(screen.getByText('Delete'))
    fireEvent.click(screen.getByText('Conferma'))

    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('cancels confirmation when cancel is clicked', () => {
    const handleConfirm = vi.fn()
    render(<ConfirmButton onConfirm={handleConfirm}>Delete</ConfirmButton>)

    fireEvent.click(screen.getByText('Delete'))
    fireEvent.click(screen.getByText('Annulla'))

    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.queryByText('Conferma')).not.toBeInTheDocument()
    expect(handleConfirm).not.toHaveBeenCalled()
  })
})
