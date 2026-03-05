'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:documents:document-uploader')
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { SimpleSelect } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Progress } from '@/components/ui'
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
  File,
} from 'lucide-react'

interface DocumentUploaderProps {
  onUpload?: (file: File, category: string, expiresAt?: string, notes?: string) => Promise<void>
  onCancel?: () => void
  variant?: 'staff' | 'athlete'
  className?: string
}

const CATEGORIES = [
  { value: 'certificato', label: 'Certificato' },
  { value: 'liberatoria', label: 'Liberatoria' },
  { value: 'contratto', label: 'Contratto' },
  { value: 'altro', label: 'Altro' },
]

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export function DocumentUploader({
  onUpload,
  onCancel,
  variant = 'athlete',
  className = '',
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato file non supportato. Usa PDF, JPG o PNG.'
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File troppo grande. Massimo 20MB.'
    }

    return null
  }

  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selectedFile)
    setError('')
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect],
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !category) {
      setError('Seleziona un file e una categoria')
      return
    }

    try {
      setUploading(true)
      setError('')
      setUploadProgress(0)

      // Simula upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simula upload
      await new Promise((resolve) => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Chiama callback
      if (onUpload) {
        await onUpload(file, category, expiresAt || undefined, notes || undefined)
      }

      setSuccess(true)

      // Reset dopo 2 secondi
      setTimeout(() => {
        setFile(null)
        setCategory('')
        setExpiresAt('')
        setNotes('')
        setUploadProgress(0)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError("Errore durante l'upload. Riprova.")
      logger.error('Upload error', err)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    } else if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-teal-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const isStaff = variant === 'staff'

  return (
    <Card className={`mx-auto w-full max-w-2xl ${className}`}>
      <CardHeader>
        <CardTitle size="md">{success ? 'Documento caricato!' : 'Carica Documento'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {success ? (
          <div className="space-y-4 text-center">
            <CheckCircle className="text-state-valid mx-auto h-16 w-16" />
            <h3 className="text-text-primary text-lg font-semibold">
              Documento caricato con successo!
            </h3>
            <p className="text-text-secondary">
              Il tuo documento è stato salvato e sarà verificato dallo staff.
            </p>
          </div>
        ) : (
          <>
            {/* Upload Area */}
            <div
              className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragActive ? 'border-brand bg-brand/5' : 'hover:border-brand/50 border-border'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    {getFileIcon(file.type)}
                    <div className="text-left">
                      <p className="text-text-primary font-medium">{file.name}</p>
                      <p className="text-text-secondary text-sm">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-state-error hover:bg-state-error/10"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Rimuovi
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="text-text-tertiary mx-auto h-12 w-12" />
                  <div>
                    <p className="text-text-primary mb-2 font-medium">
                      {isStaff ? 'Trascina il file qui' : 'Seleziona un file'}
                    </p>
                    <p className="text-text-secondary mb-4 text-sm">PDF, JPG, PNG • Massimo 20MB</p>
                    {!isStaff && (
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Scegli file
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="text-text-primary text-sm font-medium">Categoria *</label>
                <SimpleSelect
                  value={category}
                  onValueChange={setCategory}
                  options={CATEGORIES}
                  placeholder="Seleziona categoria"
                />
              </div>

              <Input
                label="Data scadenza (opzionale)"
                type="date"
                value={expiresAt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresAt(e.target.value)}
                leftIcon={<Calendar className="h-4 w-4" />}
              />

              <Textarea
                label="Note (opzionali)"
                placeholder="Aggiungi note per il documento..."
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-state-error/10 border-state-error/20 flex items-center gap-2 rounded-lg border p-3">
                <AlertTriangle className="text-state-error h-4 w-4" />
                <p className="text-state-error text-sm">{error}</p>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Upload in corso...</span>
                  <span className="text-text-primary font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={!file || !category || uploading}
                className="bg-brand hover:bg-brand/90 flex-1"
              >
                {uploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Carica documento
                  </>
                )}
              </Button>

              {onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={uploading}>
                  Annulla
                </Button>
              )}
            </div>

            {/* Info */}
            <div className="text-text-tertiary space-y-1 text-xs">
              <p>• I file vengono salvati in modo sicuro su Supabase Storage</p>
              <p>• I documenti saranno verificati dallo staff</p>
              <p>• Riceverai notifiche per le scadenze</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
