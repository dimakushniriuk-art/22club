import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'

const logger = createLogger('api/admin/users/trainer')

// GET - Recupera il trainer assegnato a un atleta
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const adminProfile = profile as { role?: string } | null
    const userRole = adminProfile?.role ?? ''
    if (!adminProfile || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const athleteId = searchParams.get('athleteId')

    if (!athleteId) {
      return NextResponse.json({ error: 'ID atleta richiesto' }, { status: 400 })
    }

    // Recupera la relazione pt_atleti
    const { data: relation, error } = await supabase
      .from('pt_atleti')
      .select('pt_id')
      .eq('atleta_id', athleteId)
      .maybeSingle()

    if (error) {
      logger.error('Errore recupero relazione pt_atleti', error)
      return NextResponse.json(
        { error: error.message || 'Errore nel recupero trainer assegnato' },
        { status: 500 },
      )
    }

    type RelationRow = Tables<'pt_atleti'>
    return NextResponse.json({ trainerId: relation ? (relation as RelationRow).pt_id : null })
  } catch (error: unknown) {
    logger.error('Errore nel recupero trainer assegnato', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore nel recupero trainer assegnato' },
      { status: 500 },
    )
  }
}
