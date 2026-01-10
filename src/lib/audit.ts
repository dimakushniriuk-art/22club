import { supabase } from '@/lib/supabase/client'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:audit')

type AuditDetails = Record<string, unknown>

export interface AuditEvent {
  event: string
  details?: AuditDetails
  ipAddress?: string
  userAgent?: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  email: string | null
  event: string
  details: AuditDetails | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

/**
 * Log audit event from client-side components
 */
export async function logAuditClient(event: string, details?: AuditDetails) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Cannot log audit event: user not authenticated', undefined, { event })
      return
    }

    const auditData = {
      user_id: user.id,
      email: user.email,
      event,
      details: details || null,
      ip_address: null, // Will be set by server-side middleware
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
    }

    // TODO: Implementare tabella audit_logs in Supabase
    logger.debug('Audit event (client)', undefined, auditData)

    //   logger.error('Failed to log audit event', error, auditData)
    // }
  } catch (error) {
    logger.error('Error logging audit event', error, { event })
  }
}

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

/**
 * Get audit logs for a user (client-side)
 */
export async function getAuditLogs(limit: number = 50, offset: number = 0): Promise<AuditLog[]> {
  try {
    // TODO: Implementare tabella audit_logs in Supabase
    //   .from('audit_logs')
    //   .select('*')
    //   .order('created_at', { ascending: false })
    //   .range(offset, offset + limit - 1)

    //   logger.error('Failed to fetch audit logs', error, { limit, offset })
    // }

    logger.debug('Audit logs requested (client)', undefined, { limit, offset })
    return []
  } catch (error) {
    logger.error('Error fetching audit logs', error, { limit, offset })
    return []
  }
}

/**
 * Get audit logs for a specific user (server-side)
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<AuditLog[]> {
  try {
    // TODO: Implementare tabella audit_logs in Supabase
    //   .from('audit_logs')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false })
    //   .range(offset, offset + limit - 1)

    //   logger.error('Failed to fetch user audit logs', error, { userId, limit, offset })
    // }

    logger.debug('User audit logs requested', undefined, { userId, limit, offset })
    return []
  } catch (error) {
    logger.error('Error fetching user audit logs', error, { userId, limit, offset })
    return []
  }
}

/**
 * Common audit events
 */
export const AUDIT_EVENTS = {
  // Authentication
  LOGIN: 'user_login',
  LOGOUT: 'user_logout',
  REGISTER: 'user_register',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',

  // Profile
  PROFILE_UPDATE: 'profile_update',
  AVATAR_UPLOAD: 'avatar_upload',
  PASSWORD_CHANGE: 'password_change',

  // Appointments
  APPOINTMENT_CREATE: 'appointment_create',
  APPOINTMENT_UPDATE: 'appointment_update',
  APPOINTMENT_DELETE: 'appointment_delete',
  APPOINTMENT_CANCEL: 'appointment_cancel',

  // Documents
  DOCUMENT_UPLOAD: 'document_upload',
  DOCUMENT_DOWNLOAD: 'document_download',
  DOCUMENT_DELETE: 'document_delete',
  DOCUMENT_SHARE: 'document_share',

  // Clients
  CLIENT_INVITE: 'client_invite',
  CLIENT_ACCEPT: 'client_accept',
  CLIENT_REMOVE: 'client_remove',

  // Workouts
  WORKOUT_CREATE: 'workout_create',
  WORKOUT_UPDATE: 'workout_update',
  WORKOUT_DELETE: 'workout_delete',
  WORKOUT_COMPLETE: 'workout_complete',

  // System
  SYSTEM_ERROR: 'system_error',
  SECURITY_VIOLATION: 'security_violation',
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
} as const

export type AuditEventType = (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS]
