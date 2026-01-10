/**
 * @fileoverview Hook React Query per gestione dati AI atleta
 * @description GET, UPDATE dati AI con validazione Zod
 * @module hooks/athlete-profile/use-athlete-ai-data
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { handleApiError } from '@/lib/error-handler'
import { createLogger } from '@/lib/logger'
import {
  createAthleteAIDataSchema,
  updateAthleteAIDataSchema,
} from '@/types/athlete-profile.schema'
import type { AthleteAIData, AthleteAIDataUpdate } from '@/types/athlete-profile'

const logger = createLogger('hooks:athlete-profile:use-athlete-ai-data')

/**
 * Query key factory per dati AI
 */
export const athleteAIDataKeys = {
  all: ['athlete-ai-data'] as const,
  detail: (athleteId: string) => [...athleteAIDataKeys.all, athleteId] as const,
}

/**
 * Hook per ottenere ultimi dati AI atleta
 * @param athleteId - UUID dell'atleta (user_id)
 * @note Restituisce l'ultimo record per data_analisi
 */
export function useAthleteAIData(athleteId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: athleteAIDataKeys.detail(athleteId || ''),
    queryFn: async (): Promise<AthleteAIData | null> => {
      if (!athleteId) {
        return null
      }

      try {
        // Ottieni l'ultimo record per data_analisi
        const { data, error } = await supabase
          .from('athlete_ai_data')
          .select('*')
          .eq('athlete_id', athleteId)
          .order('data_analisi', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) {
          throw error
        }

        if (!data) {
          return null
        }

        // Valida i dati con Zod
        const validated = createAthleteAIDataSchema.parse({
          id: data.id,
          athlete_id: data.athlete_id,
          data_analisi: data.data_analisi,
          insights_aggregati: data.insights_aggregati || {},
          raccomandazioni: data.raccomandazioni || [],
          pattern_rilevati: data.pattern_rilevati || [],
          predizioni_performance: data.predizioni_performance || [],
          score_engagement: data.score_engagement,
          score_progresso: data.score_progresso,
          fattori_rischio: data.fattori_rischio || [],
          note_ai: data.note_ai,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })

        return validated as AthleteAIData
      } catch (error) {
        const apiError = handleApiError(error, 'useAthleteAIData')
        logger.error('Errore nel caricamento dati AI', apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    enabled: !!athleteId,
    staleTime: 10 * 60 * 1000, // 10 minuti (dati AI meno dinamici - calcoli pesanti)
    gcTime: 60 * 60 * 1000, // 60 minuti (cacheTime in React Query v4) - cache lunga per dati costosi da calcolare
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati AI atleta
 * @param athleteId - UUID dell'atleta (user_id)
 * @note I dati AI vengono generalmente generati dal sistema, ma questo hook permette aggiornamenti manuali
 */
export function useUpdateAthleteAIData(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteAIDataUpdate): Promise<AthleteAIData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        const validated = updateAthleteAIDataSchema.parse(updates)

        // Prepara i dati per l'update (rimuove campi undefined)
        // NOTA: data_analisi è omessa da updateAthleteAIDataSchema, quindi non viene aggiornata
        const updateData: Record<string, unknown> = {}
        if (validated.insights_aggregati !== undefined)
          updateData.insights_aggregati = validated.insights_aggregati
        if (validated.raccomandazioni !== undefined)
          updateData.raccomandazioni = validated.raccomandazioni
        if (validated.pattern_rilevati !== undefined)
          updateData.pattern_rilevati = validated.pattern_rilevati
        if (validated.predizioni_performance !== undefined)
          updateData.predizioni_performance = validated.predizioni_performance
        if (validated.score_engagement !== undefined)
          updateData.score_engagement = validated.score_engagement
        if (validated.score_progresso !== undefined)
          updateData.score_progresso = validated.score_progresso
        if (validated.fattori_rischio !== undefined)
          updateData.fattori_rischio = validated.fattori_rischio
        if (validated.note_ai !== undefined) updateData.note_ai = validated.note_ai

        // Verifica se esiste già un record
        const { data: existing } = await supabase
          .from('athlete_ai_data')
          .select('id')
          .eq('athlete_id', athleteId)
          .order('data_analisi', { ascending: false })
          .limit(1)
          .maybeSingle()

        let result

        if (existing) {
          // Update ultimo record esistente
          const { data, error } = await supabase
            .from('athlete_ai_data')
            .update(updateData)
            .eq('id', existing.id)
            .select('*')
            .single()

          if (error) throw error
          result = data
        } else {
          // Insert nuovo record (con data_analisi corrente)
          // NOTA: data_analisi è omessa da updateAthleteAIDataSchema, quindi usiamo sempre quella corrente
          const insertData = {
            athlete_id: athleteId,
            data_analisi: new Date().toISOString(),
            ...updateData,
          }

          const { data, error } = await supabase
            .from('athlete_ai_data')
            .insert(insertData)
            .select('*')
            .single()

          if (error) throw error
          result = data
        }

        if (!result) {
          throw new Error('Dati non trovati dopo aggiornamento')
        }

        // Valida e ritorna i dati aggiornati
        const validatedResult = createAthleteAIDataSchema.parse({
          id: result.id,
          athlete_id: result.athlete_id,
          data_analisi: result.data_analisi,
          insights_aggregati: result.insights_aggregati || {},
          raccomandazioni: result.raccomandazioni || [],
          pattern_rilevati: result.pattern_rilevati || [],
          predizioni_performance: result.predizioni_performance || [],
          score_engagement: result.score_engagement,
          score_progresso: result.score_progresso,
          fattori_rischio: result.fattori_rischio || [],
          note_ai: result.note_ai,
          created_at: result.created_at,
          updated_at: result.updated_at,
        })

        return validatedResult as AthleteAIData
      } catch (error) {
        const apiError = handleApiError(error, 'useUpdateAthleteAIData')
        logger.error("Errore nell'aggiornamento dati AI", apiError, { athleteId })
        throw new Error(apiError.message)
      }
    },
    onMutate: async (updates) => {
      // Optimistic update
      if (!athleteId) return

      await queryClient.cancelQueries({ queryKey: athleteAIDataKeys.detail(athleteId) })

      const previousData = queryClient.getQueryData<AthleteAIData | null>(
        athleteAIDataKeys.detail(athleteId),
      )

      if (previousData) {
        queryClient.setQueryData<AthleteAIData>(athleteAIDataKeys.detail(athleteId), {
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
        queryClient.setQueryData(athleteAIDataKeys.detail(athleteId), context.previousData)
      }
      logger.error("Errore nell'aggiornamento dati AI", error, { athleteId })
    },
    onSuccess: () => {
      // Invalida cache
      if (athleteId) {
        queryClient.invalidateQueries({ queryKey: athleteAIDataKeys.detail(athleteId) })
        queryClient.invalidateQueries({ queryKey: ['athlete-profile-complete', athleteId] })
        queryClient.invalidateQueries({ queryKey: ['athlete-insights', athleteId] })
      }
    },
  })
}
