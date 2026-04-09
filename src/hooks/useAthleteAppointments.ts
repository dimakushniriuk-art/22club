'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { normalizeAthleteAppointmentsQueryParams } from '@/lib/appointments/athlete-query-params'
import { isLikelyNetworkFetchFailure } from '@/lib/is-network-fetch-error'

const logger = createLogger('useAthleteAppointments')

const profileIdCache = new Map<string, string>()

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

export function useAthleteAppointments({ userId, role }: UseAppointmentsProps) {
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

      const client = supabase

      // Ottieni profileId con cache (evita lookup multipli)
      let profileId: string | null = null

      if (userId) {
        const row = await resolveProfileByIdentifier(client, userId, 'id', {
          profileIdCache,
        })
        profileId = row && typeof row.id === 'string' ? row.id : null

        if (!profileId) {
          logger.warn('Profilo non trovato né per id né per user_id', undefined, { userId, role })
          throw new Error('Profilo non trovato')
        }
      } else {
        throw new Error('UserId non fornito')
      }

      let query = client.from('appointments').select(`
          *,
          athlete:profiles!athlete_id(id, nome, cognome, first_name, last_name, email, avatar, avatar_url),
          trainer:profiles!trainer_id(id, nome, cognome, first_name, last_name, email),
          staff:profiles!staff_id(id, nome, cognome, first_name, last_name, email)
        `)

      const queryParams = normalizeAthleteAppointmentsQueryParams(role)

      if (queryParams.role === 'athlete') {
        // TODO(DB/RLS): la visibilità slot open booking resta autoritativa lato RLS.
        query = query.eq('athlete_id', profileId)
        if (!queryParams.includePastAppointments) {
          query = query.gte('starts_at', new Date().toISOString())
        }
        if (queryParams.excludeCancelledAppointments) {
          query = query.is('cancelled_at', null)
        }
      } else if (queryParams.role === 'trainer' || queryParams.role === 'admin') {
        // Viste staff: visibilità solo su staff_id (chiave operativa); trainer_id non amplia il set
        query = query.eq('staff_id', profileId)
      }

      const { data, error: fetchError } = await query.order('starts_at', {
        ascending: true,
      })

      if (fetchError) {
        if (isLikelyNetworkFetchFailure(fetchError)) {
          logger.warn('Query appointments: rete non disponibile o richiesta fallita', {
            message: fetchError.message,
            details: fetchError.details,
          })
        } else {
          logger.error('Errore query appointments', fetchError, {
            code: fetchError.code,
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
          })
        }
        throw fetchError
      }

      // Trasforma i dati per includere i nomi
      type AppointmentRow = {
        id: string
        starts_at: string
        ends_at: string
        type: string
        status?: string | null
        athlete_id?: string | null
        athlete?: {
          nome?: string
          first_name?: string
          cognome?: string
          last_name?: string
          avatar?: string | null
          avatar_url?: string | null
        }
        trainer?: { nome?: string; first_name?: string; cognome?: string; last_name?: string }
        staff?: { nome?: string; first_name?: string; cognome?: string; last_name?: string }
        created_at?: string
        location?: string | null
        notes?: string | null
        cancelled_at?: string | null
      }
      const transformedData =
        data?.map((appointment) => {
          const apt = appointment as AppointmentRow
          const athleteNome = apt.athlete?.nome || apt.athlete?.first_name || ''
          const athleteCognome = apt.athlete?.cognome || apt.athlete?.last_name || ''
          const trainerNome =
            apt.trainer?.nome ||
            apt.trainer?.first_name ||
            apt.staff?.nome ||
            apt.staff?.first_name ||
            ''
          const trainerCognome =
            apt.trainer?.cognome ||
            apt.trainer?.last_name ||
            apt.staff?.cognome ||
            apt.staff?.last_name ||
            ''

          return {
            ...apt,
            athlete_name: `${athleteNome} ${athleteCognome}`.trim() || 'Atleta',
            athlete_avatar_url: apt.athlete?.avatar_url ?? apt.athlete?.avatar ?? undefined,
            trainer_name: `${trainerNome} ${trainerCognome}`.trim() || 'Trainer',
            updated_at: apt.created_at,
            location: apt.location || undefined,
            notes: apt.notes || undefined,
            cancelled_at: apt.cancelled_at || undefined,
          }
        }) ?? []

      logger.debug('Appointments fetched successfully', undefined, {
        count: transformedData.length,
        userId,
        role,
      })

      return transformedData
    },
    enabled: !!userId, // Query abilitata solo se userId è presente
  })

  // Converti error di React Query in string per compatibilità (PostgREST: message + details)
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : typeof queryError === 'object' &&
          queryError !== null &&
          'message' in queryError &&
          typeof (queryError as { message: unknown }).message === 'string'
        ? (() => {
            const m = (queryError as { message: string }).message
            const d =
              'details' in queryError &&
              typeof (queryError as { details: unknown }).details === 'string'
                ? (queryError as { details: string }).details
                : ''
            const combined = [m, d].filter(Boolean).join(' ')
            return combined || 'Errore nel caricamento degli appuntamenti'
          })()
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
      const client = supabase
      type AppointmentInsert =
        import('@/lib/supabase/types').Database['public']['Tables']['appointments']['Insert']
      const { data, error: createError } = await client
        .from('appointments')
        .insert([appointmentData as AppointmentInsert])
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
      const client = supabase
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
      const client = supabase
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
      const client = supabase
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
      const client = supabase // Usa client stabile
      const { data, error } = await client.rpc('check_appointment_overlap', {
        p_staff_id: trainerId, // trainerId corrisponde a staff_id nel database
        p_starts_at: startsAt,
        p_ends_at: endsAt,
        p_exclude_appointment_id: excludeId ?? undefined,
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
