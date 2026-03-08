'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/hooks/use-chat'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { notifyError } from '@/lib/notifications'
import { getProfileIdFromUserId } from '@/lib/utils/profile-id-utils'
import { isValidProfile, isValidUUID, isValidMessageType } from '@/lib/utils/type-guards'
import { validateNonEmptyString } from '@/lib/utils/validation'
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const logger = createLogger('app:home:chat:page')

interface PersonalTrainer {
  id: string
  nome: string
  cognome: string
  role: string
  avatar_url?: string | null
}

export type ChatRecipientRole = 'trainer' | 'nutrizionista' | 'massaggiatore'

interface ChatRecipient {
  id: string
  nome: string
  cognome: string
  role: ChatRecipientRole
  avatar_url?: string | null
}

function roleLabel(role: ChatRecipientRole): string {
  if (role === 'nutrizionista') return 'Nutrizionista'
  if (role === 'massaggiatore') return 'Massaggiatore'
  return 'Trainer'
}

const HEADER_BASE_CLASS =
  'relative overflow-hidden bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg'
const HEADER_FULL_CLASS = 'rounded-b-xl border-b border-cyan-500/30 z-10 shrink-0'
const HEADER_STANDALONE_CLASS = 'rounded-xl border border-cyan-500/30 mb-4'

function ChatPageHeader({
  onBack,
  title,
  subtitle,
  icon,
  skeleton,
  variant = 'full',
  size = 'default',
}: {
  onBack?: () => void
  title: string
  subtitle: string
  icon?: ReactNode
  skeleton?: boolean
  variant?: 'full' | 'standalone'
  size?: 'default' | 'compact'
}) {
  const wrapperClass = cn(
    HEADER_BASE_CLASS,
    variant === 'full' ? HEADER_FULL_CLASS : HEADER_STANDALONE_CLASS,
  )
  const roundedClass = variant === 'full' ? 'rounded-b-xl' : 'rounded-xl'
  const titleClass = size === 'compact' ? 'text-sm min-[834px]:text-base' : 'text-2xl md:text-3xl'
  const subtitleClass = size === 'compact' ? 'text-[10px] min-[834px]:text-xs' : 'text-xs'
  if (skeleton) {
    return (
      <header className={wrapperClass}>
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-teal-500/5',
            roundedClass,
          )}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl bg-background-tertiary animate-pulse shrink-0" />
          <div className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl bg-background-tertiary animate-pulse shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="h-4 min-[834px]:h-5 w-28 bg-background-tertiary rounded animate-pulse" />
            <div className="h-3 w-20 bg-background-tertiary rounded animate-pulse" />
          </div>
        </div>
      </header>
    )
  }
  return (
    <header className={wrapperClass}>
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-teal-500/5',
          roundedClass,
        )}
      />
      <div className="relative z-10 flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400"
            onClick={onBack}
            aria-label="Indietro"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        {icon && (
          <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className={cn('font-semibold text-text-primary truncate', titleClass)}>{title}</h1>
          <p className={cn('text-text-tertiary line-clamp-1', subtitleClass)}>{subtitle}</p>
        </div>
      </div>
    </header>
  )
}

function ChatErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="border border-state-error/50 bg-background-secondary/50 backdrop-blur-sm p-6 min-[834px]:p-8 text-center">
      <div className="mb-3 text-4xl opacity-50">😞</div>
      <h2 className="text-text-primary text-sm min-[834px]:text-base font-semibold mb-1.5">
        Errore nel caricamento
      </h2>
      <p className="text-text-secondary mb-4 text-xs min-[834px]:text-sm">{error}</p>
      <Button
        onClick={onRetry}
        aria-label="Riprova a caricare le conversazioni"
        className="rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 min-h-[44px]"
      >
        Riprova
      </Button>
    </Card>
  )
}

function ChatEmptyState({
  emoji,
  title,
  description,
}: {
  emoji: string
  title: string
  description: string
}) {
  return (
    <Card className="border border-cyan-500/30 bg-background-secondary/50 backdrop-blur-sm p-4 min-[834px]:p-6 text-center">
      <div className="mb-2.5 text-4xl opacity-50">{emoji}</div>
      <h2 className="text-text-primary text-sm min-[834px]:text-base font-semibold mb-1.5">
        {title}
      </h2>
      <p className="text-text-secondary text-xs min-[834px]:text-sm mb-1.5">{description}</p>
    </Card>
  )
}

