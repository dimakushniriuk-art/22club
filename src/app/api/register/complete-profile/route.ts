import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:register:complete-profile')

/** Decodifica base64url (compatibile Node e Edge). */
function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf8')
  }
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Decodifica payload JWT (solo lettura, token ricevuto dal client subito dopo signUp). */
function decodeJwtPayload(token: string): { sub?: string; email?: string } | null {
  try {
    const parts = token.trim().split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(base64UrlDecode(parts[1]!)) as { sub?: string; email?: string }
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
  const adminClient = createAdminClient()
  let userId!: string
  let email!: string
  let profileId!: string
  let created = false
  try {
    const body = await request.json().catch(() => ({}))
    const accessToken = typeof body.access_token === 'string' ? body.access_token.trim() : null
    const codiceInvito =
      (typeof body.codice === 'string' ? body.codice.trim() : null) ||
      (typeof body.code === 'string' ? body.code.trim() : null) ||
      ''

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
        error: _sessionError,
      } = await supabase.auth.getSession()
      if (session?.user) {
        userId = session.user.id
        email =
          session.user.email?.trim() ||
          (typeof body.email === 'string' ? body.email.trim() : '') ||
          ''
      } else {
        // Conferma email attiva: signUp restituisce session = null; il client invia user_id (authData.user.id)
        const bodyUserId = typeof body.user_id === 'string' ? body.user_id.trim() : null
        const bodyEmail = typeof body.email === 'string' ? body.email.trim() : null
        if (!bodyUserId || !bodyEmail) {
          return NextResponse.json(
            {
              error:
                'Sessione non disponibile. Se hai la conferma email attiva, controlla la casella e clicca il link di conferma, poi riprova la registrazione.',
            },
            { status: 401 },
          )
        }
        const adminAuth = createAdminClient().auth.admin
        const { data: authData, error: authErr } = await adminAuth.getUserById(bodyUserId)
        const authUserObj =
          authData?.user ??
          (authData as unknown as { user?: { id: string; email?: string; created_at?: string } })
            ?.user
        if (authErr || !authUserObj) {
          logger.warn('complete-profile: getUserById fallito', authErr, {
            bodyUserId,
          })
          return NextResponse.json(
            {
              error: "Utente non trovato. Conferma l'email dal link ricevuto e riprova.",
            },
            { status: 401 },
          )
        }
        if (authUserObj.email?.toLowerCase() !== bodyEmail.toLowerCase()) {
          return NextResponse.json({ error: "Email non corrisponde all'utente." }, { status: 400 })
          userId = bodyUserId
          email = bodyEmail
        }
      }

      const { data: existing } = await adminClient
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (existing) {
        profileId = existing.id
        const nome = typeof body.nome === 'string' ? body.nome.trim() : null
        const cognome = typeof body.cognome === 'string' ? body.cognome.trim() : null
        if (nome !== null || cognome !== null) {
          await adminClient
            .from('profiles')
            .update({
              ...(nome !== null && { nome: nome || null }),
              ...(cognome !== null && { cognome: cognome || null }),
            })
            .eq('id', profileId)
        }
      } else {
        const nome = typeof body.nome === 'string' ? body.nome.trim() : ''
        const cognome = typeof body.cognome === 'string' ? body.cognome.trim() : ''
        if (!email) {
          return NextResponse.json(
            { error: 'Email mancante per la creazione del profilo' },
            { status: 400 },
          )
        }

        let orgIdForInsert: string
        try {
          const { data: defaultOrg } = await adminClient
            .from('organizations')
            .select('id')
            .eq('slug', 'default-org')
            .maybeSingle()
          if (defaultOrg?.id) {
            orgIdForInsert = defaultOrg.id
          } else {
            const { data: firstOrg } = await adminClient
              .from('organizations')
              .select('id')
              .limit(1)
              .maybeSingle()
            orgIdForInsert = (firstOrg as { id?: string } | null)?.id ?? ''
          }
        } catch {
          orgIdForInsert = ''
        }
        if (!orgIdForInsert) {
          logger.error('Nessuna organization trovata (complete-profile)', { userId })
          return NextResponse.json(
            { error: "Configurazione organizzazione mancante. Contatta l'amministratore." },
            { status: 502 },
          )
        }

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
            const { data: existingByUser } = await adminClient
              .from('profiles')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle()
            if (existingByUser) {
              profileId = existingByUser.id
              created = false
              // Profilo creato dal trigger senza nome/cognome: aggiornali ora
              const nomeVal = typeof body.nome === 'string' ? body.nome.trim() || null : null
              const cognomeVal =
                typeof body.cognome === 'string' ? body.cognome.trim() || null : null
              if (nomeVal !== null || cognomeVal !== null) {
                await adminClient
                  .from('profiles')
                  .update({
                    ...(nomeVal !== null && { nome: nomeVal }),
                    ...(cognomeVal !== null && { cognome: cognomeVal }),
                  })
                  .eq('id', profileId)
              }
            } else {
              const msg =
                insertError.message?.includes('email') || insertError.details?.includes('email')
                  ? "Questa email è già registrata. Usa un'altra email o accedi al tuo account."
                  : insertError.message || 'Errore creazione profilo'
              logger.error('Errore INSERT profiles (complete-profile) - conflitto', insertError, {
                userId,
                email,
              })
              return NextResponse.json({ error: msg, code: insertError.code }, { status: 409 })
            }
          } else {
            const errMsg =
              insertError.message ||
              (typeof insertError.details === 'string' ? insertError.details : null) ||
              (typeof (insertError as { hint?: string }).hint === 'string'
                ? (insertError as { hint: string }).hint
                : null) ||
              "Errore durante la creazione del profilo. Riprova o contatta l'assistenza."
            logger.error('Errore INSERT profiles (complete-profile)', insertError, {
              userId,
              email,
              code: insertError.code,
            })
            return NextResponse.json(
              { error: errMsg, code: insertError.code, details: insertError.details },
              { status: 502 },
            )
          }
        } else {
          profileId = inserted!.id
          created = true
        }
      }
    }

    let invito: { id: string; pt_id: string; stato: string; status: string | null } | null = null
    if (codiceInvito) {
      const { data: invitoByCodice, error: invitoErr } = await adminClient
        .from('inviti_atleti')
        .select('id, pt_id, stato, status')
        .eq('codice', codiceInvito)
        .maybeSingle()
      if (invitoErr) {
        logger.warn('Lookup invito (complete-profile)', invitoErr, { codice: codiceInvito })
      } else {
        invito = invitoByCodice
        if (invito) {
          logger.info('complete-profile: invito trovato per codice', {
            invitoId: invito.id,
            codice: codiceInvito,
          })
        }
      }
    }
    if (!invito && email) {
      const emailTrim = email.trim()
      const { data: invitoByEmail, error: invitoEmailErr } = await adminClient
        .from('inviti_atleti')
        .select('id, pt_id, stato, status')
        .ilike('email', emailTrim)
        .or('stato.eq.inviato,status.eq.pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (invitoEmailErr) {
        logger.warn('Lookup invito per email (complete-profile)', invitoEmailErr, {
          email: emailTrim,
        })
      }
      invito = invitoByEmail
      if (invito) {
        logger.info('complete-profile: invito trovato per email (fallback)', {
          invitoId: invito.id,
          email: emailTrim,
        })
      }
    }
    if (!invito && (codiceInvito || email)) {
      logger.warn('complete-profile: nessun invito trovato', {
        codice: codiceInvito,
        email: email?.trim(),
      })
    }
    if (invito && invito.pt_id && (invito.stato === 'inviato' || invito.status === 'pending')) {
      const { data: trainerProfile } = await adminClient
        .from('profiles')
        .select('org_id')
        .eq('id', invito.pt_id)
        .single()
      const { data: athleteProfile } = await adminClient
        .from('profiles')
        .select('org_id')
        .eq('id', profileId)
        .single()
      let orgId: string | null =
        (trainerProfile as { org_id?: string | null } | null)?.org_id ??
        (athleteProfile as { org_id?: string | null } | null)?.org_id ??
        null
      if (orgId == null) {
        const { data: defaultOrg } = await adminClient
          .from('organizations')
          .select('id')
          .eq('slug', 'default-org')
          .maybeSingle()
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
      // pt_atleti ha UNIQUE(atleta_id): una sola riga per atleta. Aggiorniamo la riga esistente al nuovo pt_id, altrimenti inseriamo.
      const { data: updatedRow, error: ptUpdateErr } = await adminClient
        .from('pt_atleti')
        .update({ pt_id: invito.pt_id })
        .eq('atleta_id', profileId)
        .select('id')
        .maybeSingle()
      if (ptUpdateErr) {
        logger.warn('Errore UPDATE pt_atleti (complete-profile)', ptUpdateErr, {
          atleta_id: profileId,
        })
      }
      if (!updatedRow) {
        const { error: ptInsertErr } = await adminClient
          .from('pt_atleti')
          .insert({ pt_id: invito.pt_id, atleta_id: profileId })
        if (ptInsertErr) {
          logger.warn('Errore INSERT pt_atleti (complete-profile)', ptInsertErr, {
            pt_id: invito.pt_id,
            atleta_id: profileId,
          })
        }
      }
      const updatePayload = {
        stato: 'registrato',
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      }
      const { error: updateInvitoErr } = await adminClient
        .from('inviti_atleti')
        .update(updatePayload)
        .eq('id', invito.id)
      if (updateInvitoErr) {
        logger.error('Errore UPDATE inviti_atleti (complete-profile)', updateInvitoErr, {
          invitoId: invito.id,
        })
      }
    }

    return NextResponse.json({ ok: true, created })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('Errore API complete-profile', error, {
      message: error.message,
      stack: error.stack,
    })
    const message = typeof error.message === 'string' ? error.message : 'Errore interno del server'
    return NextResponse.json({ error: message, details: message }, { status: 500 })
  }
}
