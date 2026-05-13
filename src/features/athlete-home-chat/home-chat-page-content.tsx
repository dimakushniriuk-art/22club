'use client'

import type { ReactNode } from 'react'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/hooks/use-chat'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { useMyTrainerProfile } from '@/hooks/use-my-trainer-profile'
import { isValidProfile, isValidUUID, isValidMessageType } from '@/lib/utils/type-guards'
import { validateNonEmptyString } from '@/lib/utils/validation'
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, MessageSquare, User } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { AthleteTopBarContext } from '@/components/athlete'

const logger = createLogger('app:home:chat:page')

/** Stesso accento della `HomeAthleteTopChrome` (linea cyan in basso sull’header → in alto sul footer chat). */
const ATHLETE_HOME_CYAN_ACCENT_LINE = {
  background: 'linear-gradient(to right, transparent 0%, rgb(34 211 238) 50%, transparent 100%)',
} as const

/** Padding come il wrapper della `secondaryRow` in `home-layout-client` + safe-area in basso. */
const ATHLETE_CHAT_FOOTER_INNER_CLASS =
  'relative z-10 w-full px-3 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:px-4 md:px-6 md:pt-2 md:pb-[calc(0.625rem+env(safe-area-inset-bottom))]'

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

function ChatErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="rounded-xl border border-state-error/25 bg-[#0b141a] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] p-6 md:p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-state-error/15 ring-1 ring-state-error/25">
        <AlertTriangle className="h-7 w-7 text-state-error" aria-hidden />
      </div>
      <h2 className="text-text-primary text-sm md:text-base font-semibold mb-1.5">
        Errore nel caricamento
      </h2>
      <p className="text-text-secondary mb-5 text-xs md:text-sm leading-relaxed">{error}</p>
      <Button
        onClick={onRetry}
        aria-label="Riprova a caricare le conversazioni"
        className="rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/10 min-h-[44px] text-text-primary"
      >
        Riprova
      </Button>
    </Card>
  )
}

function ChatEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="rounded-xl border border-white/10 bg-[#0b141a] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:24px_24px] p-6 md:p-8 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
        <MessageSquare className="h-7 w-7 text-cyan-400/90" aria-hidden />
      </div>
      <h2 className="text-text-primary text-sm md:text-base font-semibold mb-2">{title}</h2>
      <p className="text-text-secondary text-xs md:text-sm leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
    </Card>
  )
}

function ChatLoadingCard() {
  return (
    <Card className="overflow-hidden rounded-xl border border-white/10 bg-[#0b141a] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex min-h-[140px] flex-col items-center justify-center gap-4 p-6 md:p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400/80" aria-hidden />
        <div className="w-full max-w-[200px] space-y-2" aria-hidden>
          <div className="h-2.5 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-2.5 w-1/2 animate-pulse rounded bg-white/10" />
        </div>
        <p className="text-xs text-text-tertiary">Caricamento…</p>
      </div>
    </Card>
  )
}

function ChatLoadingFullPage({ footerChildren }: { footerChildren?: ReactNode }) {
  return (
    <div className="flex flex-col min-h-0 flex-1 bg-background w-full max-w-full overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden" aria-hidden />
      <footer className="relative z-20 w-full shrink-0 overflow-hidden border-t border-white/10 bg-black">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px"
          style={ATHLETE_HOME_CYAN_ACCENT_LINE}
          aria-hidden
        />
        <div className={ATHLETE_CHAT_FOOTER_INNER_CLASS}>
          {footerChildren ?? (
            <div className="min-h-[52px] rounded-xl border border-white/10 bg-white/[0.04]" />
          )}
        </div>
      </footer>
    </div>
  )
}

