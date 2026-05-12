import type { Cliente } from '@/types/cliente'

export const WORKOUTS_SHELL_PANE_URL_KEYS = [
  'view',
  'workoutPlanId',
  'dayId',
  'exerciseId',
  'workoutLogId',
] as const

export function deleteWorkoutsSlotParams(p: URLSearchParams, slotId: 'p1' | 'p2') {
  p.delete(slotId)
  for (const k of WORKOUTS_SHELL_PANE_URL_KEYS) {
    p.delete(`${slotId}${k}`)
  }
}

export function workoutsSlotClienteDisplayName(c: Cliente): string {
  const name = `${c.nome ?? c.first_name ?? ''} ${c.cognome ?? c.last_name ?? ''}`.trim()
  if (name) return name
  return c.email?.trim() || 'Atleta'
}

export function workoutsResolveAthleteFallbackLabel(
  athleteId: string,
  athletes: Cliente[],
  athletesLoading: boolean,
): string {
  const id = athleteId.trim()
  const hit = athletes.find((a) => a.id.trim() === id)
  if (hit) return workoutsSlotClienteDisplayName(hit)
  if (athletesLoading) return 'Caricamento profilo…'
  return `Atleta (${id.slice(0, 8)}…)`
}
