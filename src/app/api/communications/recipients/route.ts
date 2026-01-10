// API route per recuperare lista recipients di una comunicazione

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/communications/recipients')

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  try {
    // Verifica autenticazione
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verifica che sia staff
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const profileData = profile as { role?: string } | null
    if (
      profileError ||
      !profileData ||
      !['admin', 'pt', 'trainer', 'staff'].includes(profileData.role || '')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Leggi communication_id da query params
    const searchParams = request.nextUrl.searchParams
    const communicationId = searchParams.get('communication_id')

    if (!communicationId) {
      return NextResponse.json({ error: 'communication_id is required' }, { status: 400 })
    }

    // Recupera recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('communication_recipients')
      .select(
        'id, user_id, recipient_type, status, sent_at, delivered_at, opened_at, failed_at, error_message, created_at',
      )
      .eq('communication_id', communicationId)
      .order('created_at', { ascending: false })

    if (recipientsError) {
      logger.error('Error fetching recipients', recipientsError, { communicationId })
      return NextResponse.json({ error: recipientsError.message }, { status: 500 })
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ recipients: [] })
    }

    type CommunicationRecipient = {
      id: string
      user_id: string
      recipient_type: string
      status: string
      sent_at?: string | null
      delivered_at?: string | null
      opened_at?: string | null
      failed_at?: string | null
      error_message?: string | null
      created_at?: string | null
      [key: string]: unknown
    }

    const recipientsData = (recipients as CommunicationRecipient[]) || []

    // Recupera profili per tutti i user_id
    const userIds = [...new Set(recipientsData.map((r) => r.user_id))]
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, nome, cognome, email, telefono')
      .in('user_id', userIds)

    if (profilesError) {
      logger.error('Error fetching profiles', profilesError, { communicationId })
      // Continua anche se i profili non sono disponibili
    }

    type ProfileData = {
      user_id: string
      nome?: string | null
      cognome?: string | null
      email?: string | null
      telefono?: string | null
    }

    // Crea una mappa per lookup veloce
    const profilesData = (profiles as ProfileData[]) || []
    const profilesMap = new Map(profilesData.map((p) => [p.user_id, p]))

    // Formatta i dati per includere nome completo
    const formattedRecipients = recipientsData.map((recipient) => {
      const profile = profilesMap.get(recipient.user_id)

      return {
        id: recipient.id,
        user_id: recipient.user_id,
        name: profile
          ? `${profile.nome || ''} ${profile.cognome || ''}`.trim() || profile.email
          : 'Nome non disponibile',
        email: profile?.email || null,
        phone: profile?.telefono || null,
        recipient_type: recipient.recipient_type,
        status: recipient.status,
        sent_at: recipient.sent_at,
        delivered_at: recipient.delivered_at,
        opened_at: recipient.opened_at,
        failed_at: recipient.failed_at,
        error_message: recipient.error_message,
        created_at: recipient.created_at,
      }
    })

    return NextResponse.json({ recipients: formattedRecipients })
  } catch (error) {
    logger.error('Error in communications/recipients API', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
