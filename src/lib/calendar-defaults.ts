/**
 * Fallback durate (minuti) e colori per tipo appuntamento, per ruolo.
 * Usato quando staff_calendar_settings non ha valore per un tipo.
 */

import type { AppointmentColor } from '@/types/appointment'

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
