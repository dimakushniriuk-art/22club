import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/utils/role-normalizer'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Bucket serviti dal proxy (allineare a `STORAGE_PREVIEW_BUCKETS` in `lib/documents`). */
const ALLOWED_BUCKETS = new Set([
  'documents',
  'athlete-certificates',
  'athlete-referti',
  'athlete-documents',
  'trainer-certificates',
  'trainer-media',
])

/**
 * Estrae `profiles.id` dell'atleta da path bucket `documents` (dossier/, fatture/, …).
 */
function extractAthleteProfileIdFromDocumentsPath(storagePath: string): string | null {
  const trimmed = storagePath.trim()
  if (!trimmed || trimmed.includes('..') || trimmed.startsWith('/')) return null
  const parts = trimmed.split('/').filter(Boolean)
  if (parts.length < 2) return null

  if (parts[0] === 'dossier' || parts[0] === 'documents') {
    return UUID_RE.test(parts[1] ?? '') ? (parts[1] as string) : null
  }
  if (parts[0] === 'fatture') {
    // fatture/{service}/{athlete_id}/{file} (es. training)
    if (parts.length >= 4 && UUID_RE.test(parts[2] ?? '')) {
      return parts[2] as string
    }
    // Legacy: fatture/{athlete_id}/{file}.pdf
    if (parts.length >= 3 && UUID_RE.test(parts[1] ?? '')) {
      return parts[1] as string
    }
    return null
  }
  return UUID_RE.test(parts[0] ?? '') ? (parts[0] as string) : null
}

/**
 * Path bucket `athlete-certificates` / `athlete-referti` / `athlete-documents`: primo segmento = auth user_id.
 * Risolve `profiles.id` per confronto con staff/assignments (come nel resto dell'app).
 */
async function resolveAthleteProfileIdFromUserIdScopedPath(
  supabase: SupabaseClient<Database>,
  storagePath: string,
): Promise<string | null> {
  const trimmed = storagePath.trim()
  if (!trimmed || trimmed.includes('..') || trimmed.startsWith('/')) return null
  const parts = trimmed.split('/').filter(Boolean)
  if (parts.length < 1) return null
  const authUserId = parts[0]
  if (!UUID_RE.test(authUserId)) return null
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', authUserId)
    .maybeSingle()
  return data?.id ?? null
}

async function resolveOwnerProfileIdForPreview(
  supabase: SupabaseClient<Database>,
  bucket: string,
  storagePath: string,
): Promise<string | null> {
  if (bucket === 'documents') {
    const fromDocPath = extractAthleteProfileIdFromDocumentsPath(storagePath)
    if (fromDocPath) return fromDocPath
    const parts = storagePath.trim().split('/').filter(Boolean)
    if (parts[0] === 'chat_files' && parts.length >= 2 && UUID_RE.test(parts[1] ?? '')) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', parts[1] as string)
        .maybeSingle()
      return data?.id ?? null
    }
    return null
  }
  if (
    bucket === 'athlete-certificates' ||
    bucket === 'athlete-referti' ||
    bucket === 'athlete-documents' ||
    bucket === 'trainer-certificates' ||
    bucket === 'trainer-media'
  ) {
    return resolveAthleteProfileIdFromUserIdScopedPath(supabase, storagePath)
  }
  return null
}

async function canActorAccessChatFile(
  supabase: SupabaseClient<Database>,
  actorProfileId: string,
  storagePath: string,
): Promise<boolean> {
  const parts = storagePath.trim().split('/').filter(Boolean)
  if (parts[0] !== 'chat_files' || parts.length < 2 || !UUID_RE.test(parts[1] ?? '')) {
    return false
  }
  const { data: uploader } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', parts[1] as string)
    .maybeSingle()
  if (!uploader?.id) return false
  if (actorProfileId === uploader.id) return true
  const pattern = `%${storagePath}%`
  const { data: msg } = await supabase
    .from('chat_messages')
    .select('id')
    .or(`sender_id.eq.${actorProfileId},receiver_id.eq.${actorProfileId}`)
    .ilike('file_url', pattern)
    .limit(1)
    .maybeSingle()
  return msg != null
}

