'use client'

import { useEffect, useState } from 'react'

const WELCOME_HEAVY_STEP_INDEX = 9

export function useWelcomeHeavyStepsDeferred(currentStep: number): boolean {
  const [ready, setReady] = useState(currentStep < WELCOME_HEAVY_STEP_INDEX)

  useEffect(() => {
    if (currentStep < WELCOME_HEAVY_STEP_INDEX) {
      setReady(true)
      return
    }

    setReady(false)

    if (typeof requestIdleCallback !== 'undefined') {
      const idleId = requestIdleCallback(() => setReady(true), { timeout: 1200 })
      return () => cancelIdleCallback(idleId)
    }

    const timeoutId = window.setTimeout(() => setReady(true), 0)
    return () => window.clearTimeout(timeoutId)
  }, [currentStep])

  return ready
}
