/** Props per export PNG achievement card allenamento (solo dati reali). */

/** Riga esercizio per media + calcolo PR (storico Supabase). */
export type WorkoutShareExerciseMediaLine = {
  name: string
  maxWeightKg: number
  isPersonalRecord: boolean
  mediaPreviewUrl: string | null
  mediaVideoUrl: string | null
}

export type WorkoutShareBrand = {
  name: '22Club'
  logoSrc: string | null
}

export type WorkoutShareExerciseItem = {
  name: string
  imageUrl: string | null
  videoUrl: string | null
  setsLabel: string
  repsLabel: string
  weightLabel: string | null
  completed: boolean
  highlightPr: boolean
}

export type WorkoutShareStats = {
  volumeKgFormatted: string
  durationLabel: string
  durationMinutes: number
  exercisesCompleted: number
  exercisesTotal: number
  setsCompleted: number
  setsTotal: number
  averageLoadPerSetKg: number
  completionPct: number
}

export type WorkoutShareCardProps = {
  completedAtLabel: string
  completedAtIso: string
  workoutTitle: string
  completionPct: number
  /** Label progress bar (es. Completamento serie). */
  completionSessionLabel: string
  stats: WorkoutShareStats
  exercises: WorkoutShareExerciseItem[]
  exercisesOverflowCount: number
  highlights: string[]
  brand: WorkoutShareBrand
  trainerOrGymName?: string | null
}
