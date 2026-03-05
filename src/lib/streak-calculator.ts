// 🔥 Streak Calculator — 22Club
// Calcola streak_giorni da workout_logs (P4-003)

import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:streak-calculator')

/**
 * Calcola streak giorni consecutivi da workout_logs
 * @param workoutLogs Array di workout logs con campo `data` (DATE o TIMESTAMP)
 * @returns Numero di giorni consecutivi (streak)
 */
export function calculateStreakDays(
  workoutLogs: Array<{ data: string | Date | null; stato?: string | null }>,
): number {
  if (!workoutLogs || workoutLogs.length === 0) {
    return 0
  }

  // Filtra solo workout completati
  const completedLogs = workoutLogs.filter(
    (log) => log.data && (log.stato === 'completato' || log.stato === 'completed' || !log.stato),
  )

  if (completedLogs.length === 0) {
    return 0
  }

  // Estrai date uniche e normalizza
  const uniqueDates = new Set<string>()
  completedLogs.forEach((log) => {
    if (log.data) {
      let dateStr: string
      if (log.data instanceof Date) {
        dateStr = log.data.toISOString().split('T')[0]
      } else {
        dateStr = log.data.split('T')[0]
      }
      uniqueDates.add(dateStr)
    }
  })

  // Converti in array di Date e ordina (più recente prima)
  const sortedDates = Array.from(uniqueDates)
    .map((d) => {
      const date = new Date(d)
      date.setHours(0, 0, 0, 0)
      return date
    })
    .sort((a, b) => b.getTime() - a.getTime())

  if (sortedDates.length === 0) {
    return 0
  }

  // Calcola streak: conta giorni consecutivi partendo da oggi
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Se l'ultimo workout non è oggi o ieri, streak = 0
  const mostRecentDate = sortedDates[0]
  const daysSinceLastWorkout = Math.floor(
    (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  // Se l'ultimo workout è più di 1 giorno fa, streak = 0
  if (daysSinceLastWorkout > 1) {
    return 0
  }

  // Calcola giorni consecutivi
  let streak = daysSinceLastWorkout === 0 ? 1 : 0 // Se oggi, inizia da 1, altrimenti da 0
  const expectedDate = new Date(today)
  if (daysSinceLastWorkout === 1) {
    expectedDate.setDate(expectedDate.getDate() - 1) // Ieri
    streak = 1
  }

  // Controlla giorni consecutivi precedenti
  for (let i = streak === 1 ? 1 : 0; i < sortedDates.length; i++) {
    const workoutDate = sortedDates[i]
    const daysDiff = Math.floor(
      (expectedDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysDiff === 0) {
      // Giorno consecutivo trovato
      streak++
      expectedDate.setDate(expectedDate.getDate() - 1)
    } else if (daysDiff > 0) {
      // Gap trovato, interrompi streak
      break
    }
    // Se daysDiff < 0, il workout è nel futuro (non dovrebbe accadere), skip
  }

  return streak
}

/**
 * Calcola streak da workout_logs con query Supabase
 * @param athleteId - UUID dell'atleta (può essere user_id da auth.users o profile.id)
 */
export async function calculateStreakFromLogs(
  supabase: ReturnType<typeof import('@/lib/supabase').createClient>,
  athleteId: string,
): Promise<number> {
  try {
    let profileId: string | null = null

    // Prova prima come user_id (profiles.user_id)
    const { data: profileByUserId, error: profileErrorByUserId } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', athleteId)
      .maybeSingle()

    const profileByUserIdTyped = profileByUserId as { id?: string } | null
    if (profileByUserIdTyped?.id) {
      profileId = profileByUserIdTyped.id
    } else {
      // Se non trovato come user_id, prova come profile.id direttamente
      const { data: profileById, error: profileErrorById } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', athleteId)
        .maybeSingle()

      const profileByIdTyped = profileById as { id?: string } | null
      if (profileByIdTyped?.id) {
        profileId = profileByIdTyped.id
      } else {
        // Nessun profilo trovato né come user_id né come profile.id
        logger.warn('Streak: profilo non trovato né come user_id né come profile.id', {
          athleteId,
          profileErrorById,
          profileErrorByUserId,
        })
        return 0
      }
    }

    if (!profileId) {
      logger.warn('Streak: profileId è null', { athleteId })
      return 0
    }

    // Query workout_logs usando profile.id (non user_id)
    const { data: workoutLogs, error } = await supabase
      .from('workout_logs')
      .select('data, stato')
      .or(`atleta_id.eq.${profileId},athlete_id.eq.${profileId}`)
      .in('stato', ['completato', 'completed'])
      .order('data', { ascending: false })
      .limit(365) // Ultimo anno

    if (error) {
      // Gestisci errori di timeout/connettività in modo silenzioso (non sono errori critici)
      const isTimeoutError =
        error.message?.includes('timeout') ||
        error.message?.includes('connect error') ||
        error.message?.includes('disconnect/reset')

      if (isTimeoutError) {
        // Log come warning invece di error per timeout (problema di rete, non di codice)
        logger.warn('Timeout query workout_logs per streak (problema di rete)', {
          athleteId,
          profileId,
          errorMessage: error.message,
        })
        return 0
      }

      // Per altri errori, logga come error con dettagli completi
      logger.error('Errore query workout_logs per streak', error, {
        athleteId,
        profileId,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
      })
      return 0
    }

    return calculateStreakDays(workoutLogs || [])
  } catch (err) {
    logger.error('Errore calcolo streak', err, { athleteId })
    return 0
  }
}
