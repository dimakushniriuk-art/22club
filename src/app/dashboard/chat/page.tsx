'use client'

import { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useChat } from '@/hooks/use-chat'
import { useChatHiddenConversations } from '@/hooks/use-chat-hidden-conversations'
import { useChatPageGuard } from '@/hooks/use-chat-page-guard'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { ConversationParticipant } from '@/types/chat'
import { ChatEmptyState, ConversationList } from '@/components/chat'
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { ArrowLeft, MessageCircle } from 'lucide-react'

const logger = createLogger('app:dashboard:chat:page')
const CHAT_LAST_WITH_KEY = 'chat-last-with'

const PLACEHOLDER_BY_ROLE: Record<string, string> = {
  massaggiatore: 'Scrivi un messaggio...',
  nutrizionista: 'Scrivi un messaggio...',
}
const DEFAULT_PLACEHOLDER = 'Scrivi un consiglio motivazionale...'

import { CHAT_THEME_CLASSES, type ChatTheme } from '@/components/chat/chat-theme'

const SHADOW_SPORT = 'shadow-[0_10px_30px_rgba(0,0,0,0.45)]'

const CONTAINER_CLASS =
  'flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full'

function StaffChatPageSkeleton() {
  return (
    <div className={CONTAINER_CLASS}>
      <div className="animate-pulse flex flex-col gap-4 sm:gap-6 flex-1 min-h-0">
        <div className="flex items-center gap-4">
          <div className="bg-background-secondary/50 h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1">
            <div className="bg-background-secondary/50 h-7 w-32 rounded-lg" />
            <div className="mt-2 bg-background-secondary/30 h-4 w-48 rounded-lg" />
          </div>
        </div>
        <div className="flex flex-1 min-h-0 gap-4 sm:gap-6">
          <div className="w-full lg:w-[320px] bg-background-secondary/30 rounded-3xl min-h-[300px]" />
          <div className="flex-1 bg-background-secondary/30 rounded-3xl min-h-[300px]" />
        </div>
      </div>
    </div>
  )
}

const _StaffChatErrorState = memo(function StaffChatErrorState({
  error,
  onRetry,
}: {
  error: string
  onRetry: () => void
}) {
  const def = CHAT_THEME_CLASSES.default
  return (
    <div className={CONTAINER_CLASS}>
      <div
        className={`relative overflow-hidden rounded-3xl ${def.glass} ${def.frame} ${SHADOW_SPORT} p-6 sm:p-8 text-center`}
      >
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary border border-primary/22">
            <MessageCircle className="h-7 w-7" />
          </div>
        </div>
        <h2 className="text-text-primary mb-2 text-lg font-semibold">Errore nel caricamento</h2>
        <p className="text-text-secondary mb-4 text-sm">{error}</p>
        <Button
          onClick={onRetry}
          className="rounded-full bg-gradient-to-br from-primary/90 to-primary/80 text-white font-semibold shadow-md shadow-primary/25 ring-1 ring-primary/30 hover:shadow-glow transition-all duration-200"
        >
          Riprova
        </Button>
      </div>
    </div>
  )
})

const CHAT_LOADING_CLASS = 'flex min-h-[50vh] items-center justify-center bg-background'

type ChatPageContentProps = { basePath?: string }

