import { validateDate } from '@/lib/utils/validation'

export type AppointmentStatus = 'attivo' | 'completato' | 'annullato' | 'in_corso'

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'outline'
  | 'secondary'
  | 'primary'

export function getStatusColor(status: AppointmentStatus): BadgeVariant {
  switch (status) {
    case 'attivo':
      return 'success'
    case 'annullato':
      return 'warning'
    case 'completato':
      return 'primary'
    case 'in_corso':
      return 'info'
    default:
      return 'default'
  }
}

export function getStatusText(status: AppointmentStatus): string {
  switch (status) {
    case 'attivo':
      return 'Attivo'
    case 'annullato':
      return 'Annullato'
    case 'completato':
      return 'Completato'
    case 'in_corso':
      return 'In Corso'
    default:
      return 'Sconosciuto'
  }
}

export function isValidAppointmentDate(dateString: string | null | undefined): boolean {
  return validateDate(dateString).valid
}
