// ============================================================
// Componente Card Giorno Workout con Tabella (FASE C - Split File Lunghi)
// ============================================================
// Visualizzazione tabella con tutte le serie separate e video
// ============================================================

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAutoplayPreviewVideo } from '@/hooks/use-autoplay-preview-video'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Play, Image as ImageIcon } from 'lucide-react'
import { formatWorkoutRepsLabel } from '@/lib/constants/workout-reps-select'
import {
  formatScheduledRestTableCell,
  resolveScheduledRestSeconds,
} from '@/lib/workout/scheduled-rest-display'
import { cn } from '@/lib/utils'

interface WorkoutDayCardProps {
  day: {
    id: string
    day_number: number
    title: string
    exercises: Array<{
      id: string
      exercise_id: string | null
      exercise_name: string
      video_url?: string | null
      image_url?: string | null
      target_sets: number
      target_reps: number
      target_weight: number | null
      /** Recupero a livello esercizio (scheda); può essere null se non impostato */
      rest_timer_sec: number | null
      order_index: number
      note?: string | null
      sets?: Array<{
        id: string
        set_number: number
        reps: number
        weight_kg: number | null
        execution_time_sec: number | null
        rest_timer_sec: number | null
      }>
    }>
  }
}

export function WorkoutDayCard({ day }: WorkoutDayCardProps) {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; name: string } | null>(null)
  const modalVideoRef = useAutoplayPreviewVideo({
    enabled: Boolean(selectedVideo),
    pauseWhenOffscreen: false,
  })

  // Espandi gli esercizi in righe per ogni serie
  const tableRows = day.exercises.flatMap((exercise, exerciseIndex) => {
    const sets =
      exercise.sets && exercise.sets.length > 0
        ? exercise.sets
        : Array.from({ length: exercise.target_sets || 1 }, (_, i) => ({
            id: `default-${exercise.id}-${i + 1}`,
            set_number: i + 1,
            reps: exercise.target_reps || 0,
            weight_kg: exercise.target_weight,
            execution_time_sec: null,
            rest_timer_sec: null,
          }))

    return sets.map((set, setIndex) => ({
      exerciseId: exercise.id,
      exerciseIndex,
      setIndex,
      exerciseName: exercise.exercise_name,
      videoUrl: exercise.video_url,
      imageUrl: exercise.image_url,
      exerciseNote: exercise.note || null, // Nota esercizio (solo per la prima serie)
      setNumber: set.set_number,
      reps: set.reps,
      weightKg: set.weight_kg,
      restSec: resolveScheduledRestSeconds(set.rest_timer_sec, exercise.rest_timer_sec),
      isFirstSet: setIndex === 0,
      totalSets: sets.length,
    }))
  })

  if (day.exercises.length === 0) {
    return (
      <Card variant="default" className="relative overflow-hidden">
        <CardContent className="py-8 text-center">
          <p className="text-text-tertiary text-sm italic">
            Nessun esercizio assegnato a questo giorno
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card variant="default" className="relative overflow-hidden border-l-4 border-l-primary/30">
        <CardHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle size="sm" className="text-text-primary">
              {day.title}
            </CardTitle>
            {day.day_number > 0 && (
              <span className="text-text-tertiary text-xs font-medium">
                Giorno {day.day_number}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-text-secondary text-xs font-medium uppercase tracking-wide text-left py-3 px-4">
                    Esercizio
                  </th>
                  <th className="text-text-secondary text-xs font-medium uppercase tracking-wide text-left py-3 px-4">
                    Video
                  </th>
                  <th className="text-text-secondary text-xs font-medium uppercase tracking-wide text-center py-3 px-4">
                    Serie
                  </th>
                  <th className="text-text-secondary text-xs font-medium uppercase tracking-wide text-center py-3 px-4">
                    Ripetizioni
                  </th>
                  <th className="text-text-secondary text-xs font-medium uppercase tracking-wide text-center py-3 px-4">
                    Peso
                  </th>
                  <th className="text-text-secondary text-xs font-medium uppercase tracking-wide text-center py-3 px-4">
                    Recupero
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => (
                  <tr
                    key={`${row.exerciseIndex}-${row.setIndex}`}
                    className={cn(
                      'border-b border-white/10 transition-colors',
                      index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent',
                      'hover:bg-white/[0.04]',
                    )}
                  >
                    {/* Esercizio */}
                    <td className="py-4 px-4">
                      {row.isFirstSet ? (
                        <div className="font-semibold text-text-primary">{row.exerciseName}</div>
                      ) : (
                        <div className="text-text-tertiary text-sm">—</div>
                      )}
                    </td>

                    {/* Video */}
                    <td className="py-4 px-4">
                      {row.isFirstSet && (row.videoUrl || row.imageUrl) ? (
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (row.videoUrl) {
                                setSelectedVideo({ url: row.videoUrl, name: row.exerciseName })
                              }
                            }}
                            disabled={!row.videoUrl}
                            aria-label={
                              row.videoUrl
                                ? `Riproduci video: ${row.exerciseName}`
                                : 'Video non disponibile'
                            }
                            title={row.videoUrl ? 'Riproduci video' : 'Video non disponibile'}
                            className={cn(
                              'group relative flex aspect-video w-[7.5rem] shrink-0 overflow-hidden rounded-lg border transition-all duration-200 sm:w-[8.75rem]',
                              row.videoUrl
                                ? 'cursor-pointer border-white/10 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                                : 'cursor-not-allowed border-white/10 opacity-60',
                            )}
                          >
                            {row.videoUrl ? (
                              <>
                                <video
                                  src={row.videoUrl}
                                  muted
                                  playsInline
                                  preload="metadata"
                                  poster={row.imageUrl ?? undefined}
                                  className="pointer-events-none h-full w-full object-cover bg-black/50"
                                  aria-hidden
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-[background] group-hover:bg-black/45">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-primary shadow-lg ring-1 ring-white/15 backdrop-blur-[2px]">
                                    <Play className="h-5 w-5 drop-shadow" fill="currentColor" />
                                  </span>
                                </span>
                              </>
                            ) : row.imageUrl ? (
                              <>
                                <div className="relative h-full min-h-[4.5rem] w-full">
                                  <Image
                                    src={row.imageUrl}
                                    alt=""
                                    fill
                                    sizes="140px"
                                    className="object-cover"
                                    unoptimized={row.imageUrl.startsWith('http')}
                                  />
                                </div>
                                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <ImageIcon className="h-7 w-7 text-white/90 drop-shadow" />
                                </span>
                              </>
                            ) : null}
                          </button>
                          {/* Nota esercizio sotto il video */}
                          {row.exerciseNote && (
                            <div className="w-48 max-w-full">
                              <div className="text-text-secondary text-[10px] font-medium uppercase tracking-wider mb-1">
                                Note
                              </div>
                              <p className="text-text-primary text-xs leading-relaxed whitespace-pre-wrap break-words">
                                {row.exerciseNote}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : row.isFirstSet && row.exerciseNote ? (
                        // Se non c'è video ma c'è nota, mostra solo la nota
                        <div className="w-48 max-w-full">
                          <div className="text-text-secondary text-[10px] font-medium uppercase tracking-wider mb-1">
                            Note
                          </div>
                          <p className="text-text-primary text-xs leading-relaxed whitespace-pre-wrap break-words">
                            {row.exerciseNote}
                          </p>
                        </div>
                      ) : (
                        <div className="text-text-tertiary text-sm">—</div>
                      )}
                    </td>

                    {/* Serie */}
                    <td className="py-4 px-4 text-center">
                      <span className="text-text-primary font-semibold">
                        {row.setNumber}/{row.totalSets}
                      </span>
                    </td>

                    {/* Ripetizioni */}
                    <td className="py-4 px-4 text-center">
                      <span className="text-text-primary font-semibold">
                        {formatWorkoutRepsLabel(row.reps)}
                      </span>
                    </td>

                    {/* Peso */}
                    <td className="py-4 px-4 text-center">
                      {row.weightKg && row.weightKg > 0 ? (
                        <span className="text-text-primary font-semibold">{row.weightKg} kg</span>
                      ) : (
                        <span className="text-text-tertiary text-sm">—</span>
                      )}
                    </td>

                    {/* Recupero */}
                    <td className="py-4 px-4 text-center">
                      {row.restSec === null ? (
                        <span className="text-text-tertiary text-sm">—</span>
                      ) : (
                        <span className="text-text-primary font-semibold">
                          {formatScheduledRestTableCell(row.restSec)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal fullscreen video */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative max-h-full max-w-5xl w-full">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute right-4 top-4 z-50 bg-black/50 text-white hover:bg-black/70 rounded-full p-2 transition-all duration-200"
              aria-label="Chiudi video"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div
              className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={modalVideoRef}
                src={selectedVideo.url}
                className="w-full h-full object-contain"
                controls
                muted
                loop
                autoPlay
                playsInline
                preload="auto"
              >
                Il tuo browser non supporta la riproduzione video.
              </video>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pointer-events-none">
                <h3 className="text-white text-lg font-semibold drop-shadow-lg">
                  {selectedVideo.name}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
