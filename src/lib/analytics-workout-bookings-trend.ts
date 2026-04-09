/** Tipi appuntamento conteggiati come “allenamento in palestra” nel trend prenotazioni. */
export const WORKOUT_APPOINTMENT_TYPES = new Set([
  'allenamento',
  'allenamento_doppio',
  'allenamento_singolo',
])

export type BookingTrendBucket = 'prenotati' | 'eseguiti' | 'annullati' | 'cancellati'

/**
 * Appuntamento con atleta e tipo allenamento → bucket per giorno (chiave = data di `starts_at`, UTC YYYY-MM-DD).
 * - eseguiti: completato
 * - annullati: status annullato
 * - cancellati: status cancelled o cancelled_at valorizzato (senza annullato già catturato sopra)
 * - prenotati: attivo / in corso / altri non chiusi
 */
export function classifyWorkoutAppointmentForTrend(row: {
  athlete_id: string | null
  type: string | null
  status: string | null
  cancelled_at: string | null
}): BookingTrendBucket | null {
  if (!row.athlete_id) return null
  const rawType = (row.type ?? '').trim().toLowerCase()
  const t = rawType || 'allenamento'
  if (!WORKOUT_APPOINTMENT_TYPES.has(t)) return null

  const st = (row.status ?? '').toLowerCase()
  const hasCancelledAt = row.cancelled_at != null && row.cancelled_at !== ''

  if (st === 'completato' || st === 'completed') return 'eseguiti'
  if (st === 'annullato') return 'annullati'
  if (st === 'cancelled') return 'cancellati'
  if (hasCancelledAt) return 'cancellati'
  return 'prenotati'
}
