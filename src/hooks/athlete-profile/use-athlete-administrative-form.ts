// ============================================================
// Hook per gestione form administrative atleta (FASE C2 - Estrazione Logica Form)
// ============================================================
// Estratto da athlete-administrative-tab.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import {
  useUpdateAthleteAdministrative,
  useUploadDocumentoContrattuale,
} from '@/hooks/athlete-profile/use-athlete-administrative'
import type {
  AthleteAdministrativeData,
  AthleteAdministrativeDataUpdate,
} from '@/types/athlete-profile'
import { sanitizeString, sanitizeNumber } from '@/lib/sanitize'
import { updateAthleteAdministrativeDataSchema } from '@/types/athlete-profile.schema'
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'

interface UseAthleteAdministrativeFormProps {
  administrative: AthleteAdministrativeData | null
  athleteId: string
}

export function useAthleteAdministrativeForm({
  administrative,
  athleteId,
}: UseAthleteAdministrativeFormProps) {
  const updateMutation = useUpdateAthleteAdministrative(athleteId)
  const uploadDocumentoMutation = useUploadDocumentoContrattuale(athleteId)
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<AthleteAdministrativeDataUpdate>({})
  const [showUploadDocumento, setShowUploadDocumento] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [documentoData, setDocumentoData] = useState({ nome: '', tipo: '', note: '' })

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (administrative && !isEditing) {
      setFormData({
        tipo_abbonamento: administrative.tipo_abbonamento || null,
        stato_abbonamento: administrative.stato_abbonamento || null,
        data_inizio_abbonamento: administrative.data_inizio_abbonamento || null,
        data_scadenza_abbonamento: administrative.data_scadenza_abbonamento || null,
        lezioni_incluse: administrative.lezioni_incluse || 0,
        lezioni_utilizzate: administrative.lezioni_utilizzate || 0,
        metodo_pagamento_preferito: administrative.metodo_pagamento_preferito || null,
        note_contrattuali: administrative.note_contrattuali || null,
        documenti_contrattuali: administrative.documenti_contrattuali || [],
      })
    }
  }, [administrative, isEditing])

  const sanitizeFormData = useCallback(
    (data: AthleteAdministrativeDataUpdate): AthleteAdministrativeDataUpdate => {
      return {
        tipo_abbonamento: data.tipo_abbonamento || undefined,
        stato_abbonamento: data.stato_abbonamento || undefined,
        data_inizio_abbonamento: data.data_inizio_abbonamento || undefined,
        data_scadenza_abbonamento: data.data_scadenza_abbonamento || undefined,
        lezioni_incluse: sanitizeNumber(data.lezioni_incluse, 0) || 0,
        lezioni_utilizzate: sanitizeNumber(data.lezioni_utilizzate, 0) || 0,
        metodo_pagamento_preferito: data.metodo_pagamento_preferito || undefined,
        note_contrattuali: sanitizeString(data.note_contrattuali, 2000) || undefined,
        documenti_contrattuali: data.documenti_contrattuali || undefined,
      }
    },
    [],
  )

  const handleSave = useCallback(async () => {
    await handleAthleteProfileSave({
      formData,
      schema: updateAthleteAdministrativeDataSchema,
      mutation: updateMutation,
      sanitize: sanitizeFormData,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: 'I dati amministrativi sono stati aggiornati con successo.',
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
      successMessage: 'I dati amministrativi sono stati aggiornati con successo.',
      errorMessage: 'Impossibile aggiornare i dati amministrativi.',
    })
  }, [formData, updateMutation, sanitizeFormData, addToast])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (administrative) {
      setFormData({
        tipo_abbonamento: administrative.tipo_abbonamento || null,
        stato_abbonamento: administrative.stato_abbonamento || null,
        data_inizio_abbonamento: administrative.data_inizio_abbonamento || null,
        data_scadenza_abbonamento: administrative.data_scadenza_abbonamento || null,
        lezioni_incluse: administrative.lezioni_incluse || 0,
        lezioni_utilizzate: administrative.lezioni_utilizzate || 0,
        metodo_pagamento_preferito: administrative.metodo_pagamento_preferito || null,
        note_contrattuali: administrative.note_contrattuali || null,
        documenti_contrattuali: administrative.documenti_contrattuali || [],
      })
    }
  }, [administrative])

  const handleUploadDocumento = useCallback(async () => {
    const sanitizedNome = sanitizeString(documentoData.nome, 200)
    const sanitizedTipo = sanitizeString(documentoData.tipo, 100)

    if (!uploadFile || !sanitizedNome || !sanitizedTipo) {
      addToast({
        title: 'Errore',
        message: 'Compila tutti i campi obbligatori.',
        variant: 'error',
      })
      return
    }

    try {
      await uploadDocumentoMutation.mutateAsync({
        file: uploadFile,
        nome: sanitizedNome,
        tipo: sanitizedTipo,
        note: sanitizeString(documentoData.note, 500) || undefined,
      })
      setShowUploadDocumento(false)
      setUploadFile(null)
      setDocumentoData({ nome: '', tipo: '', note: '' })
      addToast({
        title: 'Documento caricato',
        message: 'Il documento contrattuale è stato caricato con successo.',
        variant: 'success',
      })
    } catch {
      addToast({
        title: 'Errore',
        message: 'Impossibile caricare il documento.',
        variant: 'error',
      })
    }
  }, [uploadFile, documentoData, uploadDocumentoMutation, addToast])

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    showUploadDocumento,
    setShowUploadDocumento,
    uploadFile,
    setUploadFile,
    documentoData,
    setDocumentoData,
    handleSave,
    handleCancel,
    handleUploadDocumento,
    updateMutation,
    uploadDocumentoMutation,
  }
}
