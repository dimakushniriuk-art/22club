import { describe, expect, it } from 'vitest'
import {
  STAFF_WORKOUTS_EMBED_CONTEXT,
  STAFF_WORKOUTS_EMBED_READY,
  STAFF_WORKOUTS_WORKOUT_COMPLETED,
  isStaffWorkoutsEmbedInboundEvent,
  isStaffWorkoutsEmbedOutboundEvent,
  isStaffWorkoutsSlotId,
} from '@/lib/embed/staff-workouts-embed-events'
import { EMBED_ATHLETE_PATH_UPDATE } from '@/lib/embed/staff-workouts-embed-path'

const ATHLETE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const PATH = `/embed/athlete-allenamenti/${ATHLETE}/oggi`
const LOG = '44444444-4444-4444-8444-444444444444'

describe('staff workouts embed events', () => {
  it('accepts slot ids p1 and p2', () => {
    expect(isStaffWorkoutsSlotId('p1')).toBe(true)
    expect(isStaffWorkoutsSlotId('p3')).toBe(false)
  })

  it('validates inbound ready and path update events', () => {
    expect(
      isStaffWorkoutsEmbedInboundEvent({
        type: STAFF_WORKOUTS_EMBED_READY,
        athleteProfileId: ATHLETE,
      }),
    ).toBe(true)
    expect(
      isStaffWorkoutsEmbedInboundEvent({
        type: EMBED_ATHLETE_PATH_UPDATE,
        athleteProfileId: ATHLETE,
        path: PATH,
      }),
    ).toBe(true)
    expect(
      isStaffWorkoutsEmbedInboundEvent({
        type: EMBED_ATHLETE_PATH_UPDATE,
        athleteProfileId: ATHLETE,
        path: '/embed/athlete-allenamenti/other/oggi',
      }),
    ).toBe(false)
  })

  it('validates workout completed optional fields', () => {
    expect(
      isStaffWorkoutsEmbedInboundEvent({
        type: STAFF_WORKOUTS_WORKOUT_COMPLETED,
        athleteProfileId: ATHLETE,
        withTrainer: true,
        workoutLogId: LOG,
      }),
    ).toBe(true)
    expect(
      isStaffWorkoutsEmbedInboundEvent({
        type: STAFF_WORKOUTS_WORKOUT_COMPLETED,
        athleteProfileId: ATHLETE,
        workoutLogId: 'bad',
      }),
    ).toBe(false)
  })

  it('validates outbound context and refresh events', () => {
    expect(
      isStaffWorkoutsEmbedOutboundEvent({
        type: STAFF_WORKOUTS_EMBED_CONTEXT,
        slotId: 'p2',
        athleteProfileId: ATHLETE,
      }),
    ).toBe(true)
    expect(
      isStaffWorkoutsEmbedOutboundEvent({
        type: STAFF_WORKOUTS_EMBED_CONTEXT,
        slotId: 'p3',
        athleteProfileId: ATHLETE,
      }),
    ).toBe(false)
  })
})
