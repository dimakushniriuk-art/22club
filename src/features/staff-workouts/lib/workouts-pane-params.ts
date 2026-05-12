import type { WorkoutsPaneView } from '@/contexts/workouts-pane-context'
import { isValidUUID } from '@/lib/utils/type-guards'

export const WORKOUTS_PANE_PARAM_KEYS = [
  'view',
  'workoutPlanId',
  'dayId',
  'exerciseId',
  'workoutLogId',
] as const

export function workoutsPaneParamPrefix(slotId: 'p1' | 'p2'): 'p1' | 'p2' {
  return slotId
}

export function parseWorkoutsPaneView(
  kind: string,
  params: URLSearchParams,
  slotId: 'p1' | 'p2',
): WorkoutsPaneView {
  const prefix = workoutsPaneParamPrefix(slotId)
  if (kind === 'oggi') {
    const workoutPlanId = params.get(`${prefix}workoutPlanId`)?.trim() ?? ''
    const dayId = params.get(`${prefix}dayId`)?.trim() ?? ''
    const exerciseId = params.get(`${prefix}exerciseId`)?.trim() ?? ''
    return {
      kind: 'oggi',
      workoutPlanId: isValidUUID(workoutPlanId) ? workoutPlanId : undefined,
      dayId: isValidUUID(dayId) ? dayId : undefined,
      exerciseId: isValidUUID(exerciseId) ? exerciseId : undefined,
    }
  }
  if (kind === 'home') return { kind: 'home' }
  if (kind === 'scheda') {
    const id = params.get(`${prefix}workoutPlanId`)?.trim() ?? ''
    return isValidUUID(id) ? { kind: 'scheda', workoutPlanId: id } : { kind: 'home' }
  }
  if (kind === 'giorno') {
    const planId = params.get(`${prefix}workoutPlanId`)?.trim() ?? ''
    const dayId = params.get(`${prefix}dayId`)?.trim() ?? ''
    if (isValidUUID(planId) && isValidUUID(dayId))
      return { kind: 'giorno', workoutPlanId: planId, dayId }
    return { kind: 'home' }
  }
  if (kind === 'esercizio') {
    const exerciseId = params.get(`${prefix}exerciseId`)?.trim() ?? ''
    return isValidUUID(exerciseId) ? { kind: 'esercizio', exerciseId } : { kind: 'home' }
  }
  if (kind === 'riepilogo') {
    const workoutLogId = params.get(`${prefix}workoutLogId`)?.trim() ?? ''
    return workoutLogId && isValidUUID(workoutLogId)
      ? { kind: 'riepilogo', workoutLogId }
      : { kind: 'riepilogo' }
  }
  return { kind: 'home' }
}

export function applyWorkoutsPaneViewToSearchParams(
  slotId: 'p1' | 'p2',
  view: WorkoutsPaneView,
  base: URLSearchParams,
): void {
  const prefix = workoutsPaneParamPrefix(slotId)
  base.set(`${prefix}view`, view.kind)
  base.delete(`${prefix}workoutPlanId`)
  base.delete(`${prefix}dayId`)
  base.delete(`${prefix}exerciseId`)
  base.delete(`${prefix}workoutLogId`)

  if (view.kind === 'oggi') {
    if (view.workoutPlanId) base.set(`${prefix}workoutPlanId`, view.workoutPlanId)
    if (view.dayId) base.set(`${prefix}dayId`, view.dayId)
    if (view.exerciseId) base.set(`${prefix}exerciseId`, view.exerciseId)
  }
  if (view.kind === 'scheda') base.set(`${prefix}workoutPlanId`, view.workoutPlanId)
  if (view.kind === 'giorno') {
    base.set(`${prefix}workoutPlanId`, view.workoutPlanId)
    base.set(`${prefix}dayId`, view.dayId)
  }
  if (view.kind === 'esercizio') base.set(`${prefix}exerciseId`, view.exerciseId)
  if (view.kind === 'riepilogo' && view.workoutLogId)
    base.set(`${prefix}workoutLogId`, view.workoutLogId)
}
