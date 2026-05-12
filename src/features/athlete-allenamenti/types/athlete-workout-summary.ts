export type AthleteWorkoutSummaryExercise = {
  id: string
  exercise: {
    id: string
    name: string
    muscle_group: string
    equipment: string
    difficulty: string
    created_at: string
    updated_at: string
    video_url: string | null
    thumb_url: string | null
    image_url: string | null
    thumbnail_url: string | null
  }
  target_sets: number
  target_reps: number
  target_weight: number
  sets: Array<{
    set_number: number
    performed_weight: number
    performed_reps: number
    is_completed: boolean
  }>
  is_completed: boolean
}

export type AthleteWorkoutSummary = {
  /** Id riga \`workout_logs\` (per API debito / callback dashboard). */
  workout_log_id: string
  workout_id: string
  workout_title: string
  completed_at: string
  completion_percent: number
  total_exercises: number
  completed_exercises: number
  total_sets: number
  completed_sets: number
  total_time: number
  session_note: string | null
  is_coached: boolean
  execution_mode: string | null
  exercises: AthleteWorkoutSummaryExercise[]
  performance_stats: {
    average_weight_increase: number
    total_volume: number
    average_load_per_set: number
    consistency_score: number
    personal_records: number
  }
}
