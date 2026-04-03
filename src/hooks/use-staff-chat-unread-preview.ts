'use client'

import { useEffect, useState } from 'react'
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

export function useStaffChatUnreadPreview(enabled = true) {
  const [items, setItems] = useState<StaffChatUnreadItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled) {
      setItems([])
      setLoading(false)
      return
    }
    let cancelled = false
    const run = async () => {
      setLoading(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        if (!cancelled) {
          setItems([])
          setLoading(false)
        }
        return
      }
      const { data, error } = await supabase.rpc('get_conversation_participants', {
        user_uuid: user.id,
      })
      if (cancelled) return
      if (error || !Array.isArray(data)) {
        setItems([])
        setLoading(false)
        return
      }
      const rows = data as RpcRow[]
      const unread = rows
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
      setItems(unread)
      setLoading(false)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [enabled])

  return { items, loading }
}
