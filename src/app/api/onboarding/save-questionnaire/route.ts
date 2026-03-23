/**
 * POST /api/onboarding/save-questionnaire
 * Upsert athlete_questionnaires usando service role (bypass RLS).
 * Body: { anamnesi?, manleva?, liberatoria_media? } (version da costante).
 * Verifica sessione e che il profilo sia atleta; usa profile.id come athlete_id.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:onboarding:save-questionnaire')
const QUESTIONNAIRE_VERSION = 'intake-v1-2026-02-08'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profileRow = await resolveProfileByIdentifier(supabase, user.id, 'id, role')
    if (!profileRow || (profileRow.role as string | undefined) !== 'athlete') {
      return NextResponse.json({ error: 'Profilo atleta non trovato' }, { status: 403 })
    }

    const athleteId = profileRow.id as string
    const body = (await request.json().catch(() => ({}))) as {
      anamnesi?: Record<string, unknown>
      manleva?: Record<string, unknown>
      liberatoria_media?: Record<string, unknown>
    }

    const now = new Date().toISOString()
    const fullPayload = {
      athlete_id: athleteId,
      version: QUESTIONNAIRE_VERSION,
      anamnesi: body.anamnesi ?? {},
      manleva: body.manleva ?? {},
      liberatoria_media: body.liberatoria_media ?? {},
      updated_at: now,
    }

    const admin = createAdminClient()
    const { error } = await admin.from('athlete_questionnaires').upsert(
      {
        ...fullPayload,
        anamnesi: fullPayload.anamnesi as import('@/lib/supabase/types').Json,
        manleva: fullPayload.manleva as import('@/lib/supabase/types').Json,
        liberatoria_media: fullPayload.liberatoria_media as import('@/lib/supabase/types').Json,
      },
      { onConflict: 'athlete_id,version' },
    )

    if (error) {
      logger.error('Save questionnaire failed', error, { athleteId })
      return NextResponse.json(
        { error: error.message || 'Errore salvataggio questionario' },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('Save questionnaire exception', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
