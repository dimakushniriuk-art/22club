import { createClient } from '@/lib/supabase/client'

export type StaffChatUnreadItem = {
  other_user_id: string
  other_user_name: string
  unread_count: number
  last_message_at: string
}

type RpcRow = {
  other_user_id: string
  other_user_name: string
  unread_count: number
  last_message_at?: string
}

export async function fetchStaffChatUnreadPreview(): Promise<StaffChatUnreadItem[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.rpc('get_conversation_participants', {
    user_uuid: user.id,
  })
  if (error || !Array.isArray(data)) return []

  const rows = data as RpcRow[]
  return rows
    .filter((r) => (r.unread_count ?? 0) > 0)
    .map((r) => ({
      other_user_id: r.other_user_id,
      other_user_name: (r.other_user_name ?? 'Utente').trim() || 'Utente',
      unread_count: r.unread_count ?? 0,
      last_message_at: r.last_message_at ?? '',
    }))
    .sort((a, b) => {
      const du = b.unread_count - a.unread_count
      if (du !== 0) return du
      const ta = new Date(a.last_message_at).getTime()
      const tb = new Date(b.last_message_at).getTime()
      return tb - ta
    })
}
