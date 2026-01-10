// ============================================================
// Hook per gestione form motivazionale atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-motivational-tab.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import { useUpdateAthleteMotivational } from '@/hooks/athlete-profile/use-athlete-motivational'
import type { AthleteMotivationalDataUpdate, AbbandonoStorico } from '@/types/athlete-profile'
import { sanitizeString, sanitizeStringArray, sanitizeNumber, sanitizeJsonb } from '@/lib/sanitize'
import { updateAthleteMotivationalDataSchema } from '@/types/athlete-profile.schema'
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'

interface UseAthleteMotivationalFormProps {
  motivational: {
    motivazione_principale: string | null
    motivazioni_secondarie: string[]
    ostacoli_percepiti: string[]
    preferenze_ambiente: string[]
    preferenze_compagnia: string[]
    livello_motivazione: number | null
    storico_abbandoni: AbbandonoStorico[]
    note_motivazionali: string | null
  } | null
  athleteId: string
}

export function useAthleteMotivationalForm({
  motivational,
  athleteId,
}: UseAthleteMotivationalFormProps) {
  const updateMutation = useUpdateAthleteMotivational(athleteId)
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<AthleteMotivationalDataUpdate>({})
  const [newArrayItem, setNewArrayItem] = useState<{
    motivazione?: string
    ostacolo?: string
    abbandono?: Partial<AbbandonoStorico>
  }>({})
  const [showAbbandonoForm, setShowAbbandonoForm] = useState(false)

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (motivational && !isEditing) {
      setFormData({
        motivazione_principale: motivational.motivazione_principale || null,
        motivazioni_secondarie: motivational.motivazioni_secondarie || [],
        ostacoli_percepiti: motivational.ostacoli_percepiti || [],
        preferenze_ambiente: motivational.preferenze_ambiente || [],
        preferenze_compagnia: motivational.preferenze_compagnia || [],
        livello_motivazione: motivational.livello_motivazione || null,
        storico_abbandoni: motivational.storico_abbandoni || [],
        note_motivazionali: motivational.note_motivazionali || null,
      })
    }
  }, [motivational, isEditing])

  const sanitizeFormData = useCallback(
    (data: AthleteMotivationalDataUpdate): AthleteMotivationalDataUpdate => {
      return {
        motivazione_principale: sanitizeString(data.motivazione_principale, 1000) || undefined,
        motivazioni_secondarie: sanitizeStringArray(data.motivazioni_secondarie),
        ostacoli_percepiti: sanitizeStringArray(data.ostacoli_percepiti),
        preferenze_ambiente: sanitizeStringArray(data.preferenze_ambiente),
        preferenze_compagnia: sanitizeStringArray(data.preferenze_compagnia),
        livello_motivazione: sanitizeNumber(data.livello_motivazione, 1, 10),
        storico_abbandoni: (() => {
          if (!data.storico_abbandoni || !Array.isArray(data.storico_abbandoni)) return []
          return data.storico_abbandoni
            .map((item) => {
              if (!item || typeof item !== 'object') return null
              const sanitized = sanitizeJsonb(item as unknown as Record<string, unknown>)
              if (!sanitized) return null
              return {
                data: sanitizeString(sanitized.data as string | null | undefined) || '',
                motivo: sanitizeString(sanitized.motivo as string | null | undefined) || '',
                durata_mesi:
                  sanitizeNumber(
                    sanitized.durata_mesi as number | string | null | undefined,
                    0,
                    120,
                  ) ?? undefined,
              } as AbbandonoStorico
            })
            .filter((item): item is AbbandonoStorico => item !== null)
        })(),
        note_motivazionali: sanitizeString(data.note_motivazionali, 2000) || undefined,
      }
    },
    [],
  )

  const handleSave = useCallback(async () => {
    await handleAthleteProfileSave({
      formData,
      schema: updateAthleteMotivationalDataSchema,
      mutation: updateMutation,
      sanitize: sanitizeFormData,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: 'I dati motivazionali sono stati aggiornati con successo.',
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
      successMessage: 'I dati motivazionali sono stati aggiornati con successo.',
      errorMessage: 'Impossibile aggiornare i dati motivazionali.',
    })
  }, [formData, updateMutation, sanitizeFormData, addToast])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (motivational) {
      setFormData({
        motivazione_principale: motivational.motivazione_principale || null,
        motivazioni_secondarie: motivational.motivazioni_secondarie || [],
        ostacoli_percepiti: motivational.ostacoli_percepiti || [],
        preferenze_ambiente: motivational.preferenze_ambiente || [],
        preferenze_compagnia: motivational.preferenze_compagnia || [],
        livello_motivazione: motivational.livello_motivazione || null,
        storico_abbandoni: motivational.storico_abbandoni || [],
        note_motivazionali: motivational.note_motivazionali || null,
      })
    }
  }, [motivational])

  const addArrayItem = useCallback(
    (field: 'motivazioni_secondarie' | 'ostacoli_percepiti', value: string) => {
      const sanitized = sanitizeString(value, 200)
      if (!sanitized) return
      const current = formData[field] || []
      if (current.includes(sanitized)) return
      setFormData((prev) => ({ ...prev, [field]: [...current, sanitized] }))
      setNewArrayItem((prev) => ({
        ...prev,
        [field === 'motivazioni_secondarie' ? 'motivazione' : 'ostacolo']: '',
      }))
    },
    [formData],
  )

  const removeArrayItem = useCallback(
    (field: 'motivazioni_secondarie' | 'ostacoli_percepiti', index: number) => {
      setFormData((prev) => {
        const current = prev[field] || []
        return { ...prev, [field]: current.filter((_, i) => i !== index) }
      })
    },
    [],
  )

  const togglePreferenza = useCallback(
    (field: 'preferenze_ambiente' | 'preferenze_compagnia', value: string) => {
      setFormData((prev) => {
        const current = prev[field] || []
        const exists = current.includes(value)
        return {
          ...prev,
          [field]: exists ? current.filter((p) => p !== value) : [...current, value],
        }
      })
    },
    [],
  )

  const addAbbandono = useCallback(() => {
    if (!newArrayItem.abbandono?.data || !newArrayItem.abbandono?.motivo) return
    const sanitizedMotivo = sanitizeString(newArrayItem.abbandono.motivo, 500)
    if (!sanitizedMotivo) return

    const current = formData.storico_abbandoni || []
    setFormData({
      ...formData,
      storico_abbandoni: [
        ...current,
        {
          data: newArrayItem.abbandono.data,
          motivo: sanitizedMotivo,
          durata_mesi: sanitizeNumber(newArrayItem.abbandono.durata_mesi, 0, 120) ?? undefined,
        },
      ],
    })
    setNewArrayItem({ ...newArrayItem, abbandono: {} })
    setShowAbbandonoForm(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData])

  const removeAbbandono = useCallback((index: number) => {
    setFormData((prev) => {
      const current = prev.storico_abbandoni || []
      return { ...prev, storico_abbandoni: current.filter((_, i) => i !== index) }
    })
  }, [])

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    newArrayItem,
    setNewArrayItem,
    showAbbandonoForm,
    setShowAbbandonoForm,
    handleSave,
    handleCancel,
    addArrayItem,
    removeArrayItem,
    togglePreferenza,
    addAbbandono,
    removeAbbandono,
    updateMutation,
  }
}
