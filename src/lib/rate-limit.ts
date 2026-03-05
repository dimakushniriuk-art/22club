import { NextRequest, NextResponse } from 'next/server'

interface CounterEntry {
  count: number
  resetAt: number
}

const store = new Map<string, CounterEntry>()

export interface RateLimitConfig {
  windowMs: number // finestra temporale in ms
  maxRequests: number // numero massimo di richieste
}

export interface RateLimitResult {
  response: NextResponse | null
  headers: Record<string, string>
}

const defaultHeaders: RateLimitResult['headers'] = {
  'X-RateLimit-Limit': '0',
  'X-RateLimit-Remaining': '0',
  'X-RateLimit-Reset': new Date(0).toISOString(),
}

export function rateLimit(config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }) {
  return async (req: NextRequest): Promise<RateLimitResult> => {
    // Identifica client (IP o user-agent come fallback)
    const identifier =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('user-agent') ||
      'unknown'

    const now = Date.now()
    const key = `${identifier}`
    const entry = store.get(key)

    // Inizializza o resetta se finestra scaduta
    if (!entry || now > entry.resetAt) {
      const resetAt = now + config.windowMs
      store.set(key, {
        count: 1,
        resetAt,
      })

      return {
        response: null,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': (config.maxRequests - 1).toString(),
          'X-RateLimit-Reset': new Date(resetAt).toISOString(),
        },
      }
    }

    // Incrementa contatore
    entry.count += 1
    store.set(key, entry)

    // Se supera il limite, blocca
    if (entry.count > config.maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
      const resetIso = new Date(entry.resetAt).toISOString()
      return {
        response: NextResponse.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Retry after ${retryAfterSeconds}s`,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfterSeconds.toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': resetIso,
            },
          },
        ),
        headers: {
          ...defaultHeaders,
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetIso,
        },
      }
    }

    // OK, passa con header informativi
    const remaining = Math.max(config.maxRequests - entry.count, 0)
    return {
      response: null,
      headers: {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(entry.resetAt).toISOString(),
      },
    }
  }
}

// Cleanup periodico dello store (opzionale, per evitare memory leak)
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }, 300000) // Ogni 5 minuti
}
