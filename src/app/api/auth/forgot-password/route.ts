import { NextRequest, NextResponse } from 'next/server'
import { sendResetPasswordEmail } from '@/lib/communications/send-reset-password-email'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:auth:forgot-password')

/**
 * POST /api/auth/forgot-password
 * Body: { email: string, redirectTo?: string }
 * Genera link di recovery con Supabase Admin e invia email personalizzata via Resend.
 * Restituisce sempre 200 con { success: true } se l'email è accettata (comportamento standard: non rivelare se l'email esiste).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const redirectTo =
      typeof body.redirectTo === 'string' && body.redirectTo.trim()
        ? body.redirectTo.trim()
        : request.nextUrl.origin + '/reset-password'

    if (!email) {
      return NextResponse.json(
        { error: 'Email obbligatoria' },
        { status: 400 },
      )
    }

    const result = await sendResetPasswordEmail({
      email,
      redirectTo,
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    }

    // In produzione si può restituire sempre success: true per non rivelare se l'email esiste.
    // Qui restituiamo l'errore per debug e per far capire all'utente se Resend non è configurato.
    logger.warn('Reset password email fallito', undefined, {
      email,
      error: result.error,
    })
    return NextResponse.json(
      { error: result.error || "Errore durante l'invio dell'email" },
      { status: 502 },
    )
  } catch (error) {
    logger.error('Errore API forgot-password', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 },
    )
  }
}
