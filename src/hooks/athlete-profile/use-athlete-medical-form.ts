// ============================================================
// Hook per gestione form medical atleta (FASE C2 - Estrazione Logica Form)
// ============================================================
// Estratto da athlete-medical-tab.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import {
  useUpdateAthleteMedical,
  useUploadCertificatoMedico,
  useUploadRefertoMedico,
} from '@/hooks/athlete-profile/use-athlete-medical'
import type {
  AthleteMedicalData,
  AthleteMedicalDataUpdate,
  FarmacoAssunto,
  InterventoChirurgico,
  RefertoMedico,
} from '@/types/athlete-profile'
import { sanitizeString, sanitizeStringArray, sanitizeJsonb } from '@/lib/sanitize'
import { updateAthleteMedicalDataSchema } from '@/types/athlete-profile.schema'
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'

interface UseAthleteMedicalFormProps {
  medical: AthleteMedicalData | null
  athleteId: string
}

export function useAthleteMedicalForm({ medical, athleteId }: UseAthleteMedicalFormProps) {
  const updateMutation = useUpdateAthleteMedical(athleteId)
  const uploadCertificatoMutation = useUploadCertificatoMedico(athleteId)
  const uploadRefertoMutation = useUploadRefertoMedico(athleteId)
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<AthleteMedicalDataUpdate>({})
  const [showUploadCertificato, setShowUploadCertificato] = useState(false)
  const [showUploadReferto, setShowUploadReferto] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadTipo, setUploadTipo] = useState<'agonistico' | 'non_agonistico' | 'sportivo'>(
    'non_agonistico',
  )
  const [uploadScadenza, setUploadScadenza] = useState('')
  const [refertoData, setRefertoData] = useState({ tipo: '', data: '', note: '' })

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (medical && !isEditing) {
      setFormData({
        certificato_medico_url: medical.certificato_medico_url || null,
        certificato_medico_scadenza: medical.certificato_medico_scadenza || null,
        certificato_medico_tipo: medical.certificato_medico_tipo || null,
        referti_medici: medical.referti_medici || [],
        allergie: medical.allergie || [],
        patologie: medical.patologie || [],
        farmaci_assunti: medical.farmaci_assunti || [],
        interventi_chirurgici: medical.interventi_chirurgici || [],
        note_mediche: medical.note_mediche || null,
      })
    }
  }, [medical, isEditing])

  const sanitizeFormData = useCallback(
    (data: AthleteMedicalDataUpdate): AthleteMedicalDataUpdate => {
      // Sanitizza farmaci_assunti
      const farmaci_assunti: FarmacoAssunto[] = (() => {
        if (!data.farmaci_assunti || !Array.isArray(data.farmaci_assunti)) return []
        return data.farmaci_assunti
          .map((item) => {
            if (!item || typeof item !== 'object') return null
            const sanitized = sanitizeJsonb(item as unknown as Record<string, unknown>)
            if (!sanitized) return null
            return {
              nome: sanitizeString(sanitized.nome as string | null | undefined) || '',
              dosaggio: sanitizeString(sanitized.dosaggio as string | null | undefined) || '',
              frequenza: sanitizeString(sanitized.frequenza as string | null | undefined) || '',
              note: sanitizeString(sanitized.note as string | null | undefined) || undefined,
            } as FarmacoAssunto
          })
          .filter((item): item is FarmacoAssunto => item !== null)
      })()

      // Sanitizza interventi_chirurgici
      const interventi_chirurgici: InterventoChirurgico[] = (() => {
        if (!data.interventi_chirurgici || !Array.isArray(data.interventi_chirurgici)) return []
        return data.interventi_chirurgici
          .map((item) => {
            if (!item || typeof item !== 'object') return null
            const sanitized = sanitizeJsonb(item as unknown as Record<string, unknown>)
            if (!sanitized) return null
            return {
              data: sanitizeString(sanitized.data as string | null | undefined) || '',
              tipo: sanitizeString(sanitized.tipo as string | null | undefined) || '',
              note: sanitizeString(sanitized.note as string | null | undefined) || undefined,
            } as InterventoChirurgico
          })
          .filter((item): item is InterventoChirurgico => item !== null)
      })()

      // Sanitizza referti_medici
      const referti_medici: RefertoMedico[] = (() => {
        if (!data.referti_medici || !Array.isArray(data.referti_medici)) return []
        return data.referti_medici
          .map((item) => {
            if (!item || typeof item !== 'object') return null
            const sanitized = sanitizeJsonb(item as unknown as Record<string, unknown>)
            if (!sanitized) return null
            return {
              url: sanitizeString(sanitized.url as string | null | undefined) || '',
              data: sanitizeString(sanitized.data as string | null | undefined) || '',
              tipo: sanitizeString(sanitized.tipo as string | null | undefined) || '',
              note: sanitizeString(sanitized.note as string | null | undefined) || undefined,
            } as RefertoMedico
          })
          .filter((item): item is RefertoMedico => item !== null)
      })()

      return {
        certificato_medico_tipo: data.certificato_medico_tipo || undefined,
        certificato_medico_scadenza: data.certificato_medico_scadenza || undefined,
        allergie: sanitizeStringArray(data.allergie),
        patologie: sanitizeStringArray(data.patologie),
        farmaci_assunti,
        interventi_chirurgici,
        referti_medici,
        note_mediche: sanitizeString(data.note_mediche, 2000) || undefined,
      }
    },
    [],
  )

  const handleSave = useCallback(async () => {
    await handleAthleteProfileSave({
      formData,
      schema: updateAthleteMedicalDataSchema,
      mutation: updateMutation,
      sanitize: sanitizeFormData,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: 'I dati medici sono stati aggiornati con successo.',
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
      successMessage: 'I dati medici sono stati aggiornati con successo.',
      errorMessage: 'Impossibile aggiornare i dati medici.',
    })
  }, [formData, updateMutation, sanitizeFormData, addToast])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (medical) {
      setFormData({
        certificato_medico_url: medical.certificato_medico_url || null,
        certificato_medico_scadenza: medical.certificato_medico_scadenza || null,
        certificato_medico_tipo: medical.certificato_medico_tipo || null,
        referti_medici: medical.referti_medici || [],
        allergie: medical.allergie || [],
        patologie: medical.patologie || [],
        farmaci_assunti: medical.farmaci_assunti || [],
        interventi_chirurgici: medical.interventi_chirurgici || [],
        note_mediche: medical.note_mediche || null,
      })
    }
  }, [medical])

  const handleUploadCertificato = useCallback(async () => {
    if (!uploadFile || !uploadScadenza) {
      addToast({
        title: 'Errore',
        message: 'Seleziona un file e una data di scadenza.',
        variant: 'error',
      })
      return
    }

    try {
      await uploadCertificatoMutation.mutateAsync({
        file: uploadFile,
        tipo: uploadTipo,
        scadenza: uploadScadenza,
      })
      setShowUploadCertificato(false)
      setUploadFile(null)
      setUploadScadenza('')
      addToast({
        title: 'Certificato caricato',
        message: 'Il certificato medico è stato caricato con successo.',
        variant: 'success',
      })
    } catch {
      addToast({
        title: 'Errore',
        message: 'Impossibile caricare il certificato.',
        variant: 'error',
      })
    }
  }, [uploadFile, uploadTipo, uploadScadenza, uploadCertificatoMutation, addToast])

  const handleUploadReferto = useCallback(async () => {
    if (!uploadFile || !refertoData.tipo || !refertoData.data) {
      addToast({
        title: 'Errore',
        message: 'Compila tutti i campi obbligatori.',
        variant: 'error',
      })
      return
    }

    try {
      await uploadRefertoMutation.mutateAsync({
        file: uploadFile,
        tipo: refertoData.tipo,
        data: refertoData.data,
        note: refertoData.note || undefined,
      })
      setShowUploadReferto(false)
      setUploadFile(null)
      setRefertoData({ tipo: '', data: '', note: '' })
      addToast({
        title: 'Referto caricato',
        message: 'Il referto medico è stato caricato con successo.',
        variant: 'success',
      })
    } catch {
      addToast({
        title: 'Errore',
        message: 'Impossibile caricare il referto.',
        variant: 'error',
      })
    }
  }, [uploadFile, refertoData, uploadRefertoMutation, addToast])

  const addArrayItem = useCallback(
    (field: 'allergie' | 'patologie', value: string) => {
      const sanitized = sanitizeString(value, 100)
      if (!sanitized) return
      const current = formData[field] || []
      // Rimuovi duplicati
      if (Array.isArray(current) && current.includes(sanitized)) return
      setFormData((prev) => ({ ...prev, [field]: [...(prev[field] || []), sanitized] }))
    },
    [formData],
  )

  const removeArrayItem = useCallback((field: 'allergie' | 'patologie', index: number) => {
    setFormData((prev) => {
      const current = prev[field] || []
      if (!Array.isArray(current)) return prev
      return { ...prev, [field]: current.filter((_, i) => i !== index) }
    })
  }, [])

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    showUploadCertificato,
    setShowUploadCertificato,
    showUploadReferto,
    setShowUploadReferto,
    uploadFile,
    setUploadFile,
    uploadTipo,
    setUploadTipo,
    uploadScadenza,
    setUploadScadenza,
    refertoData,
    setRefertoData,
    handleSave,
    handleCancel,
    handleUploadCertificato,
    handleUploadReferto,
    addArrayItem,
    removeArrayItem,
    updateMutation,
    uploadCertificatoMutation,
    uploadRefertoMutation,
  }
}
