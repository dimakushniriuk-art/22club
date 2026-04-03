/**
 * GET /api/athlete/workout-plans
 * Restituisce le schede allenamento (workout_plans) per l'atleta autenticato.
 * Usa il client di sessione (RLS): stesso modello degli hook atleta che leggono workout_plans dal browser.
 */
import { NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { getDifficultyFromDb } from '@/lib/workouts/workout-transformers'
import type { Workout } from '@/types/workout'
import type { Tables } from '@/types/supabase'
import { createLogger } from '@/lib/logger'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('api:athlete:workout-plans')

type ProfileRow = Tables<'profiles'>
type WorkoutPlanRow = Tables<'workout_plans'>
type WorkoutPlanWithRelations = WorkoutPlanRow & {
  athlete: Pick<ProfileRow, 'nome' | 'cognome' | 'user_id'> | null
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profileRow = await resolveProfileByIdentifier(supabase, user.id, 'id, role')

    if (!profileRow) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const role = ((profileRow as { role?: string }).role ?? '').toLowerCase()
    if (role !== 'athlete' && role !== 'atleta') {
      return NextResponse.json({ error: 'Solo atleti' }, { status: 403 })
    }

    const athleteId = profileRow.id as string

    const { data: rawData, error } = await supabase
      .from('workout_plans')
      .select(
        `*,
        athlete:profiles!workout_plans_athlete_id_fkey(nome, cognome, user_id)`,
      )
      .eq('athlete_id', athleteId)
      .order('created_at', { ascending: false })
      .returns<WorkoutPlanWithRelations[]>()

    if (error) {
      logger.error('Errore query workout_plans', error, { athleteId })
      return NextResponse.json(
        { error: error.message || 'Errore caricamento schede' },
        { status: 502 },
      )
    }

    const data = (rawData ?? []).filter((w) => !(w as { is_draft?: boolean | null }).is_draft)

    const createdByProfileIds =
      data.map((w) => w.created_by_profile_id).filter((id): id is string => !!id) || []
    const createdByProfiles: Record<string, { nome?: string | null; cognome?: string | null }> = {}

    if (createdByProfileIds.length > 0) {
      for (const idChunk of chunkForSupabaseIn(createdByProfileIds)) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nome, cognome')
          .in('id', idChunk)
        if (profilesData?.length) {
          profilesData.forEach((p: { id: string; nome?: string | null; cognome?: string | null }) => {
            createdByProfiles[p.id] = { nome: p.nome, cognome: p.cognome }
          })
        }
      }
    }

    const workouts: Workout[] =
      data?.map((workout) => {
        const athlete = workout.athlete
        const createdByProfile = workout.created_by_profile_id
          ? createdByProfiles[workout.created_by_profile_id]
          : null
        return {
          id: workout.id ?? '',
          org_id: '',
          athlete_id: workout.athlete_id ?? '',
          name: workout.name ?? '',
          description: workout.description ?? null,
          muscle_group: null,
          equipment: null,
          difficulty: getDifficultyFromDb(undefined),
          video_url: null,
          image_url: null,
          status: workout.is_active ? 'attivo' : 'completato',
          exercises: [],
          sessions: [],
          stats: undefined,
          created_at: workout.created_at ?? new Date().toISOString(),
          updated_at: workout.updated_at ?? undefined,
          created_by_staff_id: workout.created_by_profile_id ?? undefined,
          athlete_name: athlete ? `${athlete.nome ?? ''} ${athlete.cognome ?? ''}`.trim() : '',
          staff_name: createdByProfile
            ? `${createdByProfile.nome ?? ''} ${createdByProfile.cognome ?? ''}`.trim()
            : '',
        }
      }) ?? []

    return NextResponse.json({ workouts })
  } catch (err) {
    logger.error('Errore GET workout-plans', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
