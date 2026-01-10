/**
 * Utility functions per validazione dati comuni
 * Centralizza logica di validazione per riuso
 */

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Valida peso (kg) con range realistico per atleti
 * Range predefinito: 40-150 kg (realistico per atleti)
 *
 * @param weight - Peso da validare (numero o stringa)
 * @param options - Opzioni di validazione (min, max personalizzati)
 * @returns Risultato validazione con messaggio di errore specifico
 */
export function validateWeight(
  weight: number | string,
  options?: { min?: number; max?: number },
): ValidationResult {
  const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight
  const min = options?.min ?? 40 // Range realistico per atleti: 40-150 kg
  const max = options?.max ?? 150

  // Valida che sia un numero
  if (isNaN(numWeight)) {
    return {
      valid: false,
      error: 'Il peso deve essere un numero valido',
    }
  }

  // Valida che sia positivo
  if (numWeight <= 0) {
    return {
      valid: false,
      error: 'Il peso deve essere un valore positivo',
    }
  }

  // Valida range minimo
  if (numWeight < min) {
    return {
      valid: false,
      error: `Il peso deve essere almeno ${min} kg. Il valore inserito (${numWeight.toFixed(1)} kg) è troppo basso.`,
    }
  }

  // Valida range massimo
  if (numWeight > max) {
    return {
      valid: false,
      error: `Il peso non può superare ${max} kg. Il valore inserito (${numWeight.toFixed(1)} kg) è troppo alto.`,
    }
  }

  return { valid: true }
}

/**
 * Valida data
 */
export function validateDate(date: string | Date | null | undefined): ValidationResult {
  if (!date) {
    return {
      valid: false,
      error: 'Data non valida',
    }
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return {
      valid: false,
      error: 'Data non valida',
    }
  }

  return { valid: true }
}

/**
 * Valida che una data sia nel futuro
 */
export function validateFutureDate(date: string | Date): ValidationResult {
  const dateValidation = validateDate(date)
  if (!dateValidation.valid) {
    return dateValidation
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()

  if (dateObj <= now) {
    return {
      valid: false,
      error: 'La data deve essere nel futuro',
    }
  }

  return { valid: true }
}

/**
 * Valida che una data sia nel passato
 */
export function validatePastDate(date: string | Date): ValidationResult {
  const dateValidation = validateDate(date)
  if (!dateValidation.valid) {
    return dateValidation
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()

  if (dateObj >= now) {
    return {
      valid: false,
      error: 'La data deve essere nel passato',
    }
  }

  return { valid: true }
}

/**
 * Valida che endDate sia dopo startDate
 */
export function validateDateRange(
  startDate: string | Date,
  endDate: string | Date,
): ValidationResult {
  const startValidation = validateDate(startDate)
  if (!startValidation.valid) {
    return { valid: false, error: `Data inizio: ${startValidation.error}` }
  }

  const endValidation = validateDate(endDate)
  if (!endValidation.valid) {
    return { valid: false, error: `Data fine: ${endValidation.error}` }
  }

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (end <= start) {
    return {
      valid: false,
      error: 'La data di fine deve essere successiva alla data di inizio',
    }
  }

  return { valid: true }
}

/**
 * Valida numero positivo
 */
export function validatePositiveNumber(
  value: number | string,
  fieldName = 'Valore',
): ValidationResult {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return {
      valid: false,
      error: `${fieldName} deve essere un numero`,
    }
  }

  if (numValue <= 0) {
    return {
      valid: false,
      error: `${fieldName} deve essere positivo`,
    }
  }

  return { valid: true }
}

/**
 * Valida numero in un range
 */
export function validateNumberRange(
  value: number | string,
  min: number,
  max: number,
  fieldName = 'Valore',
): ValidationResult {
  const positiveValidation = validatePositiveNumber(value, fieldName)
  if (!positiveValidation.valid) {
    return positiveValidation
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (numValue < min || numValue > max) {
    return {
      valid: false,
      error: `${fieldName} deve essere compreso tra ${min} e ${max}`,
    }
  }

  return { valid: true }
}

/**
 * Valida stringa non vuota
 */
export function validateNonEmptyString(
  value: string | null | undefined,
  fieldName = 'Campo',
): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName} è obbligatorio`,
    }
  }

  return { valid: true }
}

/**
 * Valida email
 */
export function validateEmail(email: string | null | undefined): ValidationResult {
  if (!email) {
    return {
      valid: false,
      error: 'Email obbligatoria',
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Email non valida',
    }
  }

  return { valid: true }
}

/**
 * Valida UUID
 */
export function validateUUID(uuid: string | null | undefined, fieldName = 'ID'): ValidationResult {
  if (!uuid) {
    return {
      valid: false,
      error: `${fieldName} obbligatorio`,
    }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    return {
      valid: false,
      error: `${fieldName} non valido`,
    }
  }

  return { valid: true }
}
