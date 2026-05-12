'use client'

import { useEffect, useState } from 'react'

/** Dopo il primo paint, abilita blocchi secondari (trend, pipeline, tabelle lunghe). */
export function useMarketingDeferSecondary(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const enable = () => setReady(true)

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(enable)
    } else {
      timeoutId = setTimeout(enable, 0)
    }

    return () => {
      if (idleId != null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId != null) clearTimeout(timeoutId)
    }
  }, [])

  return ready
}
