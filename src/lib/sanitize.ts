/**
 * @fileoverview Utility per sanitizzazione input utente
 * @description Funzioni per sanitizzare e validare input prima dell'invio al server
 * @module lib/sanitize
 */

/**
 * Sanitizza una stringa rimuovendo spazi iniziali/finali e caratteri pericolosi
 * @param value - Valore da sanitizzare
 * @param maxLength - Lunghezza massima (opzionale)
 * @returns Stringa sanitizzata o null se vuota
 */
export function sanitizeString(
  value: string | null | undefined,
  maxLength?: number,
): string | null {
  if (!value) return null

  // Trim spazi iniziali/finali
  let sanitized = value.trim()

  // Applica maxLength se specificato
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Rimuovi caratteri di controllo (eccetto newline e tab per textarea)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')

  return sanitized || null
}

/**
 * Sanitizza un array di stringhe
 * @param values - Array di valori da sanitizzare
 * @param maxLength - Lunghezza massima per ogni elemento (opzionale)
 * @returns Array sanitizzato senza duplicati
 */
export function sanitizeStringArray(
  values: (string | null | undefined)[] | null | undefined,
  maxLength?: number,
): string[] {
  if (!values || !Array.isArray(values)) return []

  // Sanitizza ogni elemento, rimuovi null/undefined e duplicati
  const sanitized = values
    .map((v) => sanitizeString(v, maxLength))
    .filter((v): v is string => v !== null && v !== '')

  // Rimuovi duplicati
  return [...new Set(sanitized)]
}

/**
 * Sanitizza un numero assicurandosi che sia nel range valido
 * @param value - Valore numerico da sanitizzare
 * @param min - Valore minimo (opzionale)
 * @param max - Valore massimo (opzionale)
 * @returns Numero sanitizzato o null se invalido
 */
export function sanitizeNumber(
  value: number | string | null | undefined,
  min?: number,
  max?: number,
): number | null {
  if (value === null || value === undefined || value === '') return null

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return null

  // Applica min/max se specificati
  if (min !== undefined && num < min) return min
  if (max !== undefined && num > max) return max

  return num
}

/**
 * Sanitizza un'email rimuovendo spazi e validando formato base
 * @param email - Email da sanitizzare
 * @returns Email sanitizzata o null se invalida
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email) return null

  const sanitized = email.trim().toLowerCase()

  // Validazione formato base (più dettagliata in Zod)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) return null

  return sanitized
}

/**
 * Sanitizza un telefono rimuovendo caratteri non numerici (eccetto +, spazi, trattini)
 * @param phone - Telefono da sanitizzare
 * @returns Telefono sanitizzato o null se vuoto
 */
export function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null

  // Rimuovi spazi iniziali/finali
  let sanitized = phone.trim()

  // Mantieni solo numeri, +, spazi, trattini, parentesi (per formati internazionali)
  sanitized = sanitized.replace(/[^\d+\s\-()]/g, '')

  return sanitized || null
}

/**
 * Sanitizza un URL rimuovendo spazi e validando formato base
 * @param url - URL da sanitizzare
 * @returns URL sanitizzato o null se invalido
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const sanitized = url.trim()

  // Validazione formato base (più dettagliata in Zod)
  try {
    new URL(sanitized)
    return sanitized
  } catch {
    return null
  }
}

/**
 * Escape HTML per prevenire XSS
 * @param text - Testo da escape
 * @returns Testo con caratteri HTML escapati
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }

  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Sanitizza nome file per prevenire path traversal e caratteri pericolosi
 * @param filename - Nome file da sanitizzare
 * @returns Nome file sanitizzato e sicuro
 */
