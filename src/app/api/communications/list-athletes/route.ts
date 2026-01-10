// API route per recuperare lista atleti per selezione destinatari

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/communications/list-athletes')

export async function GET() {
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

    // Recupera tutti gli atleti attivi
    const { data: athletes, error: athletesError } = await supabase
      .from('profiles')
      .select('user_id, nome, cognome, email')
      .or('role.eq.atleta,role.eq.athlete')
      .eq('stato', 'attivo')
      .order('cognome', { ascending: true })
      .order('nome', { ascending: true })

    if (athletesError) {
      logger.error('Error fetching athletes', athletesError)
      return NextResponse.json({ error: athletesError.message }, { status: 500 })
    }

    type AthleteProfile = {
      user_id: string
      nome?: string | null
      cognome?: string | null
      email?: string | null
    }

    const athletesData = (athletes as AthleteProfile[]) || []

    // Formatta i dati per il frontend
    const formattedAthletes = athletesData.map((athlete) => ({
      id: athlete.user_id,
      name:
        `${athlete.nome || ''} ${athlete.cognome || ''}`.trim() ||
        athlete.email ||
        'Nome non disponibile',
      email: athlete.email || null,
    }))

    return NextResponse.json({ athletes: formattedAthletes })
  } catch (error) {
    logger.error('Error in list-athletes API', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
