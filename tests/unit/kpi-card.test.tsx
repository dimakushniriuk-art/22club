import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'

// Mock framer-motion prima di importare KpiCard (evita body vuoto in suite completa)
vi.mock('framer-motion', async () => {
  const React = await import('react')
  const framerProps = new Set([
    'whileHover',
    'whileTap',
    'whileFocus',
    'whileDrag',
    'whileInView',
    'initial',
    'animate',
    'exit',
    'transition',
    'variants',
    'onAnimationStart',
    'onAnimationComplete',
    'layout',
    'layoutId',
  ])
  const createMotion = (tag: string) => {
    const Motion = (props: Record<string, unknown>) => {
      const filtered: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(props)) {
        if (k === 'children' || !framerProps.has(k)) filtered[k] = v
      }
      return React.createElement(tag, filtered, props.children as React.ReactNode)
    }
    Motion.displayName = `Motion.${tag}`
    return Motion
  }
  return {
    motion: new Proxy(
      { div: createMotion('div'), span: createMotion('span') },
      {
        get(_, prop) {
          return createMotion(prop as string)
        },
      },
    ),
    AnimatePresence: ({ children }: { children: unknown }) => children,
  }
})

let KpiCard: React.ComponentType<{
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  onClick?: () => void
}>

beforeAll(async () => {
  vi.resetModules()
  const mod = await import('@/components/shared/dashboard/kpi-card')
  KpiCard = mod.KpiCard
})

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
