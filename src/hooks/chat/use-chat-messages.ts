import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import type { ChatMessage, ConversationParticipant } from '@/types/chat'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:chat:use-chat-messages')

type ChatMessageRecord = {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  type: string
  file_url?: string | null
  file_name?: string | null
  file_size?: number | null
  read_at?: string | null
  created_at: string
}

type NewMessagePayload = {
  sender_id: string
  receiver_id: string
  message: string
  type: 'text' | 'file' | 'system'
  file_url?: string
  file_name?: string
  file_size?: number
}

export function useChatMessages(
  getCurrentProfileId: () => Promise<string>,
  conversations: ConversationParticipant[],
  onMessageUpdate: (
    otherUserId: string,
    messages: ChatMessage[],
    hasMore: boolean,
    isLoading: boolean,
  ) => void,
  onError: (error: string) => void,
) {
  const supabase = createClient()

  const fetchMessages = useCallback(
    async (otherUserId: string, limit = 50, offset = 0, existingMessages: ChatMessage[] = []) => {
      // Dichiarati fuori dal try per essere accessibili nel catch
      let profileId: string | null = null
      let cachedMessages: ChatMessage[] | null = null

      try {
        profileId = await getCurrentProfileId()

        // Check cache solo per la prima pagina (offset = 0)
        if (profileId) {
          if (offset === 0) {
            const cacheKey = `chat-messages:${profileId}:${otherUserId}:50:0`
            cachedMessages = frequentQueryCache.get<ChatMessage[]>(cacheKey)
            if (cachedMessages && cachedMessages.length > 0) {
              // Serve dati dalla cache immediatamente (stale-while-revalidate)
              onMessageUpdate(otherUserId, cachedMessages, false, false)
              // Continuiamo con il fetch in background per aggiornare
            } else if (existingMessages.length === 0) {
              // Solo se non ci sono messaggi dalla cache e non ci sono messaggi esistenti, mostra loading
              onMessageUpdate(otherUserId, existingMessages, false, true)
            }
          } else if (existingMessages.length === 0) {
            // Per pagine successive, mostra loading solo se non ci sono messaggi
            onMessageUpdate(otherUserId, existingMessages, false, true)
          }
        }

        if (!profileId) {
          throw new Error('Profile ID not available')
        }

        logger.debug('Fetching messages', {
          profileId,
          otherUserId,
          limit,
          offset,
          queryType: 'chat_messages',
          existingMessagesCount: existingMessages.length,
        })

        // Query per trovare messaggi tra profileId e otherUserId
        // Cerca messaggi dove profileId è sender E otherUserId è receiver, O viceversa
        // Usa due query separate e le unisce per garantire la logica corretta
        logger.debug('Query filter', {
          profileId,
          otherUserId,
          query1: `sender_id.eq.${profileId},receiver_id.eq.${otherUserId}`,
          query2: `sender_id.eq.${otherUserId},receiver_id.eq.${profileId}`,
        })

        // Query 1: messaggi dove profileId è sender e otherUserId è receiver
        // Ordina in crescente per avere i messaggi più vecchi prima
        logger.debug('Executing query 1: messages where profileId is sender', {
          profileId,
          otherUserId,
        })
        const { data: data1, error: error1 } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('sender_id', profileId)
          .eq('receiver_id', otherUserId)
          .order('created_at', { ascending: true })

        if (error1) {
          logger.error('Error fetching messages (query 1)', error1, {
            profileId,
            otherUserId,
            errorCode: error1.code,
            errorMessage: error1.message,
            errorDetails: error1.details,
            errorHint: error1.hint,
          })
          throw error1
        }

        logger.debug('Query 1 results', {
          profileId,
          otherUserId,
          count: data1?.length ?? 0,
          messages: data1?.map((m) => ({
            id: m.id,
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            created_at: m.created_at,
          })),
        })

        // Query 2: messaggi dove otherUserId è sender e profileId è receiver
        // Ordina in crescente per avere i messaggi più vecchi prima
        logger.debug('Executing query 2: messages where profileId is receiver', {
          profileId,
          otherUserId,
        })
        const { data: data2, error: error2 } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('sender_id', otherUserId)
          .eq('receiver_id', profileId)
          .order('created_at', { ascending: true })

        if (error2) {
          logger.error('Error fetching messages (query 2)', error2, {
            profileId,
            otherUserId,
            errorCode: error2.code,
            errorMessage: error2.message,
            errorDetails: error2.details,
            errorHint: error2.hint,
          })
          throw error2
        }

        logger.debug('Query 2 results', {
          profileId,
          otherUserId,
          count: data2?.length ?? 0,
          messages: data2?.map((m) => ({
            id: m.id,
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            created_at: m.created_at,
          })),
        })

        // Unisci i risultati e ordina per data (crescente: più vecchi prima, più recenti dopo)
        // Per la chat vogliamo i messaggi più vecchi in alto e i più recenti in basso
        const typedData1 = (data1 ?? []) as ChatMessageRecord[]
        const typedData2 = (data2 ?? []) as ChatMessageRecord[]
        const allMessages = [...typedData1, ...typedData2]
        const sortedMessages = allMessages.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateA - dateB // Ordine crescente (più vecchi prima)
        })

        // Applica paginazione
        // Per offset = 0, prendiamo gli ultimi 'limit' messaggi (più recenti)
        // Per offset > 0, prendiamo i messaggi precedenti (più vecchi)
        let data: typeof sortedMessages
        if (offset === 0) {
          // Prima pagina: prendi gli ultimi 'limit' messaggi (più recenti)
          data = sortedMessages.slice(-limit)
        } else {
          // Pagine successive: prendi i messaggi precedenti (più vecchi)
          // Calcola l'indice di partenza per i messaggi più vecchi
          const totalMessages = sortedMessages.length
          const startIndex = Math.max(0, totalMessages - limit - offset)
          const endIndex = totalMessages - offset
          data = sortedMessages.slice(startIndex, endIndex)
        }

        logger.debug('Messages fetched', {
          profileId,
          otherUserId,
          count: data?.length ?? 0,
          messages: data?.map((m) => ({
            id: m.id,
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            is_sender: m.sender_id === profileId,
            is_receiver: m.receiver_id === profileId,
            message_preview: (m.message as string)?.substring(0, 50),
            created_at: m.created_at,
          })),
        })

        // Log dettagliato per debug
        if (data && data.length > 0) {
          const ownMessages = data.filter((m) => m.sender_id === profileId)
          const receivedMessages = data.filter((m) => m.receiver_id === profileId)
          logger.debug('Messages breakdown', {
            total: data.length,
            ownMessages: ownMessages.length,
            receivedMessages: receivedMessages.length,
            ownMessageIds: ownMessages.map((m) => m.id),
            receivedMessageIds: receivedMessages.map((m) => m.id),
          })
        } else {
          logger.warn('No messages fetched - verificando RLS e dati', {
            profileId,
            otherUserId,
            query: `and(sender_id.eq.${profileId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${profileId})`,
          })

          // Debug: verifica se ci sono messaggi in generale per questo utente
          const { data: allUserMessages, error: debugError } = await supabase
            .from('chat_messages')
            .select('id, sender_id, receiver_id, created_at')
            .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`)
            .limit(5)

          const typedAllUserMessages = (allUserMessages ?? []) as Pick<
            ChatMessageRecord,
            'id' | 'sender_id' | 'receiver_id' | 'created_at'
          >[]

          logger.debug('Debug: messaggi totali per utente', {
            profileId,
            allUserMessagesCount: typedAllUserMessages?.length ?? 0,
            allUserMessages: typedAllUserMessages?.map((m) => ({
              id: m.id,
              sender_id: m.sender_id,
              receiver_id: m.receiver_id,
            })),
            debugError: debugError
              ? {
                  code: debugError.code,
                  message: debugError.message,
                  details: debugError.details,
                  hint: debugError.hint,
                }
              : null,
          })
        }

        // I messaggi sono già in ordine crescente (più vecchi prima), non serve reverse
        const messages = ((data ?? []) as ChatMessageRecord[]).map((msg) => {
          const normalizedType: ChatMessage['type'] =
            msg.type === 'text' || msg.type === 'file' || msg.type === 'system' ? msg.type : 'text'

          return {
            ...msg,
            type: normalizedType,
            file_url: msg.file_url ?? undefined,
            read_at: msg.read_at ?? undefined,
          }
        }) as ChatMessage[]

        // CRITICO: Preserva sempre i messaggi esistenti quando offset === 0
        // Se offset === 0 e messages è vuoto, mantieni existingMessages (refresh da realtime)
        // Se offset === 0 e messages ha dati, usa messages (nuovo caricamento o refresh con dati)
        // Se offset > 0, combina existingMessages + messages (paginazione)
        let combinedMessages: ChatMessage[]
        if (offset === 0) {
          // Prima pagina: se abbiamo messaggi dal fetch, usali
          // Se non abbiamo messaggi dal fetch ma abbiamo messaggi esistenti, mantienili
          // Questo previene la scomparsa dei messaggi durante refresh da realtime
          if (messages.length > 0) {
            // Abbiamo nuovi messaggi, usali (potrebbero essere aggiornati)
            combinedMessages = messages
          } else if (existingMessages.length > 0) {
            // Non abbiamo nuovi messaggi ma abbiamo messaggi esistenti, mantienili
            // Questo è un refresh da realtime che non ha trovato nuovi messaggi
            logger.debug(
              'Refresh da realtime: nessun nuovo messaggio, mantenendo messaggi esistenti',
              {
                profileId,
                otherUserId,
                existingMessagesCount: existingMessages.length,
                fetchedCount: data?.length ?? 0,
              },
            )
            combinedMessages = existingMessages
          } else {
            // Nessun messaggio dal fetch e nessun messaggio esistente (nuova conversazione vuota)
            combinedMessages = []
          }
        } else {
          // Pagine successive: combina messaggi esistenti + nuovi
          combinedMessages = [...existingMessages, ...messages]
        }

        // Cache solo i primi 50 messaggi della prima pagina
        if (offset === 0 && combinedMessages.length <= 50 && combinedMessages.length > 0) {
          const cacheKey = `chat-messages:${profileId}:${otherUserId}:50:0`
          frequentQueryCache.set(cacheKey, combinedMessages.slice(0, 50))
        }

        // Aggiorna sempre con i messaggi combinati (nuovi + esistenti)
        // IMPORTANTE: Non sovrascrivere i messaggi esistenti se il fetch non trova risultati
        if (combinedMessages.length > 0) {
          // Abbiamo messaggi (nuovi o combinati), aggiorna
          onMessageUpdate(otherUserId, combinedMessages, (data ?? []).length === limit, false)
        } else {
          // Il fetch non ha trovato messaggi e non ci sono messaggi esistenti
          // Questo può succedere solo per una nuova conversazione vuota
          logger.debug(
            'Nessun messaggio trovato, nessun messaggio esistente (nuova conversazione vuota)',
            {
              profileId,
              otherUserId,
              fetchedCount: data?.length ?? 0,
              existingMessagesCount: existingMessages.length,
              cachedMessagesCount: cachedMessages?.length ?? 0,
            },
          )
          onMessageUpdate(otherUserId, [], false, false)
        }
      } catch (error) {
        logger.error('Error fetching messages - mantenendo messaggi esistenti se presenti', error, {
          profileId: profileId ?? 'unknown',
          otherUserId,
          existingMessagesCount: existingMessages.length,
          cachedMessagesCount: cachedMessages?.length ?? 0,
        })
        onError(error instanceof Error ? error.message : 'Errore nel caricamento dei messaggi')

        // Non resettare i messaggi se ci sono già messaggi esistenti (preserva cache)
        // Cerca di preservare messaggi da cache o stato esistente
        const messagesToKeep =
          existingMessages.length > 0
            ? existingMessages
            : cachedMessages && cachedMessages.length > 0
              ? cachedMessages
              : []

        if (messagesToKeep.length > 0) {
          logger.debug('Errore nel fetch, mantenendo messaggi esistenti', {
            profileId: profileId ?? 'unknown',
            otherUserId,
            messagesToKeepCount: messagesToKeep.length,
          })
          onMessageUpdate(otherUserId, messagesToKeep, false, false)
        } else {
          // Solo se non ci sono messaggi, aggiorna lo stato per mostrare l'errore
          onMessageUpdate(otherUserId, [], false, false)
        }
      }
    },
    [supabase, getCurrentProfileId, onMessageUpdate, onError],
  )

  const sendMessage = useCallback(
    async (
      receiverId: string,
      message: string,
      type: 'text' | 'file' = 'text',
      fileUrl?: string,
      fileName?: string,
      fileSize?: number,
      onSuccess?: (message: ChatMessage) => void,
    ) => {
      try {
        const senderProfileId = await getCurrentProfileId()

        logger.debug('Preparing to send message', {
          senderProfileId,
          receiverId,
          messageLength: message.length,
          type,
          hasFile: !!fileUrl,
        })

        const newMessage: NewMessagePayload = {
          sender_id: senderProfileId,
          receiver_id: receiverId,
          message,
          type,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
        }

        logger.debug('Inserting message into database', {
          sender_id: newMessage.sender_id,
          receiver_id: newMessage.receiver_id,
          message_preview: message.substring(0, 50),
        })

        const { data, error } = await supabase
          .from('chat_messages')
          .insert(newMessage as never)
          .select()
          .single()

        if (error) {
          logger.error('Error inserting message', error, {
            senderProfileId,
            receiverId,
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.details,
            errorHint: error.hint,
          })
          throw error
        }

        const typedData = data as ChatMessageRecord

        logger.debug('Message inserted successfully', {
          messageId: typedData.id,
          sender_id: typedData.sender_id,
          receiver_id: typedData.receiver_id,
        })

        const formattedMessage: ChatMessage = {
          id: typedData.id,
          sender_id: typedData.sender_id,
          receiver_id: typedData.receiver_id,
          message: typedData.message,
          type:
            typedData.type === 'text' || typedData.type === 'file' || typedData.type === 'system'
              ? typedData.type
              : 'text',
          file_url: typedData.file_url ?? undefined,
          file_name: typedData.file_name ?? undefined,
          file_size: typedData.file_size ?? undefined,
          read_at: typedData.read_at ?? undefined,
          created_at: typedData.created_at ?? new Date().toISOString(),
        }

        if (onSuccess) {
          onSuccess(formattedMessage)
        }

        return data
      } catch (error) {
        onError(error instanceof Error ? error.message : "Errore nell'invio del messaggio")
        throw error
      }
    },
    [supabase, getCurrentProfileId, onError],
  )

  const markAsRead = useCallback(
    async (
      otherUserId: string,
      onUpdate: (messages: ChatMessage[]) => void,
      currentMessages: ChatMessage[],
    ) => {
      try {
        const receiverProfileId = await getCurrentProfileId()

        const { error } = await supabase
          .from('chat_messages')
          .update({ read_at: new Date().toISOString() } as never)
          .eq('receiver_id', receiverProfileId)
          .eq('sender_id', otherUserId)
          .is('read_at', null)

        if (error) throw error

        const updatedMessages = currentMessages.map((msg) =>
          msg.sender_id === otherUserId && !msg.read_at
            ? { ...msg, read_at: new Date().toISOString() }
            : msg,
        )

        onUpdate(updatedMessages)
      } catch (err) {
        logger.error('Error marking messages as read', err, { otherUserId })
      }
    },
    [supabase, getCurrentProfileId],
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const profileId = await getCurrentProfileId()

        if (!profileId) {
          throw new Error('Profile ID not available')
        }

        logger.debug('Deleting message', {
          messageId,
          profileId,
        })

        // Prima verifica che il messaggio esista e che l'utente sia il mittente
        const { data: messageData, error: fetchError } = await supabase
          .from('chat_messages')
          .select('id, sender_id')
          .eq('id', messageId)
          .single()

        if (fetchError) {
          logger.error('Error fetching message before delete', fetchError, {
            messageId,
            profileId,
          })
          throw new Error('Messaggio non trovato')
        }

        if (!messageData) {
          throw new Error('Messaggio non trovato')
        }

        const msg = messageData as { id: string; sender_id: string }
        if (msg.sender_id !== profileId) {
          logger.warn('User trying to delete message they did not send', {
            messageId,
            profileId,
            senderId: msg.sender_id,
          })
          throw new Error('Non puoi eliminare messaggi di altri utenti')
        }

        // Elimina il messaggio
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .eq('id', messageId)
          .eq('sender_id', profileId)

        if (error) {
          logger.error('Error deleting message', error, {
            messageId,
            profileId,
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.details,
            errorHint: error.hint,
          })

          // Se è un errore di permesso, fornisci un messaggio più chiaro
          if (
            error.code === '42501' ||
            error.message.includes('permission') ||
            error.message.includes('policy')
          ) {
            throw new Error(
              'Non hai i permessi per eliminare questo messaggio. Verifica che la policy DELETE sia stata applicata in Supabase.',
            )
          }

          throw error
        }

        logger.debug('Message deleted successfully', {
          messageId,
          profileId,
        })

        // Invalidare cache
        if (profileId) {
          frequentQueryCache.invalidate(`chat-messages:${profileId}:*`)
        }

        return true
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Errore nell'eliminazione del messaggio"
        logger.error('Error in deleteMessage', error, { messageId })
        onError(errorMessage)
        throw error
      }
    },
    [supabase, getCurrentProfileId, onError],
  )

  return {
    fetchMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
  }
}
