/**
 * Baseline contratti route staff `/dashboard/*` (Fase 0 refactor performance).
 * Non cambiare valori senza aggiornare `tests/unit/staff-route-contracts.test.ts` e `Cervello/pages/dashboard.md`.
 */

import { queryKeys } from '@/lib/query-keys'
import {
  STAFF_APPOINTMENTS_INVALIDATE_EVENT,
  STAFF_CLIENTI_INVALIDATE_EVENT,
} from '@/lib/staff-cross-tab-events'
import {
  STAFF_WORKOUTS_SLOTS_CHANGED_EVENT,
  STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY,
  STAFF_WORKOUTS_SLOTS_SESSION_KEY,
} from '@/lib/embed/staff-workouts-slots-session'
import {
  STAFF_WORKOUTS_EMBED_AUTH_REQUIRED,
  STAFF_WORKOUTS_EMBED_CONTEXT,
  STAFF_WORKOUTS_EMBED_DIRTY,
  STAFF_WORKOUTS_EMBED_READY,
  STAFF_WORKOUTS_EMBED_REFRESH,
  STAFF_WORKOUTS_EMBED_SAVE_ERROR,
  STAFF_WORKOUTS_EMBED_SAVE_OK,
  STAFF_WORKOUTS_EMBED_SAVE_START,
  STAFF_WORKOUTS_WORKOUT_COMPLETED,
} from '@/lib/embed/staff-workouts-embed-events'
import { EMBED_ATHLETE_PATH_UPDATE } from '@/lib/embed/staff-workouts-embed-path'
import { FORM_DRAFT_PREFIX } from '@/lib/browser-form-draft'

/** Percorsi staff ispezionati nel piano refactor (param dinamici come segmenti). */
export const STAFF_DASHBOARD_ROUTE_PATHS = [
  '/dashboard',
  '/dashboard/profilo',
  '/dashboard/impostazioni',
  '/dashboard/notifiche',
  '/dashboard/appuntamenti',
  '/dashboard/workouts',
  '/dashboard/chat',
  '/dashboard/calendario',
  '/dashboard/calendario/impostazioni',
  '/dashboard/allenamenti',
  '/dashboard/prenotazioni/atleti/[id]',
  '/dashboard/clienti',
  '/dashboard/invita-atleta',
  '/dashboard/atleti/[id]',
  '/dashboard/schede',
  '/dashboard/schede/nuova',
  '/dashboard/schede/[id]/modifica',
  '/dashboard/esercizi',
  '/dashboard/abbonamenti',
  '/dashboard/pagamenti',
  '/dashboard/pagamenti/atleta/[athleteId]',
  '/dashboard/documenti',
  '/dashboard/comunicazioni',
  '/dashboard/comunicazioni/template',
  '/dashboard/database',
  '/dashboard/statistiche',
] as const

export type StaffDashboardRoutePath = (typeof STAFF_DASHBOARD_ROUTE_PATHS)[number]

/** Query string condivise o per-route (solo nomi param, non valori). */
export const STAFF_DASHBOARD_URL_PARAMS = {
  profilo: ['tab'] as const,
  impostazioni: ['tab'] as const,
  notifiche: [] as const,
  chat: ['with'] as const,
  calendario: ['day', 'q', 'athlete', 'type', 'status', 'new'] as const,
  allenamenti: ['search', 'stato', 'sort', 'periodo'] as const,
  clienti: ['new'] as const,
  invitaAtleta: ['search', 'stato', 'new'] as const,
  schedeNuova: ['athlete_id'] as const,
  documenti: ['atleta'] as const,
  abbonamenti: ['service', 'search'] as const,
  pagamentiAtleta: ['service'] as const,
  workouts: [
    'p1',
    'p2',
    'p1view',
    'p2view',
    'p1workoutPlanId',
    'p2workoutPlanId',
    'p1dayId',
    'p2dayId',
    'p1exerciseId',
    'p2exerciseId',
    'p1workoutLogId',
    'p2workoutLogId',
  ] as const,
} as const

export const STAFF_DASHBOARD_TAB_VALUES = {
  profilo: ['profilo', 'notifiche', 'impostazioni'] as const,
  impostazioni: ['profilo', 'notifiche', 'privacy', 'account', 'profilo-professionale'] as const,
} as const

