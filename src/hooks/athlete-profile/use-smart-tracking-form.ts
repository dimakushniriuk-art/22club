// ============================================================
// Hook per gestione form Smart Tracking (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-smart-tracking-tab.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import { useUpdateAthleteSmartTracking } from '@/hooks/athlete-profile/use-athlete-smart-tracking'
import type {
  AthleteSmartTrackingDataUpdate,
  AthleteSmartTrackingData,
} from '@/types/athlete-profile'
import { sanitizeString, sanitizeNumber, sanitizeJsonb } from '@/lib/sanitize'
import { updateAthleteSmartTrackingDataSchema } from '@/types/athlete-profile.schema'
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'
import { z } from 'zod'

interface UseSmartTrackingFormProps {
  athleteId: string
  smartTracking: AthleteSmartTrackingData | null | undefined
}

export function useSmartTrackingForm({ athleteId, smartTracking }: UseSmartTrackingFormProps) {
  const updateMutation = useUpdateAthleteSmartTracking(athleteId)
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<
    AthleteSmartTrackingDataUpdate & { data_rilevazione: string }
  >({
    data_rilevazione: new Date().toISOString().split('T')[0],
  })

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (smartTracking && !isEditing) {
      setFormData({
        data_rilevazione: smartTracking.data_rilevazione,
        dispositivo_tipo: smartTracking.dispositivo_tipo || null,
        dispositivo_marca: smartTracking.dispositivo_marca || null,
        passi_giornalieri: smartTracking.passi_giornalieri || null,
        calorie_bruciate: smartTracking.calorie_bruciate || null,
        distanza_percorsa_km: smartTracking.distanza_percorsa_km || null,
        battito_cardiaco_medio: smartTracking.battito_cardiaco_medio || null,
        battito_cardiaco_max: smartTracking.battito_cardiaco_max || null,
        battito_cardiaco_min: smartTracking.battito_cardiaco_min || null,
        ore_sonno: smartTracking.ore_sonno || null,
        qualita_sonno: smartTracking.qualita_sonno || null,
        attivita_minuti: smartTracking.attivita_minuti || null,
        metrica_custom: smartTracking.metrica_custom || {},
      })
    }
  }, [smartTracking, isEditing])

  const sanitizeFormData = useCallback(
    (
      data: AthleteSmartTrackingDataUpdate & { data_rilevazione: string },
    ): AthleteSmartTrackingDataUpdate & { data_rilevazione: string } => {
      return {
        data_rilevazione: data.data_rilevazione,
        dispositivo_tipo: data.dispositivo_tipo || undefined,
        dispositivo_marca: sanitizeString(data.dispositivo_marca, 100) || undefined,
        passi_giornalieri: sanitizeNumber(data.passi_giornalieri, 0, 100000),
        calorie_bruciate: sanitizeNumber(data.calorie_bruciate, 0, 20000),
        distanza_percorsa_km: sanitizeNumber(data.distanza_percorsa_km, 0, 1000),
        battito_cardiaco_medio: sanitizeNumber(data.battito_cardiaco_medio, 30, 250),
        battito_cardiaco_max: sanitizeNumber(data.battito_cardiaco_max, 30, 250),
        battito_cardiaco_min: sanitizeNumber(data.battito_cardiaco_min, 30, 250),
        ore_sonno: sanitizeNumber(data.ore_sonno, 0, 24),
        qualita_sonno: data.qualita_sonno || undefined,
        attivita_minuti: sanitizeNumber(data.attivita_minuti, 0, 1440),
        metrica_custom: sanitizeJsonb(data.metrica_custom as Record<string, unknown>) as
          | Record<string, unknown>
          | undefined,
      }
    },
    [],
  )

  const handleSave = useCallback(async () => {
    if (!formData.data_rilevazione) {
      addToast({
        title: 'Errore',
        message: 'La data di rilevazione è obbligatoria.',
        variant: 'error',
      })
      return
    }

    const extendedSchema = updateAthleteSmartTrackingDataSchema.extend({
      data_rilevazione: z.string().date('Data rilevazione non valida'),
    })

    await handleAthleteProfileSave({
      formData,
      schema: extendedSchema,
      mutation: updateMutation,
      sanitize: sanitizeFormData,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: 'I dati smart tracking sono stati aggiornati con successo.',
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
      successMessage: 'I dati smart tracking sono stati aggiornati con successo.',
      errorMessage: 'Impossibile aggiornare i dati smart tracking.',
    })
  }, [formData, updateMutation, sanitizeFormData, addToast])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (smartTracking) {
      setFormData({
        data_rilevazione: smartTracking.data_rilevazione,
        dispositivo_tipo: smartTracking.dispositivo_tipo || null,
        dispositivo_marca: smartTracking.dispositivo_marca || null,
        passi_giornalieri: smartTracking.passi_giornalieri || null,
        calorie_bruciate: smartTracking.calorie_bruciate || null,
        distanza_percorsa_km: smartTracking.distanza_percorsa_km || null,
        battito_cardiaco_medio: smartTracking.battito_cardiaco_medio || null,
        battito_cardiaco_max: smartTracking.battito_cardiaco_max || null,
        battito_cardiaco_min: smartTracking.battito_cardiaco_min || null,
        ore_sonno: smartTracking.ore_sonno || null,
        qualita_sonno: smartTracking.qualita_sonno || null,
        attivita_minuti: smartTracking.attivita_minuti || null,
        metrica_custom: smartTracking.metrica_custom || {},
      })
    }
  }, [smartTracking])

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    handleSave,
    handleCancel,
    isPending: updateMutation.isPending,
  }
}
