import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { createLogger } from '@/lib/logger'
import {
  isServiceRoleOrStorageKeyErrorMessage,
  SERVICE_ROLE_KEY_CONFIG_ERROR_IT,
} from '@/lib/supabase/service-role-key-health'
import { NOTIFICATION_TYPES } from '@/lib/notifications/types'

export const runtime = 'nodejs'

const logger = createLogger('api:notifications:chat')

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface ChatNotifyBody {
  recipientAuthUserId?: string
  title?: string
  body?: string
  link?: string | null
  actionText?: string | null
}

/**
 * Inserisce una notifica per il destinatario di un messaggio chat.
 * Il client non può fare INSERT su `notifications` con `user_id` altrui per RLS:
 * qui si valida la sessione mittente e si usa il service role dopo aver verificato
 * che esista un `chat_messages` recente mittente → destinatario.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)
    if (!user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    let payload: ChatNotifyBody
    try {
      payload = (await request.json()) as ChatNotifyBody
    } catch {
      return NextResponse.json({ error: 'JSON non valido' }, { status: 400 })
    }

    const recipientAuthUserId = payload.recipientAuthUserId?.trim()
    const title = payload.title?.trim()
    const body = payload.body?.trim()
    const link = payload.link?.trim() ?? null
    const actionText = payload.actionText?.trim() ?? null

    if (!recipientAuthUserId || !UUID_RE.test(recipientAuthUserId)) {
      return NextResponse.json({ error: 'recipientAuthUserId non valido' }, { status: 400 })
    }
    if (recipientAuthUserId === user.id) {
      return NextResponse.json({ error: 'Destinatario non valido' }, { status: 400 })
    }
    if (!title || !body) {
      return NextResponse.json({ error: 'title e body sono obbligatori' }, { status: 400 })
    }

    const { data: senderProfile, error: senderErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (senderErr || !senderProfile?.id) {
      return NextResponse.json({ error: 'Profilo mittente non trovato' }, { status: 403 })
    }

    const { data: recipientProfile, error: recipientErr } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('user_id', recipientAuthUserId)
      .maybeSingle()

    if (recipientErr || !recipientProfile?.id || !recipientProfile.user_id) {
      return NextResponse.json({ error: 'Profilo destinatario non trovato' }, { status: 404 })
    }

    const senderProfileId = senderProfile.id as string
    const recipientProfileId = recipientProfile.id as string

    const { data: recentMsg, error: msgErr } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('sender_id', senderProfileId)
      .eq('receiver_id', recipientProfileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (msgErr) {
      logger.warn('chat_messages lookup', msgErr)
      return NextResponse.json({ error: 'Verifica messaggio fallita' }, { status: 400 })
    }
    if (!recentMsg?.id) {
      return NextResponse.json(
        { error: 'Nessun messaggio verso questo destinatario; invio non autorizzato.' },
        { status: 403 },
      )
    }

    let admin
    try {
      admin = createAdminClient()
    } catch (e) {
      logger.warn('createAdminClient', e)
      return NextResponse.json({ error: SERVICE_ROLE_KEY_CONFIG_ERROR_IT }, { status: 503 })
    }

    const { data: inserted, error: insertErr } = await admin
      .from('notifications')
      .insert({
        user_id: recipientAuthUserId,
        title,
        body,
        type: NOTIFICATION_TYPES.CHAT,
        link,
        action_text: actionText,
      })
      .select()
      .single()

    if (insertErr) {
      logger.error('notifications insert', insertErr)
      const msg = insertErr.message ?? 'Inserimento notifica fallito'
      if (isServiceRoleOrStorageKeyErrorMessage(msg)) {
        return NextResponse.json({ error: SERVICE_ROLE_KEY_CONFIG_ERROR_IT }, { status: 503 })
      }
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    return NextResponse.json({ notification: inserted })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Errore interno'
    logger.error('POST /api/notifications/chat', e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
