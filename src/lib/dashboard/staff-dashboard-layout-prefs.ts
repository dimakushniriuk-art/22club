export const STAFF_DASHBOARD_LAYOUT_STORAGE_KEY = '22club_staff_dashboard_layout_v1'

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

export function loadStaffDashboardLayoutPrefs(): StaffDashboardLayoutPrefs {
  if (typeof window === 'undefined') {
    return {
      quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
      widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
    }
  }
  try {
    const stored = window.localStorage.getItem(STAFF_DASHBOARD_LAYOUT_STORAGE_KEY)
    if (stored == null || stored === '') {
      return {
        quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
        widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
      }
    }
    return normalizeStaffDashboardLayoutPrefs(JSON.parse(stored) as unknown)
  } catch {
    return {
      quick: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.quick },
      widgets: { ...STAFF_DASHBOARD_LAYOUT_DEFAULTS.widgets },
    }
  }
}

export function saveStaffDashboardLayoutPrefs(prefs: StaffDashboardLayoutPrefs): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STAFF_DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore quota / private mode */
  }
}
