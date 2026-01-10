/**
 * Type guards per validazione runtime e type safety
 * Centralizza logica di type checking per riuso
 */

import type { Tables } from '@/types/supabase'

/**
 * Type guard per verificare che un valore sia un oggetto non null
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard per verificare che un valore sia una stringa non vuota
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Type guard per verificare che un valore sia un numero valido
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Type guard per verificare che un valore sia un numero positivo
 */
export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value > 0
}

/**
 * Type guard per verificare che un valore sia una data valida
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * Type guard per verificare che un valore sia una stringa data valida
 */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Type guard per verificare che un valore sia un UUID valido
 */
export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

/**
 * Type guard per verificare che un valore sia un array non vuoto
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0
}

/**
 * Type guard per verificare che un valore sia un array (anche vuoto)
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * Type guard per verificare che un valore sia un ProfileRow valido
 */
export function isValidProfile(value: unknown): value is Tables<'profiles'> {
  if (!isObject(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.user_id === 'string' &&
    isValidUUID(value.id) &&
    isValidUUID(value.user_id)
  )
}

/**
 * Type guard per verificare che un valore sia un ruolo valido
 */
export function isValidRole(
  value: unknown,
): value is 'admin' | 'pt' | 'atleta' | 'trainer' | 'athlete' | 'nutrizionista' | 'massaggiatore' {
  if (typeof value !== 'string') return false
  const validRoles = ['admin', 'pt', 'atleta', 'trainer', 'athlete', 'nutrizionista', 'massaggiatore']
  return validRoles.includes(value.toLowerCase())
}

/**
 * Type guard per verificare che un valore sia un tipo di appuntamento valido
 */
export function isValidAppointmentType(
  value: unknown,
): value is
  | 'allenamento'
  | 'cardio'
  | 'check'
  | 'consulenza'
  | 'prima_visita'
  | 'riunione'
  | 'massaggio'
  | 'nutrizionista' {
  if (typeof value !== 'string') return false
  const validTypes = [
    'allenamento',
    'cardio',
    'check',
    'consulenza',
    'prima_visita',
    'riunione',
    'massaggio',
    'nutrizionista',
  ]
  return validTypes.includes(value)
}

/**
 * Type guard per verificare che un valore sia un tipo di documento valido
 */
export function isValidDocumentCategory(
  value: unknown,
): value is 'certificato' | 'liberatoria' | 'documento_identita' | 'altro' {
  if (typeof value !== 'string') return false
  const validCategories = ['certificato', 'liberatoria', 'documento_identita', 'altro']
  return validCategories.includes(value)
}

/**
 * Type guard per verificare che un valore sia un tipo di messaggio valido
 */
export function isValidMessageType(value: unknown): value is 'text' | 'file' {
  return value === 'text' || value === 'file'
}

/**
 * Type guard per verificare che un valore sia un File valido
 */
export function isValidFile(value: unknown): value is File {
  return value instanceof File
}

/**
 * Type guard per verificare che un valore sia un errore
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * Type guard per verificare che un valore sia un errore con message
 */
export function isErrorWithMessage(value: unknown): value is { message: string } {
  return isObject(value) && typeof value.message === 'string'
}
