'use client'

import { useEffect } from 'react'

export function useWakeLock(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return
    let sentinel: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      if (!('wakeLock' in navigator)) return
      try {
        sentinel = await navigator.wakeLock.request('screen')
        sentinel.addEventListener('release', () => {
          sentinel = null
        })
      } catch {
        // Ignora se il browser non supporta o nega il lock
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock()
      } else {
        sentinel
          ?.release()
          .catch(() => {})
          .finally(() => {
            sentinel = null
          })
      }
    }

    requestWakeLock()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      sentinel?.release().catch(() => {})
    }
  }, [enabled])
}
