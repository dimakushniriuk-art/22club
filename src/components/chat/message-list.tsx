'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Download, Eye, Check, CheckCheck, Trash2 } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'
import { useIcon } from '@/components/ui/professional-icons'

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  onDeleteMessage?: (messageId: string) => Promise<boolean>
  className?: string
}

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  onDeleteMessage,
  className,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesStartRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Prepara le icone per i file
  const imageIcon = useIcon('🖼️', { size: 16, className: 'text-teal-400' })
  const pdfIcon = useIcon('📄', { size: 16, className: 'text-teal-400' })
  const fileIcon = useIcon('📎', { size: 16, className: 'text-teal-400' })

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return imageIcon
    }
    if (ext === 'pdf') {
      return pdfIcon
    }
    return fileIcon
  }

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!onDeleteMessage) {
      console.warn('[MessageList] onDeleteMessage not provided')
      return
    }

    // Conferma prima di eliminare
    if (!confirm('Sei sicuro di voler eliminare questo messaggio?')) {
      return
    }

    try {
      console.log('[MessageList] Attempting to delete message', { messageId })
      const result = await onDeleteMessage(messageId)
      console.log('[MessageList] Delete result', { messageId, result })

      if (!result) {
        alert(
          'Errore: impossibile eliminare il messaggio. Verifica di essere il mittente del messaggio.',
        )
      }
    } catch (error) {
      console.error('[MessageList] Error deleting message', error)
      alert(
        `Errore nell'eliminazione del messaggio: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
      )
    }
  }

  const renderMessage = (message: ChatMessage) => {
    // Log per debug se currentUserId è vuoto
    if (!currentUserId && process.env.NODE_ENV === 'development') {
      console.warn('[MessageList] currentUserId is empty!', {
        messageId: message.id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
      })
    }

    const isOwn = message.sender_id === currentUserId
    const isRead = message.read_at !== null

    return (
      <div
        key={message.id}
        className={cn('mb-2 flex group', isOwn ? 'justify-end' : 'justify-start')}
      >
        <div className={cn('max-w-[75%] space-y-1', isOwn ? 'items-end' : 'items-start')}>
          {message.type === 'text' ? (
            <div
              className={cn(
                'px-4 py-2.5 shadow-lg relative',
                isOwn
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm border border-teal-400/30'
                  : 'bg-background-secondary text-text-primary rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl border border-teal-500/20',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed flex-1">
                  {message.message}
                </p>
                {isOwn && onDeleteMessage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMessage(message.id)}
                    className="h-6 w-6 rounded-full bg-red-500/80 hover:bg-red-600 active:bg-red-700 text-white opacity-80 hover:opacity-100 transition-all shadow-md hover:shadow-lg hover:scale-110 flex-shrink-0"
                    aria-label="Elimina messaggio"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="mt-1 flex items-center justify-end gap-1">
                <span className={cn('text-[11px]', isOwn ? 'text-teal-50' : 'text-text-secondary')}>
                  {formatTime(message.created_at)}
                </span>
                {isOwn && (
                  <div className="flex items-center ml-1">
                    {isRead ? (
                      <CheckCheck className="h-3.5 w-3.5 text-teal-50" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-teal-50" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : message.type === 'file' ? (
            <div
              className={cn(
                'max-w-xs p-3 shadow-lg relative',
                isOwn
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm border border-teal-400/30'
                  : 'bg-background-secondary text-text-primary rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl border border-teal-500/20',
              )}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getFileIcon(message.file_name || '')}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{message.file_name}</p>
                      <p className={cn('text-xs', isOwn ? 'text-teal-50' : 'text-text-secondary')}>
                        {message.file_size ? `${Math.round(message.file_size / 1024)} KB` : ''}
                      </p>
                    </div>
                    {isOwn && onDeleteMessage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMessage(message.id)}
                        className="h-6 w-6 rounded-full bg-red-500/80 hover:bg-red-600 active:bg-red-700 text-white opacity-80 hover:opacity-100 transition-all shadow-md hover:shadow-lg hover:scale-110 flex-shrink-0"
                        aria-label="Elimina messaggio"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(message.file_url, '_blank')}
                      className={cn(
                        'h-7 px-2 text-xs',
                        isOwn
                          ? 'text-white hover:bg-teal-600/30'
                          : 'text-text-primary hover:bg-teal-500/10',
                      )}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Visualizza
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileDownload(message.file_url!, message.file_name!)}
                      className={cn(
                        'h-7 px-2 text-xs',
                        isOwn
                          ? 'text-white hover:bg-teal-600/30'
                          : 'text-text-primary hover:bg-teal-500/10',
                      )}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Scarica
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-end gap-1">
                <span className={cn('text-[11px]', isOwn ? 'text-teal-50' : 'text-text-secondary')}>
                  {formatTime(message.created_at)}
                </span>
                {isOwn && (
                  <div className="flex items-center ml-1">
                    {isRead ? (
                      <CheckCheck className="h-3.5 w-3.5 text-teal-50" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-teal-50" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-background-secondary/50 px-3 py-2 rounded-lg border border-teal-500/20">
              <p className="text-text-secondary text-sm italic">{message.message}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-xs border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50"
          >
            {isLoading ? 'Caricamento...' : 'Carica messaggi precedenti'}
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto p-4 bg-background min-h-0">
        {messages.length > 0 ? (
          <>
            <div ref={messagesStartRef} />
            {messages.map((msg) => {
              // Log per debug - rimuovere in produzione
              if (process.env.NODE_ENV === 'development') {
                console.log('[MessageList] Rendering message', {
                  id: msg.id,
                  sender_id: msg.sender_id,
                  receiver_id: msg.receiver_id,
                  currentUserId,
                  isOwn: msg.sender_id === currentUserId,
                  message_preview: msg.message.substring(0, 30),
                })
              }
              return renderMessage(msg)
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-text-secondary text-sm">Caricamento messaggi...</div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
