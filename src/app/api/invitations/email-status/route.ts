import { NextResponse } from 'next/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createClient } from '@/lib/supabase/server'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'
import { isResendConfigured } from '@/lib/communications/email-resend-client'

const ALLOWED_ROLES = ['admin', 'trainer']

/**
 * GET /api/invitations/email-status
 * Indica se l'invio email inviti è configurato (Resend). Solo per utenti autorizzati.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user) {
      return NextResponse.json({ configured: false }, { status: 200 })
    }

    const profile = await resolveProfileByIdentifier(supabase, user.id, 'role')
    const role = profile?.role as string | undefined
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ configured: false }, { status: 200 })
    }

    return NextResponse.json({ configured: isResendConfigured() })
  } catch {
    return NextResponse.json({ configured: false }, { status: 200 })
  }
}
