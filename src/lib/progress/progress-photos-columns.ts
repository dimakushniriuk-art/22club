/**
 * Colonne minime per letture lista/galleria `progress_photos` (evita select('*')).
 * Allineare a {@link ProgressPhoto} in `src/types/progress.ts`.
 */
export const PROGRESS_PHOTOS_LIST_COLUMNS =
  'id, athlete_id, date, angle, image_url, note, created_at, updated_at, session_saved_at' as const
