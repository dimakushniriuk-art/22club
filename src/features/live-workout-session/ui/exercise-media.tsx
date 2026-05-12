'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Dumbbell, Play } from 'lucide-react'
import { createLogger } from '@/lib/logger'
import { useAutoplayPreviewVideo } from '@/hooks/use-autoplay-preview-video'

const logger = createLogger('app:home:allenamenti:oggi:page')

/** Video a tutto schermo / dialog: autoplay affidabile (muted) quando il modal è aperto. */
export function ModalAutoplayExerciseVideo({
  videoSrc,
  posterSrc,
}: {
  videoSrc: string
  posterSrc?: string | null
}) {
  const ref = useAutoplayPreviewVideo({ enabled: true, pauseWhenOffscreen: false })
  return (
    <video
      ref={ref}
      key={videoSrc}
      className="h-full w-full object-contain"
      src={videoSrc}
      poster={posterSrc || undefined}
      controls
      muted
      loop
      autoPlay
      playsInline
      preload="auto"
    />
  )
}

// Componente per visualizzare video/immagine esercizio con gestione errori
export function ExerciseMediaDisplay({
  exercise,
  videoUrl,
  thumbUrl,
  isValidVideoUrl,
  isValidThumbUrl,
}: {
  exercise: Record<string, unknown>
  videoUrl?: string
  thumbUrl?: string
  isValidVideoUrl: boolean
  isValidThumbUrl: boolean
}) {
  const [videoError, setVideoError] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)

  const shouldShowVideo = isValidVideoUrl && Boolean(videoUrl) && !videoError
  const videoRef = useAutoplayPreviewVideo({
    enabled: shouldShowVideo,
    pauseWhenOffscreen: true,
  })

  // Su mobile l'autoplay può essere bloccato: avvia play() via JS e, se fallisce, mostra overlay Play
  const tryPlay = React.useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.play()
      .then(() => {
        setAutoplayBlocked(false)
      })
      .catch(() => {
        setAutoplayBlocked(true)
      })
  }, [videoRef])

  useEffect(() => {
    if (!videoUrl || !isValidVideoUrl || videoError) return
    setAutoplayBlocked(false)
  }, [videoUrl, isValidVideoUrl, videoError])

  // Log per debug
  useEffect(() => {
    console.log('[ExerciseMediaDisplay] Stato media:', {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      videoUrl: videoUrl,
      thumbUrl: thumbUrl,
      isValidVideoUrl,
      isValidThumbUrl,
      videoError,
      imageError,
      shouldShowVideo: isValidVideoUrl && videoUrl && !videoError,
      shouldShowImage:
        !(isValidVideoUrl && videoUrl && !videoError) && isValidThumbUrl && thumbUrl && !imageError,
    })
  }, [
    exercise.id,
    exercise.name,
    videoUrl,
    thumbUrl,
    isValidVideoUrl,
    isValidThumbUrl,
    videoError,
    imageError,
  ])

  // Se c'è un errore video ma abbiamo una thumbnail valida, mostra l'immagine
  // Fallback automatico: se il video fallisce, mostra l'immagine se disponibile
  const shouldShowImage =
    (!shouldShowVideo || videoError) && isValidThumbUrl && thumbUrl && !imageError

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {shouldShowVideo ? (
        <>
          <video
            ref={videoRef}
            key={videoUrl}
            className="h-full w-full object-contain"
            src={videoUrl}
            poster={isValidThumbUrl && thumbUrl ? thumbUrl : undefined}
            muted
            loop
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            autoPlay
            onError={(ev) => {
              const videoElement = ev.currentTarget as HTMLVideoElement
              const error = videoElement.error

              // Costruisci errorDetails con valori sicuri e serializzabili
              // Usa JSON.stringify per assicurare serializzazione corretta
              const errorDetails: Record<string, string | number | null> = {
                exerciseId: String(exercise?.id ?? 'unknown'),
                exerciseName: String((exercise?.name as string) ?? 'unknown'),
                videoUrl: String(videoUrl ?? 'unknown'),
                networkState: videoElement.networkState ?? -1,
                readyState: videoElement.readyState ?? -1,
              }

              // Aggiungi informazioni sull'errore se disponibili
              if (error) {
                errorDetails.errorCode = error.code ?? null
                errorDetails.errorMessage = String(error.message ?? 'Errore sconosciuto')

                // Codici errore HTMLMediaElement
                const errorCodeMap: Record<number, string> = {
                  1: 'MEDIA_ERR_ABORTED - Caricamento interrotto',
                  2: 'MEDIA_ERR_NETWORK - Errore di rete',
                  3: 'MEDIA_ERR_DECODE - Errore di decodifica',
                  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Formato non supportato',
                }
                errorDetails.errorCodeDescription =
                  errorCodeMap[error.code] ?? `Codice sconosciuto: ${error.code}`
              } else {
                errorDetails.errorMessage = 'Errore video senza dettagli disponibili'
                errorDetails.errorCode = null
                errorDetails.errorCodeDescription = 'Nessun codice errore disponibile'
              }

              // Aggiungi informazioni aggiuntive per debug
              errorDetails.videoSrc = String(videoElement.src ?? 'N/A')
              errorDetails.videoCurrentSrc = String(videoElement.currentSrc ?? 'N/A')
              errorDetails.videoNetworkState = videoElement.networkState ?? -1
              errorDetails.videoReadyState = videoElement.readyState ?? -1

              // Log solo in sviluppo per evitare spam in produzione
              if (process.env.NODE_ENV === 'development') {
                // Usa JSON.stringify per assicurare che l'oggetto sia serializzato correttamente
                console.error('[video] Errore caricamento:', JSON.stringify(errorDetails, null, 2))
                console.error('Video element state:', {
                  src: videoElement.src,
                  currentSrc: videoElement.currentSrc,
                  networkState: videoElement.networkState,
                  readyState: videoElement.readyState,
                  error: error
                    ? {
                        code: error.code,
                        message: error.message,
                      }
                    : null,
                })
              }

              logger.warn('Errore caricamento video esercizio', undefined, errorDetails)
              setVideoError(true)
            }}
            onLoadedMetadata={(ev) => {
              const videoElement = ev.currentTarget as HTMLVideoElement
              videoElement.playbackRate = 1.1 // Velocizza del 10%
              if (process.env.NODE_ENV === 'development') {
                console.log('[video] Metadata caricato:', {
                  exerciseId: exercise.id,
                  videoUrl,
                })
              }
              logger.debug('Video metadata caricato', { exerciseId: exercise.id, videoUrl })
            }}
            onCanPlay={(ev) => {
              const videoElement = ev.currentTarget as HTMLVideoElement
              videoElement.playbackRate = 1.1 // Velocizza del 10%
              if (process.env.NODE_ENV === 'development') {
                console.log('[video] Pronto per la riproduzione:', {
                  exerciseId: exercise.id,
                  videoUrl: videoUrl,
                })
              }
            }}
          />
          {autoplayBlocked && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                tryPlay()
              }}
              className="absolute inset-0 flex items-center justify-center transition-opacity hover:bg-black/30 active:scale-95"
              style={
                isValidThumbUrl && thumbUrl
                  ? {
                      background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${thumbUrl}) center/cover`,
                    }
                  : undefined
              }
              aria-label="Riproduci video"
            >
              {(!isValidThumbUrl || !thumbUrl) && <span className="absolute inset-0 bg-black/50" />}
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/90 text-white shadow-lg">
                <Play className="h-6 w-6 fill-current" />
              </span>
            </button>
          )}
        </>
      ) : shouldShowImage ? (
        <Image
          key={thumbUrl}
          src={thumbUrl}
          alt={(exercise.name as string) || 'Esercizio'}
          fill
          className="object-contain"
          unoptimized={thumbUrl.startsWith('http')}
          onError={() => {
            logger.warn('Errore caricamento immagine esercizio', undefined, {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              thumbUrl: thumbUrl,
            })
            setImageError(true)
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-background-tertiary via-background-secondary to-background-tertiary">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-cyan-500/20 text-cyan-400 rounded-full p-3">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div className="text-white text-xs font-medium">Nessun media disponibile</div>
          </div>
        </div>
      )}
    </div>
  )
}
