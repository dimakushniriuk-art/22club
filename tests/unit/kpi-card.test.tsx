import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { KpiCard } from '@/components/shared/dashboard/kpi-card'

describe('KpiCard component', () => {
  it('renders label and value correctly', () => {
    render(<KpiCard label="Allenamenti" value="12" />)

    expect(screen.getByText('Allenamenti')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders with trend indicator', () => {
    render(<KpiCard label="Obiettivi" value="3/5" trend="up" />)

    expect(screen.getByText('Obiettivi')).toBeInTheDocument()
    expect(screen.getByText('3/5')).toBeInTheDocument()
    expect(screen.getByText('↗')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    const icon = <span data-testid="icon">🏋️</span>
    render(<KpiCard label="Streak" value="7 giorni" icon={icon} />)

    expect(screen.getByText('Streak')).toBeInTheDocument()
    expect(screen.getByText('7 giorni')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<KpiCard label="Test" value="123" onClick={handleClick} />)

    const card = screen.getByText('Test').closest('div')
    fireEvent.click(card!)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct classes when clickable', () => {
    const handleClick = vi.fn()
    render(<KpiCard label="Test" value="123" onClick={handleClick} />)

    const card = screen.getByText('Test').closest('div')
    expect(card).toHaveClass('cursor-pointer')
  })

  it('does not apply clickable classes when no onClick', () => {
    render(<KpiCard label="Test" value="123" />)

    const card = screen.getByText('Test').closest('div')
    expect(card).not.toHaveClass('cursor-pointer')
  })

  it('renders different trend indicators correctly', () => {
    const { rerender } = render(<KpiCard label="Test" value="123" trend="up" />)
    expect(screen.getByText('↗')).toBeInTheDocument()

    rerender(<KpiCard label="Test" value="123" trend="down" />)
    expect(screen.getByText('↘')).toBeInTheDocument()

    rerender(<KpiCard label="Test" value="123" trend="neutral" />)
    expect(screen.getByText('→')).toBeInTheDocument()
  })
})
