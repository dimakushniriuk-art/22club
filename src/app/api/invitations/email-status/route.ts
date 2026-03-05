import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isResendConfigured } from '@/lib/communications/email-resend-client'

const ALLOWED_ROLES = ['admin', 'trainer']

/**
 * GET /api/invitations/email-status
 * Indica se l'invio email inviti è configurato (Resend). Solo per utenti autorizzati.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ configured: false }, { status: 200 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const role = (profile as { role?: string } | null)?.role
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ configured: false }, { status: 200 })
    }

    return NextResponse.json({ configured: isResendConfigured() })
  } catch {
    return NextResponse.json({ configured: false }, { status: 200 })
  }
}
