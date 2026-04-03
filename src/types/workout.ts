import type { Exercise } from './exercise'

export type { Exercise }

export type MuscleGroupType =
  | 'petto'
  | 'schiena'
  | 'spalle'
  | 'braccia'
  | 'gambe'
  | 'core'
  | 'full-body'
  | 'cardio'

export type EquipmentType =
  | 'bilanciere'
  | 'manubri'
  | 'macchine'
  | 'cavi'
  | 'corpo-libero'
  | 'elastici'
  | 'kettlebell'
  | 'altro'

export interface MuscleGroup {
  id: string
  name: string
  icon: string
}

export interface Equipment {
  id: string
  name: string
  icon: string
}

// Exercise interface is exported from ./exercise

export interface ExerciseFilter {
  search: string
  muscle_group?: string | 'all'
  equipment?: string | 'all'
  difficulty?: 'bassa' | 'media' | 'alta' | 'all'
}

export interface WorkoutSession {
  id: string
  workout_id: string
  workout_day_id?: string
  /** Nome scheda (workout_plans.name), per header coerente con il dettaglio scheda */
  plan_name?: string | null
  plan_description?: string | null
  day_title?: string
  date: string
  duration_min?: number | null
  notes?: string | null
  exercises?: Record<string, unknown>[]
  completed_exercises?: number
  progress_percentage?: number
  total_exercises?: number
}

export interface WorkoutStats {
  total_sessions?: number
  total_duration?: number
  total_exercises?: number
  total_workouts?: number
  completed_workouts?: number
  active_workouts?: number
  total_sets?: number
  completed_sets?: number
  average_completion_rate?: number
  last_workout_date?: string | null
}

// Workout Set Data Type
export interface WorkoutSetData {
  id: string
  exercise_id: string
  set_number: number
  reps: number
  weight_kg?: number
  execution_time_sec?: number
  rest_timer_sec?: number
  completed: boolean
}

// Workout Set Detail per serie individuali
export interface WorkoutSetDetail {
  id: string
  set_number: number
  reps: number
  weight_kg?: number
  execution_time_sec?: number
  rest_timer_sec?: number
}

// Workout Wizard Types
export interface WorkoutDayExerciseData {
  exercise_id: string
  sets: number
  reps_min?: number
  reps_max?: number
  weight_kg?: number
  rest_seconds?: number
  note?: string
  // Proprietà aggiuntive usate nei componenti
  target_sets?: number
  target_reps?: number
  target_weight?: number
  execution_time_sec?: number
  rest_timer_sec?: number
  order_index?: number
  // Serie individuali (opzionale, per gestione dettagliata)
  sets_detail?: WorkoutSetDetail[]
}

/** Elemento ordinato in una giornata: singolo esercizio o blocco circuito */
export type DayItem =
  | { type: 'exercise'; exercise: WorkoutDayExerciseData }
  | { type: 'circuit'; circuitId: string }

export interface WorkoutDayData {
  name: string
  title?: string
  day_number?: number
  /** Sessioni previste per questo giorno prima di revisionarlo (opzionale) */
  sessions_until_refresh?: number | null
  exercises: WorkoutDayExerciseData[]
  /** Ordine misto esercizi + circuiti (se presente ha priorità su exercises per visualizzazione) */
  items?: DayItem[]
}

export interface WorkoutWizardData {
  title: string
  description?: string
  notes?: string
  difficulty: 'bassa' | 'media' | 'alta'
  athlete_id?: string
  objective?: string
  days: WorkoutDayData[]
}

/** Anteprima “sessioni prima della revisione” per giorno (es. lista dashboard schede) */
export interface WorkoutDaySessionsPreview {
  /** workout_days.id; assente nell’anteprima costruita dal wizard prima del refetch lista */
  workout_day_id?: string
  day_number: number
  title: string | null
  /** Obiettivo impostato in creazione (sessioni prima della revisione) */
  sessions_until_refresh: number | null
  /** Conteggio da DB: workout_logs completati per questo giorno e atleta della scheda */
  sessions_completed_count: number
}

export interface Workout {
  id: string
  org_id: string
  athlete_id: string
  athlete_name?: string
  staff_name?: string
  name: string
  description?: string | null
  objective?: string | null
  /** Popolato in lista schede staff quando i giorni sono caricati dal DB */
  workout_days_sessions_preview?: WorkoutDaySessionsPreview[]
  muscle_group?: string | null
  equipment?: string | null
  difficulty: 'bassa' | 'media' | 'alta'
  video_url?: string | null
  image_url?: string | null
  status?: 'attivo' | 'completato' | 'archiviato' | 'bozza' | 'draft'
  exercises?: Exercise[]
  sessions?: WorkoutSession[]
  stats?: WorkoutStats
  created_at: string
  updated_at?: string
  created_by_staff_id?: string
  /** Lista schede staff: progressivo 1…N per data creazione (1 = più vecchia) */
  creation_order_number?: number
}
