'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { useProgressPhotos } from '@/hooks/use-progress-photos'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useNotify } from '@/lib/ui/notify'
import { formatDate } from '@/lib/format'
import { PageHeaderFixed } from '@/components/layout'
import {
  ProgressPhotoImage,
  getStoragePathFromProgressPhotoUrl,
} from '@/components/progress-photo-image'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  Camera,
  Calendar,
  Image as ImageIcon,
  ZoomIn,
  Download,
  Share2,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import type { ProgressPhoto } from '@/types/progress'

const logger = createLogger('app:home:progressi:foto:page')
const ANGLES = ['fronte', 'profilo', 'retro'] as const

function CompareDatesCard({
  uniqueDates,
  selectedDates,
  onDateSelect,
  getPhotosForDate,
}: {
  uniqueDates: string[]
  selectedDates: { first: string | null; second: string | null }
  onDateSelect: (date: string, position: 'first' | 'second') => void
  getPhotosForDate: (date: string) => ProgressPhoto[]
}) {
  return (
    <Card className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <CardHeader>
        <CardTitle size="md" className="text-text-primary">Seleziona Date da Confrontare</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-text-tertiary mb-2 text-xs">Prima Data</div>
            <div className="space-y-2">
              {uniqueDates.map((date) => (
                <button
                  key={`first-${date}`}
                  type="button"
                  onClick={() => onDateSelect(date, 'first')}
                  className={`w-full rounded-lg border p-3 text-left ${
                    selectedDates.first === date
                      ? 'border-white/20 bg-white/10 text-text-primary'
                      : 'border-white/10 bg-white/[0.04] text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium">{formatDate(date)}</span>
                  </div>
                  <div className="text-text-tertiary mt-1 text-xs">
                    {getPhotosForDate(date).length} foto
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-text-tertiary mb-2 text-xs">Seconda Data</div>
            <div className="space-y-2">
              {uniqueDates.map((date) => (
                <button
                  key={`second-${date}`}
                  type="button"
                  onClick={() => onDateSelect(date, 'second')}
                  className={`w-full rounded-lg border p-3 text-left ${
                    selectedDates.second === date
                      ? 'border-white/20 bg-white/10 text-text-primary'
                      : 'border-white/10 bg-white/[0.04] text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium">{formatDate(date)}</span>
                  </div>
                  <div className="text-text-tertiary mt-1 text-xs">
                    {getPhotosForDate(date).length} foto
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PhotoCompareView({
  firstDate,
  secondDate,
  photosFirst,
  photosSecond,
  selectedAngle,
  onPhotoClick,
}: {
  firstDate: string
  secondDate: string
  photosFirst: ProgressPhoto[]
  photosSecond: ProgressPhoto[]
  selectedAngle: string
  onPhotoClick: (photo: ProgressPhoto) => void
}) {
  const photosForAngle = (list: ProgressPhoto[]) =>
    list.filter((p) => p.angle === selectedAngle)
  const renderColumn = (dateLabel: string, list: ProgressPhoto[]) => (
    <div>
      <div className="text-text-secondary mb-2 text-sm">{dateLabel}</div>
      {photosForAngle(list).map((photo) => (
        <div key={photo.id} className="space-y-2">
          <div
            className="group relative flex min-h-64 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-black/20"
            onClick={() => onPhotoClick(photo)}
          >
            <ProgressPhotoImage
              imageUrl={photo.image_url}
              alt={`${photo.angle} ${formatDate(photo.date)}`}
              className="max-h-64 max-w-full w-auto h-auto object-contain"
            />
            <div className="absolute inset-px flex items-center justify-center rounded-lg bg-black/0 transition-colors hover:bg-black/20 pointer-events-none">
              <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
          {photo.note && (
            <p className="text-text-secondary text-xs italic">{photo.note}</p>
          )}
        </div>
      ))}
    </div>
  )
  return (
    <Card className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <CardHeader>
        <CardTitle size="md" className="text-text-primary">
          Confronto {formatDate(firstDate)} vs {formatDate(secondDate)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {renderColumn(formatDate(firstDate), photosFirst)}
          {renderColumn(formatDate(secondDate), photosSecond)}
        </div>
      </CardContent>
    </Card>
  )
}

function PhotoListItemCard({
  photo,
  onPhotoClick,
  onDownload,
  onShare,
}: {
  photo: ProgressPhoto
  onPhotoClick: (photo: ProgressPhoto) => void
  onDownload: (photo: ProgressPhoto) => void
  onShare: (photo: ProgressPhoto) => void
}) {
  return (
    <Card className="overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <CardContent className="p-0">
        <div className="space-y-0">
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="text-cyan-400 h-4 w-4" />
              <span className="text-text-primary font-medium">{formatDate(photo.date)}</span>
              <Badge variant="secondary" size="sm">
                {photo.angle}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-text-secondary hover:bg-white/5" onClick={() => onDownload(photo)}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-text-secondary hover:bg-white/5" onClick={() => onShare(photo)}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            className="group relative flex min-h-[min(88vh,680px)] w-[calc(100%+2rem)] -mx-4 cursor-pointer items-center justify-center bg-black/20 overflow-hidden"
            onClick={() => onPhotoClick(photo)}
          >
            <ProgressPhotoImage
              imageUrl={photo.image_url}
              alt={`${photo.angle} ${formatDate(photo.date)}`}
              className="max-h-[min(88vh,680px)] max-w-full w-auto h-auto object-contain"
            />
            <div className="absolute inset-px flex items-center justify-center rounded-lg bg-black/0 transition-colors hover:bg-black/20 pointer-events-none">
              <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
          {photo.note && (
            <div className="px-4 pt-2 pb-4">
              <p className="text-text-secondary text-sm italic">{photo.note}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function FotoProgressiPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const { notify } = useNotify()
  const profileId = user?.id ?? null
  const role = user?.role ?? null

  const [selectedAngle, setSelectedAngle] = useState<'fronte' | 'profilo' | 'retro'>('fronte')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedDates, setSelectedDates] = useState<{
    first: string | null
    second: string | null
  }>({ first: null, second: null })
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [fullscreenPhoto, setFullscreenPhoto] = useState<ProgressPhoto | null>(null)

  const { photos, loading, error, hasMore, loadMore, refresh, filterByAngle } = useProgressPhotos({
    userId: profileId,
    role,
    angle: selectedAngle,
  })

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) loadMore()
      },
      { threshold: 0.1 },
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  useEffect(() => {
    filterByAngle(selectedAngle)
  }, [selectedAngle, filterByAngle])

  const uniqueDates = useMemo(() => {
    const dates = [...new Set(photos.map((p) => p.date))]
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [photos])

  const photosForCurrentAngle = useMemo(
    () =>
      photos
        .filter((p) => p.angle === selectedAngle)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [photos, selectedAngle],
  )

  const getPhotosForDate = useCallback(
    (date: string) => photos.filter((p) => p.date === date),
    [photos],
  )

  const handleBack = useCallback(() => router.back(), [router])
  const handleCompareToggle = useCallback(() => {
    if (compareMode) {
      setCompareMode(false)
      setSelectedDates({ first: null, second: null })
    } else if (uniqueDates.length >= 2) {
      setSelectedDates({ first: uniqueDates[0], second: uniqueDates[1] })
      setCompareMode(true)
    }
  }, [compareMode, uniqueDates])

  const handleDateSelect = useCallback((date: string, position: 'first' | 'second') => {
    setSelectedDates((prev) => ({
      ...prev,
      [position]: prev[position] === date ? null : date,
    }))
  }, [])

  const handleAngleChange = useCallback((angle: 'fronte' | 'profilo' | 'retro') => {
    setSelectedAngle(angle)
  }, [])

  const handlePhotoClick = useCallback((photo: ProgressPhoto) => {
    setFullscreenPhoto(photo)
    setShowFullscreen(true)
  }, [])

  const handleCloseFullscreen = useCallback(() => setShowFullscreen(false), [])

  const handleDownload = useCallback(
    async (photo: ProgressPhoto) => {
      try {
        const path = getStoragePathFromProgressPhotoUrl(photo.image_url)
        const urlToFetch = path
          ? (await supabase.storage.from('progress-photos').createSignedUrl(path, 3600)).data?.signedUrl
          : photo.image_url
        if (!urlToFetch) throw new Error('URL non disponibile')
        const response = await fetch(urlToFetch)
        if (!response.ok) throw new Error('Impossibile scaricare la foto')
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `progresso-${photo.date}-${photo.angle}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        logger.error('Errore nel download', err, { photoId: photo.id })
        notify('Si è verificato un errore durante il download della foto. Riprova.', 'error', 'Errore download')
      }
    },
    [supabase, notify],
  )

  const handleShare = useCallback(
    async (photo: ProgressPhoto) => {
      const path = getStoragePathFromProgressPhotoUrl(photo.image_url)
      const urlToShare = path
        ? (await supabase.storage.from('progress-photos').createSignedUrl(path, 3600)).data?.signedUrl
        : photo.image_url
      if (!urlToShare) {
        notify('Impossibile condividere la foto.', 'error', 'Errore')
        return
      }
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Progresso ${formatDate(photo.date)}`,
            text: `Foto di progresso - ${photo.angle}`,
            url: urlToShare,
          })
        } catch (err) {
          if ((err as Error)?.name === 'AbortError') {
            notify('Condivisione annullata.', 'info', 'Info')
          } else {
            notify('Errore durante la condivisione. Riprova.', 'error', 'Errore condivisione')
          }
        }
      } else {
        navigator.clipboard.writeText(urlToShare)
        notify('URL della foto copiato negli appunti.', 'success', 'URL copiato')
      }
    },
    [supabase, notify],
  )

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-white/10 h-12 w-56 rounded-lg" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/10 h-48 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
        <PageHeaderFixed
          title="Foto Progressi"
          subtitle="Visualizza e confronta le foto per angolo"
          onBack={handleBack}
          icon={<ImageIcon className="h-5 w-5 text-cyan-400" />}
        />

        {/* Controlli */}
        <div className="space-y-4">
          <div className="flex gap-2">
            {ANGLES.map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => handleAngleChange(angle)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  selectedAngle === angle
                    ? 'border-white/20 bg-white/10 text-text-primary'
                    : 'border-white/10 bg-white/[0.04] text-text-secondary hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                {angle.charAt(0).toUpperCase() + angle.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={handleCompareToggle}
              disabled={uniqueDates.length < 2}
              className="rounded-lg border border-white/10 hover:bg-white/5 text-text-primary"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {compareMode ? 'Esci Confronto' : 'Confronta Date'}
            </Button>
            {compareMode && (
              <span className="text-text-tertiary text-xs">Seleziona 2 date</span>
            )}
          </div>
        </div>

        {/* Contenuto principale */}
        {photos.length === 0 ? (
          <Card className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <CardContent className="py-12 text-center">
              <div className="mb-4 text-6xl opacity-50">📸</div>
              <h3 className="text-text-primary mb-2 text-lg font-medium">Nessuna foto caricata</h3>
              <p className="text-text-secondary mb-4 text-sm">
                Inizia a caricare le tue foto per tracciare i progressi visivi
              </p>
              <Button
                onClick={() => router.push('/home/foto-risultati/aggiungi')}
                className="rounded-lg border border-white/10 hover:bg-white/5 text-text-primary"
              >
                <Camera className="mr-2 h-4 w-4" />
                Aggiungi Foto
              </Button>
            </CardContent>
          </Card>
        ) : compareMode ? (
          <div className="space-y-4">
            <CompareDatesCard
              uniqueDates={uniqueDates}
              selectedDates={selectedDates}
              onDateSelect={handleDateSelect}
              getPhotosForDate={getPhotosForDate}
            />
            {selectedDates.first && selectedDates.second && (
              <PhotoCompareView
                firstDate={selectedDates.first}
                secondDate={selectedDates.second}
                photosFirst={getPhotosForDate(selectedDates.first)}
                photosSecond={getPhotosForDate(selectedDates.second)}
                selectedAngle={selectedAngle}
                onPhotoClick={handlePhotoClick}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {photosForCurrentAngle.map((photo) => (
              <PhotoListItemCard
                key={photo.id}
                photo={photo}
                onPhotoClick={handlePhotoClick}
                onDownload={handleDownload}
                onShare={handleShare}
              />
            ))}
          </div>
        )}

        {/* Loading indicator per infinite scroll */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {loading && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Caricamento altre foto...</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <Card className="rounded-lg border border-state-error/20 bg-state-error/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <CardContent className="py-4 text-center">
              <p className="text-state-error text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={refresh} className="mt-2 rounded-lg border border-white/10 hover:bg-white/5 text-text-primary">
                Riprova
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-lg border border-white/10 bg-white/5">
          <CardContent className="flex items-center gap-3 py-3 pl-3 pr-4">
            <div className="h-8 w-1 shrink-0 rounded-full bg-white/30" />
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="h-4 w-4 shrink-0 text-cyan-400" />
              <p className="text-text-secondary text-xs">
                Carica foto regolarmente per tracciare i progressi nel tempo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal fullscreen */}
      {showFullscreen && fullscreenPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="relative max-h-full max-w-4xl">
            <ProgressPhotoImage
              imageUrl={fullscreenPhoto.image_url}
              alt={`${fullscreenPhoto.angle} ${formatDate(fullscreenPhoto.date)}`}
              width={800}
              height={600}
              className="max-h-full max-w-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseFullscreen}
              className="absolute right-4 top-4 rounded-xl bg-black/50 text-white hover:bg-black/70"
              aria-label="Chiudi"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
