import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createLogger } from '@/lib/logger'
import {
  assertAthleteProfileWriteAllowed,
  type AthleteWriteDbClient,
} from '@/lib/server/athlete-profile-patch-access'
import {
  createAthleteMotivationalDataSchema,
  updateAthleteMotivationalDataSchema,
} from '@/types/athlete-profile.schema'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

const logger = createLogger('api:athlete-motivational')

const patchBodySchema = z.object({
  athleteUserId: z.string().uuid(),
  updates: z.unknown(),
})

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

    const validatedUpdates = updateAthleteMotivationalDataSchema.safeParse(rawUpdatesUnknown)
    if (!validatedUpdates.success) {
      return NextResponse.json(
        { error: 'Dati motivazionali non validi', details: validatedUpdates.error.flatten() },
        { status: 400 },
      )
    }

    const prep = await assertAthleteProfileWriteAllowed(
      supabase,
      user,
      athleteIdentifier,
      'api:athlete-motivational',
    )
    if (!prep.ok) {
      return prep.response
    }

    return await upsertMotivationalForAthleteUserId(
      prep.athleteAuthId,
      validatedUpdates.data,
      prep.writeDb,
    )
  } catch (error) {
    logger.error('Errore PATCH athlete-motivational', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

async function upsertMotivationalForAthleteUserId(
  athleteUserId: string,
  updates: z.infer<typeof updateAthleteMotivationalDataSchema>,
  db: AthleteWriteDbClient,
) {
  const updateData: Record<string, unknown> = {}
  if (updates.motivazione_principale !== undefined)
    updateData.motivazione_principale = updates.motivazione_principale
  if (updates.motivazioni_secondarie !== undefined)
    updateData.motivazioni_secondarie = updates.motivazioni_secondarie
  if (updates.ostacoli_percepiti !== undefined)
    updateData.ostacoli_percepiti = updates.ostacoli_percepiti
  if (updates.preferenze_ambiente !== undefined)
    updateData.preferenze_ambiente = updates.preferenze_ambiente
  if (updates.preferenze_compagnia !== undefined)
    updateData.preferenze_compagnia = updates.preferenze_compagnia
  if (updates.livello_motivazione !== undefined)
    updateData.livello_motivazione = updates.livello_motivazione
  if (updates.storico_abbandoni !== undefined)
    updateData.storico_abbandoni = updates.storico_abbandoni
  if (updates.note_motivazionali !== undefined)
    updateData.note_motivazionali = updates.note_motivazionali

  const { data: existing, error: existingErr } = await db
    .from('athlete_motivational_data')
    .select('id')
    .eq('athlete_id', athleteUserId)
    .maybeSingle()

  if (existingErr) {
    logger.error('Lettura athlete_motivational_data', existingErr, { athleteUserId })
    return NextResponse.json({ error: 'Errore database' }, { status: 500 })
  }

  let result: Tables<'athlete_motivational_data'> | null = null

  if (existing?.id) {
    const { data, error } = await db
      .from('athlete_motivational_data')
      .update(updateData as TablesUpdate<'athlete_motivational_data'>)
      .eq('athlete_id', athleteUserId)
      .select('*')
      .single()

    if (error) {
      logger.error('Update athlete_motivational_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_motivational_data'>
  } else {
    const { data, error } = await db
      .from('athlete_motivational_data')
      .insert({
        athlete_id: athleteUserId,
        ...updateData,
      } as TablesInsert<'athlete_motivational_data'>)
      .select('*')
      .single()

    if (error) {
      logger.error('Insert athlete_motivational_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_motivational_data'>
  }

  if (!result) {
    return NextResponse.json({ error: 'Nessun dato restituito' }, { status: 500 })
  }

  const validated = createAthleteMotivationalDataSchema.parse({
    id: result.id,
    athlete_id: result.athlete_id,
    motivazione_principale: result.motivazione_principale,
    motivazioni_secondarie: result.motivazioni_secondarie || [],
    ostacoli_percepiti: result.ostacoli_percepiti || [],
    preferenze_ambiente: result.preferenze_ambiente || [],
    preferenze_compagnia: result.preferenze_compagnia || [],
    livello_motivazione: result.livello_motivazione,
    storico_abbandoni: result.storico_abbandoni || [],
    note_motivazionali: result.note_motivazionali,
    created_at: result.created_at,
    updated_at: result.updated_at,
  })

  return NextResponse.json({ data: validated })
}
