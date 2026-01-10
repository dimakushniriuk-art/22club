// Hook per gestire lo stato di navigazione e loading states

import { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface NavigationState {
  isLoading: boolean
  currentPath: string
  previousPath: string | null
  loadingStartTime: number | null
  pendingPath: string | null
}

export function useNavigationState() {
  const [state, setState] = useState<NavigationState>({
    isLoading: false,
    currentPath: '',
    previousPath: null,
    loadingStartTime: null,
    pendingPath: null,
  })

  const pathname = usePathname()
  const router = useRouter()

  // Aggiorna il path corrente quando cambia
  useEffect(() => {
    setState((prev) => {
      // Evita aggiornamenti non necessari per prevenire loop infiniti
      if (prev.currentPath === pathname) {
        return prev
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'use-navigation-state.ts:useEffect:pathname',
          message: 'Pathname changed',
          data: {
            previousPath: prev.currentPath,
            newPath: pathname,
            wasLoading: prev.isLoading,
            pendingPath: prev.pendingPath,
          },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          runId: 'run1',
          hypothesisId: 'H',
        }),
      }).catch(() => {})
      // #endregion

      // Se stiamo caricando e il path è cambiato, termina il loading
      if (prev.isLoading && prev.currentPath !== pathname) {
        return {
          ...prev,
          currentPath: pathname,
          previousPath: prev.currentPath,
          isLoading: false,
          loadingStartTime: null,
          pendingPath: null,
        }
      }

      return {
        ...prev,
        currentPath: pathname,
        previousPath: prev.currentPath,
        pendingPath: null,
      }
    })
  }, [pathname])

  // Previeni loop infiniti con cleanup
  useEffect(() => {
    return () => {
      // Cleanup per prevenire memory leaks
    }
  }, [])

  const startNavigation = useCallback((targetPath: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      loadingStartTime: Date.now(),
      previousPath: prev.currentPath,
      pendingPath: targetPath,
    }))

    // Timeout di sicurezza per evitare loading infiniti
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        loadingStartTime: null,
        pendingPath: null,
      }))
    }, 10000) // 10 secondi max
  }, [])

  const endNavigation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isLoading: false,
      loadingStartTime: null,
    }))
  }, [])

  const navigateWithLoading = useCallback(
    (path: string) => {
      startNavigation(path)
      router.push(path)
    },
    [router, startNavigation],
  )

  const getLoadingDuration = useCallback(() => {
    if (!state.loadingStartTime) return 0
    return Date.now() - state.loadingStartTime
  }, [state.loadingStartTime])

  const isNavigationSlow = useCallback(() => {
    const duration = getLoadingDuration()
    return duration > 3000 // Considera lento se > 3 secondi
  }, [getLoadingDuration])

  return {
    ...state,
    startNavigation,
    endNavigation,
    navigateWithLoading,
    getLoadingDuration,
    isNavigationSlow,
  }
}
