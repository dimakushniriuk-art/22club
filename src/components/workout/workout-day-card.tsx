// ============================================================
// Componente Card Giorno Workout con Tabella (FASE C - Split File Lunghi)
// ============================================================
// Visualizzazione tabella con tutte le serie separate e video
// ============================================================

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Play, Image as ImageIcon } from 'lucide-react'
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
      rest_timer_sec: number
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
            rest_timer_sec: exercise.rest_timer_sec || 60,
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
      restSec: set.rest_timer_sec || exercise.rest_timer_sec || 60,
      isFirstSet: setIndex === 0,
      totalSets: sets.length,
    }))
  })

  if (day.exercises.length === 0) {
    return (
      <Card
        variant="trainer"
        className="relative overflow-hidden border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-md shadow-teal-500/5 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardContent className="relative z-10 py-8 text-center">
          <p className="text-text-tertiary text-sm italic">
            Nessun esercizio assegnato a questo giorno
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card
        variant="trainer"
        className="relative overflow-hidden border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-md shadow-teal-500/5 backdrop-blur-xl"
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />

        <CardHeader className="relative z-10 border-b border-surface-300/30 pb-4">
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
        <CardContent className="relative z-10 pt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-surface-300/30">
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
                    key={`${row.exerciseId}-${row.setNumber}`}
                    className={cn(
                      'border-b border-surface-300/20 transition-colors',
                      index % 2 === 0 ? 'bg-background-secondary/30' : 'bg-background-secondary/10',
                      'hover:bg-background-tertiary/50',
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
                            onClick={() => {
                              if (row.videoUrl) {
                                setSelectedVideo({ url: row.videoUrl, name: row.exerciseName })
                              }
                            }}
                            className={cn(
                              'flex items-center justify-center w-12 h-12 rounded-lg border transition-all duration-200',
                              row.videoUrl
                                ? 'border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 hover:border-teal-500/50 cursor-pointer'
                                : 'border-surface-300/20 bg-background-tertiary/50 cursor-not-allowed opacity-50',
                            )}
                            disabled={!row.videoUrl}
                            title={row.videoUrl ? 'Riproduci video' : 'Video non disponibile'}
                          >
                            {row.videoUrl ? (
                              <Play className="h-5 w-5 text-teal-400" fill="currentColor" />
                            ) : row.imageUrl ? (
                              <ImageIcon className="h-5 w-5 text-text-tertiary" />
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
                      <span className="text-text-primary font-semibold">{row.reps}</span>
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
                      <span className="text-text-primary font-semibold">{row.restSec}s</span>
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
                src={selectedVideo.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
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
