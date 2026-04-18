/**
 * @fileoverview Hook React Query per gestione dati motivazionali atleta
 * @description GET, UPDATE dati motivazionali con validazione Zod
 * @module hooks/athlete-profile/use-athlete-motivational
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
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
          .maybeSingle()

        if (error) {
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
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati motivazionali atleta
 * @param athleteId - `profiles.user_id` o `profiles.id` (risolto da PATCH `/api/athlete-motivational`)
 */
export function useUpdateAthleteMotivational(athleteId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      updates: AthleteMotivationalDataUpdate,
    ): Promise<AthleteMotivationalData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        const validated = updateAthleteMotivationalDataSchema.parse(updates)

        const res = await fetch('/api/athlete-motivational', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            athleteUserId: athleteId,
            updates: validated,
          }),
        })

        const payload = (await res.json().catch(() => null)) as {
          data?: unknown
          error?: string
        } | null

        if (!res.ok) {
          const msg =
            payload && typeof payload === 'object' && 'error' in payload && payload.error
              ? String(payload.error)
              : `HTTP ${res.status}`
          throw new Error(msg)
        }

        if (!payload || typeof payload !== 'object' || !('data' in payload) || !payload.data) {
          throw new Error('Risposta API non valida')
        }

        const result = payload.data as Record<string, unknown>

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
