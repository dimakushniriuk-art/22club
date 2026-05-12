import type { Notification } from '@/lib/notifications/fetch-notifications-list'

export type StaffNotificationForTab = {
  id: string
  user_id: string
  title: string
  body: string
  link: string
  type: string
  sent_at: string
  read_at: string | null
  action_text: string
  is_push_sent: boolean
  created_at: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

export function mapStaffNotificationForTab(n: Notification): StaffNotificationForTab {
  const ext = n as Notification & { priority?: 'high' | 'medium' | 'low'; category?: string }
  return {
    ...n,
    link: n.link ?? '',
    sent_at: n.sent_at ?? n.created_at,
    action_text: n.action_text ?? '',
    priority: ext.priority ?? 'medium',
    category: ext.category ?? '',
    read_at: n.read_at ?? null,
  }
}
