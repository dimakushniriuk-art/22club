'use client'

import { forwardRef, useEffect, useState, type ReactNode } from 'react'
import { Flame, ListOrdered, Weight } from 'lucide-react'
import { useAutoplayPreviewVideo } from '@/hooks/use-autoplay-preview-video'
import { cn } from '@/lib/utils'
import type { WorkoutShareCardProps } from '@/lib/workouts/workout-share-types'

function ShareExerciseThumb({
  imageUrl,
  videoUrl,
  name,
}: {
  imageUrl: string | null
  videoUrl: string | null
  name: string
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const showImgFlag = Boolean(imageUrl && !imgFailed)
  const videoShouldPlay = Boolean(videoUrl && !videoFailed && !showImgFlag)
  const videoRef = useAutoplayPreviewVideo({
    enabled: videoShouldPlay,
    pauseWhenOffscreen: true,
  })

  useEffect(() => {
    setImgFailed(false)
    setVideoFailed(false)
  }, [imageUrl, videoUrl])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !videoUrl) return
    const bumpFrame = () => {
      try {
        if (
          el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          el.duration > 0 &&
          !Number.isNaN(el.duration)
        ) {
          el.currentTime = Math.min(0.12, Math.max(0.04, el.duration * 0.03))
        }
      } catch {
        /* ignore */
      }
    }
    el.addEventListener('loadeddata', bumpFrame)
    return () => el.removeEventListener('loadeddata', bumpFrame)
  }, [videoUrl, videoRef])

  const showImg = showImgFlag
  const showVideo = videoShouldPlay
  const showPlaceholder = !showImg && !showVideo

  if (showPlaceholder) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-900 px-4 text-center">
        <span className="text-[14px] font-medium leading-snug text-zinc-500">{name}</span>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- export PNG
        <img
          src={imageUrl!}
          alt=""
          crossOrigin="anonymous"
          onError={() => setImgFailed(true)}
          className="h-full w-full scale-105 object-cover brightness-[0.96] saturate-[1.02]"
        />
      ) : null}
      {showVideo ? (
        <video
          ref={videoRef}
          src={videoUrl!}
          crossOrigin="anonymous"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onError={() => setVideoFailed(true)}
          className="h-full w-full scale-105 object-cover brightness-[0.96] saturate-[1.02]"
        />
      ) : null}
      {/* Leggera lettura testo in basso — meno overlay del precedente */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
    </div>
  )
}

function HeroStat({
  label,
  children,
  icon,
}: {
  label: string
  children: ReactNode
  icon: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-6 text-center">
      <div className="mb-2 text-zinc-500">{icon}</div>
      <div className="text-zinc-50">{children}</div>
      <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
    </div>
  )
}

