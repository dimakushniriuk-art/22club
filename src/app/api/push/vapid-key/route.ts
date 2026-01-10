import { NextResponse } from 'next/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:push:vapid-key:route')

export async function GET() {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_KEY

    if (!publicKey) {
      return NextResponse.json({ error: 'VAPID public key not configured' }, { status: 500 })
    }

    return NextResponse.json({
      publicKey,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error getting VAPID key', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
