'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'

const logger = createLogger('useAppointments')

// Cache in-memory per mapping userId -> profileId (evita lookup multipli)
// La cache persiste per tutta la sessione del modulo
const profileIdCache = new Map<string, string>()

/**
 * Ottiene profileId da userId con cache
 * Se userId è già profiles.id, lo ritorna direttamente
 * Se userId è user_id (auth.users.id), fa lookup e cache il risultato
 */
async function getProfileId(
  userId: string,
  client: ReturnType<typeof createClient>,
): Promise<string | null> {
  // Se già in cache, ritorna immediatamente
  if (profileIdCache.has(userId)) {
    const cached = profileIdCache.get(userId)!
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('[profiles] useAppointments → profileId da cache', {
        userId,
        profileId: cached,
        source: 'use-appointments',
      })
    }
    return cached
  }

  // Prima verifica se userId è già profiles.id
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('[profiles] useAppointments → query DB (lookup profile.id)', {
      userId,
      source: 'use-appointments',
      reason: 'cache miss - verifica se userId è già profile.id',
    })
  }

  const { data: profileCheck } = await client
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  // Tipizza esplicitamente per evitare problemi di inferenza TypeScript
  type ProfileSelect = { id: string } | null
  const typedProfileCheck = profileCheck as ProfileSelect

  if (typedProfileCheck?.id) {
    // userId è già profiles.id, cache e ritorna
    profileIdCache.set(userId, typedProfileCheck.id)
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('[profiles] useAppointments → userId è già profile.id', {
        userId,
        profileId: typedProfileCheck.id,
        source: 'use-appointments',
      })
    }
    return typedProfileCheck.id
  }

  // Se non trovato, potrebbe essere user_id, quindi facciamo lookup
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('[profiles] useAppointments → query DB (lookup user_id)', {
      userId,
      source: 'use-appointments',
      reason: 'userId non è profile.id, lookup per user_id',
    })
  }

  const { data: profileByUserId } = await client
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (profileByUserId?.id) {
    // Trovato per user_id, cache e ritorna
    profileIdCache.set(userId, profileByUserId.id)
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('[profiles] useAppointments → convertito user_id → profile.id', {
        userId,
        profileId: profileByUserId.id,
        source: 'use-appointments',
      })
    }
    return profileByUserId.id
  }

  // Non trovato né per id né per user_id
  logger.warn('Profilo non trovato né per id né per user_id', undefined, { userId })
  return null
}

interface Appointment {
  id: string
  org_id: string
  athlete_id: string
  trainer_id: string
  type: string
  status?: 'attivo' | 'completato' | 'annullato' | 'in_corso'
  starts_at: string
  ends_at: string
  location?: string
  notes?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
  athlete_name?: string
  trainer_name?: string
}

interface UseAppointmentsProps {
  userId?: string
  role?: string
}

