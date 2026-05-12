import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'
import { STAFF_ASSIGNMENT_STATUS_ACTIVE, STAFF_TYPE_NUTRIZIONISTA } from '@/lib/nutrition-tables'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'
import type { Tables } from '@/types/supabase'

const logger = createLogger('lib:dashboard:fetch-nutrizionista-checkin-list')

export type NutrizionistaCheckinRow = Tables<'nutrition_check_ins'>

export type NutrizionistaCheckinAthleteOption = {
  id: string
  name: string
  org_id: string
}

export type NutrizionistaCheckinListData = {
  rows: NutrizionistaCheckinRow[]
  athletes: NutrizionistaCheckinAthleteOption[]
}

export function mapNutrizionistaCheckinListError(err: unknown): string {
  const msg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message?: string }).message)
      : 'Errore caricamento'
  return /relation|does not exist|404/i.test(msg)
    ? 'Tabella check-in non presente: applica la migrazione SQL su Supabase (nutrition_check_ins), poi ricarica.'
    : msg
}

export async function fetchNutrizionistaCheckinList(
  supabase: SupabaseClient<Database>,
  staffProfileId: string,
): Promise<NutrizionistaCheckinListData> {
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
    return { rows: [], athletes: [] }
  }

  const profilesAccum: {
    id: string
    nome: string | null
    cognome: string | null
    org_id: string | null
  }[] = []
  for (const idChunk of chunkForSupabaseIn(athleteIds)) {
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, nome, cognome, org_id')
      .in('id', idChunk)
    if (profilesErr) throw profilesErr
    profilesAccum.push(...((profiles ?? []) as (typeof profilesAccum)[number][]))
  }

  const athletes = profilesAccum
    .filter((profile) => profile.org_id)
    .map((profile) => ({
      id: profile.id,
      org_id: profile.org_id as string,
      name: [profile.nome, profile.cognome].filter(Boolean).join(' ') || profile.id.slice(0, 8),
    }))

  const { data: checkRows, error: checkErr } = await supabase
    .from('nutrition_check_ins')
    .select('*')
    .eq('staff_profile_id', staffProfileId)
    .order('created_at', { ascending: false })
    .limit(300)
  if (checkErr) throw checkErr

  return {
    rows: (checkRows ?? []) as NutrizionistaCheckinRow[],
    athletes,
  }
}
