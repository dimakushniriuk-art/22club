'use client'

import { useState, useEffect, useRef } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:use-chat-hidden-conversations')
const CHAT_HIDDEN_STORAGE_PREFIX = 'chat-hidden-'

export type UseChatHiddenConversationsOptions = {
  profileId: string | null
  withParam: string | null
  setSelectedConversationId: (id: string | null) => void
  setCurrentConversation: (userId: string) => Promise<unknown>
}

/**
 * Gestisce le conversazioni nascoste: stato, persistenza su localStorage (per profilo),
 * e ripristino quando si apre da ?with= (rimuove from hidden e apre la conversazione).
 */
export function useChatHiddenConversations({
  profileId,
  withParam,
  setSelectedConversationId,
  setCurrentConversation,
}: UseChatHiddenConversationsOptions): {
  hiddenConversationIds: Set<string>
  setHiddenConversationIds: React.Dispatch<React.SetStateAction<Set<string>>>
} {
  const [hiddenConversationIds, setHiddenConversationIds] = useState<Set<string>>(new Set())
  const processedWithParamRef = useRef<string | null>(null)

  useEffect(() => {
    if (!profileId) return
    try {
      const raw = localStorage.getItem(CHAT_HIDDEN_STORAGE_PREFIX + profileId)
      if (raw) {
        const arr = JSON.parse(raw) as string[]
        if (Array.isArray(arr)) setHiddenConversationIds(new Set(arr))
      }
    } catch {
      /* ignore */
    }
  }, [profileId])

  useEffect(() => {
    if (!profileId) return
    try {
      localStorage.setItem(
        CHAT_HIDDEN_STORAGE_PREFIX + profileId,
        JSON.stringify([...hiddenConversationIds]),
      )
    } catch {
      /* ignore */
    }
  }, [profileId, hiddenConversationIds])

  useEffect(() => {
    if (!withParam || processedWithParamRef.current === withParam) return
    processedWithParamRef.current = withParam
    setHiddenConversationIds((prev) => {
      const next = new Set(prev)
      next.delete(withParam)
      return next
    })
    setSelectedConversationId(withParam)
    setCurrentConversation(withParam).catch((err) =>
      logger.error('Error opening conversation from ?with=', err, { withId: withParam }),
    )
  }, [withParam, setSelectedConversationId, setCurrentConversation])

  return { hiddenConversationIds, setHiddenConversationIds }
}
