export const STAFF_DASHBOARD_LAYOUT_STORAGE_KEY = '22club_staff_dashboard_layout_v1'

function staffDashboardLayoutStorageKey(profileId?: string | null): string {
  return `${STAFF_DASHBOARD_LAYOUT_STORAGE_KEY}:${profileId ?? 'anon'}`
}

function staffDashboardLayoutSavedAtKey(profileId?: string | null): string {
  return `${staffDashboardLayoutStorageKey(profileId)}:savedAt`
}

export const STAFF_DASHBOARD_QUICK_IDS = [
  'workouts',
  'calendar',
  'bookings',
  'clients',
  'chat',
  'stats',
  'programs',
  'newAppointment',
  'subscriptions',
  'inviteClient',
  'communications',
  'settings',
] as const

export type StaffDashboardQuickActionId = (typeof STAFF_DASHBOARD_QUICK_IDS)[number]

export const STAFF_DASHBOARD_WIDGET_IDS = [
  'agendaToday',
  'expiringPrograms',
  'lowLessons',
  'unreadChats',
] as const

export type StaffDashboardWidgetId = (typeof STAFF_DASHBOARD_WIDGET_IDS)[number]

export type StaffDashboardLayoutPrefs = {
  quick: Record<StaffDashboardQuickActionId, boolean>
  widgets: Record<StaffDashboardWidgetId, boolean>
}

export const STAFF_DASHBOARD_LAYOUT_DEFAULTS: StaffDashboardLayoutPrefs = {
  quick: {
    workouts: true,
    calendar: true,
    bookings: true,
    clients: true,
    chat: true,
    stats: true,
    programs: true,
    newAppointment: true,
    subscriptions: true,
    inviteClient: true,
    communications: true,
    settings: true,
  },
  widgets: {
    agendaToday: true,
    expiringPrograms: true,
    lowLessons: true,
    unreadChats: true,
  },
}

function mergeQuick(
  partial: unknown,
  base: StaffDashboardLayoutPrefs['quick'],
): StaffDashboardLayoutPrefs['quick'] {
  if (partial == null || typeof partial !== 'object') return base
  const next = { ...base }
  for (const id of STAFF_DASHBOARD_QUICK_IDS) {
    const v = (partial as Record<string, unknown>)[id]
    if (typeof v === 'boolean') next[id] = v
  }
  return next
}

function mergeWidgets(
  partial: unknown,
  base: StaffDashboardLayoutPrefs['widgets'],
): StaffDashboardLayoutPrefs['widgets'] {
  if (partial == null || typeof partial !== 'object') return base
  const next = { ...base }
  for (const id of STAFF_DASHBOARD_WIDGET_IDS) {
    const v = (partial as Record<string, unknown>)[id]
    if (typeof v === 'boolean') next[id] = v
  }
  return next
}

export function staffDashboardPrefsEqual(
  a: StaffDashboardLayoutPrefs,
  b: StaffDashboardLayoutPrefs,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function normalizeStaffDashboardLayoutPrefs(raw: unknown): StaffDashboardLayoutPrefs {
  if (raw == null || typeof raw !== 'object') {
    return {
      quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
      widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
    }
  }
  const o = raw as Record<string, unknown>
  return {
    quick: mergeQuick(o.quick, STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick),
    widgets: mergeWidgets(o.widgets, STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets),
  }
}

export function loadStaffDashboardLayoutPrefs(profileId?: string | null): {
  prefs: StaffDashboardLayoutPrefs
  savedAt: string | null
} {
  if (typeof window === 'undefined') {
    return {
      prefs: {
        quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
        widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
      },
      savedAt: null,
    }
  }
  try {
    const key = staffDashboardLayoutStorageKey(profileId)
    const stored = window.localStorage.getItem(key)
    const savedAt = window.localStorage.getItem(staffDashboardLayoutSavedAtKey(profileId))

    if (stored != null && stored !== '') {
      return { prefs: normalizeStaffDashboardLayoutPrefs(JSON.parse(stored) as unknown), savedAt }
    }

    // Legacy fallback (pre per-profile storage)
    const legacy = window.localStorage.getItem(STAFF_DASHBOARD_LAYOUT_STORAGE_KEY)
    if (legacy != null && legacy !== '') {
      const prefs = normalizeStaffDashboardLayoutPrefs(JSON.parse(legacy) as unknown)
      // Migrate forward to per-profile key (best effort)
      try {
        window.localStorage.setItem(key, JSON.stringify(prefs))
        if (savedAt) window.localStorage.setItem(staffDashboardLayoutSavedAtKey(profileId), savedAt)
      } catch {
        /* ignore */
      }
      return { prefs, savedAt: null }
    }

    return {
      prefs: {
        quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
        widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
      },
      savedAt: null,
    }
  } catch {
    return {
      prefs: {
        quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
        widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
      },
      savedAt: null,
    }
  }
}

export function saveStaffDashboardLayoutPrefs(
  prefs: StaffDashboardLayoutPrefs,
  profileId?: string | null,
  savedAt?: string,
): void {
  if (typeof window === 'undefined') return
  try {
    const now = savedAt ?? new Date().toISOString()
    window.localStorage.setItem(staffDashboardLayoutStorageKey(profileId), JSON.stringify(prefs))
    window.localStorage.setItem(staffDashboardLayoutSavedAtKey(profileId), now)
  } catch {
    /* ignore quota / private mode */
  }
}
