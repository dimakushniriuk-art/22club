// ============================================================
// Hook per gestione form massage atleta (FASE C2 - Estrazione Logica Form)
// ============================================================
// Estratto da athlete-massage-tab.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import { useUpdateAthleteMassage } from '@/hooks/athlete-profile/use-athlete-massage'
import type {
  AthleteMassageData,
  AthleteMassageDataUpdate,
  TipoMassaggioEnum,
  MassaggioStorico,
} from '@/types/athlete-profile'
import { sanitizeString, sanitizeStringArray } from '@/lib/sanitize'
import { updateAthleteMassageDataSchema } from '@/types/athlete-profile.schema'
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'

interface UseAthleteMassageFormProps {
  massage: AthleteMassageData | null
  athleteId: string
}

export function useAthleteMassageForm({ massage, athleteId }: UseAthleteMassageFormProps) {
  const updateMutation = useUpdateAthleteMassage(athleteId)
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<AthleteMassageDataUpdate>({})
  const [newArrayItem, setNewArrayItem] = useState<{
    zona?: string
    allergia?: string
    massaggio?: Partial<MassaggioStorico>
  }>({})
  const [showMassaggioForm, setShowMassaggioForm] = useState(false)

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (massage && !isEditing) {
      setFormData({
        preferenze_tipo_massaggio: massage.preferenze_tipo_massaggio || [],
        zone_problematiche: massage.zone_problematiche || [],
        intensita_preferita: massage.intensita_preferita || null,
        allergie_prodotti: massage.allergie_prodotti || [],
        note_terapeutiche: massage.note_terapeutiche || null,
        storico_massaggi: massage.storico_massaggi || [],
      })
    }
  }, [massage, isEditing])

  const sanitizeFormData = useCallback(
    (data: AthleteMassageDataUpdate): AthleteMassageDataUpdate => {
      return {
        preferenze_tipo_massaggio: data.preferenze_tipo_massaggio || undefined,
        zone_problematiche: sanitizeStringArray(data.zone_problematiche, 100),
        intensita_preferita: data.intensita_preferita || undefined,
        allergie_prodotti: sanitizeStringArray(data.allergie_prodotti, 100),
        note_terapeutiche: sanitizeString(data.note_terapeutiche, 2000) || undefined,
        storico_massaggi: data.storico_massaggi
          ? data.storico_massaggi.map((m) => ({
              ...m,
              note: sanitizeString(m.note, 500) || undefined,
            }))
          : undefined,
      }
    },
    [],
  )

  const handleSave = useCallback(async () => {
    await handleAthleteProfileSave({
      formData,
      schema: updateAthleteMassageDataSchema,
      mutation: updateMutation,
      sanitize: sanitizeFormData,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: 'I dati massaggi sono stati aggiornati con successo.',
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
      successMessage: 'I dati massaggi sono stati aggiornati con successo.',
      errorMessage: 'Impossibile aggiornare i dati massaggi.',
    })
  }, [formData, updateMutation, sanitizeFormData, addToast])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (massage) {
      setFormData({
        preferenze_tipo_massaggio: massage.preferenze_tipo_massaggio || [],
        zone_problematiche: massage.zone_problematiche || [],
        intensita_preferita: massage.intensita_preferita || null,
        allergie_prodotti: massage.allergie_prodotti || [],
        note_terapeutiche: massage.note_terapeutiche || null,
        storico_massaggi: massage.storico_massaggi || [],
      })
    }
  }, [massage])

  const addArrayItem = useCallback(
    (field: 'zone_problematiche' | 'allergie_prodotti', value: string) => {
      const sanitized = sanitizeString(value, 100)
      if (!sanitized) return
      const current = formData[field] || []
      if (current.includes(sanitized)) return
      setFormData((prev) => ({ ...prev, [field]: [...current, sanitized] }))
      setNewArrayItem((prev) => ({
        ...prev,
        [field === 'zone_problematiche' ? 'zona' : 'allergia']: '',
      }))
    },
    [formData],
  )

  const removeArrayItem = useCallback(
    (field: 'zone_problematiche' | 'allergie_prodotti', index: number) => {
      setFormData((prev) => {
        const current = prev[field] || []
        return { ...prev, [field]: current.filter((_, i) => i !== index) }
      })
    },
    [],
  )

  const toggleTipoMassaggio = useCallback((tipo: TipoMassaggioEnum) => {
    setFormData((prev) => {
      const current = prev.preferenze_tipo_massaggio || []
      const exists = current.includes(tipo)
      return {
        ...prev,
        preferenze_tipo_massaggio: exists ? current.filter((t) => t !== tipo) : [...current, tipo],
      }
    })
  }, [])

  const addMassaggio = useCallback(() => {
    if (!newArrayItem.massaggio?.tipo || !newArrayItem.massaggio?.data) {
      addToast({
        title: 'Errore',
        message: 'Compila tipo e data del massaggio.',
        variant: 'error',
      })
      return
    }

    const sanitizedMassaggio: MassaggioStorico = {
      tipo: newArrayItem.massaggio.tipo,
      data: newArrayItem.massaggio.data,
      durata_minuti: newArrayItem.massaggio.durata_minuti ?? 30, // Default 30 minuti se non specificato
      note: sanitizeString(newArrayItem.massaggio.note, 500) || undefined,
    }

    setFormData((prev) => ({
      ...prev,
      storico_massaggi: [...(prev.storico_massaggi || []), sanitizedMassaggio],
    }))
    setNewArrayItem({ ...newArrayItem, massaggio: {} })
    setShowMassaggioForm(false)
  }, [newArrayItem, addToast])

  const removeMassaggio = useCallback((index: number) => {
    setFormData((prev) => {
      const current = prev.storico_massaggi || []
      return { ...prev, storico_massaggi: current.filter((_, i) => i !== index) }
    })
  }, [])

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    newArrayItem,
    setNewArrayItem,
    showMassaggioForm,
    setShowMassaggioForm,
    handleSave,
    handleCancel,
    addArrayItem,
    removeArrayItem,
    toggleTipoMassaggio,
    addMassaggio,
    removeMassaggio,
    updateMutation,
  }
}
