import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createLogger } from '@/lib/logger'
import { assertAthleteProfileWriteAllowed } from '@/lib/server/athlete-profile-patch-access'
import { updateAthleteAnagraficaSchema } from '@/types/athlete-profile.schema'
import type { TablesUpdate } from '@/types/supabase'

const logger = createLogger('api:athlete-anagrafica')

const patchBodySchema = z.object({
  athleteUserId: z.string().uuid(),
  updates: z.unknown(),
})

const ANAGRAFICA_SELECT = `
  user_id,
  nome,
  cognome,
  email,
  phone,
  telefono,
  data_nascita,
  sesso,
  codice_fiscale,
  indirizzo,
  citta,
  cap,
  provincia,
  nazione,
  contatto_emergenza_nome,
  contatto_emergenza_telefono,
  contatto_emergenza_relazione,
  professione,
  altezza_cm,
  peso_iniziale_kg,
  gruppo_sanguigno,
  created_at,
  updated_at
`

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    let json: unknown
    try {
      json = await request.json()
    } catch {
      return NextResponse.json({ error: 'Body JSON non valido' }, { status: 400 })
    }

    const parsedBody = patchBodySchema.safeParse(json)
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Parametri non validi', details: parsedBody.error.flatten() },
        { status: 400 },
      )
    }

    const { athleteUserId: athleteIdentifier, updates: rawUpdatesUnknown } = parsedBody.data

    const validatedUpdates = updateAthleteAnagraficaSchema.safeParse(rawUpdatesUnknown)
    if (!validatedUpdates.success) {
      return NextResponse.json(
        { error: 'Dati anagrafici non validi', details: validatedUpdates.error.flatten() },
        { status: 400 },
      )
    }

    const validated = validatedUpdates.data

    const prep = await assertAthleteProfileWriteAllowed(
      supabase,
      user,
      athleteIdentifier,
      'api:athlete-anagrafica',
    )
    if (!prep.ok) {
      return prep.response
    }

    const updateData: Record<string, unknown> = {}
    if (validated.nome !== undefined) updateData.nome = validated.nome
    if (validated.cognome !== undefined) updateData.cognome = validated.cognome
    if (validated.email !== undefined) updateData.email = validated.email
    if (validated.telefono !== undefined) {
      updateData.telefono = validated.telefono
      updateData.phone = validated.telefono
    }
    if (validated.data_nascita !== undefined) updateData.data_nascita = validated.data_nascita
    if (validated.sesso !== undefined) updateData.sesso = validated.sesso
    if (validated.codice_fiscale !== undefined) updateData.codice_fiscale = validated.codice_fiscale
    if (validated.indirizzo !== undefined) updateData.indirizzo = validated.indirizzo
    if (validated.citta !== undefined) updateData.citta = validated.citta
    if (validated.cap !== undefined) updateData.cap = validated.cap
    if (validated.provincia !== undefined) updateData.provincia = validated.provincia
    if (validated.nazione !== undefined) updateData.nazione = validated.nazione
    if (validated.contatto_emergenza_nome !== undefined)
      updateData.contatto_emergenza_nome = validated.contatto_emergenza_nome
    if (validated.contatto_emergenza_telefono !== undefined)
      updateData.contatto_emergenza_telefono = validated.contatto_emergenza_telefono
    if (validated.contatto_emergenza_relazione !== undefined)
      updateData.contatto_emergenza_relazione = validated.contatto_emergenza_relazione
    if (validated.professione !== undefined) updateData.professione = validated.professione
    if (validated.altezza_cm !== undefined) updateData.altezza_cm = validated.altezza_cm
    if (validated.peso_iniziale_kg !== undefined) updateData.peso_iniziale_kg = validated.peso_iniziale_kg
    if (validated.gruppo_sanguigno !== undefined) updateData.gruppo_sanguigno = validated.gruppo_sanguigno

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nessun campo da aggiornare' }, { status: 400 })
    }

    const { data, error } = await prep.writeDb
      .from('profiles')
      .update(updateData as TablesUpdate<'profiles'>)
      .eq('user_id', prep.athleteAuthId)
      .select(ANAGRAFICA_SELECT)
      .single()

    if (error) {
      logger.error('Update profiles anagrafica', error, { athleteUserId: prep.athleteAuthId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Nessun dato restituito' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    logger.error('Errore PATCH athlete-anagrafica', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}
