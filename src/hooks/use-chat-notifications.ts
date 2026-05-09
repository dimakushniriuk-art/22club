'use client'

import { useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:use-chat-notifications')

export function useChatNotifications() {
  const profileIdRef = useRef<string | null>(null)

  const getCurrentProfileId = useCallback(async () => {
    if (profileIdRef.current) {
      return profileIdRef.current
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile?.id) return null

    profileIdRef.current = profile.id as string
    return profileIdRef.current
  }, [])

  /**
   * Notifica il destinatario dopo invio messaggio.
   * INSERT su `notifications` con `user_id` = auth del destinatario viola RLS dal browser:
   * si usa `POST /api/notifications/chat` (service role dopo verifica `chat_messages`).
   */
  const notifyMessageSent = useCallback(
    async (receiverId: string, message: string, type: 'text' | 'file') => {
      try {
        const currentProfileId = await getCurrentProfileId()
        if (!currentProfileId) return

        const { data: receiverProfile } = await supabase
          .from('profiles')
          .select('nome, cognome, role, user_id')
          .eq('id', receiverId)
          .maybeSingle()

        if (!receiverProfile?.user_id) return

        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('nome, cognome')
          .eq('id', currentProfileId)
          .maybeSingle()
        if (!senderProfile) return

        const senderName = `${senderProfile.nome} ${senderProfile.cognome}`
        const receiverRole = receiverProfile.role === 'athlete' ? 'athlete' : 'trainer'

        const title = `💬 Nuovo messaggio da ${senderName}`
        const body =
          type === 'file'
            ? `📎 Hai ricevuto un file dal tuo ${receiverRole}`
            : message.length > 40
              ? `${message.substring(0, 40)}...`
              : message
        const link =
          receiverRole === 'athlete' ? '/home/chat' : `/dashboard/atleti/${receiverId}/chat`

        const res = await fetch('/api/notifications/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            recipientAuthUserId: receiverProfile.user_id,
            title,
            body,
            link,
            actionText: 'Rispondi',
          }),
        })

        const json = (await res.json().catch(() => ({}))) as { error?: string }
        if (!res.ok) {
          logger.warn('Chat notify API failed', {
            status: res.status,
            error: json.error,
            receiverId,
          })
        }
      } catch (error) {
        logger.error('Error sending chat notification', error, { receiverId })
      }
    },
    [getCurrentProfileId],
  )

  return {
    notifyMessageSent,
  }
}
