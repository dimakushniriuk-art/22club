import { NextRequest, NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createClient } from '@/lib/supabase/server'
import { fetchCurrentProfileForAuthUserId } from '@/lib/supabase/get-current-profile'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:admin:impersonation:stop')

const COOKIE_PROFILE = 'impersonate_profile_id'

/**
 * POST /api/admin/impersonation/stop
 * Termina impersonation: solo admin, passa impersonated_profile_id da cookie a RPC, rimuove cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const actorProfile = await fetchCurrentProfileForAuthUserId(supabase, user.id)
    if (!actorProfile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const actor = { id: actorProfile.profileId, role: actorProfile.role }
    if (actor.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può terminare impersonation' }, { status: 403 })
    }

    const impersonatedProfileId = request.cookies.get(COOKIE_PROFILE)?.value ?? null

    const { error: rpcError } = await supabase.rpc('stop_impersonation', {
      p_actor_profile_id: actor.id,
      p_impersonated_profile_id: impersonatedProfileId || undefined,
    })

    if (rpcError) {
      logger.error('RPC stop_impersonation errore', rpcError, { actorId: actor.id })
      return NextResponse.json(
        { error: rpcError.message || 'Errore stop impersonation' },
        { status: 500 },
      )
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_PROFILE, '', { path: '/', maxAge: 0 })
    return response
  } catch (error) {
    logger.error('Errore POST impersonation/stop', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
