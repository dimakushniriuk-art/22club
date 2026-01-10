'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { Dumbbell } from 'lucide-react'
import { createLogger } from '@/lib/logger'
import type { Exercise } from '@/types/exercise'

const logger = createLogger('components:dashboard:exercise-media')

interface ExerciseMediaProps {
  exercise: Exercise
}

export const ExerciseMedia = memo(({ exercise }: ExerciseMediaProps) => {
  const [videoError, setVideoError] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  // Validazione più rigorosa dell'URL video
  const isValidVideoUrl =
    exercise.video_url &&
    typeof exercise.video_url === 'string' &&
    exercise.video_url.trim() !== '' &&
    (exercise.video_url.startsWith('http://') || exercise.video_url.startsWith('https://')) &&
    !videoError

  return (
    <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-background-tertiary to-background-secondary">
      {isValidVideoUrl ? (
        <video
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={exercise.video_url!}
          poster={exercise.thumb_url || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          controls
          onClick={(ev) => {
            ev.stopPropagation()
            const video = ev.currentTarget as HTMLVideoElement
            // Toggle play/pause al click
            if (video.paused) {
              video.play().catch((err) => {
                logger.warn('Errore riproduzione video', err, {
                  exerciseId: exercise.id,
                  videoUrl: exercise.video_url,
                })
              })
            } else {
              video.pause()
            }
          }}
          onError={(ev) => {
            logger.warn('Errore caricamento video esercizio', undefined, {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              videoUrl: exercise.video_url,
            })
            setVideoError(true)
            // Nascondi il video in caso di errore
            const target = ev.currentTarget as HTMLVideoElement
            target.style.display = 'none'
          }}
          onLoadedMetadata={() => {
            setVideoReady(true)
          }}
          onCanPlay={() => {
            setVideoReady(true)
          }}
          onMouseEnter={(ev) => {
            const video = ev.currentTarget as HTMLVideoElement
            // Verifica che il video sia pronto prima di riprodurlo e non è già in riproduzione
            if (videoReady && video.readyState >= 2 && video.paused) {
              // HAVE_CURRENT_DATA o superiore
              video.play().catch((err) => {
                logger.warn('Errore riproduzione video', err, {
                  exerciseId: exercise.id,
                  videoUrl: exercise.video_url,
                })
              })
            }
          }}
          onMouseLeave={(ev) => {
            const video = ev.currentTarget as HTMLVideoElement
            // Non fermare se l'utente sta interagendo con i controlli
            if (!video.paused && document.activeElement !== video) {
              video.pause()
              video.currentTime = 0
            }
          }}
        />
      ) : exercise.thumb_url ? (
        <Image
          src={exercise.thumb_url}
          alt={exercise.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized={exercise.thumb_url?.startsWith('http')}
          onError={(errorEvent) => {
            logger.warn('Errore caricamento immagine esercizio', undefined, {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              thumbUrl: exercise.thumb_url,
            })
            const target = errorEvent.currentTarget as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-background-tertiary via-background-secondary to-background-tertiary">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="bg-teal-500/20 text-teal-400 rounded-full p-4 transition-transform duration-300 group-hover:scale-110">
              <Dumbbell className="h-8 w-8" />
            </div>
            <div className="text-white text-xs font-medium">Nessuna immagine</div>
          </div>
        </div>
      )}

      {/* Difficulty badge overlay */}
      <div className="absolute top-3 right-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm text-white ${
            exercise.difficulty === 'bassa'
              ? 'bg-green-500/30 border border-green-500/40'
              : exercise.difficulty === 'alta'
                ? 'bg-red-500/30 border border-red-500/40'
                : 'bg-orange-500/30 border border-orange-500/40'
          }`}
        >
          {exercise.difficulty === 'bassa'
            ? 'Principiante'
            : exercise.difficulty === 'alta'
              ? 'Avanzato'
              : 'Intermedio'}
        </span>
      </div>
    </div>
  )
})

ExerciseMedia.displayName = 'ExerciseMedia'