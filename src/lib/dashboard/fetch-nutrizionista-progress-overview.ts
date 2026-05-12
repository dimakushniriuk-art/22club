import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'
import {
  NUTRITION_TABLES,
  nutritionFrom,
  STAFF_ASSIGNMENT_STATUS_ACTIVE,
  STAFF_TYPE_NUTRIZIONISTA,
} from '@/lib/nutrition-tables'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('lib:dashboard:fetch-nutrizionista-progress-overview')

export type NutrizionistaProgressTimelineRow = {
  progress_id: string
  athlete_id: string
  athlete_name: string | null
  athlete_email: string | null
  weight: number | null
  body_fat: number | null
  waist: number | null
  hip: number | null
  created_by_role: string | null
  source: string | null
  created_at: string | null
}

export type NutrizionistaProgressAthleteOverviewRow = {
  athlete_id: string
  athlete_name: string | null
  athlete_email: string | null
  last_progress_at: string | null
  last_weight: number | null
  last_body_fat: number | null
  last_waist: number | null
  last_hip: number | null
  days_since_last_progress: number | null
  weight_delta_7d: number | null
}

export type NutrizionistaProgressAssignedAthlete = {
  id: string
  name: string
  email: string | null
  org_id: string
  user_id: string | null
}

export type NutrizionistaProgressOverviewData = {
  timelineRows: NutrizionistaProgressTimelineRow[]
  athleteOverviewRows: NutrizionistaProgressAthleteOverviewRow[]
  assignedAthletes: NutrizionistaProgressAssignedAthlete[]
}

function buildOverviewFromTimeline(
  athleteIds: string[],
  rows: NutrizionistaProgressTimelineRow[],
  profilesMap: Map<string, { name: string; email: string | null }>,
): NutrizionistaProgressAthleteOverviewRow[] {
  const byProfileId = new Map<string, NutrizionistaProgressTimelineRow[]>()
  for (const row of rows) {
    const profileId = row.athlete_id
    if (!byProfileId.has(profileId)) byProfileId.set(profileId, [])
    byProfileId.get(profileId)!.push(row)
  }

  const now = Date.now()
  return athleteIds.map((athleteId) => {
    const list = byProfileId.get(athleteId) ?? []
    const last = list[0]
    const lastAt = last ? new Date(last.created_at ?? 0).getTime() : null
    const daysSince = lastAt != null ? (now - lastAt) / (1000 * 60 * 60 * 24) : null
    const weight7d = list.find((entry) => {
      const timestamp = new Date(entry.created_at ?? 0).getTime()
      return now - timestamp >= 7 * 24 * 60 * 60 * 1000 && entry.weight != null
    })
    const delta =
      last?.weight != null && weight7d?.weight != null ? last.weight - weight7d.weight : null
    return {
      athlete_id: athleteId,
      athlete_name: profilesMap.get(athleteId)?.name ?? null,
      athlete_email: profilesMap.get(athleteId)?.email ?? null,
      last_progress_at: last?.created_at ?? null,
      last_weight: last?.weight ?? null,
      last_body_fat: last?.body_fat ?? null,
      last_waist: last?.waist ?? null,
      last_hip: last?.hip ?? null,
      days_since_last_progress: daysSince,
      weight_delta_7d: delta,
    }
  })
}

