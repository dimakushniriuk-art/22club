/**
 * @fileoverview Hook React Query per gestione dati fitness atleta
 * @description GET, UPDATE dati fitness con validazione Zod
 * @module hooks/athlete-profile/use-athlete-fitness
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
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
  const supabase = createClient()

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
    staleTime: 5 * 60 * 1000, // 5 minuti - dati fitness cambiano raramente
    gcTime: 30 * 60 * 1000, // 30 minuti (cacheTime in React Query v4) - mantieni in cache più a lungo
    refetchOnWindowFocus: false, // Non refetch automatico quando si torna alla tab
    refetchOnMount: false, // Non refetch se dati sono ancora freschi (staleTime)
    retry: 1, // Riprova solo 1 volta in caso di errore
  })
}

/**
 * Hook per aggiornare dati fitness atleta
 * @param athleteId - UUID dell'atleta (user_id)
 */
export function useUpdateAthleteFitness(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: AthleteFitnessDataUpdate): Promise<AthleteFitnessData> => {
      if (!athleteId) {
        throw new Error('ID atleta non valido')
      }

      try {
        // Valida i dati con Zod
        const validated = updateAthleteFitnessDataSchema.parse(updates)

        // Prepara i dati per l'update (rimuove campi undefined)
        const updateData: Record<string, unknown> = {}
        if (validated.livello_esperienza !== undefined)
          updateData.livello_esperienza = validated.livello_esperienza
        if (validated.obiettivo_primario !== undefined)
          updateData.obiettivo_primario = validated.obiettivo_primario
        if (validated.obiettivi_secondari !== undefined)
          updateData.obiettivi_secondari = validated.obiettivi_secondari
        if (validated.giorni_settimana_allenamento !== undefined)
          updateData.giorni_settimana_allenamento = validated.giorni_settimana_allenamento
        if (validated.durata_sessione_minuti !== undefined)
          updateData.durata_sessione_minuti = validated.durata_sessione_minuti
        if (validated.preferenze_orario !== undefined)
          updateData.preferenze_orario = validated.preferenze_orario
        if (validated.attivita_precedenti !== undefined)
          updateData.attivita_precedenti = validated.attivita_precedenti
        if (validated.infortuni_pregressi !== undefined)
          updateData.infortuni_pregressi = validated.infortuni_pregressi
        if (validated.zone_problematiche !== undefined)
          updateData.zone_problematiche = validated.zone_problematiche
        if (validated.note_fitness !== undefined) updateData.note_fitness = validated.note_fitness

        // Verifica se esiste già un record
        const { data: existing } = await supabase
          .from('athlete_fitness_data')
          .select('id')
          .eq('athlete_id', athleteId)
          .single()

        let result

        if (existing) {
          // Update esistente
          const { data, error } = await supabase
            .from('athlete_fitness_data')
            .update(updateData)
            .eq('athlete_id', athleteId)
            .select('*')
            .single()

          if (error) throw error
          result = data
        } else {
          // Insert nuovo record
          const { data, error } = await supabase
            .from('athlete_fitness_data')
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
