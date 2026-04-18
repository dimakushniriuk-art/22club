'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  loadStaffDashboardLayoutPrefs,
  saveStaffDashboardLayoutPrefs,
  STAFF_DASHBOARD_LAYOUT_DEFAULTS,
  type StaffDashboardLayoutPrefs,
  type StaffDashboardQuickActionId,
  type StaffDashboardWidgetId,
} from '@/lib/dashboard/staff-dashboard-layout-prefs'

export function useStaffDashboardLayoutPrefs() {
  const [prefs, setPrefs] = useState<StaffDashboardLayoutPrefs>(() => ({
    quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
    widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
  }))
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setPrefs(loadStaffDashboardLayoutPrefs())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveStaffDashboardLayoutPrefs(prefs)
  }, [prefs, hydrated])

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
