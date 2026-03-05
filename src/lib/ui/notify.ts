import { useCallback } from 'react'
import { useToast } from '@/components/ui/toast'

/**
 * Utility per mostrare notifiche toast accessibili
 * Sostituisce alert() nativi con sistema toast del progetto
 */
export function useNotify() {
  const { addToast } = useToast()

  const notify = useCallback((
    message: string,
    variant: 'success' | 'error' | 'warning' | 'info' = 'info',
    title?: string,
    duration?: number
  ) => {
    addToast({
      message,
      variant,
      title,
      duration,
    })
  }, [addToast])

  return { notify }
}

/**
 * Hook semplificato per notifiche rapide
 * Usage: const { success, error, warning, info } = useNotify()
 */
export function useNotifyHelpers() {
  const { notify } = useNotify()

  return {
    success: (message: string, title?: string) => notify(message, 'success', title),
    error: (message: string, title?: string) => notify(message, 'error', title),
    warning: (message: string, title?: string) => notify(message, 'warning', title),
    info: (message: string, title?: string) => notify(message, 'info', title),
  }
}