export const WorkoutShareCard = forwardRef<HTMLDivElement, WorkoutShareCardProps>(
  function WorkoutShareCard(props, ref) {
    const {
      completedAtLabel,
      workoutTitle,
      stats,
      exercises,
      exercisesOverflowCount,
      brand,
      trainerOrGymName,
    } = props

    return (
      <div
        ref={ref}
        className={cn(
          'relative box-border flex h-[1080px] w-[1080px] shrink-0 flex-col overflow-hidden',
          'rounded-[32px] border border-white/[0.06]',
          'bg-[#050508]',
        )}
      >
        {/* Sfondo: quasi nero + accenno cyan */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 70% at 50% 0%, rgba(34,211,238,0.06), transparent 55%)',
          }}
        />

        <div className="relative z-[1] flex h-full min-h-0 flex-col px-11 pb-10 pt-10">
          {/* 1 — Header compatto */}
          <header className="flex shrink-0 items-start justify-between gap-6">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                {completedAtLabel.replace(',', ' ·')}
              </p>
              <p className="line-clamp-2 text-[14px] font-medium leading-snug text-zinc-400">
                {workoutTitle}
              </p>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
              {brand.logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoSrc}
                  alt=""
                  width={28}
                  height={28}
                  className="object-contain opacity-95"
                />
              ) : (
                <span className="text-[11px] font-bold text-cyan-400/90">22</span>
              )}
            </div>
          </header>

          {/* 1 — Hero principale (focus massimo) */}
          <div className="mt-7 shrink-0">
            <h2 className="text-[68px] font-black uppercase leading-[0.88] tracking-[-0.04em]">
              <span className="block text-white">Allenamento</span>
              <span className="block bg-gradient-to-r from-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                completato
              </span>
            </h2>
          </div>

          {/* 2 — Showcase esercizi (secondo focus) */}
          <section className="relative mt-8 flex min-h-0 flex-1 flex-col">
            <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-4">
              {exercises.map((ex, idx) => {
                const metaParts = [ex.highlightPr ? 'Record' : null, ex.weightLabel].filter(Boolean)
                const meta = metaParts.join(' · ')
                return (
                  <div
                    key={`${ex.name}-${idx}`}
                    className="relative min-h-0 overflow-hidden rounded-2xl border border-white/[0.06] bg-black"
                  >
                    <div className="relative h-full min-h-[238px] w-full">
                      <ShareExerciseThumb
                        imageUrl={ex.imageUrl}
                        videoUrl={ex.videoUrl}
                        name={ex.name}
                      />
                      {ex.completed ? (
                        <span className="absolute left-3 top-3 z-[2] rounded-full bg-emerald-400 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-black">
                          Fatto
                        </span>
                      ) : null}
                      {ex.highlightPr ? (
                        <span className="absolute right-3 top-3 z-[2] rounded-full bg-orange-400 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-black">
                          PR
                        </span>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 z-[2] px-4 pb-4 pt-12">
                        <p className="line-clamp-2 text-[14px] font-semibold leading-tight text-white">
                          {ex.name}
                        </p>
                        {meta ? (
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-cyan-200/90">
                            {meta}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {exercisesOverflowCount > 0 ? (
              <p className="mt-4 shrink-0 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                +{exercisesOverflowCount}{' '}
                {exercisesOverflowCount === 1 ? 'altro esercizio' : 'altri esercizi'}
              </p>
            ) : null}
          </section>

          {/* 3 — Statistiche principali (terzo focus) */}
          <section className="mt-8 shrink-0">
            <div className="grid grid-cols-3 gap-4">
              <HeroStat
                label="Volume"
                icon={<Weight className="h-5 w-5 text-cyan-400/80" aria-hidden />}
              >
                <p className="text-[28px] font-bold tabular-nums leading-none tracking-tight text-white">
                  {stats.volumeKgFormatted}
                  <span className="ml-1 text-[13px] font-medium text-zinc-500">kg</span>
                </p>
              </HeroStat>
              <HeroStat
                label="Serie"
                icon={<ListOrdered className="h-5 w-5 text-cyan-400/80" aria-hidden />}
              >
                <p className="text-[28px] font-bold tabular-nums leading-none text-white">
                  {stats.setsCompleted}
                </p>
              </HeroStat>
              <HeroStat
                label="Sessione"
                icon={<Flame className="h-5 w-5 text-cyan-400/80" aria-hidden />}
              >
                <p className="text-[28px] font-bold tabular-nums leading-none text-cyan-300">
                  {stats.completionPct}
                  <span className="text-[15px] font-semibold text-cyan-400/90">%</span>
                </p>
              </HeroStat>
            </div>
          </section>

          {/* Footer minimale — sempre sotto il contenuto, niente overlap */}
          <footer className="mt-10 shrink-0 border-t border-white/[0.05] pt-8 text-center">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
              {brand.name}
            </p>
            <p className="mt-2 text-[9px] font-medium tracking-[0.14em] text-zinc-600">
              Condividi i tuoi risultati
            </p>
            {trainerOrGymName ? (
              <p className="mt-2 text-[9px] text-zinc-700">{trainerOrGymName}</p>
            ) : null}
          </footer>
        </div>
      </div>
    )
  },
)
