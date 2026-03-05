import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'

const logger = createLogger('api:admin:impersonation:start')

const COOKIE_PROFILE = 'impersonate_profile_id'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 8, // 8 ore
}

/**
 * POST /api/admin/impersonation/start
 * Avvia impersonation: solo admin, re-auth obbligatoria (adminPassword), setta cookie httpOnly.
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

    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'role' | 'email'> & { email?: string | null }
    const { data: actorProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, email')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !actorProfile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const actor = actorProfile as ProfileRow
    if (actor.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può avviare impersonation' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const targetProfileId = body.targetProfileId as string | undefined
    const reason = (body.reason as string | null) ?? null
    const adminPassword = body.adminPassword as string | undefined

    if (!targetProfileId || typeof targetProfileId !== 'string') {
      return NextResponse.json({ error: 'targetProfileId obbligatorio' }, { status: 400 })
    }

    if (!adminPassword || typeof adminPassword !== 'string' || !adminPassword.trim()) {
      return NextResponse.json({ error: 'Password admin obbligatoria per confermare impersonation' }, { status: 400 })
    }

    if (!actor.email) {
      return NextResponse.json({ error: 'Email admin non disponibile' }, { status: 400 })
    }
    if (!actor.id) {
      return NextResponse.json({ error: 'Profilo admin non disponibile' }, { status: 400 })
    }

    const { error: reAuthError } = await supabase.auth.signInWithPassword({
      email: actor.email,
      password: adminPassword.trim(),
    })
    if (reAuthError) {
      logger.warn('Re-auth fallita per impersonation start', undefined, { email: actor.email })
      return NextResponse.json({ error: 'Password admin non valida' }, { status: 401 })
    }

    const { data: rpcResult, error: rpcError } = await supabase.rpc('start_impersonation', {
      p_target_profile_id: targetProfileId,
      p_actor_profile_id: actor.id,
      p_reason: reason ?? undefined,
    })

    if (rpcError) {
      logger.error('RPC start_impersonation errore', rpcError, { targetProfileId, actorId: actor.id })
      return NextResponse.json(
        { error: rpcError.message || 'Errore avvio impersonation' },
        { status: 500 },
      )
    }

    const result = rpcResult as { ok?: boolean; error?: string; error_code?: string }
    if (!result?.ok) {
      const code = result?.error_code === 'FORBIDDEN' ? 403 : result?.error_code === 'NOT_FOUND' ? 404 : 400
      return NextResponse.json(
        { error: result?.error || 'Impersonation non avviata' },
        { status: code },
      )
    }

    const response = NextResponse.json({ ok: true, target_profile_id: targetProfileId })
    response.cookies.set(COOKIE_PROFILE, targetProfileId, COOKIE_OPTIONS)
    return response
  } catch (error) {
    logger.error('Errore POST impersonation/start', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
