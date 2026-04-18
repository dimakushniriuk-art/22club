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
  createAthleteNutritionDataSchema,
  updateAthleteNutritionDataSchema,
} from '@/types/athlete-profile.schema'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

const logger = createLogger('api:athlete-nutrition')

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

    const validatedUpdates = updateAthleteNutritionDataSchema.safeParse(rawUpdatesUnknown)
    if (!validatedUpdates.success) {
      return NextResponse.json(
        { error: 'Dati nutrizionali non validi', details: validatedUpdates.error.flatten() },
        { status: 400 },
      )
    }

    const prep = await assertAthleteProfileWriteAllowed(
      supabase,
      user,
      athleteIdentifier,
      'api:athlete-nutrition',
    )
    if (!prep.ok) {
      return prep.response
    }

    return await upsertNutritionForAthleteUserId(
      prep.athleteAuthId,
      validatedUpdates.data,
      prep.writeDb,
    )
  } catch (error) {
    logger.error('Errore PATCH athlete-nutrition', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

async function upsertNutritionForAthleteUserId(
  athleteUserId: string,
  updates: z.infer<typeof updateAthleteNutritionDataSchema>,
  db: AthleteWriteDbClient,
) {
  const updateData: Record<string, unknown> = {}
  if (updates.obiettivo_nutrizionale !== undefined)
    updateData.obiettivo_nutrizionale = updates.obiettivo_nutrizionale
  if (updates.calorie_giornaliere_target !== undefined)
    updateData.calorie_giornaliere_target = updates.calorie_giornaliere_target
  if (updates.macronutrienti_target !== undefined)
    updateData.macronutrienti_target = updates.macronutrienti_target
  if (updates.dieta_seguita !== undefined) updateData.dieta_seguita = updates.dieta_seguita
  if (updates.intolleranze_alimentari !== undefined)
    updateData.intolleranze_alimentari = updates.intolleranze_alimentari
  if (updates.allergie_alimentari !== undefined)
    updateData.allergie_alimentari = updates.allergie_alimentari
  if (updates.alimenti_preferiti !== undefined)
    updateData.alimenti_preferiti = updates.alimenti_preferiti
  if (updates.alimenti_evitati !== undefined) updateData.alimenti_evitati = updates.alimenti_evitati
  if (updates.preferenze_orari_pasti !== undefined)
    updateData.preferenze_orari_pasti = updates.preferenze_orari_pasti
  if (updates.note_nutrizionali !== undefined)
    updateData.note_nutrizionali = updates.note_nutrizionali

  const { data: existing, error: existingErr } = await db
    .from('athlete_nutrition_data')
    .select('id')
    .eq('athlete_id', athleteUserId)
    .maybeSingle()

  if (existingErr) {
    logger.error('Lettura athlete_nutrition_data', existingErr, { athleteUserId })
    return NextResponse.json({ error: 'Errore database' }, { status: 500 })
  }

  let result: Tables<'athlete_nutrition_data'> | null = null

  if (existing?.id) {
    const { data, error } = await db
      .from('athlete_nutrition_data')
      .update(updateData as TablesUpdate<'athlete_nutrition_data'>)
      .eq('athlete_id', athleteUserId)
      .select('*')
      .single()

    if (error) {
      logger.error('Update athlete_nutrition_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_nutrition_data'>
  } else {
    const { data, error } = await db
      .from('athlete_nutrition_data')
      .insert({
        athlete_id: athleteUserId,
        ...updateData,
      } as TablesInsert<'athlete_nutrition_data'>)
      .select('*')
      .single()

    if (error) {
      logger.error('Insert athlete_nutrition_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_nutrition_data'>
  }

  if (!result) {
    return NextResponse.json({ error: 'Nessun dato restituito' }, { status: 500 })
  }

  const validated = createAthleteNutritionDataSchema.parse({
    id: result.id,
    athlete_id: result.athlete_id,
    obiettivo_nutrizionale: result.obiettivo_nutrizionale,
    calorie_giornaliere_target: result.calorie_giornaliere_target,
    macronutrienti_target: result.macronutrienti_target || {
      proteine_g: null,
      carboidrati_g: null,
      grassi_g: null,
    },
    dieta_seguita: result.dieta_seguita,
    intolleranze_alimentari: result.intolleranze_alimentari || [],
    allergie_alimentari: result.allergie_alimentari || [],
    alimenti_preferiti: result.alimenti_preferiti || [],
    alimenti_evitati: result.alimenti_evitati || [],
    preferenze_orari_pasti: result.preferenze_orari_pasti || {
      colazione: null,
      pranzo: null,
      cena: null,
      spuntini: [],
    },
    note_nutrizionali: result.note_nutrizionali,
    created_at: result.created_at,
    updated_at: result.updated_at,
  })

  return NextResponse.json({ data: validated })
}