function ChatLoadingCard() {
  return (
    <Card className="border border-cyan-500/30 bg-background-secondary/50 backdrop-blur-sm">
      <div className="p-6 min-[834px]:p-8">
        <div className="animate-pulse space-y-4">
          <div className="bg-background-tertiary h-48 rounded-xl" />
        </div>
      </div>
    </Card>
  )
}

function ChatLoadingFullPage({ footerChildren }: { footerChildren?: ReactNode }) {
  return (
    <div className="flex flex-col min-h-0 flex-1 bg-background w-full max-w-full overflow-hidden">
      <ChatPageHeader skeleton title="" subtitle="" variant="full" />
      <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
        <div className="animate-pulse space-y-3 w-full px-3 sm:px-4 min-[834px]:px-6">
          <div className="bg-background-tertiary h-14 rounded-xl" />
          <div className="bg-background-tertiary h-14 rounded-xl" />
          <div className="bg-background-tertiary h-14 rounded-xl" />
        </div>
      </div>
      <footer className="fixed inset-x-0 bottom-0 z-20 overflow-hidden rounded-t-xl border-t border-cyan-500/30 bg-background-secondary p-3 min-[834px]:p-4 shadow-lg pb-[env(safe-area-inset-bottom)]">
        <div className="absolute inset-0 z-20 rounded-t-xl bg-gradient-to-br from-cyan-500/10 via-background to-teal-500/5 pointer-events-none" />
        <div className="relative z-10 w-full">
          {footerChildren ?? (
            <div className="h-10 min-[834px]:h-11 bg-background-tertiary rounded-xl animate-pulse" />
          )}
        </div>
      </footer>
    </div>
  )
}

