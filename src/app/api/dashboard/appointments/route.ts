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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/dashboard/appointments/route.ts:17',
        message: 'After getUpcomingAppointments - before validation',
        data: {
          appointmentsType: typeof appointments,
          isArray: Array.isArray(appointments),
          appointmentsLength: Array.isArray(appointments) ? appointments.length : 'N/A',
          sample: Array.isArray(appointments) ? appointments.slice(0, 2) : appointments,
          hasNonSerializable: Array.isArray(appointments)
            ? appointments.some((a) => {
                try {
                  JSON.stringify(a)
                  return false
                } catch {
                  return true
                }
              })
            : false,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
      }),
    }).catch(() => {})
    // #endregion

    // Valida response con Zod
    const validated = AppointmentsResponseSchema.parse(appointments)

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/dashboard/appointments/route.ts:22',
        message: 'After validation - before JSON response',
        data: {
          validatedType: typeof validated,
          isArray: Array.isArray(validated),
          validatedLength: Array.isArray(validated) ? validated.length : 'N/A',
          canStringify: (() => {
            try {
              JSON.stringify(validated)
              return true
            } catch (e) {
              return { error: String(e) }
            }
          })(),
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(validated, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api/dashboard/appointments/route.ts:28',
        message: 'Error in appointments API',
        data: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          hasIssues: error instanceof Error && 'issues' in error,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
      }),
    }).catch(() => {})
    // #endregion
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
