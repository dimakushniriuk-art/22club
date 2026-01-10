// ============================================================
// Hook per statistiche atleta home (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('hooks:home-profile:use-athlete-stats')

interface AthleteStats {
  allenamenti_totali: number
  allenamenti_mese: number
  streak_giorni: number
  peso_attuale: number | null
  peso_iniziale: number | null
  obiettivo_peso: number | null
  lezioni_rimanenti: number
  progress_score: number
}

interface UseAthleteStatsProps {
  athleteUserId: string | null
  authLoading: boolean
  anagrafica: { peso_iniziale_kg: number | null } | null
  fitness: { peso_attuale_kg: number | null; obiettivo_peso_kg: number | null } | null
  smartTracking: { peso_kg: number | null } | null
  administrative: { lezioni_rimanenti: number | null } | null
}

export function useAthleteStats({
  athleteUserId,
  authLoading,
  anagrafica,
  fitness,
  smartTracking,
  administrative,
}: UseAthleteStatsProps) {
  const supabase = useMemo(() => createClient(), [])
  const [stats, setStats] = useState<AthleteStats>({
    allenamenti_totali: 0,
    allenamenti_mese: 0,
    streak_giorni: 0,
    peso_attuale: null,
    peso_iniziale: null,
    obiettivo_peso: null,
    lezioni_rimanenti: 0,
    progress_score: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    // Se authLoading è true, aspetta che finisca
    if (authLoading) {
      logger.debug('useAthleteStats: Aspetto fine authLoading...')
      return
    }

    // Se athleteUserId è null, imposta loading a false e esci
    if (!athleteUserId) {
      logger.warn('useAthleteStats: athleteUserId è null, imposto loading a false')
      setLoading(false)
      setError('ID atleta non disponibile')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Carica statistiche usando le funzioni helper
      // Nota: profileComplete potrebbe essere usato in futuro per validazioni
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      const { data: profileComplete, error: profileError } = await (supabase.rpc as any)(
        'get_athlete_profile_complete',
        { athlete_uuid: athleteUserId },
      )

      if (profileError) {
        logger.warn('Errore caricamento profilo completo', profileError, { athleteUserId })
      }

      // Carica progress score
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: progressScore, error: progressError } = await (supabase.rpc as any)(
        'calculate_athlete_progress_score',
        { athlete_uuid: athleteUserId },
      )

      if (progressError) {
        logger.warn('Errore calcolo progress score', progressError, { athleteUserId })
      }

      // Conta workout logs totali
      // workout_logs.athlete_id e atleta_id sono FK a profiles.id, non profiles.user_id
      // athleteUserId dovrebbe essere già profiles.id (convertito in page.tsx)
      let totalWorkouts = 0
      if (athleteUserId) {
        try {
          const { count } = await supabase
            .from('workout_logs')
            .select('*', { count: 'exact', head: true })
            .eq('athlete_id', athleteUserId)
          totalWorkouts = count || 0
        } catch {
          try {
            const { count } = await supabase
              .from('workout_logs')
              .select('*', { count: 'exact', head: true })
              .eq('atleta_id', athleteUserId)
            totalWorkouts = count || 0
          } catch {
            logger.warn('Errore nel conteggio workout_logs', undefined, { athleteUserId })
          }
        }
      }

      // Conta workout logs del mese corrente
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      let monthlyWorkouts = 0
      try {
        const { count } = await supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', athleteUserId)
          .gte('data', startOfMonth.toISOString().split('T')[0])
        monthlyWorkouts = count || 0
      } catch {
        try {
          const { count } = await supabase
            .from('workout_logs')
            .select('*', { count: 'exact', head: true })
            .eq('atleta_id', athleteUserId)
            .gte('data', startOfMonth.toISOString().split('T')[0])
          monthlyWorkouts = count || 0
        } catch {}
      }

      // Estrai dati da anagrafica e fitness per peso
      const pesoIniziale = anagrafica?.peso_iniziale_kg || null
      const pesoAttuale = fitness?.peso_attuale_kg || smartTracking?.peso_kg || null
      const obiettivoPeso = fitness?.obiettivo_peso_kg || null

      // Calcola lezioni rimanenti da payments e appointments (stessa logica del tab amministrativo)
      // IMPORTANTE: payments.athlete_id e appointments.athlete_id puntano a profiles.id, NON profiles.user_id
      let lezioniRim = 0
      try {
        // Determina profile.id: athleteUserId potrebbe essere già profile.id o user_id
        // payments.athlete_id e appointments.athlete_id puntano a profiles.id
        let profileId: string | null = null

        // Prova prima a verificare se athleteUserId è già un profile.id
        const { data: profileById, error: errorById } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', athleteUserId)
          .maybeSingle()

        const profileByIdTyped = profileById as { id?: string } | null
        if (profileByIdTyped?.id) {
          // athleteUserId è già profile.id
          profileId = athleteUserId
          logger.debug('athleteUserId è già profile.id', undefined, { profileId })
        } else {
          // athleteUserId è user_id, convertilo a profile.id
          const { data: profileByUserId, error: errorByUserId } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', athleteUserId)
            .maybeSingle()

          const profileByUserIdTyped = profileByUserId as { id?: string } | null
          if (profileByUserIdTyped?.id) {
            profileId = profileByUserIdTyped.id
            logger.debug('Convertito user_id a profile.id', undefined, {
              athleteUserId,
              profileId,
            })
          } else {
            logger.warn('Profile non trovato né come id né come user_id', undefined, {
              athleteUserId,
              errorById: errorById?.message,
              errorByUserId: errorByUserId?.message,
            })
          }
        }

        if (profileId) {
          // Carica pagamenti completati
          // Nota: payments.athlete_id potrebbe riferirsi a profiles.id o profiles.user_id
          // Prova prima con profileId (profiles.id), poi con athleteUserId (profiles.user_id)
          let payments: Array<{ lessons_purchased?: number }> = []

          try {
            // Prova prima con profileId (profiles.id) - questo è il caso corretto
            let result = await supabase
              .from('payments')
              .select('lessons_purchased')
              .eq('athlete_id', profileId)
              .eq('status', 'completed')

            // Se c'è un errore (non se non ci sono risultati), prova con user_id come fallback
            if (result.error && result.error.code !== 'PGRST116') {
              // PGRST116 = no rows returned, non è un errore
              logger.debug('Tentativo con profileId ha dato errore, provo con user_id', undefined, {
                profileId,
                athleteUserId,
                error: result.error,
              })

              // Prova con athleteUserId (profiles.user_id) come fallback
              const fallbackResult = await supabase
                .from('payments')
                .select('lessons_purchased')
                .eq('athlete_id', athleteUserId)
                .eq('status', 'completed')

              // Usa il risultato del fallback solo se non ha errori
              if (!fallbackResult.error) {
                result = fallbackResult
                logger.debug('Fallback con user_id ha funzionato', undefined, {
                  athleteUserId,
                  paymentsCount: fallbackResult.data?.length || 0,
                })
              }
            }

            if (result.error) {
              // Se la colonna non esiste, usa un valore di default
              if (result.error.code === '42703' || result.error.message?.includes('column')) {
                logger.debug('Colonna lessons_purchased non trovata, uso default', undefined, {
                  profileId,
                })
                payments = []
              } else {
                logger.warn('Errore caricamento payments', result.error, {
                  profileId,
                  athleteUserId,
                })
              }
            } else {
              payments = result.data || []
            }
          } catch (err) {
            logger.warn('Errore caricamento payments (catch)', err, { profileId, athleteUserId })
          }

          // Carica appointments completati
          // Nota: appointments.athlete_id potrebbe riferirsi a profiles.id
          let completedAppointments: Array<{ id: string }> | null = null

          try {
            // Prova prima con profileId (profiles.id) - questo è il caso corretto
            let result = await supabase
              .from('appointments')
              .select('id')
              .eq('athlete_id', profileId)
              .eq('status', 'completato')

            // Se c'è un errore (non se non ci sono risultati), prova con user_id come fallback
            if (result.error && result.error.code !== 'PGRST116') {
              // PGRST116 = no rows returned, non è un errore
              logger.debug(
                'Tentativo appointments con profileId ha dato errore, provo con user_id',
                undefined,
                {
                  profileId,
                  athleteUserId,
                  error: result.error,
                },
              )

              // Prova con athleteUserId (profiles.user_id) come fallback
              const fallbackResult = await supabase
                .from('appointments')
                .select('id')
                .eq('athlete_id', athleteUserId)
                .eq('status', 'completato')

              // Usa il risultato del fallback solo se non ha errori
              if (!fallbackResult.error) {
                result = fallbackResult
                logger.debug('Fallback appointments con user_id ha funzionato', undefined, {
                  athleteUserId,
                  appointmentsCount: fallbackResult.data?.length || 0,
                })
              }
            }

            if (result.error) {
              logger.warn('Errore caricamento appointments', result.error, {
                profileId,
                athleteUserId,
              })
            } else {
              completedAppointments = result.data
            }
          } catch (err) {
            logger.warn('Errore caricamento appointments (catch)', err, {
              profileId,
              athleteUserId,
            })
          }

          // Calcola totali
          const totalPurchased = (payments || []).reduce(
            (sum, p) => sum + (p.lessons_purchased || 0),
            0,
          )
          const totalUsed = completedAppointments?.length || 0
          lezioniRim = Math.max(0, totalPurchased - totalUsed)

          logger.debug('Lezioni rimanenti calcolate', undefined, {
            profileId,
            athleteUserId,
            totalPurchased,
            totalUsed,
            lezioniRim,
            paymentsCount: payments?.length || 0,
            appointmentsCount: completedAppointments?.length || 0,
            paymentsData: payments,
          })

          // Se il calcolo restituisce 0 ma ci sono dati, logga un warning
          if (lezioniRim === 0 && (payments?.length || 0) > 0) {
            logger.warn('Lezioni rimanenti = 0 ma ci sono pagamenti', undefined, {
              profileId,
              athleteUserId,
              paymentsCount: payments?.length || 0,
              totalPurchased,
              totalUsed,
            })
          }
        } else {
          logger.warn('Profile ID non trovato per calcolo lezioni', undefined, { athleteUserId })
          // Fallback a valore da administrative
          lezioniRim = administrative?.lezioni_rimanenti || 0
        }
      } catch (lezioniError) {
        logger.warn(
          'Errore calcolo lezioni rimanenti, uso valore da administrative',
          lezioniError,
          {
            athleteUserId,
          },
        )
        // Fallback a valore da administrative se calcolo fallisce
        lezioniRim = administrative?.lezioni_rimanenti || 0
      }

      // Estrai progress score
      const progressScoreValue =
        typeof progressScore === 'object' && progressScore !== null
          ? (progressScore as { score_totale?: number })?.score_totale || 0
          : 0

      // Calcola streak_giorni da workout_logs (P4-003) - Usa utility migliorata
      let streakGiorni = 0
      try {
        const { calculateStreakFromLogs } = await import('@/lib/streak-calculator')
        streakGiorni = await calculateStreakFromLogs(supabase, athleteUserId)
      } catch (streakError) {
        logger.error('Errore calcolo streak', streakError, { athleteUserId })
        // Fallback a calcolo semplice se import fallisce
        try {
          // Prima ottieni il profile.id dall'user_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', athleteUserId)
            .single()

          const profileTyped = profile as { id?: string } | null
          if (profileTyped?.id) {
            const { data: workoutLogs } = await supabase
              .from('workout_logs')
              .select('data, stato')
              .or(`atleta_id.eq.${profileTyped.id},athlete_id.eq.${profileTyped.id}`)
              .in('stato', ['completato', 'completed'])
              .order('data', { ascending: false })
              .limit(365)

            if (workoutLogs && workoutLogs.length > 0) {
              const { calculateStreakDays } = await import('@/lib/streak-calculator')
              streakGiorni = calculateStreakDays(workoutLogs)
            }
          }
        } catch (fallbackError) {
          logger.error('Errore fallback calcolo streak', fallbackError, { athleteUserId })
        }
      }

      setStats({
        allenamenti_totali: totalWorkouts,
        allenamenti_mese: monthlyWorkouts,
        streak_giorni: streakGiorni,
        peso_attuale: pesoAttuale,
        peso_iniziale: pesoIniziale,
        obiettivo_peso: obiettivoPeso,
        lezioni_rimanenti: lezioniRim,
        progress_score: progressScoreValue,
      })
    } catch (err) {
      logger.error('Errore caricamento statistiche', err, { athleteUserId })
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche')
    } finally {
      setLoading(false)
    }
  }, [
    athleteUserId,
    authLoading,
    supabase,
    anagrafica?.peso_iniziale_kg,
    fitness?.peso_attuale_kg,
    fitness?.obiettivo_peso_kg,
    smartTracking?.peso_kg,
    administrative?.lezioni_rimanenti,
  ])

  useEffect(() => {
    // Se authLoading è true, non fare nulla (aspetta)
    if (authLoading) {
      logger.debug('useAthleteStats: authLoading true, aspetto...')
      return
    }

    // Se athleteUserId è null dopo che authLoading è false, imposta loading a false
    if (!athleteUserId) {
      logger.warn('useAthleteStats: athleteUserId null dopo authLoading, imposto loading a false')
      setLoading(false)
      setError('ID atleta non disponibile')
      return
    }

    // Carica le statistiche
    void loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    athleteUserId,
    authLoading,
    anagrafica?.peso_iniziale_kg,
    fitness?.peso_attuale_kg,
    fitness?.obiettivo_peso_kg,
    smartTracking?.peso_kg,
    administrative?.lezioni_rimanenti,
  ])

  const calculateProgress = useMemo(() => {
    return () => {
      if (!stats.peso_iniziale || !stats.obiettivo_peso || !stats.peso_attuale) return 0
      const total = Math.abs(stats.peso_iniziale - stats.obiettivo_peso)
      if (total === 0) return 100
      const current = Math.abs(stats.peso_attuale - stats.peso_iniziale)
      return Math.round((current / total) * 100)
    }
  }, [stats])

  return {
    stats,
    loading,
    error,
    calculateProgress,
  }
}
