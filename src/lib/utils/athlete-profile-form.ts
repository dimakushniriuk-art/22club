/**
 * Utility functions per gestione form profilo atleta
 * Estratte per ridurre duplicazione e migliorare manutenibilità
 */

// Nota: z potrebbe essere usato in futuro per creazione schema dinamici
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { z } from 'zod'
import type { ZodSchema } from 'zod'

/**
 * Esegue sanitizzazione e validazione dei dati del form
 * @param data - Dati da validare
 * @param schema - Schema Zod per validazione
 * @returns Oggetto con success flag e dati validati o errore
 */
export function validateAndSanitizeFormData<T>(
  data: T,
  schema: ZodSchema<T>,
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validationResult = schema.safeParse(data)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      const errorPath = firstError.path.join('.')
      return {
        success: false,
        error: `${errorPath}: ${firstError.message}`,
      }
    }

    return {
      success: true,
      data: validationResult.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore di validazione sconosciuto',
    }
  }
}

/**
 * Gestisce il salvataggio del form con pattern comune
 * @param params - Parametri per il salvataggio
 * @returns Promise che si risolve quando il salvataggio è completato
 */
export async function handleAthleteProfileSave<TFormData, TSanitized = TFormData>(params: {
  formData: TFormData
  schema: ZodSchema<TSanitized>
  mutation: { mutateAsync: (data: TSanitized) => Promise<unknown> }
  sanitize?: (data: TFormData) => TSanitized
  onSuccess?: () => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
}): Promise<boolean> {
  const {
    formData,
    schema,
    mutation,
    sanitize,
    onSuccess,
    onError,
    // Nota: successMessage potrebbe essere usato in futuro per messaggi custom
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    successMessage = 'Dati aggiornati con successo.',
    errorMessage = 'Impossibile aggiornare i dati.',
  } = params

  // Sanitizzazione opzionale
  const dataToValidate = sanitize ? sanitize(formData) : (formData as unknown as TSanitized)

  // Validazione
  const validation = validateAndSanitizeFormData(dataToValidate, schema)

  if (!validation.success) {
    if (onError) {
      onError(validation.error)
    }
    return false
  }

  try {
    // Salvataggio
    await mutation.mutateAsync(validation.data)

    if (onSuccess) {
      onSuccess()
    }

    return true
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : errorMessage
    if (onError) {
      onError(errorMsg)
    }
    return false
  }
}

/**
 * Resetta il form ai dati originali
 * @param originalData - Dati originali
 * @param setFormData - Funzione per aggiornare lo stato del form
 */
export function resetFormToOriginal<T>(
  originalData: T | null,
  setFormData: (data: T) => void,
): void {
  if (originalData) {
    setFormData(originalData)
  }
}
