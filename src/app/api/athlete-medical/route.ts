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
  createAthleteMedicalDataSchema,
  updateAthleteMedicalDataSchema,
} from '@/types/athlete-profile.schema'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'
const logger = createLogger('api:athlete-medical')

const patchBodySchema = z.object({
  /** `profiles.user_id` (auth) oppure `profiles.id` (PK scheda dashboard) — risolto lato server */
  athleteUserId: z.string().uuid(),
  updates: z.unknown(),
})

/**
 * PATCH /api/athlete-medical
 * Upsert `athlete_medical_data` dopo verifica sessione e permessi (modello GET /api/athletes/[id]).
 * Preferisce service role se allineato al progetto; altrimenti client con JWT (RLS, es. policy trainer su athlete_trainer_assignments).
 */
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

    const validatedUpdates = updateAthleteMedicalDataSchema.safeParse(rawUpdatesUnknown)
    if (!validatedUpdates.success) {
      return NextResponse.json(
        { error: 'Dati medici non validi', details: validatedUpdates.error.flatten() },
        { status: 400 },
      )
    }

    const updates = validatedUpdates.data

    const prep = await assertAthleteProfileWriteAllowed(
      supabase,
      user,
      athleteIdentifier,
      'api:athlete-medical',
    )
    if (!prep.ok) {
      return prep.response
    }

    return await upsertMedicalForAthleteUserId(prep.athleteAuthId, updates, prep.writeDb)
  } catch (error) {
    logger.error('Errore PATCH athlete-medical', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

async function upsertMedicalForAthleteUserId(
  athleteUserId: string,
  updates: z.infer<typeof updateAthleteMedicalDataSchema>,
  db: AthleteWriteDbClient,
) {
  const updateData: Record<string, unknown> = {}
  if (updates.certificato_medico_url !== undefined)
    updateData.certificato_medico_url = updates.certificato_medico_url
  if (updates.certificato_medico_scadenza !== undefined)
    updateData.certificato_medico_scadenza = updates.certificato_medico_scadenza
  if (updates.certificato_medico_tipo !== undefined)
    updateData.certificato_medico_tipo = updates.certificato_medico_tipo
  if (updates.referti_medici !== undefined) updateData.referti_medici = updates.referti_medici
  if (updates.allergie !== undefined) updateData.allergie = updates.allergie
  if (updates.patologie !== undefined) updateData.patologie = updates.patologie
  if (updates.farmaci_assunti !== undefined) updateData.farmaci_assunti = updates.farmaci_assunti
  if (updates.interventi_chirurgici !== undefined)
    updateData.interventi_chirurgici = updates.interventi_chirurgici
  if (updates.note_mediche !== undefined) updateData.note_mediche = updates.note_mediche

  const { data: existing, error: existingErr } = await db
    .from('athlete_medical_data')
    .select('id')
    .eq('athlete_id', athleteUserId)
    .maybeSingle()

  if (existingErr) {
    logger.error('Lettura athlete_medical_data', existingErr, { athleteUserId })
    return NextResponse.json({ error: 'Errore database' }, { status: 500 })
  }

  let result: Tables<'athlete_medical_data'> | null = null

  if (existing?.id) {
    const { data, error } = await db
      .from('athlete_medical_data')
      .update(updateData as TablesUpdate<'athlete_medical_data'>)
      .eq('athlete_id', athleteUserId)
      .select('*')
      .single()

    if (error) {
      logger.error('Update athlete_medical_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_medical_data'>
  } else {
    const { data, error } = await db
      .from('athlete_medical_data')
      .insert({
        athlete_id: athleteUserId,
        ...updateData,
      } as TablesInsert<'athlete_medical_data'>)
      .select('*')
      .single()

    if (error) {
      logger.error('Insert athlete_medical_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_medical_data'>
  }

  if (!result) {
    return NextResponse.json({ error: 'Nessun dato restituito' }, { status: 500 })
  }

  const validated = createAthleteMedicalDataSchema.parse({
    id: result.id,
    athlete_id: result.athlete_id,
    certificato_medico_url: result.certificato_medico_url,
    certificato_medico_scadenza: result.certificato_medico_scadenza,
    certificato_medico_tipo: result.certificato_medico_tipo,
    referti_medici: result.referti_medici || [],
    allergie: result.allergie || [],
    patologie: result.patologie || [],
    farmaci_assunti: result.farmaci_assunti || [],
    interventi_chirurgici: result.interventi_chirurgici || [],
    note_mediche: result.note_mediche,
    created_at: result.created_at,
    updated_at: result.updated_at,
  })

  return NextResponse.json({ data: validated })
}
