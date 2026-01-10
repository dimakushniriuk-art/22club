import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NotificationToast } from '@/components/shared/ui/notification-toast'

describe('NotificationToast component', () => {
  it('renders toast container', () => {
    const { container } = render(<NotificationToast />)

    // Verifica che il componente Toaster sia presente
    const toaster = container.querySelector('.fixed')
    expect(toaster).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    const { container } = render(<NotificationToast />)

    const toaster = container.querySelector('.fixed')
    expect(toaster).toBeInTheDocument()
    // Il componente NotificationToast non ha direttamente font-sans, ma è applicato internamente
    expect(toaster).toHaveClass('fixed', 'top-4', 'right-4')
  })
})
