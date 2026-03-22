import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import { UserRole } from '@/types/user'
import type { Tables } from '@/types/supabase'
const logger = createLogger('api:auth:context')

const COOKIE_IMPERSONATE_PROFILE = 'impersonate_profile_id'

function toAuthProfile(p: {
  id: string
  user_id?: string | null
  role: string | null
  org_id: string | null
  nome?: string | null
  cognome?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
}) {
  const firstName = p.nome ?? p.first_name ?? ''
  const lastName = p.cognome ?? p.last_name ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || null
  const role = (
    p.role === 'pt' || p.role === 'staff'
      ? 'trainer'
      : p.role === 'atleta'
        ? 'athlete'
        : p.role === 'owner'
          ? 'admin'
          : p.role
  ) as UserRole
  return {
    id: p.id,
    user_id: p.user_id ?? undefined,
    org_id: p.org_id,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName ?? undefined,
    email: p.email ?? '',
    role: role ?? 'athlete',
  }
}

/**
 * GET /api/auth/context
 * Ottiene il contesto utente (role, org_id). Se impersonation attiva: actorProfile, effectiveProfile, isImpersonating.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { role: null, org_id: null, isImpersonating: false },
        { status: 200 },
      )
    }

    type ProfileRow = Pick<
      Tables<'profiles'>,
      | 'id'
      | 'user_id'
      | 'role'
      | 'org_id'
      | 'nome'
      | 'cognome'
      | 'first_name'
      | 'last_name'
      | 'email'
    >
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, role, org_id, nome, cognome, first_name, last_name, email')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      logger.warn('Profilo non trovato', profileError, { userId: session.user.id })
      return NextResponse.json(
        { role: null, org_id: null, isImpersonating: false },
        { status: 200 },
      )
    }
    const profileTyped = profile as ProfileRow
    const actorProfilePayload = toAuthProfile(profileTyped)
    const normalizedRole = (
      profileTyped.role === 'pt' || profileTyped.role === 'staff'
        ? 'trainer'
        : profileTyped.role === 'atleta'
          ? 'athlete'
          : profileTyped.role === 'owner'
            ? 'admin'
            : profileTyped.role
    ) as UserRole
    const impersonateProfileId = request.cookies.get(COOKIE_IMPERSONATE_PROFILE)?.value
    if (impersonateProfileId && normalizedRole === 'admin') {
      type TargetRow = ProfileRow & { is_deleted?: boolean }
      const { data: targetProfile, error: targetError } = await supabase
        .from('profiles')
        .select(
          'id, user_id, role, org_id, nome, cognome, first_name, last_name, email, is_deleted',
        )
        .eq('id', impersonateProfileId)
        .single()

      const targetTyped = targetProfile as TargetRow | null
      const targetMissingOrDeleted = targetError || !targetTyped || targetTyped.is_deleted === true

      if (targetMissingOrDeleted) {
        const res = NextResponse.json({
          role: normalizedRole,
          org_id: profileTyped.org_id,
          full_name:
            actorProfilePayload.full_name ??
            (actorProfilePayload.first_name && actorProfilePayload.last_name
              ? `${actorProfilePayload.first_name} ${actorProfilePayload.last_name}`
              : null),
          email: profileTyped.email,
          actorProfile: null,
          effectiveProfile: null,
          isImpersonating: false,
        })
        res.cookies.set(COOKIE_IMPERSONATE_PROFILE, '', { path: '/', maxAge: 0 })
        return res
      }

      const effectivePayload = toAuthProfile(targetTyped as ProfileRow)
      return NextResponse.json({
        role: effectivePayload.role,
        org_id: effectivePayload.org_id,
        full_name: effectivePayload.full_name,
        email: effectivePayload.email,
        actorProfile: actorProfilePayload,
        effectiveProfile: effectivePayload,
        isImpersonating: true,
      })
    }

    const fullName =
      actorProfilePayload.full_name ??
      (actorProfilePayload.first_name && actorProfilePayload.last_name
        ? `${actorProfilePayload.first_name} ${actorProfilePayload.last_name}`
        : null)
    return NextResponse.json({
      role: normalizedRole,
      org_id: profileTyped.org_id,
      full_name: fullName,
      email: profileTyped.email,
      actorProfile: null,
      effectiveProfile: null,
      isImpersonating: false,
    })
  } catch (error) {
    logger.error('Errore durante il recupero del contesto', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * POST /api/auth/context
 * Verifica sessione. Role/org_id sul profilo non sono aggiornabili da header/body (solo server/DB).
 */
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Errore durante aggiornamento contesto', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
