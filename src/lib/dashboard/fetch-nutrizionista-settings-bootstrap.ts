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

const logger = createLogger('lib:dashboard:fetch-nutrizionista-settings-bootstrap')

export type NutrizionistaSettingsAssignedAthlete = {
  id: string
  name: string
  email: string | null
}

export type NutrizionistaSettingsPlan = {
  id: string
  athlete_id: string
  created_at: string | null
}

export type NutrizionistaSettingsBootstrapData = {
  assignedAthletes: NutrizionistaSettingsAssignedAthlete[]
  plans: NutrizionistaSettingsPlan[]
}

export async function fetchNutrizionistaSettingsBootstrap(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<NutrizionistaSettingsBootstrapData> {
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
    return { assignedAthletes: [], plans: [] }
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
      logger.error('Impostazioni nutrizionista: profili', profilesErr)
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

  const plans: NutrizionistaSettingsPlan[] = []
  for (const idChunk of chunkForSupabaseIn(athleteIds)) {
    const groupsRes = await nutritionFrom(supabase, NUTRITION_TABLES.planGroups)
      .select('id, athlete_id, created_at')
      .in('athlete_id', idChunk)
    if (groupsRes.error) {
      logger.error('Impostazioni nutrizionista: plan groups', groupsRes.error)
      throw groupsRes.error
    }
    plans.push(...((groupsRes.data ?? []) as NutrizionistaSettingsPlan[]))
  }

  return { assignedAthletes, plans }
}
