// ============================================================
// Utility per salvataggio dati profilo atleta (FASE C2 - Estrazione Logica Form)
// ============================================================
// Estratta da pattern comune nei form hooks per ridurre duplicazione
// ============================================================

import { z } from 'zod'
import type { UseMutationResult } from '@tanstack/react-query'

/**
 * Opzioni per il salvataggio dati profilo atleta
 */
interface SaveProfileDataOptions<TData, TError, TVariables> {
  /** Dati del form da salvare */
  formData: TData
  /** Schema Zod per validazione */
  schema: z.ZodSchema<TVariables>
  /** Mutation React Query */
  mutation: UseMutationResult<unknown, TError, TVariables>
  /** Callback per sanitizzazione dati (opzionale) */
  sanitize?: (data: TData) => TVariables
  /** Messaggi personalizzati */
  messages?: {
    validationError?: string
    success?: string
    error?: string
  }
}

/**
 * Gestisce il salvataggio dati profilo atleta con validazione e sanitizzazione
 * Pattern comune per tutti i tab del profilo atleta
 */
export async function handleAthleteProfileSave<TData, TError, TVariables>({
  formData,
  schema,
  mutation,
  sanitize,
  messages = {},
}: SaveProfileDataOptions<TData, TError, TVariables>): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Sanitizza i dati se fornita funzione di sanitizzazione
    const dataToValidate = sanitize ? sanitize(formData) : (formData as unknown as TVariables)

    // Validazione Zod
    const validationResult = schema.safeParse(dataToValidate)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`,
      }
    }

    // Esegui mutation
    await mutation.mutateAsync(validationResult.data)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : messages.error || 'Errore nel salvataggio',
    }
  }
}
