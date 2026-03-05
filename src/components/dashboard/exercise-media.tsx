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

  // Validazione più rigorosa dell'URL video
  const isValidVideoUrl =
    exercise.video_url &&
    typeof exercise.video_url === 'string' &&
    exercise.video_url.trim() !== '' &&
    (exercise.video_url.startsWith('http://') || exercise.video_url.startsWith('https://')) &&
    !videoError

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-black/25 via-primary/5 to-transparent">
      {isValidVideoUrl ? (
        <video
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={exercise.video_url!}
          poster={exercise.thumb_url || undefined}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onClick={(ev) => {
            ev.stopPropagation()
            const video = ev.currentTarget as HTMLVideoElement
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
            const target = ev.currentTarget as HTMLVideoElement
            target.style.display = 'none'
          }}
        />
      ) : exercise.thumb_url ? (
        <Image
          src={exercise.thumb_url}
          alt={exercise.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized={exercise.thumb_url?.startsWith('http')}
          priority={false}
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
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-background-tertiary/40 via-primary/5 to-transparent">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="bg-primary/20 text-primary rounded-full p-4 transition-transform duration-300 group-hover:scale-110">
              <Dumbbell className="h-8 w-8" />
            </div>
            <div className="text-white text-xs font-medium">Nessuna immagine</div>
          </div>
        </div>
      )}
    </div>
  )
})

ExerciseMedia.displayName = 'ExerciseMedia'
