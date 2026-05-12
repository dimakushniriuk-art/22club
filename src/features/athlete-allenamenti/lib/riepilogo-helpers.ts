import { WORKOUT_REPS_MAX_SENTINEL } from '@/lib/constants/workout-reps-select'

export type RiepilogoExerciseMedia = {
  video_url?: string | null
  thumb_url?: string | null
  image_url?: string | null
  thumbnail_url?: string | null
}

export function formatVolumeIt(kg: number): string {
  const n = Math.round(kg)
  return new Intl.NumberFormat('it-IT').format(n)
}

/** Ripetizioni MAX (-1) non contribuiscono al volume kg·rep. */
export function repsForVolumeKgRep(reps: number): number {
  return reps === WORKOUT_REPS_MAX_SENTINEL ? 0 : reps
}

export function difficultyLabelIt(code: string): string {
  const c = (code ?? '').toLowerCase().trim()
  const map: Record<string, string> = {
    beginner: 'Principiante',
    easy: 'Principiante',
    bassa: 'Principiante',
    intermediate: 'Intermedio',
    medium: 'Intermedio',
    media: 'Intermedio',
    advanced: 'Avanzato',
    hard: 'Avanzato',
    alta: 'Avanzato',
  }
  return map[c] ?? code
}

export function muscleLabelIt(raw: string): string {
  const s = (raw ?? '').trim()
  if (!s || s === 'unknown') return 'Gruppo muscolare'
  return s
}

/** Immagine per export Instagram: thumb / thumbnail_url / image_url (no video come sorgente img). */
export function pickExerciseSharePreviewUrl(
  ex: RiepilogoExerciseMedia,
  origin?: string,
): string | null {
  for (const u of [ex.thumb_url, ex.thumbnail_url, ex.image_url]) {
    if (typeof u !== 'string') continue
    const t = u.trim()
    if (!t) continue
    if (t.startsWith('http://') || t.startsWith('https://')) return t
    if (t.startsWith('/') && origin) {
      return new URL(t, origin).href
    }
  }
  return null
}

export function pickExerciseShareVideoUrl(
  ex: RiepilogoExerciseMedia,
  origin?: string,
): string | null {
  const u = ex.video_url
  if (typeof u !== 'string') return null
  const t = u.trim()
  if (!t) return null
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  if (t.startsWith('/') && origin) {
    return new URL(t, origin).href
  }
  return null
}
