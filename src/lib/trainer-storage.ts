/**
 * Upload helper per certificati e media trainer.
 * Bucket privati: restituisce signed URL (1 anno) da salvare in DB.
 */

import { supabase } from '@/lib/supabase/client'

const CERT_BUCKET = 'trainer-certificates'
const MEDIA_BUCKET = 'trainer-media'
const CERT_MAX_BYTES = 5 * 1024 * 1024 // 5MB
const MEDIA_VIDEO_MAX_BYTES = 100 * 1024 * 1024 // 100MB
const MEDIA_IMAGE_MAX_BYTES = 10 * 1024 * 1024 // 10MB per immagine
const SIGNED_URL_EXPIRY_SEC = 60 * 60 * 24 * 365 // 1 anno

const CERT_MIMES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const VIDEO_MIMES = ['video/mp4', 'video/webm']

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
}

function normalizeStorageError(message: string): string {
  if (message.includes('not valid JSON') || message.includes('<html')) {
    return 'Il server ha risposto con una pagina invece che con dati. Verifica che NEXT_PUBLIC_SUPABASE_URL punti al progetto Supabase (es. https://xxx.supabase.co) e che le policy storage (migration 20260236) siano applicate.'
  }
  return message
}

export async function uploadTrainerCertificate(file: File): Promise<{ url: string }> {
  if (!supabase.storage) {
    throw new Error(
      'Storage non disponibile. Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }
  if (!CERT_MIMES.includes(file.type)) {
    throw new Error('Tipo file non ammesso. Usa PDF o immagini (JPG, PNG, WebP).')
  }
  if (file.size > CERT_MAX_BYTES) {
    throw new Error('File troppo grande. Massimo 5 MB.')
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) throw new Error('Utente non autenticato.')
  const path = `${user.id}/certificati/${crypto.randomUUID()}_${sanitizeFilename(file.name)}`
  const { error: upErr } = await supabase.storage.from(CERT_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (upErr) throw new Error(`Upload fallito: ${normalizeStorageError(upErr.message)}`)
  const { data: signed, error: signErr } = await supabase.storage
    .from(CERT_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SEC)
  if (signErr || !signed?.signedUrl) throw new Error('Impossibile generare il link al file.')
  return { url: signed.signedUrl }
}

export type TrainerMediaTipo = 'galleria' | 'video'

export async function uploadTrainerMedia(
  file: File,
  tipo: TrainerMediaTipo,
): Promise<{ url: string }> {
  if (!supabase.storage) {
    throw new Error(
      'Storage non disponibile. Configura NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) throw new Error('Utente non autenticato.')
  if (tipo === 'video') {
    if (!VIDEO_MIMES.includes(file.type)) throw new Error('Usa video MP4 o WebM.')
    if (file.size > MEDIA_VIDEO_MAX_BYTES) throw new Error('Video troppo grande. Massimo 100 MB.')
  } else {
    if (!IMAGE_MIMES.includes(file.type)) throw new Error('Usa immagini JPG, PNG o WebP.')
    if (file.size > MEDIA_IMAGE_MAX_BYTES) throw new Error('Immagine troppo grande. Massimo 10 MB.')
  }
  const path = `${user.id}/media/${tipo}/${crypto.randomUUID()}_${sanitizeFilename(file.name)}`
  const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (upErr) throw new Error(`Upload fallito: ${normalizeStorageError(upErr.message)}`)
  const { data: signed, error: signErr } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SEC)
  if (signErr || !signed?.signedUrl) throw new Error('Impossibile generare il link al file.')
  return { url: signed.signedUrl }
}
