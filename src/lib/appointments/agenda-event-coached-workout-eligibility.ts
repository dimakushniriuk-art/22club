import type { AgendaEvent } from '@/types/agenda-event'

/**
 * In dashboard Workouts, il completamento log può contare come sessione coachata solo se
 * lo slot ha un evento agenda oggi ancora rilevante (stesso criterio della strip).
 * Senza evento (es. appuntamento fuori finestra o non in agenda) → completamento "solo".
 */
export function agendaEventAllowsCoachedWorkoutCompletion(ev: AgendaEvent | undefined): boolean {
  if (!ev?.athlete_id) return false
  if (ev.type !== 'allenamento') return false
  if (ev.status === 'completed' || ev.status === 'cancelled' || ev.status === 'annullato') {
    return false
  }
  return true
}
