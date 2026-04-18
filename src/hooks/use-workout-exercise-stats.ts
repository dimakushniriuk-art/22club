'use client'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from './use-supabase'
import { createLogger } from '@/lib/logger'
import { getProfileIdFromUserId } from '@/lib/utils/profile-id-utils'
import { chunkForSupabaseIn } from '@/lib/supabase/in-query-chunks'

const logger = createLogger('hooks:use-workout-exercise-stats')

type WorkoutLogMeta = {
  data: string | null
  started_at: string | null
  stato: string | null
  completed_at: string | null
  created_at: string | null
  volume_totale: number | null
  duration_minutes: number | null
  exercises_completed: number | null
}

function parseDbNumber(v: string | number | null | undefined): number | null {
  if (v == null) return null
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function toCalendarDateFromIso(iso: string | null | undefined): string | null {
  if (iso == null || typeof iso !== 'string') return null
  const t = iso.trim()
  if (!t) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().split('T')[0]
}

function resolveLogCalendarDate(m: WorkoutLogMeta): string {
  return (
    toCalendarDateFromIso(m.data) ??
    toCalendarDateFromIso(m.started_at) ??
    toCalendarDateFromIso(m.completed_at) ??
    toCalendarDateFromIso(m.created_at) ??
    '1970-01-01'
  )
}

function resolveSetDisplayDate(
  set: {
    completed_at: string | null
    workout_log_id?: string | null
    created_at?: string | null
  },
  logMetaById: Map<string, WorkoutLogMeta>,
): string | null {
  const fromCompleted = toCalendarDateFromIso(set.completed_at)
  if (fromCompleted) return fromCompleted
  const logId = typeof set.workout_log_id === 'string' ? set.workout_log_id.trim() : ''
  if (logId) {
    const m = logMetaById.get(logId)
    if (m) {
      const fromLogData = toCalendarDateFromIso(m.data)
      if (fromLogData) return fromLogData
      const fromStarted = toCalendarDateFromIso(m.started_at)
      if (fromStarted) return fromStarted
      const fromLogSession = toCalendarDateFromIso(m.completed_at)
      if (fromLogSession) return fromLogSession
    }
  }
  return toCalendarDateFromIso(set.created_at ?? null)
}

export interface ExerciseStat {
  exercise_id: string
  exercise_name: string
  exercise_category?: string | null
  total_sessions: number
  total_sets: number
  average_weight: number | null
  max_weight: number | null
  min_weight: number | null
  average_reps: number | null
  average_seconds: number | null
  first_date: string | null
  last_date: string | null
  dataPoints: Array<{
    date: string
    weight_kg: number
    reps?: number | null
    execution_time_sec?: number | null
    set_number: number
    workout_log_id?: string | null
    workout_day_exercise_id?: string | null
    /** `workout_logs.stato` quando la serie è legata a un log (es. in_corso / completato). */
    workout_log_stato?: string | null
  }>
}

/** Riga da `workout_logs` + conteggio serie collegate (per sessioni senza `workout_sets` sul log). */
export type WorkoutLogSessionSummary = {
  workout_log_id: string
  calendar_date: string
  stato: string | null
  volume_totale: number | null
  duration_minutes: number | null
  exercises_completed: number | null
  sets_count: number
}

export interface WorkoutExerciseStats {
  exercises: ExerciseStat[]
  total_exercises: number
  total_sessions: number
  date_range: {
    from: string | null
    to: string | null
  }
  log_sessions: WorkoutLogSessionSummary[]
}

/**
 * Hook per recuperare statistiche degli esercizi per un atleta.
 * Include tutti gli esercizi assegnati nelle schede attuali (anche mai eseguiti).
 * Serie incluse: tutte quelle collegate a un `workout_log` dell’atleta (qualunque stato
 * sessione e anche senza `completed_at` sulla serie), più i set completati sui WDE dei
 * piani dell’atleta. Esclude i soli placeholder di scheda (senza log e senza completamento).
 *
 * @param athleteUserId - user_id dell'atleta (profiles.user_id, auth.uid())
 */
export function useWorkoutExerciseStats(athleteUserId: string | null) {
  const { supabase } = useSupabase()

  const { data, isLoading, error, refetch } = useQuery<WorkoutExerciseStats>({
    queryKey: ['workout-exercise-stats', athleteUserId],
    queryFn: async () => {
      if (!athleteUserId) {
        return {
          exercises: [],
          total_exercises: 0,
          total_sessions: 0,
          date_range: { from: null, to: null },
          log_sessions: [],
        }
      }

      logger.debug('Fetching workout exercise stats', undefined, { athleteUserId })

      try {
        // STEP 1: Converti user_id in profile_id (workout_plans.athlete_id è FK a profiles.id)
        let athleteProfileId: string | null = null
        try {
          athleteProfileId = await getProfileIdFromUserId(athleteUserId)
          if (!athleteProfileId) {
            logger.warn('Profile not found for user_id', undefined, { athleteUserId })
            return {
              exercises: [],
              total_exercises: 0,
              total_sessions: 0,
              date_range: { from: null, to: null },
              log_sessions: [],
            }
          }
        } catch (conversionError) {
          logger.warn('Errore conversione user_id a profile_id', conversionError, { athleteUserId })
          return {
            exercises: [],
            total_exercises: 0,
            total_sessions: 0,
            date_range: { from: null, to: null },
            log_sessions: [],
          }
        }

        // Sessioni totali: conteggio da workout_logs (una riga per sessione)
        let totalSessionsFromLogs = 0
        const { count: logsCount } = await supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('atleta_id', athleteProfileId)
        if (logsCount != null) totalSessionsFromLogs = logsCount

        const LOG_PAGE_SIZE = 1000
        const logIds: string[] = []
        const workoutLogMetaById = new Map<string, WorkoutLogMeta>()
        let logRangeFrom = 0
        for (;;) {
          const { data: logPage, error: logsListError } = await supabase
            .from('workout_logs')
            .select(
              'id, data, started_at, stato, completed_at, created_at, volume_totale, durata_minuti, duration_minutes, esercizi_completati',
            )
            .eq('atleta_id', athleteProfileId)
            .order('id', { ascending: true })
            .range(logRangeFrom, logRangeFrom + LOG_PAGE_SIZE - 1)
          if (logsListError) {
            logger.error('Error fetching workout_logs ids', logsListError, { athleteProfileId })
            throw logsListError
          }
          const rows = (logPage ?? []) as Array<{
            id: string
            data: string | null
            started_at: string | null
            stato: string | null
            completed_at: string | null
            created_at: string | null
            volume_totale: string | number | null
            durata_minuti: number | null
            duration_minutes: number | null
            esercizi_completati: number | null
          }>
          for (const r of rows) {
            logIds.push(r.id)
            const durationMinutes =
              typeof r.duration_minutes === 'number' && Number.isFinite(r.duration_minutes)
                ? r.duration_minutes
                : typeof r.durata_minuti === 'number' && Number.isFinite(r.durata_minuti)
                  ? r.durata_minuti
                  : null
            workoutLogMetaById.set(r.id, {
              data: r.data,
              started_at: r.started_at,
              stato: r.stato,
              completed_at: r.completed_at,
              created_at: r.created_at,
              volume_totale: parseDbNumber(r.volume_totale),
              duration_minutes: durationMinutes,
              exercises_completed:
                typeof r.esercizi_completati === 'number' && Number.isFinite(r.esercizi_completati)
                  ? r.esercizi_completati
                  : null,
            })
          }
          if (rows.length < LOG_PAGE_SIZE) break
          logRangeFrom += LOG_PAGE_SIZE
        }

        // STEP 2: Piani attuali → WDE assegnati (placeholder senza dati + seconda fonte set)
        const { data: workoutPlans, error: plansError } = await supabase
          .from('workout_plans')
          .select('id')
          .eq('athlete_id', athleteProfileId)

        if (plansError) {
          logger.error('Error fetching workout plans', plansError, { athleteProfileId })
          throw plansError
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const planIds = ((workoutPlans ?? []) as any[]).map((p: any) => p.id)

        type WdeRow = { id: string; exercise_id: string }
        const planWdeRows: WdeRow[] = []

        if (planIds.length > 0) {
          const workoutDays: { id: string }[] = []
          for (const planChunk of chunkForSupabaseIn(planIds)) {
            const { data: daysChunk, error: daysError } = await supabase
              .from('workout_days')
              .select('id')
              .in('workout_plan_id', planChunk)
            if (daysError) {
              logger.error('Error fetching workout days', daysError, { planIds })
              throw daysError
            }
            workoutDays.push(...((daysChunk ?? []) as { id: string }[]))
          }

          const dayIds = workoutDays.map((d) => d.id)
          for (const dayChunk of chunkForSupabaseIn(dayIds)) {
            const { data: wdeChunk, error: exercisesError } = await supabase
              .from('workout_day_exercises')
              .select('id, exercise_id')
              .in('workout_day_id', dayChunk)
            if (exercisesError) {
              logger.error('Error fetching workout day exercises', exercisesError, { dayIds })
              throw exercisesError
            }
            planWdeRows.push(...((wdeChunk ?? []) as WdeRow[]))
          }
        }

        const planWdeIds = planWdeRows.map((e) => e.id)
        const uniqueExerciseIdsFromPlan = [...new Set(planWdeRows.map((e) => e.exercise_id))]

        type SetRow = {
          id: string
          workout_day_exercise_id: string
          set_number: number
          reps?: number | null
          reps_completed?: number | null
          weight_kg?: number | null
          weight_used?: number | null
          completed_at: string | null
          execution_time_sec?: number | null
          workout_log_id?: string | null
          created_at?: string | null
        }

        const setsById = new Map<string, SetRow>()
        const selectSets =
          'id, workout_day_exercise_id, set_number, reps, reps_completed, weight_kg, weight_used, completed_at, execution_time_sec, workout_log_id, created_at'

        for (const logChunk of chunkForSupabaseIn(logIds)) {
          const { data: workoutSets, error: setsError } = await supabase
            .from('workout_sets')
            .select(selectSets)
            .in('workout_log_id', logChunk)
            .order('id', { ascending: true })
          if (setsError) {
            logger.error('Error fetching workout_sets by log', setsError, { athleteProfileId })
            throw setsError
          }
          for (const row of (workoutSets ?? []) as SetRow[]) {
            setsById.set(row.id, row)
          }
        }

        for (const wdeChunk of chunkForSupabaseIn(planWdeIds)) {
          const { data: workoutSets, error: setsError } = await supabase
            .from('workout_sets')
            .select(selectSets)
            .in('workout_day_exercise_id', wdeChunk)
            .order('id', { ascending: true })
          if (setsError) {
            logger.error('Error fetching workout_sets by wde', setsError, { planWdeIds })
            throw setsError
          }
          for (const row of (workoutSets ?? []) as SetRow[]) {
            setsById.set(row.id, row)
          }
        }

        const setsMerged = Array.from(setsById.values())
        const rawSets = setsMerged.filter(
          (s) =>
            Boolean(s.completed_at) ||
            Boolean(typeof s.workout_log_id === 'string' && s.workout_log_id.trim().length > 0),
        )
        rawSets.sort((a, b) => {
          const ta =
            (a.completed_at && a.completed_at.trim()) ||
            (a.created_at && a.created_at.trim()) ||
            ''
          const tb =
            (b.completed_at && b.completed_at.trim()) ||
            (b.created_at && b.created_at.trim()) ||
            ''
          return ta.localeCompare(tb)
        })

        const setsCountByLogId = new Map<string, number>()
        for (const set of rawSets) {
          const lid = typeof set.workout_log_id === 'string' ? set.workout_log_id.trim() : ''
          if (!lid) continue
          setsCountByLogId.set(lid, (setsCountByLogId.get(lid) ?? 0) + 1)
        }

        const log_sessions: WorkoutLogSessionSummary[] = logIds
          .map((id) => {
            const m = workoutLogMetaById.get(id)
            if (!m) return null
            const row: WorkoutLogSessionSummary = {
              workout_log_id: id,
              calendar_date: resolveLogCalendarDate(m),
              stato: m.stato,
              volume_totale: m.volume_totale,
              duration_minutes: m.duration_minutes,
              exercises_completed: m.exercises_completed,
              sets_count: setsCountByLogId.get(id) ?? 0,
            }
            return row
          })
          .filter((x): x is WorkoutLogSessionSummary => x != null)
          .sort((a, b) => {
            const c = a.calendar_date.localeCompare(b.calendar_date)
            if (c !== 0) return c
            return a.workout_log_id.localeCompare(b.workout_log_id)
          })

        const effectiveWeightKg = (s: SetRow): number | null => {
          if (s.weight_kg != null && Number.isFinite(Number(s.weight_kg))) {
            return Number(s.weight_kg)
          }
          if (s.weight_used != null && Number.isFinite(Number(s.weight_used))) {
            return Number(s.weight_used)
          }
          return null
        }

        const effectiveReps = (s: SetRow): number | null => {
          if (s.reps != null && s.reps > 0) return s.reps
          if (s.reps_completed != null && s.reps_completed > 0) return s.reps_completed
          return null
        }

        const exerciseIdMap = new Map(planWdeRows.map((e) => [e.id, e.exercise_id]))
        const wdeIdsFromSets = [...new Set(rawSets.map((s) => s.workout_day_exercise_id))]
        const missingWdeIds = wdeIdsFromSets.filter((id) => !exerciseIdMap.has(id))

        for (const wdeChunk of chunkForSupabaseIn(missingWdeIds)) {
          const { data: wdeExtra, error: wdeExtraErr } = await supabase
            .from('workout_day_exercises')
            .select('id, exercise_id')
            .in('id', wdeChunk)
          if (wdeExtraErr) {
            logger.error('Error fetching workout_day_exercises for sets', wdeExtraErr, {
              missingWdeIds,
            })
            throw wdeExtraErr
          }
          for (const row of (wdeExtra ?? []) as WdeRow[]) {
            exerciseIdMap.set(row.id, row.exercise_id)
          }
        }

        const exerciseIdsForNames = [
          ...new Set([...uniqueExerciseIdsFromPlan, ...exerciseIdMap.values()]),
        ]

        type ExRow = { id: string; name: string; category?: string | null }
        const exercisesAccum: ExRow[] = []
        for (const exChunk of chunkForSupabaseIn(exerciseIdsForNames)) {
          const { data: exercisesData, error: exercisesNamesError } = await supabase
            .from('exercises')
            .select('id, name, category')
            .in('id', exChunk)
          if (exercisesNamesError) {
            logger.error('Error fetching exercises names', exercisesNamesError, {
              exerciseIdsForNames,
            })
            throw exercisesNamesError
          }
          exercisesAccum.push(...((exercisesData ?? []) as ExRow[]))
        }

        const exercisesMap = new Map(
          exercisesAccum.map((e) => [e.id, { name: e.name, category: e.category }]),
        )

        const uniqueExerciseIds = uniqueExerciseIdsFromPlan

        // STEP 7: Raggruppa i set per esercizio (tutti gli stati di sessione / serie su log)
        const exerciseStatsMap = new Map<string, ExerciseStat>()
        for (const set of rawSets) {
          const exerciseId = exerciseIdMap.get(set.workout_day_exercise_id)
          if (!exerciseId) continue

          const exerciseInfo = exercisesMap.get(exerciseId)
          if (!exerciseInfo) continue

          const date = resolveSetDisplayDate(set, workoutLogMetaById)
          if (!date) continue

          if (!exerciseStatsMap.has(exerciseId)) {
            exerciseStatsMap.set(exerciseId, {
              exercise_id: exerciseId,
              exercise_name: exerciseInfo.name,
              exercise_category: exerciseInfo.category,
              total_sessions: 0,
              total_sets: 0,
              average_weight: null,
              max_weight: null,
              min_weight: null,
              average_reps: null,
              average_seconds: null,
              first_date: null,
              last_date: null,
              dataPoints: [],
            })
          }

          const stat = exerciseStatsMap.get(exerciseId)!
          const wKg = effectiveWeightKg(set)
          const logId = typeof set.workout_log_id === 'string' ? set.workout_log_id.trim() : ''
          const logStato = logId ? (workoutLogMetaById.get(logId)?.stato ?? null) : null
          stat.dataPoints.push({
            date,
            weight_kg: wKg != null ? wKg : 0,
            reps: effectiveReps(set),
            execution_time_sec: set.execution_time_sec ?? null,
            set_number: set.set_number,
            workout_log_id: set.workout_log_id ?? null,
            workout_day_exercise_id: set.workout_day_exercise_id,
            workout_log_stato: logStato,
          })
        }

        // Esercizi assegnati ma mai eseguiti: aggiungi alla mappa con dati vuoti
        for (const exerciseId of uniqueExerciseIds) {
          if (exerciseStatsMap.has(exerciseId)) continue
          const exerciseInfo = exercisesMap.get(exerciseId)
          if (!exerciseInfo) continue
          exerciseStatsMap.set(exerciseId, {
            exercise_id: exerciseId,
            exercise_name: exerciseInfo.name,
            exercise_category: exerciseInfo.category,
            total_sessions: 0,
            total_sets: 0,
            average_weight: null,
            max_weight: null,
            min_weight: null,
            average_reps: null,
            average_seconds: null,
            first_date: null,
            last_date: null,
            dataPoints: [],
          })
        }

        // STEP 8: Calcola statistiche per ogni esercizio
        const exercises: ExerciseStat[] = []
        const allDates: string[] = []

        for (const [, stat] of exerciseStatsMap.entries()) {
          const sessionKeys = new Set(
            stat.dataPoints.map((dp) => dp.workout_log_id ?? `${dp.date}-${dp.set_number}`),
          )
          const datesSet = new Set(stat.dataPoints.map((dp) => dp.date))
          stat.total_sessions = sessionKeys.size
          stat.total_sets = stat.dataPoints.length

          const weights = stat.dataPoints.map((dp) => dp.weight_kg).filter((w) => w > 0)
          if (weights.length > 0) {
            stat.average_weight = weights.reduce((a, b) => a + b, 0) / weights.length
            stat.max_weight = Math.max(...weights)
            stat.min_weight = Math.min(...weights)
          }

          const repsList = stat.dataPoints
            .map((dp) => dp.reps)
            .filter((r): r is number => r != null && r > 0)
          if (repsList.length > 0) {
            stat.average_reps = repsList.reduce((a, b) => a + b, 0) / repsList.length
          }

          const secondsList = stat.dataPoints
            .map((dp) => dp.execution_time_sec)
            .filter((s): s is number => s != null && s > 0)
          if (secondsList.length > 0) {
            stat.average_seconds = secondsList.reduce((a, b) => a + b, 0) / secondsList.length
          }

          const dates = Array.from(datesSet).sort()
          if (dates.length > 0) {
            stat.first_date = dates[0]
            stat.last_date = dates[dates.length - 1]
            allDates.push(...dates)
          }

          stat.dataPoints.sort((a, b) => a.date.localeCompare(b.date))
          exercises.push(stat)
        }

        // Ordina esercizi per nome
        exercises.sort((a, b) => a.exercise_name.localeCompare(b.exercise_name))

        // Calcola date range totale
        const sortedDates = [...new Set(allDates)].sort()
        const date_range = {
          from: sortedDates.length > 0 ? sortedDates[0] : null,
          to: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null,
        }

        // Sessioni totali da workout_logs (tutti gli stati), non dalle date dei set
        const totalSessions = totalSessionsFromLogs

        logger.debug('Workout exercise stats fetched', undefined, {
          total_exercises: exercises.length,
          total_sessions: totalSessions,
          date_range,
        })

        return {
          exercises,
          total_exercises: exercises.length,
          total_sessions: totalSessions,
          date_range,
          log_sessions,
        }
      } catch (error) {
        logger.error('Error in useWorkoutExerciseStats', error, { athleteUserId })
        throw error
      }
    },
    enabled: !!athleteUserId,
    staleTime: 1000 * 60 * 5, // 5 minuti
    refetchOnMount: true,
  })

  return {
    data,
    isLoading,
    error,
    refetch,
  }
}
