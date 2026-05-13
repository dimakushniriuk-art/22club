import { describe, expect, it } from 'vitest'
import {
  formatStaffAthleteDisplayName,
  staffAthleteProgressBasePath,
  staffAthleteProgressTabBackHref,
} from '@/features/staff-athlete-progress/staff-athlete-progress-paths'
import { athleteWorkoutsHubQueryEnabled } from '@/hooks/progressi/use-athlete-workouts-hub'
import { isCompletedStato } from '@/hooks/use-athlete-workout-history'
import { queryKeys } from '@/lib/query-keys'
import { shouldInvalidateQueryOnSessionResume } from '@/lib/session-stability/session-query-invalidation'

describe('staff athlete progress path helpers', () => {
  it('costruisce back href e base path sul profile id', () => {
    const profileId = 'profile-abc'
    expect(staffAthleteProgressTabBackHref(profileId)).toBe(
      '/dashboard/atleti/profile-abc?tab=progressi',
    )
    expect(staffAthleteProgressBasePath(profileId)).toBe('/dashboard/atleti/profile-abc/progressi')
  })

  it('formatta il nome atleta senza spazi superflui', () => {
    expect(formatStaffAthleteDisplayName({ nome: 'Mario', cognome: 'Rossi' })).toBe('Mario Rossi')
    expect(formatStaffAthleteDisplayName({ nome: 'Mario', cognome: null })).toBe('Mario')
    expect(formatStaffAthleteDisplayName({ nome: null, cognome: null })).toBe('')
  })
})

describe('athleteWorkoutsHubQueryEnabled', () => {
  const athleteId = 'athlete-1'

  it('disabilita il fetch hub senza profile id', () => {
    expect(athleteWorkoutsHubQueryEnabled('', 'overview', false)).toBe(false)
  })

  it('abilita il fetch hub su tab profilo embedded o senza hubSection', () => {
    expect(athleteWorkoutsHubQueryEnabled(athleteId, undefined, false)).toBe(true)
    expect(athleteWorkoutsHubQueryEnabled(athleteId, 'overview', true)).toBe(true)
  })

  it('disabilita il fetch hub sulla sottopagina completati', () => {
    expect(athleteWorkoutsHubQueryEnabled(athleteId, 'completati', false)).toBe(false)
  })

  it('mantiene il fetch hub sulle altre sottopagine storico', () => {
    expect(athleteWorkoutsHubQueryEnabled(athleteId, 'schede', false)).toBe(true)
    expect(athleteWorkoutsHubQueryEnabled(athleteId, 'sessioni-aperte', false)).toBe(true)
    expect(athleteWorkoutsHubQueryEnabled(athleteId, 'appuntamenti', false)).toBe(true)
    expect(athleteWorkoutsHubQueryEnabled(athleteId, 'overview', false)).toBe(true)
  })
})

describe('staff athlete progress query keys', () => {
  const profileId = 'profile-1'
  const userId = 'user-1'

  it('allinea profilo, analytics, stats allenamento, foto, hub e storico', () => {
    expect(queryKeys.athleteProfile.byId(profileId)).toEqual(['athlete-profile', profileId])
    expect(queryKeys.athleteProfile.stats(profileId, userId)).toEqual([
      'athlete-profile',
      profileId,
      'stats',
      userId,
    ])
    expect(queryKeys.progressi.analytics(userId)).toEqual(['progressi', 'analytics', userId])
    expect(queryKeys.progressi.workoutExerciseStats(profileId)).toEqual([
      'progressi',
      'workout-exercise-stats',
      profileId,
    ])
    expect(queryKeys.progressi.photos(profileId, 'front', 'all')).toEqual([
      'progressi',
      'photos',
      profileId,
      'front',
      'all',
    ])
    expect(queryKeys.progressi.workoutsHub(profileId)).toEqual([
      'progressi',
      'workouts-hub',
      profileId,
    ])
    expect(queryKeys.progressi.workoutHistory(profileId, '30d')).toEqual([
      'progressi',
      'workout-history',
      profileId,
      '30d',
    ])
  })

  it('invalida le famiglie progressi e athlete-profile al resume sessione', () => {
    expect(shouldInvalidateQueryOnSessionResume(queryKeys.progressi.workoutsHub(profileId))).toBe(
      true,
    )
    expect(
      shouldInvalidateQueryOnSessionResume(queryKeys.progressi.workoutHistory(profileId, 'all')),
    ).toBe(true)
    expect(shouldInvalidateQueryOnSessionResume(queryKeys.athleteProfile.byId(profileId))).toBe(
      true,
    )
  })
})

describe('isCompletedStato', () => {
  it('riconosce stati completati in italiano e inglese', () => {
    expect(isCompletedStato('completato')).toBe(true)
    expect(isCompletedStato('completed')).toBe(true)
    expect(isCompletedStato('COMPLETATO')).toBe(true)
  })

  it('esclude stati non completati o assenti', () => {
    expect(isCompletedStato('in_corso')).toBe(false)
    expect(isCompletedStato(null)).toBe(false)
    expect(isCompletedStato(undefined)).toBe(false)
  })
})
