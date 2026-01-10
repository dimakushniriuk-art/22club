'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:atleti:[id]:chat:page')
import { useChat } from '@/hooks/use-chat'
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, MessageCircle } from 'lucide-react'

interface AthleteProfile {
  id: string
  nome: string
  cognome: string
  role: string
}

export default function StaffChatPage() {
  // Estrai immediatamente il valore per evitare enumerazione di params (Next.js 15.5.9+)
  // Non memorizzare l'oggetto params per evitare enumerazione durante la serializzazione di React DevTools
  // Accedi direttamente alle proprietà senza memorizzare l'oggetto
  const athleteId = String(useParams().id || '')
  const router = useRouter()
  const {
    conversations,
    currentConversation,
    sendMessage,
    uploadFile,
    setCurrentConversation,
    isLoading,
    error,
    currentProfileId,
  } = useChat()

  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null)

  // Load athlete profile
  useEffect(() => {
    const loadAthleteProfile = async () => {
      if (!athleteId) return

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome, cognome, role')
          .eq('id', athleteId)
          .single()

        if (error) throw error
        setAthleteProfile(data)
      } catch (error) {
        logger.error('Error loading athlete profile', error, { athleteId })
      }
    }

    loadAthleteProfile()
  }, [athleteId])

  // Set current conversation when athlete profile loads
  useEffect(() => {
    if (athleteProfile && conversations.length > 0) {
      const conversation = conversations.find((c) => c.other_user_id === athleteProfile.id)
      if (conversation) {
        setCurrentConversation(conversation.other_user_id)
      }
    }
  }, [athleteProfile, conversations, setCurrentConversation])

  const handleSendMessage = async (
    message: string,
    type: 'text' | 'file',
    fileData?: { url: string; name: string; size: number },
  ) => {
    if (!athleteProfile) return

    try {
      await sendMessage(
        athleteProfile.id,
        message,
        type,
        fileData?.url,
        fileData?.name,
        fileData?.size,
      )
    } catch (error) {
      logger.error('Error sending message', error, { athleteId: athleteProfile.id })
    }
  }

  const handleUploadFile = async (file: File) => {
    try {
      return await uploadFile(file)
    } catch (error) {
      logger.error('Error uploading file', error, { athleteId })
      throw error
    }
  }

  if (isLoading && !athleteProfile) {
    return (
      <div className="h-full bg-background p-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-background-secondary h-12 rounded-lg" />
          <div className="bg-background-secondary h-96 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !athleteProfile) {
    return (
      <div className="h-full bg-background p-6">
        <Card className="p-6 text-center">
          <div className="mb-4 text-6xl">😞</div>
          <h2 className="text-text-primary mb-2 text-lg font-semibold">Atleta non trovato</h2>
          <p className="text-text-secondary mb-4 text-sm">
            {error || "L'atleta selezionato non esiste o non hai i permessi per visualizzarlo."}
          </p>
          <Button onClick={() => router.push('/dashboard/atleti')}>Torna agli atleti</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="bg-background-secondary border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 items-center gap-3">
            <div className="bg-brand flex h-10 w-10 items-center justify-center rounded-full">
              <User className="text-brand-foreground h-5 w-5" />
            </div>
            <div>
              <h1 className="text-text-primary font-semibold">
                {athleteProfile.nome} {athleteProfile.cognome}
              </h1>
              <p className="text-text-tertiary text-sm">
                {athleteProfile.role === 'atleta' ? 'Atleta' : 'Staff'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentConversation?.participant.unread_count &&
              currentConversation.participant.unread_count > 0 && (
                <Badge variant="success" size="sm">
                  {currentConversation.participant.unread_count}
                </Badge>
              )}
            <MessageCircle className="text-text-tertiary h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col">
        <MessageList
          messages={currentConversation?.messages || []}
          currentUserId={currentProfileId ?? ''}
          isLoading={currentConversation?.isLoading}
          onLoadMore={() => {}}
          hasMore={currentConversation?.hasMore || false}
          className="flex-1"
        />
      </div>

      {/* Message Input */}
      <div className="bg-background-secondary border-t border-border p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onUploadFile={handleUploadFile}
          placeholder="Scrivi un consiglio motivazionale..."
          disabled={!currentConversation}
        />
      </div>
    </div>
  )
}
