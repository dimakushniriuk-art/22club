import { NextRequest, NextResponse } from 'next/server'
import { logAuditWithContext } from './audit'

interface AuditContext {
  ipAddress: string
  userAgent: string
}

/**
 * Middleware to capture IP address and User Agent for audit logging
 */
export function auditMiddleware(request: NextRequest) {
  const context = getAuditContext(request)

  // Store in headers for downstream usage
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-client-ip', context.ipAddress)
  requestHeaders.set('x-user-agent', context.userAgent)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  if (realIP) {
    return realIP
  }

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || forwarded
  }

  return '127.0.0.1'
}

/**
 * Helper to get audit context from request
 */
export function getAuditContext(request: NextRequest): AuditContext {
  return {
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'Unknown',
  }
}

/**
 * Utility to log an audit event for a given request.
 */
export async function logRequestAudit(
  request: NextRequest,
  event: string,
  details?: Record<string, unknown>,
) {
  const context = getAuditContext(request)
  await logAuditWithContext(event, details, context.ipAddress, context.userAgent)
}
