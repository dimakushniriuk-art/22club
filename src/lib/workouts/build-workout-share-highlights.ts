/**
 * Badge automatici solo da dati reali — niente streak/volume % inventati.
 */
export type BuildWorkoutShareHighlightsInput = {
  completionPct: number
  completedExercises: number
  totalExercises: number
  completedSets: number
  totalSets: number
  personalRecordsCount: number
}

export function buildWorkoutShareHighlights(input: BuildWorkoutShareHighlightsInput): string[] {
  const out: string[] = []

  const fullSession =
    input.totalExercises > 0 &&
    input.completedExercises === input.totalExercises &&
    input.totalSets > 0 &&
    input.completedSets === input.totalSets

  if (fullSession) {
    out.push('Workout completato')
  } else if (input.completionPct >= 100 && input.totalExercises > 0) {
    out.push('Obiettivo raggiunto')
  }

  if (input.personalRecordsCount > 0) {
    out.push(
      input.personalRecordsCount === 1
        ? 'Nuovo record personale'
        : `${input.personalRecordsCount} nuovi record`,
    )
  }

  return [...new Set(out)].slice(0, 4)
}
