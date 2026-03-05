'use client'
import { useEffect } from 'react'
import { registerServiceWorker } from '@/hooks/use-push-notifications'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:sw-register')

export default function SwRegister() {
  useEffect(() => {
    // Disabilita Service Worker in sviluppo per evitare problemi con localhost
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Service Worker disabilitato in sviluppo')
      return
    }
    try {
      registerServiceWorker()
    } catch (e) {
      logger.error('SW registration error', e)
    }
  }, [])
  return null
}
