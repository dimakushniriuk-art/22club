/**
 * Utility production-safe per ottenere l'URL base dell'applicazione
 * 
 * Priorità:
 * 1. request.nextUrl.origin (server-side, middleware, API routes)
 * 2. window.location.origin (client-side)
 * 3. NEXT_PUBLIC_APP_URL (fallback env var)
 * 4. https://app.22club.it (fallback hardcoded produzione)
 * 
 * Questo evita problemi di redirect strani su Vercel con dominio custom.
 */

import type { NextRequest } from 'next/server'

/**
 * Ottiene l'URL base dell'applicazione in modo production-safe
 * 
 * @param request - Request object (opzionale, solo per server-side)
 * @returns URL base dell'applicazione (es: https://app.22club.it)
 */
export function getAppUrl(request?: NextRequest | Request): string {
  // 1. Server-side: usa request.nextUrl.origin o headers host
  if (request) {
    if ('nextUrl' in request) {
      // NextRequest (middleware, server components)
      const nextRequest = request as NextRequest
      return nextRequest.nextUrl.origin
    }
    
    // Request standard (API routes)
    const url = new URL(request.url)
    return url.origin
  }

  // 2. Client-side: usa window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // 3. Fallback: NEXT_PUBLIC_APP_URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // 4. Fallback hardcoded produzione
  return 'https://app.22club.it'
}

/**
 * Costruisce un URL assoluto per un path relativo
 * 
 * @param path - Path relativo (es: '/registrati?code=abc')
 * @param request - Request object (opzionale, solo per server-side)
 * @returns URL assoluto completo
 */
export function getAbsoluteUrl(path: string, request?: NextRequest | Request): string {
  const baseUrl = getAppUrl(request)
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}
