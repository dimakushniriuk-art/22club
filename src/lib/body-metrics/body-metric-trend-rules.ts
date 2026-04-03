/**
 * Regole “caso base” ricomposizione / dimagrimento controllato:
 * verso migliore = success, peggiore = danger, neutro = neutral.
 * Chiavi allineate a `misurazioneField` in `misurazioni-values-content` / `progress_logs`.
 */

export type BodyMetricTrendRule = 'decrease_is_good' | 'increase_is_good' | 'neutral'

export type BodyMetricDeltaSentiment = 'success' | 'danger' | 'neutral'

/** Chiavi note (estensione tramite nuove entry in BODY_METRIC_TREND_RULES). */
export type BodyMetricFieldKey = keyof typeof BODY_METRIC_TREND_RULES

/** Mappa esplicita: una sola rule per metrica. */
export const BODY_METRIC_TREND_RULES = {
  peso_kg: 'decrease_is_good',
  massa_grassa_percentuale: 'decrease_is_good',
  massa_grassa_kg: 'decrease_is_good',
  massa_magra_kg: 'increase_is_good',
  massa_muscolare_kg: 'increase_is_good',
  massa_muscolare_scheletrica_kg: 'increase_is_good',

  vita_alta_cm: 'decrease_is_good',
  vita_cm: 'decrease_is_good',
  addome_basso_cm: 'decrease_is_good',
  fianchi_cm: 'decrease_is_good',

  spalle_cm: 'increase_is_good',
  torace_cm: 'increase_is_good',
  torace_inspirazione_cm: 'increase_is_good',
  braccio_rilassato_cm: 'increase_is_good',
  braccio_contratto_cm: 'increase_is_good',
  biceps_cm: 'increase_is_good',
  glutei_cm: 'increase_is_good',
  coscia_alta_cm: 'increase_is_good',
  coscia_media_cm: 'increase_is_good',
  coscia_bassa_cm: 'increase_is_good',
  polpaccio_cm: 'increase_is_good',

  collo_cm: 'neutral',
  avambraccio_cm: 'neutral',
  polso_cm: 'neutral',
  ginocchio_cm: 'neutral',
  caviglia_cm: 'neutral',

  /** Statistiche esercizio (progressi allenamenti): peso/reps su, tempo neutro. */
  workout_stat_weight: 'increase_is_good',
  workout_stat_reps: 'increase_is_good',
  workout_stat_time: 'neutral',
} as const satisfies Record<string, BodyMetricTrendRule>

export function getBodyMetricTrendRule(metricKey: string): BodyMetricTrendRule {
  const key = metricKey.trim()
  if (!key) return 'neutral'
  const r = BODY_METRIC_TREND_RULES[key as BodyMetricFieldKey]
  return r ?? 'neutral'
}

/**
 * @param delta Variazione relativa in percentuale (es. da primo punto o vs precedente).
 */
export function getBodyMetricDeltaSentiment(
  metricKey: string,
  delta: number | null | undefined,
): BodyMetricDeltaSentiment {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return 'neutral'
  const rule = getBodyMetricTrendRule(metricKey)
  if (rule === 'neutral') return 'neutral'
  if (delta === 0) return 'neutral'
  if (rule === 'decrease_is_good') {
    if (delta < 0) return 'success'
    return 'danger'
  }
  if (rule === 'increase_is_good') {
    if (delta > 0) return 'success'
    return 'danger'
  }
  return 'neutral'
}

/** Solo colore testo Tailwind (font/weight sui componenti). */
export function bodyMetricDeltaSentimentTextColorClass(
  sentiment: BodyMetricDeltaSentiment,
): string {
  switch (sentiment) {
    case 'success':
      return 'text-emerald-400/90'
    case 'danger':
      return 'text-red-400/90'
    default:
      return 'text-text-primary'
  }
}
