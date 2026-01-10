// ============================================================
// Validazione URL Video (P4-006)
// ============================================================
// Supporta YouTube, Vimeo, e URL diretti a file video
// ============================================================

/**
 * Pattern per riconoscere URL video supportati
 */
const VIDEO_URL_PATTERNS = {
  youtube: [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
    /^https?:\/\/youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/youtube\.com\/embed\/[\w-]+/,
  ],
  vimeo: [/^https?:\/\/(www\.)?vimeo\.com\/\d+/, /^https?:\/\/player\.vimeo\.com\/video\/\d+/],
  direct: [/^https?:\/\/.+\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)(\?.*)?$/i],
}

/**
 * Valida se un URL è un formato video supportato
 * @param url URL da validare
 * @returns true se l'URL è valido, false altrimenti
 */
export function isValidVideoUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return true // URL opzionale, se vuoto è valido
  }

  const trimmedUrl = url.trim()

  // Verifica pattern YouTube
  if (VIDEO_URL_PATTERNS.youtube.some((pattern) => pattern.test(trimmedUrl))) {
    return true
  }

  // Verifica pattern Vimeo
  if (VIDEO_URL_PATTERNS.vimeo.some((pattern) => pattern.test(trimmedUrl))) {
    return true
  }

  // Verifica URL diretto a file video
  if (VIDEO_URL_PATTERNS.direct.some((pattern) => pattern.test(trimmedUrl))) {
    return true
  }

  // Verifica formato URL generico valido
  try {
    const urlObj = new URL(trimmedUrl)
    // Se è un URL valido ma non corrisponde a nessun pattern, accettalo comunque
    // (potrebbe essere un CDN o altro servizio video)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Ottiene il tipo di URL video
 * @param url URL da analizzare
 * @returns 'youtube' | 'vimeo' | 'direct' | 'unknown'
 */
export function getVideoUrlType(
  url: string | null | undefined,
): 'youtube' | 'vimeo' | 'direct' | 'unknown' {
  if (!url || typeof url !== 'string') {
    return 'unknown'
  }

  const trimmedUrl = url.trim()

  if (VIDEO_URL_PATTERNS.youtube.some((pattern) => pattern.test(trimmedUrl))) {
    return 'youtube'
  }

  if (VIDEO_URL_PATTERNS.vimeo.some((pattern) => pattern.test(trimmedUrl))) {
    return 'vimeo'
  }

  if (VIDEO_URL_PATTERNS.direct.some((pattern) => pattern.test(trimmedUrl))) {
    return 'direct'
  }

  return 'unknown'
}

/**
 * Messaggio di errore per URL video non valido
 */
export const VIDEO_URL_ERROR_MESSAGE =
  'URL video non valido. Supportati: YouTube, Vimeo, o URL diretti a file video (MP4, WebM, OGG, MOV, AVI, MKV, FLV, WMV)'
