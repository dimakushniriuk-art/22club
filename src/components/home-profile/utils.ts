// ============================================================
// Utility per profilo atleta home (FASE C - Split File Lunghi)
// ============================================================

import { format, isValid } from 'date-fns'

export const formatSafeDate = (date: string | Date | null | undefined) => {
  if (!date) return 'N/A'
  try {
    const d = new Date(date)
    return isValid(d) ? format(d, 'dd MMM yyyy') : 'N/A'
  } catch {
    return 'N/A'
  }
}
