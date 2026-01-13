import { NextRequest, NextResponse } from 'next/server'
import { getUpcomingAppointments } from '@/app/dashboard/_components/upcoming-appointments'
import { AppointmentsResponseSchema } from '@/lib/validations/dashboard'
import { rateLimit } from '@/lib/rate-limit'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/dashboard/appointments')

export const revalidate = 60 // Revalidate ogni 60 secondi

export async function GET(req: NextRequest) {
  // Rate limiting: max 30 richieste/minuto per IP
  const rateLimitResponse = await rateLimit({ windowMs: 60000, maxRequests: 30 })(req)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const appointments = await getUpcomingAppointments()

    // Valida response con Zod
    const validated = AppointmentsResponseSchema.parse(appointments)

    return NextResponse.json(validated, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    logger.error('Error in appointments API', error)

    // Se errore Zod, ritorna 400 con dettagli
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as Record<string, unknown>).issues },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}