export function sanitizeFilename(filename: string | null | undefined): string {
  if (!filename) return ''

  // Rimuovi path directory (mantieni solo nome file)
  const basename = filename.split(/[/\\]/).pop() || filename

  // Rimuovi caratteri pericolosi: .., /, \, <, >, |, `, &, ;, caratteri di controllo
  let sanitized = basename
    .replace(/\.\./g, '') // Rimuovi path traversal
    .replace(/[/\\<>|`&;]/g, '_') // Sostituisci caratteri pericolosi
    .replace(/[\x00-\x1F\x7F]/g, '') // Rimuovi caratteri di controllo
    .trim()

  // Limita lunghezza (max 255 caratteri per compatibilità filesystem)
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop()
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'))
    sanitized = nameWithoutExt.substring(0, 255 - ext!.length - 1) + '.' + ext
  }

  // Se dopo la sanitizzazione è vuoto, usa un nome di default
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    sanitized = 'file_' + Date.now()
  }

  return sanitized
}

/**
 * Verifica se un path storage è sicuro (previene path traversal)
 * @param path - Path da verificare
 * @returns true se il path è sicuro
 */
export function isSafeStoragePath(path: string | null | undefined): boolean {
  if (!path) return false

  // Verifica path traversal
  if (path.includes('../') || path.includes('..\\') || path.includes('..')) {
    return false
  }

  // Verifica che non inizi con / o \
  if (path.startsWith('/') || path.startsWith('\\')) {
    return false
  }

  // Verifica caratteri pericolosi
  if (/[<>|`&;]/.test(path)) {
    return false
  }

  // Verifica encoding path traversal
  if (path.includes('%2e%2e') || path.includes('%2E%2E')) {
    return false
  }

  return true
}

/**
 * Sanitizza un oggetto JSONB rimuovendo caratteri pericolosi dalle chiavi e valori stringa
 * @param obj - Oggetto da sanitizzare
 * @returns Oggetto sanitizzato
 */
export function sanitizeJsonb(
  obj: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!obj || typeof obj !== 'object') return null

  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    // Sanitizza la chiave
    const sanitizedKey = sanitizeString(key)
    if (!sanitizedKey) continue

    // Sanitizza il valore in base al tipo
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value)
    } else if (typeof value === 'number') {
      sanitized[sanitizedKey] = sanitizeNumber(value)
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map((item) => {
        if (typeof item === 'string') return sanitizeString(item)
        if (typeof item === 'number') return sanitizeNumber(item)
        if (typeof item === 'object' && item !== null)
          return sanitizeJsonb(item as Record<string, unknown>)
        return item
      })
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeJsonb(value as Record<string, unknown>)
    } else {
      sanitized[sanitizedKey] = value
    }
  }

  return sanitized
}

/**
 * Sanitizza un array di oggetti JSONB
 * @param arr - Array di oggetti da sanitizzare
 * @returns Array sanitizzato
 */
export function sanitizeJsonbArray(
  arr: (Record<string, unknown> | null | undefined)[] | null | undefined,
): Array<Record<string, unknown>> {
  if (!arr || !Array.isArray(arr)) return []

  return arr
    .map((item) => sanitizeJsonb(item))
    .filter((item): item is Record<string, unknown> => item !== null)
}

/**
 * Normalizza il campo sesso convertendo valori abbreviati o alternativi in valori standard
 * @param sesso - Valore sesso da normalizzare (può essere "M", "F", "maschio", "femmina", ecc.)
 * @returns Valore normalizzato: 'maschio' | 'femmina' | 'altro' | 'non_specificato' | null
 */
export function normalizeSesso(
  sesso: string | null | undefined,
): 'maschio' | 'femmina' | 'altro' | 'non_specificato' | null {
  if (!sesso) return null

  const sessoLower = sesso.toLowerCase().trim()

  // Maschio
  if (
    sessoLower === 'm' ||
    sessoLower === 'maschio' ||
    sessoLower === 'male' ||
    sessoLower === 'uomo'
  ) {
    return 'maschio'
  }

  // Femmina
  if (
    sessoLower === 'f' ||
    sessoLower === 'femmina' ||
    sessoLower === 'female' ||
    sessoLower === 'donna'
  ) {
    return 'femmina'
  }

  // Altro
  if (sessoLower === 'altro' || sessoLower === 'other') {
    return 'altro'
  }

  // Non specificato
  if (
    sessoLower === 'non_specificato' ||
    sessoLower === 'non specificato' ||
    sessoLower === 'not_specified' ||
    sessoLower === 'non specificato'
  ) {
    return 'non_specificato'
  }

  // Se non corrisponde a nessun valore valido, restituisci null
  return null
}
