import { supabase } from '@/lib/supabase/client'
import type { NotificationType } from '@/lib/notifications/types'

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  link?: string | null
  type: NotificationType
  sent_at: string | null
  read_at?: string | null
  action_text?: string | null
  is_push_sent: boolean
  created_at: string
}

export async function fetchNotificationsList(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Notification[]
}
