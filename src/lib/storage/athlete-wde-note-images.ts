/** Bucket privato: path `{profile_id}/{workout_day_exercise_id}/{uuid}.{ext}` */
export const ATHLETE_WDE_NOTE_IMAGES_BUCKET = 'athlete-wde-note-images'

export const ATHLETE_WDE_NOTE_IMAGE_MAX_BYTES = 5 * 1024 * 1024

export const ATHLETE_WDE_NOTE_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const