export async function fetchNutrizionistaProgressOverview(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<NutrizionistaProgressOverviewData> {
  const { data: staffData, error: staffErr } = await supabase
    .from('staff_atleti')
    .select('atleta_id')
    .eq('staff_id', staffProfileId)
    .eq('status', STAFF_ASSIGNMENT_STATUS_ACTIVE)
    .eq('staff_type', STAFF_TYPE_NUTRIZIONISTA)
  if (staffErr) throw staffErr

  const athleteIds = (staffData ?? [])
    .map((row) => (row as { atleta_id: string }).atleta_id)
    .filter(Boolean)
  if (athleteIds.length === 0) {
    return { timelineRows: [], athleteOverviewRows: [], assignedAthletes: [] }
  }

  const profilesAccum: {
    id: string
    user_id: string | null
    nome: string | null
    cognome: string | null
    email: string | null
    org_id: string | null
  }[] = []
  for (const idChunk of chunkForSupabaseIn(athleteIds)) {
    const { data: profilesData, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, user_id, nome, cognome, email, org_id')
      .in('id', idChunk)
    if (profilesErr) {
      logger.error('Progressi nutrizionista: caricamento profili', profilesErr)
      throw profilesErr
    }
    profilesAccum.push(...((profilesData ?? []) as (typeof profilesAccum)[number][]))
  }

  const profilesMap = new Map(
    profilesAccum.map((profile) => [
      profile.id,
      {
        name: [profile.nome, profile.cognome].filter(Boolean).join(' ') || profile.id.slice(0, 8),
        email: profile.email ?? null,
        org_id: profile.org_id ?? '',
        user_id: profile.user_id ?? null,
      },
    ]),
  )
  const userIdToProfileId = new Map<string, string>()
  const athleteUserIds: string[] = []
  for (const profile of profilesAccum) {
    if (profile.user_id) {
      userIdToProfileId.set(profile.user_id, profile.id)
      athleteUserIds.push(profile.user_id)
    }
  }

  const assignedAthletes = athleteIds.map((id) => ({
    id,
    name: profilesMap.get(id)?.name ?? id.slice(0, 8),
    email: profilesMap.get(id)?.email ?? null,
    org_id: profilesMap.get(id)?.org_id ?? '',
    user_id: profilesMap.get(id)?.user_id ?? null,
  }))

  let timelineRows: NutrizionistaProgressTimelineRow[] = []
  let athleteOverviewRows: NutrizionistaProgressAthleteOverviewRow[] = []
  let loadedFromProgressLogs = false

  if (athleteUserIds.length > 0) {
    type ProgressLogDbRow = {
      id: string
      athlete_id: string
      date?: string | null
      weight_kg?: number | null
      massa_grassa_percentuale?: number | null
      waist_cm?: number | null
      hips_cm?: number | null
      created_by_profile_id?: string | null
      source?: string | null
      created_at?: string | null
    }
    const progressLogsAccum: ProgressLogDbRow[] = []
    let progressLogsErr: { message?: string } | null = null
    for (const uidChunk of chunkForSupabaseIn(athleteUserIds)) {
      const { data: chunkData, error: chunkErr } = await supabase
        .from('progress_logs')
        .select(
          'id, athlete_id, date, weight_kg, massa_grassa_percentuale, waist_cm, hips_cm, created_by_profile_id, source, created_at',
        )
        .in('athlete_id', uidChunk)
        .order('created_at', { ascending: false })
      if (chunkErr) {
        progressLogsErr = chunkErr
        break
      }
      progressLogsAccum.push(...((chunkData ?? []) as ProgressLogDbRow[]))
    }
    progressLogsAccum.sort(
      (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
    )
    const progressLogsData = progressLogsAccum.slice(0, 500)
    if (!progressLogsErr && progressLogsData.length > 0) {
      loadedFromProgressLogs = true
      timelineRows = progressLogsData.map((entry) => {
        const athleteProfileId = userIdToProfileId.get(entry.athlete_id)
        const profile = athleteProfileId ? profilesMap.get(athleteProfileId) : null
        const createdBy = entry.created_by_profile_id
        let createdByRole: string | null
        if (createdBy == null) {
          createdByRole = 'athlete'
        } else if (athleteProfileId != null && createdBy === athleteProfileId) {
          createdByRole = 'athlete'
        } else {
          createdByRole = 'staff'
        }
        return {
          progress_id: entry.id,
          athlete_id: athleteProfileId ?? entry.athlete_id,
          athlete_name: profile?.name ?? null,
          athlete_email: profile?.email ?? null,
          weight: entry.weight_kg ?? null,
          body_fat: entry.massa_grassa_percentuale ?? null,
          waist: entry.waist_cm ?? null,
          hip: entry.hips_cm ?? null,
          created_by_role: createdByRole,
          source: entry.source ?? null,
          created_at: entry.created_at ?? null,
        }
      })
      athleteOverviewRows = buildOverviewFromTimeline(
        athleteIds,
        timelineRows,
        new Map(
          [...profilesMap.entries()].map(([id, profile]) => [
            id,
            { name: profile.name, email: profile.email },
          ]),
        ),
      )
    } else if (progressLogsErr) {
      logger.warn('progress_logs fallback to nutrition_progress', progressLogsErr)
    }
  }

  if (!loadedFromProgressLogs) {
    const timelineRes = (supabase as { from: (table: string) => ReturnType<typeof supabase.from> })
      .from(NUTRITION_TABLES.viewProgressTimeline)
      .select('*')
      .eq('nutritionist_id', staffProfileId)
      .order('created_at', { ascending: false })
      .limit(500)
    const { data: timelineData, error: timelineErr } = await timelineRes
    if (timelineErr) {
      logger.warn('v_nutritionist_progress_timeline', timelineErr)
    }
    if (!timelineErr && timelineData && timelineData.length > 0) {
      timelineRows = (timelineData ?? []) as NutrizionistaProgressTimelineRow[]
    }

    const athletesRes = (supabase as { from: (table: string) => ReturnType<typeof supabase.from> })
      .from(NUTRITION_TABLES.viewProgressAthletes)
      .select('*')
      .eq('nutritionist_id', staffProfileId)
    const { data: athletesData, error: athletesErr } = await athletesRes
    if (athletesErr) {
      logger.warn('v_nutritionist_progress_athletes', athletesErr)
    }
    if (!athletesErr && athletesData && athletesData.length > 0) {
      athleteOverviewRows = (athletesData ?? []) as NutrizionistaProgressAthleteOverviewRow[]
    } else {
      type ProgressFallbackRow = {
        athlete_id: string
        created_at: string
        weight?: number | null
        weight_kg?: number | null
        body_fat?: number | null
        waist?: number | null
        hip?: number | null
      }
      const progressAccum: ProgressFallbackRow[] = []
      for (const idChunk of chunkForSupabaseIn(athleteIds)) {
        const { data: progressData, error: progressChunkErr } = await nutritionFrom(
          supabase,
          NUTRITION_TABLES.progress,
        )
          .select('athlete_id, created_at, weight, body_fat, waist, hip, weight_kg')
          .in('athlete_id', idChunk)
          .order('created_at', { ascending: false })
        if (progressChunkErr) {
          logger.error('Progressi: fallback nutrition_progress chunk', progressChunkErr)
          break
        }
        progressAccum.push(...((progressData ?? []) as ProgressFallbackRow[]))
      }
      progressAccum.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      const byAthlete = new Map<
        string,
        Array<{
          created_at: string
          weight: number | null
          body_fat: number | null
          waist: number | null
          hip: number | null
        }>
      >()
      progressAccum.forEach((entry) => {
        if (!byAthlete.has(entry.athlete_id)) byAthlete.set(entry.athlete_id, [])
        byAthlete.get(entry.athlete_id)!.push({
          created_at: entry.created_at,
          weight: entry.weight ?? entry.weight_kg ?? null,
          body_fat: entry.body_fat ?? null,
          waist: entry.waist ?? null,
          hip: entry.hip ?? null,
        })
      })
      const now = Date.now()
      athleteOverviewRows = athleteIds.map((athleteId) => {
        const list = byAthlete.get(athleteId) ?? []
        const last = list[0]
        const lastAt = last ? new Date(last.created_at).getTime() : null
        const daysSince = lastAt != null ? (now - lastAt) / (1000 * 60 * 60 * 24) : null
        const weight7d = list.find((entry) => {
          const timestamp = new Date(entry.created_at).getTime()
          return now - timestamp >= 7 * 24 * 60 * 60 * 1000 && entry.weight != null
        })
        const delta =
          last?.weight != null && weight7d?.weight != null ? last.weight - weight7d.weight : null
        return {
          athlete_id: athleteId,
          athlete_name: profilesMap.get(athleteId)?.name ?? null,
          athlete_email: profilesMap.get(athleteId)?.email ?? null,
          last_progress_at: last?.created_at ?? null,
          last_weight: last?.weight ?? null,
          last_body_fat: last?.body_fat ?? null,
          last_waist: last?.waist ?? null,
          last_hip: last?.hip ?? null,
          days_since_last_progress: daysSince,
          weight_delta_7d: delta,
        }
      })
    }
  }

  return { timelineRows, athleteOverviewRows, assignedAthletes }
}
