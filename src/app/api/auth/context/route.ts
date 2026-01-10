import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { TablesUpdate } from '@/types/supabase'

const logger = createLogger('api:auth:context')

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verifica che l'utente sia autenticato
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Estrai i headers personalizzati
    const userRole = request.headers.get('x-user-role')
    const orgId = request.headers.get('x-org-id')

    if (!userRole || !orgId) {
      return NextResponse.json({ error: 'Ruolo e organizzazione richiesti' }, { status: 400 })
    }

    // Verifica che il ruolo sia valido
    const validRoles: ('athlete' | 'trainer' | 'admin')[] = ['athlete', 'trainer', 'admin']
    if (!validRoles.includes(userRole as 'athlete' | 'trainer' | 'admin')) {
      return NextResponse.json({ error: 'Ruolo non valido' }, { status: 400 })
    }

    // Aggiorna il profilo utente con ruolo e org_id
    const updateData: TablesUpdate<'profiles'> = {
      role: userRole as 'athlete' | 'trainer' | 'admin',
      org_id: orgId,
      updated_at: new Date().toISOString(),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('profiles') as any)
      .update(updateData)
      .eq('user_id', session.user.id)

    if (updateError) {
      logger.error('Errore aggiornamento profilo', updateError, { userRole, orgId })
      return NextResponse.json({ error: 'Errore aggiornamento profilo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Contesto aggiornato con successo',
      data: {
        role: userRole,
        org_id: orgId,
        user_id: session.user.id,
      },
    })
  } catch (error) {
    logger.error('Errore API auth/context POST', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Verifica che l'utente sia autenticato
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Ottieni il profilo utente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, org_id, nome, cognome, email')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const profileData = profile as {
      role?: string
      org_id?: string
      nome?: string
      cognome?: string
      email?: string
    }

    return NextResponse.json({
      success: true,
      data: {
        role: profileData.role || '',
        org_id: profileData.org_id || '',
        full_name: `${profileData.nome || ''} ${profileData.cognome || ''}`.trim(),
        email: profileData.email || '',
        user_id: session.user.id,
      },
    })
  } catch (error) {
    logger.error('Errore API auth/context GET', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
