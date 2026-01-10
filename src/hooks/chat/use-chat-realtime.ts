import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChatRealtime(onMessageReceived: () => void, onMessageUpdated: () => void) {
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('chat_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `receiver_id=eq.${user.id}`,
          },
          () => {
            if (isMounted) onMessageReceived()
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: `receiver_id=eq.${user.id}`,
          },
          () => {
            if (isMounted) onMessageUpdated()
          },
        )
        .subscribe()

      return () => {
        isMounted = false
        try {
          supabase.removeChannel(channel)
        } catch {}
      }
    })()

    return () => {
      isMounted = false
    }
  }, [supabase, onMessageReceived, onMessageUpdated])
}
