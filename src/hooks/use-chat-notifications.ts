'use client'

import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { useNotifications } from './use-notifications'

const logger = createLogger('hooks:use-chat-notifications')

export function useChatNotifications(_userId?: string) {
  const { createNotification } = useNotifications()
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

    profileIdRef.current = profile.id
    return profile.id as string
  }, [])

  // Listen for new chat messages
  useEffect(() => {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload: { new?: Record<string, unknown> }) => {
          const message = payload.new as {
            receiver_id: string
            sender_id: string
            message: string
            type: string
          }

          // Get current user
          const profileId = await getCurrentProfileId()
          if (!profileId) return

          // Only notify if message is for current user
          if (message.receiver_id !== profileId) return

          // Get sender info
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('nome, cognome, role')
            .eq('id', message.sender_id)
            .maybeSingle()

          if (!senderProfile) return

          const senderName = `${senderProfile.nome} ${senderProfile.cognome}`
          const senderRole = senderProfile.role === 'trainer' ? 'Trainer' : 'Staff'

          // Create notification
          await createNotification(
            `💬 Nuovo messaggio da ${senderName}`,
            message.type === 'file'
              ? `📎 Hai ricevuto un file dal tuo ${senderRole}`
              : message.message.length > 40
                ? `${message.message.substring(0, 40)}...`
                : message.message,
            'chat',
            '/home/chat',
            'Rispondi',
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [createNotification, getCurrentProfileId])

  // Send notification when message is sent
  const notifyMessageSent = useCallback(
    async (receiverId: string, message: string, type: 'text' | 'file') => {
      try {
        const currentProfileId = await getCurrentProfileId()
        if (!currentProfileId) return

        // Get receiver info
        const { data: receiverProfile } = await supabase
          .from('profiles')
          .select('nome, cognome, role, user_id')
          .eq('id', receiverId)
          .maybeSingle()

        if (!receiverProfile) return

        const receiverName = `${receiverProfile.nome} ${receiverProfile.cognome}`
        const receiverRole = receiverProfile.role === 'athlete' ? 'athlete' : 'trainer'

        // Create notification for receiver
        await createNotification(
          `💬 Nuovo messaggio da ${receiverName}`,
          type === 'file'
            ? `📎 Hai ricevuto un file dal tuo ${receiverRole}`
            : message.length > 40
              ? `${message.substring(0, 40)}...`
              : message,
          'chat',
          receiverRole === 'athlete' ? '/home/chat' : `/dashboard/atleti/${receiverId}/chat`,
          'Rispondi',
        )
      } catch (error) {
        logger.error('Error sending chat notification', error, { receiverId })
      }
    },
    [createNotification, getCurrentProfileId],
  )

  return {
    notifyMessageSent,
  }
}
