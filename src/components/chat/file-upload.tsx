'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import type { ChatFile } from '@/types/chat'

interface FileUploadProps {
  onFileSelect: (file: ChatFile) => void
  onFileRemove: () => void
  selectedFile: ChatFile | null
  className?: string
}

const ACCEPTED_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  'application/pdf': ['.pdf'],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert('Il file è troppo grande. Dimensione massima: 10MB')
      return
    }

    const fileType = file.type.startsWith('image/')
      ? 'image'
      : file.type === 'application/pdf'
        ? 'pdf'
        : 'other'

    let preview: string | undefined
    if (fileType === 'image') {
      preview = URL.createObjectURL(file)
    }

    onFileSelect({
      file,
      preview,
      type: fileType as 'image' | 'pdf' | 'other',
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  if (selectedFile) {
    return (
      <div
        className={cn(
          'bg-background-secondary/50 border border-teal-500/20 flex items-center gap-2 rounded-lg p-2',
          className,
        )}
      >
        {selectedFile.type === 'image' && selectedFile.preview ? (
          <Image
            src={selectedFile.preview}
            alt="Preview"
            width={32}
            height={32}
            className="h-8 w-8 rounded object-cover border border-teal-500/20"
          />
        ) : (
          <div className="bg-teal-500/20 text-teal-400 flex h-8 w-8 items-center justify-center rounded">
            {getFileIcon(selectedFile.file.type)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-text-primary truncate text-sm font-medium">{selectedFile.file.name}</p>
          <p className="text-text-secondary text-xs">{formatFileSize(selectedFile.file.size)}</p>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onFileRemove}
          className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed border-teal-500/30 p-4 transition-colors bg-background-secondary/30',
        isDragOver ? 'border-teal-500 bg-teal-500/10' : 'hover:border-teal-500/50',
        className,
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={Object.keys(ACCEPTED_TYPES).join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-2">
        <Paperclip className="text-teal-400 h-8 w-8" />
        <div className="text-center">
          <p className="text-text-primary text-sm font-medium">
            Trascina un file qui o{' '}
            <button
              onClick={openFileDialog}
              className="text-teal-400 hover:text-teal-300 hover:underline"
            >
              seleziona
            </button>
          </p>
          <p className="text-text-secondary mt-1 text-xs">PDF, JPG, PNG (max 10MB)</p>
        </div>
      </div>
    </div>
  )
}
