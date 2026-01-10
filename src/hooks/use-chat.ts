'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import { localStorageCache } from '@/lib/cache/local-storage-cache'
import { useChatNotifications } from './use-chat-notifications'
import { useChatProfile } from './chat/use-chat-profile'
import { useChatConversations } from './chat/use-chat-conversations'
import { useChatMessages } from './chat/use-chat-messages'
import { useChatRealtimeOptimized } from './chat/use-chat-realtime-optimized'
import { createLogger } from '@/lib/logger'
import type { ChatState, ChatConversation } from '@/types/chat'
import type { ConversationParticipant } from '@/types/chat'

const logger = createLogger('hooks:use-chat')

/**
 * Hook principale per la gestione della chat
 *
 * ARCHITETTURA SEMPLIFICATA:
 * - Separazione chiara tra conversazioni e messaggi
 * - Preservazione automatica dei messaggi durante gli aggiornamenti
 * - Evita race conditions usando ref e debounce
 * - Non chiama fetchConversations se c'è già una conversazione con messaggi
 */
export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversation: null,
    isLoading: false,
    error: null,
  })

  const supabase = createClient()
  const { notifyMessageSent } = useChatNotifications()
  const { currentProfileId, getCurrentProfileId } = useChatProfile()

  // Ref per accedere allo stato corrente nelle callback realtime
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Callback per aggiornare le conversazioni preservando i messaggi
  const handleConversationsSuccess = useCallback((conversations: ConversationParticipant[]) => {
    setState((prev) => {
      // PRESERVA SEMPRE currentConversation quando aggiorniamo conversations
      // Questo è CRITICO per evitare che i messaggi vengano persi
      const preservedConversation = prev.currentConversation
        ? {
            ...prev.currentConversation,
            participant: { ...prev.currentConversation.participant },
            messages:
              prev.currentConversation.messages.length > 0
                ? [...prev.currentConversation.messages] // Deep copy
                : [],
          }
        : null

      return {
        ...prev,
        conversations,
        isLoading: false,
        currentConversation: preservedConversation,
      }
    })
  }, [])

  const handleConversationsError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      error,
      isLoading: false,
      // PRESERVA currentConversation anche in caso di errore
      currentConversation: prev.currentConversation,
    }))
  }, [])

  // Hook per gestione conversazioni
  const { fetchConversations: fetchConversationsInternal } = useChatConversations(
    getCurrentProfileId,
    handleConversationsSuccess,
    handleConversationsError,
  )

  // Ref per memorizzare la funzione e evitare loop infiniti
  const fetchConversationsInternalRef = useRef(fetchConversationsInternal)
  useEffect(() => {
    fetchConversationsInternalRef.current = fetchConversationsInternal
  }, [fetchConversationsInternal])

  /**
   * Fetch conversazioni - preserva sempre i messaggi esistenti
   */
  const fetchConversations = useCallback(async () => {
    setState((prev) => {
      // PRESERVA currentConversation quando imposti isLoading
      const preservedConversation = prev.currentConversation
        ? {
            ...prev.currentConversation,
            participant: { ...prev.currentConversation.participant },
            messages: [...prev.currentConversation.messages], // Deep copy
          }
        : null

      return {
        ...prev,
        isLoading: true,
        error: null,
        currentConversation: preservedConversation,
      }
    })
    await fetchConversationsInternalRef.current()
  }, [])

  // Hook per gestione messaggi
  const {
    fetchMessages: fetchMessagesInternal,
    sendMessage: sendMessageInternal,
    markAsRead: markAsReadInternal,
    deleteMessage: deleteMessageInternal,
  } = useChatMessages(
    getCurrentProfileId,
    state.conversations,
    (otherUserId, messages, hasMore, isLoading) => {
      setState((prev) => {
        const participant = prev.conversations.find(
          (conversation) => conversation.other_user_id === otherUserId,
        ) ?? {
          other_user_id: otherUserId,
          other_user_name: 'Utente',
          other_user_role: 'unknown',
          last_message_at: new Date().toISOString(),
          unread_count: 0,
        }

        // Preserva i messaggi esistenti se i nuovi sono vuoti
        const isSameConversation =
          prev.currentConversation?.participant.other_user_id === otherUserId
        const existingMessages = isSameConversation
          ? (prev.currentConversation?.messages ?? [])
          : []

        // Se abbiamo nuovi messaggi, usali. Altrimenti, preserva quelli esistenti
        const combinedMessages = messages.length > 0 ? messages : existingMessages

        return {
          ...prev,
          currentConversation: {
            participant,
            messages: combinedMessages,
            isLoading,
            hasMore,
          },
        }
      })
    },
    (error) => {
      setState((prev) => ({
        ...prev,
        error,
        currentConversation: prev.currentConversation
          ? {
              ...prev.currentConversation,
              isLoading: false,
            }
          : null,
      }))
    },
  )

  // Ref per fetchMessages per evitare dipendenze nelle callback realtime
  const fetchMessagesRef = useRef(fetchMessagesInternal)
  useEffect(() => {
    fetchMessagesRef.current = fetchMessagesInternal
  }, [fetchMessagesInternal])

  /**
   * Fetch messaggi - preserva sempre i messaggi esistenti
   */
  const fetchMessages = useCallback(
    async (otherUserId: string, limit = 50, offset = 0) => {
      // Preserva i messaggi esistenti prima di fare il fetch
      const existingMessages =
        state.currentConversation?.participant.other_user_id === otherUserId
          ? (state.currentConversation.messages ?? [])
          : []

      // Aggiorna solo isLoading senza resettare i messaggi
      setState((prev) => {
        // Se stiamo già visualizzando questa conversazione, preserva tutto
        if (prev.currentConversation?.participant.other_user_id === otherUserId) {
          return {
            ...prev,
            currentConversation: {
              ...prev.currentConversation,
              isLoading: true,
              messages: [...prev.currentConversation.messages], // Deep copy
            },
          }
        }
        // Altrimenti, non modificare lo stato (la conversazione verrà creata da onMessageUpdate)
        return prev
      })

      await fetchMessagesInternal(otherUserId, limit, offset, existingMessages)
    },
    [fetchMessagesInternal, state.currentConversation],
  )

  // Send a message
  const sendMessage = useCallback(
    async (
      receiverId: string,
      message: string,
      type: 'text' | 'file' = 'text',
      fileUrl?: string,
      fileName?: string,
      fileSize?: number,
    ) => {
      const result = await sendMessageInternal(
        receiverId,
        message,
        type,
        fileUrl,
        fileName,
        fileSize,
        (formattedMessage) => {
          setState((prev) => {
            if (!prev.currentConversation) {
              return prev
            }

            return {
              ...prev,
              currentConversation: {
                ...prev.currentConversation,
                messages: [...prev.currentConversation.messages, formattedMessage],
              },
            }
          })
        },
      )

      // Invalidare cache conversazioni e messaggi quando si invia un messaggio
      const profileId = await getCurrentProfileId()
      frequentQueryCache.invalidate(`chat-conversations:${profileId}`)
      frequentQueryCache.invalidate(`chat-messages:${profileId}:${receiverId}:50:0`)

      // Refresh conversations list (preserva messaggi)
      await fetchConversations()

      // Send notification
      notifyMessageSent(receiverId, message, type)

      return result
    },
    [sendMessageInternal, fetchConversations, notifyMessageSent, getCurrentProfileId],
  )

  // Mark messages as read
  const markAsRead = useCallback(
    async (otherUserId: string) => {
      const currentMessages = state.currentConversation?.messages ?? []
      await markAsReadInternal(
        otherUserId,
        (updatedMessages) => {
          setState((prev) => {
            const updatedConversations = prev.conversations.map((conv) =>
              conv.other_user_id === otherUserId ? { ...conv, unread_count: 0 } : conv,
            )

            return {
              ...prev,
              conversations: updatedConversations,
              currentConversation: prev.currentConversation
                ? {
                    ...prev.currentConversation,
                    messages: updatedMessages,
                  }
                : null,
            }
          })
        },
        currentMessages,
      )
    },
    [markAsReadInternal, state.currentConversation],
  )

  // Delete a message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!state.currentConversation) {
        logger.warn('Cannot delete message: no current conversation')
        return false
      }

      logger.debug('Deleting message', {
        messageId,
        currentConversationId: state.currentConversation.participant.other_user_id,
        messagesCount: state.currentConversation.messages.length,
      })

      try {
        // Prima rimuovi dallo stato locale per feedback immediato
        setState((prev) => {
          if (!prev.currentConversation) {
            return prev
          }

          const filteredMessages = prev.currentConversation.messages.filter(
            (msg) => msg.id !== messageId,
          )

          logger.debug('Removing message from local state', {
            messageId,
            beforeCount: prev.currentConversation.messages.length,
            afterCount: filteredMessages.length,
          })

          return {
            ...prev,
            currentConversation: {
              ...prev.currentConversation,
              messages: filteredMessages,
            },
          }
        })

        // Poi elimina dal database
        await deleteMessageInternal(messageId)

        logger.debug('Message deleted from database', { messageId })

        // Invalidare cache conversazioni
        const profileId = await getCurrentProfileId()
        frequentQueryCache.invalidate(`chat-conversations:${profileId}`)
        frequentQueryCache.invalidate(`chat-messages:${profileId}:*`)

        // Refresh conversations list
        await fetchConversations()

        return true
      } catch (error) {
        logger.error('Error deleting message', error, { messageId })

        // Ripristina il messaggio nello stato se l'eliminazione fallisce
        setState((prev) => {
          if (!prev.currentConversation) {
            return prev
          }

          // Ricarica i messaggi per ripristinare lo stato corretto
          void fetchMessages(prev.currentConversation.participant.other_user_id)

          return prev
        })

        throw error // Rilancia l'errore per gestirlo nel componente
      }
    },
    [
      deleteMessageInternal,
      state.currentConversation,
      fetchConversations,
      getCurrentProfileId,
      fetchMessages,
    ],
  )

  // Upload file for chat
  const uploadFile = useCallback(
    async (file: File) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Utente non autenticato')

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const filePath = `chat_files/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('documents').getPublicUrl(filePath)

        return {
          url: publicUrl,
          name: file.name,
          size: file.size,
        }
      } catch {
        throw new Error('Errore nel caricamento del file')
      }
    },
    [supabase],
  )

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!state.currentConversation?.hasMore || state.currentConversation.isLoading) return

    await fetchMessages(
      state.currentConversation.participant.other_user_id,
      50,
      state.currentConversation.messages.length,
    )
  }, [state.currentConversation, fetchMessages])

  // Set current conversation
  const setCurrentConversation = useCallback(
    async (otherUserId: string) => {
      logger.debug('Setting current conversation', {
        otherUserId,
        currentOtherUserId: state.currentConversation?.participant.other_user_id,
        hasCurrentMessages: state.currentConversation?.messages.length ?? 0,
      })

      // Se stiamo già visualizzando questa conversazione e abbiamo messaggi, non rifare il fetch
      if (
        state.currentConversation?.participant.other_user_id === otherUserId &&
        state.currentConversation.messages.length > 0
      ) {
        logger.debug('Conversation already selected with messages, skipping fetch', {
          otherUserId,
          messagesCount: state.currentConversation.messages.length,
        })
        // Mark as read se necessario
        await markAsRead(otherUserId)
        return
      }

      try {
        await fetchMessages(otherUserId)
        // Mark as read dopo che i messaggi sono stati caricati
        await markAsRead(otherUserId)
      } catch (error) {
        logger.error('Error setting current conversation', error, { otherUserId })
        throw error
      }
    },
    [fetchMessages, markAsRead, state.currentConversation],
  )

  // Clear current conversation (non utilizzato al momento, ma disponibile per uso futuro)
  // const clearCurrentConversation = useCallback(async () => {
  //   // Invalida cache quando si cancella la conversazione
  //   try {
  //     const profileId = await getCurrentProfileId()
  //     if (profileId) {
  //       const cacheKey = `chat-current-conversation:${profileId}`
  //       localStorageCache.delete(cacheKey)
  //     }
  //   } catch (error) {
  //     logger.error('Error clearing conversation cache', error)
  //   }
  //
  //   setState((prev) => ({
  //     ...prev,
  //     currentConversation: null,
  //   }))
  // }, [getCurrentProfileId])

  // Ref per debounce delle chiamate realtime a fetchMessages
  const fetchMessagesTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFetchingMessagesRef = useRef(false)

  // Cleanup del timeout quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (fetchMessagesTimeoutRef.current) {
        clearTimeout(fetchMessagesTimeoutRef.current)
      }
    }
  }, [])

  // Real-time subscriptions (ottimizzate)
  useChatRealtimeOptimized(
    () => {
      // Invalidare cache conversazioni quando si riceve nuovo messaggio
      if (currentProfileId) {
        frequentQueryCache.invalidate(`chat-conversations:${currentProfileId}`)
      }

      // Se stiamo visualizzando una conversazione, aggiorna anche i messaggi
      const currentOtherUserId = stateRef.current.currentConversation?.participant.other_user_id
      if (currentOtherUserId && !isFetchingMessagesRef.current) {
        // Debounce: evita chiamate multiple simultanee
        if (fetchMessagesTimeoutRef.current) {
          clearTimeout(fetchMessagesTimeoutRef.current)
        }

        fetchMessagesTimeoutRef.current = setTimeout(() => {
          isFetchingMessagesRef.current = true
          fetchMessagesRef
            .current(currentOtherUserId)
            .then(() => {
              isFetchingMessagesRef.current = false
            })
            .catch((error) => {
              logger.error('Error fetching messages from realtime', error, {
                otherUserId: currentOtherUserId,
              })
              isFetchingMessagesRef.current = false
            })
        }, 300) // Debounce di 300ms
      }

      // NON chiamare fetchConversations se stiamo visualizzando una conversazione con messaggi
      // perché questo può resettare i messaggi. fetchMessages aggiorna già i messaggi.
      const shouldFetchConversations =
        !currentOtherUserId ||
        !stateRef.current.currentConversation ||
        (stateRef.current.currentConversation.messages?.length ?? 0) === 0

      if (shouldFetchConversations) {
        void fetchConversations()
      }
    },
    () => {
      // Invalidare cache conversazioni quando si aggiorna messaggio (es. read_at)
      if (currentProfileId) {
        frequentQueryCache.invalidate(`chat-conversations:${currentProfileId}`)
      }

      // Se stiamo visualizzando una conversazione, aggiorna anche i messaggi
      const currentOtherUserId = stateRef.current.currentConversation?.participant.other_user_id
      if (currentOtherUserId && !isFetchingMessagesRef.current) {
        // Debounce: evita chiamate multiple simultanee
        if (fetchMessagesTimeoutRef.current) {
          clearTimeout(fetchMessagesTimeoutRef.current)
        }

        fetchMessagesTimeoutRef.current = setTimeout(() => {
          isFetchingMessagesRef.current = true
          fetchMessagesRef
            .current(currentOtherUserId)
            .then(() => {
              isFetchingMessagesRef.current = false
            })
            .catch((error) => {
              logger.error('Error fetching messages from realtime', error, {
                otherUserId: currentOtherUserId,
              })
              isFetchingMessagesRef.current = false
            })
        }, 300) // Debounce di 300ms
      }

      // NON chiamare fetchConversations se stiamo visualizzando una conversazione con messaggi
      const shouldFetchConversations =
        !currentOtherUserId ||
        !stateRef.current.currentConversation ||
        (stateRef.current.currentConversation.messages?.length ?? 0) === 0

      if (shouldFetchConversations) {
        void fetchConversations()
      }
    },
    () => {
      // Quando un messaggio viene eliminato, aggiorna i messaggi della conversazione corrente
      const currentOtherUserId = stateRef.current.currentConversation?.participant.other_user_id
      if (currentOtherUserId && !isFetchingMessagesRef.current) {
        // Debounce: evita chiamate multiple simultanee
        if (fetchMessagesTimeoutRef.current) {
          clearTimeout(fetchMessagesTimeoutRef.current)
        }

        fetchMessagesTimeoutRef.current = setTimeout(() => {
          isFetchingMessagesRef.current = true
          fetchMessagesRef
            .current(currentOtherUserId)
            .then(() => {
              isFetchingMessagesRef.current = false
            })
            .catch((error) => {
              logger.error('Error fetching messages after delete', error, {
                otherUserId: currentOtherUserId,
              })
              isFetchingMessagesRef.current = false
            })
        }, 300) // Debounce di 300ms
      }

      // Invalidare cache
      if (currentProfileId) {
        frequentQueryCache.invalidate(`chat-conversations:${currentProfileId}`)
        frequentQueryCache.invalidate(`chat-messages:${currentProfileId}:*`)
      }
    },
  )

  // Ripristina currentConversation da localStorage al mount (per preservare messaggi durante refresh)
  useEffect(() => {
    const restoreFromCache = async () => {
      try {
        const profileId = await getCurrentProfileId()
        if (!profileId) return

        const cacheKey = `chat-current-conversation:${profileId}`
        const cachedConversation = localStorageCache.get<ChatConversation>(cacheKey)

        if (cachedConversation && cachedConversation.messages.length > 0) {
          setState((prev) => ({
            ...prev,
            currentConversation: cachedConversation,
          }))
        }
      } catch (error) {
        logger.error('Error restoring conversation from cache', error)
      }
    }

    void restoreFromCache()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Esegui solo al mount

  // Salva currentConversation in localStorage quando viene aggiornato
  useEffect(() => {
    const saveToCache = async () => {
      if (!state.currentConversation || state.currentConversation.messages.length === 0) return

      try {
        const profileId = await getCurrentProfileId()
        if (!profileId) return

        const cacheKey = `chat-current-conversation:${profileId}`
        // Salva con TTL di 1 ora (sufficiente per preservare durante refresh)
        localStorageCache.set(cacheKey, state.currentConversation, 60 * 60 * 1000)
      } catch (error) {
        logger.error('Error saving conversation to cache', error)
      }
    }

    void saveToCache()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentConversation])

  // Initialize conversations on mount (solo se non c'è già una conversazione con messaggi)
  useEffect(() => {
    // NON chiamare fetchConversations se c'è già una conversazione con messaggi
    // perché questo può resettare i messaggi durante il refresh
    const shouldFetchConversations =
      !state.currentConversation || (state.currentConversation.messages?.length ?? 0) === 0

    if (shouldFetchConversations) {
      void fetchConversations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Esegui solo al mount

  return {
    conversations: state.conversations,
    currentConversation: state.currentConversation,
    sendMessage,
    uploadFile,
    deleteMessage,
    setCurrentConversation,
    loadMoreMessages,
    isLoading: state.isLoading,
    error: state.error,
    fetchConversations,
    currentProfileId,
  }
}
