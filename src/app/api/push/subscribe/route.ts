import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { TablesInsert } from '@/types/supabase'

const logger = createLogger('api:push:subscribe')

/**
 * POST /api/push/subscribe
 * Registra una subscription per push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint, keys, userId } = body

    if (!endpoint || !keys) {
      return NextResponse.json({ error: 'Dati subscription mancanti' }, { status: 400 })
    }

    // Verifica che l'utente corrisponda
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Salva o aggiorna la subscription
    type PushSubscriptionInsert = TablesInsert<'push_subscriptions'>
    const subscriptionData: PushSubscriptionInsert = {
      user_id: userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('push_subscriptions').upsert(subscriptionData, {
      onConflict: 'user_id,endpoint',
    })

    if (error) {
      logger.error('Errore durante salvataggio subscription', error, { userId })
      return NextResponse.json({ error: 'Errore durante salvataggio' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Errore durante subscribe', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
