'use client'

import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { PageHeaderFixed } from '@/components/layout'
import {
  ProgressPhotoImage,
  getStoragePathFromProgressPhotoUrl,
} from '@/components/progress-photo-image'
import { Button } from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { useProgressPhotos } from '@/hooks/use-progress-photos'
import { formatDate, formatTime } from '@/lib/format'
import { useNotify } from '@/lib/ui/notify'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { ProgressPhoto } from '@/types/progress'

const BUCKET = 'progress-photos'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200'

function getDisplayTimestamp(p: ProgressPhoto): string {
  return p.session_saved_at ?? p.created_at
}

function getSessionKey(p: ProgressPhoto): string {
  return p.session_saved_at
    ? `${p.date}_saved_${p.session_saved_at}`
    : `${p.date}_${Math.floor(new Date(p.created_at).getTime() / 60000)}`
}

export default function FotoRisultatiPage() {
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

  const handleDelete = useCallback(
    async (photo: ProgressPhoto) => {
      if (!window.confirm("Eliminare questa foto? L'operazione non puÃ² essere annullata.")) return
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
        notify(e instanceof Error ? e.message : "Errore durante l'eliminazione", 'error')
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
      <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 sm:space-y-6 min-[834px]:px-6 space-y-4">
        <PageHeaderFixed
          variant="chat"
          title="Foto / Risultati"
          subtitle="Aggiungi foto e visualizza la galleria nel tempo"
          backHref="/home"
          icon={<ImageIcon className="h-5 w-5 text-cyan-400" />}
        />

        {/* Bottone azione centrale: carica foto */}
        <Link
          href="/home/foto-risultati/aggiungi"
          className={`flex flex-col items-center justify-center gap-3 p-6 text-center sm:p-8 ${CARD_DS}`}
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 min-[834px]:h-16 min-[834px]:w-16">
            <Image
              src="/images/fotocamera.png"
              alt="Carica foto"
              width={56}
              height={56}
              className="h-12 w-12 min-[834px]:h-14 min-[834px]:w-14 object-contain"
            />
          </div>
          <div>
            <span className="block text-base font-semibold text-text-primary min-[834px]:text-lg">
              Carica nuove foto
            </span>
            <span className="mt-1 block text-xs text-text-tertiary min-[834px]:text-sm">
              Apri il modulo e carica una foto di progresso
            </span>
          </div>
        </Link>

        {/* Griglia per data - Galleria */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary sm:text-base">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <ImageIcon className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
            </span>
            Galleria per data
          </h2>
          {error && <p className="text-xs text-state-error sm:text-sm">{error}</p>}
          {loading && photos.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-secondary sm:text-base">
              <Loader2 className="h-5 w-5 animate-spin" />
              Caricamento foto...
            </div>
          ) : sessionKeys.length === 0 ? (
            <div className={`p-6 text-center sm:p-8 ${CARD_DS}`}>
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-2xl">
                  ðŸ“·
                </div>
              </div>
              <p className="text-sm text-text-secondary sm:text-base">
                Nessuna foto ancora. Usa Aggiungi per caricare la prima.
              </p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {sessionKeys.map((sessionKey) => {
                const sessionPhotos = photosBySession.get(sessionKey) ?? []
                const first = sessionPhotos[0]
                const label = first
                  ? `${formatDate(first.date)} ore ${formatTime(getDisplayTimestamp(first))}`
                  : sessionKey
                return (
                  <section key={sessionKey}>
                    <div className="mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
                      <span className="text-sm font-semibold text-text-primary sm:text-base">
                        {label}
                      </span>
                      <span className="text-xs text-text-tertiary sm:text-sm">
                        ({sessionPhotos.length} foto)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      {sessionPhotos.map((photo: ProgressPhoto) => (
                        <div
                          key={photo.id}
                          className={`relative aspect-square overflow-hidden ${CARD_DS}`}
                        >
                          <Link
                            href="/home/progressi/foto"
                            className="relative block h-full w-full rounded-lg transition-colors hover:border-white/20"
                          >
                            <ProgressPhotoImage
                              imageUrl={photo.image_url}
                              alt={`${photo.angle} ${formatDate(photo.date)}`}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                              <span className="text-[10px] capitalize text-white sm:text-xs">
                                {photo.angle}
                              </span>
                            </div>
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1 z-10 h-8 w-8 rounded-lg bg-black/60 text-white hover:bg-state-error/90 hover:text-white sm:h-9 sm:w-9"
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
