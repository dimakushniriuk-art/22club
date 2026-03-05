import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Shimmer,
  ShimmerList,
  ShimmerCard,
  ShimmerChart,
  ShimmerTable,
  ShimmerKPI,
} from '@/components/shared/ui/shimmer'

describe('Shimmer components', () => {
  describe('Shimmer', () => {
    it('renders with default props', () => {
      const { container } = render(<Shimmer />)
      const shimmer = container.querySelector('.bg-surface-300') as HTMLElement
      expect(shimmer).toBeInTheDocument()
      expect(shimmer).toHaveClass('bg-surface-300', 'rounded-md')
    })

    it('renders with custom height and width', () => {
      const { container } = render(<Shimmer height={50} width={200} />)
      const shimmer = container.querySelector('.bg-surface-300') as HTMLElement
      expect(shimmer).toHaveStyle({ height: '50px', width: '200px' })
    })

    it('renders without rounded corners when specified', () => {
      const { container } = render(<Shimmer rounded={false} />)
      const shimmer = container.querySelector('.bg-surface-300') as HTMLElement
      expect(shimmer).not.toHaveClass('rounded-md')
    })

    it('applies custom className', () => {
      const { container } = render(<Shimmer className="custom-class" />)
      const shimmer = container.querySelector('.bg-surface-300') as HTMLElement
      expect(shimmer).toHaveClass('custom-class')
    })
  })

  describe('ShimmerList', () => {
    it('renders correct number of shimmer items', () => {
      const { container } = render(<ShimmerList count={5} />)
      const shimmerItems = container.querySelectorAll('.bg-surface-300')
      expect(shimmerItems).toHaveLength(5)
    })

    it('renders with custom item height', () => {
      const { container } = render(<ShimmerList count={3} itemHeight={30} />)
      const shimmerItems = container.querySelectorAll('.bg-surface-300')
      shimmerItems.forEach((item) => {
        expect(item).toHaveStyle({ height: '30px' })
      })
    })
  })

  describe('ShimmerCard', () => {
    it('renders card shimmer', () => {
      const { container } = render(<ShimmerCard />)
      const card = container.querySelector('.bg-surface-200.rounded-xl') as HTMLElement
      expect(card).toHaveClass('p-4', 'bg-surface-200', 'rounded-xl')
    })

    it('renders with avatar when specified', () => {
      const { container } = render(<ShimmerCard showAvatar={true} />)
      const avatar = container.querySelector('.rounded-full') as HTMLElement
      expect(avatar).toHaveClass('rounded-full')
    })

    it('renders correct number of lines', () => {
      const { container } = render(<ShimmerCard lines={5} />)
      const shimmerItems = container.querySelectorAll('.bg-surface-300')
      // ShimmerCard con lines=5: 2 linee base + 1 linea extra (lines > 2) + 1 linea extra (lines > 3) = 4 shimmer items
      expect(shimmerItems).toHaveLength(4)
    })
  })

  describe('ShimmerChart', () => {
    it('renders line chart shimmer', () => {
      const { container } = render(<ShimmerChart type="line" />)
      const chart = container.firstChild as HTMLElement
      expect(chart).toBeInTheDocument()
    })

    it('renders pie chart shimmer', () => {
      const { container } = render(<ShimmerChart type="pie" />)
      const chart = container.querySelector('.rounded-full') as HTMLElement
      expect(chart).toHaveClass('rounded-full')
    })

    it('renders with custom height', () => {
      const { container } = render(<ShimmerChart height={300} />)
      const chart = container.firstChild as HTMLElement
      expect(chart).toHaveStyle({ height: '300px' })
    })
  })

  describe('ShimmerTable', () => {
    it('renders table shimmer with default props', () => {
      const { container } = render(<ShimmerTable />)
      const shimmerItems = container.querySelectorAll('.bg-surface-300')
      // 4 columns + 5 rows * 4 columns = 24 shimmer items
      expect(shimmerItems).toHaveLength(24)
    })

    it('renders with custom rows and columns', () => {
      const { container } = render(<ShimmerTable rows={3} columns={2} />)
      const shimmerItems = container.querySelectorAll('.bg-surface-300')
      // 2 columns + 3 rows * 2 columns = 8 shimmer items
      expect(shimmerItems).toHaveLength(8)
    })
  })

  describe('ShimmerKPI', () => {
    it('renders KPI shimmer cards', () => {
      const { container } = render(<ShimmerKPI />)
      const shimmerItems = container.querySelectorAll('.bg-surface-300')
      // 4 KPI cards * 4 shimmer items each = 16 shimmer items
      expect(shimmerItems).toHaveLength(16)
    })

    it('renders with custom count', () => {
      const { container } = render(<ShimmerKPI count={2} />)
      const shimmerItems = container.querySelectorAll('.bg-surface-300')
      // 2 KPI cards * 4 shimmer items each = 8 shimmer items
      expect(shimmerItems).toHaveLength(8)
    })
  })
})
