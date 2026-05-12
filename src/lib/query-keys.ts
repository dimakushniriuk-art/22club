/**
 * Centralized Query Keys for React Query
 *
 * Standard pattern: [resource, ...params]
 *
 * Usage:
 * - queryKeys.appointments.all
 * - queryKeys.appointments.byUser(userId)
 * - queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
 */
export const queryKeys = {
  appointments: {
    all: ['appointments'] as const,
    byUser: (userId: string) => ['appointments', userId] as const,
    byDate: (userId: string, date: string) => ['appointments', userId, date] as const,
    /** Agenda “oggi” staff dashboard (profilo effettivo = profiles.id); invalidata da `invalidateAppointmentsQueries`. */
    staffToday: (staffProfileId: string) =>
      ['appointments', 'staff-today', staffProfileId] as const,
    staffTable: (staffProfileId: string) =>
      ['appointments', 'staff-table', staffProfileId] as const,
    staffFormAthletes: ['appointments', 'staff-form-athletes'] as const,
  },
  documents: {
    all: ['documents'] as const,
    byAthlete: (athleteId: string) => ['documents', athleteId] as const,
    unifiedStaffByAthlete: (athleteId: string) =>
      ['documents', 'unified-staff', athleteId] as const,
    /** Lista unificata atleta (`getAllAthleteDocuments`) — /home/documenti */
    unifiedAthlete: (profileId: string, userId: string) =>
      ['documents', 'unified-athlete', profileId, userId] as const,
  },
  allenamenti: {
    all: ['allenamenti'] as const,
    byAthlete: (athleteId: string) => ['allenamenti', athleteId] as const,
    plans: (profileId: string, subjectProfileId: string) =>
      ['allenamenti', 'plans', profileId, subjectProfileId] as const,
    dayPreview: (profileId: string, planId: string, dayId: string) =>
      ['allenamenti', 'day-preview', profileId, planId, dayId] as const,
    planDetail: (profileId: string, planId: string) =>
      ['allenamenti', 'plan-detail', profileId, planId] as const,
    summary: (profileId: string, workoutLogId: string) =>
      ['allenamenti', 'summary', profileId, workoutLogId] as const,
    catalogExercise: (exerciseId: string) =>
      ['allenamenti', 'catalog-exercise', exerciseId] as const,
  },
  progressi: {
    all: ['progressi'] as const,
    byAthlete: (athleteId: string) => ['progressi', athleteId] as const,
    analytics: (athleteId: string) => ['progressi', 'analytics', athleteId] as const,
    workoutExerciseStats: (athleteId: string) =>
      ['progressi', 'workout-exercise-stats', athleteId] as const,
    photos: (athleteId: string, angle: string, dateFilter: string) =>
      ['progressi', 'photos', athleteId, angle, dateFilter] as const,
    workoutHistory: (athleteId: string, period: string) =>
      ['progressi', 'workout-history', athleteId, period] as const,
    workoutsHub: (athleteId: string) => ['progressi', 'workouts-hub', athleteId] as const,
  },
  clienti: {
    all: ['clienti'] as const,
    stats: ['clienti', 'stats'] as const,
    massaggiatoreStaffList: (staffProfileId: string) =>
      ['clienti', 'massaggiatore-list', staffProfileId] as const,
    massaggiatoreStaffDetail: (staffProfileId: string, athleteProfileId: string) =>
      ['clienti', 'massaggiatore-detail', staffProfileId, athleteProfileId] as const,
    nutrizionistaStaffList: (staffProfileId: string) =>
      ['clienti', 'nutrizionista-list', staffProfileId] as const,
  },
  payments: {
    all: ['payments'] as const,
    byAthlete: (athleteId: string) => ['payments', athleteId] as const,
    /** Lista aggregata staff `/dashboard/abbonamenti` (service, pagina, ruolo). */
    abbonamentiStaffList: (
      serviceType: string,
      page: number,
      enablePagination: boolean,
      role: string | null,
      profileId: string | null,
    ) =>
      ['payments', 'abbonamenti-staff-list', serviceType, page, enablePagination, role, profileId] as const,
    /** Dettaglio pagamenti/crediti atleta staff (`?service=`). */
    staffAthletePage: (athleteId: string, serviceType: string) =>
      ['payments', 'staff-athlete-page', athleteId, serviceType] as const,
  },
  /** RPC `get_my_trainer_profile` — cache condivisa tra /home/allenamenti, calendario atleta, ecc. */
  athlete: {
    myTrainerProfile: ['athlete', 'my-trainer-profile'] as const,
    statoCliente: (profileId: string) => ['athlete', 'stato-cliente', profileId] as const,
    welcomeProfile: (userId: string) => ['welcome', 'profile', userId] as const,
    welcomeQuestionnaire: (athleteId: string, version: string) =>
      ['welcome', 'questionnaire', athleteId, version] as const,
  },
  /** Profilo staff `/dashboard/atleti/[id]` + sottopagine progressi (`useAthleteProfileData`). */
  athleteProfile: {
    all: ['athlete-profile'] as const,
    byId: (athleteId: string) => ['athlete-profile', athleteId] as const,
    stats: (athleteId: string, athleteUserId: string) =>
      ['athlete-profile', athleteId, 'stats', athleteUserId] as const,
  },
  inviti: {
    pendingAthlete: (profileId: string) => ['inviti', 'athlete-pending', profileId] as const,
  },
  chat: {
    unreadReceiver: (scope: string, profileId: string) =>
      ['chat', 'unread', scope, profileId] as const,
    staffUnreadPreview: (profileId: string) =>
      ['chat', 'staff-unread-preview', profileId] as const,
  },
  notifications: {
    staffList: (userId: string) => ['notifications', 'staff-list', userId] as const,
  },
  communications: {
    staffList: (
      statusKey: string,
      type: string | undefined,
      limit: number | undefined,
      offset: number | undefined,
    ) => ['communications', 'staff-list', statusKey, type ?? '', limit ?? '', offset ?? ''] as const,
  },
  dashboard: {
    widgets: (staffProfileId: string) => ['dashboard', 'widgets', staffProfileId] as const,
    massaggiatoreStats: (staffProfileId: string) =>
      ['dashboard', 'massaggiatore-stats', staffProfileId] as const,
    nutrizionistaStats: (staffProfileId: string) =>
      ['dashboard', 'nutrizionista-stats', staffProfileId] as const,
  },
  admin: {
    dashboardStats: ['admin', 'dashboard-stats'] as const,
    usersList: ['admin', 'users-list'] as const,
    rolesList: ['admin', 'roles-list'] as const,
    statistics: ['admin', 'statistics'] as const,
  },
  staff: {
    ptProfile: (authUserId: string) => ['staff', 'pt-profile', authUserId] as const,
  },
  userSettings: {
    byAuthUser: (authUserId: string) => ['user-settings', authUserId] as const,
  },
  exercises: {
    staffList: ['exercises', 'staff-list'] as const,
  },
  statistics: {
    legacy: (orgId: string | null, rangeDays: number) =>
      ['statistics', 'legacy', orgId ?? '', rangeDays] as const,
    trainerOptions: (orgId: string) => ['statistics', 'trainer-options', orgId] as const,
    trainerReport: (
      orgId: string,
      trainerIdsKey: string,
      startIso: string,
      endIso: string,
    ) => ['statistics', 'trainer-report', orgId, trainerIdsKey, startIso, endIso] as const,
  },
  nutrition: {
    settingsBootstrap: (staffProfileId: string) =>
      ['nutrition', 'settings-bootstrap', staffProfileId] as const,
    settingsPlanVersions: (planId: string) =>
      ['nutrition', 'settings-plan-versions', planId] as const,
    settingsVersionConfig: (versionId: string) =>
      ['nutrition', 'settings-version-config', versionId] as const,
    checkinsList: (staffProfileId: string) =>
      ['nutrition', 'checkins-list', staffProfileId] as const,
    checkinDetail: (checkinId: string) => ['nutrition', 'checkin-detail', checkinId] as const,
    weeklyAnalysis: (staffProfileId: string) =>
      ['nutrition', 'weekly-analysis', staffProfileId] as const,
    documentsList: (staffProfileId: string) =>
      ['nutrition', 'documents-list', staffProfileId] as const,
    progressOverview: (staffProfileId: string) =>
      ['nutrition', 'progress-overview', staffProfileId] as const,
    plansList: (staffProfileId: string) => ['nutrition', 'plans-list', staffProfileId] as const,
  },
  marketing: {
    all: ['marketing'] as const,
    kpi: ['marketing', 'kpi'] as const,
    analytics: ['marketing', 'analytics'] as const,
    athletes: ['marketing', 'athletes'] as const,
    leads: ['marketing', 'leads'] as const,
    lead: (leadId: string) => ['marketing', 'lead', leadId] as const,
    automation: (automationId: string) => ['marketing', 'automation', automationId] as const,
    campaigns: ['marketing', 'campaigns'] as const,
    campaign: (campaignId: string) => ['marketing', 'campaign', campaignId] as const,
    segments: ['marketing', 'segments'] as const,
    segment: (segmentId: string) => ['marketing', 'segment', segmentId] as const,
    automations: ['marketing', 'automations'] as const,
    automationSegments: ['marketing', 'automation-segments'] as const,
  },
  prenotazioni: {
    athletePage: (athleteId: string) => ['prenotazioni', 'athlete-page', athleteId] as const,
  },
  /**
   * Prefissi React Query con `refetchOnWindowFocus` via `setQueryDefaults` (solo query leggere).
   */
  lightWindowFocus: {
    clientiStats: ['clienti', 'stats'] as const,
    athleteAiData: ['athlete-ai-data'] as const,
    athleteAnagrafica: ['athlete-anagrafica'] as const,
    /** Liste pagamenti staff: staleness dopo alt-tab breve. */
    paymentsLists: ['payments'] as const,
  },
} as const
