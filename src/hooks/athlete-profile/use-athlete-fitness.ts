/**
 * @fileoverview Hook React Query per gestione dati fitness atleta
 * @description GET, UPDATE dati fitness con validazione Zod
 * @module hooks/athlete-profile/use-athlete-fitness
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import {
  createAthleteFitnessDataSchema,
  updateAthleteFitnessDataSchema,
} from '@/types/athlete-profile.schema'
import type { AthleteFitnessData, AthleteFitnessDataUpdate } from '@/types/athlete-profile'

const logger = createLogger('hooks:athlete-profile:use-athlete-fitness')

/**
 * Query key factory per dati fitness
 */
export const athleteFitnessKeys = {
  all: ['athlete-fitness'] as const,
  detail: (athleteId: string) => [...athleteFitnessKeys.all, athleteId] as const,
}

/**
 * Hook per ottenere dati fitness atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useAthleteFitness(athleteId: string | null) {
  return useQuery({
    queryKey: athleteFitnessKeys.detail(athleteId || ''),
    queryFn: async (): Promise<AthleteFitnessData | null> => {
      if (!athleteId) {
        return null
      }

      try {
        const { data, error } = await supabase
          .from('athlete_fitness_data')
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
        const validated = createAthleteFitnessDataSchema.parse({
          id: data.id,
          athlete_id: data.athlete_id,
          livello_esperienza: data.livello_esperienza,
          obiettivo_primario: data.obiettivo_primario,
          obiettivi_secondari: data.obiettivi_secondari || [],
          giorni_settimana_allenamento: data.giorni_settimana_allenamento,
          durata_sessione_minuti: data.durata_sessione_minuti,
          preferenze_orario: data.preferenze_orario || [],
          attivita_precedenti: data.attivita_precedenti || [],
          infortuni_pregressi: data.infortuni_pregressi || [],
          zone_problematiche: data.zone_problematiche || [],
          note_fitness: data.note_fitness,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteFitnessData
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteFitness')
        logger.error('Errore nel caricamento dati fitness', apiError, { athleteId })
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
 * Hook per aggiornare dati fitness atleta
 * @param athleteId - `profiles.user_id` o `profiles.id` (risolto da PATCH `/api/athlete-fitness`)
 */
export function useUpdateAthleteFitness(athleteId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteFitnessDataUpdate): Promise<AthleteFitnessData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        const validated = updateAthleteFitnessDataSchema.parse(updates)

        const res = await fetch('/api/athlete-fitness', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            athleteUserId: athleteId,
            updates: validated,
          }),
        })

        const payload = (await res.json().catch(() => null)) as
          | { data?: unknown; error?: string }
          | null

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

        const validatedResult = createAthleteFitnessDataSchema.parse({
          id: result.id,
          athlete_id: result.athlete_id,
          livello_esperienza: result.livello_esperienza,
          obiettivo_primario: result.obiettivo_primario,
          obiettivi_secondari: result.obiettivi_secondari || [],
          giorni_settimana_allenamento: result.giorni_settimana_allenamento,
          durata_sessione_minuti: result.durata_sessione_minuti,
          preferenze_orario: result.preferenze_orario || [],
          attivita_precedenti: result.attivita_precedenti || [],
          infortuni_pregressi: result.infortuni_pregressi || [],
          zone_problematiche: result.zone_problematiche || [],
          note_fitness: result.note_fitness,
          created_at: result.created_at,
          updated_at: result.updated_at,
        })

        return validatedResult as AthleteFitnessData
      } catch (error) {
        const apiError = handleApiError(error, 'useUpdateAthleteFitness')
        logger.error("Errore nell'aggiornamento dati fitness", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onMutate: async (updates) => {
      // Optimistic update
      if (!athleteId) return

      await queryClient.cancelQueries({ queryKey: athleteFitnessKeys.detail(athleteId) })

      const previousData = queryClient.getQueryData<AthleteFitnessData | null>(
        athleteFitnessKeys.detail(athleteId),
      )

      if (previousData) {
        queryClient.setQueryData<AthleteFitnessData>(athleteFitnessKeys.detail(athleteId), {
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
        queryClient.setQueryData(athleteFitnessKeys.detail(athleteId), context.previousData)
      }
      logger.error("Errore nell'aggiornamento dati fitness", error, { athleteId })
    },
    onSuccess: () => {
      // Invalida cache
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteFitnessKeys.detail(athleteId) })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}
