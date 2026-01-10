/**
 * @fileoverview Hook React Query per gestione dati motivazionali atleta
 * @description GET, UPDATE dati motivazionali con validazione Zod
 * @module hooks/athlete-profile/use-athlete-motivational
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import {
  createAthleteMotivationalDataSchema,
  updateAthleteMotivationalDataSchema,
} from '@/types/athlete-profile.schema'
import type {
  AthleteMotivationalData,
  AthleteMotivationalDataUpdate,
} from '@/types/athlete-profile'

const logger = createLogger('hooks:athlete-profile:use-athlete-motivational')

/**
 * Query key factory per dati motivazionali
 */
export const athleteMotivationalKeys = {
  all: ['athlete-motivational'] as const,
  detail: (athleteId: string) => [...athleteMotivationalKeys.all, athleteId] as const,
}

/**
 * Hook per ottenere dati motivazionali atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useAthleteMotivational(athleteId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: athleteMotivationalKeys.detail(athleteId || ''),
    queryFn: async (): Promise<AthleteMotivationalData | null> => {
      if (!athleteId) {
        return null
      }

      try {
        const { data, error } = await supabase
          .from('athlete_motivational_data')
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
        const validated = createAthleteMotivationalDataSchema.parse({
          id: data.id,
          athlete_id: data.athlete_id,
          motivazione_principale: data.motivazione_principale,
          motivazioni_secondarie: data.motivazioni_secondarie || [],
          ostacoli_percepiti: data.ostacoli_percepiti || [],
          preferenze_ambiente: data.preferenze_ambiente || [],
          preferenze_compagnia: data.preferenze_compagnia || [],
          livello_motivazione: data.livello_motivazione,
          storico_abbandoni: data.storico_abbandoni || [],
          note_motivazionali: data.note_motivazionali,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteMotivationalData
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteMotivational')
        logger.error('Errore nel caricamento dati motivazionali', apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    enabled: !!athleteId,
    staleTime: 5 * 60 * 1000, // 5 minuti - dati motivazionali cambiano raramente
    gcTime: 30 * 60 * 1000, // 30 minuti (cacheTime in React Query v4) - mantieni in cache più a lungo
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati motivazionali atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useUpdateAthleteMotivational(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      updates: AthleteMotivationalDataUpdate,
    ): Promise<AthleteMotivationalData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        const validated = updateAthleteMotivationalDataSchema.parse(updates)

        // Prepara i dati per l'update (rimuove campi undefined)
        const updateData: Record<string, unknown> = {}
        if (validated.motivazione_principale !== undefined)
          updateData.motivazione_principale = validated.motivazione_principale
        if (validated.motivazioni_secondarie !== undefined)
          updateData.motivazioni_secondarie = validated.motivazioni_secondarie
        if (validated.ostacoli_percepiti !== undefined)
          updateData.ostacoli_percepiti = validated.ostacoli_percepiti
        if (validated.preferenze_ambiente !== undefined)
          updateData.preferenze_ambiente = validated.preferenze_ambiente
        if (validated.preferenze_compagnia !== undefined)
          updateData.preferenze_compagnia = validated.preferenze_compagnia
        if (validated.livello_motivazione !== undefined)
          updateData.livello_motivazione = validated.livello_motivazione
        if (validated.storico_abbandoni !== undefined)
          updateData.storico_abbandoni = validated.storico_abbandoni
        if (validated.note_motivazionali !== undefined)
          updateData.note_motivazionali = validated.note_motivazionali

        // Verifica se esiste già un record
        const { data: existing } = await supabase
          .from('athlete_motivational_data')
          .select('id')
          .eq('athlete_id', athleteId)
          .single()

        let result

        if (existing) {
          // Update esistente
          const { data, error } = await supabase
            .from('athlete_motivational_data')
            .update(updateData)
            .eq('athlete_id', athleteId)
            .select('*')
            .single()

          if (error) throw error
          result = data
        } else {
          // Insert nuovo record
          const { data, error } = await supabase
            .from('athlete_motivational_data')
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
        const validatedResult = createAthleteMotivationalDataSchema.parse({
          id: result.id,
          athlete_id: result.athlete_id,
          motivazione_principale: result.motivazione_principale,
          motivazioni_secondarie: result.motivazioni_secondarie || [],
          ostacoli_percepiti: result.ostacoli_percepiti || [],
          preferenze_ambiente: result.preferenze_ambiente || [],
          preferenze_compagnia: result.preferenze_compagnia || [],
          livello_motivazione: result.livello_motivazione,
          storico_abbandoni: result.storico_abbandoni || [],
          note_motivazionali: result.note_motivazionali,
          created_at: result.created_at,
          updated_at: result.updated_at,
        })

        return validatedResult as AthleteMotivationalData
      } catch (error) {
        const apiError = handleApiError(error, 'useUpdateAthleteMotivational')
        logger.error("Errore nell'aggiornamento dati motivazionali", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onMutate: async (updates) => {
      // Optimistic update
      if (!athleteId) return

      await queryClient.cancelQueries({ queryKey: athleteMotivationalKeys.detail(athleteId) })

      const previousData = queryClient.getQueryData<AthleteMotivationalData | null>(
        athleteMotivationalKeys.detail(athleteId),
      )

      if (previousData) {
        queryClient.setQueryData<AthleteMotivationalData>(
          athleteMotivationalKeys.detail(athleteId),
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
        queryClient.setQueryData(athleteMotivationalKeys.detail(athleteId), context.previousData)
      }
      logger.error("Errore nell'aggiornamento dati motivazionali", error, { athleteId })
    },
    onSuccess: () => {
      // Invalida cache
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteMotivationalKeys.detail(athleteId) })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}
