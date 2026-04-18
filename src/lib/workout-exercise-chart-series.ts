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

/**
 * Serie da `workout_sets` aggregate per giorno: sul grafico compaiono solo le date in cui la
 * metrica principale (peso / reps / tempo) ha un valore.
 */
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
    if (!dayData.workout_log_id && point.workout_log_id)
      dayData.workout_log_id = point.workout_log_id
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

  const sessionRows = Array.from(sessionMap.values()).map((sessionData) => {
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

  type DayAgg = {
    date: string
    maxPeso: number
    repsVals: number[]
    secondVals: number[]
    workout_log_id: string | null
    workout_day_exercise_id: string | null
  }

  const byDate = new Map<string, DayAgg>()
  for (const row of sessionRows) {
    const d = row.date
    const cur: DayAgg =
      byDate.get(d) ??
      ({
        date: d,
        maxPeso: 0,
        repsVals: [],
        secondVals: [],
        workout_log_id: null,
        workout_day_exercise_id: null,
      } satisfies DayAgg)
    const p = row.peso_massimo_sessione
    if (p > cur.maxPeso) {
      cur.maxPeso = p
      if (row.workout_log_id) cur.workout_log_id = row.workout_log_id
      if (row.workout_day_exercise_id) cur.workout_day_exercise_id = row.workout_day_exercise_id
    } else {
      cur.maxPeso = Math.max(cur.maxPeso, p)
    }
    if (row.reps_media != null && row.reps_media > 0) cur.repsVals.push(row.reps_media)
    if (row.seconds_media != null && row.seconds_media > 0) cur.secondVals.push(row.seconds_media)
    byDate.set(d, cur)
  }

  const sortedDates = [...byDate.keys()].sort((a, b) => a.localeCompare(b))

  type ChartRow = {
    date: string
    peso_massimo_sessione: number
    reps_media: number | null
    seconds_media: number | null
    workout_log_id: string | null
    workout_day_exercise_id: string | null
  }

  const chartDataUnfiltered: ChartRow[] = sortedDates.map((date) => {
    const agg = byDate.get(date)!
    const reps_media = agg.repsVals.length > 0 ? Math.max(...agg.repsVals) : null
    const seconds_media = agg.secondVals.length > 0 ? Math.max(...agg.secondVals) : null
    return {
      date,
      peso_massimo_sessione: agg.maxPeso,
      reps_media,
      seconds_media,
      workout_log_id: agg.workout_log_id,
      workout_day_exercise_id: agg.workout_day_exercise_id,
    }
  })

  const hasWeightUnfiltered = chartDataUnfiltered.some((d) => d.peso_massimo_sessione > 0)
  const hasRepsUnfiltered = chartDataUnfiltered.some((d) => d.reps_media != null)

  let primaryValue: (row: ChartRow) => number | null
  let unit: string
  let labelShort: string
  let sentimentField: string

  if (hasWeightUnfiltered) {
    primaryValue = (row) => (row.peso_massimo_sessione > 0 ? row.peso_massimo_sessione : null)
    unit = ' kg'
    labelShort = 'Peso max sessione'
    sentimentField = WORKOUT_STAT_FIELD_WEIGHT
  } else if (hasRepsUnfiltered) {
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

  const chartData = chartDataUnfiltered.filter((row) => {
    const v = primaryValue(row)
    return v != null && Number.isFinite(v)
  })

  const hasWeight = chartData.some((d) => d.peso_massimo_sessione > 0)
  const hasReps = chartData.some((d) => d.reps_media != null)
  const hasTime = chartData.some((d) => d.seconds_media != null)

  const history: Array<{ date: string; value: number | null }> = chartData.map((row) => ({
    date: row.date,
    value: primaryValue(row),
  }))

  const numericVals = history
    .map((h) => h.value)
    .filter((v): v is number => v != null && Number.isFinite(v))
  const currentValue = numericVals.length > 0 ? numericVals[numericVals.length - 1]! : null

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
