'use client'

import { useEffect, useRef, useCallback } from 'react'
import {
  clearFormDraft,
  loadFormDraft,
  saveFormDraft,
  saveFormDraftSync,
  type BrowserFormDraftEnvelope,
} from '@/lib/browser-form-draft'
import { PLATFORM_FORM_AUTOSAVE_DEBOUNCE_MS } from '@/lib/session-stability/platform-sync-constants'

export interface UseBrowserFormDraftOptions<T> {
  /** Prefisso feature (es. `progressi-nuovo`). */
  feature: string
  /** Scope univoco incluso user id (es. `uuid`). Disabilita persistenza se vuoto. */
  scope: string | null | undefined
  /** Stato corrente da salvare. */
  value: T
  /** Non salvare bozza vuota / insignificante. */
  isMeaningful: (value: T) => boolean
  debounceMs?: number
  maxAgeMs?: number
  /** Restore una sola volta al mount se trovata bozza valida. */
  onRestore?: (payload: T, envelope: BrowserFormDraftEnvelope<T>) => void
  /** Se false, non ripristina (solo persist). Default true se `onRestore` è definito. */
  restoreEnabled?: boolean
}

/**
 * Debounce persist + flush `beforeunload`/`pagehide`; ripristino opzionale al mount.
 */
export function useBrowserFormDraft<T>({
  feature,
  scope,
  value,
  isMeaningful,
  debounceMs = PLATFORM_FORM_AUTOSAVE_DEBOUNCE_MS,
  maxAgeMs,
  onRestore,
  restoreEnabled,
}: UseBrowserFormDraftOptions<T>) {
  const enabled = Boolean(scope && scope.length > 0)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapshotRef = useRef(value)
  const restoreDoneRef = useRef(false)

  useEffect(() => {
    snapshotRef.current = value
  }, [value])

  const clear = useCallback(() => {
    if (!enabled || !scope) return
    clearFormDraft(feature, scope)
  }, [enabled, feature, scope])

  useEffect(() => {
    if (!enabled || !scope || restoreDoneRef.current) return
    const shouldRestore = restoreEnabled ?? Boolean(onRestore)
    if (!shouldRestore || !onRestore) {
      restoreDoneRef.current = true
      return
    }
    const env = loadFormDraft<T>(feature, scope, { maxAgeMs })
    restoreDoneRef.current = true
    if (env && isMeaningful(env.payload)) {
      onRestore(env.payload, env)
    }
  }, [enabled, feature, scope, maxAgeMs, onRestore, isMeaningful, restoreEnabled])

  useEffect(() => {
    if (!enabled || !scope) return
    const flush = () => {
      const v = snapshotRef.current
      if (!isMeaningful(v)) return
      saveFormDraftSync(feature, scope, v)
    }
    window.addEventListener('beforeunload', flush)
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('beforeunload', flush)
      window.removeEventListener('pagehide', flush)
    }
  }, [enabled, feature, scope, isMeaningful])

  useEffect(() => {
    if (!enabled || !scope) return
    if (!isMeaningful(value)) return
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      persistTimerRef.current = null
      saveFormDraft(feature, scope, value)
    }, debounceMs)
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    }
  }, [enabled, feature, scope, value, isMeaningful, debounceMs])

  return { clearDraft: clear, enabled }
}