export function ChatPageContent({ basePath = '/dashboard/chat' }: ChatPageContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const withParam = searchParams.get('with') ?? null
  const supabase = useSupabaseClient()
  const { role } = useAuth()
  const chatTheme: ChatTheme =
    role === 'massaggiatore' ? 'amber' : role === 'nutrizionista' ? 'teal' : 'default'
  const t = CHAT_THEME_CLASSES[chatTheme]
  const {
    conversations,
    currentConversation,
    sendMessage,
    uploadFile,
    setCurrentConversation,
    loadMoreMessages,
    isLoading,
    error,
    currentProfileId,
  } = useChat()

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [requestedParticipant, setRequestedParticipant] = useState<ConversationParticipant | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [hasMessageDraft, setHasMessageDraft] = useState(false)
  const [showLeaveDraftConfirm, setShowLeaveDraftConfirm] = useState(false)
  const [pendingBackAction, setPendingBackAction] = useState<'list' | 'browser' | null>(null)
  const userClearedListRef = useRef(false)

  const { hiddenConversationIds, setHiddenConversationIds } = useChatHiddenConversations({
    profileId: currentProfileId ?? null,
    withParam,
    setSelectedConversationId,
    setCurrentConversation,
  })

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 851px)')
    const handler = () => setIsMobile(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Sincronizza selezione da URL: senza ?with= nessuna conversazione aperta (es. back del browser)
  useEffect(() => {
    if (!withParam) setSelectedConversationId(null)
  }, [withParam])

  const visibleConversations = useMemo(() => {
    const base = conversations.filter((c) => !hiddenConversationIds.has(c.other_user_id))
    if (
      withParam &&
      requestedParticipant &&
      requestedParticipant.other_user_id === withParam &&
      !base.some((c) => c.other_user_id === withParam)
    ) {
      return [requestedParticipant, ...base]
    }
    return base
  }, [conversations, hiddenConversationIds, withParam, requestedParticipant])

  const messagePlaceholder = (role && PLACEHOLDER_BY_ROLE[role]) || DEFAULT_PLACEHOLDER
  const totalUnreadCount = useMemo(
    () => visibleConversations.reduce((sum, conv) => sum + conv.unread_count, 0),
    [visibleConversations]
  )

  // Persistenza ultima conversazione
  useEffect(() => {
    if (withParam) {
      userClearedListRef.current = false
      try {
        localStorage.setItem(CHAT_LAST_WITH_KEY, withParam)
      } catch {
        // ignore
      }
    }
  }, [withParam])

  useEffect(() => {
    if (error || (isLoading && conversations.length === 0)) return
    if (withParam) return
    if (userClearedListRef.current) return
    try {
      const lastWith = localStorage.getItem(CHAT_LAST_WITH_KEY)
      if (lastWith) router.replace(`${basePath}?with=${lastWith}`, { scroll: false })
    } catch {
      // ignore
    }
  }, [error, isLoading, conversations.length, withParam, router, basePath])

  // Prefetch chunk chat
  useEffect(() => {
    import('@/components/chat')
  }, [])

  // Se ?with= è un utente non in lista (es. mai scritto), carica profilo e mostralo in lista
  useEffect(() => {
    if (!withParam) {
      setRequestedParticipant(null)
      return
    }
    let cancelled = false
    const run = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, nome, cognome, role, avatar')
        .eq('id', withParam)
        .maybeSingle()
      if (cancelled || !data) return
      const name = [data.nome, data.cognome].filter(Boolean).join(' ') || 'Utente'
      setRequestedParticipant({
        other_user_id: data.id,
        other_user_name: name,
        other_user_role: (data.role as string) ?? 'athlete',
        last_message_at: '',
        unread_count: 0,
        avatar: data.avatar ?? null,
      })
    }
    run()
    return () => {
      cancelled = true
    }
  }, [withParam, supabase])

  // Solo messaggi della conversazione selezionata (filtro di sicurezza per ID)
  const messagesForSelected = useMemo(() => {
    if (!selectedConversationId || !currentConversation?.participant.other_user_id) return []
    if (currentConversation.participant.other_user_id !== selectedConversationId) return []
    return currentConversation.messages.filter(
      (m) => m.sender_id === selectedConversationId || m.receiver_id === selectedConversationId,
    )
  }, [selectedConversationId, currentConversation?.participant.other_user_id, currentConversation?.messages])

  const handleSelectConversation = useCallback(
    async (userId: string) => {
      setSelectedConversationId(userId)
      await setCurrentConversation(userId)
      router.replace(`${basePath}?with=${userId}`, { scroll: false })
    },
    [setCurrentConversation, router, basePath]
  )

  const doBackToList = useCallback(() => {
    userClearedListRef.current = true
    setSelectedConversationId(null)
    router.replace(basePath, { scroll: false })
  }, [router, basePath])

  const handleBackToList = useCallback(() => {
    if (hasMessageDraft) {
      setPendingBackAction('list')
      setShowLeaveDraftConfirm(true)
      return
    }
    doBackToList()
  }, [hasMessageDraft, doBackToList])

  const handleHeaderBack = useCallback(() => {
    if (selectedConversationId && hasMessageDraft) {
      setPendingBackAction('browser')
      setShowLeaveDraftConfirm(true)
      return
    }
    router.back()
  }, [selectedConversationId, hasMessageDraft, router])

  const handleConfirmLeaveDraft = useCallback(() => {
    setShowLeaveDraftConfirm(false)
    if (pendingBackAction === 'list') {
      setPendingBackAction(null)
      doBackToList()
    } else if (pendingBackAction === 'browser') {
      setPendingBackAction(null)
      router.back()
    }
  }, [pendingBackAction, doBackToList, router])

  const handleRemoveFromList = useCallback((userId: string) => {
    setHiddenConversationIds((prev) => new Set([...prev, userId]))
    setSelectedConversationId((prev) => (prev === userId ? null : prev))
  }, [setHiddenConversationIds])

  const handleSendMessage = useCallback(
    async (
      message: string,
      type: 'text' | 'file',
      fileData?: { url: string; name: string; size: number },
    ) => {
      if (!selectedConversationId) return
      try {
        await sendMessage(
          selectedConversationId,
          message,
          type,
          fileData?.url,
          fileData?.name,
          fileData?.size,
        )
      } catch (err) {
        logger.error('Error sending message', err, { conversationId: selectedConversationId })
      }
    },
    [selectedConversationId, sendMessage]
  )

  const handleUploadFile = useCallback(
    async (file: File) => {
      try {
        return await uploadFile(file)
      } catch (err) {
        logger.error('Error uploading file', err, { conversationId: selectedConversationId })
        throw err
      }
    },
    [uploadFile, selectedConversationId]
  )

  const handleLoadMore = useCallback(() => {
    void loadMoreMessages()
  }, [loadMoreMessages])

  const showListOnly = isMobile && !selectedConversationId
  const showConversationOnly = isMobile && !!selectedConversationId

  const handleRetry = useCallback(() => router.refresh(), [router])

  if (isLoading && conversations.length === 0) {
    return <StaffChatPageSkeleton />
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 max-h-full overflow-hidden w-full min-w-0 max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-6 gap-4 sm:gap-6">
      {/* Banner errore con retry (non full-page) */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <p className="text-sm text-red-200">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="border-red-500/40 text-red-200 hover:bg-red-500/20 shrink-0"
          >
            Riprova
          </Button>
        </div>
      )}

      {/* Header - compatto, back 44px su mobile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleHeaderBack}
            className={`min-h-[44px] min-w-[44px] transition-colors touch-manipulation shrink-0 ${t.backButton}`}
            aria-label="Indietro"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-text-primary text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
              Chat
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm">
              {chatTheme === 'amber' ? 'Messaggi con i tuoi clienti' : 'Messaggi con i tuoi atleti'}
            </p>
            <div className={`mt-2 h-[3px] w-28 rounded-full ${t.underline}`} />
          </div>
        </div>
        <div role="status" aria-live="polite" className="sr-only">
          {selectedConversationId
            ? `Chat con ${currentConversation?.participant.other_user_name ?? 'utente'}`
            : `${visibleConversations.length} conversazioni`}
        </div>
        {totalUnreadCount > 0 && (
          <Badge variant="success" size="sm" className="shrink-0">
            {totalUnreadCount}
          </Badge>
        )}
      </div>

      {/* Main: su mobile vista singola (lista o conversazione), su desktop due pannelli */}
      <div className="flex flex-1 min-h-0 min-w-0 gap-4 sm:gap-6 overflow-hidden">
        {/* Pannello lista conversazioni: nascosto su mobile quando una chat è aperta */}
        {(!isMobile || showListOnly) && (
          <div
            className={`w-full lg:w-[320px] shrink-0 flex flex-col min-h-0 overflow-hidden rounded-3xl ${t.glass} ${t.frame} ${SHADOW_SPORT}`}
          >
            <ConversationList
              conversations={visibleConversations}
              currentConversationId={selectedConversationId || undefined}
              onSelectConversation={handleSelectConversation}
              onRemoveFromList={handleRemoveFromList}
              className="h-full min-h-0 flex-1"
              theme={chatTheme}
            />
          </div>
        )}

        {/* Pannello messaggi + input: su mobile mostrato solo con conversazione selezionata, con back */}
        {(!isMobile || showConversationOnly) && (
          <div
            className={`flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden rounded-3xl ${t.glass} ${t.frame} ${SHADOW_SPORT}`}
          >
            {showConversationOnly && (
              <div className="flex items-center gap-2 shrink-0 px-3 py-2 border-b border-white/10 min-h-[44px]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className={`min-h-[44px] min-w-[44px] ${t.backButton}`}
                  aria-label="Torna alla lista"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium text-text-primary truncate">
                  {currentConversation?.participant.other_user_name ?? 'Chat'}
                </span>
              </div>
            )}
            {selectedConversationId && currentConversation?.participant.other_user_id === selectedConversationId ? (
              <>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <MessageList
                    messages={messagesForSelected}
                    currentUserId={currentProfileId ?? ''}
                    isLoading={currentConversation.isLoading}
                    onLoadMore={handleLoadMore}
                    hasMore={currentConversation.hasMore}
                    className="flex-1 min-h-0"
                  />
                </div>
                <div className="border-t border-white/10 bg-background-secondary/25 px-4 py-3 sm:p-4 shrink-0 rounded-b-3xl">
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    onUploadFile={handleUploadFile}
                    placeholder={messagePlaceholder}
                    onDraftChange={setHasMessageDraft}
                  />
                </div>
              </>
            ) : selectedConversationId ? (
              <ChatEmptyState variant="loading" theme={chatTheme} />
            ) : (
              <ChatEmptyState variant="select" theme={chatTheme} />
            )}
          </div>
        )}
      </div>

      {showLeaveDraftConfirm && (
        <ConfirmDialog
          open={showLeaveDraftConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setShowLeaveDraftConfirm(false)
              setPendingBackAction(null)
            }
          }}
          title="Messaggio non inviato"
          description="Hai un messaggio in bozza. Uscire lo annullerà. Continuare?"
          confirmText="Esci"
          cancelText="Resta"
          variant="destructive"
          onConfirm={handleConfirmLeaveDraft}
        />
      )}
    </div>
  )
}

export default function StaffChatPage() {
  const { showLoader: showGuardLoader } = useChatPageGuard()
  if (showGuardLoader) {
    return (
      <div className={CHAT_LOADING_CLASS}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }
  return <ChatPageContent />
}
