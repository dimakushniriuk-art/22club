'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/hooks/use-chat'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:chat:page')
import { ConversationList } from '@/components/chat/conversation-list'
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MessageCircle } from 'lucide-react'

export default function StaffChatPage() {
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

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const handleSelectConversation = async (userId: string) => {
    setSelectedConversationId(userId)
    await setCurrentConversation(userId)
  }

  const handleSendMessage = async (
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
    } catch (error) {
      logger.error('Error sending message', error, { conversationId: selectedConversationId })
    }
  }

  const handleUploadFile = async (file: File) => {
    try {
      return await uploadFile(file)
    } catch (error) {
      logger.error('Error uploading file', error, { conversationId: selectedConversationId })
      throw error
    }
  }

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0)

  if (isLoading && conversations.length === 0) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
          <div className="animate-pulse space-y-4">
            <div className="bg-background-secondary h-12 rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background-secondary h-96 rounded-lg" />
              <div className="bg-background-secondary col-span-2 h-96 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-lg shadow-teal-500/10 backdrop-blur-xl p-6 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
            <div className="relative">
              <div className="mb-4 flex justify-center">
                <div className="bg-red-500/20 text-red-400 rounded-full p-6">
                  <MessageCircle className="h-12 w-12" />
                </div>
              </div>
              <h2 className="text-text-primary mb-2 text-lg font-semibold">
                Errore nel caricamento
              </h2>
              <p className="text-text-secondary mb-4 text-sm">{error}</p>
              <Button
                onClick={() => router.refresh()}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
              >
                Riprova
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-cyan-500/5 via-transparent to-transparent" />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-b border-teal-500/20 p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
          <div className="relative flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-teal-400 hover:bg-teal-500/10 hover:text-teal-300 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="bg-teal-500/20 text-teal-400 rounded-full p-2">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-text-primary text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Chat
                </h1>
                <p className="text-text-secondary text-xs">Messaggi con i tuoi atleti</p>
              </div>
              {totalUnreadCount > 0 && (
                <Badge variant="success" size="sm">
                  {totalUnreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Conversations List */}
          <div className="w-80 border-r border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            <ConversationList
              conversations={conversations}
              currentConversationId={selectedConversationId || undefined}
              onSelectConversation={handleSelectConversation}
              className="h-full relative z-10"
            />
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
            {selectedConversationId && currentConversation ? (
              <>
                {/* Messages */}
                <div className="relative z-10 flex flex-1 flex-col">
                  <MessageList
                    messages={currentConversation.messages}
                    currentUserId={currentProfileId ?? ''}
                    isLoading={currentConversation.isLoading}
                    onLoadMore={() => {}}
                    hasMore={currentConversation.hasMore}
                    className="flex-1"
                  />
                </div>

                {/* Message Input */}
                <div className="relative z-10 border-t border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
                  <div className="relative">
                    <MessageInput
                      onSendMessage={handleSendMessage}
                      onUploadFile={handleUploadFile}
                      placeholder="Scrivi un consiglio motivazionale..."
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="relative z-10 flex flex-1 items-center justify-center">
                <Card
                  variant="trainer"
                  className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-lg shadow-teal-500/10 backdrop-blur-xl p-8 text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
                  <div className="relative">
                    <div className="mb-4 flex justify-center">
                      <div className="bg-teal-500/20 text-teal-400 rounded-full p-6">
                        <MessageCircle className="h-12 w-12" />
                      </div>
                    </div>
                    <h3 className="text-text-primary mb-2 text-lg font-semibold">
                      Seleziona una conversazione
                    </h3>
                    <p className="text-text-secondary text-sm">
                      Scegli un atleta dalla lista per iniziare a chattare
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
