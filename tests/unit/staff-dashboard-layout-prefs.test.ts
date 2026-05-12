import { beforeEach, describe, expect, it } from 'vitest'
import {
  STAFF_DASHBOARD_LAYOUT_DEFAULTS,
  loadStaffDashboardLayoutPrefs,
  normalizeStaffDashboardLayoutPrefs,
  saveStaffDashboardLayoutPrefs,
  staffDashboardPrefsEqual,
} from '@/lib/dashboard/staff-dashboard-layout-prefs'

const PROFILE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'

describe('staff dashboard layout prefs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('normalizes partial prefs against defaults', () => {
    const prefs = normalizeStaffDashboardLayoutPrefs({
      quick: { chat: false, unknown: true },
      widgets: { unreadChats: false },
    })
    expect(prefs.quick.chat).toBe(false)
    expect(prefs.quick.workouts).toBe(true)
    expect(prefs.widgets.unreadChats).toBe(false)
    expect(prefs.widgets.agendaToday).toBe(true)
  })

  it('falls back to defaults for invalid payloads', () => {
    expect(normalizeStaffDashboardLayoutPrefs(null)).toEqual(STAFF_DASHBOARD_LAYOUT_DEFAULTS)
  })

  it('compares prefs by serialized shape', () => {
    const a = normalizeStaffDashboardLayoutPrefs({ quick: { chat: false } })
    const b = normalizeStaffDashboardLayoutPrefs({ quick: { chat: false } })
    const c = normalizeStaffDashboardLayoutPrefs({ quick: { chat: true } })
    expect(staffDashboardPrefsEqual(a, b)).toBe(true)
    expect(staffDashboardPrefsEqual(a, c)).toBe(false)
  })

  it('loads and saves prefs per profile', () => {
    const prefs = normalizeStaffDashboardLayoutPrefs({ widgets: { lowLessons: false } })
    saveStaffDashboardLayoutPrefs(prefs, PROFILE, '2026-05-12T10:00:00.000Z')
    const loaded = loadStaffDashboardLayoutPrefs(PROFILE)
    expect(loaded.prefs.widgets.lowLessons).toBe(false)
    expect(loaded.savedAt).toBe('2026-05-12T10:00:00.000Z')
  })
})
