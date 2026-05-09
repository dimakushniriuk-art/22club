import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { createLogger } from '@/lib/logger'
import {
  isServiceRoleOrStorageKeyErrorMessage,
  SERVICE_ROLE_KEY_CONFIG_ERROR_IT,
} from '@/lib/supabase/service-role-key-health'

export const runtime = 'nodejs'

const logger = createLogger('api:chat:upload')

/** Allineato a `accept` su `MessageInput` (immagini + PDF). */
const MAX_BYTES = 10 * 1024 * 1024

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
])

function extFromMime(mime: string): string {
  if (mime === 'application/pdf') return 'pdf'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/gif') return 'gif'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

/**
 * Upload allegati chat nel bucket `documents` sotto `chat_files/{authUserId}/…`.
 * Il client anonimo spesso non ha policy INSERT sul bucket: si usa service role lato server dopo auth session.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File mancante' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File troppo grande (massimo 10 MB)' }, { status: 400 })
    }

    const mime = (file.type || '').toLowerCase() || 'application/octet-stream'
    if (!ALLOWED_MIME.has(mime)) {
      return NextResponse.json(
        { error: 'Formato non supportato. Usa un’immagine (JPEG, PNG, GIF, WebP) o un PDF.' },
        { status: 400 },
      )
    }

    const ext = extFromMime(mime)
    const filePath = `chat_files/${user.id}/${Date.now()}.${ext}`

    let admin
    try {
      admin = createAdminClient()
    } catch (e) {
      logger.warn('createAdminClient', e)
      return NextResponse.json({ error: SERVICE_ROLE_KEY_CONFIG_ERROR_IT }, { status: 503 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await admin.storage.from('documents').upload(filePath, buffer, {
      contentType: mime === 'image/jpg' ? 'image/jpeg' : mime,
      upsert: false,
    })

    if (uploadError) {
      logger.error('storage upload failed', uploadError, { filePath })
      const msg = uploadError.message ?? 'Upload fallito'
      if (isServiceRoleOrStorageKeyErrorMessage(msg)) {
        return NextResponse.json({ error: SERVICE_ROLE_KEY_CONFIG_ERROR_IT }, { status: 503 })
      }
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const {
      data: { publicUrl },
    } = admin.storage.from('documents').getPublicUrl(filePath)

    return NextResponse.json({
      url: publicUrl,
      name: file.name,
      size: file.size,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Errore interno'
    logger.error('POST /api/chat/upload', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
