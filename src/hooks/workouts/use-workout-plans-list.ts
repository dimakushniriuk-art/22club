// ============================================================
// Hook per lista workout plans (FASE C - Split File Lunghi)
// ============================================================
// Estratto da use-workouts.ts per migliorare manutenibilità
// ============================================================

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Workout } from '@/types/workout'
import type { Tables } from '@/types/supabase'
import { getDifficultyFromDb } from '@/lib/workouts/workout-transformers'
import { createLogger } from '@/lib/logger'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('hooks:workouts:use-workout-plans-list')

type ProfileRow = Tables<'profiles'>
type WorkoutPlanRow = Tables<'workout_plans'>
type WorkoutPlanWithRelations = WorkoutPlanRow & {
  athlete: Pick<ProfileRow, 'nome' | 'cognome' | 'user_id'> | null
}

export type FetchWorkoutPlansOptions = {
  /** Vista trainer su atleta assegnato: usa API staff + RLS. */
  athleteSubjectProfileId?: string | null
}

export function useWorkoutPlansList() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkouts = useCallback(
    async (userId: string, role: string | null, options?: FetchWorkoutPlansOptions) => {
      try {
        setLoading(true)
        setError(null)

        if (!userId) return

        const subjectId = options?.athleteSubjectProfileId?.trim() || null
        // Preview embed / staff su atleta: non dipendere da `role` lato client (può essere null al primo paint).
        // L’API `/api/staff/athlete-workout-plans` verifica trainer/admin e RLS sull’atleta.
        if (subjectId) {
          logger.debug('Fetch workout_plans staff per atleta (subjectId)', undefined, { subjectId })
          const res = await fetch(
            `/api/staff/athlete-workout-plans?atleta_id=${encodeURIComponent(subjectId)}`,
          )
          const json = (await res.json().catch(() => ({}))) as {
            workouts?: Workout[]
            error?: string
          }
          if (!res.ok) {
            throw new Error(json.error ?? 'Errore nel caricamento delle schede')
          }
          setWorkouts(json.workouts ?? [])
          setLoading(false)
          return
        }

        const isAthlete = role === 'athlete' || role === 'atleta'
        if (isAthlete) {
          logger.debug('Fetch workout_plans per atleta via API', undefined, { userId })
          const res = await fetch('/api/athlete/workout-plans')
          const json = (await res.json().catch(() => ({}))) as {
            workouts?: Workout[]
            error?: string
          }
          if (!res.ok) {
            throw new Error(json.error ?? 'Errore nel caricamento delle schede')
          }
          setWorkouts(json.workouts ?? [])
          setLoading(false)
          return
        }

        let query = supabase.from('workout_plans').select(`
          *,
          athlete:profiles!workout_plans_athlete_id_fkey(nome, cognome, user_id)
        `)

        if (role === 'trainer' || role === 'admin') {
          // userId = profiles.id; filtro per creatore (created_by_profile_id)
          query = query.eq('created_by_profile_id', userId)
          logger.debug('Query workout_plans per staff (created_by_profile_id)', undefined, {
            profileId: userId,
            role,
          })
        } else {
          // Ruolo non riconosciuto o non valido - non mostrare schede per sicurezza
          logger.warn('Ruolo non riconosciuto per workout_plans query', undefined, {
            userId,
            role,
          })
          setWorkouts([])
          setLoading(false)
          return
        }

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .returns<WorkoutPlanWithRelations[]>()

        if (error) {
          logger.error('Errore query workout_plans', error, {
            userId,
            role,
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.details,
            errorHint: error.hint,
          })
          throw error
        }

        logger.debug('Query workout_plans completata', {
          count: data?.length ?? 0,
          userId,
          role,
          workoutIds: data?.map((w: { id: string }) => w.id) ?? [],
          workoutNames: data?.map((w: { name: string }) => w.name) ?? [],
        })

        type WorkoutPlanRow = WorkoutPlanWithRelations & {
          org_id?: string | null
          muscle_group?: string | null
          equipment?: string | null
          difficulty?: string | null
          video_url?: string | null
          image_url?: string | null
        }

        // Profili creatori (created_by_profile_id = profiles.id)
        const createdByProfileIds =
          data
            ?.map((w: { created_by_profile_id?: string | null }) => w.created_by_profile_id)
            .filter((id: string | null | undefined): id is string => !!id) || []

        const createdByProfiles: Record<string, { nome?: string | null; cognome?: string | null }> =
          {}

        if (createdByProfileIds.length > 0) {
          type ProfileSelect = Pick<ProfileRow, 'id' | 'nome' | 'cognome'>
          const profilesAccum: ProfileSelect[] = []
          for (const idChunk of chunkForSupabaseIn(createdByProfileIds)) {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('id, nome, cognome')
              .in('id', idChunk)
              .returns<ProfileSelect[]>()
            if (profilesError) {
              logger.error('Errore query profiles per created_by_profile_id', profilesError)
              break
            }
            if (profilesData?.length) profilesAccum.push(...profilesData)
          }
          profilesAccum.forEach((profile: ProfileSelect) => {
            createdByProfiles[profile.id] = { nome: profile.nome, cognome: profile.cognome }
          })
        }

        const transformedData: Workout[] =
          data?.map((workout: WorkoutPlanRow) => {
            const typedWorkout = workout
            const athlete = typedWorkout.athlete
            const createdByProfile = workout.created_by_profile_id
              ? createdByProfiles[workout.created_by_profile_id]
              : null

            return {
              id: typedWorkout.id ?? '',
              org_id: typedWorkout.org_id ?? '',
              athlete_id: typedWorkout.athlete_id ?? '',
              name: typedWorkout.name ?? '',
              description: typedWorkout.description ?? null,
              muscle_group: typedWorkout.muscle_group ?? null,
              equipment: typedWorkout.equipment ?? null,
              difficulty: getDifficultyFromDb(typedWorkout.difficulty),
              video_url: typedWorkout.video_url ?? null,
              image_url: typedWorkout.image_url ?? null,
              status: (workout as { is_draft?: boolean | null }).is_draft
                ? 'bozza'
                : workout.is_active
                  ? 'attivo'
                  : 'completato',
              exercises: [],
              sessions: [],
              stats: undefined,
              created_at: workout.created_at ?? new Date().toISOString(),
              updated_at: workout.updated_at ?? undefined,
              created_by_staff_id: workout.created_by_profile_id ?? undefined,
              athlete_name: typedWorkout.athlete_id
                ? athlete
                  ? `${athlete.nome ?? ''} ${athlete.cognome ?? ''}`.trim()
                  : 'Sconosciuto'
                : 'Nessun atleta',
              staff_name: createdByProfile
                ? `${createdByProfile.nome ?? ''} ${createdByProfile.cognome ?? ''}`.trim()
                : '',
            }
          }) || []

        setWorkouts(transformedData)
      } catch (err) {
        logger.error('Error fetching workouts', err)
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle schede')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    workouts,
    loading,
    error,
    fetchWorkouts,
  }
}
