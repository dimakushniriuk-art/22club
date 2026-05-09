import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createClient, createJwtForwardClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { assertAthleteProfileWriteAllowed } from '@/lib/server/athlete-profile-patch-access'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/lib/supabase/types'
import {
  ATHLETE_WDE_NOTE_IMAGES_BUCKET,
  ATHLETE_WDE_NOTE_IMAGE_MAX_BYTES,
  ATHLETE_WDE_NOTE_IMAGE_MIME,
} from '@/lib/storage/athlete-wde-note-images'
import {
  isServiceRoleOrStorageKeyErrorMessage,
  SERVICE_ROLE_KEY_CONFIG_ERROR_IT,
} from '@/lib/supabase/service-role-key-health'

const logger = createLogger('api:athlete:wde-note-image')

/** Stesso valore inviato dal client in `athlete-exercise-private-note.tsx` (fallback se `Authorization` viene perso). */
const ACCESS_TOKEN_HEADER = 'x-22club-access-token'

type AppServerSupabase = Awaited<ReturnType<typeof createClient>>

function bearerFromRequest(request: NextRequest): string | null {
  const raw = request.headers.get('authorization')?.trim()
  if (raw?.toLowerCase().startsWith('bearer ')) {
    const t = raw.slice(7).trim()
    if (t.length > 0) return t
  }
  const alt = request.headers.get(ACCESS_TOKEN_HEADER)?.trim()
  return alt && alt.length > 0 ? alt : null
}

/**
 * Cookie session oppure JWT in header (embed / cookie rotte).
 * Se l’header JWT c’è ma non è valido, non si fa fallback sulle cookie (evita stati ambigui).
 */
async function supabaseAndUserForWdeNoteImage(
  request: NextRequest,
): Promise<{ supabase: AppServerSupabase; user: User | null }> {
  const cookieSb = await createClient()
  const bearer = bearerFromRequest(request)
  if (bearer) {
    const jwtSb = createJwtForwardClient(bearer)
    const { data, error } = await jwtSb.auth.getUser(bearer)
    if (data.user && !error) {
      return { supabase: jwtSb as AppServerSupabase, user: data.user }
    }
    logger.warn('wde-note-image: JWT header non valido o scaduto', {
      message: error?.message,
    })
    return { supabase: jwtSb as AppServerSupabase, user: null }
  }
  const { user } = await getServerAuthUser(cookieSb)
  return { supabase: cookieSb, user }
}

function extFromMime(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/heic' || mime === 'image/heif') return 'heic'
  return 'jpg'
}

async function getAdminOr503() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

/** `null` = ok; stringa = messaggio errore storage (es. service role errata). */
async function ensureBucket(admin: SupabaseClient<Database>): Promise<string | null> {
  const { data: buckets, error: listErr } = await admin.storage.listBuckets()
  if (listErr) {
    logger.warn('listBuckets', { message: listErr.message })
    return listErr.message ?? 'listBuckets fallito'
  }
  if (buckets?.some((b) => b.id === ATHLETE_WDE_NOTE_IMAGES_BUCKET)) return null
  const { error } = await admin.storage.createBucket(ATHLETE_WDE_NOTE_IMAGES_BUCKET, {
    public: false,
    fileSizeLimit: ATHLETE_WDE_NOTE_IMAGE_MAX_BYTES,
    allowedMimeTypes: [...ATHLETE_WDE_NOTE_IMAGE_MIME],
  })
  if (error && !String(error.message).toLowerCase().includes('already')) {
    logger.warn('createBucket', { message: error.message })
    return error.message
  }
  return null
}

function jsonServiceRoleMisconfigIfNeeded(message: string | undefined) {
  if (!isServiceRoleOrStorageKeyErrorMessage(message)) return null
  return NextResponse.json({ error: SERVICE_ROLE_KEY_CONFIG_ERROR_IT }, { status: 503 })
}

/** Primo segmento del path = profiles.id atleta; permessi come PATCH atleta (self o staff). */
function folderProfileIdFromStoragePath(path: string): string | null {
  if (!path || path.includes('..')) return null
  const first = path.split('/')[0]?.trim()
  if (!first || !/^[0-9a-f-]{36}$/i.test(first)) return null
  return first
}