function AthleteChatPageContent() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { user, loading: authLoading } = useAuth()

  const {
    conversations,
    currentConversation,
    sendMessage,
    uploadFile,
    deleteMessage,
    setCurrentConversation,
    loadMoreMessages,
    error,
    fetchConversations,
  } = useChat()

  // Type guard per user
  const isValidUser = user && isValidProfile(user)

  // user?.id da useAuth() è già profiles.id, usiamolo direttamente
  // Type guard assicura che user sia valido
  // NOTA: Tutti gli hooks devono essere chiamati prima di qualsiasi early return
  const currentUserId = useMemo(() => {
    if (!isValidUser || !user?.id) return ''
    return isValidUUID(user.id) ? user.id : ''
  }, [user, isValidUser])

  const [personalTrainer, setPersonalTrainer] = useState<PersonalTrainer | null>(null)
  const [loadingPT, setLoadingPT] = useState(true)

  // Carica il Personal Trainer dell'atleta
  useEffect(() => {
    if (!user?.id) {
      setLoadingPT(false)
      return
    }
    let cancelled = false
    const loadPersonalTrainer = async () => {
      try {
        setLoadingPT(true)
        const athleteProfileId = user.user_id ? await getProfileIdFromUserId(user.user_id) : user.id
        if (!athleteProfileId) {
          if (!cancelled) setLoadingPT(false)
          return
        }
        const { data: trainerRelation, error: ptError } = await supabase
          .from('athlete_trainer_assignments')
          .select('trainer_id')
          .eq('athlete_id', athleteProfileId)
          .eq('status', 'active')
          .maybeSingle()

        if (cancelled) return
        if (ptError) {
          logger.warn('Error fetching trainer relation', ptError, { athleteProfileId })
          return
        }

        const ptId = (trainerRelation as { trainer_id?: string } | null)?.trainer_id
        if (ptId) {
          let nome = 'Personal'
          let cognome = 'Trainer'
          let avatar_url: string | null = null
          const { data: rpcRows, error: rpcError } = await supabase.rpc('get_my_trainer_profile')
          if (cancelled) return
          const rows = Array.isArray(rpcRows) ? rpcRows : []
          if (!rpcError && rows.length > 0) {
            const row = rows[0] as {
              pt_nome?: string | null
              pt_cognome?: string | null
              pt_avatar_url?: string | null
            }
            nome = row?.pt_nome ?? nome
            cognome = row?.pt_cognome ?? cognome
            avatar_url = row?.pt_avatar_url ?? null
          } else if (rpcError) {
            logger.warn('PT RPC failed, using fallback', rpcError, { ptId })
          }
          setPersonalTrainer({ id: ptId, nome, cognome, role: 'trainer', avatar_url })
        }
      } catch (error) {
        if (!cancelled) logger.error('Error loading personal trainer', error)
      } finally {
        if (!cancelled) setLoadingPT(false)
      }
    }

    loadPersonalTrainer()
    return () => {
      cancelled = true
    }
  }, [user?.id, user?.user_id, supabase])

  // Per l'atleta: lista destinatari da conversations (PT + nutrizionista/massaggiatore da staff_atleti)
  const availableRecipients = useMemo((): ChatRecipient[] => {
    if (conversations.length > 0) {
      return conversations.map((c) => {
        const parts = (c.other_user_name ?? '').trim().split(/\s+/).filter(Boolean)
        const nome = parts[0] ?? 'Utente'
        const cognome = parts.length > 1 ? parts.slice(1).join(' ') : ''
        const role = (
          c.other_user_role === 'nutrizionista' || c.other_user_role === 'massaggiatore'
            ? c.other_user_role
            : 'trainer'
        ) as ChatRecipientRole
        return {
          id: c.other_user_id,
          nome,
          cognome,
          role,
          avatar_url: c.avatar ?? null,
        }
      })
    }
    if (personalTrainer) {
      return [
        {
          id: personalTrainer.id,
          nome: personalTrainer.nome,
          cognome: personalTrainer.cognome,
          role: 'trainer',
          avatar_url: personalTrainer.avatar_url ?? null,
        },
      ]
    }
    return []
  }, [conversations, personalTrainer])

  const currentConversationId = currentConversation?.participant?.other_user_id ?? null
  const hasAutoSelectedRef = useRef(false)
  const hasFetchedEmptyRef = useRef<string | null>(null)
  const availableRecipientsRef = useRef<ChatRecipient[]>([])
  const conversationsRef = useRef(conversations)
  useEffect(() => {
    availableRecipientsRef.current = availableRecipients
  }, [availableRecipients])
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  const firstRecipientId = availableRecipients[0]?.id ?? null
  const conversationsLength = conversations.length

  useEffect(() => {
    const recipients = availableRecipientsRef.current
    const convs = conversationsRef.current
    const loading = loadingPT
    if (loading || recipients.length === 0) return
    if (currentConversationId) return
    if (hasAutoSelectedRef.current) {
      setCurrentConversation(recipients[0].id).catch(() => {})
      return
    }
    hasAutoSelectedRef.current = true
    if (convs.length > 0) {
      const ptConv = personalTrainer?.id
        ? convs.find((c) => c.other_user_id === personalTrainer.id)
        : null
      const byRole = convs.find((c) => c.other_user_role === 'trainer')
      const toSelect =
        ptConv ||
        byRole ||
        (personalTrainer?.id ? { other_user_id: personalTrainer.id } : null) ||
        convs[0]
      if (toSelect) {
        const otherId =
          typeof toSelect === 'object' && 'other_user_id' in toSelect
            ? toSelect.other_user_id
            : toSelect
        setCurrentConversation(otherId).catch(() => {
          hasAutoSelectedRef.current = false
        })
      } else {
        hasAutoSelectedRef.current = false
      }
    } else {
      setCurrentConversation(recipients[0].id).catch(() => {
        hasAutoSelectedRef.current = false
      })
    }
  }, [
    conversationsLength,
    currentConversationId,
    personalTrainer?.id,
    loadingPT,
    firstRecipientId,
    setCurrentConversation,
  ])

  // Se la conversazione in vista ha 0 messaggi (o stiamo mostrando il fallback con currentConversation
  // null), forziamo setCurrentConversation per avviare fetchMessages (es. Trainer).
  const recipientIdToFetch = currentConversationId ?? availableRecipients[0]?.id ?? null
  useEffect(() => {
    if (!recipientIdToFetch) return
    const messagesCount =
      currentConversation?.participant?.other_user_id === recipientIdToFetch
        ? (currentConversation.messages?.length ?? 0)
        : 0
    if (messagesCount > 0) return
    if (recipientIdToFetch !== hasFetchedEmptyRef.current) hasFetchedEmptyRef.current = null
    if (hasFetchedEmptyRef.current === recipientIdToFetch) return
    hasFetchedEmptyRef.current = recipientIdToFetch
    setCurrentConversation(recipientIdToFetch).catch(() => {
      hasFetchedEmptyRef.current = null
    })
  }, [
    recipientIdToFetch,
    currentConversation?.participant?.other_user_id,
    currentConversation?.messages?.length,
    setCurrentConversation,
  ])

  const handleBack = useCallback(() => router.back(), [router])

  // Regola unica: atleta vede solo i messaggi tra sé e il destinatario selezionato (uno staff).
  // Filtro sempre per (currentUserId, otherIdForFilter) così ogni tab mostra solo la sua conversazione.
  const otherIdForFilter = currentConversationId ?? availableRecipients[0]?.id ?? null
  const messagesForThisConversation = useMemo(() => {
    if (!currentUserId || !otherIdForFilter) return []
    const messages = currentConversation?.messages ?? []
    return messages.filter(
      (m) =>
        (m.sender_id === currentUserId && m.receiver_id === otherIdForFilter) ||
        (m.sender_id === otherIdForFilter && m.receiver_id === currentUserId),
    )
  }, [currentUserId, otherIdForFilter, currentConversation?.messages])

  const selectedRecipient = currentConversationId
    ? availableRecipients.find((r) => r.id === currentConversationId)
    : null

  const effectiveConversation = useMemo(
    () =>
      currentConversation ??
      (selectedRecipient
        ? {
            participant: {
              other_user_id: selectedRecipient.id,
              other_user_name:
                `${selectedRecipient.nome} ${selectedRecipient.cognome}`.trim() ||
                roleLabel(selectedRecipient.role),
              other_user_role: selectedRecipient.role,
              last_message_at: '',
              unread_count: 0,
              avatar: selectedRecipient.avatar_url ?? null,
            },
            messages: [] as const,
            isLoading: true,
            hasMore: false,
          }
        : personalTrainer
          ? {
              participant: {
                other_user_id: personalTrainer.id,
                other_user_name: `${personalTrainer.nome} ${personalTrainer.cognome}`,
                other_user_role: 'trainer' as const,
                last_message_at: '',
                unread_count: 0,
                avatar: personalTrainer.avatar_url ?? null,
              },
              messages: [] as const,
              isLoading: true,
              hasMore: false,
            }
          : null),
    [currentConversation, selectedRecipient, personalTrainer],
  )

  const otherUserIdForSend = effectiveConversation?.participant?.other_user_id ?? null
  const handleSendMessage = useCallback(
    async (
      message: string,
      type: 'text' | 'file',
      fileData?: { url: string; name: string; size: number },
    ) => {
      if (!isValidMessageType(type)) {
        notifyError('Errore validazione', 'Tipo messaggio non valido')
        return
      }
      if (type === 'text') {
        const messageValidation = validateNonEmptyString(message, 'Messaggio')
        if (!messageValidation.valid) {
          notifyError('Errore validazione', messageValidation.error || 'Messaggio non valido')
          return
        }
      }
      if (!otherUserIdForSend) {
        logger.warn('Cannot send message: no conversation or PT')
        notifyError('Errore', 'Nessuna conversazione selezionata')
        return
      }
      try {
        logger.debug('Sending message', {
          otherUserId: otherUserIdForSend,
          messageLength: message.length,
          type,
          hasFile: !!fileData,
        })
        await sendMessage(
          otherUserIdForSend,
          message,
          type,
          fileData?.url,
          fileData?.name,
          fileData?.size,
        )
        logger.debug('Message sent successfully', { otherUserId: otherUserIdForSend })
      } catch (err) {
        logger.error('Error sending message', err, {
          otherUserId: otherUserIdForSend,
          messageLength: message.length,
          type,
          hasFile: !!fileData,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : undefined,
        })
        throw err
      }
    },
    [sendMessage, otherUserIdForSend],
  )
  const handleUploadFile = useCallback(
    async (file: File) =>
      uploadFile(file).catch((err) => {
        logger.error('Error uploading file', err)
        throw err
      }),
    [uploadFile],
  )
  const handleRecipientChange = useCallback(
    (value: string) => {
      if (value && value !== currentConversationId) {
        setCurrentConversation(value).catch(() => {})
      }
    },
    [currentConversationId, setCurrentConversation],
  )

  if (authLoading) {
    return <ChatLoadingFullPage />
  }

  // Se non c'è user dopo il caricamento, mostra contenuto vuoto (il layout gestirà il redirect)
  if (!user || !isValidUser) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col bg-background w-full max-w-full p-3 sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5"
        role="main"
        aria-label="Chat - caricamento"
      >
        {/* Contenuto vuoto - il layout gestirà il redirect */}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5">
          <ChatPageHeader
            onBack={handleBack}
            title="Chat"
            subtitle="Messaggi con il tuo trainer"
            icon={<MessageCircle className="h-5 w-5 text-cyan-400" />}
            variant="standalone"
          />
          <ChatErrorState error={error} onRetry={fetchConversations} />
        </div>
      </div>
    )
  }

  const loadingRecipients = loadingPT
  if (conversations.length === 0 && availableRecipients.length === 0) {
    if (loadingRecipients) {
      return (
        <div className="flex min-h-0 flex-1 flex-col bg-background">
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5">
            <ChatPageHeader
              onBack={handleBack}
              title="Chat"
              subtitle="Messaggi con il tuo trainer"
              icon={<MessageCircle className="h-5 w-5 text-cyan-400" />}
              variant="standalone"
            />
            <ChatLoadingCard />
          </div>
        </div>
      )
    }
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5">
          <ChatPageHeader
            onBack={handleBack}
            title="Chat"
            subtitle="Nessun trainer assegnato"
            icon={<MessageCircle className="h-5 w-5 text-cyan-400" />}
            variant="standalone"
          />
          <ChatEmptyState
            emoji="💬"
            title="Nessuna conversazione"
            description="Qui puoi chattare con il trainer quando assegnato."
          />
        </div>
      </div>
    )
  }

  if (!effectiveConversation) {
    return (
      <div className="flex flex-col min-h-0 flex-1 bg-background w-full max-w-full overflow-hidden">
        <ChatPageHeader
          onBack={handleBack}
          title="Caricamento..."
          subtitle="Selezionando conversazione"
          icon={<User className="h-5 w-5 text-cyan-400" />}
          variant="full"
          size="compact"
        />
        <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
          <div className="animate-pulse space-y-3 w-full px-3 sm:px-4 min-[834px]:px-6">
            <div className="bg-background-tertiary h-14 rounded-xl" />
            <div className="bg-background-tertiary h-14 rounded-xl" />
            <div className="bg-background-tertiary h-14 rounded-xl" />
          </div>
        </div>
        <footer className="fixed inset-x-0 bottom-0 z-20 overflow-hidden rounded-t-xl border-t border-cyan-500/30 bg-background-secondary p-3 min-[834px]:p-4 shadow-lg pb-[env(safe-area-inset-bottom)]">
          <div className="absolute inset-0 z-20 rounded-t-xl bg-gradient-to-br from-cyan-500/10 via-background to-teal-500/5 pointer-events-none" />
          <div className="relative z-10 w-full">
            <MessageInput
              onSendMessage={handleSendMessage}
              onUploadFile={handleUploadFile}
              placeholder="Hai completato l'allenamento? Raccontalo qui!"
              disabled={true}
            />
          </div>
        </footer>
      </div>
    )
  }

  const displayName = selectedRecipient
    ? `${selectedRecipient.nome} ${selectedRecipient.cognome}`.trim() ||
      roleLabel(selectedRecipient.role)
    : effectiveConversation.participant.other_user_name || 'Utente'
  const displayRole = selectedRecipient
    ? roleLabel(selectedRecipient.role)
    : effectiveConversation.participant.other_user_role === 'nutrizionista'
      ? 'Nutrizionista'
      : effectiveConversation.participant.other_user_role === 'massaggiatore'
        ? 'Massaggiatore'
        : 'Trainer'
  const avatarUrl =
    effectiveConversation.participant.avatar ?? selectedRecipient?.avatar_url ?? null

  return (
    <div
      className="flex flex-col min-h-0 flex-1 bg-background w-full max-w-full overflow-hidden"
      role="main"
      aria-label="Chat"
    >
      <header className="relative overflow-hidden rounded-b-xl border-b border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg z-10 flex-shrink-0">
        <div className="absolute inset-0 rounded-b-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-teal-500/5" />
        <div className="relative z-10 flex items-center gap-2 min-[834px]:gap-3 overflow-x-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400"
            onClick={handleBack}
            aria-label="Indietro"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {availableRecipients.length >= 1 ? (
            availableRecipients.map((r) => {
              const isSelected = (currentConversationId ?? availableRecipients[0]?.id) === r.id
              const name = `${r.nome} ${r.cognome}`.trim() || roleLabel(r.role)
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRecipientChange(r.id)}
                  className={cn(
                    'flex items-center gap-2 shrink-0 rounded-xl p-2 min-[834px]:p-2.5 border transition-all text-left',
                    isSelected
                      ? 'border-cyan-500/50 bg-cyan-500/15 shadow-[0_0_20px_rgba(2,179,191,0.15)]'
                      : 'border-white/10 bg-background-secondary/40 hover:border-cyan-500/30 hover:bg-cyan-500/10',
                  )}
                  aria-label={`Chatta con ${name}, ${roleLabel(r.role)}`}
                  aria-pressed={isSelected}
                >
                  <div className="relative h-9 w-9 min-[834px]:h-10 min-[834px]:w-10 shrink-0 rounded-full overflow-hidden border border-cyan-500/20 bg-cyan-500/10">
                    {r.avatar_url ? (
                      <Image
                        src={r.avatar_url}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-cyan-400">
                        <User className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate max-w-[100px] min-[834px]:max-w-[140px]">
                      {name}
                    </p>
                    <p className="text-[10px] min-[834px]:text-xs text-text-tertiary truncate max-w-[100px] min-[834px]:max-w-[140px]">
                      {roleLabel(r.role)}
                    </p>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {avatarUrl ? (
                <div className="relative h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-full overflow-hidden border border-cyan-500/30 bg-cyan-500/10">
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/10">
                  <User className="h-5 w-5 text-cyan-400" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-sm min-[834px]:text-base font-semibold text-text-primary truncate">
                  {displayName}
                </h1>
                <p className="text-text-tertiary text-[10px] min-[834px]:text-xs truncate">
                  {displayRole}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain flex flex-col space-y-1 p-4 bg-background"
        aria-label="Messaggi della conversazione"
      >
        <MessageList
          key={effectiveConversation.participant.other_user_id}
          messages={messagesForThisConversation}
          currentUserId={currentUserId}
          isLoading={effectiveConversation.isLoading}
          onLoadMore={loadMoreMessages}
          hasMore={effectiveConversation.hasMore}
          onDeleteMessage={deleteMessage}
        />
      </main>

      <footer
        className="fixed inset-x-0 bottom-0 z-20 overflow-hidden rounded-t-xl border-t border-cyan-500/30 bg-background-secondary p-3 min-[834px]:p-4 shadow-lg pb-[env(safe-area-inset-bottom)]"
        aria-label="Input messaggio"
      >
        <div className="absolute inset-0 z-20 rounded-t-xl bg-gradient-to-br from-cyan-500/10 via-background to-teal-500/5 pointer-events-none" />
        <div className="relative z-10 w-full">
          <MessageInput
            onSendMessage={handleSendMessage}
            onUploadFile={handleUploadFile}
            placeholder="Hai completato l'allenamento? Raccontalo qui!"
            disabled={false}
          />
        </div>
      </footer>
    </div>
  )
}

export default function AthleteChatPage() {
  // Rimuoviamo Suspense per evitare animazione durante refresh
  // Il componente gestisce già i suoi stati di loading internamente
  return <AthleteChatPageContent />
}
