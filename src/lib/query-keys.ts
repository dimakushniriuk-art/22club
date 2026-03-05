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
  },
  documents: {
    all: ['documents'] as const,
    byAthlete: (athleteId: string) => ['documents', athleteId] as const,
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
} as const
