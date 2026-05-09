/**
 * Validazione URL media esercizi condivisa tra client (form) e API route.
 * Thumb più restrittiva (solo storage esercizi o URL immagine evidenti).
 */

import { isValidVideoUrl, VIDEO_URL_ERROR_MESSAGE } from '@/lib/validations/video-url'

export function normalizeOptionalMediaUrl(url: unknown): string | null {
  if (url === null || url === undefined) return null
  if (typeof url !== 'string') return null
  const t = url.trim()
  return t.length === 0 ? null : t
}

export function isPublicExerciseVideoStorageUrl(url: string): boolean {
  return /\/storage\/v1\/object\/public\/exercise-videos\//.test(url)
}

export function isPublicExerciseThumbStorageUrl(url: string): boolean {
  return /\/storage\/v1\/object\/public\/exercise-thumbs\//.test(url)
}

/** Messaggio errore per thumbnail non consentita (API / form). */
export const THUMB_URL_ERROR_MESSAGE =
  'URL copertina non consentito: usa un file caricato nell’app o un link HTTPS a un’immagine (jpg, png, webp, …).'

/**
 * Validazione video: vuoto OK; altrimenti URL pubblico bucket exercise-videos o formato video supportato (come client).
 */
export function validateExerciseVideoUrl(url: string | null | undefined): string | undefined {
  const n = normalizeOptionalMediaUrl(url)
  if (n === null) return undefined
  if (isPublicExerciseVideoStorageUrl(n)) return undefined
  if (!isValidVideoUrl(n)) return VIDEO_URL_ERROR_MESSAGE
  return undefined
}

/**
 * Validazione thumbnail: vuoto OK; altrimenti bucket exercise-thumbs o URL che sembra un’immagine.
 */
export function validateExerciseThumbUrl(url: string | null | undefined): string | undefined {
  const n = normalizeOptionalMediaUrl(url)
  if (n === null) return undefined
  if (isPublicExerciseThumbStorageUrl(n)) return undefined
  try {
    const u = new URL(n)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return THUMB_URL_ERROR_MESSAGE
    if (/\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i.test(u.pathname)) return undefined
  } catch {
    return THUMB_URL_ERROR_MESSAGE
  }
  return THUMB_URL_ERROR_MESSAGE
}
