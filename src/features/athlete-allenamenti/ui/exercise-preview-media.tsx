'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play } from 'lucide-react'
import type { AthleteWorkoutDayExerciseMedia } from '@/hooks/use-athlete-workout-day-preview'
import { useAutoplayPreviewVideo } from '@/hooks/use-autoplay-preview-video'
import {
  isRemoteOrPathImage,
  isStreamableVideoUrl,
  videoPosterAttr,
} from '@/features/athlete-allenamenti/lib/giorno-preview-helpers'

type Props = {
  exercise: AthleteWorkoutDayExerciseMedia | null
  name: string
  href: string | null
  compact?: boolean
}

export function ExercisePreviewMedia({ exercise, name, href, compact }: Props) {
  const videoUrl = exercise?.video_url
  const thumbUrl = exercise?.thumb_url
  const imageUrl = exercise?.image_url
  const posterRaw = thumbUrl || imageUrl || undefined
  const poster = videoPosterAttr(posterRaw)
  const hasVideo = isStreamableVideoUrl(videoUrl)
  const imageSrc = thumbUrl || imageUrl
  const stillForVideoUnderlay = hasVideo && isRemoteOrPathImage(imageSrc) ? imageSrc : null

  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldAttachVideoSrc, setShouldAttachVideoSrc] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  useEffect(() => {
    setVideoReady(false)
    setVideoFailed(false)
    setShouldAttachVideoSrc(false)
  }, [exercise?.id, videoUrl])

  useEffect(() => {
    if (!hasVideo || !videoUrl || videoFailed) return
    const root = containerRef.current
    if (!root) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldAttachVideoSrc(true)
            io.disconnect()
            break
          }
        }
      },
      { rootMargin: '220px 0px 200px 0px', threshold: 0.01 },
    )
    io.observe(root)
    return () => io.disconnect()
  }, [hasVideo, videoUrl, videoFailed])

  const previewVideoRef = useAutoplayPreviewVideo({
    enabled: Boolean(hasVideo && videoUrl && shouldAttachVideoSrc && !videoFailed),
    pauseWhenOffscreen: true,
  })

  const boxClass = compact
    ? 'relative h-16 w-[5.25rem] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:h-[4.5rem] sm:w-24'
    : 'relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:h-24 sm:w-36'

  const imageSizes = compact ? '96px' : '144px'

  const inner = (
    <ExercisePreviewMediaInner
      boxClass={boxClass}
      containerRef={containerRef}
      hasVideo={hasVideo}
      videoUrl={videoUrl}
      videoFailed={videoFailed}
      stillForVideoUnderlay={stillForVideoUnderlay}
      videoReady={videoReady}
      imageSizes={imageSizes}
      shouldAttachVideoSrc={shouldAttachVideoSrc}
      previewVideoRef={previewVideoRef}
      poster={poster}
      name={name}
      setVideoReady={setVideoReady}
      setVideoFailed={setVideoFailed}
      imageSrc={imageSrc}
    />
  )

  if (href) {
    return (
      <Link
        href={href}
        className="shrink-0 touch-manipulation rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-90"
        aria-label={`Video e dettagli: ${name}`}
      >
        {inner}
      </Link>
    )
  }

  return inner
}

function ExercisePreviewMediaInner({
  boxClass,
  containerRef,
  hasVideo,
  videoUrl,
  videoFailed,
  stillForVideoUnderlay,
  videoReady,
  imageSizes,
  shouldAttachVideoSrc,
  previewVideoRef,
  poster,
  name,
  setVideoReady,
  setVideoFailed,
  imageSrc,
}: {
  boxClass: string
  containerRef: RefObject<HTMLDivElement | null>
  hasVideo: boolean
  videoUrl: string | null | undefined
  videoFailed: boolean
  stillForVideoUnderlay: string | null
  videoReady: boolean
  imageSizes: string
  shouldAttachVideoSrc: boolean
  previewVideoRef: RefObject<HTMLVideoElement | null>
  poster: string | undefined
  name: string
  setVideoReady: (ready: boolean) => void
  setVideoFailed: (failed: boolean) => void
  imageSrc: string | null | undefined
}) {
  return (
    <div ref={containerRef} className={boxClass}>
      {hasVideo && videoUrl && !videoFailed ? (
        <>
          {stillForVideoUnderlay ? (
            <Image
              src={stillForVideoUnderlay}
              alt=""
              fill
              className={`object-cover transition-opacity duration-200 ${videoReady ? 'opacity-0' : 'opacity-100'}`}
              sizes={imageSizes}
              unoptimized={stillForVideoUnderlay.startsWith('http')}
              aria-hidden
            />
          ) : (
            <ExercisePreviewMediaPlaceholder videoReady={videoReady} />
          )}
          {shouldAttachVideoSrc ? (
            <video
              ref={previewVideoRef}
              src={videoUrl}
              className={`relative z-10 h-full w-full object-cover transition-opacity duration-200 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
              poster={poster}
              preload="metadata"
              muted
              loop
              playsInline
              autoPlay
              onLoadedData={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
              aria-label={`Anteprima video: ${name}`}
            />
          ) : null}
        </>
      ) : isRemoteOrPathImage(imageSrc) ? (
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
          sizes={imageSizes}
          unoptimized={imageSrc.startsWith('http')}
        />
      ) : (
        <ExercisePreviewMediaPlaceholder />
      )}
    </div>
  )
}

function ExercisePreviewMediaPlaceholder({ videoReady = false }: { videoReady?: boolean }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-white/5 transition-opacity duration-200 ${videoReady ? 'opacity-0' : 'opacity-100'}`}
      aria-hidden
    >
      <Play className="h-6 w-6 text-cyan-400/50" aria-hidden />
    </div>
  )
}
