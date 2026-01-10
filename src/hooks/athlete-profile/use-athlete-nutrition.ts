/**
 * @fileoverview Hook React Query per gestione dati nutrizionali atleta
 * @description GET, UPDATE dati nutrizionali con validazione Zod
 * @module hooks/athlete-profile/use-athlete-nutrition
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
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
  const supabase = createClient()

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
    staleTime: 5 * 60 * 1000, // 5 minuti - dati nutrizionali cambiano raramente
    gcTime: 30 * 60 * 1000, // 30 minuti (cacheTime in React Query v4) - mantieni in cache più a lungo
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati nutrizionali atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useUpdateAthleteNutrition(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteNutritionDataUpdate): Promise<AthleteNutritionData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        const validated = updateAthleteNutritionDataSchema.parse(updates)

        // Prepara i dati per l'update (rimuove campi undefined)
        const updateData: Record<string, unknown> = {}
        if (validated.obiettivo_nutrizionale !== undefined)
          updateData.obiettivo_nutrizionale = validated.obiettivo_nutrizionale
        if (validated.calorie_giornaliere_target !== undefined)
          updateData.calorie_giornaliere_target = validated.calorie_giornaliere_target
        if (validated.macronutrienti_target !== undefined)
          updateData.macronutrienti_target = validated.macronutrienti_target
        if (validated.dieta_seguita !== undefined)
          updateData.dieta_seguita = validated.dieta_seguita
        if (validated.intolleranze_alimentari !== undefined)
          updateData.intolleranze_alimentari = validated.intolleranze_alimentari
        if (validated.allergie_alimentari !== undefined)
          updateData.allergie_alimentari = validated.allergie_alimentari
        if (validated.alimenti_preferiti !== undefined)
          updateData.alimenti_preferiti = validated.alimenti_preferiti
        if (validated.alimenti_evitati !== undefined)
          updateData.alimenti_evitati = validated.alimenti_evitati
        if (validated.preferenze_orari_pasti !== undefined)
          updateData.preferenze_orari_pasti = validated.preferenze_orari_pasti
        if (validated.note_nutrizionali !== undefined)
          updateData.note_nutrizionali = validated.note_nutrizionali

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
          .from('athlete_nutrition_data')
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
            .from('athlete_nutrition_data')
            .update(updateData)
            .eq('athlete_id', athleteId)
            .select('*')
            .single()

          if (error) {
            logger.error('Errore update athlete_nutrition_data', error, {
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
            .from('athlete_nutrition_data')
            .insert({
              athlete_id: athleteId,
              ...updateData,
            })
            .select('*')
            .single()

          if (error) {
            logger.error('Errore insert athlete_nutrition_data', error, {
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
