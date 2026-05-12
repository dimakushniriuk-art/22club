import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'

const logger = createLogger('lib:dashboard:fetch-nutrizionista-checkin-detail')

export type NutrizionistaCheckinDetailRow = Tables<'nutrition_check_ins'>

export type NutrizionistaCheckinDetailData = {
  row: NutrizionistaCheckinDetailRow
  athleteName: string | null
}

export async function fetchNutrizionistaCheckinDetail(
  supabase: SupabaseClient<Database>,
  checkinId: string,
): Promise<NutrizionistaCheckinDetailData | null> {
  const { data, error } = await supabase
    .from('nutrition_check_ins')
    .select('*')
    .eq('id', checkinId)
    .maybeSingle()
  if (error) {
    logger.error('Check-in detail', error)
    throw error
  }
  if (!data) return null

  const row = data as NutrizionistaCheckinDetailRow
  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, cognome')
    .eq('id', row.athlete_id)
    .maybeSingle()
  const athleteProfile = profile as { nome: string | null; cognome: string | null } | null

  return {
    row,
    athleteName: athleteProfile
      ? [athleteProfile.nome, athleteProfile.cognome].filter(Boolean).join(' ') || null
      : null,
  }
}
