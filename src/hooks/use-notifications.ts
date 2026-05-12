'use client'

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { NotificationType } from '@/lib/notifications/types'
import { isLikelyNetworkFetchFailure } from '@/lib/is-network-fetch-error'
import {
  enqueuePendingWrite,
  notificationMarkAllReadIdempotencyKey,
  notificationMarkReadIdempotencyKey,
} from '@/lib/session-stability/pending-write-queue'
import { notifyInfo } from '@/lib/notifications'
import {
  fetchNotificationsList,
  type Notification,
} from '@/lib/notifications/fetch-notifications-list'
import { queryKeys } from '@/lib/query-keys'
import { invalidateStaffNotificationsListQueries } from '@/lib/react-query/post-mutation-cache'

const logger = createLogger('hooks:use-notifications')

export type { Notification }

interface UseNotificationsProps {
  userId?: string | null
  enabled?: boolean
}

const STALE_MS = 2 * 60 * 1000

export function useNotifications({ userId, enabled = true }: UseNotificationsProps = {}) {
  const queryClient = useQueryClient()

  const queryKey = useMemo(
    () =>
      userId
        ? queryKeys.notifications.staffList(userId)
        : (['notifications', 'staff-list', '__disabled__'] as const),
    [userId],
  )

  const query = useQuery({
    queryKey,
    queryFn: () => fetchNotificationsList(userId!),
    enabled: Boolean(userId) && enabled,
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  const notifications = query.data ?? []
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read_at).length,
    [notifications],
  )
  const loading = Boolean(userId && query.isPending)
  const error = query.error instanceof Error ? query.error.message : null

  const fetchNotifications = useCallback(async () => {
    await invalidateStaffNotificationsListQueries(queryClient, userId)
  }, [queryClient, userId])

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        if (!userId) throw new Error('User ID is required')

        const { error: updateError } = await supabase
          .from('notifications')
          .update({
            read_at: new Date().toISOString(),
          })
          .eq('id', notificationId)
          .eq('user_id', userId)

        if (updateError) throw updateError

        queryClient.setQueryData<Notification[]>(queryKey, (prev) =>
          (prev ?? []).map((n) =>
            n.id === notificationId
              ? { ...n, read_at: n.read_at || new Date().toISOString() }
              : n,
          ),
        )
      } catch (err) {
        if (isLikelyNetworkFetchFailure(err) && userId) {
          enqueuePendingWrite({
            kind: 'notifications_mark_read',
            idempotencyKey: notificationMarkReadIdempotencyKey(userId, notificationId),
            payload: { userId, notificationId },
          })
          notifyInfo(
            'Connessione instabile',
            'Segna come letta in coda: verrà inviato al ripristino della rete.',
          )
          return
        }
        logger.error('Error marking notification as read', err, { notificationId })
        throw err
      }
    },
    [queryClient, queryKey, userId],
  )

  const markAllAsRead = useCallback(async () => {
    try {
      if (!userId) throw new Error('User ID is required')

      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .is('read_at', null)

      if (updateError) throw updateError

      const readAt = new Date().toISOString()
      queryClient.setQueryData<Notification[]>(queryKey, (prev) =>
        (prev ?? []).map((n) => ({
          ...n,
          read_at: n.read_at || readAt,
        })),
      )
    } catch (err) {
      if (isLikelyNetworkFetchFailure(err) && userId) {
        enqueuePendingWrite({
          kind: 'notifications_mark_all_read',
          idempotencyKey: notificationMarkAllReadIdempotencyKey(userId),
          payload: { userId },
        })
        notifyInfo(
          'Connessione instabile',
          'Segna tutte come lette in coda: verrà inviato al ripristino della rete.',
        )
        return
      }
      logger.error('Error marking all notifications as read', err, { userId })
      throw err
    }
  }, [queryClient, queryKey, userId])

  const createNotification = useCallback(
    async (
      title: string,
      body: string,
      type: Notification['type'],
      link?: string,
      actionText?: string,
      options?: { recipientUserId?: string | null },
    ) => {
      const raw = options?.recipientUserId
      const recipient = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null
      const targetUserId = recipient ?? userId ?? null
      if (!targetUserId) {
        throw new Error('User ID is required to create notification')
      }

      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          title,
          body,
          type,
          link,
          action_text: actionText,
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (userId && targetUserId === userId) {
        queryClient.setQueryData<Notification[]>(queryKey, (prev) => [
          data as Notification,
          ...(prev ?? []),
        ])
      }

      return data
    },
    [queryClient, queryKey, userId],
  )

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!userId) throw new Error('User ID is required')

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      queryClient.setQueryData<Notification[]>(queryKey, (prev) =>
        (prev ?? []).filter((n) => n.id !== notificationId),
      )
    },
    [queryClient, queryKey, userId],
  )

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n) => !n.read_at)
  }, [notifications])

  const getNotificationsByType = useCallback(
    (type: NotificationType) => {
      return notifications.filter((n) => n.type === type)
    },
    [notifications],
  )

  const hasUnread = unreadCount > 0

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasUnread,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    getUnreadNotifications,
    getNotificationsByType,
  }
}
