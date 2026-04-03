// ============================================================
// Hook per gestione workout plans (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { apiGet } from '@/lib/api-client'
import { createLogger } from '@/lib/logger'
import type {
  Workout,
  WorkoutWizardData,
  WorkoutDayData,
  WorkoutDayExerciseData,
  WorkoutDaySessionsPreview,
  DayItem,
  Exercise,
} from '@/types/workout'
import type { Tables, TablesInsert } from '@/types/supabase'
import { isWorkoutPlanRealAthleteId } from '@/lib/constants/workout-plan-wizard'
import { isSupabaseAuthLockStealAbortError } from '@/lib/supabase/supabase-lock-abort'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('hooks:workout-plans:use-workout-plans')

function isWorkoutLogStatoCompleted(stato: string | null | undefined): boolean {
  const s = String(stato ?? '').toLowerCase()
  return s === 'completato' || s === 'completed'
}

function isWorkoutLogRowCompleted(row: {
  stato?: string | null
  completato?: boolean | null
}): boolean {
  if (row.completato === true) return true
  return isWorkoutLogStatoCompleted(row.stato)
}

function buildDaysSessionsPreviewFromWizard(days: WorkoutDayData[]): WorkoutDaySessionsPreview[] {
  return days.map((day, idx) => {
    const sur = day.sessions_until_refresh
    return {
      day_number: day.day_number ?? idx + 1,
      title: day.title ?? day.name ?? null,
      sessions_until_refresh:
        typeof sur === 'number' && Number.isFinite(sur) && sur >= 1 ? sur : null,
      sessions_completed_count: 0,
    }
  })
}

/** Numerazione stabile tra le schede dello staff: ordine per `created_at` crescente, tie-break su `id`. */
function assignCreationOrderNumbers(items: Workout[]): Workout[] {
  if (items.length === 0) return items
  const sorted = [...items].sort((a, b) => {
    const ta = new Date(a.created_at).getTime()
    const tb = new Date(b.created_at).getTime()
    if (ta !== tb) return ta - tb
    return a.id.localeCompare(b.id)
  })
  const idToNum = new Map<string, number>()
  for (let i = 0; i < sorted.length; i++) {
    idToNum.set(sorted[i].id, i + 1)
  }
  return items.map((w) => ({
    ...w,
    creation_order_number: idToNum.get(w.id) ?? 1,
  }))
}

function buildDaysSessionsPreviewFromDuplicateSource(
  days: Array<{
    day_number: number
    title: string | null
    day_name: string
    sessions_until_refresh?: number | null
  }>,
): WorkoutDaySessionsPreview[] {
  return days.map((d) => {
    const sur = d.sessions_until_refresh
    return {
      day_number: d.day_number,
      title: d.title ?? d.day_name ?? null,
      sessions_until_refresh:
        typeof sur === 'number' && Number.isFinite(sur) && sur >= 1 ? sur : null,
      sessions_completed_count: 0,
    }
  })
}

type ProfileRow = Tables<'profiles'>
type ExerciseRow = Tables<'exercises'>
type WorkoutRow = Tables<'workout_plans'>
type WorkoutInsert = TablesInsert<'workout_plans'>
type WorkoutRowSelected = {
  id: string
  athlete_id: string | null
  name: string
  description: string | null
  objective?: string | null
  is_active: boolean | null
  is_draft?: boolean | null
  difficulty?: string | null
  created_by_profile_id: string | null
  created_at: string | null
  updated_at: string | null
}

function mapWorkoutPlanStatus(row: {
  is_active?: boolean | null
  is_draft?: boolean | null
}): NonNullable<Workout['status']> {
  if (row.is_draft) return 'bozza'
  return row.is_active ? 'attivo' : 'completato'
}

const difficultyDbToUi = (value?: string | null): Workout['difficulty'] => {
  switch (value) {
    case 'beginner':
    case 'bassa':
      return 'bassa'
    case 'advanced':
    case 'alta':
      return 'alta'
    case 'media':
    case 'intermediate':
    default:
      return 'media'
  }
}

function getDayItems(day: WorkoutDayData): DayItem[] {
  if (day.items && day.items.length > 0) return day.items
  return (day.exercises || []).map((e) => ({ type: 'exercise' as const, exercise: e }))
}

/** DB CHECK workout_plans: bassa | media | alta (vedi migration). */
function messageFromUnknownError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (err !== null && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === 'string' && m.trim() !== '') return m
  }
  try {
    return JSON.stringify(err)
  } catch {
    return 'Errore sconosciuto'
  }
}

