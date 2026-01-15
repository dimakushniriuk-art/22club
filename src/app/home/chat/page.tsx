'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useChat } from '@/hooks/use-chat'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID, isValidMessageType } from '@/lib/utils/type-guards'
import { validateNonEmptyString } from '@/lib/utils/validation'

const logger = createLogger('app:home:chat:page')
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, MessageCircle } from 'lucide-react'
import Image from 'next/image'

interface PersonalTrainer {
  id: string
  nome: string
  cognome: string
  role: string
  avatar_url?: string | null
}

function AthleteChatPageContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
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
    if (!isValidUser || !user?.id) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('currentUserId vuoto', { isValidUser, userId: user?.id, user })
      }
      return ''
    }
    const profileId = isValidUUID(user.id) ? user.id : ''

    if (process.env.NODE_ENV === 'development') {
      logger.debug('currentUserId impostato', { profileId, userId: user.id, user_id: user.user_id })
    }
    return profileId
  }, [user, isValidUser])

  const [personalTrainer, setPersonalTrainer] = useState<PersonalTrainer | null>(null)
  const [loadingPT, setLoadingPT] = useState(true)

  // Carica il Personal Trainer dell'atleta
  useEffect(() => {
    const loadPersonalTrainer = async () => {
      // user?.id da useAuth() è già profiles.id, usiamolo direttamente
      if (!user?.id) {
        setLoadingPT(false)
        return
      }

      try {
        setLoadingPT(true)
        // Usa client stabile già definito sopra invece di crearne uno nuovo

        // user?.id è già profiles.id, usiamolo direttamente come athleteProfileId
        const athleteProfileId = user.id

        // Recupera il PT assegnato (query semplificata senza foreign key join)
        const { data: ptRelation, error: ptError } = await supabase
          .from('pt_atleti')
          .select('pt_id')
          .eq('atleta_id', athleteProfileId)
          .maybeSingle()

        if (ptError) {
          logger.warn('Error fetching PT relation', ptError, { athleteProfileId })
          setLoadingPT(false)
          return
        }

        // Tipizza esplicitamente per evitare problemi di inferenza TypeScript
        type PtRelation = { pt_id: string } | null
        const typedPtRelation = ptRelation as PtRelation

        if (typedPtRelation?.pt_id) {
          const ptId = typedPtRelation.pt_id
          // Recupera i dati del profilo PT separatamente
          const { data: ptProfile, error: ptProfileError } = await supabase
            .from('profiles')
            .select('id, nome, cognome, role, avatar, avatar_url')
            .eq('id', ptId)
            .maybeSingle()

          if (ptProfileError) {
            logger.warn('Error fetching PT profile', ptProfileError, { ptId })
            setLoadingPT(false)
            return
          }

          // Tipizza esplicitamente per evitare problemi di inferenza TypeScript
          type PtProfileSelect = {
            id: string
            nome: string | null
            cognome: string | null
            role: string | null
            avatar?: string | null
            avatar_url?: string | null
          } | null
          const typedPtProfile = ptProfile as PtProfileSelect

          if (typedPtProfile?.id) {
            // Usa avatar_url se disponibile, altrimenti avatar
            const avatarUrl = typedPtProfile.avatar_url || typedPtProfile.avatar || null
            setPersonalTrainer({
              id: typedPtProfile.id,
              nome: typedPtProfile.nome ?? 'Personal',
              cognome: typedPtProfile.cognome ?? 'Trainer',
              role: typedPtProfile.role ?? 'pt',
              avatar_url: avatarUrl,
            })
          }
        }
      } catch (error) {
        logger.error('Error loading personal trainer', error)
      } finally {
        setLoadingPT(false)
      }
    }

    loadPersonalTrainer()
  }, [user?.id, supabase])

  // Memoizza currentConversationId per evitare loop infiniti
  // Usa un valore primitivo stabile invece dell'oggetto currentConversation
  const currentConversationId = useMemo(() => {
    if (!currentConversation?.participant?.other_user_id) return null
    return currentConversation.participant.other_user_id
  }, [currentConversation?.participant?.other_user_id])

  // Ref per tracciare se abbiamo già auto-selezionato una conversazione
  const hasAutoSelectedRef = useRef(false)

  // Auto-select first conversation (PT ha priorità)
  // NOTA: Questo useEffect deve essere chiamato prima di qualsiasi early return
  useEffect(() => {
    // Solo auto-seleziona se non c'è già una conversazione selezionata
    // E se non abbiamo già auto-selezionato
    if (conversations.length > 0 && !currentConversationId && !hasAutoSelectedRef.current) {
      logger.debug('Auto-selecting conversation', {
        conversationsCount: conversations.length,
        conversations: conversations.map((c) => ({
          other_user_id: c.other_user_id,
          other_user_name: c.other_user_name,
          other_user_role: c.other_user_role,
        })),
      })

      // Trova la conversazione con il PT (priorità) o la prima disponibile
      const ptConversation = conversations.find((c) => c.other_user_role === 'pt')
      const conversationToSelect = ptConversation || conversations[0]
      if (conversationToSelect) {
        logger.debug('Selecting conversation', {
          other_user_id: conversationToSelect.other_user_id,
          other_user_name: conversationToSelect.other_user_name,
          other_user_role: conversationToSelect.other_user_role,
        })
        hasAutoSelectedRef.current = true
        setCurrentConversation(conversationToSelect.other_user_id).catch((err) => {
          logger.error('Error selecting conversation', err, {
            other_user_id: conversationToSelect.other_user_id,
          })
          hasAutoSelectedRef.current = false // Reset su errore
        })
      }
    } else if (
      conversations.length === 0 &&
      personalTrainer &&
      !loadingPT &&
      !currentConversationId &&
      !hasAutoSelectedRef.current
    ) {
      // Se non ci sono conversazioni ma c'è un PT, prova a selezionare direttamente il PT
      // Questo permette di vedere i messaggi anche se fetchConversations non li trova
      logger.debug('No conversations but PT available - trying to select PT directly', {
        ptId: personalTrainer.id,
        ptName: `${personalTrainer.nome} ${personalTrainer.cognome}`,
        currentUserId,
      })

      // Prova a selezionare direttamente il PT per vedere se ci sono messaggi
      hasAutoSelectedRef.current = true
      setCurrentConversation(personalTrainer.id).catch((err) => {
        logger.error('Error selecting PT conversation directly', err, {
          ptId: personalTrainer.id,
        })
        hasAutoSelectedRef.current = false // Reset su errore
      })
    }
    // IMPORTANTE: Usa currentConversationId (primitivo) invece di currentConversation (oggetto)
    // per evitare loop infiniti
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.length, currentConversationId, personalTrainer?.id, loadingPT, currentUserId])

  // Se stiamo ancora caricando l'autenticazione, mostra skeleton loader
  // Questo previene la pagina nera durante il refresh
  if (authLoading) {
    return (
      <div
        className="flex min-h-[874px] min-w-[402px] flex-col bg-black"
        style={{ overflow: 'auto' }}
      >
        {/* Header Skeleton - Design Moderno e Uniforme */}
        <div className="relative overflow-hidden rounded-b-xl border-b border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10 z-10 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-background-tertiary rounded animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-4 w-28 bg-background-tertiary rounded animate-pulse" />
                <div className="h-3 w-20 bg-background-tertiary rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
          <div className="animate-pulse space-y-3 w-full px-3">
            <div className="bg-background-tertiary h-14 rounded-lg" />
            <div className="bg-background-tertiary h-14 rounded-lg" />
            <div className="bg-background-tertiary h-14 rounded-lg" />
          </div>
        </div>

        {/* Message Input Skeleton - Design Moderno e Uniforme */}
        <div className="relative overflow-hidden rounded-t-xl border-t border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10 z-10 flex-shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10 w-full">
            <div className="h-10 bg-background-tertiary rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // Se non c'è user dopo il caricamento, mostra contenuto vuoto (il layout gestirà il redirect)
  if (!user || !isValidUser) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] p-3"
        style={{ overflow: 'auto' }}
        role="main"
        aria-label="Chat - caricamento"
      >
        {/* Contenuto vuoto - il layout gestirà il redirect */}
      </div>
    )
  }

  const handleSendMessage = async (
    message: string,
    type: 'text' | 'file',
    fileData?: { url: string; name: string; size: number },
  ) => {
    // Type guard: valida tipo messaggio
    if (!isValidMessageType(type)) {
      notifyError('Errore validazione', 'Tipo messaggio non valido')
      return
    }

    // Validazione messaggio (solo per tipo text)
    if (type === 'text') {
      const messageValidation = validateNonEmptyString(message, 'Messaggio')
      if (!messageValidation.valid) {
        notifyError('Errore validazione', messageValidation.error || 'Messaggio non valido')
        return
      }
    }

    if (!currentConversation) {
      logger.warn('Cannot send message: no current conversation')
      notifyError('Errore', 'Nessuna conversazione selezionata')
      return
    }

    try {
      logger.debug('Sending message', {
        otherUserId: currentConversation.participant.other_user_id,
        messageLength: message.length,
        type,
        hasFile: !!fileData,
      })

      await sendMessage(
        currentConversation.participant.other_user_id,
        message,
        type,
        fileData?.url,
        fileData?.name,
        fileData?.size,
      )

      logger.debug('Message sent successfully', {
        otherUserId: currentConversation.participant.other_user_id,
      })
    } catch (error) {
      logger.error('Error sending message', error, {
        otherUserId: currentConversation?.participant.other_user_id,
        messageLength: message.length,
        type,
        hasFile: !!fileData,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      })
      throw error
    }
  }

  const handleUploadFile = async (file: File) => {
    try {
      return await uploadFile(file)
    } catch (error) {
      logger.error('Error uploading file', error)
      throw error
    }
  }

  // Non mostriamo skeleton durante il caricamento per evitare animazione non necessaria
  // Il componente mostrerà il contenuto non appena disponibile
  // if (isLoading && conversations.length === 0 && !currentConversation) {
  //   return (
  //     <div className="mx-auto max-w-md p-4 bg-black min-h-screen">
  //       <div className="animate-pulse space-y-4">
  //         <div className="bg-teal-900/50 h-12 rounded-lg" />
  //         <div className="bg-teal-900/50 h-96 rounded-lg" />
  //       </div>
  //     </div>
  //   )
  // }

  if (error) {
    return (
      <div className="bg-black min-w-[402px] min-h-[874px] p-3" style={{ overflow: 'auto' }}>
        <Card
          variant="default"
          className="relative overflow-hidden border border-red-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-red-400/60 transition-all duration-300 backdrop-blur-sm p-6 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 opacity-50" />
          <div className="relative z-10">
            <div className="mb-3 text-4xl opacity-50">😞</div>
            <h2 className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent mb-1.5">
              Errore nel caricamento
            </h2>
            <p className="text-text-secondary mb-4 text-xs">{error}</p>
            <Button
              onClick={() => {
                // Refetch selettivo invece di hard reload
                queryClient.invalidateQueries()
                queryClient.refetchQueries()
                // fetchConversations resetta error: null automaticamente
                fetchConversations()
              }}
              aria-label="Riprova a caricare le conversazioni"
              className="h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold transition-all duration-200 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-[1.02]"
            >
              Riprova
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const handleStartConversationWithPT = async () => {
    if (!personalTrainer) return

    try {
      logger.debug('Starting conversation with PT', {
        ptId: personalTrainer.id,
        ptName: `${personalTrainer.nome} ${personalTrainer.cognome}`,
      })

      // Seleziona la conversazione con il PT
      // Questo creerà la conversazione anche se non ci sono messaggi
      // I dati del PT verranno recuperati automaticamente da useChatConversations
      await setCurrentConversation(personalTrainer.id)

      logger.debug('Conversation started successfully', {
        ptId: personalTrainer.id,
      })
    } catch (error) {
      logger.error('Error starting conversation with PT', error, {
        ptId: personalTrainer.id,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      notifyError('Errore', 'Impossibile avviare la conversazione. Riprova più tardi.')
    }
  }

  // Se non ci sono conversazioni, mostra stato vuoto o loading
  if (conversations.length === 0) {
    // Se stiamo ancora caricando il PT, mostra loading
    if (loadingPT) {
      return (
        <div className="bg-black min-w-[402px] min-h-[874px] p-3" style={{ overflow: 'auto' }}>
          {/* Header - Design Moderno e Uniforme */}
          <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10 mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
            <div className="relative z-10 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                aria-label="Torna indietro"
                className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
                Chat
              </h1>
            </div>
          </div>
          <Card
            variant="default"
            className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
            <div className="relative z-10 p-8">
              <div className="animate-pulse space-y-4">
                <div className="bg-background-tertiary h-48 rounded-lg" />
              </div>
            </div>
          </Card>
        </div>
      )
    }

    // Se il PT è caricato, mostra stato vuoto
    return (
      <div className="bg-black min-w-[402px] min-h-[874px] p-3" style={{ overflow: 'auto' }}>
        {/* Header - Design Moderno e Uniforme */}
        <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10 mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
              Chat
            </h1>
          </div>
        </div>

        {personalTrainer ? (
          <Card
            variant="default"
            className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm p-4 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="mb-2.5 text-4xl opacity-50">💬</div>
              <h2 className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent mb-1.5">
                Inizia una conversazione
              </h2>
              <p className="text-text-secondary text-xs mb-3">Scrivere al tuo Personal Trainer</p>
              <div className="mb-3 rounded-lg border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-2.5 hover:border-teal-400/60 transition-all duration-300">
                <div className="flex items-center justify-center gap-2">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-500 flex h-8 w-8 items-center justify-center rounded-full shadow-lg shadow-teal-500/30 ring-2 ring-teal-400/20 flex-shrink-0">
                    <User className="text-white h-3.5 w-3.5" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-text-primary font-semibold text-white text-xs truncate">
                      {personalTrainer.nome} {personalTrainer.cognome}
                    </p>
                    <p className="text-text-secondary text-[10px] truncate">Personal Trainer</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleStartConversationWithPT}
                aria-label="Inizia una conversazione con il tuo Personal Trainer"
                className="w-full h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold transition-all duration-200 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-[1.02]"
              >
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                Inizia a chattare
              </Button>
              <p className="text-text-tertiary mt-2.5 text-[10px]">
                Motivazione, consigli, documenti… tutto qui! 💪
              </p>
            </div>
          </Card>
        ) : (
          <Card
            variant="default"
            className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm p-4 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="mb-2.5 text-4xl opacity-50">💬</div>
              <h2 className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent mb-1.5">
                Nessuna conversazione
              </h2>
              <p className="text-text-secondary text-xs mb-1.5">
                Qui puoi ricevere messaggi dal tuo trainer 💪
              </p>
              <p className="text-text-tertiary text-[10px]">
                Motivazione, consigli, documenti… tutto qui!
              </p>
            </div>
          </Card>
        )}
      </div>
    )
  }

  // Se ci sono conversazioni ma non c'è currentConversation, mostra loading
  // IMPORTANTE: Questo può succedere durante il caricamento iniziale o quando fetchConversations
  // viene chiamato da realtime. In questo caso, mostriamo uno stato di loading invece di una pagina nera.
  if (!currentConversation) {
    return (
      <div
        className="flex min-h-[874px] min-w-[402px] flex-col bg-black"
        style={{ overflow: 'auto' }}
      >
        {/* Header - Design Moderno e Uniforme */}
        <div className="relative overflow-hidden rounded-b-xl border-b border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10 z-10 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                aria-label="Torna indietro"
                className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex flex-1 items-center gap-2 min-w-0">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-500 flex h-8 w-8 items-center justify-center rounded-full shadow-lg shadow-teal-500/30 ring-2 ring-teal-400/20 flex-shrink-0">
                  <User className="text-white h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
                    Caricamento...
                  </h1>
                  <p className="text-text-secondary text-[10px] font-medium truncate">
                    Selezionando conversazione
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Loading */}
        <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
          <div className="animate-pulse space-y-3 w-full px-3">
            <div className="bg-background-tertiary h-14 rounded-lg" />
            <div className="bg-background-tertiary h-14 rounded-lg" />
            <div className="bg-background-tertiary h-14 rounded-lg" />
          </div>
        </div>

        {/* Message Input - Design Moderno e Uniforme */}
        <div className="relative overflow-hidden rounded-t-xl border-t border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10 z-10 flex-shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10 w-full">
            <MessageInput
              onSendMessage={handleSendMessage}
              onUploadFile={handleUploadFile}
              placeholder="Hai completato l'allenamento? Raccontalo qui!"
              disabled={true}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-[874px] min-w-[402px] flex-col bg-black"
      style={{ overflow: 'auto' }}
      role="main"
      aria-label="Chat"
    >
      {/* Header - Design Moderno e Uniforme */}
      <header className="relative overflow-hidden rounded-b-xl border-b border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10 z-10 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              aria-label="Torna indietro"
              className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-1 items-center gap-2 min-w-0">
              {(() => {
                // Determina l'avatar da mostrare: prima dalla conversazione, poi dal personalTrainer
                const avatarUrl =
                  currentConversation?.participant.avatar ||
                  (currentConversation?.participant.other_user_role === 'pt' &&
                  personalTrainer?.avatar_url
                    ? personalTrainer.avatar_url
                    : null)

                if (avatarUrl) {
                  return (
                    <div className="relative h-8 w-8 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-teal-400/20 shadow-lg shadow-teal-500/30">
                      <Image
                        src={avatarUrl}
                        alt={currentConversation?.participant.other_user_name || 'Trainer'}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  )
                }

                return (
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-500 flex h-8 w-8 items-center justify-center rounded-full shadow-lg shadow-teal-500/30 ring-2 ring-teal-400/20 flex-shrink-0">
                    <User className="text-white h-3.5 w-3.5" />
                  </div>
                )
              })()}
              <div className="flex-1 min-w-0">
                <h1 className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
                  {currentConversation?.participant.other_user_name || 'Trainer'}
                </h1>
                <p className="text-text-secondary text-[10px] font-medium truncate">
                  {currentConversation?.participant.other_user_role === 'pt'
                    ? 'Personal Trainer'
                    : 'Staff'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main
        className="flex-1 min-h-0 overflow-hidden flex flex-col"
        aria-label="Messaggi della conversazione"
      >
        <MessageList
          messages={currentConversation?.messages || []}
          currentUserId={currentUserId}
          isLoading={currentConversation?.isLoading}
          onLoadMore={loadMoreMessages}
          hasMore={currentConversation?.hasMore || false}
          onDeleteMessage={deleteMessage}
          className="h-full"
        />
      </main>

      {/* Message Input - Design Moderno e Uniforme */}
      <footer
        className="relative overflow-hidden rounded-t-xl border-t border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10 z-10 flex-shrink-0 flex items-center justify-center"
        aria-label="Input messaggio"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10 w-full">
          <MessageInput
            onSendMessage={handleSendMessage}
            onUploadFile={handleUploadFile}
            placeholder="Hai completato l'allenamento? Raccontalo qui!"
            disabled={!currentConversation}
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
