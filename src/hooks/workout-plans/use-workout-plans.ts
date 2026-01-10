// ============================================================
// Hook per gestione workout plans (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import type { Workout, WorkoutWizardData, Exercise } from '@/types/workout'
import type { Tables, TablesInsert } from '@/types/supabase'

const logger = createLogger('hooks:workout-plans:use-workout-plans')

type ProfileRow = Tables<'profiles'>
type ExerciseRow = Tables<'exercises'>
type WorkoutRow = Tables<'workout_plans'>
type WorkoutInsert = TablesInsert<'workout_plans'>
type WorkoutRowSelected = {
  id: string
  athlete_id: string
  name: string
  description: string | null
  objective?: string | null
  is_active: boolean | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

// Nota: difficultyUiToDbMap potrebbe essere usato in futuro per conversioni
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const difficultyUiToDbMap: Record<
  WorkoutWizardData['difficulty'],
  'beginner' | 'intermediate' | 'advanced'
> = {
  bassa: 'beginner',
  media: 'intermediate',
  alta: 'advanced',
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

export function useWorkoutPlans() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [athleteFilter, setAthleteFilter] = useState('')
  const [objectiveFilter, setObjectiveFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [athletes, setAthletes] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [exercises, setExercises] = useState<Exercise[]>([])

  // Carica atleti ed esercizi per il wizard
  useEffect(() => {
    async function fetchWizardData() {
      try {
        // Recupera atleti
        const { data: athletesData, error: athletesError } = await supabase
          .from('profiles')
          .select('id, nome, cognome, email')
          .in('role', ['athlete', 'atleta'])
          .order('nome', { ascending: true })

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

        // Recupera esercizi
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .order('name', { ascending: true })

        if (!exercisesError && exercisesData) {
          const typedExercises = (exercisesData ?? []) as ExerciseRow[]

          const formattedExercises: Exercise[] = typedExercises.map((exercise) => ({
            id: exercise.id,
            org_id: exercise.org_id || 'default-org',
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
      }
    }

    fetchWizardData()
  }, [supabase])

  // Carica le schede dal database
  useEffect(() => {
    async function fetchWorkouts() {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user?.id) {
          setWorkouts([])
          return
        }

        // Recupera le schede (include esplicitamente objective)
        const { data: workoutsData, error: fetchError } = await supabase
          .from('workout_plans')
          .select(
            'id, athlete_id, name, description, objective, is_active, created_by, created_at, updated_at',
          )
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Recupera i profili atleti e staff separatamente
        const workoutRows = (workoutsData ?? []) as WorkoutRowSelected[]
        const athleteIds = [
          ...new Set(
            workoutRows
              .map((workout) => workout.athlete_id)
              .filter((id): id is string => Boolean(id)),
          ),
        ]
        const staffUserIds = [
          ...new Set(
            workoutRows
              .map((workout) => workout.created_by)
              .filter((id): id is string => Boolean(id)),
          ),
        ]

        let athleteSelection: Pick<ProfileRow, 'id' | 'nome' | 'cognome'>[] = []
        if (athleteIds.length > 0) {
          const { data } = await supabase
            .from('profiles')
            .select('id, nome, cognome')
            .in('id', athleteIds)
          athleteSelection = (data ?? []) as Pick<ProfileRow, 'id' | 'nome' | 'cognome'>[]
        }

        let staffSelection: Pick<ProfileRow, 'user_id' | 'nome' | 'cognome'>[] = []
        if (staffUserIds.length > 0) {
          const { data } = await supabase
            .from('profiles')
            .select('user_id, nome, cognome')
            .in('user_id', staffUserIds)
          staffSelection = (data ?? []) as Pick<ProfileRow, 'user_id' | 'nome' | 'cognome'>[]
        }

        const athletesMap = new Map(athleteSelection.map((athlete) => [athlete.id, athlete]))
        const staffMap = new Map(staffSelection.map((staff) => [staff.user_id, staff]))

        // Trasforma i dati
        const transformedData: Workout[] = workoutRows.map((workout) => {
          const athlete = athletesMap.get(workout.athlete_id)
          const staff = workout.created_by ? staffMap.get(workout.created_by) : null

          // Estrai objective dal workout row (può essere undefined se la colonna non esiste ancora)
          const workoutObjective =
            'objective' in workout ? (workout as { objective?: string | null }).objective : null

          return {
            id: workout.id,
            org_id: 'default-org',
            athlete_id: workout.athlete_id,
            name: workout.name,
            description: workout.description,
            objective: workoutObjective || null,
            status: workout.is_active ? 'attivo' : 'completato',
            difficulty: difficultyDbToUi(null),
            created_at: workout.created_at ?? new Date().toISOString(),
            updated_at: workout.updated_at ?? workout.created_at ?? new Date().toISOString(),
            created_by_staff_id: workout.created_by ?? undefined,
            athlete_name: athlete
              ? `${athlete.nome || ''} ${athlete.cognome || ''}`.trim()
              : 'Sconosciuto',
            staff_name: staff ? `${staff.nome || ''} ${staff.cognome || ''}`.trim() : 'Sconosciuto',
          }
        })

        setWorkouts(transformedData)
      } catch (error) {
        logger.error('Errore caricamento schede', error)
        setError(error instanceof Error ? error.message : 'Errore nel caricamento delle schede')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [supabase])

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
    async (workoutData: WorkoutWizardData) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Utente non autenticato')
        }

        if (!workoutData.athlete_id) {
          throw new Error('Seleziona un atleta per creare la scheda')
        }

        if (!workoutData.objective) {
          throw new Error('Seleziona un obiettivo per la scheda')
        }

        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single()

        type ProfileUserIdRow = Pick<ProfileRow, 'user_id'>
        const typedCurrentProfile = currentProfile as ProfileUserIdRow | null

        if (!typedCurrentProfile?.user_id) {
          throw new Error('Profilo staff non trovato')
        }

        // Prepara i dati per l'insert, includendo objective
        const insertData: Record<string, unknown> = {
          athlete_id: workoutData.athlete_id,
          name: workoutData.title,
          description: workoutData.notes || null,
          is_active: true,
          created_by: typedCurrentProfile.user_id,
        }

        // Aggiungi objective se presente (anche se il tipo TypeScript non lo riconosce ancora)
        if (workoutData.objective) {
          insertData.objective = workoutData.objective
        } else {
          insertData.objective = null
        }

        const { data: newWorkoutData, error: createError } = await (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          supabase.from('workout_plans') as any)
          .insert(insertData as WorkoutInsert)
          .select(
            'id, athlete_id, name, description, objective, is_active, created_by, created_at, updated_at',
          )
          .single()

        const newWorkout = newWorkoutData as WorkoutRow | null

        if (createError || !newWorkout) {
          throw createError || new Error('Creazione scheda fallita')
        }

        // Inserisci giorni ed esercizi
        for (let dayIndex = 0; dayIndex < workoutData.days.length; dayIndex++) {
          const day = workoutData.days[dayIndex]

          const { data: newDay, error: dayError } = await (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            supabase.from('workout_days') as any)
            .insert({
              workout_plan_id: newWorkout.id,
              day_number: dayIndex + 1,
              order_num: dayIndex + 1,
              title: day.title || day.name || `Giorno ${dayIndex + 1}`,
              day_name: day.name || day.title || `Giorno ${dayIndex + 1}`,
            })
            .select('id')
            .single()

          type WorkoutDayIdRow = Pick<Tables<'workout_days'>, 'id'>
          const typedNewDay = newDay as WorkoutDayIdRow | null

          if (dayError || !typedNewDay) {
            throw new Error(`Errore creazione giorno ${dayIndex + 1}: ${dayError?.message}`)
          }

          // Inserisci esercizi per questo giorno
          for (let exIndex = 0; exIndex < day.exercises.length; exIndex++) {
            const exercise = day.exercises[exIndex]

            const targetSets = exercise.target_sets || exercise.sets || 3
            const targetReps = exercise.target_reps || exercise.reps_min || 10
            const executionTimeSec = exercise.execution_time_sec || null
            const restTimerSec = exercise.rest_timer_sec || exercise.rest_seconds || 60

            const { data: newExercise, error: exError } = await (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              supabase.from('workout_day_exercises') as any)
              .insert({
                workout_day_id: typedNewDay.id,
                exercise_id: exercise.exercise_id,
                sets: targetSets,
                reps: targetReps,
                rest_seconds: restTimerSec,
                order_num: exIndex,
                target_sets: targetSets,
                target_reps: targetReps,
                target_weight: exercise.target_weight || exercise.weight_kg || null,
                execution_time_sec: executionTimeSec,
                rest_timer_sec: restTimerSec,
                order_index: exIndex,
                note: exercise.note || null,
              })
              .select('id')
              .single()

            type WorkoutDayExerciseIdRow = Pick<Tables<'workout_day_exercises'>, 'id'>
            const typedNewExercise = newExercise as WorkoutDayExerciseIdRow | null

            if (exError || !typedNewExercise) {
              throw new Error(
                `Errore aggiunta esercizio al giorno ${dayIndex + 1}: ${exError?.message}`,
              )
            }

            // Salva i set in workout_sets
            // Inserisci tutti i set da 1 a target_sets
            const setsToInsert: Array<{
              workout_day_exercise_id: string
              set_number: number
              reps: number | null
              weight_kg: number | null
              execution_time_sec: number | null
              rest_timer_sec: number | null
            }> = []

            // Crea tutti i set da 1 a target_sets
            if (targetSets > 0) {
              for (let setNum = 1; setNum <= targetSets; setNum++) {
                // Cerca se esiste un set con questo numero in sets_detail
                const setDetail = exercise.sets_detail?.find((s) => s.set_number === setNum)

                setsToInsert.push({
                  workout_day_exercise_id: typedNewExercise.id,
                  set_number: setNum,
                  reps: setDetail?.reps ?? exercise.target_reps ?? null,
                  weight_kg: setDetail?.weight_kg ?? exercise.target_weight ?? null,
                  execution_time_sec:
                    setDetail?.execution_time_sec ?? exercise.execution_time_sec ?? null,
                  rest_timer_sec: setDetail?.rest_timer_sec ?? exercise.rest_timer_sec ?? null,
                })
              }
            }

            // Inserisci tutti i set se ce ne sono
            if (setsToInsert.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: setsError } = await (supabase.from('workout_sets') as any).insert(setsToInsert)

              if (setsError) {
                throw new Error(
                  `Errore aggiunta set per esercizio al giorno ${dayIndex + 1}: ${setsError.message}`,
                )
              }
            }
          }
        }

        if (newWorkout) {
          const { data: athleteProfile } = await supabase
            .from('profiles')
            .select('id, nome, cognome')
            .eq('id', newWorkout.athlete_id)
            .single()

          type AthleteProfileRow = Pick<ProfileRow, 'id' | 'nome' | 'cognome'>
          const typedAthleteProfile = athleteProfile as AthleteProfileRow | null

          const { data: staffProfile } = newWorkout.created_by
            ? await supabase
                .from('profiles')
                .select('user_id, nome, cognome')
                .eq('user_id', newWorkout.created_by)
                .single()
            : { data: null }

          type StaffProfileRow = Pick<ProfileRow, 'user_id' | 'nome' | 'cognome'>
          const typedStaffProfile = staffProfile as StaffProfileRow | null

          const transformedWorkout: Workout = {
            id: newWorkout.id,
            org_id: 'default-org',
            athlete_id: newWorkout.athlete_id,
            name: newWorkout.name,
            description: newWorkout.description,
            status: newWorkout.is_active ? 'attivo' : 'completato',
            difficulty: difficultyDbToUi(null),
            created_at: newWorkout.created_at ?? new Date().toISOString(),
            updated_at: newWorkout.updated_at ?? newWorkout.created_at ?? new Date().toISOString(),
            created_by_staff_id: newWorkout.created_by ?? undefined,
            athlete_name: typedAthleteProfile
              ? `${typedAthleteProfile.nome || ''} ${typedAthleteProfile.cognome || ''}`.trim() ||
                'Sconosciuto'
              : 'Sconosciuto',
            staff_name: typedStaffProfile
              ? `${typedStaffProfile.nome || ''} ${typedStaffProfile.cognome || ''}`.trim() ||
                'Sconosciuto'
              : 'Sconosciuto',
          }

          setWorkouts((prev) => [transformedWorkout, ...prev])
        }
      } catch (error) {
        logger.error('Error creating workout', error)
        setError(error instanceof Error ? error.message : 'Errore nella creazione della scheda')
        throw error
      }
    },
    [supabase],
  )

  const handleUpdateWorkout = useCallback(
    async (workoutId: string, workoutData: WorkoutWizardData) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Utente non autenticato')
        }

        if (!workoutData.athlete_id) {
          throw new Error('Seleziona un atleta per aggiornare la scheda')
        }

        // 1. Aggiorna workout_plans
        const updateData: Record<string, unknown> = {
          name: workoutData.title,
          description: workoutData.notes || null,
          athlete_id: workoutData.athlete_id,
        }

        // Aggiungi objective se presente
        if (workoutData.objective) {
          updateData.objective = workoutData.objective
        } else {
          updateData.objective = null
        }

        const { error: updateError } = await (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          supabase.from('workout_plans') as any)
          .update(updateData)
          .eq('id', workoutId)

        if (updateError) {
          throw updateError
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
          await supabase.from('workout_day_exercises').delete().in('workout_day_id', dayIds)
          await supabase.from('workout_days').delete().eq('workout_plan_id', workoutId)
        }

        // 3. Inserisci nuovi giorni ed esercizi
        for (let dayIndex = 0; dayIndex < workoutData.days.length; dayIndex++) {
          const day = workoutData.days[dayIndex]

          const { data: newDay, error: dayError } = await (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            supabase.from('workout_days') as any)
            .insert({
              workout_plan_id: workoutId,
              day_number: dayIndex + 1,
              order_num: dayIndex + 1,
              title: day.title || day.name || `Giorno ${dayIndex + 1}`,
              day_name: day.name || day.title || `Giorno ${dayIndex + 1}`,
            })
            .select('id')
            .single()

          type WorkoutDayIdRow = Pick<Tables<'workout_days'>, 'id'>
          const typedNewDay = newDay as WorkoutDayIdRow | null

          if (dayError || !typedNewDay) {
            throw new Error(`Errore creazione giorno ${dayIndex + 1}: ${dayError?.message}`)
          }

          // Inserisci esercizi per questo giorno
          for (let exIndex = 0; exIndex < day.exercises.length; exIndex++) {
            const exercise = day.exercises[exIndex]

            const targetSets = exercise.target_sets || exercise.sets || 3
            const targetReps = exercise.target_reps || exercise.reps_min || 10
            const executionTimeSec = exercise.execution_time_sec || null
            const restTimerSec = exercise.rest_timer_sec || exercise.rest_seconds || 60

            const { data: newExercise, error: exError } = await (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              supabase.from('workout_day_exercises') as any)
              .insert({
                workout_day_id: typedNewDay.id,
                exercise_id: exercise.exercise_id,
                sets: targetSets,
                reps: targetReps,
                rest_seconds: restTimerSec,
                order_num: exIndex,
                target_sets: targetSets,
                target_reps: targetReps,
                target_weight: exercise.target_weight || exercise.weight_kg || null,
                execution_time_sec: executionTimeSec,
                rest_timer_sec: restTimerSec,
                order_index: exIndex,
                note: exercise.note || null,
              })
              .select('id')
              .single()

            type WorkoutDayExerciseIdRow = Pick<Tables<'workout_day_exercises'>, 'id'>
            const typedNewExercise = newExercise as WorkoutDayExerciseIdRow | null

            if (exError || !typedNewExercise) {
              throw new Error(
                `Errore aggiunta esercizio al giorno ${dayIndex + 1}: ${exError?.message}`,
              )
            }

            // Salva i set in workout_sets
            // Inserisci tutti i set da 1 a target_sets
            const setsToInsert: Array<{
              workout_day_exercise_id: string
              set_number: number
              reps: number | null
              weight_kg: number | null
              execution_time_sec: number | null
              rest_timer_sec: number | null
            }> = []

            // Crea tutti i set da 1 a target_sets
            if (targetSets > 0) {
              for (let setNum = 1; setNum <= targetSets; setNum++) {
                // Cerca se esiste un set con questo numero in sets_detail
                const setDetail = exercise.sets_detail?.find((s) => s.set_number === setNum)

                setsToInsert.push({
                  workout_day_exercise_id: typedNewExercise.id,
                  set_number: setNum,
                  reps: setDetail?.reps ?? exercise.target_reps ?? null,
                  weight_kg: setDetail?.weight_kg ?? exercise.target_weight ?? null,
                  execution_time_sec:
                    setDetail?.execution_time_sec ?? exercise.execution_time_sec ?? null,
                  rest_timer_sec: setDetail?.rest_timer_sec ?? exercise.rest_timer_sec ?? null,
                })
              }
            }

            // Inserisci tutti i set se ce ne sono
            if (setsToInsert.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error: setsError } = await (supabase.from('workout_sets') as any).insert(setsToInsert)

              if (setsError) {
                throw new Error(
                  `Errore aggiunta set per esercizio al giorno ${dayIndex + 1}: ${setsError.message}`,
                )
              }
            }
          }
        }

        // 4. Aggiorna la lista locale
        const { data: updatedWorkout } = await supabase
          .from('workout_plans')
          .select(
            'id, athlete_id, name, description, objective, is_active, created_by, created_at, updated_at',
          )
          .eq('id', workoutId)
          .single()

        const typedUpdatedWorkout = updatedWorkout as WorkoutRowSelected | null

        if (typedUpdatedWorkout) {
          const { data: athleteProfile } = await supabase
            .from('profiles')
            .select('id, nome, cognome')
            .eq('id', typedUpdatedWorkout.athlete_id)
            .single()

          type AthleteProfileRow = Pick<ProfileRow, 'id' | 'nome' | 'cognome'>
          const typedAthleteProfile = athleteProfile as AthleteProfileRow | null

          const { data: staffProfile } = typedUpdatedWorkout.created_by
            ? await supabase
                .from('profiles')
                .select('user_id, nome, cognome')
                .eq('user_id', typedUpdatedWorkout.created_by)
                .single()
            : { data: null }

          type StaffProfileRow = Pick<ProfileRow, 'user_id' | 'nome' | 'cognome'>
          const typedStaffProfile = staffProfile as StaffProfileRow | null

          // Estrai objective dal workout row
          const workoutObjective =
            'objective' in typedUpdatedWorkout
              ? (typedUpdatedWorkout as { objective?: string | null }).objective
              : null

          const transformedWorkout: Workout = {
            id: typedUpdatedWorkout.id,
            org_id: 'default-org',
            athlete_id: typedUpdatedWorkout.athlete_id,
            name: typedUpdatedWorkout.name,
            description: typedUpdatedWorkout.description,
            objective: workoutObjective || null,
            status: typedUpdatedWorkout.is_active ? 'attivo' : 'completato',
            difficulty: difficultyDbToUi(null),
            created_at: typedUpdatedWorkout.created_at ?? new Date().toISOString(),
            updated_at:
              typedUpdatedWorkout.updated_at ??
              typedUpdatedWorkout.created_at ??
              new Date().toISOString(),
            created_by_staff_id: typedUpdatedWorkout.created_by ?? undefined,
            athlete_name: typedAthleteProfile
              ? `${typedAthleteProfile.nome || ''} ${typedAthleteProfile.cognome || ''}`.trim() ||
                'Sconosciuto'
              : 'Sconosciuto',
            staff_name: typedStaffProfile
              ? `${typedStaffProfile.nome || ''} ${typedStaffProfile.cognome || ''}`.trim() ||
                'Sconosciuto'
              : 'Sconosciuto',
          }

          setWorkouts((prev) => prev.map((w) => (w.id === workoutId ? transformedWorkout : w)))
        }
      } catch (error) {
        logger.error('Error updating workout', error, { workoutId })
        setError(error instanceof Error ? error.message : "Errore nell'aggiornamento della scheda")
        throw error
      }
    },
    [supabase],
  )

  const handleDeleteWorkout = useCallback(
    async (workoutId: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('workout_plans')
          .delete()
          .eq('id', workoutId)

        if (deleteError) {
          throw deleteError
        }

        // Rimuovi la scheda dalla lista locale
        setWorkouts((prev) => prev.filter((workout) => workout.id !== workoutId))
      } catch (error) {
        logger.error('Errore eliminazione scheda', error, { workoutId })
        setError(error instanceof Error ? error.message : "Errore nell'eliminazione della scheda")
        throw error
      }
    },
    [supabase],
  )

  return {
    workouts: filteredWorkouts,
    loading,
    error,
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
    handleDeleteWorkout,
    getStatusColor,
    getStatusText,
    formatDate,
  }
}
