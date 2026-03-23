// ============================================================
// Validazione Target Workout (P4-009)
// ============================================================
// Valida che i target (serie, ripetizioni, peso) siano ragionevoli
// ============================================================

import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'
import type { WorkoutDayExerciseData } from '@/types/workout'

export interface WorkoutTargetValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface WorkoutTarget {
  target_sets?: number | null
  target_reps?: number | null
  target_weight?: number | null
  rest_timer_sec?: number | null
}

/**
 * Valida un target workout
 * @param target Target da validare
 * @returns Risultato validazione con errori e warning
 */
export function validateWorkoutTarget(target: WorkoutTarget): WorkoutTargetValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Validazione serie
  if (target.target_sets !== undefined && target.target_sets !== null) {
    if (target.target_sets < 1) {
      errors.push('Il numero di serie deve essere almeno 1')
    } else if (target.target_sets > 20) {
      warnings.push('Numero di serie elevato (>20). Verifica che sia corretto.')
    } else if (target.target_sets > 10) {
      warnings.push("Numero di serie alto (>10). Assicurati che sia appropriato per l'atleta.")
    }
  }

  // Validazione ripetizioni (MAX = sentinel -1)
  if (target.target_reps !== undefined && target.target_reps !== null) {
    if (target.target_reps === WORKOUT_REPS_MAX_SENTINEL) {
      // ok
    } else if (target.target_reps < 1) {
      errors.push('Il numero di ripetizioni deve essere almeno 1')
    } else if (target.target_reps > 100) {
      warnings.push('Numero di ripetizioni molto elevato (>100). Verifica che sia corretto.')
    } else if (target.target_reps > 50) {
      warnings.push(
        "Numero di ripetizioni alto (>50). Assicurati che sia appropriato per l'atleta.",
      )
    }
  }

  // Validazione peso
  if (target.target_weight !== undefined && target.target_weight !== null) {
    if (target.target_weight < 0) {
      errors.push('Il peso non può essere negativo')
    } else if (target.target_weight > 500) {
      warnings.push('Peso molto elevato (>500kg). Verifica che sia corretto.')
    } else if (target.target_weight > 300) {
      warnings.push("Peso elevato (>300kg). Assicurati che sia appropriato per l'atleta.")
    }
  }

  // Validazione tempo di recupero
  if (target.rest_timer_sec !== undefined && target.rest_timer_sec !== null) {
    if (target.rest_timer_sec < 0) {
      errors.push('Il tempo di recupero non può essere negativo')
    } else if (target.rest_timer_sec > 600) {
      warnings.push('Tempo di recupero molto lungo (>10 minuti). Verifica che sia corretto.')
    } else if (target.rest_timer_sec < 15) {
      warnings.push('Tempo di recupero molto breve (<15 secondi). Assicurati che sia appropriato.')
    }
  }

  // Validazione coerenza: se ci sono serie, dovrebbero esserci anche ripetizioni
  if (
    target.target_sets !== undefined &&
    target.target_sets !== null &&
    target.target_sets > 0 &&
    (target.target_reps === undefined || target.target_reps === null || target.target_reps === 0)
  ) {
    warnings.push(
      'Sono state impostate serie ma non ripetizioni. Assicurati di completare tutti i campi.',
    )
  }

  // Validazione coerenza: se ci sono ripetizioni, dovrebbero esserci anche serie
  if (
    target.target_reps !== undefined &&
    target.target_reps !== null &&
    (target.target_reps > 0 || target.target_reps === WORKOUT_REPS_MAX_SENTINEL) &&
    (target.target_sets === undefined || target.target_sets === null || target.target_sets === 0)
  ) {
    warnings.push(
      'Sono state impostate ripetizioni ma non serie. Assicurati di completare tutti i campi.',
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Valida un array di target workout
 * @param targets Array di target da validare
 * @returns Risultato validazione aggregato
 */
export function validateWorkoutTargets(targets: WorkoutTarget[]): WorkoutTargetValidation {
  const allErrors: string[] = []
  const allWarnings: string[] = []

  targets.forEach((target, index) => {
    const validation = validateWorkoutTarget(target)
    if (validation.errors.length > 0) {
      allErrors.push(`Esercizio ${index + 1}: ${validation.errors.join(', ')}`)
    }
    if (validation.warnings.length > 0) {
      allWarnings.push(`Esercizio ${index + 1}: ${validation.warnings.join(', ')}`)
    }
  })

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  }
}

/** Valori di default alla creazione esercizio nel wizard (use-workout-wizard addExerciseToDay). */
const WIZARD_NEW_EXERCISE_DEFAULT_SETS = 1
const WIZARD_NEW_EXERCISE_DEFAULT_REPS = 10
const WIZARD_NEW_EXERCISE_DEFAULT_REST_SEC = 60

/** True se l’utente ha personalizzato target o note rispetto ai default del wizard. */
export function isWorkoutExerciseConfigured(ex: WorkoutDayExerciseData): boolean {
  if (ex.note?.trim()) return true
  if (ex.sets_detail && ex.sets_detail.length > 0) return true
  if ((ex.target_sets ?? WIZARD_NEW_EXERCISE_DEFAULT_SETS) !== WIZARD_NEW_EXERCISE_DEFAULT_SETS)
    return true
  if ((ex.target_reps ?? WIZARD_NEW_EXERCISE_DEFAULT_REPS) !== WIZARD_NEW_EXERCISE_DEFAULT_REPS)
    return true
  if ((ex.target_weight ?? 0) > 0) return true
  if ((ex.execution_time_sec ?? 0) > 0) return true
  const rest = ex.rest_timer_sec
  if (rest != null && rest !== WIZARD_NEW_EXERCISE_DEFAULT_REST_SEC) return true
  return false
}
