/**
 * Fallback durate (minuti) e colori per tipo appuntamento, per ruolo.
 * Usato quando staff_calendar_settings non ha valore per un tipo.
 */

import type { AppointmentColor } from '@/types/appointment'
import type { StaffCalendarSettings } from '@/types/staff-calendar-settings'

export type StaffCalendarSettingsPickForTypes = Pick<
  StaffCalendarSettings,
  'enabled_appointment_types' | 'custom_appointment_types'
>

/**
 * Tipi ordine: lista salvata in impostazioni + chiavi custom in coda.
 * Se `enabled_appointment_types` è vuoto o assente, usa i default per ruolo (come form).
 */
export function getEnabledAppointmentTypeKeys(
  settings: StaffCalendarSettingsPickForTypes | null | undefined,
  role: string | null | undefined,
): string[] {
  let system: string[]
  if (settings?.enabled_appointment_types?.length) {
    system = settings.enabled_appointment_types
  } else if (role === 'trainer' || role === 'admin')
    system = [
      'allenamento_singolo',
      'allenamento_doppio',
      'programma',
      'prova',
      'riunione',
      'privato',
      'allenamento',
    ]
  else if (role === 'nutrizionista')
    system = [
      'appuntamento_normale',
      'prova',
      'controllo',
      'riunione',
      'privato',
      'nutrizionista',
    ]
  else if (role === 'massaggiatore')
    system = ['appuntamento_normale', 'prova', 'controllo', 'riunione', 'privato', 'massaggio']
  else
    system = [
      'appuntamento_normale',
      'prova',
      'controllo',
      'riunione',
      'privato',
      'massaggio',
      'nutrizionista',
    ]
  const customKeys = (settings?.custom_appointment_types ?? []).map((c) => c.key)
  return [...system, ...customKeys]
}

/** Tutti i tipi con label per UI (form e impostazioni). */
export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  allenamento: 'Allenamento',
  allenamento_singolo: 'Allenamento singolo',
  allenamento_doppio: 'Allenamento doppio',
  programma: 'Programma',
  prova: 'Prova',
  valutazione: 'Valutazione',
  prima_visita: 'Prima visita',
  riunione: 'Riunione',
  massaggio: 'Massaggio',
  nutrizionista: 'Nutrizionista',
  privato: 'Privato',
  appuntamento_normale: 'Appuntamento normale',
  controllo: 'Controllo',
  slot_disponibile: 'Slot disponibile',
}

export const DEFAULT_DURATIONS_TRAINER: Record<string, number> = {
  allenamento_singolo: 90,
  allenamento_doppio: 90,
  prova: 60,
  programma: 90,
  riunione: 45,
  privato: 60,
  allenamento: 90,
}

export const DEFAULT_DURATIONS_COLLABORATOR: Record<string, number> = {
  appuntamento_normale: 60,
  prova: 45,
  controllo: 45,
  riunione: 45,
  privato: 60,
  massaggio: 60,
  nutrizionista: 60,
}

/** Durata fissa slot Free Pass (minuti). */
export const FREE_PASS_DURATION_MINUTES = 90

/** Fallback max atleti per slot Free Pass. */
export const DEFAULT_MAX_FREE_PASS_ATHLETES_PER_SLOT = 4

/** Colori default per tipo (chiavi APPOINTMENT_COLORS). */
export const DEFAULT_TYPE_COLORS: Record<string, AppointmentColor> = {
  allenamento_doppio: 'viola_scuro',
  allenamento_singolo: 'lilla',
  programma: 'azzurro',
  prova: 'azzurro',
  riunione: 'blu',
  appuntamento_normale: 'giallo',
  controllo: 'rosa',
  privato: 'arancione',
  allenamento: 'lilla',
  massaggio: 'rosa',
  nutrizionista: 'verde_chiaro',
  slot_disponibile: 'verde',
  /** Free Pass in vista: grigio (o colore slot) */
  free_pass: 'grigio',
}

export function getDefaultDurationsForRole(role: string): Record<string, number> {
  if (role === 'trainer' || role === 'admin') return { ...DEFAULT_DURATIONS_TRAINER }
  return { ...DEFAULT_DURATIONS_COLLABORATOR }
}
