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
  createAthleteFitnessDataSchema,
  updateAthleteFitnessDataSchema,
} from '@/types/athlete-profile.schema'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

const logger = createLogger('api:athlete-fitness')

const patchBodySchema = z.object({
  /** `profiles.user_id` (auth) oppure `profiles.id` (PK scheda dashboard) — risolto lato server */
  athleteUserId: z.string().uuid(),
  updates: z.unknown(),
})

/**
 * PATCH /api/athlete-fitness
 * Upsert `athlete_fitness_data` dopo verifica sessione e permessi (stesso modello di `/api/athlete-medical`).
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

    const validatedUpdates = updateAthleteFitnessDataSchema.safeParse(rawUpdatesUnknown)
    if (!validatedUpdates.success) {
      return NextResponse.json(
        { error: 'Dati fitness non validi', details: validatedUpdates.error.flatten() },
        { status: 400 },
      )
    }

    const updates = validatedUpdates.data

    const prep = await assertAthleteProfileWriteAllowed(supabase, user, athleteIdentifier, 'api:athlete-fitness')
    if (!prep.ok) {
      return prep.response
    }

    return await upsertFitnessForAthleteUserId(prep.athleteAuthId, updates, prep.writeDb)
  } catch (error) {
    logger.error('Errore PATCH athlete-fitness', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

async function upsertFitnessForAthleteUserId(
  athleteUserId: string,
  updates: z.infer<typeof updateAthleteFitnessDataSchema>,
  db: AthleteWriteDbClient,
) {
  const updateData: Record<string, unknown> = {}
  if (updates.livello_esperienza !== undefined)
    updateData.livello_esperienza = updates.livello_esperienza
  if (updates.obiettivo_primario !== undefined)
    updateData.obiettivo_primario = updates.obiettivo_primario
  if (updates.obiettivi_secondari !== undefined)
    updateData.obiettivi_secondari = updates.obiettivi_secondari
  if (updates.giorni_settimana_allenamento !== undefined)
    updateData.giorni_settimana_allenamento = updates.giorni_settimana_allenamento
  if (updates.durata_sessione_minuti !== undefined)
    updateData.durata_sessione_minuti = updates.durata_sessione_minuti
  if (updates.preferenze_orario !== undefined) updateData.preferenze_orario = updates.preferenze_orario
  if (updates.attivita_precedenti !== undefined)
    updateData.attivita_precedenti = updates.attivita_precedenti
  if (updates.infortuni_pregressi !== undefined)
    updateData.infortuni_pregressi = updates.infortuni_pregressi
  if (updates.zone_problematiche !== undefined)
    updateData.zone_problematiche = updates.zone_problematiche
  if (updates.note_fitness !== undefined) updateData.note_fitness = updates.note_fitness

  const { data: existing, error: existingErr } = await db
    .from('athlete_fitness_data')
    .select('id')
    .eq('athlete_id', athleteUserId)
    .maybeSingle()

  if (existingErr) {
    logger.error('Lettura athlete_fitness_data', existingErr, { athleteUserId })
    return NextResponse.json({ error: 'Errore database' }, { status: 500 })
  }

  let result: Tables<'athlete_fitness_data'> | null = null

  if (existing?.id) {
    const { data, error } = await db
      .from('athlete_fitness_data')
      .update(updateData as TablesUpdate<'athlete_fitness_data'>)
      .eq('athlete_id', athleteUserId)
      .select('*')
      .single()

    if (error) {
      logger.error('Update athlete_fitness_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_fitness_data'>
  } else {
    const { data, error } = await db
      .from('athlete_fitness_data')
      .insert({
        athlete_id: athleteUserId,
        ...updateData,
      } as TablesInsert<'athlete_fitness_data'>)
      .select('*')
      .single()

    if (error) {
      logger.error('Insert athlete_fitness_data', error, { athleteUserId })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    result = data as Tables<'athlete_fitness_data'>
  }

  if (!result) {
    return NextResponse.json({ error: 'Nessun dato restituito' }, { status: 500 })
  }

  const validated = createAthleteFitnessDataSchema.parse({
    id: result.id,
    athlete_id: result.athlete_id,
    livello_esperienza: result.livello_esperienza,
    obiettivo_primario: result.obiettivo_primario,
    obiettivi_secondari: result.obiettivi_secondari || [],
    giorni_settimana_allenamento: result.giorni_settimana_allenamento,
    durata_sessione_minuti: result.durata_sessione_minuti,
    preferenze_orario: result.preferenze_orario || [],
    attivita_precedenti: result.attivita_precedenti || [],
    infortuni_pregressi: result.infortuni_pregressi || [],
    zone_problematiche: result.zone_problematiche || [],
    note_fitness: result.note_fitness,
    created_at: result.created_at,
    updated_at: result.updated_at,
  })

  return NextResponse.json({ data: validated })
}
