// API route per rilevare e resettare comunicazioni bloccate in stato "sending"
// Una comunicazione è considerata "bloccata" se è in stato "sending" da più di 10 minuti

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/communications/check-stuck')

const STUCK_THRESHOLD_MS = 10 * 60 * 1000 // 10 minuti

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verifica autenticazione
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verifica che sia staff
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const profileData = profile as { role?: string } | null
    if (
      profileError ||
      !profileData ||
      !['admin', 'pt', 'trainer', 'staff'].includes(profileData.role || '')
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Leggi communication ID dal body (opzionale, se non fornito controlla tutte)
    const body = await request.json().catch(() => ({}))
    const communicationId = body.communicationId as string | undefined

    const now = new Date()
    const thresholdTime = new Date(now.getTime() - STUCK_THRESHOLD_MS)

    // Trova comunicazioni bloccate in stato "sending"
    let query = supabase
      .from('communications')
      .select('id, title, status, updated_at')
      .eq('status', 'sending')
      .lt('updated_at', thresholdTime.toISOString())

    if (communicationId) {
      query = query.eq('id', communicationId)
    }

    const { data: stuckCommunications, error: queryError } = await query

    if (queryError) {
      return NextResponse.json(
        { error: `Error checking stuck communications: ${queryError.message}` },
        { status: 500 },
      )
    }

    type StuckCommunication = {
      id: string
      title: string
      status: string
      updated_at: string
    }

    const communicationsData = (stuckCommunications as StuckCommunication[]) || []

    if (communicationsData.length === 0) {
      return NextResponse.json({
        found: 0,
        reset: 0,
        message: 'No stuck communications found',
      })
    }

    // Reset delle comunicazioni bloccate a "failed"
    const ids = communicationsData.map((c) => c.id)
    // Workaround necessario per inferenza tipo Supabase
    const { error: updateError } =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('communications') as any)
        .update({
          status: 'failed',
          metadata: {
            error: 'Invio bloccato: timeout superato (10 minuti)',
            stuck_detected_at: now.toISOString(),
          } as Record<string, unknown>,
        } as Record<string, unknown>)
        .in('id', ids)

    if (updateError) {
      return NextResponse.json(
        { error: `Error resetting stuck communications: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      found: communicationsData.length,
      reset: ids.length,
      communications: communicationsData.map((c) => ({
        id: c.id,
        title: c.title,
        was_stuck_since: c.updated_at,
      })),
      message: `Reset ${ids.length} stuck communication(s)`,
    })
  } catch (error) {
    logger.error('Error checking stuck communications', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
