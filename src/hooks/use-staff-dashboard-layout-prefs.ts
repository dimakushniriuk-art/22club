'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import type { Json } from '@/types/supabase'
import {
  loadStaffDashboardLayoutPrefs,
  normalizeStaffDashboardLayoutPrefs,
  saveStaffDashboardLayoutPrefs,
  STAFF_DASHBOARD_LAYOUT_DEFAULTS,
  staffDashboardPrefsEqual,
  type StaffDashboardLayoutPrefs,
  type StaffDashboardQuickActionId,
  type StaffDashboardWidgetId,
} from '@/lib/dashboard/staff-dashboard-layout-prefs'

const REMOTE_SAVE_DEBOUNCE_MS = 600

export function useStaffDashboardLayoutPrefs() {
  const { user, loading: authLoading } = useAuth()
  const profileId = user?.id

  const [prefs, setPrefs] = useState<StaffDashboardLayoutPrefs>(() => ({
    quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
    widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
  }))
  const [hydrated, setHydrated] = useState(false)
  const [remoteSynced, setRemoteSynced] = useState(false)

  const prefsRef = useRef(prefs)
  prefsRef.current = prefs
  const lastRemoteSerializedRef = useRef('')
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (authLoading) return

    let cancelled = false
    lastRemoteSerializedRef.current = ''

    void (async () => {
      const localState = loadStaffDashboardLayoutPrefs(profileId)
      const local = localState.prefs
      const localSavedAt = localState.savedAt

      if (!profileId) {
        if (cancelled) return
        setPrefs(local)
        lastRemoteSerializedRef.current = JSON.stringify(local)
        setRemoteSynced(true)
        setHydrated(true)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('staff_dashboard_layout_prefs, updated_at')
        .eq('id', profileId)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        setPrefs(local)
        lastRemoteSerializedRef.current = JSON.stringify(local)
        setRemoteSynced(true)
        setHydrated(true)
        return
      }

      const rawRemote = data?.staff_dashboard_layout_prefs
      let next: StaffDashboardLayoutPrefs

      const remoteUpdatedAt = typeof data?.updated_at === 'string' ? data.updated_at : null

      if (rawRemote != null && typeof rawRemote === 'object' && !Array.isArray(rawRemote)) {
        const remote = normalizeStaffDashboardLayoutPrefs(rawRemote)

        const localIsDefault = staffDashboardPrefsEqual(local, STAFF_DASHBOARD_LAYOUT_DEFAULTS)
        const remoteIsDefault = staffDashboardPrefsEqual(remote, STAFF_DASHBOARD_LAYOUT_DEFAULTS)

        // If remote looks "empty/default" but local has real prefs, never let remote wipe local.
        // This protects navigation/re-login when remote updates are blocked (e.g. RLS).
        if (!localIsDefault && remoteIsDefault) {
          next = local
          // Try to push local up to remote (best-effort; if RLS blocks, we still keep local).
          await supabase
            .from('profiles')
            .update({
              staff_dashboard_layout_prefs: next as unknown as Json,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profileId)
        } else if (localSavedAt && remoteUpdatedAt && localSavedAt > remoteUpdatedAt) {
          // Local is newer than remote (same device) → prefer local and attempt sync.
          next = local
          await supabase
            .from('profiles')
            .update({
              staff_dashboard_layout_prefs: next as unknown as Json,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profileId)
        } else {
          next = remote
        }

        saveStaffDashboardLayoutPrefs(next, profileId)
      } else {
        next = local
        if (!staffDashboardPrefsEqual(local, STAFF_DASHBOARD_LAYOUT_DEFAULTS)) {
          await supabase
            .from('profiles')
            .update({
              staff_dashboard_layout_prefs: next as unknown as Json,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profileId)
        }
      }

      if (cancelled) return
      lastRemoteSerializedRef.current = JSON.stringify(next)
      setPrefs(next)
      setRemoteSynced(true)
      setHydrated(true)
    })()

    return () => {
      cancelled = true
    }
  }, [authLoading, profileId, supabase])

  useEffect(() => {
    if (!hydrated || !remoteSynced) return
    saveStaffDashboardLayoutPrefs(prefs, profileId)
    if (!profileId) return

    const serialized = JSON.stringify(prefs)
    if (serialized === lastRemoteSerializedRef.current) return

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      const payload = prefsRef.current
      const s = JSON.stringify(payload)
      void supabase
        .from('profiles')
        .update({
          staff_dashboard_layout_prefs: payload as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
        .then(({ error }) => {
          if (!error) lastRemoteSerializedRef.current = s
        })
    }, REMOTE_SAVE_DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [prefs, hydrated, remoteSynced, profileId, supabase])

  const setQuickVisible = useCallback((id: StaffDashboardQuickActionId, visible: boolean) => {
    setPrefs((p) => ({ ...p, quick: { ...p.quick, [id]: visible } }))
  }, [])

  const setWidgetVisible = useCallback((id: StaffDashboardWidgetId, visible: boolean) => {
    setPrefs((p) => ({ ...p, widgets: { ...p.widgets, [id]: visible } }))
  }, [])

  const resetLayout = useCallback(() => {
    setPrefs({
      quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
      widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
    })
  }, [])

  return { prefs, setQuickVisible, setWidgetVisible, resetLayout, hydrated }
}
