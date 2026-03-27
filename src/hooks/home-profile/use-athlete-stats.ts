// ============================================================
// Hook per statistiche atleta home (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { calculateStreakDays, calculateStreakFromLogs } from '@/lib/streak-calculator'

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
    if (authLoading) {
      logger.debug('useAthleteStats: Aspetto fine authLoading...')
      return
    }

    if (!athleteUserId) {
      logger.warn('useAthleteStats: athleteUserId è null, imposto loading a false')
      setLoading(false)
      setError('ID atleta non disponibile')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthStartStr = startOfMonth.toISOString().split('T')[0]

      const [
        profileCompleteResult,
        progressScoreResult,
        profileResolveResult,
        totalAthlete,
        totalAtleta,
        monthAthlete,
        monthAtleta,
      ] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.rpc as any)('get_athlete_profile_complete', { athlete_uuid: athleteUserId }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.rpc as any)('calculate_athlete_progress_score', { athlete_uuid: athleteUserId }),
        supabase
          .from('profiles')
          .select('id')
          .or(`id.eq.${athleteUserId},user_id.eq.${athleteUserId}`)
          .maybeSingle(),
        supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', athleteUserId),
        supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('atleta_id', athleteUserId),
        supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', athleteUserId)
          .gte('data', monthStartStr),
        supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('atleta_id', athleteUserId)
          .gte('data', monthStartStr),
      ])

      if (profileCompleteResult.error) {
        logger.warn('Errore caricamento profilo completo', profileCompleteResult.error, {
          athleteUserId,
        })
      }

      const progressScore = progressScoreResult.data
      if (progressScoreResult.error) {
        logger.warn('Errore calcolo progress score', progressScoreResult.error, { athleteUserId })
      }

      let totalWorkouts = 0
      let monthlyWorkouts = 0
      if (!totalAthlete.error) {
        totalWorkouts = totalAthlete.count ?? 0
        monthlyWorkouts = monthAthlete.error ? 0 : (monthAthlete.count ?? 0)
      } else if (!totalAtleta.error) {
        totalWorkouts = totalAtleta.count ?? 0
        monthlyWorkouts = monthAtleta.error ? 0 : (monthAtleta.count ?? 0)
      } else {
        logger.warn('Errore nel conteggio workout_logs (athlete_id e atleta_id)', undefined, {
          athleteUserId,
          errAthlete: totalAthlete.error,
          errAtleta: totalAtleta.error,
        })
      }

      const pesoIniziale = anagrafica?.peso_iniziale_kg || null
      const pesoAttuale = fitness?.peso_attuale_kg || smartTracking?.peso_kg || null
      const obiettivoPeso = fitness?.obiettivo_peso_kg || null

      if (profileResolveResult.error) {
        logger.warn('Risoluzione profile id (lezioni/streak)', profileResolveResult.error, {
          athleteUserId,
        })
      }
      const profileRow = profileResolveResult.data as { id?: string } | null
      const profileId = profileRow?.id ?? null

      const progressScoreValue =
        typeof progressScore === 'object' && progressScore !== null
          ? (progressScore as { score_totale?: number })?.score_totale || 0
          : 0

      const computeLezioniRim = async (): Promise<number> => {
        if (!profileId) {
          logger.warn('Profile ID non trovato per calcolo lezioni', undefined, { athleteUserId })
          return administrative?.lezioni_rimanenti || 0
        }

        const loadPayments = async (): Promise<Array<{ lessons_purchased?: number }>> => {
          try {
            let result = await supabase
              .from('payments')
              .select('lessons_purchased')
              .eq('athlete_id', profileId)
              .eq('status', 'completed')

            if (result.error && result.error.code !== 'PGRST116') {
              logger.debug('Tentativo con profileId ha dato errore, provo con user_id', undefined, {
                profileId,
                athleteUserId,
                error: result.error,
              })
              const fallbackResult = await supabase
                .from('payments')
                .select('lessons_purchased')
                .eq('athlete_id', athleteUserId)
                .eq('status', 'completed')
              if (!fallbackResult.error) {
                result = fallbackResult
              }
            }

            if (result.error) {
              if (result.error.code === '42703' || result.error.message?.includes('column')) {
                return []
              }
              logger.warn('Errore caricamento payments', result.error, {
                profileId,
                athleteUserId,
              })
              return []
            }
            return result.data || []
          } catch (err) {
            logger.warn('Errore caricamento payments (catch)', err, { profileId, athleteUserId })
            return []
          }
        }

        const loadAppointments = async (): Promise<Array<{ id: string }> | null> => {
          try {
            let result = await supabase
              .from('appointments')
              .select('id')
              .eq('athlete_id', profileId)
              .eq('status', 'completato')

            if (result.error && result.error.code !== 'PGRST116') {
              const fallbackResult = await supabase
                .from('appointments')
                .select('id')
                .eq('athlete_id', athleteUserId)
                .eq('status', 'completato')
              if (!fallbackResult.error) {
                result = fallbackResult
              }
            }

            if (result.error) {
              logger.warn('Errore caricamento appointments', result.error, {
                profileId,
                athleteUserId,
              })
              return null
            }
            return result.data
          } catch (err) {
            logger.warn('Errore caricamento appointments (catch)', err, {
              profileId,
              athleteUserId,
            })
            return null
          }
        }

        const [payments, completedAppointments] = await Promise.all([
          loadPayments(),
          loadAppointments(),
        ])

        const totalPurchased = (payments || []).reduce(
          (sum, p) => sum + (p.lessons_purchased || 0),
          0,
        )
        const totalUsed = completedAppointments?.length || 0
        const lezioniRim = Math.max(0, totalPurchased - totalUsed)

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

        if (lezioniRim === 0 && (payments?.length || 0) > 0) {
          logger.warn('Lezioni rimanenti = 0 ma ci sono pagamenti', undefined, {
            profileId,
            athleteUserId,
            paymentsCount: payments?.length || 0,
            totalPurchased,
            totalUsed,
          })
        }

        return lezioniRim
      }

      let lezioniRim = administrative?.lezioni_rimanenti || 0
      let streakGiorni = 0

      try {
        ;[lezioniRim, streakGiorni] = await Promise.all([
          computeLezioniRim(),
          calculateStreakFromLogs(supabase, athleteUserId, profileId),
        ])
      } catch (lezioniError) {
        logger.warn(
          'Errore calcolo lezioni/streak parallelo, uso fallback lezioni',
          lezioniError,
          { athleteUserId },
        )
        lezioniRim = administrative?.lezioni_rimanenti || 0
        try {
          streakGiorni = await calculateStreakFromLogs(supabase, athleteUserId, profileId)
        } catch (streakError) {
          logger.error('Errore calcolo streak', streakError, { athleteUserId })
          if (profileId) {
            try {
              const { data: workoutLogs } = await supabase
                .from('workout_logs')
                .select('data, stato')
                .or(`atleta_id.eq.${profileId},athlete_id.eq.${profileId}`)
                .in('stato', ['completato', 'completed'])
                .order('data', { ascending: false })
                .limit(365)
              if (workoutLogs && workoutLogs.length > 0) {
                streakGiorni = calculateStreakDays(workoutLogs)
              }
            } catch (fallbackError) {
              logger.error('Errore fallback calcolo streak', fallbackError, { athleteUserId })
            }
          }
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
    administrative?.lezioni_rimanenti,
    anagrafica?.peso_iniziale_kg,
    fitness?.obiettivo_peso_kg,
    fitness?.peso_attuale_kg,
    smartTracking?.peso_kg,
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
