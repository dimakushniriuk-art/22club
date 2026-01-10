'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { useProgressPhotos } from '@/hooks/use-progress-photos'

const logger = createLogger('app:home:progressi:foto:page')
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import {
  ArrowLeft,
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

const ANGLES = ['fronte', 'profilo', 'retro'] as const

export default function FotoProgressiPage() {
  const router = useRouter()
  const { user } = useAuth()
  const userId = user?.user_id || null
  const role = user?.role || null

  const [selectedAngle, setSelectedAngle] = useState<'fronte' | 'profilo' | 'retro'>('fronte')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedDates, setSelectedDates] = useState<{
    first: string | null
    second: string | null
  }>({
    first: null,
    second: null,
  })
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [fullscreenPhoto, setFullscreenPhoto] = useState<ProgressPhoto | null>(null)

  // Usa hook con paginazione e cache
  // Nota: totalCount potrebbe essere usato in futuro per display conteggio totale
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { photos, loading, error, hasMore, totalCount, loadMore, refresh, filterByAngle } =
    useProgressPhotos({
      userId,
      role,
      angle: selectedAngle,
    })

  // Observer per lazy loading infinito scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Intersection Observer per caricare più foto quando si scrolla
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  // Aggiorna filtro angolo quando cambia selezione
  useEffect(() => {
    filterByAngle(selectedAngle)
  }, [selectedAngle, filterByAngle])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getUniqueDates = () => {
    const dates = [...new Set(photos.map((photo) => photo.date))]
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }

  const getPhotosForAngle = (angle: 'fronte' | 'profilo' | 'retro') => {
    return photos
      .filter((photo) => photo.angle === angle)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getPhotosForDate = (date: string) => {
    return photos.filter((photo) => photo.date === date)
  }

  const handleCompareToggle = () => {
    if (compareMode) {
      setCompareMode(false)
      setSelectedDates({ first: null, second: null })
    } else {
      const dates = getUniqueDates()
      if (dates.length >= 2) {
        setSelectedDates({ first: dates[0], second: dates[1] })
        setCompareMode(true)
      }
    }
  }

  const handleDateSelect = (date: string, position: 'first' | 'second') => {
    setSelectedDates((prev) => ({
      ...prev,
      [position]: prev[position] === date ? null : date,
    }))
  }

  const handleAngleChange = (angle: 'fronte' | 'profilo' | 'retro') => {
    setSelectedAngle(angle)
  }

  const handlePhotoClick = (photo: ProgressPhoto) => {
    setFullscreenPhoto(photo)
    setShowFullscreen(true)
  }

  const handleDownload = async (photo: ProgressPhoto) => {
    try {
      // Fetch foto come blob
      const response = await fetch(photo.image_url)

      if (!response.ok) {
        throw new Error('Impossibile scaricare la foto')
      }

      const blob = await response.blob()

      // Crea URL temporaneo
      const url = window.URL.createObjectURL(blob)

      // Crea link e trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `progresso-${photo.date}-${photo.angle}.jpg`

      // Append, click e cleanup
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Rilascia URL
      window.URL.revokeObjectURL(url)
    } catch (error) {
      logger.error('Errore nel download', error, { photoId: photo.id })
      alert('Errore nel download della foto')
    }
  }

  const handleShare = (photo: ProgressPhoto) => {
    if (navigator.share) {
      navigator.share({
        title: `Progresso ${formatDate(photo.date)}`,
        text: `Foto di progresso - ${photo.angle}`,
        url: photo.image_url,
      })
    } else {
      // Fallback: copia URL
      navigator.clipboard.writeText(photo.image_url)
      alert('URL copiato negli appunti')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="space-y-4 px-6 py-4">
          <div className="animate-pulse space-y-4">
            <div className="bg-background-tertiary h-8 w-48 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-background-tertiary h-48 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6 px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-text-primary text-xl font-bold">Foto Progressi</h1>
          <div className="w-10" /> {/* Placeholder for alignment */}
        </div>

        {/* Controlli */}
        <div className="space-y-4">
          {/* Selettore angolo */}
          <div className="flex gap-2">
            {ANGLES.map((angle) => (
              <Button
                key={angle}
                variant={selectedAngle === angle ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleAngleChange(angle)}
                className={selectedAngle === angle ? 'bg-brand text-brand-foreground' : ''}
              >
                {angle.charAt(0).toUpperCase() + angle.slice(1)}
              </Button>
            ))}
          </div>

          {/* Modalita confronto */}
          <div className="flex items-center justify-between">
            <Button
              variant={compareMode ? 'primary' : 'outline'}
              onClick={handleCompareToggle}
              disabled={getUniqueDates().length < 2}
              className={compareMode ? 'bg-brand text-brand-foreground' : ''}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {compareMode ? 'Esci Confronto' : 'Confronta Date'}
            </Button>

            {compareMode && (
              <div className="text-text-secondary text-sm">Seleziona 2 date per confrontare</div>
            )}
          </div>
        </div>

        {/* Contenuto principale */}
        {photos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mb-4 text-6xl opacity-50">📸</div>
              <h3 className="text-text-primary mb-2 text-lg font-medium">Nessuna foto caricata</h3>
              <p className="text-text-secondary mb-4 text-sm">
                Inizia a caricare le tue foto per tracciare i progressi visivi
              </p>
              <Button
                onClick={() => router.push('/home/progressi')}
                className="bg-brand hover:bg-brand/90"
              >
                <Camera className="mr-2 h-4 w-4" />
                Aggiungi Foto
              </Button>
            </CardContent>
          </Card>
        ) : compareMode ? (
          /* Modalita confronto */
          <div className="space-y-4">
            {/* Selezione date */}
            <Card>
              <CardHeader>
                <CardTitle size="md">Seleziona Date da Confrontare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-text-secondary mb-2 text-sm">Prima Data</div>
                    <div className="space-y-2">
                      {getUniqueDates().map((date) => (
                        <button
                          key={`first-${date}`}
                          onClick={() => handleDateSelect(date, 'first')}
                          className={`w-full rounded-lg border p-3 text-left ${
                            selectedDates.first === date
                              ? 'border-brand bg-brand/10 text-brand'
                              : 'bg-background-secondary text-text-primary border-border'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
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
                    <div className="text-text-secondary mb-2 text-sm">Seconda Data</div>
                    <div className="space-y-2">
                      {getUniqueDates().map((date) => (
                        <button
                          key={`second-${date}`}
                          onClick={() => handleDateSelect(date, 'second')}
                          className={`w-full rounded-lg border p-3 text-left ${
                            selectedDates.second === date
                              ? 'border-brand bg-brand/10 text-brand'
                              : 'bg-background-secondary text-text-primary border-border'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
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

            {/* Confronto foto */}
            {selectedDates.first && selectedDates.second && (
              <Card>
                <CardHeader>
                  <CardTitle size="md">
                    Confronto {formatDate(selectedDates.first)} vs{' '}
                    {formatDate(selectedDates.second)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Prima data */}
                    <div>
                      <div className="text-text-secondary mb-2 text-sm">
                        {formatDate(selectedDates.first)}
                      </div>
                      {getPhotosForDate(selectedDates.first)
                        .filter((photo) => photo.angle === selectedAngle)
                        .map((photo) => (
                          <div key={photo.id} className="space-y-2">
                            <div
                              className="bg-background-tertiary relative cursor-pointer overflow-hidden rounded-lg"
                              onClick={() => handlePhotoClick(photo)}
                            >
                              <Image
                                src={photo.image_url}
                                alt={`${photo.angle} ${formatDate(photo.date)}`}
                                width={400}
                                height={256}
                                className="h-64 w-full object-cover"
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity hover:opacity-100" />
                              </div>
                            </div>
                            {photo.note && (
                              <p className="text-text-secondary text-xs italic">{photo.note}</p>
                            )}
                          </div>
                        ))}
                    </div>

                    {/* Seconda data */}
                    <div>
                      <div className="text-text-secondary mb-2 text-sm">
                        {formatDate(selectedDates.second)}
                      </div>
                      {getPhotosForDate(selectedDates.second)
                        .filter((photo) => photo.angle === selectedAngle)
                        .map((photo) => (
                          <div key={photo.id} className="space-y-2">
                            <div
                              className="bg-background-tertiary relative cursor-pointer overflow-hidden rounded-lg"
                              onClick={() => handlePhotoClick(photo)}
                            >
                              <Image
                                src={photo.image_url}
                                alt={`${photo.angle} ${formatDate(photo.date)}`}
                                width={400}
                                height={256}
                                className="h-64 w-full object-cover"
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity hover:opacity-100" />
                              </div>
                            </div>
                            {photo.note && (
                              <p className="text-text-secondary text-xs italic">{photo.note}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Modalita normale - Gallery per angolo */
          <div className="space-y-4">
            {getPhotosForAngle(selectedAngle).map((photo) => (
              <Card key={photo.id}>
                <CardContent className="p-0">
                  <div className="space-y-3">
                    {/* Header foto */}
                    <div className="flex items-center justify-between p-4 pb-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-text-tertiary h-4 w-4" />
                        <span className="text-text-primary font-medium">
                          {formatDate(photo.date)}
                        </span>
                        <Badge variant="primary" size="sm">
                          {photo.angle}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(photo)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare(photo)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Immagine con lazy loading */}
                    <div
                      className="relative cursor-pointer"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <Image
                        src={photo.image_url}
                        alt={`${photo.angle} ${formatDate(photo.date)}`}
                        width={400}
                        height={256}
                        className="h-64 w-full object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//9k="
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
                        <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity hover:opacity-100" />
                      </div>
                    </div>

                    {/* Note */}
                    {photo.note && (
                      <div className="px-4 pb-4">
                        <p className="text-text-secondary text-sm italic">{photo.note}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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

        {/* Error message */}
        {error && (
          <Card variant="default" className="border-red-500/30">
            <CardContent className="py-4 text-center">
              <p className="text-text-error text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={refresh} className="mt-2">
                Riprova
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card variant="athlete">
          <CardContent className="p-4 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <ImageIcon className="text-brand h-4 w-4" />
              <span className="text-text-primary font-medium">Suggerimento</span>
            </div>
            <p className="text-text-secondary text-sm">
              Carica foto regolarmente per vedere i tuoi progressi visivi nel tempo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal fullscreen */}
      {showFullscreen && fullscreenPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="relative max-h-full max-w-4xl">
            <Image
              src={fullscreenPhoto.image_url}
              alt={`${fullscreenPhoto.angle} ${formatDate(fullscreenPhoto.date)}`}
              width={800}
              height={600}
              className="max-h-full max-w-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFullscreen(false)}
              className="absolute right-4 top-4 bg-black/50 text-white hover:bg-black/70"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
