/**
 * Id esercizio catalogo (`exercises.id`) da una voce sessione atleta (shape tollerante).
 */
export function catalogExerciseIdFromSessionExercise(ex: unknown): string | null {
  if (!ex || typeof ex !== 'object') return null
  const r = ex as Record<string, unknown>
  const top = r.exercise_id
  if (typeof top === 'string' && top.trim()) return top.trim()
  const nested = r.exercise
  if (nested && typeof nested === 'object') {
    const id = (nested as { id?: unknown }).id
    if (typeof id === 'string' && id.trim()) return id.trim()
  }
  return null
}
