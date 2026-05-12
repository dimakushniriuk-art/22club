import { describe, expect, it } from 'vitest'
import {
  STAFF_COMUNICAZIONI_TEMPLATE_DRAFT,
  STAFF_DASHBOARD_LAYOUT_INVALIDATION,
  STAFF_DASHBOARD_LOCAL_STORAGE_KEYS,
  STAFF_DASHBOARD_ROUTE_PATHS,
  STAFF_DASHBOARD_SESSION_STORAGE_KEYS,
  STAFF_DASHBOARD_TAB_VALUES,
  STAFF_DASHBOARD_URL_PARAMS,
  STAFF_DASHBOARD_WINDOW_EVENTS,
  STAFF_FREQUENT_QUERY_CACHE_PREFIXES,
  STAFF_SCHEDE_WIZARD_DRAFT_SCOPES,
  STAFF_WORKOUTS_EMBED_POST_MESSAGE_TYPES,
  isStaffDashboardRoutePath,
  workoutsPaneParamKey,
} from '@/lib/dashboard/staff-route-contracts'
import {
  STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY,
  STAFF_WORKOUTS_SLOTS_SESSION_KEY,
} from '@/lib/embed/staff-workouts-slots-session'
import {
  STAFF_APPOINTMENTS_INVALIDATE_EVENT,
  STAFF_CLIENTI_INVALIDATE_EVENT,
} from '@/lib/staff-cross-tab-events'

describe('staff dashboard route contracts (Fase 0)', () => {
  it('espone 26 percorsi staff nel piano refactor', () => {
    expect(STAFF_DASHBOARD_ROUTE_PATHS).toHaveLength(26)
    expect(isStaffDashboardRoutePath('/dashboard/workouts')).toBe(true)
    expect(isStaffDashboardRoutePath('/dashboard/unknown')).toBe(false)
  })

  it('mantiene chiavi sessionStorage workouts allineate al modulo embed', () => {
    expect(STAFF_DASHBOARD_SESSION_STORAGE_KEYS.workoutsSlots).toBe(STAFF_WORKOUTS_SLOTS_SESSION_KEY)
    expect(STAFF_DASHBOARD_SESSION_STORAGE_KEYS.workoutsFullQuery).toBe(
      STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY,
    )
    expect(STAFF_DASHBOARD_SESSION_STORAGE_KEYS.workoutsSlots).toBe(
      '22club:staff-workouts-embed-slots-v1',
    )
  })

  it('mantiene eventi cross-tab layout', () => {
    expect(STAFF_DASHBOARD_WINDOW_EVENTS.appointmentsInvalidate).toBe(
      STAFF_APPOINTMENTS_INVALIDATE_EVENT,
    )
    expect(STAFF_DASHBOARD_WINDOW_EVENTS.clientiInvalidate).toBe(STAFF_CLIENTI_INVALIDATE_EVENT)
  })

  it('documenta parametri URL workouts per slot', () => {
    expect(workoutsPaneParamKey('p1', 'workoutPlanId')).toBe('p1workoutPlanId')
    expect(STAFF_DASHBOARD_URL_PARAMS.workouts).toContain('p1')
    expect(STAFF_DASHBOARD_URL_PARAMS.workouts).toContain('p2workoutLogId')
  })

  it('mantiene tab profilo e impostazioni', () => {
    expect(STAFF_DASHBOARD_TAB_VALUES.profilo).toEqual(['profilo', 'notifiche', 'impostazioni'])
    expect(STAFF_DASHBOARD_TAB_VALUES.impostazioni).toContain('profilo-professionale')
  })

  it('mantiene localStorage chat ed esercizi', () => {
    expect(STAFF_DASHBOARD_LOCAL_STORAGE_KEYS.chatLastWith).toBe('chat-last-with')
    expect(STAFF_DASHBOARD_LOCAL_STORAGE_KEYS.eserciziPageView).toBe('esercizi-page-view')
  })

  it('elenca tipi postMessage embed workouts', () => {
    expect(STAFF_WORKOUTS_EMBED_POST_MESSAGE_TYPES.inbound).toContain(
      '22club:staff-workouts-embed-ready',
    )
    expect(STAFF_WORKOUTS_EMBED_POST_MESSAGE_TYPES.outbound).toContain(
      '22club:staff-workouts-embed-context',
    )
  })

  it('documenta draft schede e template comunicazioni', () => {
    expect(STAFF_SCHEDE_WIZARD_DRAFT_SCOPES.nuova).toBe('nuova')
    expect(STAFF_SCHEDE_WIZARD_DRAFT_SCOPES.editPrefix).toBe('edit-')
    expect(STAFF_COMUNICAZIONI_TEMPLATE_DRAFT.placeholderAthleteName).toBe('{{athlete_name}}')
    expect(STAFF_COMUNICAZIONI_TEMPLATE_DRAFT.formDraftPrefix).toBe('22club-form-draft:v1:')
  })

  it('mappa invalidazione layout appointments e clienti', () => {
    expect(STAFF_DASHBOARD_LAYOUT_INVALIDATION.appointments.postMutation).toBe(
      'invalidateAppointmentsQueries',
    )
    expect(STAFF_DASHBOARD_LAYOUT_INVALIDATION.clientiProfiles.postMutation).toBe(
      'invalidateClientiQueries',
    )
    expect(STAFF_DASHBOARD_LAYOUT_INVALIDATION.clientiProfiles.windowEventDispatchedFromLayout).toBe(
      false,
    )
  })

  it('documenta prefissi frequentQueryCache staff', () => {
    expect(STAFF_FREQUENT_QUERY_CACHE_PREFIXES.abbonamenti).toBe('abbonamenti')
    expect(STAFF_FREQUENT_QUERY_CACHE_PREFIXES.invitations).toBe('invitations:')
  })
})
