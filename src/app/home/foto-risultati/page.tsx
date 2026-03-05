'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { ProgressPhotoImage, getStoragePathFromProgressPhotoUrl } from '@/components/progress-photo-image'
import { Button } from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { useProgressPhotos } from '@/hooks/use-progress-photos'
import { formatDate, formatTime } from '@/lib/format'
import { useNotify } from '@/lib/ui/notify'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { ProgressPhoto } from '@/types/progress'

const BUCKET = 'progress-photos'

function getDisplayTimestamp(p: ProgressPhoto): string {
  return p.session_saved_at ?? p.created_at
}

function getSessionKey(p: ProgressPhoto): string {
  return p.session_saved_at
    ? `${p.date}_saved_${p.session_saved_at}`
    : `${p.date}_${Math.floor(new Date(p.created_at).getTime() / 60000)}`
}

export default function FotoRisultatiPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const { notify } = useNotify()
  const role = user?.role ?? null
  const profileId = user?.id ?? null
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { photos, loading, error, refresh } = useProgressPhotos({
    userId: profileId,
    role,
    angle: null,
  })

  const handleBack = useCallback(() => router.back(), [router])

  const handleDelete = useCallback(
    async (photo: ProgressPhoto) => {
      if (
        !window.confirm(
          'Eliminare questa foto? L\'operazione non può essere annullata.',
        )
      )
        return
      setDeletingId(photo.id)
      const path = getStoragePathFromProgressPhotoUrl(photo.image_url)
      try {
        if (path) {
          await supabase.storage.from(BUCKET).remove([path])
        }
        const { error: delError } = await supabase
          .from('progress_photos')
          .delete()
          .eq('id', photo.id)
        if (delError) throw delError
        notify('Foto eliminata', 'success')
        await refresh()
      } catch (e) {
        notify(
          e instanceof Error ? e.message : 'Errore durante l\'eliminazione',
          'error',
        )
      } finally {
        setDeletingId(null)
      }
    },
    [supabase, refresh, notify],
  )

  const photosBySession = useMemo(() => {
    const map = new Map<string, ProgressPhoto[]>()
    for (const p of photos) {
      const key = getSessionKey(p)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.angle.localeCompare(b.angle))
    }
    return map
  }, [photos])

  const sessionKeys = useMemo(() => {
    return Array.from(photosBySession.keys()).sort((a, b) => {
      const photoA = photosBySession.get(a)?.[0]
      const photoB = photosBySession.get(b)?.[0]
      if (!photoA || !photoB) return 0
      return (
        new Date(getDisplayTimestamp(photoB)).getTime() -
        new Date(getDisplayTimestamp(photoA)).getTime()
      )
    })
  }, [photosBySession])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
        {/* Header */}
        <header className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-teal-500/5" />
          <div className="relative z-10 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400"
              onClick={handleBack}
              aria-label="Indietro"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
              <ImageIcon className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold text-text-primary truncate">
                Foto / Risultati
              </h1>
              <p className="text-xs text-text-tertiary line-clamp-1">
                Aggiungi foto e visualizza la galleria nel tempo
              </p>
            </div>
          </div>
        </header>

        {/* Bottone azione centrale: carica foto */}
        <Link
          href="/home/foto-risultati/aggiungi"
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-cyan-500/30 bg-background-secondary/50 backdrop-blur-sm p-6 min-[834px]:p-8 transition-colors hover:border-cyan-400/50 hover:bg-cyan-500/10 text-center"
        >
          <Image
            src="/images/fotocamera.png"
            alt="Carica foto"
            width={84}
            height={84}
            className="h-[84px] w-[84px] min-[834px]:h-24 min-[834px]:w-24 shrink-0 object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]"
          />
          <div>
            <span className="block font-semibold text-text-primary text-base min-[834px]:text-lg">
              Carica nuove foto
            </span>
            <span className="block text-text-tertiary text-xs min-[834px]:text-sm mt-1">
              Apri il modulo e carica una foto di progresso
            </span>
          </div>
        </Link>

        {/* Griglia per data - Galleria */}
        <div className="space-y-4 min-[834px]:space-y-5">
          <h2 className="text-sm min-[834px]:text-base font-semibold text-text-primary flex items-center gap-2">
            <ImageIcon className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5 text-cyan-400" />
            Galleria per data
          </h2>
          {error && (
            <p className="text-state-error text-xs min-[834px]:text-sm">{error}</p>
          )}
          {loading && photos.length === 0 ? (
            <div className="flex items-center justify-center py-8 gap-2 text-text-secondary text-sm min-[834px]:text-base">
              <Loader2 className="h-5 w-5 animate-spin" />
              Caricamento foto...
            </div>
          ) : sessionKeys.length === 0 ? (
            <div className="rounded-xl border border-cyan-500/20 bg-background-secondary/50 p-6 min-[834px]:p-8 text-center">
              <div className="mb-2 text-4xl opacity-50">📷</div>
              <p className="text-text-secondary text-sm min-[834px]:text-base">
                Nessuna foto ancora. Usa Aggiungi per caricare la prima.
              </p>
            </div>
          ) : (
            <div className="space-y-6 min-[834px]:space-y-8">
              {sessionKeys.map((sessionKey) => {
                const sessionPhotos = photosBySession.get(sessionKey) ?? []
                const first = sessionPhotos[0]
                const label = first
                  ? `${formatDate(first.date)} ore ${formatTime(getDisplayTimestamp(first))}`
                  : sessionKey
                return (
                  <section key={sessionKey}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5 text-cyan-400" />
                      <span className="text-sm min-[834px]:text-base font-semibold text-text-primary">
                        {label}
                      </span>
                      <span className="text-text-tertiary text-xs min-[834px]:text-sm">
                        ({sessionPhotos.length} foto)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 min-[834px]:gap-4">
                      {sessionPhotos.map((photo: ProgressPhoto) => (
                        <div
                          key={photo.id}
                          className="relative rounded-xl overflow-hidden border border-cyan-500/20 bg-background-tertiary/30 aspect-square"
                        >
                          <Link
                            href="/home/progressi/foto"
                            className="relative block w-full h-full hover:border-cyan-400/40 transition-colors rounded-xl"
                          >
                            <ProgressPhotoImage
                              imageUrl={photo.image_url}
                              alt={`${photo.angle} ${formatDate(photo.date)}`}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                              <span className="text-[10px] min-[834px]:text-xs text-white capitalize">
                                {photo.angle}
                              </span>
                            </div>
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 z-10 h-8 w-8 min-[834px]:h-9 min-[834px]:w-9 rounded-xl bg-black/60 text-white hover:bg-state-error/90 hover:text-white"
                            onClick={() => handleDelete(photo)}
                            disabled={deletingId === photo.id}
                            aria-label="Elimina foto"
                          >
                            {deletingId === photo.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
