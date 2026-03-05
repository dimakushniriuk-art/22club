import { NextResponse } from 'next/server'

/**
 * GET /api/push/vapid-key
 * Restituisce la VAPID public key per le push notifications
 */
export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_KEY

  if (!publicKey) {
    return NextResponse.json({ error: 'VAPID key non configurata' }, { status: 500 })
  }

  return NextResponse.json({ publicKey })
}
