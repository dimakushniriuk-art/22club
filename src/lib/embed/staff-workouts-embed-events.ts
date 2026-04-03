import { isValidUUID } from '@/lib/utils/type-guards'
import {
  EMBED_ATHLETE_PATH_UPDATE,
  isValidEmbedPathForAthlete,
} from '@/lib/embed/staff-workouts-embed-path'

export const STAFF_WORKOUTS_EMBED_READY = '22club:staff-workouts-embed-ready' as const
export const STAFF_WORKOUTS_EMBED_CONTEXT = '22club:staff-workouts-embed-context' as const
export const STAFF_WORKOUTS_WORKOUT_COMPLETED = '22club:embed-coached-workout-done' as const
export const STAFF_WORKOUTS_EMBED_DIRTY = '22club:staff-workouts-embed-dirty' as const
export const STAFF_WORKOUTS_EMBED_SAVE_START = '22club:staff-workouts-embed-save-start' as const
export const STAFF_WORKOUTS_EMBED_SAVE_OK = '22club:staff-workouts-embed-save-ok' as const
export const STAFF_WORKOUTS_EMBED_SAVE_ERROR = '22club:staff-workouts-embed-save-error' as const
export const STAFF_WORKOUTS_EMBED_REFRESH = '22club:staff-workouts-embed-refresh' as const
export const STAFF_WORKOUTS_EMBED_AUTH_REQUIRED = '22club:staff-workouts-embed-auth-required' as const

export type StaffWorkoutsSlotId = 'p1' | 'p2'

export type StaffWorkoutsEmbedReadyEvent = {
  type: typeof STAFF_WORKOUTS_EMBED_READY
  athleteProfileId: string
}

export type StaffWorkoutsEmbedContextEvent = {
  type: typeof STAFF_WORKOUTS_EMBED_CONTEXT
  slotId: StaffWorkoutsSlotId
  athleteProfileId: string
}

export type StaffWorkoutsEmbedRefreshEvent = {
  type: typeof STAFF_WORKOUTS_EMBED_REFRESH
  athleteProfileId: string
}

export type StaffWorkoutsEmbedPathUpdateEvent = {
  type: typeof EMBED_ATHLETE_PATH_UPDATE
  athleteProfileId: string
  path: string
}

export type StaffWorkoutsWorkoutCompletedEvent = {
  type: typeof STAFF_WORKOUTS_WORKOUT_COMPLETED
  athleteProfileId: string
  withTrainer?: boolean
  workoutLogId?: string
}

export type StaffWorkoutsEmbedDirtyEvent = {
  type: typeof STAFF_WORKOUTS_EMBED_DIRTY
  athleteProfileId: string
  dirty: boolean
}

export type StaffWorkoutsEmbedSaveStartEvent = {
  type: typeof STAFF_WORKOUTS_EMBED_SAVE_START
  athleteProfileId: string
  scope: 'block' | 'workout'
}

export type StaffWorkoutsEmbedSaveOkEvent = {
  type: typeof STAFF_WORKOUTS_EMBED_SAVE_OK
  athleteProfileId: string
  scope: 'block' | 'workout'
}

export type StaffWorkoutsEmbedSaveErrorEvent = {
  type: typeof STAFF_WORKOUTS_EMBED_SAVE_ERROR
  athleteProfileId: string
  scope: 'block' | 'workout'
  message: string
}

export type StaffWorkoutsEmbedAuthRequiredEvent = {
  type: typeof STAFF_WORKOUTS_EMBED_AUTH_REQUIRED
  athleteProfileId: string
  reason: 'no_session' | 'forbidden_role' | 'invalid_athlete_id'
}

export type StaffWorkoutsEmbedInboundEvent =
  | StaffWorkoutsEmbedReadyEvent
  | StaffWorkoutsEmbedPathUpdateEvent
  | StaffWorkoutsWorkoutCompletedEvent
  | StaffWorkoutsEmbedDirtyEvent
  | StaffWorkoutsEmbedSaveStartEvent
  | StaffWorkoutsEmbedSaveOkEvent
  | StaffWorkoutsEmbedSaveErrorEvent
  | StaffWorkoutsEmbedAuthRequiredEvent

export type StaffWorkoutsEmbedOutboundEvent =
  | StaffWorkoutsEmbedContextEvent
  | StaffWorkoutsEmbedRefreshEvent

export function isStaffWorkoutsSlotId(v: unknown): v is StaffWorkoutsSlotId {
  return v === 'p1' || v === 'p2'
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v && typeof v === 'object')
}

export function isStaffWorkoutsEmbedInboundEvent(d: unknown): d is StaffWorkoutsEmbedInboundEvent {
  if (!isRecord(d)) return false
  const type = typeof d.type === 'string' ? d.type : ''
  const athleteProfileId = typeof d.athleteProfileId === 'string' ? d.athleteProfileId.trim() : ''
  if (!athleteProfileId || !isValidUUID(athleteProfileId)) return false

  if (type === STAFF_WORKOUTS_EMBED_READY) return true

  if (type === EMBED_ATHLETE_PATH_UPDATE) {
    const path = typeof d.path === 'string' ? d.path.trim() : ''
    return Boolean(path && isValidEmbedPathForAthlete(path, athleteProfileId))
  }

  if (type === STAFF_WORKOUTS_WORKOUT_COMPLETED) {
    if (typeof d.withTrainer !== 'undefined' && typeof d.withTrainer !== 'boolean') return false
    if (typeof d.workoutLogId !== 'undefined') {
      const w = typeof d.workoutLogId === 'string' ? d.workoutLogId.trim() : ''
      if (!w || !isValidUUID(w)) return false
    }
    return true
  }

  if (type === STAFF_WORKOUTS_EMBED_DIRTY) {
    return typeof d.dirty === 'boolean'
  }

  if (type === STAFF_WORKOUTS_EMBED_SAVE_START || type === STAFF_WORKOUTS_EMBED_SAVE_OK) {
    return d.scope === 'block' || d.scope === 'workout'
  }

  if (type === STAFF_WORKOUTS_EMBED_SAVE_ERROR) {
    const scopeOk = d.scope === 'block' || d.scope === 'workout'
    const msg = typeof d.message === 'string' ? d.message.trim() : ''
    return scopeOk && Boolean(msg)
  }

  if (type === STAFF_WORKOUTS_EMBED_AUTH_REQUIRED) {
    return d.reason === 'no_session' || d.reason === 'forbidden_role' || d.reason === 'invalid_athlete_id'
  }

  return false
}

export function isStaffWorkoutsEmbedOutboundEvent(d: unknown): d is StaffWorkoutsEmbedOutboundEvent {
  if (!isRecord(d)) return false
  const athleteProfileId = typeof d.athleteProfileId === 'string' ? d.athleteProfileId.trim() : ''
  if (!athleteProfileId || !isValidUUID(athleteProfileId)) return false

  if (d.type === STAFF_WORKOUTS_EMBED_CONTEXT) {
    return isStaffWorkoutsSlotId(d.slotId)
  }

  if (d.type === STAFF_WORKOUTS_EMBED_REFRESH) {
    return true
  }

  return false
}

