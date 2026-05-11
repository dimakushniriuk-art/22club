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
  },
  documents: {
    all: ['documents'] as const,
    byAthlete: (athleteId: string) => ['documents', athleteId] as const,
    unifiedStaffByAthlete: (athleteId: string) =>
      ['documents', 'unified-staff', athleteId] as const,
  },
  allenamenti: {
    all: ['allenamenti'] as const,
    byAthlete: (athleteId: string) => ['allenamenti', athleteId] as const,
  },
  progressi: {
    all: ['progressi'] as const,
    byAthlete: (athleteId: string) => ['progressi', athleteId] as const,
  },
  clienti: {
    all: ['clienti'] as const,
    stats: ['clienti', 'stats'] as const,
  },
  payments: {
    all: ['payments'] as const,
    byAthlete: (athleteId: string) => ['payments', athleteId] as const,
  },
  /** RPC `get_my_trainer_profile` — cache condivisa tra /home/allenamenti, calendario atleta, ecc. */
  athlete: {
    myTrainerProfile: ['athlete', 'my-trainer-profile'] as const,
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
