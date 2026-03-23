import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:push:unsubscribe')

/**
 * POST /api/push/unsubscribe
 * Rimuove una subscription per push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint, userId } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint mancante' }, { status: 400 })
    }

    // Verifica che l'utente corrisponda
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Rimuovi la subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint)

    if (error) {
      logger.error('Errore durante rimozione subscription', error, { userId, endpoint })
      return NextResponse.json({ error: 'Errore durante rimozione' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Errore durante unsubscribe', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
