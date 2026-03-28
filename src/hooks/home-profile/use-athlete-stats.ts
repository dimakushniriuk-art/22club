// ============================================================
// Hook per statistiche atleta home (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { fetchAthleteTrainingLessonsSnapshot } from '@/lib/credits/athlete-training-lessons-display'
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
      // Data locale (YYYY-MM-DD) per allineare il filtro mese a workout_logs.data (date)
      const monthStartStr = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-01`

      const { data: profileResolveRow, error: profileResolveErr } = await supabase
        .from('profiles')
        .select('id')
        .or(`id.eq.${athleteUserId},user_id.eq.${athleteUserId}`)
        .maybeSingle()

      if (profileResolveErr) {
        logger.warn('Risoluzione profilo per conteggi workout', profileResolveErr, {
          athleteUserId,
        })
      }

      const profileRowTyped = profileResolveRow as { id?: string } | null
      const workoutOwnerId = profileRowTyped?.id ?? athleteUserId

      const [
        profileCompleteResult,
        progressScoreResult,
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
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', workoutOwnerId),
        supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('atleta_id', workoutOwnerId),
        supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', workoutOwnerId)
          .gte('data', monthStartStr),
        supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('atleta_id', workoutOwnerId)
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

      const profileId = profileRowTyped?.id ?? null

      const progressScoreValue =
        typeof progressScore === 'object' && progressScore !== null
          ? (progressScore as { score_totale?: number })?.score_totale || 0
          : 0

      const computeLezioniRim = async (): Promise<number> => {
        if (!profileId) {
          logger.warn('Profile ID non trovato per calcolo lezioni', undefined, { athleteUserId })
          return administrative?.lezioni_rimanenti || 0
        }

        try {
          const snap = await fetchAthleteTrainingLessonsSnapshot(supabase, profileId)
          logger.debug('Lezioni rimanenti (ledger + contatori)', undefined, {
            profileId,
            athleteUserId,
            ...snap,
          })
          return snap.totalRemaining
        } catch (err) {
          logger.warn('Errore snapshot lezioni PT, fallback amministrativo', err, {
            profileId,
            athleteUserId,
          })
          return administrative?.lezioni_rimanenti || 0
        }
      }

      let lezioniRim = administrative?.lezioni_rimanenti || 0
      let streakGiorni = 0

      try {
        ;[lezioniRim, streakGiorni] = await Promise.all([
          computeLezioniRim(),
          calculateStreakFromLogs(supabase, athleteUserId, profileId),
        ])
      } catch (lezioniError) {
        logger.warn('Errore calcolo lezioni/streak parallelo, uso fallback lezioni', lezioniError, {
          athleteUserId,
        })
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

  useEffect(() => {
    if (authLoading || !athleteUserId) return
    const onVis = () => {
      if (document.visibilityState === 'visible') void loadStats()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [authLoading, athleteUserId, loadStats])

  useEffect(() => {
    if (authLoading || !athleteUserId) return
    const onLessonsRefresh = () => {
      void loadStats()
    }
    window.addEventListener('22club:athlete-lessons-refresh', onLessonsRefresh)
    return () => window.removeEventListener('22club:athlete-lessons-refresh', onLessonsRefresh)
  }, [authLoading, athleteUserId, loadStats])

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
