/**
 * Suddivisione delle finestre "Libera prenotazione" in fasce da 15 minuti (griglia timeGrid atleta).
 * Il limite max atleti si intende per ogni fascia, non sull’intera finestra aperta dal trainer.
 */

export const ATHLETE_OPEN_BOOKING_GRID_MINUTES = 15
export const ATHLETE_OPEN_BOOKING_GRID_MS = ATHLETE_OPEN_BOOKING_GRID_MINUTES * 60 * 1000

export function segmentKey(startMs: number, endMs: number): string {
  return `${startMs}|${endMs}`
}

export function eachOpenBookingSegment(
  openStartIso: string,
  openEndIso: string,
  stepMs: number = ATHLETE_OPEN_BOOKING_GRID_MS,
): { startMs: number; endMs: number; key: string }[] {
  const openStart = new Date(openStartIso).getTime()
  const openEnd = new Date(openEndIso).getTime()
  if (!Number.isFinite(openStart) || !Number.isFinite(openEnd) || !(openStart < openEnd)) {
    return []
  }
  const out: { startMs: number; endMs: number; key: string }[] = []
  let t = openStart
  while (t < openEnd) {
    const end = Math.min(t + stepMs, openEnd)
    out.push({ startMs: t, endMs: end, key: segmentKey(t, end) })
    t = end
  }
  return out
}

/** Prenotazioni atleta (esclude marker Libera e righe non valide) che si sovrappongono a [windowStartMs, windowEndMs). */
export function countBookingsOverlappingWindow(
  rows: {
    starts_at: string
    ends_at: string
    athlete_id?: string | null
    cancelled_at?: string | null
    status?: string | null
    is_open_booking_day?: boolean | null
  }[],
  windowStartMs: number,
  windowEndMs: number,
): number {
  return rows.filter((r) => {
    if (!r.starts_at || !r.ends_at || r.athlete_id == null) return false
    if (r.cancelled_at != null || r.status === 'annullato') return false
    if (r.is_open_booking_day === true) return false
    const bs = new Date(r.starts_at).getTime()
    const be = new Date(r.ends_at).getTime()
    return bs < windowEndMs && be > windowStartMs
  }).length
}
