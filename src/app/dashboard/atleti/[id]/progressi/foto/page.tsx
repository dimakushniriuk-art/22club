'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { StaffAthleteSubpageHeader } from '@/components/shared/dashboard/staff-athlete-subpage-header'
import { ErrorState } from '@/components/dashboard/error-state'
import { LoadingState } from '@/components/dashboard/loading-state'
import { StaffAthleteSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { useProgressPhotos } from '@/hooks/use-progress-photos'
import { useAuth } from '@/providers/auth-provider'
import { formatDate } from '@/lib/format'
import { ProgressPhotoImage } from '@/components/progress-photo-image'
import type { ProgressPhoto } from '@/types/progress'

const ANGLES = ['fronte', 'profilo', 'retro'] as const

export default function StaffAtletaProgressiFotoPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : null

  const { role, loading: authLoading } = useAuth()
  const { athlete, loading, error, loadAthleteData } = useAthleteProfileData(id ?? '')

  useEffect(() => {
    if (authLoading || !id) return
    if (role === 'trainer') {
      router.replace(`/dashboard/atleti/${id}?tab=progressi`)
    }
  }, [authLoading, id, role, router])
  const [selectedAngle, setSelectedAngle] = useState<'fronte' | 'profilo' | 'retro'>('fronte')

  const { photos, loading: photosLoading, error: photosError, hasMore, loadMore, filterByAngle } =
    useProgressPhotos({
      userId: id,
      role: 'athlete',
      angle: selectedAngle,
    })

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    filterByAngle(selectedAngle)
  }, [selectedAngle, filterByAngle])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || photosLoading) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !photosLoading) void loadMore()
      },
      { threshold: 0.1 },
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, photosLoading, loadMore])

  const photosForAngle = useMemo(
    () =>
      photos
        .filter((p) => p.angle === selectedAngle)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [photos, selectedAngle],
  )

  const handlePhotoOpen = useCallback((photo: ProgressPhoto) => {
    window.open(photo.image_url, '_blank', 'noopener,noreferrer')
  }, [])

  if (!id) {
    return (
      <div className="p-6">
        <ErrorState message="ID atleta mancante" onRetry={() => router.push('/dashboard/clienti')} />
      </div>
    )
  }

  if (!authLoading && role === 'trainer') {
    return (
      <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        <LoadingState message="Reindirizzamento in corso…" className="min-h-[40vh]" size="md" />
      </div>
    )
  }

  if (loading && !athlete) {
    return <StaffAthleteSegmentSkeleton />
  }

  if (error || !athlete) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? 'Atleta non trovato'} onRetry={() => loadAthleteData()} />
      </div>
    )
  }

  const backHref = `/dashboard/atleti/${id}?tab=progressi`
  const name = [athlete.nome, athlete.cognome].filter(Boolean).join(' ').trim()

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
      <StaffAthleteSubpageHeader
        backHref={backHref}
        backAriaLabel="Torna ai progressi"
        title={`Foto progressi — ${name || 'Atleta'}`}
        description="Galleria per angolo (come in app Home; sola lettura)"
      />

      <div className="flex flex-wrap gap-2">
        {ANGLES.map((angle) => (
          <button
            key={angle}
            type="button"
            onClick={() => setSelectedAngle(angle)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
              selectedAngle === angle
                ? 'border-white/20 bg-white/10 text-text-primary'
                : 'border-white/10 bg-white/[0.04] text-text-secondary hover:bg-white/5'
            }`}
          >
            {angle.charAt(0).toUpperCase() + angle.slice(1)}
          </button>
        ))}
      </div>

      {photosError ? (
        <p className="text-destructive text-sm">{photosError}</p>
      ) : photosLoading && photos.length === 0 ? (
        <p className="text-text-secondary text-sm py-8 text-center">Caricamento...</p>
      ) : photosForAngle.length === 0 ? (
        <Card variant="default" className="overflow-hidden">
          <CardContent className="py-12 text-center">
            <p className="text-text-primary font-medium">Nessuna foto per questo angolo</p>
            <p className="text-text-secondary text-sm mt-1">
              L’atleta può caricare foto dall’app Home › Foto risultati.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {photosForAngle.map((photo) => (
            <Card
              key={photo.id}
              variant="default"
              className="overflow-hidden cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => handlePhotoOpen(photo)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handlePhotoOpen(photo)
                }
              }}
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                  <span className="text-text-primary text-sm font-medium">
                    {formatDate(photo.date)}
                  </span>
                  <span className="text-text-tertiary text-xs">{photo.angle}</span>
                </div>
                <div className="flex justify-center bg-black/30 p-2">
                  <ProgressPhotoImage
                    imageUrl={photo.image_url}
                    alt={`${photo.angle} ${formatDate(photo.date)}`}
                    className="max-h-[min(70vh,560px)] w-auto max-w-full object-contain"
                  />
                </div>
                {photo.note ? (
                  <p className="text-text-secondary text-xs px-4 py-2 italic border-t border-white/10">
                    {photo.note}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
          {hasMore ? <div ref={loadMoreRef} className="h-8" aria-hidden /> : null}
        </div>
      )}
    </div>
  )
}