function ChatRecipientSecondaryRow({
  availableRecipients,
  currentConversationId,
  onSelectRecipient,
  displayName,
  displayRole,
  avatarUrl,
}: {
  availableRecipients: ChatRecipient[]
  currentConversationId: string | null
  onSelectRecipient: (id: string) => void
  displayName: string
  displayRole: string
  avatarUrl: string | null
}) {
  return (
    <div
      role="tablist"
      aria-label="Seleziona con chi chattare"
      className="relative z-10 -mx-1 flex snap-x snap-mandatory items-center gap-2 overflow-x-auto overflow-y-hidden px-1 pb-1 custom-scrollbar md:gap-3"
    >
      {availableRecipients.length >= 1 ? (
        availableRecipients.map((r) => {
          const isSelected = (currentConversationId ?? availableRecipients[0]?.id) === r.id
          const name = `${r.nome} ${r.cognome}`.trim() || roleLabel(r.role)
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              onClick={() => onSelectRecipient(r.id)}
              className={cn(
                'flex snap-start items-center gap-2 shrink-0 rounded-xl p-2 md:p-2.5 border text-left transition-all duration-200',
                isSelected
                  ? 'border-cyan-500/35 bg-white/[0.12] ring-1 ring-cyan-500/25 shadow-[0_0_20px_-8px_rgba(34,211,238,0.35)]'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]',
              )}
              aria-label={`Chatta con ${name}, ${roleLabel(r.role)}`}
              aria-selected={isSelected}
            >
              <div className="relative h-9 w-9 md:h-10 md:w-10 shrink-0 rounded-full overflow-hidden border border-white/10 bg-white/5">
                {r.avatar_url ? (
                  <Image src={r.avatar_url} alt={name} fill className="object-cover" sizes="40px" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-cyan-400">
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate max-w-[120px] md:max-w-[160px]">
                  {name}
                </p>
                <p className="text-[10px] md:text-xs text-text-tertiary truncate max-w-[120px] md:max-w-[160px]">
                  {roleLabel(r.role)}
                </p>
              </div>
            </button>
          )
        })
      ) : (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {avatarUrl ? (
            <div className="relative h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-full overflow-hidden border border-white/10 bg-white/5">
              <Image src={avatarUrl} alt={displayName} fill className="object-cover" sizes="40px" />
            </div>
          ) : (
            <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <User className="h-5 w-5 text-cyan-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm md:text-base font-semibold text-text-primary truncate">
              {displayName}
            </p>
            <p className="text-text-tertiary text-[10px] md:text-xs truncate">{displayRole}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function AthleteChatInteractive() {
  const router = useRouter()
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

  const { data: trainerRow, isPending: trainerPending } = useMyTrainerProfile(Boolean(user?.id))
  const personalTrainer = useMemo((): PersonalTrainer | null => {
    if (!trainerRow?.pt_id) return null
    return {
      id: trainerRow.pt_id,
      nome: trainerRow.pt_nome ?? 'Personal',
      cognome: trainerRow.pt_cognome ?? 'Trainer',
      role: 'trainer',
      avatar_url: trainerRow.pt_avatar_url ?? null,
    }
  }, [trainerRow])
  const loadingPT = Boolean(user?.id) && trainerPending

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

  const chatBarDisplayName = useMemo(() => {
    if (!effectiveConversation) return ''
    if (selectedRecipient) {
      return (
        `${selectedRecipient.nome} ${selectedRecipient.cognome}`.trim() ||
        roleLabel(selectedRecipient.role)
      )
    }
    return effectiveConversation.participant.other_user_name || 'Utente'
  }, [effectiveConversation, selectedRecipient])

  const chatBarDisplayRole = useMemo(() => {
    if (!effectiveConversation) return ''
    if (selectedRecipient) return roleLabel(selectedRecipient.role)
    const r = effectiveConversation.participant.other_user_role
    if (r === 'nutrizionista') return 'Nutrizionista'
    if (r === 'massaggiatore') return 'Massaggiatore'
    return 'Trainer'
  }, [effectiveConversation, selectedRecipient])

  const chatBarAvatarUrl = useMemo(() => {
    if (!effectiveConversation) return null
    return effectiveConversation.participant.avatar ?? selectedRecipient?.avatar_url ?? null
  }, [effectiveConversation, selectedRecipient])

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

  const loadingRecipients = loadingPT

  const setTopBarConfig = useContext(AthleteTopBarContext)?.setConfig

  const chatSecondaryRow = useMemo(() => {
    if (!effectiveConversation) return null
    if (conversations.length === 0 && availableRecipients.length === 0) return null
    return (
      <ChatRecipientSecondaryRow
        availableRecipients={availableRecipients}
        currentConversationId={currentConversationId}
        onSelectRecipient={handleRecipientChange}
        displayName={chatBarDisplayName}
        displayRole={chatBarDisplayRole}
        avatarUrl={chatBarAvatarUrl}
      />
    )
  }, [
    effectiveConversation,
    conversations.length,
    availableRecipients,
    currentConversationId,
    handleRecipientChange,
    chatBarDisplayName,
    chatBarDisplayRole,
    chatBarAvatarUrl,
  ])

  const hasEffectiveConversation = Boolean(effectiveConversation)
  const recipientIdsKey = useMemo(
    () => availableRecipients.map((r) => r.id).join(','),
    [availableRecipients],
  )

  const handleBackRef = useRef(handleBack)
  handleBackRef.current = handleBack
  const chatSecondaryRowRef = useRef<ReactNode>(null)
  chatSecondaryRowRef.current = chatSecondaryRow

  useEffect(() => {
    if (!setTopBarConfig) return
    const clear = () => setTopBarConfig(null)
    const onBack = () => handleBackRef.current()

    if (authLoading) {
      setTopBarConfig({
        title: 'Chat',
        subtitle: 'Caricamento…',
        onBack,
      })
      return clear
    }
    if (!user || !isValidUser) {
      clear()
      return clear
    }
    if (error) {
      setTopBarConfig({
        title: 'Chat',
        subtitle: 'Messaggi con il tuo trainer',
        onBack,
      })
      return clear
    }
    if (conversations.length === 0 && availableRecipients.length === 0) {
      if (loadingRecipients) {
        setTopBarConfig({
          title: 'Chat',
          subtitle: 'Caricamento…',
          onBack,
        })
      } else {
        setTopBarConfig({
          title: 'Chat',
          subtitle: 'Nessun trainer assegnato',
          onBack,
        })
      }
      return clear
    }
    if (!hasEffectiveConversation) {
      setTopBarConfig({
        title: 'Chat',
        subtitle: 'Selezionando conversazione…',
        onBack,
      })
      return clear
    }

    const sub =
      chatBarDisplayName && chatBarDisplayRole
        ? `${chatBarDisplayName} — ${chatBarDisplayRole}`
        : chatBarDisplayName || chatBarDisplayRole || undefined
    setTopBarConfig({
      title: 'Chat',
      subtitle: sub,
      onBack,
      secondaryRow: chatSecondaryRowRef.current ?? undefined,
    })
    return clear
  }, [
    setTopBarConfig,
    authLoading,
    user,
    user?.id,
    isValidUser,
    error,
    conversations.length,
    availableRecipients.length,
    loadingRecipients,
    hasEffectiveConversation,
    chatBarDisplayName,
    chatBarDisplayRole,
    currentConversationId,
    recipientIdsKey,
    chatBarAvatarUrl,
  ])

  if (authLoading) {
    return <ChatLoadingFullPage />
  }

  // Se non c'è user dopo il caricamento, mostra contenuto vuoto (il layout gestirà il redirect)
  if (!user || !isValidUser) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col bg-background w-full max-w-full p-3 sm:px-4 md:px-6"
        role="main"
        aria-label="Chat - caricamento"
      >
        {/* Contenuto vuoto - il layout gestirà il redirect */}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-[#0b141a]">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-8 pt-2 safe-area-inset-bottom sm:px-4 md:px-6 md:pb-10">
          <ChatErrorState error={error} onRetry={fetchConversations} />
        </div>
      </div>
    )
  }

  if (conversations.length === 0 && availableRecipients.length === 0) {
    if (loadingRecipients) {
      return (
        <div className="flex min-h-0 flex-1 flex-col bg-[#0b141a]">
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-8 pt-2 safe-area-inset-bottom sm:px-4 md:px-6">
            <ChatLoadingCard />
          </div>
        </div>
      )
    }
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-[#0b141a]">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-8 pt-2 safe-area-inset-bottom sm:px-4 md:px-6">
          <ChatEmptyState
            title="Nessun trainer assegnato"
            description="Quando il tuo club ti assegna un trainer, potrai scrivere qui e ricevere messaggi."
          />
        </div>
      </div>
    )
  }

  if (!effectiveConversation) {
    return (
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-[#0b141a] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:24px_24px] px-6 py-12"
        role="status"
        aria-live="polite"
        aria-label="Caricamento conversazione"
      >
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400/85" aria-hidden />
        <div className="text-center">
          <p className="text-sm font-medium text-[#e9edef]">Caricamento conversazione</p>
          <p className="mt-1 text-xs text-[#8696a0]">Attendi un attimo…</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col w-full max-w-full overflow-hidden bg-[#0b141a]"
      role="main"
      aria-label="Chat"
    >
      <main
        className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden"
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
          className="min-h-0 flex-1 w-full"
        />
      </main>

      {/* Footer NON fixed: con AthleteHomeViewportScale (transform: scale) un antenato
          trasformato diventa containing block per i figli `position: fixed`, quindi
          `bottom: 0` punterebbe al div scalato (alto 100dvh/scale) e non alla viewport.
          Tenendolo come flex child del wrapper `flex-col`, resta sempre in basso e
          si comporta correttamente anche con tastiera virtuale (dvh aggiornato). */}
      <footer
        className="relative z-10 w-full shrink-0 overflow-hidden border-t border-white/10 bg-black"
        aria-label="Input messaggio"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px"
          style={ATHLETE_HOME_CYAN_ACCENT_LINE}
          aria-hidden
        />
        <div className={ATHLETE_CHAT_FOOTER_INNER_CLASS}>
          <MessageInput
            onSendMessage={handleSendMessage}
            onUploadFile={handleUploadFile}
            placeholder="Hai completato l'allenamento? Raccontalo qui!"
            disabled={false}
            variant="whatsapp-dark"
          />
        </div>
      </footer>
    </div>
  )
}

function AthleteChatPageContent() {
  const { user, loading: authLoading } = useAuth()
  const isValidUser = user && isValidProfile(user)
  const [chatReady, setChatReady] = useState(false)

  useEffect(() => {
    if (authLoading || !isValidUser) {
      setChatReady(false)
      return
    }
    const idleId =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(() => setChatReady(true))
        : undefined
    const timeoutId =
      idleId === undefined ? window.setTimeout(() => setChatReady(true), 0) : undefined
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [authLoading, isValidUser])

  if (authLoading || !chatReady) {
    return <ChatLoadingFullPage />
  }

  return <AthleteChatInteractive />
}

export function HomeChatPageContent() {
  // Rimuoviamo Suspense per evitare animazione durante refresh
  // Il componente gestisce già i suoi stati di loading internamente
  return <AthleteChatPageContent />
}
