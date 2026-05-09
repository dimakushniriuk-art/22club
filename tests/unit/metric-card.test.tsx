import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MetricCard } from '@/components'

const defaultIcon = <span data-testid="default-icon">●</span>

describe('MetricCard component', () => {
  it('renders title and value correctly', () => {
    render(<MetricCard variant="minimal" title="Allenamenti" value="12" icon={defaultIcon} />)

    expect(screen.getByText('Allenamenti')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders with trend indicator', () => {
    render(
      <MetricCard variant="minimal" title="Obiettivi" value="3/5" trend="up" icon={defaultIcon} />,
    )

    expect(screen.getByText('Obiettivi')).toBeInTheDocument()
    expect(screen.getByText('3/5')).toBeInTheDocument()
    expect(screen.getByText('↗')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    const icon = <span data-testid="icon">🏋️</span>
    render(<MetricCard variant="minimal" title="Streak" value="7 giorni" icon={icon} />)

    expect(screen.getByText('Streak')).toBeInTheDocument()
    expect(screen.getByText('7 giorni')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(
      <MetricCard
        variant="minimal"
        title="Test"
        value="123"
        icon={defaultIcon}
        onClick={handleClick}
      />,
    )

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies cursor-pointer on card surface when clickable', () => {
    const handleClick = vi.fn()
    render(
      <MetricCard
        variant="minimal"
        title="Test"
        value="123"
        icon={defaultIcon}
        onClick={handleClick}
      />,
    )

    const surface = screen.getByRole('button').firstElementChild
    expect(surface).toHaveClass('cursor-pointer')
  })

  it('does not apply cursor-pointer on card when no onClick', () => {
    const { container } = render(
      <MetricCard variant="minimal" title="Test" value="123" icon={defaultIcon} />,
    )

    const cardRoot = container.firstElementChild
    expect(cardRoot).not.toHaveClass('cursor-pointer')
  })

  it('renders different trend indicators correctly', () => {
    const { rerender } = render(
      <MetricCard variant="minimal" title="Test" value="123" trend="up" icon={defaultIcon} />,
    )
    expect(screen.getByText('↗')).toBeInTheDocument()

    rerender(
      <MetricCard variant="minimal" title="Test" value="123" trend="down" icon={defaultIcon} />,
    )
    expect(screen.getByText('↘')).toBeInTheDocument()

    rerender(
      <MetricCard variant="minimal" title="Test" value="123" trend="neutral" icon={defaultIcon} />,
    )
    expect(screen.getByText('→')).toBeInTheDocument()
  })
})
