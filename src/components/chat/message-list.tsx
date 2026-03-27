'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Download, Eye, Check, CheckCheck, Trash2, MoreVertical } from 'lucide-react'
import type { ChatMessage } from '@/types/chat'
import { useIcon } from '@/components/ui/professional-icons'
import { createLogger } from '@/lib/logger'
import { formatTime } from '@/lib/format'
import { notifyError } from '@/lib/notifications'
import { documentsFilePreviewHref } from '@/lib/documents'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

const logger = createLogger('components:chat:message-list')

/** Restituisce "Oggi", "Ieri" o data breve (es. "12 mar") per i separatori di gruppo in chat */
function getDateGroupLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const key = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
  if (key(d) === key(today)) return 'Oggi'
  if (key(d) === key(yesterday)) return 'Ieri'
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  /** Id messaggio per cui sono visibili le azioni (bottone Elimina); null = tutti mostrano i 3 puntini */
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Prepara le icone per i file
  const imageIcon = useIcon('🖼️', { size: 16, className: 'text-primary' })
  const pdfIcon = useIcon('📄', { size: 16, className: 'text-primary' })
  const fileIcon = useIcon('📎', { size: 16, className: 'text-primary' })

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

  const openDeleteDialog = (messageId: string) => {
    if (!onDeleteMessage) {
      logger.warn('onDeleteMessage not provided')
      return
    }
    setMessageToDelete(messageId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!messageToDelete || !onDeleteMessage) return

    try {
      logger.debug('Attempting to delete message', { messageId: messageToDelete })
      const result = await onDeleteMessage(messageToDelete)
      logger.debug('Delete result', { messageId: messageToDelete, result })

      if (!result) {
        notifyError('Eliminazione fallita', 'Verifica di essere il mittente del messaggio.')
      }
    } catch (error) {
      logger.error('Error deleting message', error, { messageId: messageToDelete })
      notifyError(
        'Errore eliminazione',
        error instanceof Error ? error.message : 'Errore sconosciuto',
      )
    } finally {
      setMessageToDelete(null)
    }
  }

  const renderMessage = (message: ChatMessage) => {
    // Log per debug se currentUserId è vuoto
    if (!currentUserId && process.env.NODE_ENV === 'development') {
      logger.warn('currentUserId is empty!', {
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
        className={cn('mb-1 flex group', isOwn ? 'justify-end' : 'justify-start')}
      >
        <div className={cn('max-w-[75%] space-y-1', isOwn ? 'items-end' : 'items-start')}>
          {message.type === 'text' ? (
            <div
              className={cn(
                'relative min-w-0 max-w-full overflow-hidden rounded-[18px] border border-white/20 bg-zinc-800/80 text-zinc-100 shadow-md',
                isOwn ? 'rounded-br-[6px]' : 'rounded-bl-[6px]',
              )}
            >
              <div className="flex items-start gap-2 px-3 pt-2 pb-0.5">
                <p className="whitespace-pre-wrap break-words text-[14px] leading-snug select-text flex-1 min-w-0">
                  {message.message}
                </p>
                {isOwn &&
                  onDeleteMessage &&
                  (expandedMessageId === message.id ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(message.id)}
                      className="h-6 w-6 shrink-0 rounded-full bg-red-500/90 hover:bg-red-500 text-white"
                      aria-label="Elimina messaggio"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedMessageId(message.id)}
                      className="h-6 w-6 shrink-0 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10"
                      aria-label="Azioni messaggio"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  ))}
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 px-3 pb-1.5 pt-0',
                  isOwn ? 'justify-end' : 'justify-start',
                )}
              >
                <span className="text-[10px] tabular-nums text-zinc-400">
                  {formatTime(message.created_at)}
                </span>
                {isOwn && (
                  <span className="shrink-0 text-zinc-400">
                    {isRead ? (
                      <CheckCheck className="h-3.5 w-3.5" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </span>
                )}
              </div>
            </div>
          ) : message.type === 'file' ? (
            <div
              className={cn(
                'max-w-xs overflow-hidden',
                'rounded-[18px] border border-white/20 bg-zinc-800/80 text-zinc-100 shadow-md',
                isOwn ? 'rounded-br-[6px]' : 'rounded-bl-[6px]',
              )}
            >
              <div className="p-2.5">
                <div className="flex items-start gap-2">
                  <div className="text-xl shrink-0">{getFileIcon(message.file_name || '')}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{message.file_name}</p>
                    <p className="text-xs text-zinc-400">
                      {message.file_size ? `${Math.round(message.file_size / 1024)} KB` : ''}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const href = message.file_url
                            ? documentsFilePreviewHref(message.file_url)
                            : null
                          if (href) window.open(href, '_blank', 'noopener,noreferrer')
                        }}
                        className="h-7 px-2 text-xs rounded-md text-zinc-300 hover:bg-white/10"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Visualizza
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDownload(message.file_url!, message.file_name!)}
                        className="h-7 px-2 text-xs rounded-md text-zinc-300 hover:bg-white/10"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Scarica
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 px-3 pb-1.5 pt-0',
                  isOwn ? 'justify-end' : 'justify-start',
                )}
              >
                <span className="text-[10px] tabular-nums text-zinc-400">
                  {formatTime(message.created_at)}
                </span>
                {isOwn && (
                  <span className="shrink-0 text-zinc-400">
                    {isRead ? (
                      <CheckCheck className="h-3.5 w-3.5" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </span>
                )}
                {isOwn &&
                  onDeleteMessage &&
                  (expandedMessageId === message.id ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(message.id)}
                      className="h-6 w-6 shrink-0 rounded-full bg-red-500/90 hover:bg-red-500 text-white ml-0.5"
                      aria-label="Elimina messaggio"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedMessageId(message.id)}
                      className="h-6 w-6 shrink-0 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10 ml-0.5"
                      aria-label="Azioni messaggio"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  ))}
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 rounded-[18px] border border-white/20 bg-zinc-800/60">
              <p className="text-zinc-400 text-sm italic">{message.message}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn('flex flex-col min-h-0 w-full', className)}>
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center p-4 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-xs rounded-lg border border-white/10 hover:border-primary/20 hover:bg-white/[0.04]"
            >
              {isLoading ? 'Caricamento...' : 'Carica messaggi precedenti'}
            </Button>
          </div>
        )}

        {/* Messages - raggruppati per data con label Oggi / Ieri / data */}
        <div className="flex-1 min-h-0 space-y-1">
          {messages.length > 0 ? (
            (() => {
              const groups: { dateKey: string; label: string; msgs: ChatMessage[] }[] = []
              let currentKey = ''
              let currentGroup: ChatMessage[] = []
              messages.forEach((msg) => {
                const d = new Date(msg.created_at)
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                if (key !== currentKey) {
                  if (currentGroup.length)
                    groups.push({
                      dateKey: currentKey,
                      label: getDateGroupLabel(currentGroup[0].created_at),
                      msgs: currentGroup,
                    })
                  currentKey = key
                  currentGroup = [msg]
                } else {
                  currentGroup.push(msg)
                }
              })
              if (currentGroup.length)
                groups.push({
                  dateKey: currentKey,
                  label: getDateGroupLabel(currentGroup[0].created_at),
                  msgs: currentGroup,
                })
              return (
                <>
                  <div ref={messagesStartRef} />
                  {groups.map((g) => (
                    <div key={g.dateKey} className="space-y-1">
                      <div className="flex justify-center py-2">
                        <span className="text-[10px] font-medium text-zinc-500">{g.label}</span>
                      </div>
                      {g.msgs.map((msg) => renderMessage(msg))}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )
            })()
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center">
              <div className="text-text-secondary text-sm">
                {isLoading
                  ? 'Caricamento messaggi...'
                  : 'Nessun messaggio. Invia un messaggio per iniziare.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AlertDialog per conferma eliminazione */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setExpandedMessageId(null)
        }}
      >
        <AlertDialogContent className="bg-background-secondary border border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Elimina messaggio</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo messaggio? Questa azione non può essere
              annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border border-white/10 hover:border-primary/20">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
