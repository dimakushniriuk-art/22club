/**
 * @fileoverview Hook React Query per gestione dati nutrizionali atleta
 * @description GET, UPDATE dati nutrizionali con validazione Zod
 * @module hooks/athlete-profile/use-athlete-nutrition
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import {
  createAthleteNutritionDataSchema,
  updateAthleteNutritionDataSchema,
} from '@/types/athlete-profile.schema'
import type { AthleteNutritionData, AthleteNutritionDataUpdate } from '@/types/athlete-profile'

const logger = createLogger('hooks:athlete-profile:use-athlete-nutrition')

/**
 * Query key factory per dati nutrizionali
 */
export const athleteNutritionKeys = {
  all: ['athlete-nutrition'] as const,
  detail: (athleteId: string) => [...athleteNutritionKeys.all, athleteId] as const,
}

/**
 * Hook per ottenere dati nutrizionali atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useAthleteNutrition(athleteId: string | null) {
  return useQuery({
    queryKey: athleteNutritionKeys.detail(athleteId || ''),
    queryFn: async (): Promise<AthleteNutritionData | null> => {
      if (!athleteId) {
        return null
      }

      try {
        const { data, error } = await supabase
          .from('athlete_nutrition_data')
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
        const validated = createAthleteNutritionDataSchema.parse({
          id: data.id,
          athlete_id: data.athlete_id,
          obiettivo_nutrizionale: data.obiettivo_nutrizionale,
          calorie_giornaliere_target: data.calorie_giornaliere_target,
          macronutrienti_target: data.macronutrienti_target || {
            proteine_g: null,
            carboidrati_g: null,
            grassi_g: null,
          },
          dieta_seguita: data.dieta_seguita,
          intolleranze_alimentari: data.intolleranze_alimentari || [],
          allergie_alimentari: data.allergie_alimentari || [],
          alimenti_preferiti: data.alimenti_preferiti || [],
          alimenti_evitati: data.alimenti_evitati || [],
          preferenze_orari_pasti: data.preferenze_orari_pasti || {
            colazione: null,
            pranzo: null,
            cena: null,
            spuntini: [],
          },
          note_nutrizionali: data.note_nutrizionali,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteNutritionData
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteNutrition')
        logger.error('Errore nel caricamento dati nutrizionali', apiError, { athleteId })
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
 * Hook per aggiornare dati nutrizionali atleta
 * @param athleteId - `profiles.user_id` o `profiles.id` (risolto da PATCH `/api/athlete-nutrition`)
 */
export function useUpdateAthleteNutrition(athleteId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteNutritionDataUpdate): Promise<AthleteNutritionData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        const validated = updateAthleteNutritionDataSchema.parse(updates)

        const res = await fetch('/api/athlete-nutrition', {
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

        const validatedResult = createAthleteNutritionDataSchema.parse({
          id: result.id,
          athlete_id: result.athlete_id,
          obiettivo_nutrizionale: result.obiettivo_nutrizionale,
          calorie_giornaliere_target: result.calorie_giornaliere_target,
          macronutrienti_target: result.macronutrienti_target || {
            proteine_g: null,
            carboidrati_g: null,
            grassi_g: null,
          },
          dieta_seguita: result.dieta_seguita,
          intolleranze_alimentari: result.intolleranze_alimentari || [],
          allergie_alimentari: result.allergie_alimentari || [],
          alimenti_preferiti: result.alimenti_preferiti || [],
          alimenti_evitati: result.alimenti_evitati || [],
          preferenze_orari_pasti: result.preferenze_orari_pasti || {
            colazione: null,
            pranzo: null,
            cena: null,
            spuntini: [],
          },
          note_nutrizionali: result.note_nutrizionali,
          created_at: result.created_at,
          updated_at: result.updated_at,
        })

        return validatedResult as AthleteNutritionData
      } catch (error) {
        const apiError = handleApiError(error, 'useUpdateAthleteNutrition')
        logger.error("Errore nell'aggiornamento dati nutrizionali", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onMutate: async (updates) => {
      // Optimistic update
      if (!athleteId) return

      await queryClient.cancelQueries({ queryKey: athleteNutritionKeys.detail(athleteId) })

      const previousData = queryClient.getQueryData<AthleteNutritionData | null>(
        athleteNutritionKeys.detail(athleteId),
      )

      if (previousData) {
        queryClient.setQueryData<AthleteNutritionData>(athleteNutritionKeys.detail(athleteId), {
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
        queryClient.setQueryData(athleteNutritionKeys.detail(athleteId), context.previousData)
      }
      logger.error("Errore nell'aggiornamento dati nutrizionali", error, { athleteId })
    },
    onSuccess: () => {
      // Invalida cache
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteNutritionKeys.detail(athleteId) })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
      }
    },
  })
}
