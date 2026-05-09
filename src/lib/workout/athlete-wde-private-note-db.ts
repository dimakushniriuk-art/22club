/** Errori PostgREST/client quando la colonna image non è ancora sul DB. */
export function isMissingAthleteWdeNoteImageColumnError(
  error: { message?: string; code?: string } | null,
): boolean {
  if (!error) return false
  const m = (error.message ?? '').toLowerCase()
  const c = error.code ?? ''
  return (
    c === 'PGRST204' ||
    m.includes('image_storage_path') ||
    (m.includes('schema cache') && m.includes('column'))
  )
}