async function canActorAccessTrainerStorage(
  supabase: SupabaseClient<Database>,
  actorProfileId: string,
  actorRoleRaw: string | null,
  ownerProfileId: string,
): Promise<boolean> {
  if (normalizeRole(actorRoleRaw) === 'admin') return true
  if (actorProfileId === ownerProfileId) return true
  const { data: owner } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', ownerProfileId)
    .maybeSingle()
  if (!owner) return false
  const r = normalizeRole(owner.role)
  const raw = (owner.role ?? '').toLowerCase()
  const isTrainerOwner = r === 'trainer' || raw.includes('trainer') || raw.includes('pt')
  if (!isTrainerOwner) return false
  return true
}

async function canActorAccessAthleteStorageObject(
  supabase: SupabaseClient<Database>,
  actorProfileId: string,
  actorRoleRaw: string | null,
  athleteProfileId: string,
): Promise<boolean> {
  const normalized = normalizeRole(actorRoleRaw)
  const raw = (actorRoleRaw ?? '').toLowerCase()

  if (normalized === 'admin') return true
  /** Path storage è sempre ancorato a profiles.id atleta: stesso id → file propri (indipendente da stringa ruolo legacy/null). */
  if (actorProfileId === athleteProfileId) return true

  if (normalized === 'trainer') {
    const { data } = await supabase
      .from('athlete_trainer_assignments')
      .select('id')
      .eq('athlete_id', athleteProfileId)
      .eq('trainer_id', actorProfileId)
      .eq('status', 'active')
      .maybeSingle()
    return data != null
  }

  if (normalized === 'nutrizionista' || normalized === 'massaggiatore' || raw === 'nutritionist') {
    const { data } = await supabase
      .from('staff_atleti')
      .select('id')
      .eq('atleta_id', athleteProfileId)
      .eq('staff_id', actorProfileId)
      .eq('status', 'active')
      .maybeSingle()
    return data != null
  }

  return false
}

function guessContentTypeFromStoragePath(storagePath: string): string {
  const ext = storagePath.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  return 'application/octet-stream'
}

function previewHeaders(contentType: string): Record<string, string> {
  return {
    'Content-Type': contentType,
    'Cache-Control': 'private, max-age=300',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Disposition': 'inline',
  }
}

/**
 * GET Storage REST su `/object/authenticated/...`: path come segmenti (`a/b/c`).
 * Kong: `apikey` deve essere la **anon key**; `Authorization: Bearer` porta il JWT (sessione o service role).
 * Usare service role anche come apikey può produrre "Invalid Compact JWS" sul gateway.
 */
async function fetchStorageObjectViaRest(
  bucket: string,
  storagePath: string,
  userAccessToken: string | null,
): Promise<{ ok: true; buffer: ArrayBuffer; contentType: string } | { ok: false; status: number }> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!base) {
    return { ok: false, status: 503 }
  }
  const pathSegments = storagePath.split('/').map(encodeURIComponent).join('/')
  const authenticatedUrl = `${base}/storage/v1/object/authenticated/${bucket}/${pathSegments}`

  const attempts: Record<string, string>[] = []
  if (userAccessToken?.trim() && anonKey) {
    attempts.push({
      Authorization: `Bearer ${userAccessToken.trim()}`,
      apikey: anonKey,
    })
  }
  if (serviceKey?.trim() && anonKey) {
    attempts.push({
      Authorization: `Bearer ${serviceKey.trim()}`,
      apikey: anonKey,
    })
  } else if (serviceKey?.trim()) {
    const sk = serviceKey.trim()
    attempts.push({
      Authorization: `Bearer ${sk}`,
      apikey: sk,
    })
  }

  if (attempts.length === 0) {
    return { ok: false, status: 503 }
  }

  let lastStatus = 502
  for (const headers of attempts) {
    try {
      const res = await fetch(authenticatedUrl, { headers })
      if (res.ok) {
        const contentType =
          res.headers.get('content-type') ?? guessContentTypeFromStoragePath(storagePath)
        const buffer = await res.arrayBuffer()
        return { ok: true, buffer, contentType }
      }
      lastStatus = res.status
      await res.text().catch(() => '')
    } catch {
      lastStatus = 502
    }
  }
  return { ok: false, status: lastStatus }
}

/**
 * Legge il file dallo storage dopo check accesso in API.
 * Ordine: 1) `download()` utente (cookie/sessione, veloce se RLS consente il path);
 * 2) `download()` admin; 3) REST `/authenticated/` (service role + apikey anon); 4) signed URL + fetch.
 */
