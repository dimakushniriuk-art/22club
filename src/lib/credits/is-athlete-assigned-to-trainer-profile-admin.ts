import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

/**
 * Verifica assegnazione atleta↔trainer con trainer_id esplicito (service role).
 * Usata dove `get_current_trainer_profile_id()` non copre il ruolo DB (es. `pt`, `staff`).
 * Allineata a `is_athlete_assigned_to_trainer` (assignments attivi + pt_atleti).
 */
export async function isAthleteAssignedToTrainerProfileIdAdmin(
  admin: SupabaseClient<Database>,
  trainerProfileId: string,
  athleteProfileId: string,
): Promise<boolean> {
  /** Postgres accetta UUID case-insensitive; PostgREST `.eq` su stringhe no → allinea a lowercase. */
  const tid = trainerProfileId.trim().toLowerCase()
  const aid = athleteProfileId.trim().toLowerCase()
  if (!tid || !aid) return false

  const { data: rowA } = await admin
    .from('athlete_trainer_assignments')
    .select('id')
    .eq('athlete_id', aid)
    .eq('trainer_id', tid)
    .eq('status', 'active')
    .maybeSingle()

  if (rowA) return true

  const { data: rowP } = await admin
    .from('pt_atleti')
    .select('pt_id')
    .eq('atleta_id', aid)
    .eq('pt_id', tid)
    .maybeSingle()

  return Boolean(rowP)
}
