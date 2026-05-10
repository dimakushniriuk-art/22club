'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { Button } from '@/components/ui/button'

const logger = createLogger('components:chat:message-input')
import { Textarea } from '@/components/ui/textarea'
import { EmojiPicker } from './emoji-picker'
import { FileUpload } from './file-upload'
import { Send, Paperclip } from 'lucide-react'
import type { ChatFile } from '@/types/chat'

export type MessageInputVariant = 'default' | 'whatsapp-dark'

interface MessageInputProps {
  onSendMessage: (
    message: string,
    type: 'text' | 'file',
    fileData?: { url: string; name: string; size: number },
  ) => void
  onUploadFile: (file: File) => Promise<{ url: string; name: string; size: number }>
  disabled?: boolean
  placeholder?: string
  className?: string
  /** Notifica quando c'è una bozza (testo o file non inviato) per conferma uscita */
  onDraftChange?: (hasDraft: boolean) => void
  /** Stile barra input (es. chat atleta allineata a MessageList WA) */
  variant?: MessageInputVariant
}

export function MessageInput({
  onSendMessage,
  onUploadFile,
  disabled = false,
  placeholder = 'Scrivi un consiglio motivazionale...',
  className,
  onDraftChange,
  variant = 'default',
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<ChatFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasDraft = !!(message.trim() || selectedFile)
  useEffect(() => {
    onDraftChange?.(hasDraft)
  }, [hasDraft, onDraftChange])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSend = async () => {
    if (disabled || (!message.trim() && !selectedFile)) return

    if (selectedFile) {
      setIsUploading(true)
      try {
        const fileData = await onUploadFile(selectedFile.file)
        onSendMessage(selectedFile.file.name, 'file', fileData)
        setSelectedFile(null)
      } catch (error) {
        logger.error('Error uploading file', error, { fileName: selectedFile.file.name })
        notifyError('Errore upload', 'Impossibile caricare il file. Riprova.')
      } finally {
        setIsUploading(false)
      }
    } else {
      onSendMessage(message.trim(), 'text')
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    textareaRef.current?.focus()
  }

  const handleFileSelect = (file: ChatFile) => {
    setSelectedFile(file)
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
  }

  const canSend = message.trim() || selectedFile
  const showFileUpload = !selectedFile
  const isWa = variant === 'whatsapp-dark'

  return (
    <div className={cn('space-y-3', className)}>
      {selectedFile && (
        <FileUpload
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
        />
      )}

      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className={cn(
              // text-base (16px) evita l'auto-zoom di iOS Safari al focus su input/textarea
              // con font < 16px (causa principale del "tutto si ingrandisce" sul telefono).
              'max-h-32 resize-none pr-24 text-base transition-all duration-200',
              isWa
                ? 'min-h-[52px] rounded-xl border border-white/10 bg-white/[0.04] text-text-primary placeholder:text-text-tertiary shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/30'
                : 'min-h-[44px] rounded-lg border border-white/10 bg-white/[0.04] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/20',
            )}
            rows={1}
          />

          <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {showFileUpload && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={disabled || isUploading}
                className={cn(
                  'min-h-[44px] min-w-[44px] h-8 w-8 rounded-lg transition-all duration-200 touch-manipulation',
                  isWa
                    ? 'border-0 text-text-tertiary hover:text-text-primary hover:bg-white/[0.08] rounded-full'
                    : 'text-text-secondary hover:text-primary hover:bg-white/5',
                )}
                aria-label="Allega file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            )}

            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              className={
                isWa
                  ? 'border-0 text-text-tertiary hover:text-text-primary hover:bg-white/[0.08] rounded-full'
                  : 'text-text-secondary hover:text-primary hover:bg-white/5'
              }
            />
          </div>

          <input
            id="file-input"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const fileType = file.type.startsWith('image/')
                  ? 'image'
                  : file.type === 'application/pdf'
                    ? 'pdf'
                    : 'other'
                const preview = fileType === 'image' ? URL.createObjectURL(file) : undefined
                handleFileSelect({
                  file,
                  preview,
                  type: fileType as 'image' | 'pdf' | 'other',
                })
              }
            }}
            className="hidden"
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !canSend || isUploading}
          size="icon"
          className={cn(
            'min-h-[44px] min-w-[44px] shrink-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation',
            isWa
              ? 'h-[52px] w-[52px] rounded-xl border border-cyan-500/35 bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_18px_-6px_rgba(34,211,238,0.45)]'
              : 'h-11 w-11 rounded-lg border border-white/10 bg-primary text-primary-foreground hover:bg-primary/90',
          )}
          aria-label="Invia messaggio"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