function asError(err: unknown): Error {
  return err instanceof Error ? err : new Error(messageFromUnknownError(err))
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Restituisce la lista piatta di esercizi da inserire per un giorno, con circuit_block_id quando è un circuito. */
function getExercisesWithCircuitBlock(
  day: WorkoutDayData,
  circuitList: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
): Array<{ exercise: WorkoutDayExerciseData; circuit_block_id: string | null }> {
  const items = getDayItems(day)
  const result: Array<{ exercise: WorkoutDayExerciseData; circuit_block_id: string | null }> = []
  for (const item of items) {
    if (item.type === 'exercise') {
      result.push({ exercise: item.exercise, circuit_block_id: null })
    } else {
      const circuit = circuitList.find((c) => c.id === item.circuitId)
      const params = circuit?.params ?? []
      const blockId =
        params.length > 0
          ? UUID_REGEX.test(item.circuitId)
            ? item.circuitId
            : crypto.randomUUID()
          : null
      for (const p of params) {
        result.push({ exercise: p, circuit_block_id: blockId })
      }
    }
  }
  return result
}

function buildWorkoutDayExerciseInsertPayload(
  workoutDayId: string,
  orderIndex: number,
  exercise: WorkoutDayExerciseData,
  circuit_block_id: string | null,
): Record<string, unknown> {
  const targetSets = exercise.target_sets || exercise.sets || 3
  const targetReps = exercise.target_reps || exercise.reps_min || 10
  const executionTimeSec = exercise.execution_time_sec || null
  const restTimerSec = exercise.rest_timer_sec ?? exercise.rest_seconds ?? 60

  const insertPayload: Record<string, unknown> = {
    workout_day_id: workoutDayId,
    exercise_id: exercise.exercise_id,
    sets: targetSets,
    reps: targetReps,
    rest_seconds: restTimerSec,
    order_num: orderIndex,
    target_sets: targetSets,
    target_reps: targetReps,
    target_weight: exercise.target_weight ?? exercise.weight_kg ?? null,
    execution_time_sec: executionTimeSec,
    rest_timer_sec: restTimerSec,
    order_index: orderIndex,
    note: exercise.note ?? null,
  }
  if (circuit_block_id != null) insertPayload.circuit_block_id = circuit_block_id
  return insertPayload
}

function buildSetsRowsForExercise(
  workoutDayExerciseId: string,
  exercise: WorkoutDayExerciseData,
): Array<{
  workout_day_exercise_id: string
  set_number: number
  reps: number | null
  weight_kg: number | null
  execution_time_sec: number | null
  rest_timer_sec: number | null
}> {
  const targetSets = exercise.target_sets || exercise.sets || 3
  const rows: Array<{
    workout_day_exercise_id: string
    set_number: number
    reps: number | null
    weight_kg: number | null
    execution_time_sec: number | null
    rest_timer_sec: number | null
  }> = []
  if (targetSets <= 0) return rows
  for (let setNum = 1; setNum <= targetSets; setNum++) {
    const setDetail = exercise.sets_detail?.find((s) => s.set_number === setNum)
    rows.push({
      workout_day_exercise_id: workoutDayExerciseId,
      set_number: setNum,
      reps: setDetail?.reps ?? exercise.target_reps ?? null,
      weight_kg: setDetail?.weight_kg ?? exercise.target_weight ?? null,
      execution_time_sec: setDetail?.execution_time_sec ?? exercise.execution_time_sec ?? null,
      rest_timer_sec: setDetail?.rest_timer_sec ?? exercise.rest_timer_sec ?? null,
    })
  }
  return rows
}

const WORKOUT_PLAN_NAME_MAX_LEN = 200
const DUPLICATE_WORKOUT_NAME_SUFFIX = ' (copia)'

function duplicateWorkoutPlanName(sourceName: string): string {
  const base = sourceName.trim()
  const withSuffix = `${base}${DUPLICATE_WORKOUT_NAME_SUFFIX}`
  if (withSuffix.length <= WORKOUT_PLAN_NAME_MAX_LEN) return withSuffix
  const maxBase = WORKOUT_PLAN_NAME_MAX_LEN - DUPLICATE_WORKOUT_NAME_SUFFIX.length
  return `${base.slice(0, Math.max(0, maxBase))}${DUPLICATE_WORKOUT_NAME_SUFFIX}`
}

export type UseWorkoutPlansOptions = {
  /** Se true, non caricare la lista schede (es. pagina modifica: evita doppio fetch). */
  skipWorkoutList?: boolean
}

export function useWorkoutPlans(options?: UseWorkoutPlansOptions) {
  const skipWorkoutList = options?.skipWorkoutList === true
  const searchParams = useSearchParams()

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [athleteFilter, setAthleteFilter] = useState('')
  const [objectiveFilter, setObjectiveFilter] = useState('')
  const [loading, setLoading] = useState(!skipWorkoutList)
  const [wizardDataLoading, setWizardDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [athletes, setAthletes] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [exercisesLoadError, setExercisesLoadError] = useState<string | null>(null)

  // Carica atleti ed esercizi per il wizard
  useEffect(() => {
    async function fetchWizardData() {
      setWizardDataLoading(true)
      try {
        setExercisesLoadError(null)

        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user
        if (!user?.id) {
          setAthletes([])
          setExercises([])
          setWizardDataLoading(false)
          return
        }

        const athletesQuery = supabase
          .from('profiles')
          .select('id, nome, cognome, email')
          .in('role', ['athlete'])
          .order('nome', { ascending: true })

        const loadExercisesCatalog = async (): Promise<{
          rows: ExerciseRow[]
          loadError: string | null
        }> => {
          try {
            const rows = await apiGet<ExerciseRow[]>('/api/exercises', {}, async () => {
              const { data: exercisesData, error: exercisesError } = await supabase
                .from('exercises')
                .select('*')
                .order('name', { ascending: true })
              if (exercisesError) throw exercisesError
              return (exercisesData ?? []) as ExerciseRow[]
            })
            return { rows, loadError: null }
          } catch (exercisesErr) {
            try {
              const { data: exercisesData, error: exercisesError } = await supabase
                .from('exercises')
                .select('*')
                .order('name', { ascending: true })
              if (exercisesError) throw exercisesError
              logger.warn('Caricamento esercizi (wizard): usato Supabase diretto dopo errore API')
              return { rows: (exercisesData ?? []) as ExerciseRow[], loadError: null }
            } catch (fallbackErr) {
              logger.warn('Fallback Supabase fallito per esercizi (wizard)', undefined, {
                exercisesErr:
                  exercisesErr instanceof Error ? exercisesErr.message : String(exercisesErr),
                fallbackErr:
                  fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
              })
              const errMsg =
                exercisesErr instanceof Error
                  ? exercisesErr.message
                  : 'Impossibile caricare il catalogo esercizi. Controlla permessi e policy RLS su public.exercises.'
              return { rows: [], loadError: errMsg }
            }
          }
        }

        const [{ data: athletesData, error: athletesError }, exercisesOutcome] = await Promise.all([
          athletesQuery,
          loadExercisesCatalog(),
        ])

        if (!athletesError && athletesData) {
          const typedAthletes = (athletesData ?? []) as Pick<
            ProfileRow,
            'id' | 'nome' | 'cognome' | 'email'
          >[]

          const formattedAthletes = typedAthletes.map((athlete) => ({
            id: athlete.id,
            name: `${athlete.nome ?? ''} ${athlete.cognome ?? ''}`.trim() || 'Sconosciuto',
            email: athlete.email ?? '',
          }))
          setAthletes(formattedAthletes)
        }

        const typedExercises = exercisesOutcome.rows
        if (exercisesOutcome.loadError) {
          logger.error('Caricamento esercizi (wizard)', undefined, {
            message: exercisesOutcome.loadError,
          })
          setExercises([])
          setExercisesLoadError(exercisesOutcome.loadError)
        } else {
          const formattedExercises: Exercise[] = typedExercises.map((exercise) => ({
            id: exercise.id,
            org_id: exercise.org_id?.trim() || '',
            name: exercise.name,
            category: exercise.category || exercise.muscle_group || '',
            muscle_group: exercise.muscle_group || '',
            equipment: exercise.equipment || '',
            difficulty: difficultyDbToUi(exercise.difficulty),
            video_url: exercise.video_url || null,
            description: exercise.description || null,
            image_url: exercise.image_url || null,
            thumb_url: exercise.thumb_url || null,
            created_at: exercise.created_at ?? new Date().toISOString(),
          }))
          setExercises(formattedExercises)
        }
      } catch (error) {
        logger.error('Errore caricamento dati wizard', error)
      } finally {
        setWizardDataLoading(false)
      }
    }

    void fetchWizardData()
  }, [])

  // Carica le schede dal database
  useEffect(() => {
    if (skipWorkoutList) {
      setLoading(false)
      return
    }
    async function fetchWorkouts() {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user
        if (!user?.id) {
          setWorkouts([])
          return
        }

        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('id, org_id')
          .eq('user_id', user.id)
          .single()
        type ProfileWithOrg = Pick<ProfileRow, 'id'> & { org_id?: string | null }
        const typedProfile = currentProfile as ProfileWithOrg | null
        const profileId = typedProfile?.id
        const staffOrgId = typedProfile?.org_id?.trim() || ''
        if (!profileId) {
          setWorkouts([])
          return
        }

        // select('*') evita errore se la colonna is_draft non è ancora migrata (PostgREST rifiuta colonne inesistenti in elenco esplicito)
        const { data: workoutsData, error: fetchError } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('created_by_profile_id', profileId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        const workoutRows = (workoutsData ?? []) as WorkoutRowSelected[]
        const athleteIds = [
          ...new Set(
            workoutRows
              .map((workout) => workout.athlete_id)
              .filter((id): id is string => id != null && id.length > 0),
          ),
        ]
        const staffProfileIds = [
          ...new Set(
            workoutRows
              .map((workout) => workout.created_by_profile_id)
              .filter((id): id is string => Boolean(id)),
          ),
        ]

        let athleteSelection: Pick<ProfileRow, 'id' | 'nome' | 'cognome'>[] = []
        if (athleteIds.length > 0) {
          try {
            const merged: Pick<ProfileRow, 'id' | 'nome' | 'cognome'>[] = []
            for (const idChunk of chunkForSupabaseIn(athleteIds)) {
              const { data } = await supabase
                .from('profiles')
                .select('id, nome, cognome')
                .in('id', idChunk)
              merged.push(...((data ?? []) as Pick<ProfileRow, 'id' | 'nome' | 'cognome'>[]))
            }
            athleteSelection = merged
          } catch (selectionErr) {
            logger.warn(
              'Timeout/errore caricamento profili atleti nella lista schede',
              selectionErr,
            )
            athleteSelection = []
          }
        }

        let staffSelection: Pick<ProfileRow, 'id' | 'nome' | 'cognome'>[] = []
        if (staffProfileIds.length > 0) {
          try {
            const merged: Pick<ProfileRow, 'id' | 'nome' | 'cognome'>[] = []
            for (const idChunk of chunkForSupabaseIn(staffProfileIds)) {
              const { data } = await supabase
                .from('profiles')
                .select('id, nome, cognome')
                .in('id', idChunk)
              merged.push(...((data ?? []) as Pick<ProfileRow, 'id' | 'nome' | 'cognome'>[]))
            }
            staffSelection = merged
          } catch (selectionErr) {
            logger.warn('Timeout/errore caricamento profili staff nella lista schede', selectionErr)
            staffSelection = []
          }
        }

        const athletesMap = new Map(athleteSelection.map((athlete) => [athlete.id, athlete]))
        const staffMap = new Map(staffSelection.map((staff) => [staff.id, staff]))

        const planIdsForDays = workoutRows.map((w) => w.id).filter((id): id is string => Boolean(id))
        const daysPreviewByPlan = new Map<string, WorkoutDaySessionsPreview[]>()
        if (planIdsForDays.length > 0) {
          type DayRow = {
            id: string
            workout_plan_id: string | null
            day_number: number | null
            title: string | null
            sessions_until_refresh: number | null
          }
          const daysMerged: DayRow[] = []
          let daysBatchErr: { message: string } | null = null
          for (const planChunk of chunkForSupabaseIn(planIdsForDays)) {
            const { data: daysBatch, error: chunkErr } = await supabase
              .from('workout_days')
              .select('id, workout_plan_id, day_number, title, sessions_until_refresh')
              .in('workout_plan_id', planChunk)
              .order('day_number', { ascending: true })
            if (chunkErr) {
              daysBatchErr = chunkErr
              break
            }
            daysMerged.push(...((daysBatch ?? []) as DayRow[]))
          }
          if (daysBatchErr) {
            logger.warn('Anteprima sessioni per giorno (lista schede) non caricata', undefined, {
              message: daysBatchErr.message,
            })
          } else {
            const daysBatch = daysMerged
            const dayIdToPlanId = new Map<string, string>()
            const allDayIds: string[] = []
            for (const row of daysBatch ?? []) {
              const pid = row.workout_plan_id as string | null
              const did = typeof row.id === 'string' ? row.id : ''
              if (pid && did) {
                dayIdToPlanId.set(did, pid)
                allDayIds.push(did)
              }
            }

            const planIdToAthleteId = new Map<string, string>()
            for (const w of workoutRows) {
              const pid = w.id
              const aid = w.athlete_id
              if (pid && aid && aid.trim() !== '') planIdToAthleteId.set(pid, aid.trim())
            }

            const completedByDayId = new Map<string, number>()
            if (allDayIds.length > 0) {
              type WorkoutLogFetchRow = {
                workout_day_id?: string | null
                stato?: string | null
                atleta_id?: string | null
                athlete_id?: string | null
                completato?: boolean | null
              }
              const logsMerged: WorkoutLogFetchRow[] = []
              let logsErr: { message: string } | null = null
              for (const dayChunk of chunkForSupabaseIn(allDayIds)) {
                const { data: logsRows, error: chunkLogErr } = await supabase
                  .from('workout_logs')
                  .select('workout_day_id, stato, atleta_id, athlete_id, completato')
                  .in('workout_day_id', dayChunk)
                if (chunkLogErr) {
                  logsErr = chunkLogErr
                  break
                }
                logsMerged.push(...((logsRows ?? []) as WorkoutLogFetchRow[]))
              }

              if (logsErr) {
                logger.warn('Conteggio sessioni completate (lista schede) non caricato', undefined, {
                  message: logsErr.message,
                })
              } else {
                for (const log of logsMerged) {
                  const dayId = log.workout_day_id as string | null
                  if (!dayId || !dayIdToPlanId.has(dayId)) continue
                  if (!isWorkoutLogRowCompleted(log)) continue
                  const planId = dayIdToPlanId.get(dayId)
                  if (!planId) continue
                  const planAthleteId = planIdToAthleteId.get(planId)
                  if (!planAthleteId) continue
                  const logAthleteId = (log.atleta_id as string) || (log.athlete_id as string | null)
                  if (!logAthleteId || logAthleteId !== planAthleteId) continue
                  completedByDayId.set(dayId, (completedByDayId.get(dayId) ?? 0) + 1)
                }
              }
            }

            for (const row of daysBatch ?? []) {
              const pid = row.workout_plan_id as string | null
              if (!pid) continue
              const sur = row.sessions_until_refresh
              const did = typeof row.id === 'string' ? row.id : ''
              const entry: WorkoutDaySessionsPreview = {
                workout_day_id: did || undefined,
                day_number: typeof row.day_number === 'number' ? row.day_number : 0,
                title: row.title ?? null,
                sessions_until_refresh:
                  typeof sur === 'number' && Number.isFinite(sur) && sur >= 1 ? sur : null,
                sessions_completed_count: did ? (completedByDayId.get(did) ?? 0) : 0,
              }
              const list = daysPreviewByPlan.get(pid) ?? []
              list.push(entry)
              daysPreviewByPlan.set(pid, list)
            }
          }
        }

        const transformedData: Workout[] = workoutRows.map((workout) => {
          const aid = workout.athlete_id
          const athlete = aid ? athletesMap.get(aid) : undefined
          const staff = workout.created_by_profile_id
            ? staffMap.get(workout.created_by_profile_id)
            : null

          const workoutObjective =
            'objective' in workout ? (workout as { objective?: string | null }).objective : null

          return {
            id: workout.id,
            org_id: staffOrgId,
            athlete_id: aid ?? '',
            name: workout.name,
            description: workout.description,
            objective: workoutObjective || null,
            status: mapWorkoutPlanStatus(workout),
            difficulty: difficultyDbToUi(workout.difficulty ?? null),
            created_at: workout.created_at ?? new Date().toISOString(),
            updated_at: workout.updated_at ?? workout.created_at ?? new Date().toISOString(),
            created_by_staff_id: workout.created_by_profile_id ?? undefined,
            athlete_name: aid
              ? athlete
                ? `${athlete.nome || ''} ${athlete.cognome || ''}`.trim()
                : 'Sconosciuto'
              : 'Nessun atleta',
            staff_name: staff ? `${staff.nome || ''} ${staff.cognome || ''}`.trim() : 'Sconosciuto',
            workout_days_sessions_preview: daysPreviewByPlan.get(workout.id) ?? [],
          }
        })

        setWorkouts(assignCreationOrderNumbers(transformedData))
      } catch (error) {
        if (isSupabaseAuthLockStealAbortError(error)) {
          logger.warn('Caricamento schede abortito per lock Supabase (transiente)', undefined, {
            message: error instanceof Error ? error.message : String(error),
          })
          setError(null)
          return
        }
        logger.error('Errore caricamento schede', error)
        setError(error instanceof Error ? error.message : 'Errore nel caricamento delle schede')
      } finally {
        setLoading(false)
      }
    }

    void fetchWorkouts()
  }, [skipWorkoutList])

  // Inizializza il filtro da query params
  useEffect(() => {
    const athleteId = searchParams.get('athlete_id')
    const athleteName = searchParams.get('athlete')

    if (athleteId) {
      const filtered = workouts.filter((w) => w.athlete_id === athleteId)
      setFilteredWorkouts(filtered)
      setSearchTerm('')
      setStatusFilter('')
    } else if (athleteName) {
      setSearchTerm(athleteName)
    }
  }, [searchParams, workouts])

  // Filtra le schede
  useEffect(() => {
    const athleteId = searchParams.get('athlete_id')

    if (athleteId) return

    let filtered = workouts

    if (searchTerm) {
      filtered = filtered.filter(
        (workout) =>
          workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workout.athlete_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workout.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((workout) => workout.status === statusFilter)
    }

    if (athleteFilter) {
      filtered = filtered.filter((workout) => workout.athlete_id === athleteFilter)
    }

    if (objectiveFilter) {
      filtered = filtered.filter((workout) => workout.objective === objectiveFilter)
    }

    setFilteredWorkouts(filtered)
  }, [workouts, searchTerm, statusFilter, athleteFilter, objectiveFilter, searchParams])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'attivo':
      case 'active':
        return 'success'
      case 'bozza':
      case 'draft':
        return 'warning'
      case 'completato':
      case 'completed':
        return 'info'
      case 'archiviato':
      case 'archived':
        return 'default'
      case 'expired':
        return 'error'
      default:
        return 'default'
    }
  }, [])

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'attivo':
      case 'active':
        return 'Attiva'
      case 'bozza':
      case 'draft':
        return 'Bozza'
      case 'completato':
      case 'completed':
        return 'Completata'
      case 'archiviato':
      case 'archived':
        return 'Archiviata'
      case 'expired':
        return 'Scaduta'
      default:
        return status || 'Sconosciuto'
    }
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }, [])

  const handleCreateWorkout = useCallback(
    async (
      workoutData: WorkoutWizardData,
      circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
      options?: { draft?: boolean },
    ) => {
      try {
        const isDraft = options?.draft === true
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user
        if (!user?.id) {
          throw new Error('Utente non autenticato')
        }

        const dbAthleteId = isWorkoutPlanRealAthleteId(workoutData.athlete_id)
          ? workoutData.athlete_id!.trim()
          : null

        if (!isDraft && !dbAthleteId) {
          throw new Error('Seleziona un atleta per creare la scheda')
        }

        if (!isDraft && !workoutData.objective) {
          throw new Error('Seleziona un obiettivo per la scheda')
        }

        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('id, org_id')
          .eq('user_id', user.id)
          .single()

        type ProfileIdOrgRow = Pick<ProfileRow, 'id'> & { org_id?: string | null }
        const typedCurrentProfile = currentProfile as ProfileIdOrgRow | null

        if (!typedCurrentProfile?.id) {
          throw new Error('Profilo staff non trovato')
        }

        const staffOrgIdCreate = typedCurrentProfile.org_id?.trim() || ''

        const planName = workoutData.title.trim() || (isDraft ? 'Bozza' : workoutData.title)

        const insertData: Record<string, unknown> = {
          athlete_id: dbAthleteId,
          name: planName,
          description: workoutData.notes || null,
          is_active: !isDraft,
          is_draft: isDraft,
          created_by_profile_id: typedCurrentProfile.id,
          trainer_id: typedCurrentProfile.id,
          difficulty: workoutData.difficulty,
        }

        if (workoutData.objective) {
          insertData.objective = workoutData.objective
        } else {
          insertData.objective = null
        }

        const { data: newWorkoutData, error: createError } =
          await // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from('workout_plans') as any)
            .insert(insertData as WorkoutInsert)
            .select('*')
            .single()

        const newWorkout = newWorkoutData as
          | (WorkoutRow & { created_by_profile_id?: string | null })
          | null

        if (createError || !newWorkout) {
          const errMsg = createError?.message ?? 'Creazione scheda fallita'
          logger.error('Error creating workout', createError ?? undefined, {
            code: (createError as { code?: string } | null)?.code,
            details: (createError as { details?: string } | null)?.details,
          })
          throw new Error(errMsg)
        }

        const dayInsertsCreate = workoutData.days.map((day, dayIndex) => {
          const sur = day.sessions_until_refresh
          const sessionsUntilRefresh =
            typeof sur === 'number' && Number.isFinite(sur) && sur >= 1
              ? Math.min(Math.floor(sur), 999)
              : null
          return {
            workout_plan_id: newWorkout.id,
            day_number: dayIndex + 1,
            order_num: dayIndex + 1,
            title: day.title || day.name || `Giorno ${dayIndex + 1}`,
            day_name: day.name || day.title || `Giorno ${dayIndex + 1}`,
            sessions_until_refresh: sessionsUntilRefresh,
          }
        })

        type WorkoutDayIdRow = Pick<Tables<'workout_days'>, 'id'>
        const newDayRowsCreate: WorkoutDayIdRow[] = []
        // Nota atomicità: giorni/esercizi/set sono persistiti a chunk separati; errore a metà può lasciare scheda parziale (no transazione client).
        if (dayInsertsCreate.length > 0) {
          for (const dayChunk of chunkForSupabaseIn(dayInsertsCreate)) {
            const { data: insertedDays, error: daysErr } =
              await // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (supabase.from('workout_days') as any).insert(dayChunk).select('id')
            if (daysErr) {
              const msg = daysErr.message ?? 'Inserimento giorni non valido'
              logger.error('Error batch creating workout_days', daysErr)
              throw new Error(`Errore creazione giorni: ${msg}`)
            }
            newDayRowsCreate.push(...((insertedDays ?? []) as WorkoutDayIdRow[]))
          }
          if (newDayRowsCreate.length !== dayInsertsCreate.length) {
            logger.error('Error batch creating workout_days: count mismatch', undefined, {
              expected: dayInsertsCreate.length,
              got: newDayRowsCreate.length,
            })
            throw new Error('Errore creazione giorni: conteggio righe inatteso')
          }
        }

        const exercisePayloadsAllCreate: Record<string, unknown>[] = []
        const exercisesForSetsAllCreate: WorkoutDayExerciseData[] = []
        for (let dayIndex = 0; dayIndex < workoutData.days.length; dayIndex++) {
          const day = workoutData.days[dayIndex]
          const typedNewDay = newDayRowsCreate[dayIndex]
          if (!typedNewDay) continue

          const exercisesToInsert =
            circuitList && circuitList.length > 0
              ? getExercisesWithCircuitBlock(day, circuitList)
              : (day.exercises || []).map((ex) => ({
                  exercise: ex,
                  circuit_block_id: null as string | null,
                }))

          for (let exIndex = 0; exIndex < exercisesToInsert.length; exIndex++) {
            const { exercise, circuit_block_id } = exercisesToInsert[exIndex]
            if (!exercise.exercise_id?.trim()) continue
            exercisePayloadsAllCreate.push(
              buildWorkoutDayExerciseInsertPayload(
                typedNewDay.id,
                exIndex,
                exercise,
                circuit_block_id,
              ),
            )
            exercisesForSetsAllCreate.push(exercise)
          }
        }

        if (exercisePayloadsAllCreate.length > 0) {
          type WdeIdRow = Pick<Tables<'workout_day_exercises'>, 'id'>
          const typedInserted: WdeIdRow[] = []
          for (const exChunk of chunkForSupabaseIn(exercisePayloadsAllCreate)) {
            const { data: insertedExercises, error: exBatchError } =
              await // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (supabase.from('workout_day_exercises') as any).insert(exChunk).select('id')
            if (exBatchError) {
              logger.error('Error batch creating workout_day_exercises', exBatchError)
              throw new Error(
                `Errore aggiunta esercizi: ${exBatchError.message ?? 'batch non valido'}`,
              )
            }
            typedInserted.push(...((insertedExercises ?? []) as WdeIdRow[]))
          }
          if (typedInserted.length !== exercisePayloadsAllCreate.length) {
            logger.error('Error batch creating workout_day_exercises: count mismatch', undefined, {
              expected: exercisePayloadsAllCreate.length,
              got: typedInserted.length,
            })
            throw new Error('Errore aggiunta esercizi: conteggio righe inatteso')
          }

          const allSetsToInsertCreate: Array<{
            workout_day_exercise_id: string
            set_number: number
            reps: number | null
            weight_kg: number | null
            execution_time_sec: number | null
            rest_timer_sec: number | null
          }> = []
          for (let i = 0; i < typedInserted.length; i++) {
            allSetsToInsertCreate.push(
              ...buildSetsRowsForExercise(typedInserted[i].id, exercisesForSetsAllCreate[i]),
            )
          }
          if (allSetsToInsertCreate.length > 0) {
            for (const setChunk of chunkForSupabaseIn(allSetsToInsertCreate)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: setsError } = await (supabase.from('workout_sets') as any).insert(
                setChunk,
              )
              if (setsError) {
                logger.error('Error creating workout_sets (batch)', setsError)
                throw new Error(`Errore aggiunta set: ${setsError.message}`)
              }
            }
          }
        }

        if (newWorkout) {
          const athleteIdForProfile = newWorkout.athlete_id
          const { data: athleteProfile } = athleteIdForProfile
            ? await supabase
                .from('profiles')
                .select('id, nome, cognome')
                .eq('id', athleteIdForProfile)
                .single()
            : { data: null }

          type AthleteProfileRow = Pick<ProfileRow, 'id' | 'nome' | 'cognome'>
          const typedAthleteProfile = athleteProfile as AthleteProfileRow | null

          const { data: staffProfile } = newWorkout.created_by_profile_id
            ? await supabase
                .from('profiles')
                .select('id, nome, cognome')
                .eq('id', newWorkout.created_by_profile_id)
                .single()
            : { data: null }

          type StaffProfileRow = Pick<ProfileRow, 'id' | 'nome' | 'cognome'>
          const typedStaffProfile = staffProfile as StaffProfileRow | null

          const nw = newWorkout as WorkoutRow & { difficulty?: string | null }
          const transformedWorkout: Workout = {
            id: newWorkout.id,
            org_id: staffOrgIdCreate,
            athlete_id: newWorkout.athlete_id ?? '',
            name: newWorkout.name,
            description: newWorkout.description,
            objective:
              'objective' in newWorkout
                ? ((newWorkout as { objective?: string | null }).objective ?? null)
                : null,
            status: mapWorkoutPlanStatus(
              newWorkout as { is_active?: boolean | null; is_draft?: boolean | null },
            ),
            difficulty: difficultyDbToUi(nw.difficulty ?? null),
            created_at: newWorkout.created_at ?? new Date().toISOString(),
            updated_at: newWorkout.updated_at ?? newWorkout.created_at ?? new Date().toISOString(),
            created_by_staff_id: newWorkout.created_by_profile_id ?? undefined,
            athlete_name: newWorkout.athlete_id
              ? typedAthleteProfile
                ? `${typedAthleteProfile.nome || ''} ${typedAthleteProfile.cognome || ''}`.trim() ||
                  'Sconosciuto'
                : 'Sconosciuto'
              : 'Nessun atleta',
            staff_name: typedStaffProfile
              ? `${typedStaffProfile.nome || ''} ${typedStaffProfile.cognome || ''}`.trim() ||
                'Sconosciuto'
              : 'Sconosciuto',
            workout_days_sessions_preview: buildDaysSessionsPreviewFromWizard(workoutData.days),
          }

          setWorkouts((prev) => assignCreationOrderNumbers([transformedWorkout, ...prev]))
        }

        return newWorkout.id
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : 'Errore nella creazione della scheda'
        logger.error('Error creating workout', error, {
          message: errMsg,
          name: error instanceof Error ? error.name : undefined,
        })
        setError(errMsg)
        throw error
      }
    },
    [],
  )

  const handleUpdateWorkout = useCallback(
    async (
      workoutId: string,
      workoutData: WorkoutWizardData,
      circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>,
      options?: { draft?: boolean },
    ) => {
      try {
        const isDraft = options?.draft === true
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user
        if (!user?.id) {
          throw new Error('Utente non autenticato')
        }

        const dbAthleteIdUpdate = isWorkoutPlanRealAthleteId(workoutData.athlete_id)
          ? workoutData.athlete_id!.trim()
          : null

        if (!isDraft && !dbAthleteIdUpdate) {
          throw new Error('Seleziona un atleta per aggiornare la scheda')
        }

        const { data: updaterProfile } = await supabase
          .from('profiles')
          .select('id, org_id')
          .eq('user_id', user.id)
          .single()
        type UpdaterRow = { id: string; org_id?: string | null }
        const updater = updaterProfile as UpdaterRow | null
        if (!updater?.id) {
          throw new Error('Profilo staff non trovato')
        }
        const updaterOrgId = updater.org_id?.trim() ?? ''

        // 1. Aggiorna workout_plans
        const updateData: Record<string, unknown> = {
          name: workoutData.title.trim() || (isDraft ? 'Bozza' : workoutData.title),
          description: workoutData.notes || null,
          athlete_id: dbAthleteIdUpdate,
          is_active: !isDraft,
          is_draft: isDraft,
          trainer_id: updater.id,
          difficulty: workoutData.difficulty,
        }

        // Aggiungi objective se presente
        if (workoutData.objective) {
          updateData.objective = workoutData.objective
        } else {
          updateData.objective = null
        }

        const { error: updateError } =
          await // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from('workout_plans') as any).update(updateData).eq('id', workoutId)

        if (updateError) {
          throw new Error(
            updateError.message ||
              'Aggiornamento scheda rifiutato dal database (verifica vincoli o permessi).',
          )
        }

        // 2. Elimina giorni ed esercizi esistenti
        const { data: existingDays } = await supabase
          .from('workout_days')
          .select('id')
          .eq('workout_plan_id', workoutId)

        type ExistingDayRow = Pick<Tables<'workout_days'>, 'id'>
        const typedExistingDays = (existingDays ?? []) as ExistingDayRow[]

        if (typedExistingDays && typedExistingDays.length > 0) {
          const dayIds = typedExistingDays.map((d) => d.id)
          for (const dayChunk of chunkForSupabaseIn(dayIds)) {
            await supabase.from('workout_day_exercises').delete().in('workout_day_id', dayChunk)
          }
          await supabase.from('workout_days').delete().eq('workout_plan_id', workoutId)
        }

        const dayInsertsUpdate = workoutData.days.map((day, dayIndex) => {
          const sur = day.sessions_until_refresh
          const sessionsUntilRefresh =
            typeof sur === 'number' && Number.isFinite(sur) && sur >= 1
              ? Math.min(Math.floor(sur), 999)
              : null
          return {
            workout_plan_id: workoutId,
            day_number: dayIndex + 1,
            order_num: dayIndex + 1,
            title: day.title || day.name || `Giorno ${dayIndex + 1}`,
            day_name: day.name || day.title || `Giorno ${dayIndex + 1}`,
            sessions_until_refresh: sessionsUntilRefresh,
          }
        })

        type WorkoutDayIdRowUp = Pick<Tables<'workout_days'>, 'id'>
        const newDayRowsUpdate: WorkoutDayIdRowUp[] = []
        // Stesso rischio atomicità del create: round-trip multipli su giorni/esercizi/set.
        if (dayInsertsUpdate.length > 0) {
          for (const dayChunk of chunkForSupabaseIn(dayInsertsUpdate)) {
            const { data: insertedDaysUp, error: daysErrUp } =
              await // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (supabase.from('workout_days') as any).insert(dayChunk).select('id')
            if (daysErrUp) {
              throw new Error(`Errore creazione giorni: ${daysErrUp.message ?? 'batch non valido'}`)
            }
            newDayRowsUpdate.push(...((insertedDaysUp ?? []) as WorkoutDayIdRowUp[]))
          }
          if (newDayRowsUpdate.length !== dayInsertsUpdate.length) {
            throw new Error('Errore creazione giorni: conteggio righe inatteso')
          }
        }

        const exercisePayloadsAllUpdate: Record<string, unknown>[] = []
        const exercisesForSetsAllUpdate: WorkoutDayExerciseData[] = []
        for (let dayIndex = 0; dayIndex < workoutData.days.length; dayIndex++) {
          const day = workoutData.days[dayIndex]
          const typedNewDayUp = newDayRowsUpdate[dayIndex]
          if (!typedNewDayUp) continue

          const exercisesToInsertUpdate =
            circuitList && circuitList.length > 0
              ? getExercisesWithCircuitBlock(day, circuitList)
              : (day.exercises || []).map((ex) => ({
                  exercise: ex,
                  circuit_block_id: null as string | null,
                }))

          for (let exIndex = 0; exIndex < exercisesToInsertUpdate.length; exIndex++) {
            const { exercise, circuit_block_id } = exercisesToInsertUpdate[exIndex]
            if (!exercise.exercise_id?.trim()) continue
            exercisePayloadsAllUpdate.push(
              buildWorkoutDayExerciseInsertPayload(
                typedNewDayUp.id,
                exIndex,
                exercise,
                circuit_block_id,
              ),
            )
            exercisesForSetsAllUpdate.push(exercise)
          }
        }

        if (exercisePayloadsAllUpdate.length > 0) {
          type WdeIdRowUp = Pick<Tables<'workout_day_exercises'>, 'id'>
          const typedInsertedUpdate: WdeIdRowUp[] = []
          for (const exChunk of chunkForSupabaseIn(exercisePayloadsAllUpdate)) {
            const { data: insertedExercisesUpdate, error: exBatchErrorUpdate } =
              await // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (supabase.from('workout_day_exercises') as any).insert(exChunk).select('id')
            if (exBatchErrorUpdate) {
              throw new Error(
                `Errore aggiunta esercizi: ${exBatchErrorUpdate.message ?? 'batch non valido'}`,
              )
            }
            typedInsertedUpdate.push(...((insertedExercisesUpdate ?? []) as WdeIdRowUp[]))
          }
          if (typedInsertedUpdate.length !== exercisePayloadsAllUpdate.length) {
            throw new Error('Errore aggiunta esercizi: conteggio righe inatteso')
          }

          const allSetsToInsertUpdate: Array<{
            workout_day_exercise_id: string
            set_number: number
            reps: number | null
            weight_kg: number | null
            execution_time_sec: number | null
            rest_timer_sec: number | null
          }> = []
          for (let i = 0; i < typedInsertedUpdate.length; i++) {
            allSetsToInsertUpdate.push(
              ...buildSetsRowsForExercise(typedInsertedUpdate[i].id, exercisesForSetsAllUpdate[i]),
            )
          }
          if (allSetsToInsertUpdate.length > 0) {
            for (const setChunk of chunkForSupabaseIn(allSetsToInsertUpdate)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: setsError } = await (supabase.from('workout_sets') as any).insert(
                setChunk,
              )
              if (setsError) {
                throw new Error(`Errore aggiunta set: ${setsError.message}`)
              }
            }
          }
        }

        // 4. Aggiorna la lista locale
        const { data: updatedWorkout } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('id', workoutId)
          .single()

        const typedUpdatedWorkout = updatedWorkout as WorkoutRowSelected | null

        if (typedUpdatedWorkout) {
          const updAid = typedUpdatedWorkout.athlete_id
          const { data: athleteProfile } = updAid
            ? await supabase.from('profiles').select('id, nome, cognome').eq('id', updAid).single()
            : { data: null }

          type AthleteProfileRow = Pick<ProfileRow, 'id' | 'nome' | 'cognome'>
          const typedAthleteProfile = athleteProfile as AthleteProfileRow | null

          const { data: staffProfile } = typedUpdatedWorkout.created_by_profile_id
            ? await supabase
                .from('profiles')
                .select('id, nome, cognome')
                .eq('id', typedUpdatedWorkout.created_by_profile_id)
                .single()
            : { data: null }

          type StaffProfileRow = Pick<ProfileRow, 'id' | 'nome' | 'cognome'>
          const typedStaffProfile = staffProfile as StaffProfileRow | null

          const workoutObjective =
            'objective' in typedUpdatedWorkout
              ? (typedUpdatedWorkout as { objective?: string | null }).objective
              : null

          const transformedWorkout: Workout = {
            id: typedUpdatedWorkout.id,
            org_id: updaterOrgId,
            athlete_id: typedUpdatedWorkout.athlete_id ?? '',
            name: typedUpdatedWorkout.name,
            description: typedUpdatedWorkout.description,
            objective: workoutObjective || null,
            status: mapWorkoutPlanStatus(
              typedUpdatedWorkout as { is_active?: boolean | null; is_draft?: boolean | null },
            ),
            difficulty: difficultyDbToUi(typedUpdatedWorkout.difficulty ?? null),
            created_at: typedUpdatedWorkout.created_at ?? new Date().toISOString(),
            updated_at:
              typedUpdatedWorkout.updated_at ??
              typedUpdatedWorkout.created_at ??
              new Date().toISOString(),
            created_by_staff_id: typedUpdatedWorkout.created_by_profile_id ?? undefined,
            athlete_name: updAid
              ? typedAthleteProfile
                ? `${typedAthleteProfile.nome || ''} ${typedAthleteProfile.cognome || ''}`.trim() ||
                  'Sconosciuto'
                : 'Sconosciuto'
              : 'Nessun atleta',
            staff_name: typedStaffProfile
              ? `${typedStaffProfile.nome || ''} ${typedStaffProfile.cognome || ''}`.trim() ||
                'Sconosciuto'
              : 'Sconosciuto',
            workout_days_sessions_preview: buildDaysSessionsPreviewFromWizard(workoutData.days),
          }

          setWorkouts((prev) =>
            assignCreationOrderNumbers(prev.map((w) => (w.id === workoutId ? transformedWorkout : w))),
          )
        }
      } catch (error) {
        const err = asError(error)
        logger.error('Error updating workout', error, { workoutId, message: err.message })
        setError(err.message)
        throw err
      }
    },
    [],
  )

  const handleDuplicateWorkout = useCallback(async (workoutId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user
      if (!user?.id) {
        throw new Error('Utente non autenticato')
      }

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id, org_id')
        .eq('user_id', user.id)
        .single()

      type ProfileIdOrgDup = Pick<ProfileRow, 'id'> & { org_id?: string | null }
      const typedCurrentProfile = currentProfile as ProfileIdOrgDup | null
      if (!typedCurrentProfile?.id) {
        throw new Error('Profilo staff non trovato')
      }
      const dupOrgId = typedCurrentProfile.org_id?.trim() ?? ''

      const { data: sourcePlanData, error: sourceErr } =
        await // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from('workout_plans') as any).select('*').eq('id', workoutId).single()

      const sourcePlan = sourcePlanData as WorkoutRowSelected | null
      if (sourceErr || !sourcePlan) {
        throw new Error(sourceErr?.message ?? 'Scheda da duplicare non trovata')
      }

      if (sourcePlan.created_by_profile_id !== typedCurrentProfile.id) {
        throw new Error('Non puoi duplicare questa scheda')
      }

      const sourceObjective =
        'objective' in sourcePlan ? (sourcePlan as { objective?: string | null }).objective : null

      const insertPlan: Record<string, unknown> = {
        athlete_id: null,
        name: duplicateWorkoutPlanName(sourcePlan.name),
        description: sourcePlan.description,
        is_active: false,
        is_draft: true,
        created_by_profile_id: typedCurrentProfile.id,
        trainer_id: typedCurrentProfile.id,
        difficulty: sourcePlan.difficulty ?? null,
        objective: sourceObjective ?? null,
      }

      const { data: newPlanData, error: createPlanErr } =
        await // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from('workout_plans') as any)
          .insert(insertPlan as WorkoutInsert)
          .select('*')
          .single()

      const newPlan = newPlanData as (WorkoutRow & { created_by_profile_id?: string | null }) | null

      if (createPlanErr || !newPlan?.id) {
        throw new Error(createPlanErr?.message ?? 'Duplicazione scheda fallita')
      }

      const { data: sourceDaysData, error: daysErr } = await supabase
        .from('workout_days')
        .select('id, day_number, order_num, title, day_name, description, sessions_until_refresh')
        .eq('workout_plan_id', workoutId)
        .order('day_number', { ascending: true })

      if (daysErr) {
        throw new Error(daysErr.message)
      }

      type SourceDayRow = {
        id: string
        day_number: number
        order_num: number
        title: string | null
        day_name: string
        description: string | null
        sessions_until_refresh?: number | null
      }
      const sourceDays = (sourceDaysData ?? []) as SourceDayRow[]
      const oldDayIdToNewDayId = new Map<string, string>()

      for (const d of sourceDays) {
        const { data: newDayRow, error: newDayErr } =
          await // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from('workout_days') as any)
            .insert({
              workout_plan_id: newPlan.id,
              day_number: d.day_number,
              order_num: d.order_num,
              title: d.title,
              day_name: d.day_name,
              description: d.description ?? null,
              sessions_until_refresh:
                typeof d.sessions_until_refresh === 'number' &&
                Number.isFinite(d.sessions_until_refresh) &&
                d.sessions_until_refresh >= 1
                  ? Math.min(Math.floor(d.sessions_until_refresh), 999)
                  : null,
            })
            .select('id')
            .single()

        type WorkoutDayIdRow = Pick<Tables<'workout_days'>, 'id'>
        const typedNewDay = newDayRow as WorkoutDayIdRow | null
        if (newDayErr || !typedNewDay) {
          throw new Error(newDayErr?.message ?? 'Errore duplicazione giorno')
        }
        oldDayIdToNewDayId.set(d.id, typedNewDay.id)
      }

      const oldDayIds = sourceDays.map((d) => d.id)
      if (oldDayIds.length === 0) {
        // Nessun giorno: aggiorna solo lista con piano vuoto
        const transformedEmpty: Workout = {
          id: newPlan.id,
          org_id: dupOrgId,
          athlete_id: '',
          name: newPlan.name,
          description: newPlan.description,
          objective: sourceObjective ?? null,
          status: mapWorkoutPlanStatus(
            newPlan as { is_active?: boolean | null; is_draft?: boolean | null },
          ),
          difficulty: difficultyDbToUi(
            (newPlan as { difficulty?: string | null }).difficulty ?? null,
          ),
          created_at: newPlan.created_at ?? new Date().toISOString(),
          updated_at: newPlan.updated_at ?? newPlan.created_at ?? new Date().toISOString(),
          created_by_staff_id: newPlan.created_by_profile_id ?? undefined,
          athlete_name: 'Nessun atleta',
          staff_name: 'Sconosciuto',
          workout_days_sessions_preview: [],
        }
        const { data: staffOnly } = newPlan.created_by_profile_id
          ? await supabase
              .from('profiles')
              .select('id, nome, cognome')
              .eq('id', newPlan.created_by_profile_id)
              .single()
          : { data: null }
        type StaffProfileRow = Pick<ProfileRow, 'id' | 'nome' | 'cognome'>
        const sp = staffOnly as StaffProfileRow | null
        if (sp) {
          transformedEmpty.staff_name =
            `${sp.nome || ''} ${sp.cognome || ''}`.trim() || 'Sconosciuto'
        }
        setWorkouts((prev) => assignCreationOrderNumbers([transformedEmpty, ...prev]))
        return newPlan.id
      }

      type SourceWdeRow = {
        id: string
        workout_day_id: string
        exercise_id: string
        sets: number
        reps: number
        rest_seconds: number
        order_num: number
        order_index: number | null
        target_sets: number | null
        target_reps: number | null
        target_weight: number | null
        rest_timer_sec: number | null
        note: string | null
        execution_time_sec: number | null
        circuit_block_id: string | null
      }

      const sourceExercisesMerged: SourceWdeRow[] = []
      for (const dayChunk of chunkForSupabaseIn(oldDayIds)) {
        const { data: sourceExercisesData, error: exFetchErr } = await supabase
          .from('workout_day_exercises')
          .select(
            'id, workout_day_id, exercise_id, sets, reps, rest_seconds, order_num, order_index, target_sets, target_reps, target_weight, rest_timer_sec, note, execution_time_sec, circuit_block_id',
          )
          .in('workout_day_id', dayChunk)
        if (exFetchErr) {
          throw new Error(exFetchErr.message)
        }
        sourceExercisesMerged.push(...((sourceExercisesData ?? []) as SourceWdeRow[]))
      }

      const sourceExercises = sourceExercisesMerged
      const dayNumberByOldId = new Map(sourceDays.map((d) => [d.id, d.day_number]))

      sourceExercises.sort((a, b) => {
        const da = dayNumberByOldId.get(a.workout_day_id) ?? 0
        const db = dayNumberByOldId.get(b.workout_day_id) ?? 0
        if (da !== db) return da - db
        return (a.order_index ?? a.order_num) - (b.order_index ?? b.order_num)
      })

      const circuitRemap = new Map<string, string>()
      const oldWdeIdToNewWdeId = new Map<string, string>()

      for (const row of sourceExercises) {
        const newDayId = oldDayIdToNewDayId.get(row.workout_day_id)
        if (!newDayId) continue

        let newCircuitId: string | null = null
        if (row.circuit_block_id) {
          const ck = `${row.workout_day_id}:${row.circuit_block_id}`
          if (!circuitRemap.has(ck)) {
            circuitRemap.set(ck, crypto.randomUUID())
          }
          newCircuitId = circuitRemap.get(ck) ?? null
        }

        const insertPayload: Record<string, unknown> = {
          workout_day_id: newDayId,
          exercise_id: row.exercise_id,
          sets: row.sets,
          reps: row.reps,
          rest_seconds: row.rest_seconds,
          order_num: row.order_num,
          target_sets: row.target_sets ?? row.sets,
          target_reps: row.target_reps ?? row.reps,
          target_weight: row.target_weight,
          execution_time_sec: row.execution_time_sec,
          rest_timer_sec: row.rest_timer_sec ?? row.rest_seconds,
          order_index: row.order_index ?? row.order_num,
          note: row.note ?? null,
        }
        if (newCircuitId != null) insertPayload.circuit_block_id = newCircuitId

        const { data: newExRow, error: insExErr } =
          await // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from('workout_day_exercises') as any)
            .insert(insertPayload)
            .select('id')
            .single()

        type WdeIdRow = Pick<Tables<'workout_day_exercises'>, 'id'>
        const typedNewEx = newExRow as WdeIdRow | null
        if (insExErr || !typedNewEx) {
          throw new Error(insExErr?.message ?? 'Errore duplicazione esercizio')
        }
        oldWdeIdToNewWdeId.set(row.id, typedNewEx.id)
      }

      const oldWdeIds = [...oldWdeIdToNewWdeId.keys()]
      if (oldWdeIds.length > 0) {
        type SetRow = {
          workout_day_exercise_id: string
          set_number: number
          reps: number | null
          weight_kg: number | null
          execution_time_sec: number | null
          rest_timer_sec: number | null
        }

        const setsRowsMerged: SetRow[] = []
        for (const wdeChunk of chunkForSupabaseIn(oldWdeIds)) {
          const { data: setsData, error: setsFetchErr } = await supabase
            .from('workout_sets')
            .select(
              'workout_day_exercise_id, set_number, reps, weight_kg, execution_time_sec, rest_timer_sec',
            )
            .in('workout_day_exercise_id', wdeChunk)
            .order('set_number', { ascending: true })
          if (setsFetchErr) {
            throw new Error(setsFetchErr.message)
          }
          setsRowsMerged.push(...((setsData ?? []) as SetRow[]))
        }
        setsRowsMerged.sort((a, b) => {
          const c = a.workout_day_exercise_id.localeCompare(b.workout_day_exercise_id)
          if (c !== 0) return c
          return a.set_number - b.set_number
        })
        const setsRows = setsRowsMerged
        const setsToInsert: Array<{
          workout_day_exercise_id: string
          set_number: number
          reps: number | null
          weight_kg: number | null
          execution_time_sec: number | null
          rest_timer_sec: number | null
        }> = []

        for (const s of setsRows) {
          const newWdeId = oldWdeIdToNewWdeId.get(s.workout_day_exercise_id)
          if (!newWdeId) continue
          setsToInsert.push({
            workout_day_exercise_id: newWdeId,
            set_number: s.set_number,
            reps: s.reps,
            weight_kg: s.weight_kg,
            execution_time_sec: s.execution_time_sec,
            rest_timer_sec: s.rest_timer_sec,
          })
        }

        if (setsToInsert.length > 0) {
          for (const setChunk of chunkForSupabaseIn(setsToInsert)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: setsInsErr } = await (supabase.from('workout_sets') as any).insert(
              setChunk,
            )
            if (setsInsErr) {
              throw new Error(setsInsErr.message)
            }
          }
        }
      }

      const { data: staffProfile } = newPlan.created_by_profile_id
        ? await supabase
            .from('profiles')
            .select('id, nome, cognome')
            .eq('id', newPlan.created_by_profile_id)
            .single()
        : { data: null }

      type StaffProfileRow2 = Pick<ProfileRow, 'id' | 'nome' | 'cognome'>
      const typedStaffProfile = staffProfile as StaffProfileRow2 | null

      const transformedWorkout: Workout = {
        id: newPlan.id,
        org_id: dupOrgId,
        athlete_id: '',
        name: newPlan.name,
        description: newPlan.description,
        objective: sourceObjective ?? null,
        status: mapWorkoutPlanStatus(
          newPlan as { is_active?: boolean | null; is_draft?: boolean | null },
        ),
        difficulty: difficultyDbToUi(
          (newPlan as { difficulty?: string | null }).difficulty ?? null,
        ),
        created_at: newPlan.created_at ?? new Date().toISOString(),
        updated_at: newPlan.updated_at ?? newPlan.created_at ?? new Date().toISOString(),
        created_by_staff_id: newPlan.created_by_profile_id ?? undefined,
        athlete_name: 'Nessun atleta',
        staff_name: typedStaffProfile
          ? `${typedStaffProfile.nome || ''} ${typedStaffProfile.cognome || ''}`.trim() ||
            'Sconosciuto'
          : 'Sconosciuto',
        workout_days_sessions_preview: buildDaysSessionsPreviewFromDuplicateSource(sourceDays),
      }

      setWorkouts((prev) => assignCreationOrderNumbers([transformedWorkout, ...prev]))
      return newPlan.id
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : 'Errore nella duplicazione della scheda'
      logger.error('Error duplicating workout', error, { workoutId })
      setError(errMsg)
      throw error
    }
  }, [])

  const handleDeleteWorkout = useCallback(async (workoutId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', workoutId)

      if (deleteError) {
        throw deleteError
      }

      // Rimuovi la scheda dalla lista locale
      setWorkouts((prev) => assignCreationOrderNumbers(prev.filter((workout) => workout.id !== workoutId)))
    } catch (error) {
      logger.error('Errore eliminazione scheda', error, { workoutId })
      setError(error instanceof Error ? error.message : "Errore nell'eliminazione della scheda")
      throw error
    }
  }, [])

  return {
    workouts: filteredWorkouts,
    loading,
    wizardDataLoading,
    error,
    exercisesLoadError,
    athletes,
    exercises,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    athleteFilter,
    setAthleteFilter,
    objectiveFilter,
    setObjectiveFilter,
    handleCreateWorkout,
    handleUpdateWorkout,
    handleDuplicateWorkout,
    handleDeleteWorkout,
    getStatusColor,
    getStatusText,
    formatDate,
  }
}
