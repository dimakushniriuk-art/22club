'use client'

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui'
import { useSupabase } from '@/hooks/use-supabase'
import { useToast } from '@/components/ui/toast'
import { validateAvatarFile, resizeImage, getFileExtension } from '@/lib/avatar-utils'
import { createLogger } from '@/lib/logger'
import { Upload } from 'lucide-react'

const logger = createLogger('AvatarUploader')

interface AvatarUploaderProps {
  userId: string | null
  onUploaded?: (publicUrl: string) => void
}

export function AvatarUploader({ userId, onUploaded }: AvatarUploaderProps) {
  const { supabase } = useSupabase()
  const { addToast } = useToast()
  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [preview, setPreview] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* File Input nascosto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={onFileChange}
          disabled={isUploading}
          className="hidden"
        />

        {/* Bottone per selezionare file */}
        <Button
          type="button"
          onClick={handleSelectFile}
          disabled={isUploading}
          variant="outline"
          className="flex-1 sm:flex-initial sm:min-w-[200px] justify-center gap-2 bg-background-secondary/50 border-teal-500/30 hover:bg-background-tertiary/50 hover:border-teal-500/50 text-text-primary transition-all duration-200"
        >
          <Upload className="h-4 w-4 shrink-0" />
          <span className="truncate">{file ? file.name : 'Seleziona immagine'}</span>
        </Button>

        {/* Bottone Carica */}
        <Button
          onClick={upload}
          disabled={!file || isUploading}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-200 shrink-0 min-w-[100px] sm:min-w-[120px]"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="hidden sm:inline">Caricamento…</span>
              <span className="sm:hidden">…</span>
            </span>
          ) : (
            'Carica'
          )}
        </Button>

        {/* Anteprima */}
        {preview && (
          <div className="shrink-0 flex items-center justify-center">
            <Image
              src={preview}
              alt="Anteprima avatar"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border-2 border-teal-500/30 object-cover shadow-md"
            />
          </div>
        )}
      </div>

      {/* Messaggio errore */}
      {error && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Info file selezionato */}
      {file && !error && !preview && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background-tertiary/30 border border-teal-500/10">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-secondary font-medium truncate">{file.name}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}
    </div>
  )
}
