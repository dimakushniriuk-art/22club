/**
 * Formattazione centralizzata per 22Club.
 * Locale: it-IT. Usare solo queste funzioni per date, valute e numeri in tutta l'app.
 *
 * Colori del testo: vedi docs/typography-and-formatting.md (sez. "Colori del testo in base alla posizione").
 */

const LOCALE = 'it-IT'

/** Valuta EUR (es. "12,50 €"). */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Data breve (es. "12/02/2025") — tabelle, liste, label.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (dateString == null) return '—'
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString(LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/**
 * Data con mese abbreviato (es. "12 feb 2025") — header, card.
 */
export function formatDateShort(dateString: string | null | undefined): string {
  if (dateString == null) return '—'
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString(LOCALE, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/**
 * Data estesa con giorno della settimana (es. "mercoledì 12 febbraio 2025") — dettaglio, appuntamenti.
 */
export function formatDateLong(dateString: string | null | undefined): string {
  if (dateString == null) return '—'
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString(LOCALE, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/**
 * Data e ora (es. "12/02/2025, 14:30") — pagamenti, log, appuntamenti.
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (dateString == null) return '—'
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString(LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

/**
 * Solo ora (es. "14:30").
 */
export function formatTime(dateString: string | null | undefined): string {
  if (dateString == null) return '--:--'
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '--:--'
    return date.toLocaleTimeString(LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '--:--'
  }
}

/**
 * Numero generico (es. passi, kcal) — locale it-IT.
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(LOCALE, options).format(value)
}
