/**
 * @fileoverview Hook React Query per gestione dati smart tracking atleta
 * @description GET, UPDATE dati smart tracking con validazione Zod
 * @module hooks/athlete-profile/use-athlete-smart-tracking
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import {
  createAthleteSmartTrackingDataSchema,
  updateAthleteSmartTrackingDataSchema,
} from '@/types/athlete-profile.schema'
import type {
  AthleteSmartTrackingData,
  AthleteSmartTrackingDataUpdate,
} from '@/types/athlete-profile'

const logger = createLogger('hooks:athlete-profile:use-athlete-smart-tracking')

/**
 * Query key factory per dati smart tracking
 */
export const athleteSmartTrackingKeys = {
  all: ['athlete-smart-tracking'] as const,
  detail: (athleteId: string) => [...athleteSmartTrackingKeys.all, athleteId] as const,
  byDate: (athleteId: string, date: string) =>
    [...athleteSmartTrackingKeys.detail(athleteId), 'date', date] as const,
}

/**
 * Hook per ottenere ultimi dati smart tracking atleta
 * @param athleteId - UUID dell'atleta (user_id)
 * @note Restituisce l'ultimo record per data_rilevazione
 */
export function useAthleteSmartTracking(athleteId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: athleteSmartTrackingKeys.detail(athleteId || ''),
    queryFn: async (): Promise<AthleteSmartTrackingData | null> => {
      if (!athleteId) {
        return null
      }

      try {
        // Ottieni l'ultimo record per data_rilevazione
        const { data, error } = await supabase
          .from('athlete_smart_tracking_data')
          .select('*')
          .eq('athlete_id', athleteId)
          .order('data_rilevazione', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) {
          throw error
        }

        if (!data) {
          return null
        }

        // Valida i dati con Zod
        const validated = createAthleteSmartTrackingDataSchema.parse({
          id: data.id,
          athlete_id: data.athlete_id,
          data_rilevazione: data.data_rilevazione,
          dispositivo_tipo: data.dispositivo_tipo,
          dispositivo_marca: data.dispositivo_marca,
          passi_giornalieri: data.passi_giornalieri,
          calorie_bruciate: data.calorie_bruciate,
          distanza_percorsa_km: data.distanza_percorsa_km,
          battito_cardiaco_medio: data.battito_cardiaco_medio,
          battito_cardiaco_max: data.battito_cardiaco_max,
          battito_cardiaco_min: data.battito_cardiaco_min,
          ore_sonno: data.ore_sonno,
          qualita_sonno: data.qualita_sonno,
          attivita_minuti: data.attivita_minuti,
          metrica_custom: data.metrica_custom || {},
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteSmartTrackingData
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteSmartTracking')
        logger.error('Errore nel caricamento dati smart tracking', apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    enabled: !!athleteId,
    staleTime: 2 * 60 * 1000, // 2 minuti (dati più dinamici - tracking wearable)
    gcTime: 15 * 60 * 1000, // 15 minuti (cacheTime in React Query v4) - cache più breve per dati dinamici
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per ottenere dati smart tracking per una data specifica
 * @param athleteId - UUID dell'atleta (user_id)
 * @param date - Data in formato ISO string (YYYY-MM-DD)
 */
export function useAthleteSmartTrackingByDate(athleteId: string | null, date: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: athleteSmartTrackingKeys.byDate(athleteId || '', date || ''),
    queryFn: async (): Promise<AthleteSmartTrackingData | null> => {
      if (!athleteId || !date) {
        return null
      }

      try {
        const { data, error } = await supabase
          .from('athlete_smart_tracking_data')
          .select('*')
          .eq('athlete_id', athleteId)
          .eq('data_rilevazione', date)
          .maybeSingle()

        if (error) {
          throw error
        }

        if (!data) {
          return null
        }

        // Valida i dati con Zod
        const validated = createAthleteSmartTrackingDataSchema.parse({
          id: data.id,
          athlete_id: data.athlete_id,
          data_rilevazione: data.data_rilevazione,
          dispositivo_tipo: data.dispositivo_tipo,
          dispositivo_marca: data.dispositivo_marca,
          passi_giornalieri: data.passi_giornalieri,
          calorie_bruciate: data.calorie_bruciate,
          distanza_percorsa_km: data.distanza_percorsa_km,
          battito_cardiaco_medio: data.battito_cardiaco_medio,
          battito_cardiaco_max: data.battito_cardiaco_max,
          battito_cardiaco_min: data.battito_cardiaco_min,
          ore_sonno: data.ore_sonno,
          qualita_sonno: data.qualita_sonno,
          attivita_minuti: data.attivita_minuti,
          metrica_custom: data.metrica_custom || {},
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteSmartTrackingData
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteSmartTrackingByDate')
        logger.error('Errore nel caricamento dati smart tracking per data', apiError, {
          athleteId,
          date,
        })
        throw new Error(apiError.message)
      }
    },
    enabled: !!athleteId && !!date,
    staleTime: 5 * 60 * 1000, // 5 minuti (dati storici per data specifica)
    gcTime: 15 * 60 * 1000, // 15 minuti (cacheTime in React Query v4) - cache più breve per dati dinamici
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare o inserire dati smart tracking atleta
 * @param athleteId - UUID dell'atleta (user_id)
 * @note Se esiste già un record per la data_rilevazione, viene aggiornato, altrimenti viene creato
 */
export function useUpdateAthleteSmartTracking(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      updates: AthleteSmartTrackingDataUpdate & { data_rilevazione: string },
    ): Promise<AthleteSmartTrackingData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        // Prima valida gli update (senza data_rilevazione)
        const validatedUpdates = updateAthleteSmartTrackingDataSchema.parse(updates)

        // Poi valida data_rilevazione separatamente (richiesta per upsert)
        if (!updates.data_rilevazione) {
          throw new Error('data_rilevazione è obbligatoria per aggiornare i dati smart tracking')
        }

        // Crea oggetto completo per validazione finale
        const fullData = {
          athlete_id: athleteId,
          data_rilevazione: updates.data_rilevazione,
          ...validatedUpdates,
        }
        const validated = createAthleteSmartTrackingDataSchema.parse(fullData)

        // Prepara i dati per l'update/insert (rimuove campi undefined)
        const updateData: Record<string, unknown> = {}
        if (validated.data_rilevazione !== undefined)
          updateData.data_rilevazione = validated.data_rilevazione
        if (validated.dispositivo_tipo !== undefined)
          updateData.dispositivo_tipo = validated.dispositivo_tipo
        if (validated.dispositivo_marca !== undefined)
          updateData.dispositivo_marca = validated.dispositivo_marca
        if (validated.passi_giornalieri !== undefined)
          updateData.passi_giornalieri = validated.passi_giornalieri
        if (validated.calorie_bruciate !== undefined)
          updateData.calorie_bruciate = validated.calorie_bruciate
        if (validated.distanza_percorsa_km !== undefined)
          updateData.distanza_percorsa_km = validated.distanza_percorsa_km
        if (validated.battito_cardiaco_medio !== undefined)
          updateData.battito_cardiaco_medio = validated.battito_cardiaco_medio
        if (validated.battito_cardiaco_max !== undefined)
          updateData.battito_cardiaco_max = validated.battito_cardiaco_max
        if (validated.battito_cardiaco_min !== undefined)
          updateData.battito_cardiaco_min = validated.battito_cardiaco_min
        if (validated.ore_sonno !== undefined) updateData.ore_sonno = validated.ore_sonno
        if (validated.qualita_sonno !== undefined)
          updateData.qualita_sonno = validated.qualita_sonno
        if (validated.attivita_minuti !== undefined)
          updateData.attivita_minuti = validated.attivita_minuti
        if (validated.metrica_custom !== undefined)
          updateData.metrica_custom = validated.metrica_custom

        // Verifica se esiste già un record per questa data
        const { data: existing } = await supabase
          .from('athlete_smart_tracking_data')
          .select('id')
          .eq('athlete_id', athleteId)
          .eq('data_rilevazione', validated.data_rilevazione)
          .maybeSingle()

        let result

        if (existing) {
          // Update esistente
          const { data, error } = await supabase
            .from('athlete_smart_tracking_data')
            .update(updateData)
            .eq('athlete_id', athleteId)
            .eq('data_rilevazione', validated.data_rilevazione)
            .select('*')
            .single()

          if (error) throw error
          result = data
        } else {
          // Insert nuovo record
          const { data, error } = await supabase
            .from('athlete_smart_tracking_data')
            .insert({
              athlete_id: athleteId,
              ...updateData,
            })
            .select('*')
            .single()

          if (error) throw error
          result = data
        }

        if (!result) {
          throw new Error('Dati non trovati dopo aggiornamento')
        }

        // Valida e ritorna i dati aggiornati
        const validatedResult = createAthleteSmartTrackingDataSchema.parse({
          id: result.id,
          athlete_id: result.athlete_id,
          data_rilevazione: result.data_rilevazione,
          dispositivo_tipo: result.dispositivo_tipo,
          dispositivo_marca: result.dispositivo_marca,
          passi_giornalieri: result.passi_giornalieri,
          calorie_bruciate: result.calorie_bruciate,
          distanza_percorsa_km: result.distanza_percorsa_km,
          battito_cardiaco_medio: result.battito_cardiaco_medio,
          battito_cardiaco_max: result.battito_cardiaco_max,
          battito_cardiaco_min: result.battito_cardiaco_min,
          ore_sonno: result.ore_sonno,
          qualita_sonno: result.qualita_sonno,
          attivita_minuti: result.attivita_minuti,
          metrica_custom: result.metrica_custom || {},
          created_at: result.created_at,
          updated_at: result.updated_at,
        })

        return validatedResult as AthleteSmartTrackingData
      } catch (error) {
        const apiError = handleApiError(error, 'useUpdateAthleteSmartTracking')
        logger.error("Errore nell'aggiornamento dati smart tracking", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onMutate: async (updates) => {
      // Optimistic update
      if (!athleteId) return

      await queryClient.cancelQueries({ queryKey: athleteSmartTrackingKeys.detail(athleteId) })

      const previousData = queryClient.getQueryData<AthleteSmartTrackingData | null>(
        athleteSmartTrackingKeys.detail(athleteId),
      )

      if (previousData && updates.data_rilevazione) {
        queryClient.setQueryData<AthleteSmartTrackingData>(
          athleteSmartTrackingKeys.detail(athleteId),
          {
            ...previousData,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        )

        // Aggiorna anche la cache per la data specifica se presente
        queryClient.setQueryData<AthleteSmartTrackingData>(
          athleteSmartTrackingKeys.byDate(athleteId, updates.data_rilevazione),
          {
            ...previousData,
            ...updates,
            updated_at: new Date().toISOString(),
          },
        )
      }

      return { previousData }
    },
    onError: (error, _updates, context) => {
      // Rollback in caso di errore
      if (context?.previousData && athleteId) {
        queryClient.setQueryData(athleteSmartTrackingKeys.detail(athleteId), context.previousData)
      }
      logger.error("Errore nell'aggiornamento dati smart tracking", error, { athleteId })
    },
    onSuccess: (_data, updates) => {
      // Invalida cache
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteSmartTrackingKeys.detail(athleteId) })
        if (updates.data_rilevazione) {
          queryClient.invalidateQueries({
            queryKey: athleteSmartTrackingKeys.byDate(athleteId, updates.data_rilevazione),
          })
        }
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}
