// 🔄 Recurrence Utilities — 22Club

/**
 * Tipo di ricorrenza
 */
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'

/**
 * Configurazione ricorrenza
 */
export interface RecurrenceConfig {
  type: RecurrenceType
  interval?: number // Ogni N giorni/settimane/mesi (default: 1)
  endDate?: string // Data fine ricorrenza (YYYY-MM-DD)
  count?: number // Numero massimo di occorrenze
  daysOfWeek?: number[] // Giorni della settimana (0=domenica, 1=lunedì, ...) per weekly
}

/**
 * Serializza configurazione ricorrenza in JSON string per database
 */
export function serializeRecurrence(config: RecurrenceConfig): string | null {
  if (config.type === 'none') {
    return null
  }

  return JSON.stringify({
    type: config.type,
    interval: config.interval || 1,
    endDate: config.endDate || null,
    count: config.count || null,
    daysOfWeek: config.daysOfWeek || null,
  })
}

/**
 * Deserializza JSON string da database in configurazione ricorrenza
 */
export function deserializeRecurrence(recurrenceRule: string | null): RecurrenceConfig {
  if (!recurrenceRule) {
    return { type: 'none' }
  }

  try {
    const parsed = JSON.parse(recurrenceRule)
    return {
      type: parsed.type || 'none',
      interval: parsed.interval || 1,
      endDate: parsed.endDate || null,
      count: parsed.count || null,
      daysOfWeek: parsed.daysOfWeek || null,
    }
  } catch {
    return { type: 'none' }
  }
}

/**
 * Genera date per appuntamenti ricorrenti basati sulla configurazione
 */
export function generateRecurrenceDates(
  startDate: Date,
  config: RecurrenceConfig,
  maxOccurrences: number = 100,
): Date[] {
  if (config.type === 'none') {
    return [startDate]
  }

  const dates: Date[] = [new Date(startDate)]
  const endDate = config.endDate ? new Date(config.endDate) : null
  const maxCount = config.count || maxOccurrences
  const interval = config.interval || 1

  let currentDate = new Date(startDate)
  let occurrenceCount = 1

  while (occurrenceCount < maxCount) {
    let nextDate: Date

    switch (config.type) {
      case 'daily':
        nextDate = new Date(currentDate)
        nextDate.setDate(nextDate.getDate() + interval)
        break

      case 'weekly':
        if (config.daysOfWeek && config.daysOfWeek.length > 0) {
          // Trova il prossimo giorno della settimana valido
          nextDate = findNextDayOfWeek(currentDate, config.daysOfWeek, interval)
        } else {
          nextDate = new Date(currentDate)
          nextDate.setDate(nextDate.getDate() + 7 * interval)
        }
        break

      case 'monthly':
        nextDate = new Date(currentDate)
        nextDate.setMonth(nextDate.getMonth() + interval)
        break

      default:
        return dates
    }

    // Controlla se abbiamo superato la data fine
    if (endDate && nextDate > endDate) {
      break
    }

    dates.push(new Date(nextDate))
    currentDate = nextDate
    occurrenceCount++
  }

  return dates
}

/**
 * Trova il prossimo giorno della settimana valido
 */
function findNextDayOfWeek(fromDate: Date, daysOfWeek: number[], interval: number): Date {
  const currentDay = fromDate.getDay()
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b)

  // Cerca il prossimo giorno valido nella stessa settimana
  for (const day of sortedDays) {
    if (day > currentDay) {
      const nextDate = new Date(fromDate)
      const daysToAdd = day - currentDay
      nextDate.setDate(nextDate.getDate() + daysToAdd)
      return nextDate
    }
  }

  // Se non c'è un giorno valido nella stessa settimana, vai alla prossima settimana
  const nextDate = new Date(fromDate)
  const daysToAdd = 7 * interval - (currentDay - sortedDays[0])
  nextDate.setDate(nextDate.getDate() + daysToAdd)
  return nextDate
}

/**
 * Calcola durata appuntamento in millisecondi
 */
export function getAppointmentDuration(startDate: Date, endDate: Date): number {
  return endDate.getTime() - startDate.getTime()
}

/**
 * Genera appuntamenti ricorrenti con stesso orario
 */
export function generateRecurringAppointments(
  baseStartDate: Date,
  baseEndDate: Date,
  config: RecurrenceConfig,
): Array<{ starts_at: Date; ends_at: Date }> {
  const dates = generateRecurrenceDates(baseStartDate, config)
  const duration = getAppointmentDuration(baseStartDate, baseEndDate)

  return dates.map((date) => {
    const starts_at = new Date(date)
    starts_at.setHours(baseStartDate.getHours(), baseStartDate.getMinutes(), 0, 0)

    const ends_at = new Date(starts_at.getTime() + duration)

    return { starts_at, ends_at }
  })
}

/**
 * Nomi giorni della settimana
 */
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domenica', short: 'Dom' },
  { value: 1, label: 'Lunedì', short: 'Lun' },
  { value: 2, label: 'Martedì', short: 'Mar' },
  { value: 3, label: 'Mercoledì', short: 'Mer' },
  { value: 4, label: 'Giovedì', short: 'Gio' },
  { value: 5, label: 'Venerdì', short: 'Ven' },
  { value: 6, label: 'Sabato', short: 'Sab' },
]