export function useAppointments({ userId, role }: UseAppointmentsProps) {
  const queryClient = useQueryClient()

  // Query key basata su userId e role per cache separata
  const queryKey = userId
    ? queryKeys.appointments.byUser(`${userId}-${role || 'unknown'}`)
    : queryKeys.appointments.all

  // Fetch appointments con React Query
  const {
    data: appointments = [],
    isLoading: loading,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId) {
        return []
      }

      logger.debug('Fetching appointments', undefined, { userId, role })

      const client = createClient()

      // Ottieni profileId con cache (evita lookup multipli)
      let profileId: string | null = null

      if (userId) {
        profileId = await getProfileId(userId, client)

        if (!profileId) {
          logger.warn('Profilo non trovato né per id né per user_id', undefined, { userId, role })
          throw new Error('Profilo non trovato')
        }
      } else {
        throw new Error('UserId non fornito')
      }

      let query = client.from('appointments').select(`
          *,
          athlete:profiles!athlete_id(id, nome, cognome, first_name, last_name, email),
          trainer:profiles!trainer_id(id, nome, cognome, first_name, last_name, email),
          staff:profiles!staff_id(id, nome, cognome, first_name, last_name, email)
        `)

      if (role === 'atleta' || role === 'athlete') {
        // Atleti vedono solo i propri appuntamenti futuri
        query = query
          .eq('athlete_id', profileId)
          .gte('starts_at', new Date().toISOString())
          .is('cancelled_at', null)
      } else if (role === 'pt' || role === 'trainer' || role === 'admin') {
        // Staff vede tutti i propri appuntamenti (tramite staff_id o trainer_id)
        query = query.or(`staff_id.eq.${profileId},trainer_id.eq.${profileId}`)
      }

      const { data, error: fetchError } = await query.order('starts_at', {
        ascending: true,
      })

      if (fetchError) {
        logger.error('Errore query appointments', fetchError, {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
        })
        throw fetchError
      }

      // Trasforma i dati per includere i nomi
      const transformedData =
        data?.map((appointment) => {
          // Usa nome/cognome se disponibili, altrimenti first_name/last_name
          const athleteNome = appointment.athlete?.nome || appointment.athlete?.first_name || ''
          const athleteCognome =
            appointment.athlete?.cognome || appointment.athlete?.last_name || ''
          const trainerNome =
            appointment.trainer?.nome ||
            appointment.trainer?.first_name ||
            appointment.staff?.nome ||
            appointment.staff?.first_name ||
            ''
          const trainerCognome =
            appointment.trainer?.cognome ||
            appointment.trainer?.last_name ||
            appointment.staff?.cognome ||
            appointment.staff?.last_name ||
            ''

          return {
            ...appointment,
            athlete_name: `${athleteNome} ${athleteCognome}`.trim() || 'Atleta',
            trainer_name: `${trainerNome} ${trainerCognome}`.trim() || 'Trainer',
            updated_at: appointment.created_at,
            location: appointment.location || undefined,
            notes: appointment.notes || undefined,
            cancelled_at: appointment.cancelled_at || undefined,
          }
        }) || []

      logger.debug('Appointments fetched successfully', undefined, {
        count: transformedData.length,
        userId,
        role,
      })

      return transformedData
    },
    enabled: !!userId, // Query abilitata solo se userId è presente
  })

  // Converti error di React Query in string per compatibilità
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'Errore nel caricamento degli appuntamenti'
    : null

  // Realtime subscription per aggiornamenti automatici
  useRealtimeChannel('appointments', (payload) => {
    // Invalida query quando ci sono cambiamenti (INSERT, UPDATE, DELETE)
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    logger.debug('Realtime appointment event received', undefined, {
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old,
    })
  })

  // Mutation per creare appuntamento
  const createMutation = useMutation({
    mutationFn: async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
      const client = createClient()
      const { data, error: createError } = await client
        .from('appointments')
        .insert([appointmentData])
        .select()

      if (createError) {
        throw createError
      }

      return data?.[0]
    },
    onSuccess: () => {
      // Invalida tutte le query appointments per refresh automatico
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
    onError: (err) => {
      logger.error('Error creating appointment', err, {})
    },
  })

  const createAppointment = async (
    appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>,
  ) => {
    return createMutation.mutateAsync(appointmentData)
  }

  // Mutation per aggiornare appuntamento
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Appointment> }) => {
      const client = createClient()
      const { data, error: updateError } = await client
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()

      if (updateError) {
        throw updateError
      }

      return data?.[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
    onError: (err, variables) => {
      logger.error('Error updating appointment', err, { appointmentId: variables.id })
    },
  })

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    return updateMutation.mutateAsync({ id, updates })
  }

  // Mutation per cancellare appuntamento
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const client = createClient()
      const { data, error: cancelError } = await client
        .from('appointments')
        .update({ cancelled_at: new Date().toISOString() })
        .eq('id', id)
        .select()

      if (cancelError) {
        throw cancelError
      }

      return data?.[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
    onError: (err, id) => {
      logger.error('Error cancelling appointment', err, { appointmentId: id })
    },
  })

  const cancelAppointment = async (id: string) => {
    return cancelMutation.mutateAsync(id)
  }

  // Mutation per eliminare appuntamento
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const client = createClient()
      const { error: deleteError } = await client.from('appointments').delete().eq('id', id)

      if (deleteError) {
        throw deleteError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
    },
    onError: (err, id) => {
      logger.error('Error deleting appointment', err, { appointmentId: id })
    },
  })

  const deleteAppointment = async (id: string) => {
    return deleteMutation.mutateAsync(id)
  }

  const checkOverlap = async (
    trainerId: string,
    startsAt: string,
    endsAt: string,
    excludeId?: string,
  ) => {
    try {
      // Usa la RPC function check_appointment_overlap del database
      // La RPC verifica su staff_id (campo principale nel DB), quindi passiamo trainerId come p_staff_id
      // trainer_id e staff_id sono sempre la stessa cosa (sincronizzati dal trigger)
      const client = createClient() // Crea client locale
      const { data, error } = await client.rpc('check_appointment_overlap', {
        p_staff_id: trainerId, // trainerId corrisponde a staff_id nel database
        p_starts_at: startsAt,
        p_ends_at: endsAt,
        p_exclude_appointment_id: excludeId || null,
      })

      if (error) {
        throw error
      }

      // La RPC function ritorna un array con un oggetto contenente has_overlap
      const result = Array.isArray(data) && data.length > 0 ? data[0] : null
      return result?.has_overlap || false
    } catch (err) {
      logger.error('Error checking overlap', err, { trainerId, startsAt, endsAt, excludeId })
      return false
    }
  }

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    deleteAppointment,
    checkOverlap,
    refetch: async () => {
      await refetchQuery()
    },
  }
}
