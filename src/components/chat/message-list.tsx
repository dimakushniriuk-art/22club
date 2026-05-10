'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Download, Eye, Check, CheckCheck, Trash2, MoreVertical, MessageSquare } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const logger = createLogger('components:chat:message-list')

/** Sfondo area messaggi (palette ispirata a WhatsApp dark) */
const CHAT_WALLPAPER =
  'bg-[#0b141a] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:24px_24px]'

const BUBBLE_IN =
  'rounded-2xl rounded-bl-md bg-[#202c33] text-[#e9edef] shadow-[0_1px_0.5px_rgba(0,0,0,0.3)]'
const BUBBLE_OUT =
  'rounded-2xl rounded-br-md bg-[#005c4b] text-[#e9edef] shadow-[0_1px_0.5px_rgba(0,0,0,0.25)]'

type ChatFilePreviewState = {
  href: string
  fileUrl: string
  fileName: string
  kind: 'image' | 'pdf' | 'other'
}

/** Estensione → anteprima inline (immagine vs iframe PDF / altro). */
function previewKindFromFileName(fileName: string): ChatFilePreviewState['kind'] {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image'
  if (ext === 'pdf') return 'pdf'
  return 'other'
}

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
  /** Es. padding-bottom quando il composer è `position: fixed` sopra l’area scroll. */
  scrollAreaClassName?: string
}

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  onDeleteMessage,
  className,
  scrollAreaClassName,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesStartRef = useRef<HTMLDivElement>(null)
  /** Ref allo scroller interno: evitiamo `scrollIntoView` che, in presenza di un
      antenato con `transform: scale()` (es. AthleteHomeViewportScale), può scrollare
      anche il documento e far "saltare" la pagina dopo l'invio. */
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  /** Id messaggio per cui sono visibili le azioni (bottone Elimina); null = tutti mostrano i 3 puntini */
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null)
  const [filePreview, setFilePreview] = useState<ChatFilePreviewState | null>(null)

  const openFilePreview = useCallback((message: ChatMessage) => {
    if (!message.file_url) return
    const href = documentsFilePreviewHref(message.file_url)
    if (!href) {
      notifyError('Anteprima non disponibile', 'Impossibile risolvere il percorso del file.')
      return
    }
    const fileName = message.file_name?.trim() || 'Allegato'
    setFilePreview({
      href,
      fileUrl: message.file_url,
      fileName,
      kind: previewKindFromFileName(fileName),
    })
  }, [])

  // Auto-scroll to bottom on new messages — usiamo scrollTo sul container così lo scroll
  // resta confinato all'area messaggi e non propaga ad antenati (document/body).
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
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
    const isRead = Boolean(message.read_at)

    const timeClass = isOwn ? 'text-white/55' : 'text-[#8696a0]'
    const tickClass = isRead ? 'text-emerald-400' : 'text-[#8696a0]'

    return (
      <div
        key={message.id}
        className={cn('flex px-1 py-0.5 group', isOwn ? 'justify-end' : 'justify-start')}
      >
        <div
          className={cn('max-w-[min(75%,520px)] space-y-0.5', isOwn ? 'items-end' : 'items-start')}
        >
          {message.type === 'text' ? (
            <div
              className={cn(
                'relative min-w-0 max-w-full overflow-hidden border-0',
                isOwn ? BUBBLE_OUT : BUBBLE_IN,
              )}
            >
              <div className="flex items-start gap-1.5 px-2.5 pt-1.5 pb-0.5 pl-2.5">
                <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.35] select-text flex-1 min-w-0">
                  {message.message}
                </p>
                {isOwn &&
                  onDeleteMessage &&
                  (expandedMessageId === message.id ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(message.id)}
                      className="h-6 w-6 shrink-0 rounded-full bg-red-600/95 hover:bg-red-600 text-white"
                      aria-label="Elimina messaggio"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedMessageId(message.id)}
                      className="h-6 w-6 shrink-0 rounded-full text-white/50 hover:text-white hover:bg-white/10"
                      aria-label="Azioni messaggio"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  ))}
              </div>
              <div
                className={cn(
                  'flex items-center gap-1 px-2 pb-1 pt-0',
                  isOwn ? 'justify-end pr-1.5' : 'justify-end pl-2 pr-1.5',
                )}
              >
                <span className={cn('text-[11px] tabular-nums leading-none', timeClass)}>
                  {formatTime(message.created_at)}
                </span>
                {isOwn && (
                  <span className={cn('shrink-0 inline-flex', tickClass)}>
                    {isRead ? (
                      <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
                    ) : (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
                    )}
                  </span>
                )}
              </div>
            </div>
          ) : message.type === 'file' ? (
            (() => {
              const fileLabel = message.file_name || 'Allegato'
              const previewHref = message.file_url
                ? documentsFilePreviewHref(message.file_url)
                : null
              const kind = previewKindFromFileName(fileLabel)
              const showInlineImage = Boolean(previewHref) && kind === 'image'
              const showPdfStrip = Boolean(previewHref) && kind === 'pdf'
              const showSideIcon = !showInlineImage && !showPdfStrip

              return (
                <div
                  className={cn(
                    'max-w-[min(20rem,85vw)] overflow-hidden border-0',
                    isOwn ? BUBBLE_OUT : BUBBLE_IN,
                  )}
                >
                  {showInlineImage && previewHref && (
                    <button
                      type="button"
                      onClick={() => openFilePreview(message)}
                      className={cn(
                        'relative block w-full overflow-hidden border-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                        isOwn ? 'focus-visible:ring-white/40' : 'focus-visible:ring-cyan-400/40',
                      )}
                      aria-label={`Anteprima ${fileLabel}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- URL same-origin document-preview */}
                      <img
                        src={previewHref}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="max-h-[168px] min-h-[88px] w-full bg-black/30 object-cover object-center"
                      />
                    </button>
                  )}
                  {showPdfStrip && previewHref && (
                    <button
                      type="button"
                      onClick={() => openFilePreview(message)}
                      className="flex w-full items-center gap-2 border-b border-white/10 bg-gradient-to-r from-red-950/50 to-black/40 px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400/40"
                      aria-label={`Apri PDF ${fileLabel}`}
                    >
                      <span className="flex h-10 w-9 shrink-0 items-center justify-center rounded shadow-sm bg-white text-[10px] font-bold leading-none text-red-600">
                        PDF
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[#e9edef]">{fileLabel}</p>
                        <p className="text-[10px] text-white/55">Tocca per l’anteprima</p>
                      </div>
                      <Eye className="h-4 w-4 shrink-0 text-white/45" aria-hidden />
                    </button>
                  )}
                  <div className="p-2.5">
                    <div className="flex items-start gap-2">
                      {showSideIcon && (
                        <div className="text-xl shrink-0 opacity-90">{getFileIcon(fileLabel)}</div>
                      )}
                      <div className="min-w-0 flex-1">
                        {!(showPdfStrip && previewHref) && (
                          <p className="truncate text-sm font-medium">{fileLabel}</p>
                        )}
                        <p className={cn('text-xs', isOwn ? 'text-white/55' : 'text-[#8696a0]')}>
                          {message.file_size ? `${Math.round(message.file_size / 1024)} KB` : ''}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openFilePreview(message)}
                            className={cn(
                              'h-7 px-2 text-xs rounded-md',
                              isOwn
                                ? 'text-[#e9edef] hover:bg-white/12'
                                : 'text-[#e9edef] hover:bg-white/10',
                            )}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Visualizza
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleFileDownload(message.file_url!, message.file_name!)
                            }
                            className={cn(
                              'h-7 px-2 text-xs rounded-md',
                              isOwn
                                ? 'text-[#e9edef] hover:bg-white/12'
                                : 'text-[#e9edef] hover:bg-white/10',
                            )}
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
                      'flex items-center gap-1 px-2 pb-1.5 pt-0',
                      isOwn ? 'justify-end pr-1.5' : 'justify-end pr-1.5',
                    )}
                  >
                    <span className={cn('text-[11px] tabular-nums leading-none', timeClass)}>
                      {formatTime(message.created_at)}
                    </span>
                    {isOwn && (
                      <span className={cn('shrink-0 inline-flex', tickClass)}>
                        {isRead ? (
                          <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.25} />
                        ) : (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
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
                          className="h-6 w-6 shrink-0 rounded-full bg-red-600/95 hover:bg-red-600 text-white ml-0.5"
                          aria-label="Elimina messaggio"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpandedMessageId(message.id)}
                          className="h-6 w-6 shrink-0 rounded-full text-white/50 hover:text-white hover:bg-white/10 ml-0.5"
                          aria-label="Azioni messaggio"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      ))}
                  </div>
                </div>
              )
            })()
          ) : (
            <div className={cn('px-3 py-2 rounded-2xl rounded-bl-md border-0', BUBBLE_IN)}>
              <p className="text-[#8696a0] text-sm italic">{message.message}</p>
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
          <div className="flex justify-center px-3 pt-3 pb-1 shrink-0 bg-[#0b141a]">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-xs rounded-full border-0 bg-[#182229] text-[#aebac1] hover:bg-[#1f2c33] hover:text-[#e9edef] shadow-sm"
            >
              {isLoading ? 'Caricamento...' : 'Carica messaggi precedenti'}
            </Button>
          </div>
        )}

        {/* Messages - raggruppati per data; scroll interno così l’input resta sul fondo del pannello chat */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y',
            CHAT_WALLPAPER,
            'px-1.5 sm:px-2 py-2',
            scrollAreaClassName,
          )}
        >
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
                    <div key={g.dateKey} className="space-y-0.5">
                      <div className="flex justify-center py-2.5 px-4">
                        <span className="rounded-full bg-[#182229]/95 px-3 py-1 text-center text-[11.5px] font-medium leading-tight text-[#aebac1] shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                          {g.label}
                        </span>
                      </div>
                      {g.msgs.map((msg) => renderMessage(msg))}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )
            })()
          ) : (
            <div className="flex h-full min-h-[min(200px,40dvh)] items-center justify-center px-4 py-8">
              <div className="max-w-[280px] text-center">
                {isLoading ? (
                  <>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#202c33] ring-1 ring-white/10">
                      <MessageSquare className="h-6 w-6 animate-pulse text-[#8696a0]" aria-hidden />
                    </div>
                    <p className="text-sm text-[#8696a0]">Caricamento messaggi…</p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#202c33] ring-1 ring-white/10">
                      <MessageSquare className="h-7 w-7 text-cyan-500/70" aria-hidden />
                    </div>
                    <p className="text-sm font-medium text-[#aebac1]">Nessun messaggio ancora</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#8696a0]">
                      Scrivi qui sotto per iniziare la conversazione con il tuo referente.
                    </p>
                  </>
                )}
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

      <Dialog open={filePreview != null} onOpenChange={(open) => !open && setFilePreview(null)}>
        <DialogContent className="flex max-h-[92dvh] max-w-[min(56rem,calc(100vw-2rem))] flex-col gap-3 p-4 pt-14">
          {filePreview ? (
            <>
              <DialogHeader className="shrink-0 space-y-1 pr-8">
                <DialogTitle className="truncate text-base font-semibold text-text-primary">
                  {filePreview.fileName}
                </DialogTitle>
                <p className="text-xs text-text-tertiary">Anteprima allegato</p>
              </DialogHeader>
              <div className="min-h-[240px] flex-1 overflow-auto rounded-xl border border-white/10 bg-black/60">
                {filePreview.kind === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element -- blob/stream da same-origin `/api/document-preview`
                  <img
                    src={filePreview.href}
                    alt=""
                    className="mx-auto block max-h-[min(72dvh,680px)] w-auto max-w-full object-contain p-2"
                  />
                ) : (
                  <iframe
                    src={filePreview.href}
                    title={filePreview.fileName}
                    className="h-[min(72dvh,680px)] w-full min-h-[320px] rounded-xl border-0 bg-[#1a1a1a]"
                  />
                )}
              </div>
              <DialogFooter className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15"
                  onClick={() => handleFileDownload(filePreview.fileUrl, filePreview.fileName)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Scarica
                </Button>
                <Button type="button" variant="secondary" onClick={() => setFilePreview(null)}>
                  Chiudi
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
