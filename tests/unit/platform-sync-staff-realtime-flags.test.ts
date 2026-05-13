import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('staff dashboard realtime flags', () => {
  const originalDisable = process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE
  const originalGlobal = process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    if (originalDisable === undefined) {
      delete process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE
    } else {
      process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE = originalDisable
    }
    if (originalGlobal === undefined) {
      delete process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME
    } else {
      process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME = originalGlobal
    }
  })

  it('disables only listed tables when global realtime is on', async () => {
    delete process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME
    process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE = ' appointments , PROFILES '

    const { isStaffDashboardRealtimeEnabled, isStaffDashboardRealtimeTableEnabled } =
      await import('@/lib/session-stability/platform-sync-constants')

    expect(isStaffDashboardRealtimeEnabled()).toBe(true)
    expect(isStaffDashboardRealtimeTableEnabled('appointments')).toBe(false)
    expect(isStaffDashboardRealtimeTableEnabled('profiles')).toBe(false)
    expect(isStaffDashboardRealtimeTableEnabled('notifications')).toBe(true)
  })

  it('global off disables all tables regardless of disable list', async () => {
    process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME = '0'
    process.env.NEXT_PUBLIC_STAFF_DASHBOARD_REALTIME_DISABLE = 'notifications'

    const { isStaffDashboardRealtimeTableEnabled } =
      await import('@/lib/session-stability/platform-sync-constants')

    expect(isStaffDashboardRealtimeTableEnabled('notifications')).toBe(false)
    expect(isStaffDashboardRealtimeTableEnabled('appointments')).toBe(false)
  })
})
