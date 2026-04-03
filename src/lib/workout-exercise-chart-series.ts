import type { ExerciseStat } from '@/hooks/use-workout-exercise-stats'

/** Chiavi per `getBodyMetricDeltaSentiment` nei grafici esercizio (trend “migliore”). */
export const WORKOUT_STAT_FIELD_WEIGHT = 'workout_stat_weight'
export const WORKOUT_STAT_FIELD_REPS = 'workout_stat_reps'
export const WORKOUT_STAT_FIELD_TIME = 'workout_stat_time'

export type WorkoutExerciseSeries = {
  chartData: Array<{
    date: string
    peso_massimo_sessione: number
    reps_media: number | null
    seconds_media: number | null
    /** Per mutazioni su `workout_sets` (stesso valore per tutti i set della sessione). */
    workout_log_id: string | null
    workout_day_exercise_id: string | null
  }>
  hasWeight: boolean
  hasReps: boolean
  hasTime: boolean
  /** Valore principale per sessione (punto grafico / ultimo valore). */
  primaryValue: (row: WorkoutExerciseSeries['chartData'][0]) => number | null
  unit: string
  labelShort: string
  sentimentField: string
  /** Storico per `RangeStatusMeter` */
  history: Array<{ date: string; value: number | null }>
  /** Ultimo valore numerico dello storico (o null). */
  currentValue: number | null
}

export function buildWorkoutExerciseSeries(exercise: ExerciseStat): WorkoutExerciseSeries {
  const sessionMap = new Map<
    string,
    {
      date: string
      workout_log_id: string | null
      workout_day_exercise_id: string | null
      weights: number[]
      reps: number[]
      seconds: number[]
    }
  >()

  for (const point of exercise.dataPoints) {
    const wde = point.workout_day_exercise_id?.trim() || ''
    const logId = point.workout_log_id?.trim() || ''
    /** Una sessione = stesso log + stesso slot scheda (wde). Senza log: stesso slot + stessa data. */
    const sessionKey =
      logId && wde
        ? `${logId}:${wde}`
        : wde
          ? `wde-${wde}-${point.date}`
          : `${point.date}-${point.set_number}`
    if (!sessionMap.has(sessionKey)) {
      sessionMap.set(sessionKey, {
        date: point.date,
        workout_log_id: point.workout_log_id ?? null,
        workout_day_exercise_id: point.workout_day_exercise_id ?? null,
        weights: [],
        reps: [],
        seconds: [],
      })
    }
    const dayData = sessionMap.get(sessionKey)!
    if (point.date > dayData.date) dayData.date = point.date
    if (!dayData.workout_log_id && point.workout_log_id) dayData.workout_log_id = point.workout_log_id
    if (!dayData.workout_day_exercise_id && point.workout_day_exercise_id) {
      dayData.workout_day_exercise_id = point.workout_day_exercise_id
    }
    dayData.weights.push(point.weight_kg)
    if (point.reps != null && point.reps > 0) {
      dayData.reps.push(point.reps)
    }
    if (point.execution_time_sec != null && point.execution_time_sec > 0) {
      dayData.seconds.push(point.execution_time_sec)
    }
  }

  const chartData = Array.from(sessionMap.values())
    .map((sessionData) => {
      const pesoMassimoSessione =
        sessionData.weights.length > 0 ? Math.max(...sessionData.weights) : null
      return {
        date: sessionData.date,
        peso_massimo_sessione: pesoMassimoSessione ?? 0,
        reps_media:
          sessionData.reps.length > 0
            ? sessionData.reps.reduce((a, b) => a + b, 0) / sessionData.reps.length
            : null,
        seconds_media:
          sessionData.seconds.length > 0
            ? sessionData.seconds.reduce((a, b) => a + b, 0) / sessionData.seconds.length
            : null,
        workout_log_id: sessionData.workout_log_id,
        workout_day_exercise_id: sessionData.workout_day_exercise_id,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const hasWeight = chartData.some((d) => d.peso_massimo_sessione > 0)
  const hasReps = chartData.some((d) => d.reps_media != null)
  const hasTime = chartData.some((d) => d.seconds_media != null)

  let primaryValue: (row: (typeof chartData)[0]) => number | null
  let unit: string
  let labelShort: string
  let sentimentField: string

  if (hasWeight) {
    primaryValue = (row) => (row.peso_massimo_sessione > 0 ? row.peso_massimo_sessione : null)
    unit = ' kg'
    labelShort = 'Peso max sessione'
    sentimentField = WORKOUT_STAT_FIELD_WEIGHT
  } else if (hasReps) {
    primaryValue = (row) => (row.reps_media != null ? row.reps_media : null)
    unit = ''
    labelShort = 'Reps medie'
    sentimentField = WORKOUT_STAT_FIELD_REPS
  } else {
    primaryValue = (row) => (row.seconds_media != null ? row.seconds_media : null)
    unit = ' s'
    labelShort = 'Tempo medio'
    sentimentField = WORKOUT_STAT_FIELD_TIME
  }

  const history: Array<{ date: string; value: number | null }> = chartData.map((row) => ({
    date: row.date,
    value: primaryValue(row),
  }))

  const numericVals = history.map((h) => h.value).filter((v): v is number => v != null && Number.isFinite(v))
  const currentValue =
    numericVals.length > 0 ? numericVals[numericVals.length - 1]! : null

  return {
    chartData,
    hasWeight,
    hasReps,
    hasTime,
    primaryValue,
    unit,
    labelShort,
    sentimentField,
    history,
    currentValue,
  }
}
