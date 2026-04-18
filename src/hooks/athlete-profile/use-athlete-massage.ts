/**
 * @fileoverview Hook React Query per gestione dati massaggi atleta
 * @description GET, UPDATE dati massaggi con validazione Zod
 * @module hooks/athlete-profile/use-athlete-massage
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
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
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per statistiche massaggi atleta (trattamenti e preferenze).
 * Usato dalla pagina /home/massaggiatore per le StatCard.
 */
export function useAthleteMassageStats(athleteId: string | null) {
  const query = useAthleteMassage(athleteId)
  const trattamenti = query.data?.storico_massaggi?.length ?? 0
  const preferenze = query.data?.preferenze_tipo_massaggio?.length ?? 0
  return {
    trattamenti,
    preferenze,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

/**
 * Hook per aggiornare dati massaggi atleta
 * @param athleteId - `profiles.user_id` o `profiles.id` (risolto da PATCH `/api/athlete-massage`)
 */
export function useUpdateAthleteMassage(athleteId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteMassageDataUpdate): Promise<AthleteMassageData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        const validated = updateAthleteMassageDataSchema.parse(updates)

        const res = await fetch('/api/athlete-massage', {
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
