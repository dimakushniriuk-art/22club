// ============================================================
// Utility per profilo atleta home (FASE C - Split File Lunghi)
// ============================================================

import { format, isValid } from 'date-fns'
import { it } from 'date-fns/locale'

export const formatSafeDate = (date: string | Date | null | undefined) => {
  if (!date) return '—'
  try {
    const d = new Date(date)
    return isValid(d) ? format(d, 'd MMM yyyy', { locale: it }) : '—'
  } catch {
    return '—'
  }
}
