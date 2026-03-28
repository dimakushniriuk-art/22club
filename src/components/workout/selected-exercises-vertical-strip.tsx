'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Exercise } from '@/types/workout'

export type StripEntry =
  | {
      kind: 'exercise'
      exerciseId: string
      exercise: Exercise | undefined
      sequence: number
      /** Target personalizzato rispetto ai default del wizard */
      configured?: boolean
    }
  | {
      kind: 'circuit'
      circuitId: string
      sequence: number
      exerciseCount: number
      /** Anteprima: primo esercizio del circuito */
      primaryExercise: Exercise | undefined
      configured?: boolean
    }

function SmallExerciseMedia({ exercise }: { exercise: Exercise | undefined }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState(false)
  const [imageError, setImageError] = useState(false)

  const url = exercise?.video_url?.trim() ?? ''
  const hasVideoUrl =
    url !== '' && (url.startsWith('http://') || url.startsWith('https://')) && !videoError
  const posterUrl = exercise?.thumb_url || exercise?.image_url || null

  if (exercise && hasVideoUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-md bg-black/40">
        <video
          ref={videoRef}
          src={url}
          poster={posterUrl || undefined}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          draggable={false}
          onError={() => setVideoError(true)}
          onMouseEnter={(ev) => {
            const v = ev.currentTarget
            v.play().catch(() => {})
          }}
          onMouseLeave={(ev) => {
            const v = ev.currentTarget
            v.pause()
            v.currentTime = 0
          }}
        />
      </div>
    )
  }

  const imageSrc = exercise ? exercise.thumb_url || exercise.image_url : null
  if (exercise && imageSrc && !imageError) {
    return (
      <div className="relative h-full w-full">
        <Image
          src={imageSrc}
          alt={exercise.name}
          fill
          className="object-cover"
          sizes="144px"
          unoptimized={imageSrc.startsWith('http')}
          draggable={false}
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-white/5 text-[10px] text-text-tertiary px-1 text-center">
      {exercise ? 'Nessun media' : '—'}
    </div>
  )
}

interface SelectedExercisesVerticalStripProps {
  entries: StripEntry[]
  onReorder: (fromIndex: number, toIndex: number) => void
  /** Click (non dopo un drag): es. apri step Target sul blocco esercizio */
  onItemClick?: (stripIndex: number) => void
  className?: string
}

export function SelectedExercisesVerticalStrip({
  entries,
  onReorder,
  onItemClick,
  className,
}: SelectedExercisesVerticalStripProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const suppressNextClickRef = useRef(false)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    setDraggedIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    suppressNextClickRef.current = true
    window.setTimeout(() => {
      suppressNextClickRef.current = false
    }, 0)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('text/plain')
      const from = parseInt(raw, 10)
      setDragOverIndex(null)
      setDraggedIndex(null)
      if (Number.isNaN(from) || from === dropIndex) return
      onReorder(from, dropIndex)
    },
    [onReorder],
  )

  if (entries.length === 0) {
    return (
      <aside
        className={cn(
          'flex w-full shrink-0 flex-col rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 text-center md:w-36',
          className,
        )}
      >
        <p className="text-xs text-text-tertiary leading-snug">
          Seleziona esercizi dal catalogo: qui compariranno in sequenza.
        </p>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'flex w-full shrink-0 flex-col gap-3 rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] md:w-36 md:max-w-[9rem]',
        className,
      )}
    >
      <p className="text-[11px] font-medium text-text-secondary leading-tight">
        Sequenza (trascina per riordinare
        {onItemClick ? '; clic per configurare' : ''})
      </p>
      <ul className="flex flex-row gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-x-visible md:space-y-0 md:gap-3 md:pb-0 scrollbar-thin">
        {entries.map((row, index) => (
          <li
            key={row.kind === 'circuit' ? `circuit-${row.circuitId}` : row.exerciseId}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={() => setDragOverIndex((prev) => (prev === index ? null : prev))}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => {
              if (suppressNextClickRef.current || !onItemClick) return
              onItemClick(index)
            }}
            className={cn(
              'flex min-w-[7.5rem] shrink-0 cursor-grab flex-col gap-1.5 rounded-lg border bg-black/20 p-2 transition-colors active:cursor-grabbing md:min-w-0',
              row.kind === 'circuit'
                ? 'border-amber-500/35 hover:border-amber-400/45'
                : 'border-white/10',
              onItemClick &&
                (row.kind === 'circuit' ? 'hover:border-amber-400/50' : 'hover:border-white/20'),
              draggedIndex === index && 'opacity-50',
              dragOverIndex === index && 'border-primary/50 ring-1 ring-primary/30',
            )}
          >
            <div className="relative h-20 w-full overflow-hidden rounded-md bg-background-tertiary">
              {row.kind === 'circuit' ? (
                <>
                  <SmallExerciseMedia exercise={row.primaryExercise} />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/25 text-amber-300 ring-2 ring-amber-400/40">
                      <Zap className="h-4 w-4" aria-hidden />
                    </div>
                  </div>
                </>
              ) : (
                <SmallExerciseMedia exercise={row.exercise} />
              )}
            </div>
            <div className="flex items-start gap-1.5 min-w-0">
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded bg-green-500/90 text-[10px] font-bold text-white">
                {row.sequence}
              </span>
              <span className="line-clamp-2 text-[11px] font-medium leading-tight text-text-primary">
                {row.kind === 'circuit' ? (
                  <>
                    <span className="text-amber-200/95">Circuito</span>
                    <span className="block text-[10px] font-normal text-text-tertiary">
                      {row.exerciseCount} esercizi
                    </span>
                  </>
                ) : (
                  (row.exercise?.name ?? `Esercizio (${row.exerciseId.slice(0, 8)}…)`)
                )}
              </span>
            </div>
            <span
              className={cn(
                'mt-0.5 inline-flex w-fit max-w-full rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                row.configured === true
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/35',
              )}
            >
              {row.configured === true ? 'Configurato' : 'Da configurare'}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
