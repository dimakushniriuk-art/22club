'use client'

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { useSupabase } from '@/hooks/use-supabase'
import { useToast } from '@/components/ui/toast'
import { validateAvatarFile, resizeImage, getFileExtension } from '@/lib/avatar-utils'
import { createLogger } from '@/lib/logger'
import { Upload, X } from 'lucide-react'

const logger = createLogger('AvatarUploader')

interface AvatarUploaderProps {
  userId: string | null
  onUploaded?: (publicUrl: string) => void
  /** Se true, al mount apre subito il dialog di selezione file (es. dopo creazione profilo da welcome). */
  autoOpenFilePicker?: boolean
  /** Chiamato dopo aver aperto il file picker (per resettare autoOpenFilePicker nel parent). */
  onFilePickerOpened?: () => void
}

export function AvatarUploader({
  userId,
  onUploaded,
  autoOpenFilePicker,
  onFilePickerOpened,
}: AvatarUploaderProps) {
  const { supabase } = useSupabase()
  const { addToast } = useToast()
  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [preview, setPreview] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!autoOpenFilePicker) return
    const t = setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click()
        onFilePickerOpened?.()
      }
    }, 100)
    return () => clearTimeout(t)
  }, [autoOpenFilePicker, onFilePickerOpened])

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    // Reset error
    setError(null)

    // Valida file
    const validation = validateAvatarFile(f)
    if (!validation.valid) {
      setError(validation.error || 'File non valido')
      addToast({
        title: 'File non valido',
        message: validation.error || 'File non valido',
        variant: 'error',
      })
      return
    }

    try {
      // Resize automatico se necessario (max 512x512px)
      const resizedFile = await resizeImage(f, 512, 512, 0.9)
      setFile(resizedFile)

      // Preview
      const url = URL.createObjectURL(resizedFile)
      setPreview(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore nel processamento immagine'
      setError(msg)
      addToast({
        title: 'Errore processamento',
        message: msg,
        variant: 'error',
      })
    }
  }

  const upload = async () => {
    if (!file || !userId) return

    try {
      setIsUploading(true)
      setError(null)

      // 1. Ottieni user_id autenticato per sicurezza (usa auth.uid() invece di userId)
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        throw new Error('Autenticazione richiesta per caricare avatar')
      }

      const userAuthId = authUser.id

      // 2. Recupera avatar esistente per cleanup
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single()

      if (fetchError) {
        logger.warn('Errore recupero profilo esistente', { error: fetchError })
      }

      type ProfileRow = { avatar_url?: string | null }
      const existingProfileTyped = existingProfile as ProfileRow | null
      const oldAvatarUrl = existingProfileTyped?.avatar_url

      // 3. Estrai estensione e crea path (usa auth.uid() per sicurezza RLS)
      const ext = getFileExtension(file)
      const path = `${userAuthId}/avatar.${ext}`

      // 4. Upload a Supabase Storage
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      })

      if (upErr) throw upErr

      // 5. Ottieni URL pubblico
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = data.publicUrl

      // 6. Aggiorna profiles.avatar_url nel database
      type ProfileUpdate = { avatar_url: string; avatar: string }
      const updateData: ProfileUpdate = { avatar_url: publicUrl, avatar: publicUrl }
      const { error: dbErr } = await supabase
        .from('profiles')
        .update(updateData as never)
        .eq('id', userId)

      if (dbErr) {
        // Rollback: elimina file caricato se DB update fallisce
        logger.warn('Errore aggiornamento avatar_url nel database, rollback file', {
          error: dbErr,
          path,
        })
        const { error: deleteErr } = await supabase.storage.from('avatars').remove([path])
        if (deleteErr) {
          logger.error('Errore rollback file avatar', deleteErr, { path })
        }

        throw new Error(
          `Errore aggiornamento profilo: ${dbErr.message}. File caricato è stato rimosso.`,
        )
      }

      // 7. Cleanup: elimina avatar vecchio se esiste e diverso dal nuovo
      if (oldAvatarUrl && oldAvatarUrl !== publicUrl) {
        try {
          // Estrai path da URL vecchio
          const oldPathMatch = oldAvatarUrl.match(/\/avatars\/(.+)$/)
          if (oldPathMatch && oldPathMatch[1]) {
            const oldPath = decodeURIComponent(oldPathMatch[1])
            // Verifica che il path vecchio appartenga allo stesso utente (sicurezza)
            if (oldPath.startsWith(`${userAuthId}/`)) {
              const { error: deleteOldErr } = await supabase.storage
                .from('avatars')
                .remove([oldPath])
              if (deleteOldErr) {
                logger.warn('Errore eliminazione avatar vecchio', { error: deleteOldErr, oldPath })
                // Non bloccare se il cleanup fallisce
              } else {
                logger.info('Avatar vecchio eliminato con successo', { oldPath })
              }
            }
          }
        } catch (cleanupErr) {
          logger.warn('Errore durante cleanup avatar vecchio', { error: cleanupErr })
          // Non bloccare se il cleanup fallisce
        }
      }

      addToast({
        title: 'Avatar aggiornato',
        message: 'Immagine caricata e profilo aggiornato con successo.',
        variant: 'success',
      })

      // Callback
      onUploaded?.(publicUrl)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload fallito'
      setError(msg)
      addToast({ title: 'Errore upload', message: msg, variant: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const handleClearSelection = () => {
    setFile(null)
    setError(null)
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* Preview grande quando c'è file selezionato o anteprima */}
      {(preview || file) && (
        <div className="flex flex-col items-center gap-3">
          <div className="relative shrink-0">
            {preview ? (
              <Image
                src={preview}
                alt="Anteprima foto profilo"
                width={128}
                height={128}
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-2 border-primary/30 object-cover shadow-lg"
              />
            ) : (
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-2 border-dashed border-primary/30 bg-background-tertiary/50 flex items-center justify-center">
                <span className="text-text-muted text-xs text-center px-2">Elaborazione…</span>
              </div>
            )}
          </div>
          {file && (
            <p className="text-text-secondary text-xs text-center max-w-full truncate px-2">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={onFileChange}
          disabled={isUploading}
          className="hidden"
        />

        <Button
          type="button"
          onClick={handleSelectFile}
          disabled={isUploading}
          variant="outline"
          className="flex-1 sm:flex-initial min-w-[160px] justify-center gap-2"
        >
          <Upload className="h-4 w-4 shrink-0" />
          <span className="truncate">{file ? 'Scegli un\'altra' : 'Seleziona immagine'}</span>
        </Button>

        {file && (
          <Button
            type="button"
            onClick={upload}
            disabled={isUploading}
            variant="default"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 min-w-[100px]"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Caricamento…</span>
                <span className="sm:hidden">…</span>
              </span>
            ) : (
              'Carica'
            )}
          </Button>
        )}

        {file && !isUploading && (
          <Button
            type="button"
            onClick={handleClearSelection}
            variant="outline"
            className="shrink-0 gap-2 border-state-error/30 text-state-error hover:bg-state-error/10"
          >
            <X className="h-4 w-4" />
            Annulla
          </Button>
        )}
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </div>
      )}

      {file && !error && !preview && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background-tertiary/30 border border-primary/10">
          <p className="text-xs text-text-secondary truncate flex-1 min-w-0">{file.name}</p>
          <p className="text-xs text-text-tertiary shrink-0">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
      )}
    </div>
  )
}
