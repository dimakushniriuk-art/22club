// ============================================================
// Hook per prefetch tab profilo atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient as createSupabaseClient } from '@/lib/supabase'
import { athleteAnagraficaKeys } from '@/hooks/athlete-profile/use-athlete-anagrafica'
import { athleteMedicalKeys } from '@/hooks/athlete-profile/use-athlete-medical'
import { athleteFitnessKeys } from '@/hooks/athlete-profile/use-athlete-fitness'
import { athleteMotivationalKeys } from '@/hooks/athlete-profile/use-athlete-motivational'
import { athleteNutritionKeys } from '@/hooks/athlete-profile/use-athlete-nutrition'
import { athleteMassageKeys } from '@/hooks/athlete-profile/use-athlete-massage'
import { athleteAdministrativeKeys } from '@/hooks/athlete-profile/use-athlete-administrative'
import { athleteSmartTrackingKeys } from '@/hooks/athlete-profile/use-athlete-smart-tracking'
import { athleteAIDataKeys } from '@/hooks/athlete-profile/use-athlete-ai-data'

export function useAthleteTabPrefetch(athleteUserId: string | null) {
  const queryClient = useQueryClient()

  const handlePrefetchTab = useCallback(
    (tabName: string) => {
      if (!athleteUserId) return

      const supabaseClient = createSupabaseClient()

      // Mappa ogni tab al suo query key e query function
      const tabPrefetchMap: Record<
        string,
        { queryKey: readonly unknown[]; queryFn: () => Promise<unknown> }
      > = {
        anagrafica: {
          queryKey: athleteAnagraficaKeys.detail(athleteUserId),
          queryFn: async () => {
            const { data, error } = await supabaseClient
              .from('profiles')
              .select(
                'user_id, nome, cognome, email, phone, telefono, data_nascita, sesso, codice_fiscale, indirizzo, citta, cap, provincia, nazione, contatto_emergenza_nome, contatto_emergenza_telefono, contatto_emergenza_relazione, professione, altezza_cm, peso_iniziale_kg, gruppo_sanguigno, created_at, updated_at',
              )
              .eq('user_id', athleteUserId)
              .single()
            if (error) throw error
            return data
          },
        },
        medica: {
          queryKey: athleteMedicalKeys.detail(athleteUserId),
          queryFn: async () => {
            const { data, error } = await supabaseClient
              .from('athlete_medical_data')
              .select('*')
              .eq('athlete_id', athleteUserId)
              .single()
            if (error && error.code !== 'PGRST116') throw error
            return data
          },
        },
        fitness: {
          queryKey: athleteFitnessKeys.detail(athleteUserId),
          queryFn: async () => {
            const { data, error } = await supabaseClient
              .from('athlete_fitness_data')
              .select('*')
              .eq('athlete_id', athleteUserId)
              .single()
            if (error && error.code !== 'PGRST116') throw error
            return data
          },
        },
        motivazionale: {
          queryKey: athleteMotivationalKeys.detail(athleteUserId),
          queryFn: async () => {
            const { data, error } = await supabaseClient
              .from('athlete_motivational_data')
              .select('*')
              .eq('athlete_id', athleteUserId)
              .single()
            if (error && error.code !== 'PGRST116') throw error
            return data
          },
        },
        nutrizione: {
          queryKey: athleteNutritionKeys.detail(athleteUserId),
          queryFn: async () => {
            const { data, error } = await supabaseClient
              .from('athlete_nutrition_data')
              .select('*')
              .eq('athlete_id', athleteUserId)
              .single()
            if (error && error.code !== 'PGRST116') throw error
            return data
          },
        },
        massaggio: {
          queryKey: athleteMassageKeys.detail(athleteUserId),
          queryFn: async () => {
            const { data, error } = await supabaseClient
              .from('athlete_massage_data')
              .select('*')
              .eq('athlete_id', athleteUserId)
              .single()
            if (error && error.code !== 'PGRST116') throw error
            return data
          },
        },
        amministrativo: {
          queryKey: athleteAdministrativeKeys.detail(athleteUserId),
          queryFn: async () => {
            const { data, error } = await supabaseClient
              .from('athlete_administrative_data')
              .select('*')
              .eq('athlete_id', athleteUserId)
              .single()
            if (error && error.code !== 'PGRST116') throw error
            return data
          },
        },
        'smart-tracking': {
          queryKey: athleteSmartTrackingKeys.detail(athleteUserId),
          queryFn: async () => {
            const { data, error } = await supabaseClient
              .from('athlete_smart_tracking_data')
              .select('*')
              .eq('athlete_id', athleteUserId)
              .order('data_rilevazione', { ascending: false })
              .limit(1)
              .maybeSingle()
            if (error) throw error
            return data
          },
        },
        'ai-data': {
          queryKey: athleteAIDataKeys.detail(athleteUserId),
          queryFn: async () => {
            const { data, error } = await supabaseClient
              .from('athlete_ai_data')
              .select('*')
              .eq('athlete_id', athleteUserId)
              .order('data_analisi', { ascending: false })
              .limit(1)
              .maybeSingle()
            if (error) throw error
            return data
          },
        },
      }

      const prefetchConfig = tabPrefetchMap[tabName]
      if (prefetchConfig) {
        queryClient.prefetchQuery({
          queryKey: prefetchConfig.queryKey,
          queryFn: prefetchConfig.queryFn,
          staleTime: 5 * 60 * 1000, // 5 minuti (stesso dei hook)
        })
      }
    },
    [athleteUserId, queryClient],
  )

  return { handlePrefetchTab }
}
