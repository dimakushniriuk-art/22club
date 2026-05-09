import type { Allenamento } from '@/types/allenamento'
import type { TablesUpdate } from '@/types/supabase'

/** Allinea il payload Supabase alle mutazioni in `use-allenamenti` e agli handler della coda offline. */
export function buildWorkoutLogUpdatePayload(
  updates: Partial<Allenamento>,
): TablesUpdate<'workout_logs'> {
  const payload: TablesUpdate<'workout_logs'> = {
    updated_at: new Date().toISOString(),
  }

  if (updates.stato != null) payload.stato = updates.stato
  if (updates.esercizi_completati !== undefined) {
    payload.esercizi_completati = updates.esercizi_completati
  }
  if (updates.volume_totale !== undefined) {
    payload.volume_totale = updates.volume_totale
  }
  if (updates.note !== undefined) {
    payload.note = updates.note
  }
  if (updates.durata_minuti !== undefined) {
    payload.durata_minuti = updates.durata_minuti
  }

  return payload
}
