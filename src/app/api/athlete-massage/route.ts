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
  createAthleteMassageDataSchema,
  updateAthleteMassageDataSchema,
} from '@/types/athlete-profile.schema'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

const logger = createLogger('api:athlete-massage')

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

    const validatedUpdates = updateAthleteMassageDataSchema.safeParse(rawUpdatesUnknown)
    if (!validatedUpdates.success) {
      return NextResponse.json(
        { error: 'Dati massaggi non validi', details: validatedUpdates.error.flatten() },
        { status: 400 },
      )
    }

    const prep = await assertAthleteProfileWriteAllowed(
      supabase,
      user,
      athleteIdentifier,
      'api:athlete-massage',
    )
    if (!prep.ok) {
      return prep.response
    }

    return await upsertMassageForAthleteUserId(
      prep.athleteAuthId,
      validatedUpdates.data,
      prep.writeDb,
    )
  } catch (error) {
    logger.error('Errore PATCH athlete-massage', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

async function upsertMassageForAthleteUserId(
  athleteUserId: string,
  updates: z.infer<typeof updateAthleteMassageDataSchema>,
  db: AthleteWriteDbClient,
) {
  const updateData: Record<string, unknown> = {}
  if (updates.preferenze_tipo_massaggio !== undefined)
    updateData.preferenze_tipo_massaggio = updates.preferenze_tipo_massaggio
  if (updates.zone_problematiche !== undefined)
    updateData.zone_problematiche = updates.zone_problematiche
  if (updates.intensita_preferita !== undefined)
    updateData.intensita_preferita = updates.intensita_preferita
  if (updates.allergie_prodotti !== undefined)
    updateData.allergie_prodotti = updates.allergie_prodotti
  if (updates.note_terapeutiche !== undefined)
    updateData.note_terapeutiche = updates.note_terapeutiche
  if (updates.storico_massaggi !== undefined) updateData.storico_massaggi = updates.storico_massaggi

  const { data: existing, error: existingErr } = await db
    .from('athlete_massage_data')
    .select('id')
    .eq('athlete_id', athleteUserId)
    .maybeSingle()

  if (existingErr) {
    logger.error('Lettura athlete_massage_data', existingErr, { athleteUserId })
    return NextResponse.json({ error: 'Errore database' }, { status: 500 })
  }

  let result: Tables<'athlete_massage_data'> | null = null

  if (existing?.id) {
    const { data, error } = await db
      .from('athlete_massage_data')
      .update(updateData as TablesUpdate<'athlete_massage_data'>)
      .eq('athlete_id', athleteUserId)
      .select('*')
      .single()

    if (error) {
      logger.error('Update athlete_massage_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_massage_data'>
  } else {
    const { data, error } = await db
      .from('athlete_massage_data')
      .insert({
        athlete_id: athleteUserId,
        ...updateData,
      } as TablesInsert<'athlete_massage_data'>)
      .select('*')
      .single()

    if (error) {
      logger.error('Insert athlete_massage_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_massage_data'>
  }

  if (!result) {
    return NextResponse.json({ error: 'Nessun dato restituito' }, { status: 500 })
  }

  const validated = createAthleteMassageDataSchema.parse({
    id: result.id,
    athlete_id: result.athlete_id,
    preferenze_tipo_massaggio: result.preferenze_tipo_massaggio || [],
    zone_problematiche: result.zone_problematiche || [],
    intensita_preferita: result.intensita_preferita,
    allergie_prodotti: result.allergie_prodotti || [],
    note_terapeutiche: result.note_terapeutiche,
    storico_massaggi: result.storico_massaggi || [],
    created_at: result.created_at,
    updated_at: result.updated_at,
  })

  return NextResponse.json({ data: validated })
}
