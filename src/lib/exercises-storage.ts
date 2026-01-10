// ============================================================
// Utility per Gestione File Storage Esercizi
// ============================================================
// Helper functions per estrazione path e eliminazione file
// da Supabase Storage per esercizi (video e thumbnail)
// ============================================================

import { createLogger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

const logger = createLogger('lib:exercises-storage')

/**
 * Estrae il path del file dall'URL pubblico Supabase Storage
 * @param publicUrl URL pubblico da Supabase Storage
 * @returns Path del file (es: "user-id/timestamp-random.ext") o null
 */
export function extractStoragePath(publicUrl: string | null | undefined): string | null {
  if (!publicUrl || typeof publicUrl !== 'string') {
    return null
  }

  try {
    // Pattern: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    // Esempio: https://xxx.supabase.co/storage/v1/object/public/exercise-videos/user-id/timestamp-random.mp4
    const match = publicUrl.match(/\/(exercise-videos|exercise-thumbs)\/(.+)$/)
    return match ? match[2] : null
  } catch {
    return null
  }
}

/**
 * Determina il bucket dall'URL pubblico Supabase Storage
 * @param publicUrl URL pubblico da Supabase Storage
 * @returns Nome bucket o null
 */
export function extractBucketFromUrl(
  publicUrl: string | null | undefined,
): 'exercise-videos' | 'exercise-thumbs' | null {
  if (!publicUrl || typeof publicUrl !== 'string') {
    return null
  }

  try {
    if (publicUrl.includes('/exercise-videos/')) {
      return 'exercise-videos'
    }
    if (publicUrl.includes('/exercise-thumbs/')) {
      return 'exercise-thumbs'
    }
    return null
  } catch {
    return null
  }
}

/**
 * Elimina file da Supabase Storage
 * @param supabase Client Supabase
 * @param bucket Nome bucket
 * @param filePath Path del file
 * @returns true se eliminato con successo, false altrimenti
 */
export async function deleteStorageFile(
  supabase: SupabaseClient,
  bucket: 'exercise-videos' | 'exercise-thumbs',
  filePath: string,
): Promise<boolean> {
  if (!filePath) {
    return false
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath])
    if (error) {
      logger.error('Errore eliminazione file da bucket', error, {
        filePath,
        bucket,
        errorName: error.name,
        errorMessage: error.message,
      })
      return false
    }
    logger.debug('File eliminato con successo', undefined, { filePath, bucket })
    return true
  } catch (err) {
    logger.error('Errore eliminazione file', err, { filePath, bucket })
    return false
  }
}

/**
 * Elimina file da storage basandosi sull'URL pubblico
 * @param supabase Client Supabase
 * @param publicUrl URL pubblico del file
 * @returns true se eliminato con successo, false altrimenti
 */
export async function deleteStorageFileByUrl(
  supabase: SupabaseClient,
  publicUrl: string | null | undefined,
): Promise<boolean> {
  if (!publicUrl) {
    return false
  }

  const bucket = extractBucketFromUrl(publicUrl)
  const filePath = extractStoragePath(publicUrl)

  if (!bucket || !filePath) {
    logger.warn('Impossibile estrarre bucket/path da URL', undefined, { publicUrl })
    return false
  }

  return deleteStorageFile(supabase, bucket, filePath)
}

/**
 * Elimina tutti i file multimediali di un esercizio
 * @param supabase Client Supabase
 * @param videoUrl URL del video (opzionale)
 * @param thumbUrl URL della thumbnail (opzionale)
 * @returns Numero di file eliminati con successo
 */
export async function deleteExerciseMediaFiles(
  supabase: SupabaseClient,
  videoUrl?: string | null,
  thumbUrl?: string | null,
): Promise<number> {
  let deletedCount = 0

  if (videoUrl) {
    const deleted = await deleteStorageFileByUrl(supabase, videoUrl)
    if (deleted) deletedCount++
  }

  if (thumbUrl) {
    const deleted = await deleteStorageFileByUrl(supabase, thumbUrl)
    if (deleted) deletedCount++
  }

  return deletedCount
}
