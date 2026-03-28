import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:credits:request-coached-session-debit-client')

export type CoachedSessionDebitClientResult = {
  ok: boolean
  debited?: boolean
  skipped_duplicate_calendar?: boolean
  already?: boolean
  error?: string
}

/**
 * Scalatura lezione PT da log coachato (idempotente). Usa la route server con service role.
 * Dopo OK o already, emette evento per aggiornare contatori in home profilo.
 */
export async function requestCoachedSessionDebitClient(
  workoutLogId: string,
): Promise<CoachedSessionDebitClientResult> {
  try {
    const debitRes = await fetch('/api/athlete/coached-session-debit', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workout_log_id: workoutLogId }),
    })
    const debitBody = (await debitRes.json().catch(() => ({}))) as {
      error?: string
      skipped_duplicate_calendar?: boolean
      already?: boolean
      debited?: boolean
    }
    if (debitRes.ok && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('22club:athlete-lessons-refresh'))
    }
    if (!debitRes.ok) {
      logger.warn('Scalatura credito allenamento con trainer', undefined, {
        status: debitRes.status,
        payload: debitBody,
        workoutLogId,
      })
      return { ok: false, error: debitBody.error ?? debitRes.statusText }
    }
    return {
      ok: true,
      debited: debitBody.debited,
      skipped_duplicate_calendar: debitBody.skipped_duplicate_calendar,
      already: debitBody.already,
    }
  } catch (e) {
    logger.warn('Fetch coached-session-debit', e, { workoutLogId })
    return { ok: false, error: e instanceof Error ? e.message : 'network' }
  }
}
