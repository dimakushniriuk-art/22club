// ============================================================
// Hook per lista workout plans (FASE C - Split File Lunghi)
// ============================================================
// Estratto da use-workouts.ts per migliorare manutenibilità
// ============================================================

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Workout } from '@/types/workout'
import type { Tables } from '@/types/supabase'
import { getDifficultyFromDb } from '@/lib/workouts/workout-transformers'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:workouts:use-workout-plans-list')

type ProfileRow = Tables<'profiles'>
type WorkoutPlanRow = Tables<'workout_plans'>
type WorkoutPlanWithRelations = WorkoutPlanRow & {
  athlete: Pick<ProfileRow, 'nome' | 'cognome' | 'user_id'> | null
  // created_by non può essere incluso nella relazione perché punta a profiles(user_id) non profiles(id)
}

export function useWorkoutPlansList() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchWorkouts = useCallback(
    async (userId: string, role: string | null) => {
      try {
        setLoading(true)
        setError(null)

        if (!userId) return

        // Nota: created_by punta a profiles(user_id) non profiles(id), quindi non possiamo usare la relazione automatica
        // Recuperiamo solo i dati dell'atleta, created_by verrà gestito separatamente se necessario
        let query = supabase.from('workout_plans').select(`
          *,
          athlete:profiles!workout_plans_athlete_id_fkey(nome, cognome, user_id)
        `)

        if (role === 'atleta' || role === 'athlete') {
          // Per atleti: userId è l'id del profilo (profiles.id)
          // IMPORTANTE: Filtra SOLO le schede assegnate all'atleta corrente (athlete_id = userId)
          // Questo è un filtro di sicurezza aggiuntivo anche se le RLS policies lo fanno già
          logger.debug('Query workout_plans per atleta', undefined, {
            userId,
            role,
            athlete_id: userId,
          })
          query = query.eq('athlete_id', userId)
        } else if (role === 'pt' || role === 'trainer' || role === 'admin') {
          // Per pt/admin: userId è profiles.id, ma created_by punta a profiles.user_id
          // Usiamo utility function per conversione sicura
          const { getUserIdFromProfileId } = await import('@/lib/utils/profile-id-utils')
          const user_id = await getUserIdFromProfileId(userId)

          if (user_id) {
            query = query.eq('created_by', user_id)
            logger.debug('Converted profileId to user_id for workout_plans query', undefined, {
              profileId: userId,
              user_id,
            })
          } else {
            // Se la conversione fallisce, logga errore e NON mostrare schede (non filtrare = insicuro)
            logger.error(
              'Impossibile convertire profileId a user_id per workout_plans',
              undefined,
              {
                profileId: userId,
                role,
              },
            )
            setError('Errore nel recupero del profilo per filtrare le schede')
            setWorkouts([]) // IMPORTANTE: Non mostrare schede se non possiamo filtrare correttamente
            setLoading(false)
            return
          }
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
          workoutIds: data?.map((w) => w.id) ?? [],
          workoutNames: data?.map((w) => w.name) ?? [],
        })

        type WorkoutPlanRow = WorkoutPlanWithRelations & {
          org_id?: string | null
          muscle_group?: string | null
          equipment?: string | null
          difficulty?: string | null
          video_url?: string | null
          image_url?: string | null
        }

        // Recupera i profili dei creatori separatamente se necessario
        const createdByUserIds =
          data?.map((w) => w.created_by).filter((id): id is string => !!id) || []

        const createdByProfiles: Record<string, { nome?: string | null; cognome?: string | null }> =
          {}

        if (createdByUserIds.length > 0) {
          type ProfileSelect = Pick<ProfileRow, 'user_id' | 'nome' | 'cognome'>

          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, nome, cognome')
            .in('user_id', createdByUserIds)
            .returns<ProfileSelect[]>()

          if (profilesError) {
            logger.error('Errore query profiles per created_by', profilesError)
          }

          if (profilesData && Array.isArray(profilesData)) {
            profilesData.forEach((profile: ProfileSelect) => {
              if (profile.user_id) {
                createdByProfiles[profile.user_id] = {
                  nome: profile.nome,
                  cognome: profile.cognome,
                }
              }
            })
          }
        }

        const transformedData: Workout[] =
          data?.map((workout) => {
            const typedWorkout = workout as WorkoutPlanRow
            const athlete = typedWorkout.athlete
            const createdByProfile = workout.created_by
              ? createdByProfiles[workout.created_by]
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
              status: workout.is_active ? 'attivo' : 'completato',
              exercises: [],
              sessions: [],
              stats: undefined,
              created_at: workout.created_at ?? new Date().toISOString(),
              updated_at: workout.updated_at ?? undefined,
              created_by_staff_id: workout.created_by ?? undefined,
              athlete_name: athlete ? `${athlete.nome ?? ''} ${athlete.cognome ?? ''}`.trim() : '',
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
    [supabase],
  )

  return {
    workouts,
    loading,
    error,
    fetchWorkouts,
  }
}
