import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:register:complete-profile')

/** Decodifica payload JWT (solo lettura, token ricevuto dal client subito dopo signUp). */
function decodeJwtPayload(token: string): { sub?: string; email?: string } | null {
  try {
    const parts = token.trim().split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      Buffer.from(parts[1]!, 'base64url').toString('utf8'),
    ) as { sub?: string; email?: string }
    return payload
  } catch {
    return null
  }
}

/**
 * POST /api/register/complete-profile
 * Crea il profilo in profiles dopo signUp (RLS blocca INSERT dal client).
 * Body: { nome, cognome, email?, codice?, code?, access_token?, refresh_token? }.
 * Se codice/code è presente e valido: collega atleta al PT (trainer_athletes) e marca invito come accettato.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const accessToken =
      typeof body.access_token === 'string' ? body.access_token.trim() : null
    const codiceInvito =
      (typeof body.codice === 'string' ? body.codice.trim() : null) ||
      (typeof body.code === 'string' ? body.code.trim() : null) ||
      ''

    let userId: string
    let email: string

    if (accessToken) {
      const payload = decodeJwtPayload(accessToken)
      if (!payload?.sub) {
        return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
      }
      userId = payload.sub
      email =
        (typeof payload.email === 'string' ? payload.email.trim() : '') ||
        (typeof body.email === 'string' ? body.email.trim() : '') ||
        ''
    } else {
      const supabase = await createClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError || !session?.user) {
        return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
      }
      userId = session.user.id
      email =
        session.user.email?.trim() ||
        (typeof body.email === 'string' ? body.email.trim() : '') ||
        ''
    }

    const adminClient = createAdminClient()
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    let profileId: string
    let created = false

    if (existing) {
      profileId = existing.id
    } else {
      const nome = typeof body.nome === 'string' ? body.nome.trim() : ''
      const cognome = typeof body.cognome === 'string' ? body.cognome.trim() : ''
      if (!email) {
        return NextResponse.json(
          { error: 'Email mancante per la creazione del profilo' },
          { status: 400 },
        )
      }

      let defaultOrgId: string | null = null
      try {
        const { data: defaultOrg } = await adminClient
          .from('organizations')
          .select('id')
          .eq('slug', 'default-org')
          .maybeSingle()
        defaultOrgId = defaultOrg?.id ?? null
      } catch {
        // Tabella organizations assente (pre-migration): org_id può essere text 'default-org'
      }
      const orgIdForInsert = defaultOrgId ?? 'default-org'

      const { data: inserted, error: insertError } = await adminClient
        .from('profiles')
        .insert({
          user_id: userId,
          email,
          nome: nome || null,
          cognome: cognome || null,
          role: 'athlete',
          org_id: orgIdForInsert,
          stato: 'attivo',
        })
        .select('id')
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          const { data: existingAfterConflict } = await adminClient
            .from('profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()
          if (existingAfterConflict) {
            profileId = existingAfterConflict.id
            created = false
          } else {
            logger.error('Errore INSERT profiles (complete-profile)', insertError, {
              userId,
              email,
            })
            return NextResponse.json(
              { error: insertError.message || 'Errore creazione profilo' },
              { status: 502 },
            )
          }
        } else {
          logger.error('Errore INSERT profiles (complete-profile)', insertError, {
            userId,
            email,
          })
          return NextResponse.json(
            { error: insertError.message || 'Errore creazione profilo' },
            { status: 502 },
          )
        }
      } else {
        profileId = inserted!.id
        created = true
      }
    }

    if (codiceInvito) {
      const { data: invito, error: invitoErr } = await adminClient
        .from('inviti_atleti')
        .select('id, pt_id, stato, status, expires_at')
        .eq('codice', codiceInvito)
        .maybeSingle()

      if (invitoErr) {
        logger.warn('Lookup invito (complete-profile)', invitoErr, { codice: codiceInvito })
      } else if (!invito) {
        logger.warn('Invito non trovato (complete-profile)', { codice: codiceInvito })
      } else if (
        invito.pt_id &&
        (invito.stato === 'inviato' || invito.status === 'pending') &&
        (!invito.expires_at || new Date(invito.expires_at) > new Date())
      ) {
        const { data: trainerProfile } = await adminClient.from('profiles').select('org_id').eq('id', invito.pt_id).single()
        const { data: athleteProfile } = await adminClient.from('profiles').select('org_id').eq('id', profileId).single()
        let orgId: string | null = (trainerProfile as { org_id?: string | null } | null)?.org_id
          ?? (athleteProfile as { org_id?: string | null } | null)?.org_id ?? null
        if (orgId == null) {
          const { data: defaultOrg } = await adminClient.from('organizations').select('id').eq('slug', 'default-org').maybeSingle()
          orgId = defaultOrg?.id ?? 'default-org'
        }
        await adminClient
          .from('athlete_trainer_assignments')
          .update({ status: 'inactive', deactivated_at: new Date().toISOString() })
          .eq('athlete_id', profileId)
          .eq('status', 'active')
        const { error: relError } = await adminClient.from('athlete_trainer_assignments').insert({
          org_id: orgId,
          org_id_text: orgId,
          athlete_id: profileId,
          trainer_id: invito.pt_id,
          status: 'active',
          activated_at: new Date().toISOString(),
        })
        if (relError && relError.code !== '23505') {
          logger.warn('Errore INSERT athlete_trainer_assignments (complete-profile)', relError, {
            trainer_id: invito.pt_id,
            athlete_id: profileId,
          })
        }
        const updatePayload = {
          stato: 'registrato',
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/04549c1c-3da0-43fd-bc76-435058c34b0a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'complete-profile:before-update',message:'inviti_atleti update payload and invito state',data:{invitoId:invito.id,pt_id:invito.pt_id,statoBefore:invito.stato,statusBefore:invito.status,updatePayload},timestamp:Date.now(),hypothesisId:'H3',runId:'invite-update'})}).catch(()=>{});
        // #endregion
        const { error: updateInvitoErr } = await adminClient
          .from('inviti_atleti')
          .update(updatePayload)
          .eq('id', invito.id)
        if (updateInvitoErr) {
          const errSerialized = { message: updateInvitoErr.message, code: updateInvitoErr.code, details: updateInvitoErr.details, hint: updateInvitoErr.hint }
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/04549c1c-3da0-43fd-bc76-435058c34b0a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'complete-profile:update-invito-err',message:'UPDATE inviti_atleti error serialized',data:{invitoId:invito.id,...errSerialized},timestamp:Date.now(),hypothesisId:'H1',runId:'invite-update'})}).catch(()=>{});
          // #endregion
          logger.error('Errore UPDATE inviti_atleti (complete-profile)', updateInvitoErr, {
            invitoId: invito.id,
          })
        }
      } else {
        logger.warn('Invito non valido o scaduto (complete-profile)', {
          codice: codiceInvito,
          stato: invito.stato,
          status: invito.status,
          expires_at: invito.expires_at,
        })
      }
    }

    return NextResponse.json({ ok: true, created })
  } catch (error) {
    logger.error('Errore API complete-profile', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 },
    )
  }
}