/** GET ?path=… → signed URL (1h) */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path')?.trim()
  if (!path) {
    return NextResponse.json({ error: 'Parametro path richiesto' }, { status: 400 })
  }

  const { supabase, user } = await supabaseAndUserForWdeNoteImage(request)
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const folderId = folderProfileIdFromStoragePath(path)
  if (!folderId) {
    return NextResponse.json({ error: 'Path non valido' }, { status: 400 })
  }

  const access = await assertAthleteProfileWriteAllowed(
    supabase,
    user,
    folderId,
    'api:athlete:wde-note-image:get',
  )
  if (!access.ok) {
    return access.response
  }

  const admin = await getAdminOr503()
  if (!admin) {
    return NextResponse.json({ error: 'Storage server non configurato' }, { status: 503 })
  }

  const bucketErr = await ensureBucket(admin)
  const mis = jsonServiceRoleMisconfigIfNeeded(bucketErr ?? undefined)
  if (mis) return mis

  const { data, error } = await admin.storage
    .from(ATHLETE_WDE_NOTE_IMAGES_BUCKET)
    .createSignedUrl(path, 3600)
  if (error || !data?.signedUrl) {
    logger.warn('createSignedUrl', { message: error?.message, path })
    const mis2 = jsonServiceRoleMisconfigIfNeeded(error?.message)
    if (mis2) return mis2
    return NextResponse.json({ error: 'Impossibile generare URL immagine' }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: data.signedUrl })
}

/** POST multipart: file + workoutDayExerciseId + athleteProfileId (permessi: atleta o staff come altre API atleta) */
export async function POST(request: NextRequest) {
  const { supabase, user } = await supabaseAndUserForWdeNoteImage(request)
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get('file')
  const workoutDayExerciseId = String(form.get('workoutDayExerciseId') ?? '').trim()
  const athleteProfileId = String(form.get('athleteProfileId') ?? '').trim()

  if (!workoutDayExerciseId || !athleteProfileId) {
    return NextResponse.json(
      { error: 'workoutDayExerciseId e athleteProfileId richiesti' },
      { status: 400 },
    )
  }
  if (!(file instanceof File) || file.size < 1) {
    return NextResponse.json({ error: 'File immagine richiesto' }, { status: 400 })
  }
  if (file.size > ATHLETE_WDE_NOTE_IMAGE_MAX_BYTES) {
    return NextResponse.json({ error: 'File troppo grande (max 5 MB)' }, { status: 400 })
  }
  const mime = file.type || 'image/jpeg'
  if (!mime.startsWith('image/')) {
    return NextResponse.json({ error: 'Sono ammessi solo file immagine' }, { status: 400 })
  }

  const access = await assertAthleteProfileWriteAllowed(
    supabase,
    user,
    athleteProfileId,
    'api:athlete:wde-note-image:post',
  )
  if (!access.ok) {
    return access.response
  }

  const admin = await getAdminOr503()
  if (!admin) {
    return NextResponse.json(
      { error: 'Serve SUPABASE_SERVICE_ROLE_KEY sul server per caricare le immagini.' },
      { status: 503 },
    )
  }

  const bucketErr = await ensureBucket(admin)
  const misPost = jsonServiceRoleMisconfigIfNeeded(bucketErr ?? undefined)
  if (misPost) return misPost

  const ext = extFromMime(mime)
  const objectPath = `${athleteProfileId}/${workoutDayExerciseId}/${crypto.randomUUID()}.${ext}`

  const { error: upErr } = await admin.storage
    .from(ATHLETE_WDE_NOTE_IMAGES_BUCKET)
    .upload(objectPath, file, {
      contentType: mime,
      upsert: false,
    })
  if (upErr) {
    logger.error('upload wde note image (admin)', upErr, { objectPath })
    const misUp = jsonServiceRoleMisconfigIfNeeded(upErr.message)
    if (misUp) return misUp
    return NextResponse.json({ error: upErr.message || 'Upload fallito' }, { status: 500 })
  }

  return NextResponse.json({ path: objectPath })
}

/** DELETE JSON { path } — rimozione server-side */
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await supabaseAndUserForWdeNoteImage(request)
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  let body: { path?: string }
  try {
    body = (await request.json()) as { path?: string }
  } catch {
    return NextResponse.json({ error: 'Body JSON non valido' }, { status: 400 })
  }
  const path = body.path?.trim()
  if (!path) {
    return NextResponse.json({ error: 'path richiesto' }, { status: 400 })
  }

  const folderId = folderProfileIdFromStoragePath(path)
  if (!folderId) {
    return NextResponse.json({ error: 'Path non valido' }, { status: 400 })
  }

  const access = await assertAthleteProfileWriteAllowed(
    supabase,
    user,
    folderId,
    'api:athlete:wde-note-image:delete',
  )
  if (!access.ok) {
    return access.response
  }

  const admin = await getAdminOr503()
  if (!admin) {
    return NextResponse.json({ error: 'Storage server non configurato' }, { status: 503 })
  }

  const delBucketErr = await ensureBucket(admin)
  const misDel = jsonServiceRoleMisconfigIfNeeded(delBucketErr ?? undefined)
  if (misDel) return misDel

  const { error } = await admin.storage.from(ATHLETE_WDE_NOTE_IMAGES_BUCKET).remove([path])
  if (error) {
    logger.warn('remove wde note image', { message: error.message, path })
    const misRm = jsonServiceRoleMisconfigIfNeeded(error.message)
    if (misRm) return misRm
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
