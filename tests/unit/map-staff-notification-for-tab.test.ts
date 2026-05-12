import { describe, expect, it } from 'vitest'
import { mapStaffNotificationForTab } from '@/lib/dashboard/map-staff-notification-for-tab'
import type { Notification } from '@/lib/notifications/fetch-notifications-list'

describe('mapStaffNotificationForTab', () => {
  it('fills defaults for optional notification fields', () => {
    const n: Notification = {
      id: 'n1',
      user_id: 'u1',
      title: 'Titolo',
      body: 'Corpo',
      type: 'sistema',
      sent_at: null,
      is_push_sent: false,
      created_at: '2026-05-12T10:00:00.000Z',
    }

    expect(mapStaffNotificationForTab(n)).toEqual({
      ...n,
      link: '',
      sent_at: '2026-05-12T10:00:00.000Z',
      action_text: '',
      priority: 'medium',
      category: '',
      read_at: null,
    })
  })
})
