'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchStaffChatUnreadPreview,
  type StaffChatUnreadItem,
} from '@/lib/chat/fetch-staff-chat-unread-preview'
import { queryKeys } from '@/lib/query-keys'
import { useAuth } from '@/providers/auth-provider'

const STALE_MS = 60 * 1000

export type { StaffChatUnreadItem }

export function useStaffChatUnreadPreview(enabled = true) {
  const { user } = useAuth()
  const profileId = user?.id ?? null

  const queryKey = useMemo(
    () =>
      profileId
        ? queryKeys.chat.staffUnreadPreview(profileId)
        : (['chat', 'staff-unread-preview', '__disabled__'] as const),
    [profileId],
  )

  const query = useQuery({
    queryKey,
    queryFn: fetchStaffChatUnreadPreview,
    enabled: enabled && Boolean(profileId),
    staleTime: STALE_MS,
    placeholderData: (previous) => previous,
  })

  return {
    items: query.data ?? [],
    loading: Boolean(profileId && enabled && query.isPending),
  }
}
