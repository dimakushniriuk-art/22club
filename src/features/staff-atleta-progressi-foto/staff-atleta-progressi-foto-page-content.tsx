'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ProgressPhotoImage } from '@/components/progress-photo-image'
import {
  StaffAthleteProgressBootstrap,
  StaffAthleteProgressSubpageFrame,
  StaffAthleteProgressSuspensePage,
  type StaffAthleteProgressReadyContext,
} from '@/features/staff-athlete-progress'
import { useProgressPhotos } from '@/hooks/use-progress-photos'
import { useProgressiveMount } from '@/hooks/use-progressive-mount'
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import { formatDate } from '@/lib/format'
import { useAuth } from '@/providers/auth-provider'
import type { ProgressPhoto } from '@/types/progress'

const ANGLES = ['fronte', 'profilo', 'retro'] as const

function FotoContent({ profileId, displayName, tabBackHref }: StaffAthleteProgressReadyContext) {
  const [selectedAngle, setSelectedAngle] = useState<'fronte' | 'profilo' | 'retro'>('fronte')

  const {
    photos,
    loading: photosLoading,
    error: photosError,
    hasMore,
    loadMore,
    filterByAngle,
  } = useProgressPhotos({
    userId: profileId,
    role: 'athlete',
    angle: selectedAngle,
  })

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    filterByAngle(selectedAngle)
  }, [selectedAngle, filterByAngle])

  const photosForAngle = useMemo(
    () =>
      photos
        .filter((p) => p.angle === selectedAngle)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [photos, selectedAngle],
  )

  const {
    visibleItems: visiblePhotos,
    hasMore: hasMoreVisiblePhotos,
    loadMore: showMoreVisiblePhotos,
  } = useProgressiveMount(photosForAngle, { initial: 8, step: 8 })

  useEffect(() => {
    if (!loadMoreRef.current || photosLoading) return
    if (!hasMoreVisiblePhotos && !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || photosLoading) return
        if (hasMoreVisiblePhotos) {
          showMoreVisiblePhotos()
          return
        }
        if (hasMore) void loadMore()
      },
      { threshold: 0.1 },
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, hasMoreVisiblePhotos, photosLoading, loadMore, showMoreVisiblePhotos])

  const handlePhotoOpen = useCallback((photo: ProgressPhoto) => {
    window.open(photo.image_url, '_blank', 'noopener,noreferrer')
  }, [])

  const showLoadMoreSentinel = hasMoreVisiblePhotos || hasMore

  return (
    <StaffAthleteProgressSubpageFrame
      header={{
        backHref: tabBackHref,
        backAriaLabel: 'Torna ai progressi',
        title: `Foto progressi — ${displayName || 'Atleta'}`,
        description: 'Galleria per angolo (come in app Home; sola lettura)',
      }}
    >
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
          {visiblePhotos.map((photo) => (
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
          {showLoadMoreSentinel ? <div ref={loadMoreRef} className="h-8" aria-hidden /> : null}
        </div>
      )}
    </StaffAthleteProgressSubpageFrame>
  )
}

function FotoBody({ routeParams }: { routeParams: Promise<{ id: string }> }) {
  const resolved = useResolvedParams(routeParams)
  const router = useRouter()
  const profileId = typeof resolved.id === 'string' ? resolved.id : null
  const { role, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading || !profileId) return
    if (role === 'trainer') {
      router.replace(`/dashboard/atleti/${profileId}?tab=progressi`)
    }
  }, [authLoading, profileId, role, router])

  if (!authLoading && role === 'trainer') {
    return (
      <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        <LoadingState message="Reindirizzamento in corso…" className="min-h-[40vh]" size="md" />
      </div>
    )
  }

  return (
    <StaffAthleteProgressBootstrap routeParams={routeParams}>
      {(context) => <FotoContent {...context} />}
    </StaffAthleteProgressBootstrap>
  )
}

export function StaffAtletaProgressiFotoPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <StaffAthleteProgressSuspensePage params={params}>
      {({ routeParams }) => <FotoBody routeParams={routeParams} />}
    </StaffAthleteProgressSuspensePage>
  )
}
