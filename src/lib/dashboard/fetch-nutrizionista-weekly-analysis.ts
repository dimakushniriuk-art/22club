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

const logger = createLogger('lib:dashboard:fetch-nutrizionista-weekly-analysis')

export type NutrizionistaWeeklyAnalysisRow = {
  nutritionist_id: string
  weekly_id: string
  version_id: string | null
  athlete_id: string
  athlete_name: string | null
  athlete_email: string | null
  week_start: string | null
  week_end: string | null
  avg_weight: number | null
  delta_weight: number | null
  target_delta: number | null
  delta_vs_target: number | null
  abs_delta_vs_target: number | null
  adjustment_applied: boolean | null
  created_at: string | null
}

export type NutrizionistaWeeklyAnalysisAssignedAthlete = {
  id: string
  name: string
  email: string | null
}

export type NutrizionistaWeeklyAnalysisData = {
  rows: NutrizionistaWeeklyAnalysisRow[]
  assignedAthletes: NutrizionistaWeeklyAnalysisAssignedAthlete[]
}

export async function fetchNutrizionistaWeeklyAnalysis(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<NutrizionistaWeeklyAnalysisData> {
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
    return { rows: [], assignedAthletes: [] }
  }

  const profilesAccum: {
    id: string
    nome: string | null
    cognome: string | null
    email: string | null
  }[] = []
  for (const idChunk of chunkForSupabaseIn(athleteIds)) {
    const { data: profilesData, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, nome, cognome, email')
      .in('id', idChunk)
    if (profilesErr) {
      logger.error('Analisi nutrizionista: caricamento profili', profilesErr)
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
      },
    ]),
  )
  const assignedAthletes = athleteIds.map((id) => ({
    id,
    name: profilesMap.get(id)?.name ?? id.slice(0, 8),
    email: profilesMap.get(id)?.email ?? null,
  }))

  const viewRes = (supabase as { from: (table: string) => ReturnType<typeof supabase.from> })
    .from(NUTRITION_TABLES.viewWeeklyAnalysis)
    .select('*')
    .eq('nutritionist_id', staffProfileId)
    .order('week_start', { ascending: false })
    .limit(500)
  const { data: viewData, error: viewErr } = await viewRes

  if (!viewErr) {
    return {
      rows: (viewData ?? []) as NutrizionistaWeeklyAnalysisRow[],
      assignedAthletes,
    }
  }

  logger.error('View weekly analysis fallback', viewErr)
  type WeeklyRaw = Record<string, unknown> & {
    id: string
    athlete_id: string
    version_id?: string | null
    week_start?: string | null
    week_end?: string | null
    avg_weight?: number | null
    delta_weight?: number | null
    target_delta?: number | null
    adjustment_applied?: boolean | null
    created_at?: string | null
  }

  const rawAccum: WeeklyRaw[] = []
  for (const idChunk of chunkForSupabaseIn(athleteIds)) {
    const rawRes = await nutritionFrom(supabase, NUTRITION_TABLES.weeklyAnalysis)
      .select('*')
      .in('athlete_id', idChunk)
      .order('week_start', { ascending: false })
    if (rawRes.error) {
      logger.error('Analisi: fallback weeklyAnalysis chunk', rawRes.error)
      throw rawRes.error
    }
    rawAccum.push(...((rawRes.data ?? []) as WeeklyRaw[]))
  }

  rawAccum.sort((a, b) => {
    const weekA = a.week_start ? new Date(a.week_start).getTime() : 0
    const weekB = b.week_start ? new Date(b.week_start).getTime() : 0
    return weekB - weekA
  })

  const rows = rawAccum.slice(0, 500).map((entry) => {
    const delta = (entry.delta_weight as number | null) ?? 0
    const target = (entry.target_delta as number | null) ?? 0
    return {
      nutritionist_id: staffProfileId,
      weekly_id: entry.id,
      version_id: entry.version_id ?? null,
      athlete_id: entry.athlete_id,
      athlete_name: profilesMap.get(entry.athlete_id)?.name ?? null,
      athlete_email: profilesMap.get(entry.athlete_id)?.email ?? null,
      week_start: entry.week_start ?? null,
      week_end: entry.week_end ?? null,
      avg_weight: entry.avg_weight ?? null,
      delta_weight: entry.delta_weight ?? null,
      target_delta: entry.target_delta ?? null,
      delta_vs_target: delta - target,
      abs_delta_vs_target: Math.abs(delta - target),
      adjustment_applied: entry.adjustment_applied ?? null,
      created_at: entry.created_at ?? null,
    }
  })

  return { rows, assignedAthletes }
}
