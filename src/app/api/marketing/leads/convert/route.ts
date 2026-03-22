import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAbsoluteUrl } from '@/lib/utils/get-app-url'
import { createLogger } from '@/lib/logger'
import { z } from 'zod'

const logger = createLogger('api:marketing:leads:convert')

const bodySchema = z.object({
  leadId: z.string().uuid('leadId deve essere un UUID valido'),
  trialDays: z.number().int().min(1).max(60).optional().default(7),
  sendInvite: z.boolean().optional().default(true),
})

type LeadRow = {
  id: string
  org_id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  status: string
  converted_athlete_profile_id: string | null
}

type ProfileRow = {
  id: string
  user_id: string
  org_id: string | null
  role: string
  stato: string | null
  first_login: boolean | null
}

/**
 * POST /api/marketing/leads/convert
 * Converte un lead in atleta TRIAL. Solo admin/marketing. Idempotente se già convertito.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { data: callerProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, role, org_id')
      .eq('user_id', user.id)
      .single()

    if (profileErr || !callerProfile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const role = (callerProfile as { role: string }).role
    const callerOrgId = (callerProfile as { org_id: string | null }).org_id
    const callerProfileId = (callerProfile as { id: string }).id

    if (role !== 'admin' && role !== 'marketing') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    if (callerOrgId == null || callerOrgId === '') {
      return NextResponse.json({ error: 'Organizzazione non associata' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dati non validi', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { leadId, sendInvite } = parsed.data

    const { data: lead, error: leadErr } = await supabase
      .from('marketing_leads')
      .select(
        'id, org_id, first_name, last_name, email, phone, status, converted_athlete_profile_id',
      )
      .eq('id', leadId)
      .single()

    if (leadErr || !lead) {
      return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })
    }

    const leadRow = lead as LeadRow
    if (leadRow.org_id !== callerOrgId) {
      return NextResponse.json({ error: "Lead di un'altra organizzazione" }, { status: 403 })
    }

    if (leadRow.converted_athlete_profile_id != null) {
      return NextResponse.json({
        ok: true,
        leadId,
        profileId: leadRow.converted_athlete_profile_id,
        userId: null,
        alreadyConverted: true,
        inviteSent: false,
      })
    }

    const admin = createAdminClient()
    const email = leadRow.email.trim()
    if (!email) {
      return NextResponse.json({ error: 'Lead senza email' }, { status: 400 })
    }

    let profileId: string
    let userId: string | null = null
    let inviteSent = false

    const { data: existingProfiles } = await admin
      .from('profiles')
      .select('id, user_id, role, org_id, stato, first_login')
      .eq('email', email)
      .limit(2)

    const existingProfile = (existingProfiles ?? [])[0] as ProfileRow | undefined

    if (existingProfile) {
      if (existingProfile.org_id != null && existingProfile.org_id !== leadRow.org_id) {
        return NextResponse.json(
          { error: "Questa email è già usata da un atleta di un'altra organizzazione." },
          { status: 409 },
        )
      }
      const roleNorm = existingProfile.role?.toLowerCase()
      if (roleNorm !== 'athlete') {
        return NextResponse.json(
          { error: 'Questa email è già registrata con un ruolo diverso da atleta.' },
          { status: 409 },
        )
      }
      profileId = existingProfile.id
      userId = existingProfile.user_id
      await admin
        .from('profiles')
        .update({
          org_id: existingProfile.org_id ?? leadRow.org_id,
          stato: existingProfile.stato ?? 'trial',
          first_login: existingProfile.first_login ?? true,
          first_name: leadRow.first_name,
          last_name: leadRow.last_name,
          nome: leadRow.first_name,
          cognome: leadRow.last_name,
          phone: leadRow.phone,
          telefono: leadRow.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id)
    } else {
      let authUserId: string

      if (sendInvite) {
        const redirectTo = getAbsoluteUrl('/post-login', request)
        const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
          email,
          {
            redirectTo,
            data: {
              first_name: leadRow.first_name,
              last_name: leadRow.last_name,
              lead_id: leadId,
            },
          },
        )
        if (inviteErr) {
          const msg = inviteErr.message ?? ''
          if (
            msg.toLowerCase().includes('already') ||
            msg.toLowerCase().includes('already registered')
          ) {
            const {
              data: { users },
            } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
            const existingAuth = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
            if (!existingAuth) {
              logger.warn('Invite failed, no existing auth user', inviteErr)
              return NextResponse.json({ error: msg || 'Errore invito email' }, { status: 500 })
            }
            authUserId = existingAuth.id
          } else {
            return NextResponse.json({ error: msg || 'Errore invito email' }, { status: 500 })
          }
        } else {
          const inv = inviteData as { user?: { id: string }; id?: string }
          authUserId = inv?.user?.id ?? inv?.id ?? ''
          if (!authUserId) {
            return NextResponse.json(
              { error: 'Invito inviato ma utente non restituito' },
              { status: 500 },
            )
          }
          inviteSent = true
        }
      } else {
        const { data: createData, error: createErr } = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            first_name: leadRow.first_name,
            last_name: leadRow.last_name,
          },
        })
        if (createErr) {
          const msg = createErr.message ?? ''
          if (msg.toLowerCase().includes('already')) {
            const {
              data: { users },
            } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
            const existingAuth = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
            if (!existingAuth) {
              return NextResponse.json({ error: msg || 'Email già registrata' }, { status: 500 })
            }
            authUserId = existingAuth.id
          } else {
            return NextResponse.json({ error: msg || 'Errore creazione utente' }, { status: 500 })
          }
        } else {
          authUserId = createData.user?.id ?? ''
          if (!authUserId) {
            return NextResponse.json({ error: 'Utente non restituito' }, { status: 500 })
          }
        }
      }

      userId = authUserId

      const { data: existingByUser } = await admin
        .from('profiles')
        .select('id')
        .eq('user_id', authUserId)
        .single()
      if (existingByUser?.id) {
        profileId = (existingByUser as { id: string }).id
        await admin
          .from('profiles')
          .update({
            org_id: leadRow.org_id,
            role: 'athlete',
            stato: 'trial',
            first_login: true,
            first_name: leadRow.first_name,
            last_name: leadRow.last_name,
            nome: leadRow.first_name,
            cognome: leadRow.last_name,
            phone: leadRow.phone,
            telefono: leadRow.phone,
            email: leadRow.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileId)
      } else {
        const { data: inserted, error: insertErr } = await admin
          .from('profiles')
          .insert({
            user_id: authUserId,
            email: leadRow.email,
            role: 'athlete',
            org_id: leadRow.org_id,
            phone: leadRow.phone,
            telefono: leadRow.phone,
            first_name: leadRow.first_name,
            last_name: leadRow.last_name,
            nome: leadRow.first_name,
            cognome: leadRow.last_name,
            stato: 'trial',
            first_login: true,
          })
          .select('id')
          .single()
        if (insertErr || !inserted) {
          logger.error('Insert profile after auth', insertErr)
          return NextResponse.json(
            { error: insertErr?.message ?? 'Errore creazione profilo' },
            { status: 500 },
          )
        }
        profileId = (inserted as { id: string }).id
      }
    }

    const { data: rpcResult, error: rpcErr } = await admin.rpc('marketing_link_lead_to_profile', {
      p_lead_id: leadId,
      p_profile_id: profileId,
    })

    if (rpcErr) {
      logger.error('RPC marketing_link_lead_to_profile', rpcErr)
      return NextResponse.json(
        { error: rpcErr.message ?? 'Errore collegamento lead-profilo' },
        { status: 500 },
      )
    }

    const rpc = rpcResult as { ok?: boolean } | null
    if (rpc && !rpc.ok) {
      return NextResponse.json({ error: 'Link lead-profilo non aggiornato' }, { status: 500 })
    }

    await admin
      .from('marketing_leads')
      .update({
        converted_by_profile_id: callerProfileId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)

    return NextResponse.json({
      ok: true,
      leadId,
      profileId,
      userId,
      alreadyConverted: false,
      inviteSent,
    })
  } catch (err) {
    logger.error('POST /api/marketing/leads/convert', err)
    const message = err instanceof Error ? err.message : 'Errore interno del server'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
