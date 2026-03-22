import { useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { frequentQueryCache } from '@/lib/cache/cache-strategies'
import { createLogger } from '@/lib/logger'
import type { ConversationParticipant } from '@/types/chat'

const logger = createLogger('hooks:chat:use-chat-conversations')

type ConversationParticipantExtended = ConversationParticipant & {
  nome?: string
  cognome?: string
  role?: string
  avatar?: string | null
}

type ConversationParticipantRow = {
  other_user_id: string
  other_user_name: string
  other_user_role: string
  last_message_at: string
  unread_count: number
  avatar?: string | null
}

type ChatProfileRow = {
  id: string
  nome?: string | null
  cognome?: string | null
  role?: string | null
  avatar?: string | null
}

const STAFF_ROLES = ['admin', 'trainer']

export function useChatConversations(
  getCurrentProfileId: () => Promise<string>,
  onSuccess: (conversations: ConversationParticipantExtended[]) => void,
  onError: (error: string) => void,
) {
  const fetchConversations = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      const profileId = await getCurrentProfileId()

      // Check cache prima di fare query
      const cacheKey = `chat-conversations:${profileId}`
      const cachedConversations =
        frequentQueryCache.get<ConversationParticipantExtended[]>(cacheKey)
      if (cachedConversations && cachedConversations.length > 0) {
        // Serve dati dalla cache immediatamente
        onSuccess(cachedConversations)
        // Fetch in background per aggiornare cache (stale-while-revalidate pattern)
        // Continuiamo con il fetch normale che sovrascriverà la cache
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, role, org_id, user_id')
        .eq('id', profileId)
        .maybeSingle()

      // Usa la RPC ottimizzata definita nelle migrazioni; fallback su query diretta se non disponibile
      let data: ConversationParticipantExtended[] = []
      logger.debug('Calling RPC get_conversation_participants', {
        user_uuid: user.id,
        profileId,
      })

      const { data: rpcData, error } = await supabase.rpc('get_conversation_participants', {
        user_uuid: user.id,
      })

      logger.debug('RPC response', {
        hasData: !!rpcData,
        dataLength: Array.isArray(rpcData) ? rpcData.length : 0,
        error: error
          ? {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint,
            }
          : null,
        rpcData: Array.isArray(rpcData) ? rpcData.slice(0, 3) : rpcData,
        profileId,
        userId: user.id,
      })

      // Se RPC fallisce, logga dettagli per debug
      if (error) {
        logger.warn('RPC get_conversation_participants failed, using fallback', {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          profileId,
          userId: user.id,
        })
      }

      if (!error && Array.isArray(rpcData)) {
        const rpcRows = rpcData as ConversationParticipantRow[]
        data = rpcRows.map((row) => {
          const fullName = typeof row.other_user_name === 'string' ? row.other_user_name.trim() : ''
          const nameParts = fullName.length > 0 ? fullName.split(' ').filter(Boolean) : []
          const firstName = nameParts[0] ?? 'Utente'
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

          return {
            id: row.other_user_id ?? '',
            nome: firstName,
            cognome: lastName,
            role: row.other_user_role,
            avatar: row.avatar ?? null,
            other_user_id: row.other_user_id,
            other_user_name: row.other_user_name,
            other_user_role: row.other_user_role,
            last_message_at: row.last_message_at,
            unread_count: row.unread_count,
          }
        })
      } else {
        // Fallback: ricava i partecipanti dai messaggi
        logger.debug('Using fallback - fetching messages', { profileId })
        const { data: messages, error: fbErr } = await supabase
          .from('chat_messages')
          .select('sender_id, receiver_id, created_at')
          .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`)
          .order('created_at', { ascending: false })

        if (fbErr) {
          logger.error('Error fetching messages (fallback)', fbErr, {
            profileId,
            errorCode: fbErr.code,
            errorMessage: fbErr.message,
            errorDetails: fbErr.details,
            errorHint: fbErr.hint,
          })
          throw fbErr
        }

        logger.debug('Messages fetched (fallback)', {
          profileId,
          messagesCount: messages?.length ?? 0,
          messages: messages?.map(
            (m: { sender_id: string; receiver_id: string; created_at: string | null }) => ({
              sender_id: m.sender_id,
              receiver_id: m.receiver_id,
              created_at: m.created_at ?? '',
            }),
          ),
        })

        const participantsOrder: { other_user_id: string; last_message_at: string }[] = []
        const otherIdsSet = new Set<string>()

        for (const m of messages ?? []) {
          const otherId =
            m.sender_id === profileId ? (m.receiver_id as string) : (m.sender_id as string)
          if (otherIdsSet.has(otherId)) continue
          otherIdsSet.add(otherId)
          participantsOrder.push({
            other_user_id: otherId,
            last_message_at: m.created_at as string,
          })
        }

        if (otherIdsSet.size > 0) {
          const { data: profiles, error: profErr } = await supabase
            .from('profiles')
            .select('id, user_id, nome, cognome, role, avatar')
            .in('id', Array.from(otherIdsSet))
            .returns<ChatProfileRow[]>()

          if (profErr) throw profErr

          const profileById = new Map<string, ChatProfileRow>()
          for (const p of profiles ?? []) {
            profileById.set(p.id, p)
          }

          data = participantsOrder.map(({ other_user_id, last_message_at }) => {
            const p = profileById.get(other_user_id)
            const nome = p?.nome ?? 'Utente'
            const cognome = p?.cognome ?? ''
            const role = p?.role ?? 'unknown'
            return {
              id: other_user_id,
              other_user_id,
              other_user_name: `${nome} ${cognome}`.trim(),
              other_user_role: role,
              last_message_at,
              unread_count: 0,
              nome,
              cognome,
              role,
              avatar: p?.avatar ?? null,
            }
          })
        }
      }

      const conversationsMap = new Map<string, ConversationParticipantExtended>()

      for (const conversation of data) {
        if (!conversation.other_user_id) continue
        conversationsMap.set(conversation.other_user_id, { ...conversation })
      }

      const userRole = profileData?.role ?? ''
      const isStaffRole = STAFF_ROLES.includes(userRole)
      const isAthleteRole = userRole === 'athlete'

      // Se è staff, mostra tutti gli atleti
      if (isStaffRole) {
        let athletesQuery = supabase
          .from('profiles')
          .select(
            'id, user_id, first_name, last_name, nome, cognome, email, role, updated_at, created_at, org_id',
          )
          .eq('role', 'athlete')
          .order('updated_at', { ascending: false })

        if (profileData?.org_id) {
          athletesQuery = athletesQuery.eq('org_id', profileData.org_id)
        }

        const { data: athletes } = await athletesQuery

        for (const athlete of athletes ?? []) {
          const athleteProfileId = athlete.id as string | undefined
          if (!athleteProfileId || athleteProfileId === profileId) continue

          const firstName = (athlete.first_name as string | null) ?? (athlete.nome as string | null)
          const lastName =
            (athlete.last_name as string | null) ?? (athlete.cognome as string | null)
          const displayName = [firstName, lastName].filter(Boolean).join(' ').trim()
          const fallbackName = displayName || ((athlete.email as string | undefined) ?? 'Atleta')
          const fallbackDate =
            (conversationsMap.get(athleteProfileId)?.last_message_at as string | undefined) ??
            (athlete.updated_at as string | undefined) ??
            (athlete.created_at as string | undefined) ??
            '1970-01-01T00:00:00.000Z'
          const role = (athlete.role as string | undefined) ?? 'athlete'

          const existing = conversationsMap.get(athleteProfileId)
          if (existing) {
            conversationsMap.set(athleteProfileId, {
              ...existing,
              other_user_name:
                existing.other_user_name && existing.other_user_name.trim().length > 0
                  ? existing.other_user_name
                  : fallbackName,
              other_user_role: existing.other_user_role ?? role,
              last_message_at: existing.last_message_at ?? fallbackDate,
            })
          } else {
            conversationsMap.set(athleteProfileId, {
              other_user_id: athleteProfileId,
              other_user_name: fallbackName,
              other_user_role: role,
              last_message_at: fallbackDate,
              unread_count: 0,
            })
          }
        }
      }

      // Se è staff, mostra tutti gli altri staff della stessa org (per chat tra colleghi)
      if (isStaffRole && profileData?.org_id) {
        const staffQuery = supabase
          .from('profiles')
          .select(
            'id, user_id, first_name, last_name, nome, cognome, email, role, updated_at, created_at, org_id, avatar',
          )
          .in('role', STAFF_ROLES)
          .eq('org_id', profileData.org_id)
          .neq('id', profileId)
          .order('updated_at', { ascending: false })

        const { data: staffProfiles } = await staffQuery

        for (const staff of staffProfiles ?? []) {
          const staffProfileId = staff.id as string | undefined
          if (!staffProfileId) continue

          const firstName = (staff.first_name as string | null) ?? (staff.nome as string | null)
          const lastName = (staff.last_name as string | null) ?? (staff.cognome as string | null)
          const displayName = [firstName, lastName].filter(Boolean).join(' ').trim()
          const fallbackName = displayName || ((staff.email as string | undefined) ?? 'Staff')
          const fallbackDate =
            (conversationsMap.get(staffProfileId)?.last_message_at as string | undefined) ??
            (staff.updated_at as string | undefined) ??
            (staff.created_at as string | undefined) ??
            '1970-01-01T00:00:00.000Z'
          const role = (staff.role as string | undefined) ?? 'staff'

          const existing = conversationsMap.get(staffProfileId)
          if (existing) {
            conversationsMap.set(staffProfileId, {
              ...existing,
              other_user_name:
                existing.other_user_name && existing.other_user_name.trim().length > 0
                  ? existing.other_user_name
                  : fallbackName,
              other_user_role: existing.other_user_role ?? role,
              last_message_at: existing.last_message_at ?? fallbackDate,
              avatar: (staff.avatar as string | null) ?? existing.avatar ?? null,
            })
          } else {
            conversationsMap.set(staffProfileId, {
              other_user_id: staffProfileId,
              other_user_name: fallbackName,
              other_user_role: role,
              last_message_at: fallbackDate,
              unread_count: 0,
              avatar: (staff.avatar as string | null) ?? null,
            })
          }
        }
      }

      // Se è atleta, mostra il suo PT anche se non ci sono messaggi
      if (isAthleteRole) {
        try {
          // Recupera il trainer attivo assegnato (athlete_trainer_assignments, status=active)
          const { data: ptRelation, error: ptError } = await supabase
            .from('athlete_trainer_assignments')
            .select(
              'trainer_id, trainer:profiles!athlete_trainer_assignments_trainer_id_fkey(id, nome, cognome, role, user_id)',
            )
            .eq('athlete_id', profileId)
            .eq('status', 'active')
            .maybeSingle()

          if (!ptError && ptRelation?.trainer_id) {
            // trainer = profilo trainer dalla FK
            const ptData = ptRelation.trainer as unknown as
              | {
                  id: string
                  nome?: string | null
                  cognome?: string | null
                  role?: string | null
                  user_id?: string | null
                }
              | {
                  id: string
                  nome?: string | null
                  cognome?: string | null
                  role?: string | null
                  user_id?: string | null
                }[]
              | null

            // Gestisce sia array che oggetto singolo
            const ptProfile = Array.isArray(ptData) ? (ptData[0] ?? null) : ptData

            if (ptProfile?.id) {
              const ptProfileId = ptProfile.id
              const ptNome = ptProfile.nome ?? ''
              const ptCognome = ptProfile.cognome ?? ''
              const ptDisplayName =
                [ptNome, ptCognome].filter(Boolean).join(' ').trim() || 'Personal Trainer'
              const ptRole = ptProfile.role ?? 'trainer'

              const existing = conversationsMap.get(ptProfileId)
              if (existing) {
                // Se esiste già, mantieni i dati esistenti ma aggiorna il nome se mancante
                conversationsMap.set(ptProfileId, {
                  ...existing,
                  other_user_name:
                    existing.other_user_name && existing.other_user_name.trim().length > 0
                      ? existing.other_user_name
                      : ptDisplayName,
                  other_user_role: existing.other_user_role ?? ptRole,
                })
              } else {
                // Se non esiste, aggiungi il PT con data molto vecchia così appare per ultimo se non ci sono messaggi
                conversationsMap.set(ptProfileId, {
                  other_user_id: ptProfileId,
                  other_user_name: ptDisplayName,
                  other_user_role: ptRole,
                  last_message_at: '1970-01-01T00:00:00.000Z',
                  unread_count: 0,
                })
              }
            }
          }
        } catch (error) {
          // Ignora errori nel recupero del PT, non bloccare il caricamento delle conversazioni
          logger.warn('Error fetching PT for athlete', error)
        }

        // Recupera nutrizionisti e massaggiatori assegnati (staff_atleti, status=active)
        try {
          const { data: staffLinks, error: staffErr } = await supabase
            .from('staff_atleti')
            .select('staff_id')
            .eq('atleta_id', profileId)
            .eq('status', 'active')

          if (!staffErr && staffLinks && staffLinks.length > 0) {
            const staffIds = [
              ...new Set((staffLinks as { staff_id: string }[]).map((r) => r.staff_id)),
            ]
            const { data: staffProfiles, error: profErr } = await supabase
              .from('profiles')
              .select('id, nome, cognome, role, avatar')
              .in('id', staffIds)

            if (!profErr && staffProfiles) {
              for (const p of staffProfiles as {
                id: string
                nome?: string | null
                cognome?: string | null
                role?: string | null
                avatar?: string | null
              }[]) {
                const staffProfileId = p.id
                const displayName =
                  [p.nome, p.cognome].filter(Boolean).join(' ').trim() ||
                  (p.role === 'nutrizionista'
                    ? 'Nutrizionista'
                    : p.role === 'massaggiatore'
                      ? 'Massaggiatore'
                      : 'Staff')
                const role = p.role ?? 'staff'
                const existing = conversationsMap.get(staffProfileId)
                if (existing) {
                  conversationsMap.set(staffProfileId, {
                    ...existing,
                    other_user_name: existing.other_user_name?.trim()
                      ? existing.other_user_name
                      : displayName,
                    other_user_role: existing.other_user_role ?? role,
                    avatar: existing.avatar ?? p.avatar ?? null,
                  })
                } else {
                  conversationsMap.set(staffProfileId, {
                    other_user_id: staffProfileId,
                    other_user_name: displayName,
                    other_user_role: role,
                    last_message_at: '1970-01-01T00:00:00.000Z',
                    unread_count: 0,
                    avatar: p.avatar ?? null,
                  })
                }
              }
            }
          }
        } catch (error) {
          logger.warn('Error fetching staff (nutrizionista/massaggiatore) for athlete', error)
        }
      }

      const conversationsList = Array.from(conversationsMap.values())
        .map((conversation) => ({
          ...conversation,
          last_message_at: conversation.last_message_at ?? '1970-01-01T00:00:00.000Z',
        }))
        .sort((a, b) => {
          const timeA = Number.isNaN(Date.parse(a.last_message_at))
            ? 0
            : Date.parse(a.last_message_at)
          const timeB = Number.isNaN(Date.parse(b.last_message_at))
            ? 0
            : Date.parse(b.last_message_at)
          return timeB - timeA
        })

      // Log per debug
      logger.debug('Conversations loaded', {
        profileId,
        userRole: profileData?.role,
        conversationsCount: conversationsList.length,
        conversations: conversationsList.map((c) => ({
          other_user_id: c.other_user_id,
          other_user_name: c.other_user_name,
          other_user_role: c.other_user_role,
          last_message_at: c.last_message_at,
        })),
      })

      // Salva in cache (TTL 5 minuti con strategia frequent-query)
      frequentQueryCache.set(cacheKey, conversationsList)

      onSuccess(conversationsList)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Errore nel caricamento delle conversazioni')
    }
  }, [getCurrentProfileId, onSuccess, onError])

  return { fetchConversations }
}
