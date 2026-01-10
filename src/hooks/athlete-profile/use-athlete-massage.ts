/**
 * @fileoverview Hook React Query per gestione dati massaggi atleta
 * @description GET, UPDATE dati massaggi con validazione Zod
 * @module hooks/athlete-profile/use-athlete-massage
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import {
  createAthleteMassageDataSchema,
  updateAthleteMassageDataSchema,
} from '@/types/athlete-profile.schema'
import type { AthleteMassageData, AthleteMassageDataUpdate } from '@/types/athlete-profile'

const logger = createLogger('hooks:athlete-profile:use-athlete-massage')

/**
 * Query key factory per dati massaggi
 */
export const athleteMassageKeys = {
  all: ['athlete-massage'] as const,
  detail: (athleteId: string) => [...athleteMassageKeys.all, athleteId] as const,
}

/**
 * Hook per ottenere dati massaggi atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useAthleteMassage(athleteId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: athleteMassageKeys.detail(athleteId || ''),
    queryFn: async (): Promise<AthleteMassageData | null> => {
      if (!athleteId) {
        return null
      }

      try {
        const { data, error } = await supabase
          .from('athlete_massage_data')
          .select('*')
          .eq('athlete_id', athleteId)
          .single()

        if (error) {
          // Se non esiste record, ritorna null (non è un errore)
          if (error.code === 'PGRST116') {
            return null
          }
          throw error
        }

        if (!data) {
          return null
        }

        // Valida i dati con Zod
        const validated = createAthleteMassageDataSchema.parse({
          id: data.id,
          athlete_id: data.athlete_id,
          preferenze_tipo_massaggio: data.preferenze_tipo_massaggio || [],
          zone_problematiche: data.zone_problematiche || [],
          intensita_preferita: data.intensita_preferita,
          allergie_prodotti: data.allergie_prodotti || [],
          note_terapeutiche: data.note_terapeutiche,
          storico_massaggi: data.storico_massaggi || [],
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteMassageData
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteMassage')
        logger.error('Errore nel caricamento dati massaggi', apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    enabled: !!athleteId,
    staleTime: 5 * 60 * 1000, // 5 minuti - dati massaggi cambiano raramente
    gcTime: 30 * 60 * 1000, // 30 minuti (cacheTime in React Query v4) - mantieni in cache più a lungo
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati massaggi atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useUpdateAthleteMassage(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteMassageDataUpdate): Promise<AthleteMassageData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        const validated = updateAthleteMassageDataSchema.parse(updates)

        // Prepara i dati per l'update (rimuove campi undefined)
        const updateData: Record<string, unknown> = {}
        if (validated.preferenze_tipo_massaggio !== undefined)
          updateData.preferenze_tipo_massaggio = validated.preferenze_tipo_massaggio
        if (validated.zone_problematiche !== undefined)
          updateData.zone_problematiche = validated.zone_problematiche
        if (validated.intensita_preferita !== undefined)
          updateData.intensita_preferita = validated.intensita_preferita
        if (validated.allergie_prodotti !== undefined)
          updateData.allergie_prodotti = validated.allergie_prodotti
        if (validated.note_terapeutiche !== undefined)
          updateData.note_terapeutiche = validated.note_terapeutiche
        if (validated.storico_massaggi !== undefined)
          updateData.storico_massaggi = validated.storico_massaggi

        // Verifica che athleteId sia un user_id valido (non profile.id)
        // Controlla se esiste un profile con questo user_id
        const { data: profileCheck, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_id')
          .eq('user_id', athleteId)
          .maybeSingle()

        if (profileError) {
          logger.warn('Errore verifica profile', profileError, { athleteId })
        }

        if (!profileCheck) {
          logger.error('Profile non trovato per user_id', undefined, { athleteId })
          throw new Error(`Profile non trovato per user_id: ${athleteId}`)
        }

        logger.debug('Profile verificato', undefined, {
          athleteId,
          profileId: profileCheck.id,
          profileUserId: profileCheck.user_id,
        })

        // Verifica se esiste già un record
        const { data: existing, error: existingError } = await supabase
          .from('athlete_massage_data')
          .select('id')
          .eq('athlete_id', athleteId)
          .maybeSingle()

        if (existingError && existingError.code !== 'PGRST116') {
          logger.warn('Errore verifica record esistente', existingError, { athleteId })
        }

        let result

        if (existing) {
          // Update esistente
          logger.debug('Aggiornamento record esistente', undefined, {
            athleteId,
            existingId: existing.id,
          })
          const { data, error } = await supabase
            .from('athlete_massage_data')
            .update(updateData)
            .eq('athlete_id', athleteId)
            .select('*')
            .single()

          if (error) {
            logger.error('Errore update athlete_massage_data', error, {
              athleteId,
              updateData,
              errorCode: error.code,
              errorMessage: error.message,
            })
            throw error
          }
          result = data
        } else {
          // Insert nuovo record
          logger.debug('Inserimento nuovo record', undefined, { athleteId, updateData })
          const { data, error } = await supabase
            .from('athlete_massage_data')
            .insert({
              athlete_id: athleteId,
              ...updateData,
            })
            .select('*')
            .single()

          if (error) {
            logger.error('Errore insert athlete_massage_data', error, {
              athleteId,
              updateData,
              errorCode: error.code,
              errorMessage: error.message,
              errorDetails: error.details,
              errorHint: error.hint,
            })
            throw error
          }
          result = data
        }

        if (!result) {
          throw new Error('Dati non trovati dopo aggiornamento')
        }

        // Valida e ritorna i dati aggiornati
        const validatedResult = createAthleteMassageDataSchema.parse({
          id: result.id,
          athlete_id: result.athlete_id,
          preferenze_tipo_massaggio: result.preferenze_tipo_massaggio || [],
          zone_problematiche: result.zone_problematiche || [],
          intensita_preferita: result.intensita_preferita,
          allergie_prodotti: result.allergie_prodotti || [],
          note_terapeutiche: result.note_terapeutiche,
          storico_massaggi: result.storico_massaggi || [],
          created_at: result.created_at,
          updated_at: result.updated_at,
        })

        return validatedResult as AthleteMassageData
      } catch (error) {
        const apiError = handleApiError(error, 'useUpdateAthleteMassage')
        logger.error("Errore nell'aggiornamento dati massaggi", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onMutate: async (updates) => {
      // Optimistic update
      if (!athleteId) return

      await queryClient.cancelQueries({ queryKey: athleteMassageKeys.detail(athleteId) })

      const previousData = queryClient.getQueryData<AthleteMassageData | null>(
        athleteMassageKeys.detail(athleteId),
      )

      if (previousData) {
        queryClient.setQueryData<AthleteMassageData>(athleteMassageKeys.detail(athleteId), {
          ...previousData,
          ...updates,
          updated_at: new Date().toISOString(),
        })
      }

      return { previousData }
    },
    onError: (error, _updates, context) => {
      // Rollback in caso di errore
      if (context?.previousData && athleteId) {
        queryClient.setQueryData(athleteMassageKeys.detail(athleteId), context.previousData)
      }
      logger.error("Errore nell'aggiornamento dati massaggi", error, { athleteId })
    },
    onSuccess: () => {
      // Invalida cache
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteMassageKeys.detail(athleteId) })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}
