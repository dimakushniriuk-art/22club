/**
 * Costanti per gli obiettivi delle schede di allenamento
 */

export const WORKOUT_OBJECTIVES = [
  { value: 'dimagrimento', label: 'Dimagrimento / Perdita di grasso' },
  { value: 'ipertrofia', label: 'Aumento massa muscolare (Ipertrofia)' },
  { value: 'ricomposizione', label: 'Ricomposizione corporea' },
  { value: 'forza', label: 'Aumento della forza' },
  { value: 'tonificazione', label: 'Tonificazione / Definizione' },
  { value: 'resistenza', label: 'Miglioramento della resistenza cardiovascolare' },
  { value: 'mobilita', label: 'Miglioramento mobilità e flessibilità' },
  { value: 'prevenzione', label: 'Prevenzione infortuni' },
  { value: 'recupero', label: 'Recupero funzionale / Rieducazione motoria' },
  { value: 'postura', label: 'Miglioramento postura' },
  { value: 'preparazione', label: 'Preparazione atletica specifica' },
  { value: 'benessere', label: 'Benessere generale / Anti-stress' },
] as const

export function getObjectiveLabel(value: string | null | undefined): string {
  if (!value) return ''
  const objective = WORKOUT_OBJECTIVES.find((obj) => obj.value === value)
  return objective?.label || value
}
