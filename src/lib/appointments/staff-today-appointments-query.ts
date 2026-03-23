/**
 * Query condivisa: appuntamenti di un giorno (locale) per staff — range date, select lista, nome atleta.
 * Usata da API dashboard appointments, fallback mobile upcoming, agenda giorno dashboard (stesso filtro staff_id esplicito).
 */

/** Intervallo [dayStart, dayEnd) per il giorno calendario locale di referenceDate. */
export function getStaffLocalDayBoundsISO(referenceDate: Date = new Date()): {
  dayStart: string
  dayEnd: string
} {
  const day = new Date(referenceDate)
  day.setHours(0, 0, 0, 0)
  const dayStart = day.toISOString()
  const next = new Date(day)
  next.setDate(next.getDate() + 1)
  const dayEnd = next.toISOString()
  return { dayStart, dayEnd }
}

/** Select per liste “giorno” (dashboard upcoming / API / agenda). */
export const STAFF_TODAY_APPOINTMENTS_SELECT = `
  id,
  starts_at,
  ends_at,
  type,
  status,
  athlete_id,
  athlete:profiles!athlete_id(avatar, avatar_url, nome, cognome)
`

export function formatStaffDayAthleteDisplayName(athlete: unknown): string {
  if (!athlete || typeof athlete !== 'object' || ('message' in athlete && !('nome' in athlete))) {
    return 'Atleta'
  }
  const a = athlete as { nome?: string | null; cognome?: string | null }
  if (a.nome && a.cognome) return `${a.nome} ${a.cognome}`.trim()
  return a.nome || a.cognome || 'Atleta'
}
