'use client'

import { useEffect, useState } from 'react'

export function useDeferredPdfPreviewMount() {
  const [mountPdfDialog, setMountPdfDialog] = useState(false)

  useEffect(() => {
    let idleId: number | undefined
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined

    const enable = () => setMountPdfDialog(true)
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enable)
    } else {
      timeoutId = globalThis.setTimeout(enable, 0)
    }

    return () => {
      if (idleId != null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId != null) {
        globalThis.clearTimeout(timeoutId)
      }
    }
  }, [])

  return mountPdfDialog
}