async function respondWithStorageFileBody(
  userSb: SupabaseClient<Database>,
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  storagePath: string,
  userAccessToken: string | null,
): Promise<NextResponse> {
  try {
    const { data: userBlob, error: userDlErr } = await userSb.storage
      .from(bucket)
      .download(storagePath)
    if (!userDlErr && userBlob) {
      const contentType =
        userBlob.type && userBlob.type.length > 0
          ? userBlob.type
          : guessContentTypeFromStoragePath(storagePath)
      const arrayBuffer = await userBlob.arrayBuffer()
      return new NextResponse(arrayBuffer, { status: 200, headers: previewHeaders(contentType) })
    }

    const { data: adminBlob, error: adminDlErr } = await admin.storage
      .from(bucket)
      .download(storagePath)
    if (!adminDlErr && adminBlob) {
      const contentType =
        adminBlob.type && adminBlob.type.length > 0
          ? adminBlob.type
          : guessContentTypeFromStoragePath(storagePath)
      const arrayBuffer = await adminBlob.arrayBuffer()
      return new NextResponse(arrayBuffer, { status: 200, headers: previewHeaders(contentType) })
    }

    const restUser = await fetchStorageObjectViaRest(bucket, storagePath, userAccessToken)
    if (restUser.ok) {
      return new NextResponse(restUser.buffer, {
        status: 200,
        headers: previewHeaders(restUser.contentType),
      })
    }

    const { data: signed, error: signErr } = await admin.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60 * 10)
    if (!signErr && signed?.signedUrl) {
      try {
        const fileRes = await fetch(signed.signedUrl, {
          redirect: 'follow',
          headers: { 'Accept-Encoding': 'identity' },
        })
        if (fileRes.ok) {
          const contentType =
            fileRes.headers.get('content-type') ?? guessContentTypeFromStoragePath(storagePath)
          const body = await fileRes.arrayBuffer()
          return new NextResponse(body, { status: 200, headers: previewHeaders(contentType) })
        }
      } catch {
        /* fallback messaggio sotto */
      }
    }

    const msg =
      adminDlErr?.message ??
      userDlErr?.message ??
      signErr?.message ??
      'Impossibile leggere il file dallo storage'
    return NextResponse.json({ error: msg }, { status: 502 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore lettura storage'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

/**
 * GET /api/document-preview?bucket=...&path=...
 * Restituisce sempre il file in-line dalla route (proxy): niente 307 verso Supabase
 * (evita errori client/Next su redirect esterni). Storage: utente, admin, REST, signed.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bucket = searchParams.get('bucket')
  const path = searchParams.get('path')

  if (!bucket || !path?.trim()) {
    return NextResponse.json({ error: 'Parametri bucket e path richiesti' }, { status: 400 })
  }

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: 'Bucket non consentito' }, { status: 400 })
  }

  const storagePath = path.trim()
  if (storagePath.includes('..')) {
    return NextResponse.json({ error: 'Path non valido' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { data: actorProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !actorProfile?.id) {
      return NextResponse.json({ error: 'Profilo non disponibile' }, { status: 403 })
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const ownerProfileId = await resolveOwnerProfileIdForPreview(supabase, bucket, storagePath)
    if (!ownerProfileId) {
      return NextResponse.json({ error: 'Path non valido' }, { status: 400 })
    }

    let allowed = false
    if (bucket === 'documents' && storagePath.startsWith('chat_files/')) {
      allowed = await canActorAccessChatFile(supabase, actorProfile.id, storagePath)
    } else if (bucket === 'trainer-certificates' || bucket === 'trainer-media') {
      allowed = await canActorAccessTrainerStorage(
        supabase,
        actorProfile.id,
        actorProfile.role,
        ownerProfileId,
      )
    } else {
      allowed = await canActorAccessAthleteStorageObject(
        supabase,
        actorProfile.id,
        actorProfile.role,
        ownerProfileId,
      )
    }
    if (!allowed) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            'Server non configurato: manca SUPABASE_SERVICE_ROLE_KEY (necessaria per leggere file dallo storage).',
        },
        { status: 503 },
      )
    }

    let admin: ReturnType<typeof createAdminClient>
    try {
      admin = createAdminClient()
    } catch (cfgErr) {
      const msg = cfgErr instanceof Error ? cfgErr.message : 'Configurazione storage non valida'
      return NextResponse.json({ error: msg }, { status: 503 })
    }

    return respondWithStorageFileBody(
      supabase,
      admin,
      bucket,
      storagePath,
      session?.access_token ?? null,
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Errore interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
