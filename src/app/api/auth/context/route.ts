import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { fetchCurrentProfileForAuthUserId } from '@/lib/supabase/get-current-profile'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { createLogger } from '@/lib/logger'
import { UserRole } from '@/types/user'
import type { Tables } from '@/types/supabase'
import { normalizeRole } from '@/lib/utils/role-normalizer'
import { getServerAuthUser } from '@/lib/auth/server-user'
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
  const role = (normalizeRole(p.role) ?? 'athlete') as UserRole
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
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
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
    // Service role: bypass RLS dopo JWT verificato (stesso pattern di invitations/create e altre API).
    // Fallback: client con cookie sessione (stesso modello del middleware). Se la service_role punta a un altro
    // progetto Supabase o è errata, l'admin non vede righe ma l'anon+JWT sì → senza fallback l'UI resta "vuota".
    const admin = createAdminClient()
    let actor = await fetchCurrentProfileForAuthUserId(admin, user.id)
    if (!actor) {
      actor = await fetchCurrentProfileForAuthUserId(supabase, user.id)
      if (actor) {
        logger.warn(
          'auth/context: profilo risolto solo con client sessione (RLS). Verificare che SUPABASE_SERVICE_ROLE_KEY sia dello stesso progetto di NEXT_PUBLIC_SUPABASE_URL.',
          undefined,
          { userId: user.id },
        )
      }
    }
    if (!actor) {
      const { data: probeAdmin, error: probeAdminErr } = await admin
        .from('profiles')
        .select('id, user_id, email')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      const { data: probeSession, error: probeSessionErr } = await supabase
        .from('profiles')
        .select('id, user_id, email')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      if (probeAdmin || probeSession) {
        logger.error(
          'Profilo presente in DB (probe) ma risoluzione contesto fallita: verificare colonne SELECT / resolveProfileByIdentifier',
          undefined,
          {
            userId: user.id,
            email: user.email,
            probeAdmin: probeAdmin ?? null,
            probeSession: probeSession ?? null,
            probeAdminErr: probeAdminErr?.message ?? null,
            probeSessionErr: probeSessionErr?.message ?? null,
          },
        )
      } else {
        logger.warn('Profilo non trovato', undefined, {
          userId: user.id,
          email: user.email,
          probeAdminErr: probeAdminErr?.message ?? null,
          probeAdminCode: probeAdminErr?.code ?? null,
          probeSessionErr: probeSessionErr?.message ?? null,
          probeSessionCode: probeSessionErr?.code ?? null,
        })
      }
      return NextResponse.json(
        { role: null, org_id: null, isImpersonating: false },
        { status: 200 },
      )
    }
    const profileTyped = {
      id: actor.profileId,
      user_id: actor.user_id,
      role: actor.role,
      org_id: actor.orgId,
      nome: actor.nome,
      cognome: actor.cognome,
      first_name: actor.first_name,
      last_name: actor.last_name,
      email: actor.email,
    } as ProfileRow
    const actorProfilePayload = toAuthProfile(profileTyped)
    const normalizedRole = actorProfilePayload.role
    const impersonateProfileId = request.cookies.get(COOKIE_IMPERSONATE_PROFILE)?.value
    // Parita cross-platform: su Capacitor il middleware puo essere bypassato, quindi il cleanup cookie avviene qui.
    if (impersonateProfileId && normalizedRole !== 'admin') {
      const fullName =
        actorProfilePayload.full_name ??
        (actorProfilePayload.first_name && actorProfilePayload.last_name
          ? `${actorProfilePayload.first_name} ${actorProfilePayload.last_name}`
          : null)
      const res = NextResponse.json({
        role: normalizedRole,
        org_id: profileTyped.org_id,
        full_name: fullName,
        email: profileTyped.email,
        actorProfile: null,
        effectiveProfile: null,
        isImpersonating: false,
      })
      res.cookies.set(COOKIE_IMPERSONATE_PROFILE, '', { path: '/', maxAge: 0 })
      return res
    }

    if (impersonateProfileId && normalizedRole === 'admin') {
      type TargetRow = ProfileRow & { is_deleted?: boolean }
      const targetRaw = await resolveProfileByIdentifier(
        admin,
        impersonateProfileId,
        'id, user_id, role, org_id, nome, cognome, first_name, last_name, email, is_deleted',
      )
      const targetTyped = (targetRaw as TargetRow | null) ?? null
      const targetMissingOrDeleted = !targetTyped || targetTyped.is_deleted === true

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
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Errore durante aggiornamento contesto', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
