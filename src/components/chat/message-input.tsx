'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:chat:message-input')
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EmojiPicker } from './emoji-picker'
import { FileUpload } from './file-upload'
import { Send, Paperclip } from 'lucide-react'
import type { ChatFile } from '@/types/chat'

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
}

export function MessageInput({
  onSendMessage,
  onUploadFile,
  disabled = false,
  placeholder = 'Scrivi un consiglio motivazionale...',
  className,
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<ChatFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
        alert('Errore nel caricamento del file')
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
            className="max-h-32 min-h-[44px] resize-none pr-24 bg-background-secondary/80 border-teal-500/30 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/30 transition-all duration-200 rounded-xl"
            rows={1}
          />

          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
            {showFileUpload && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={disabled || isUploading}
                className="h-8 w-8 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-all duration-200"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            )}

            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
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
          className="h-11 w-11 shrink-0 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
