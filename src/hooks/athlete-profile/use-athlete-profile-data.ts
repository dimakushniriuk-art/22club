// ============================================================
// Hook per gestione dati profilo atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
// Nota: createSupabaseClient potrebbe essere usato in futuro per client alternativi
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClient as createSupabaseClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import type { Cliente } from '@/types/cliente'

const logger = createLogger('hooks:athlete-profile:use-athlete-profile-data')

interface AthleteStats {
  allenamenti_totali: number
  allenamenti_mese: number
  schede_attive: number
  documenti_scadenza: number
  ultimo_accesso: string | null
  peso_attuale: number | null
}

export function useAthleteProfileData(athleteId: string) {
  const supabase = useMemo(() => createClient(), [])
  // Nota: queryClient potrebbe essere usato in futuro per invalidazione cache
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const queryClient = useQueryClient()

  const [athlete, setAthlete] = useState<Cliente | null>(null)
  const [stats, setStats] = useState<AthleteStats>({
    allenamenti_totali: 0,
    allenamenti_mese: 0,
    schede_attive: 0,
    documenti_scadenza: 0,
    ultimo_accesso: null,
    peso_attuale: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [athleteUserId, setAthleteUserId] = useState<string | null>(null)

  const loadAthleteData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Carica profilo atleta (include user_id per i componenti del profilo)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, user_id')
        .eq('id', athleteId)
        .eq('role', 'atleta')
        .single()

      if (profileError) {
        // Prova con 'athlete' se 'atleta' fallisce
        const { data: profile2, error: profileError2 } = await supabase
          .from('profiles')
          .select('*, user_id')
          .eq('id', athleteId)
          .in('role', ['atleta', 'athlete'])
          .single()

        if (profileError2) {
          throw profileError2
        }

        const cliente: Cliente = {
          id: profile2.id,
          nome: profile2.nome || '',
          cognome: profile2.cognome || '',
          first_name: profile2.first_name || profile2.nome || '',
          last_name: profile2.last_name || profile2.cognome || '',
          email: profile2.email || '',
          phone: profile2.phone || null,
          avatar_url: profile2.avatar_url || profile2.avatar || null,
          data_iscrizione: profile2.data_iscrizione || profile2.created_at || '',
          stato: (profile2.stato as 'attivo' | 'inattivo' | 'sospeso') || 'attivo',
          allenamenti_mese: 0,
          ultimo_accesso: null,
          scheda_attiva: null,
          documenti_scadenza: profile2.documenti_scadenza || false,
          note: profile2.note || null,
          tags: [],
          role: profile2.role || '',
          created_at: profile2.created_at || '',
          updated_at: profile2.updated_at || '',
        }
        setAthlete(cliente)
        if (!profile2.user_id) {
          throw new Error('user_id non trovato nel profilo')
        }
        setAthleteUserId(profile2.user_id)
        return
      }

      const cliente: Cliente = {
        id: profile.id,
        nome: profile.nome || '',
        cognome: profile.cognome || '',
        first_name: profile.first_name || profile.nome || '',
        last_name: profile.last_name || profile.cognome || '',
        email: profile.email || '',
        phone: profile.phone || null,
        avatar_url: profile.avatar_url || profile.avatar || null,
        data_iscrizione: profile.data_iscrizione || profile.created_at || '',
        stato: (profile.stato as 'attivo' | 'inattivo' | 'sospeso') || 'attivo',
        allenamenti_mese: 0,
        ultimo_accesso: null,
        scheda_attiva: null,
        documenti_scadenza: profile.documenti_scadenza || false,
        note: profile.note || null,
        tags: [],
        role: profile.role || '',
        created_at: profile.created_at || '',
        updated_at: profile.updated_at || '',
      }
      setAthlete(cliente)
      if (!profile.user_id) {
        throw new Error('user_id non trovato nel profilo')
      }
      setAthleteUserId(profile.user_id)
    } catch (err) {
      logger.error('Errore caricamento atleta', err, { athleteId })
      setError(err instanceof Error ? err.message : 'Errore nel caricamento del profilo')
    } finally {
      setLoading(false)
    }
  }, [athleteId, supabase])

  const loadAthleteStats = useCallback(async () => {
    if (!athlete || !athleteId) {
      return
    }

    try {
      // Conta workout logs totali (prova con atleta_id e athlete_id)
      let totalWorkouts = 0
      try {
        const { count } = await supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('atleta_id', athleteId)
        totalWorkouts = count || 0
      } catch {
        try {
          const { count } = await supabase
            .from('workout_logs')
            .select('*', { count: 'exact', head: true })
            .eq('athlete_id', athleteId)
          totalWorkouts = count || 0
        } catch {}
      }

      // Conta workout logs del mese corrente
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      let monthlyWorkouts = 0
      try {
        const { count } = await supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('atleta_id', athleteId)
          .gte('data', startOfMonth.toISOString().split('T')[0])
        monthlyWorkouts = count || 0
      } catch {
        try {
          const { count } = await supabase
            .from('workout_logs')
            .select('*', { count: 'exact', head: true })
            .eq('athlete_id', athleteId)
            .gte('data', startOfMonth.toISOString().split('T')[0])
          monthlyWorkouts = count || 0
        } catch {}
      }

      // Conta schede attive
      const { count: activeWorkouts } = await supabase
        .from('workout_plans')
        .select('*', { count: 'exact', head: true })
        .eq('athlete_id', athleteId)
        .eq('is_active', true)

      // Conta documenti in scadenza (prova con user_id se athlete_id fallisce)
      let expiringDocs = 0
      try {
        const { count } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', athleteId)
          .eq('status', 'in_scadenza')
        expiringDocs = count || 0
      } catch {
        // Prova con id se la colonna athlete_id non esiste
        try {
          const userProfile = await supabase
            .from('profiles')
            .select('id')
            .eq('id', athleteId)
            .single()

          if (userProfile.data?.id) {
            const { count } = await supabase
              .from('documents')
              .select('*', { count: 'exact', head: true })
              .eq('athlete_id', userProfile.data.id)
              .eq('status', 'in_scadenza')
            expiringDocs = count || 0
          }
        } catch {}
      }

      // Ultimo progress log per peso (prova con user_id se athlete_id fallisce)
      let pesoAttuale = null
      try {
        const { data: lastProgress } = await supabase
          .from('progress_logs')
          .select('weight_kg')
          .eq('atleta_id', athleteId)
          .order('date', { ascending: false })
          .limit(1)
          .single()
        pesoAttuale = lastProgress?.weight_kg || null
      } catch {
        try {
          const userProfile = await supabase
            .from('profiles')
            .select('id')
            .eq('id', athleteId)
            .single()

          if (userProfile.data?.id) {
            const { data: lastProgress } = await supabase
              .from('progress_logs')
              .select('weight_kg')
              .eq('athlete_id', userProfile.data.id)
              .order('date', { ascending: false })
              .limit(1)
              .maybeSingle()
            pesoAttuale = lastProgress?.weight_kg || null
          }
        } catch {}
      }

      setStats({
        allenamenti_totali: totalWorkouts,
        allenamenti_mese: monthlyWorkouts,
        schede_attive: activeWorkouts || 0,
        documenti_scadenza: expiringDocs,
        ultimo_accesso: athlete?.ultimo_accesso || null,
        peso_attuale: pesoAttuale,
      })
    } catch (err) {
      logger.error('Errore caricamento statistiche', err, { athleteId })
    }
  }, [athlete, athleteId, supabase])

  useEffect(() => {
    if (!athleteId) {
      return
    }
    void loadAthleteData()
  }, [athleteId, loadAthleteData])

  useEffect(() => {
    void loadAthleteStats()
  }, [loadAthleteStats])

  return {
    athlete,
    stats,
    loading,
    error,
    athleteUserId,
    loadAthleteData,
    loadAthleteStats,
  }
}
