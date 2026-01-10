import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from '@/components/shared/ui/skeleton'
import { NotificationToast } from '@/components/shared/ui/notification-toast'

describe('UI Components', () => {
  describe('Skeleton', () => {
    it('renders with default height', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveStyle({ height: '80px' })
    })

    it('renders with custom height', () => {
      const { container } = render(<Skeleton height={120} />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveStyle({ height: '120px' })
    })

    it('applies correct classes', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      // Le classi sono applicate in ordine diverso, verifichiamo che siano presenti
      expect(skeleton).toHaveClass('animate-pulse')
      expect(skeleton).toHaveClass('rounded-xl')
      expect(skeleton).toHaveClass('bg-surface-200')
    })
  })

  describe('NotificationToast', () => {
    it('renders toast container', () => {
      const { container } = render(<NotificationToast />)
      const toaster = container.querySelector('.fixed')
      expect(toaster).toBeInTheDocument()
    })

    it('applies correct styling', () => {
      const { container } = render(<NotificationToast />)
      const toaster = container.querySelector('.fixed')
      expect(toaster).toBeInTheDocument()
      // Verifica le classi principali del container
      expect(toaster).toHaveClass('fixed', 'top-4', 'right-4', 'z-50')
    })
  })
})