export const STAFF_DASHBOARD_LOCAL_STORAGE_KEYS = {
  chatLastWith: 'chat-last-with',
  eserciziPageView: 'esercizi-page-view',
  eserciziPageSort: 'esercizi-page-sort',
} as const

export const STAFF_DASHBOARD_SESSION_STORAGE_KEYS = {
  workoutsSlots: STAFF_WORKOUTS_SLOTS_SESSION_KEY,
  workoutsFullQuery: STAFF_WORKOUTS_FULL_QUERY_SESSION_KEY,
} as const

export const STAFF_DASHBOARD_WINDOW_EVENTS = {
  appointmentsInvalidate: STAFF_APPOINTMENTS_INVALIDATE_EVENT,
  clientiInvalidate: STAFF_CLIENTI_INVALIDATE_EVENT,
  workoutsSlotsChanged: STAFF_WORKOUTS_SLOTS_CHANGED_EVENT,
} as const

/** Messaggi `postMessage` iframe workouts (stesso origin). */
export const STAFF_WORKOUTS_EMBED_POST_MESSAGE_TYPES = {
  inbound: [
    STAFF_WORKOUTS_EMBED_READY,
    EMBED_ATHLETE_PATH_UPDATE,
    STAFF_WORKOUTS_WORKOUT_COMPLETED,
    STAFF_WORKOUTS_EMBED_DIRTY,
    STAFF_WORKOUTS_EMBED_SAVE_START,
    STAFF_WORKOUTS_EMBED_SAVE_OK,
    STAFF_WORKOUTS_EMBED_SAVE_ERROR,
    STAFF_WORKOUTS_EMBED_AUTH_REQUIRED,
  ] as const,
  outbound: [STAFF_WORKOUTS_EMBED_CONTEXT, STAFF_WORKOUTS_EMBED_REFRESH] as const,
} as const

export const STAFF_SCHEDE_WIZARD_DRAFT_SCOPES = {
  nuova: 'nuova',
  editPrefix: 'edit-',
} as const

export const STAFF_COMUNICAZIONI_TEMPLATE_DRAFT = {
  formDraftPrefix: FORM_DRAFT_PREFIX,
  placeholderAthleteName: '{{athlete_name}}',
} as const

/** Prefissi `frequentQueryCache` usati da pagine staff (non React Query). */
export const STAFF_FREQUENT_QUERY_CACHE_PREFIXES = {
  abbonamenti: 'abbonamenti',
  invitations: 'invitations:',
} as const

/**
 * Invalidazione da `src/app/dashboard/layout.tsx` (realtime Supabase, throttle).
 * `postMutation` = helper in `post-mutation-cache.ts` da chiamare dopo mutazioni client.
 */
export const STAFF_DASHBOARD_LAYOUT_INVALIDATION = {
  appointments: {
    realtimeTable: 'appointments',
    throttleMs: 450,
    postMutation: 'invalidateAppointmentsQueries',
    queryKeyRoots: [queryKeys.appointments.all[0], queryKeys.appointments.staffToday('')[1]],
    windowEvent: STAFF_APPOINTMENTS_INVALIDATE_EVENT,
  },
  clientiProfiles: {
    realtimeTable: 'profiles',
    throttleMs: 600,
    postMutation: 'invalidateClientiQueries',
    queryKeyRoots: [queryKeys.clienti.all[0], queryKeys.clienti.stats[0]],
    windowEvent: STAFF_CLIENTI_INVALIDATE_EVENT,
    /** Evento definito ma non ancora emesso dal layout (solo invalidate RQ). */
    windowEventDispatchedFromLayout: false,
  },
  notifications: {
    realtimeTable: 'notifications',
    throttleMs: null,
    postMutation: null,
    queryKeyRoots: [] as const,
    windowEvent: null,
  },
} as const

export function isStaffDashboardRoutePath(path: string): path is StaffDashboardRoutePath {
  return (STAFF_DASHBOARD_ROUTE_PATHS as readonly string[]).includes(path)
}

export function workoutsPaneParamKey(
  slot: 'p1' | 'p2',
  field: 'view' | 'workoutPlanId' | 'dayId' | 'exerciseId' | 'workoutLogId',
): string {
  return `${slot}${field}`
}
