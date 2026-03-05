/**
 * Protezione DOM per evitare errori quando className.split() fallisce
 * Questo script intercetta errori comuni con className su elementi DOM
 */

import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:dom-protection')

if (typeof window !== 'undefined') {
  // Intercetta errori globali relativi a className.split
  const originalErrorHandler = window.onerror
  window.onerror = function (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error,
  ) {
    // Se l'errore è relativo a className.split, lo gestiamo silenziosamente
    const errorMessage =
      typeof message === 'string' ? message : error?.message || String(message || '')

    if (
      errorMessage.includes('className.split') ||
      errorMessage.includes('className.split is not a function') ||
      errorMessage.includes('el.className.split')
    ) {
      logger.warn('DOM Protection: Intercepted className.split error', undefined, {
        message: errorMessage,
        source,
        lineno,
        colno,
      })
      // Preveniamo il crash ma logghiamo per debugging
      return true // Indica che l'errore è stato gestito
    }

    // Altrimenti, passa all'handler originale
    if (originalErrorHandler) {
      return originalErrorHandler.call(this, message, source || '', lineno || 0, colno || 0, error)
    }
    return false
  }

  // Protezione anche per unhandledrejection
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : String(error || '')

    if (
      errorMessage.includes('className.split') ||
      errorMessage.includes('className.split is not a function') ||
      errorMessage.includes('el.className.split')
    ) {
      logger.warn('DOM Protection: Intercepted className.split promise rejection', error)
      event.preventDefault() // Previene il crash
    }
  })
}
