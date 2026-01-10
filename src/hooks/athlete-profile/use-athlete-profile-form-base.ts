/**
 * Hook base per gestione form profilo atleta
 * Estratto per ridurre duplicazione tra i vari tab componenti
 */

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import type { ZodSchema } from 'zod'
import { handleAthleteProfileSave, resetFormToOriginal } from '@/lib/utils/athlete-profile-form'

interface UseAthleteProfileFormBaseProps<TData, TFormData, TSanitized = TFormData> {
  data: TData | null
  athleteId: string
  initialFormData: TFormData
  schema: ZodSchema<TSanitized>
  mutation: {
    mutateAsync: (data: TSanitized) => Promise<unknown>
    isPending: boolean
  }
  getFormDataFromData: (data: TData) => TFormData
  sanitize?: (data: TFormData) => TSanitized
  successMessage?: string
  errorMessage?: string
}

export function useAthleteProfileFormBase<TData, TFormData, TSanitized = TFormData>({
  data,
  // Nota: athleteId potrebbe essere usato in futuro per validazioni
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  athleteId,
  initialFormData,
  schema,
  mutation,
  getFormDataFromData,
  sanitize,
  successMessage,
  errorMessage,
}: UseAthleteProfileFormBaseProps<TData, TFormData, TSanitized>) {
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<TFormData>(initialFormData)

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (data && !isEditing) {
      setFormData(getFormDataFromData(data))
    }
  }, [data, isEditing, getFormDataFromData])

  const handleSave = useCallback(async () => {
    const success = await handleAthleteProfileSave({
      formData,
      schema,
      mutation,
      sanitize,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: successMessage || 'I dati sono stati aggiornati con successo.',
          variant: 'success',
        })
      },
      onError: (error) => {
        addToast({
          title: 'Errore',
          message: error,
          variant: 'error',
        })
      },
      successMessage,
      errorMessage,
    })

    return success
  }, [formData, schema, mutation, sanitize, addToast, successMessage, errorMessage])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    resetFormToOriginal(data, (d) => setFormData(getFormDataFromData(d)))
  }, [data, getFormDataFromData])

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    handleSave,
    handleCancel,
    updateMutation: mutation,
  }
}
