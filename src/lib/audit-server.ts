import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

import type { AuditDetails } from './audit'

const logger = createLogger('lib:audit-server')

/**
 * Log audit event from server-side components
 */
export async function logAuditServer(event: string, details?: AuditDetails) {
  try {
    const serverSupabase = await createClient()
    const {
      data: { user },
    } = await serverSupabase.auth.getUser()

    if (!user) {
      logger.warn('Cannot log audit event: user not authenticated', undefined, { event })
      return
    }

    const auditData = {
      user_id: user.id,
      email: user.email,
      event,
      details: details || null,
      ip_address: null, // Will be set by middleware
      user_agent: null, // Will be set by middleware
    }

    // TODO: Implementare tabella audit_logs in Supabase
    logger.debug('Audit event (server)', undefined, auditData)

    //   logger.error('Failed to log audit event', error, auditData)
    // }
  } catch (error) {
    logger.error('Error logging audit event', error, { event })
  }
}

/**
 * Log audit event with IP and User Agent (for API routes)
 */
export async function logAuditWithContext(
  event: string,
  details?: AuditDetails,
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    const serverSupabase = await createClient()
    const {
      data: { user },
    } = await serverSupabase.auth.getUser()

    const auditData = {
      user_id: user?.id || null,
      email: user?.email || null,
      event,
      details: details || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    }

    // TODO: Implementare tabella audit_logs in Supabase
    logger.debug('Audit event (with context)', undefined, auditData)

    //   logger.error('Failed to log audit event', error, auditData)
    // }
  } catch (error) {
    logger.error('Error logging audit event', error, { event })
  }
}
