import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const communicationId = searchParams.get('communication_id')

    if (!communicationId || !communicationId.trim()) {
      return NextResponse.json(
        { error: 'communication_id obbligatorio' },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const { data: rows, error: recError } = await supabase
      .from('communication_recipients')
      .select('id, recipient_profile_id, recipient_type, status, sent_at, delivered_at, opened_at, failed_at, error_message, created_at')
      .eq('communication_id', communicationId.trim())
      .order('created_at', { ascending: true })

    if (recError) {
      return NextResponse.json(
        { error: recError.message, recipients: [] },
        { status: 500 },
      )
    }

    const profileIds = [...new Set((rows ?? []).map((r) => r.recipient_profile_id))]
    if (profileIds.length === 0) {
      return NextResponse.json({ recipients: [] }, { status: 200 })
    }

    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, user_id, email, first_name, last_name, nome, cognome, phone, telefono')
      .in('id', profileIds)

    if (profError) {
      return NextResponse.json(
        { error: profError.message, recipients: [] },
        { status: 500 },
      )
    }

    const profileMap = new Map(
      (profiles ?? []).map((p) => [
        p.id,
        {
          user_id: p.user_id ?? '',
          name: [p.first_name, p.last_name].filter(Boolean).join(' ') ||
            [p.nome, p.cognome].filter(Boolean).join(' ') ||
            p.email ||
            '—',
          email: p.email ?? null,
          phone: p.phone ?? p.telefono ?? null,
        },
      ]),
    )

    const recipients = (rows ?? []).map((r) => {
      const p = profileMap.get(r.recipient_profile_id)
      return {
        id: r.id,
        user_id: p?.user_id ?? '',
        name: p?.name ?? '—',
        email: p?.email ?? null,
        phone: p?.phone ?? null,
        recipient_type: r.recipient_type as 'push' | 'email' | 'sms',
        status: r.status as 'pending' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced',
        sent_at: r.sent_at ?? null,
        delivered_at: r.delivered_at ?? null,
        opened_at: r.opened_at ?? null,
        failed_at: r.failed_at ?? null,
        error_message: r.error_message ?? null,
        created_at: r.created_at ?? new Date().toISOString(),
      }
    })

    return NextResponse.json({ recipients }, { status: 200 })
  } catch (error) {
    console.error('[api/communications/recipients]', error)
    return NextResponse.json(
      { error: 'Errore interno del server', recipients: [] },
      { status: 500 },
    )
  }
}
