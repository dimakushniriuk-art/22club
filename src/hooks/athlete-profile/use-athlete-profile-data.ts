// ============================================================
// Hook per gestione dati profilo atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
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
  /** Lezioni rimanenti (lesson_counters, unica riga per atleta, lesson_type=default) */
  lessons_remaining: number | null
}

function pushSupabaseError(messages: string[], res: { error?: { message: string } | null }) {
  if (res.error?.message) {
    messages.push(res.error.message)
  }
}

export function useAthleteProfileData(athleteId: string) {
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
    lessons_remaining: null,
  })
  const [statsError, setStatsError] = useState<string | null>(null)
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
        .eq('role', 'athlete')
        .single()

      if (profileError) {
        const { data: profile2, error: profileError2 } = await supabase
          .from('profiles')
          .select('*, user_id')
          .eq('id', athleteId)
          .eq('role', 'athlete')
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
  }, [athleteId])

  const loadAthleteStats = useCallback(async () => {
    if (!athlete || !athleteId) {
      return
    }

    const errMsgs: string[] = []
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0]
    const workoutLogsOr = `atleta_id.eq.${athleteId},athlete_id.eq.${athleteId}`

    try {
      setStatsError(null)
      const totalRes = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true })
        .or(workoutLogsOr)
      pushSupabaseError(errMsgs, totalRes)

      const monthRes = await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true })
        .or(workoutLogsOr)
        .gte('data', startOfMonth)
      pushSupabaseError(errMsgs, monthRes)

      const plansRes = await supabase
        .from('workout_plans')
        .select('*', { count: 'exact', head: true })
        .eq('athlete_id', athleteId)
        .eq('is_active', true)
      pushSupabaseError(errMsgs, plansRes)

      const docsRes = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('athlete_id', athleteId)
        .eq('status', 'in_scadenza')
      pushSupabaseError(errMsgs, docsRes)

      const progressRes = await supabase
        .from('progress_logs')
        .select('weight_kg')
        .eq('athlete_id', athleteId)
        .order('date', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()
      pushSupabaseError(errMsgs, progressRes)

      const counterRes = await supabase
        .from('lesson_counters')
        .select('count')
        .eq('athlete_id', athleteId)
        .maybeSingle()
      pushSupabaseError(errMsgs, counterRes)

      const weightRaw = progressRes.data?.weight_kg
      const pesoAttuale = weightRaw === null || weightRaw === undefined ? null : Number(weightRaw)

      setStats({
        allenamenti_totali: totalRes.count ?? 0,
        allenamenti_mese: monthRes.count ?? 0,
        schede_attive: plansRes.count ?? 0,
        documenti_scadenza: docsRes.count ?? 0,
        ultimo_accesso: athlete?.ultimo_accesso || null,
        peso_attuale: Number.isFinite(pesoAttuale) ? pesoAttuale : null,
        lessons_remaining: counterRes.data?.count ?? null,
      })
      setStatsError(errMsgs.length ? [...new Set(errMsgs)].join(' · ') : null)
    } catch (err) {
      logger.error('Errore caricamento statistiche', err, { athleteId })
      const msg = err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche'
      setStatsError(msg)
    }
  }, [athlete, athleteId])

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
    statsError,
    loading,
    error,
    athleteUserId,
    loadAthleteData,
    loadAthleteStats,
  }
}
