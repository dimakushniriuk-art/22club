/**
 * POST /api/onboarding/save-step
 * Salva un passo del wizard welcome su profiles usando service role (bypass RLS).
 * Body: { step: number, payload: Record<string, unknown> } — payload = campi da aggiornare su profiles.
 * Verifica che l'utente sia autenticato e aggiorna solo il proprio profilo (user_id = session.user.id).
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:onboarding:save-step')

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as {
      step?: number
      payload?: Record<string, unknown>
    }
    const step = typeof body.step === 'number' ? body.step : null
    const payload = body.payload && typeof body.payload === 'object' ? body.payload : null

    if (step == null || !payload) {
      return NextResponse.json({ error: 'step e payload obbligatori' }, { status: 400 })
    }

    // Rimuovi chiavi non aggiornabili o pericolose
    const allowedKeys = new Set([
      'nome',
      'cognome',
      'codice_fiscale',
      'sesso',
      'data_nascita',
      'phone',
      'telefono',
      'contatto_emergenza_nome',
      'contatto_emergenza_relazione',
      'contatto_emergenza_telefono',
      'indirizzo_residenza',
      'provincia',
      'cap',
      'citta',
      'nazione',
      'professione',
      'altezza_cm',
      'peso_corrente_kg',
      'peso_iniziale_kg',
      'obiettivo_peso',
      'bmi',
      'livello_esperienza',
      'tipo_atleta',
      'obiettivi_fitness',
      'livello_motivazione',
      'note',
      'certificato_medico_tipo',
      'certificato_medico_data_rilascio',
      'certificato_medico_scadenza',
      'limitazioni',
      'infortuni_recenti',
      'operazioni_passate',
      'allergie',
      'obiettivo_nutrizionale',
      'intolleranze',
      'allergie_alimentari',
      'abitudini_alimentari',
    ])
    const safePayload: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(payload)) {
      if (allowedKeys.has(k) && v !== undefined) safePayload[k] = v
    }

    if (Object.keys(safePayload).length === 0) {
      return NextResponse.json({ success: true })
    }

    const admin = createAdminClient()
    const { error } = await admin.from('profiles').update(safePayload).eq('user_id', user.id)

    if (error) {
      logger.error('Save step failed', error, { step, userId: user.id })
      return NextResponse.json({ error: error.message || 'Errore salvataggio' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('Save step exception', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
