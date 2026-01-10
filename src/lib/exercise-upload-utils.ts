// 🎥 Exercise Upload Utilities — 22Club

/**
 * Formati video supportati
 */
export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // MOV
  'video/x-msvideo', // AVI
] as const

export type SupportedVideoFormat = (typeof SUPPORTED_VIDEO_FORMATS)[number]

/**
 * Formati immagine supportati per thumbnail
 */
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

export type SupportedImageFormat = (typeof SUPPORTED_IMAGE_FORMATS)[number]

/**
 * Limiti dimensione file
 */
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
export const MAX_THUMB_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Estensioni file supportate per video
 */
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi'] as const

/**
 * Estensioni file supportate per immagini
 */
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

/**
 * Valida file video
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // 1. Controlla tipo MIME
  if (!SUPPORTED_VIDEO_FORMATS.includes(file.type as SupportedVideoFormat)) {
    return {
      valid: false,
      error: `Formato video non supportato. Formati supportati: MP4, WebM, OGG, MOV, AVI.`,
    }
  }

  // 2. Controlla estensione file (fallback se MIME type non è affidabile)
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!VIDEO_EXTENSIONS.includes(fileExt as any)) {
    return {
      valid: false,
      error: `Estensione file non supportata. Estensioni supportate: ${VIDEO_EXTENSIONS.join(', ')}`,
    }
  }

  // 3. Controlla dimensione (max 50MB)
  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `File troppo grande. Dimensione massima: ${(MAX_VIDEO_SIZE / 1024 / 1024).toFixed(0)}MB`,
    }
  }

  return { valid: true }
}

/**
 * Valida file immagine per thumbnail
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 1. Controlla tipo MIME
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type as SupportedImageFormat)) {
    return {
      valid: false,
      error: `Formato immagine non supportato. Formati supportati: JPG, PNG, WebP.`,
    }
  }

  // 2. Controlla estensione file (fallback se MIME type non è affidabile)
  const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!IMAGE_EXTENSIONS.includes(fileExt as any)) {
    return {
      valid: false,
      error: `Estensione file non supportata. Estensioni supportate: ${IMAGE_EXTENSIONS.join(', ')}`,
    }
  }

  // 3. Controlla dimensione (max 5MB)
  if (file.size > MAX_THUMB_SIZE) {
    return {
      valid: false,
      error: `File troppo grande. Dimensione massima: ${(MAX_THUMB_SIZE / 1024 / 1024).toFixed(0)}MB`,
    }
  }

  return { valid: true }
}

/**
 * Formatta dimensione file in formato leggibile
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Genera nome file univoco per upload
 */
export function generateUniqueFileName(userId: string, originalFileName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const ext = originalFileName.split('.').pop() || 'mp4'
  return `${userId}/${timestamp}-${random}.${ext}`
}
