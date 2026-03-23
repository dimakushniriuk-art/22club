import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:communications:check-stuck')

/**
 * POST /api/communications/check-stuck
 * Imposta a "failed" le comunicazioni bloccate in "sending" (create dall'utente corrente).
 * Restituisce { reset: number }.
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ reset: 0 }, { status: 200 })
    }

    const profile = await resolveProfileByIdentifier(supabase, user.id, 'id')
    const profileId = profile?.id as string | undefined
    if (!profileId) {
      return NextResponse.json({ reset: 0 }, { status: 200 })
    }

    const { data: rows, error: selectError } = await supabase
      .from('communications')
      .select('id')
      .eq('status', 'sending')
      .eq('created_by_profile_id', profileId)

    if (selectError || !rows?.length) {
      return NextResponse.json({ reset: 0 }, { status: 200 })
    }

    const { error: updateError } = await supabase
      .from('communications')
      .update({ status: 'failed' })
      .eq('status', 'sending')
      .eq('created_by_profile_id', profileId)

    if (updateError) {
      logger.error('check-stuck update error', updateError)
      return NextResponse.json({ reset: 0 }, { status: 200 })
    }

    return NextResponse.json({ reset: rows.length }, { status: 200 })
  } catch (err) {
    logger.error('check-stuck error', err)
    return NextResponse.json({ reset: 0 }, { status: 200 })
  }
}
