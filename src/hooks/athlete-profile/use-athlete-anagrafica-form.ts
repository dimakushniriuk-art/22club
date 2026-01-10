// ============================================================
// Hook per gestione form anagrafica atleta (FASE C2 - Estrazione Logica Form)
// ============================================================
// Estratto da athlete-anagrafica-tab.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import { useUpdateAthleteAnagrafica } from '@/hooks/athlete-profile/use-athlete-anagrafica'
import type { AthleteAnagrafica, AthleteAnagraficaUpdate } from '@/types/athlete-profile'
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeNumber } from '@/lib/sanitize'
import { updateAthleteAnagraficaSchema } from '@/types/athlete-profile.schema'
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'

interface UseAthleteAnagraficaFormProps {
  anagrafica: AthleteAnagrafica | null
  athleteId: string
}

export function useAthleteAnagraficaForm({ anagrafica, athleteId }: UseAthleteAnagraficaFormProps) {
  const updateMutation = useUpdateAthleteAnagrafica(athleteId)
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<AthleteAnagraficaUpdate>({})

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (anagrafica && !isEditing) {
      setFormData({
        nome: anagrafica.nome,
        cognome: anagrafica.cognome,
        email: anagrafica.email,
        telefono: anagrafica.telefono || null,
        data_nascita: anagrafica.data_nascita || null,
        sesso: anagrafica.sesso || null,
        codice_fiscale: anagrafica.codice_fiscale || null,
        indirizzo: anagrafica.indirizzo || null,
        citta: anagrafica.citta || null,
        provincia: anagrafica.provincia || null,
        nazione: anagrafica.nazione || null,
        contatto_emergenza_nome: anagrafica.contatto_emergenza_nome || null,
        contatto_emergenza_telefono: anagrafica.contatto_emergenza_telefono || null,
        contatto_emergenza_relazione: anagrafica.contatto_emergenza_relazione || null,
        professione: anagrafica.professione || null,
        altezza_cm: anagrafica.altezza_cm || null,
        peso_iniziale_kg: anagrafica.peso_iniziale_kg || null,
        gruppo_sanguigno: anagrafica.gruppo_sanguigno || null,
      })
    }
  }, [anagrafica, isEditing])

  const sanitizeFormData = useCallback((data: AthleteAnagraficaUpdate): AthleteAnagraficaUpdate => {
    return {
      nome: sanitizeString(data.nome, 100) || undefined,
      cognome: sanitizeString(data.cognome, 100) || undefined,
      email: sanitizeEmail(data.email) || undefined,
      telefono: sanitizePhone(data.telefono),
      data_nascita: data.data_nascita || undefined,
      sesso: data.sesso || undefined,
      codice_fiscale: sanitizeString(data.codice_fiscale, 16) || undefined,
      indirizzo: sanitizeString(data.indirizzo, 200) || undefined,
      citta: sanitizeString(data.citta, 100) || undefined,
      provincia: sanitizeString(data.provincia, 50) || undefined,
      nazione: sanitizeString(data.nazione, 50) || undefined,
      contatto_emergenza_nome: sanitizeString(data.contatto_emergenza_nome, 200) || undefined,
      contatto_emergenza_telefono: sanitizePhone(data.contatto_emergenza_telefono),
      contatto_emergenza_relazione:
        sanitizeString(data.contatto_emergenza_relazione, 50) || undefined,
      professione: sanitizeString(data.professione, 100) || undefined,
      altezza_cm: sanitizeNumber(data.altezza_cm, 50, 250) ?? undefined,
      peso_iniziale_kg: sanitizeNumber(data.peso_iniziale_kg, 20, 300) ?? undefined,
      gruppo_sanguigno: sanitizeString(data.gruppo_sanguigno, 5) || undefined,
    }
  }, [])

  const handleSave = useCallback(async () => {
    await handleAthleteProfileSave({
      formData,
      schema: updateAthleteAnagraficaSchema,
      mutation: updateMutation,
      sanitize: sanitizeFormData,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: 'I dati anagrafici sono stati aggiornati con successo.',
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
      successMessage: 'I dati anagrafici sono stati aggiornati con successo.',
      errorMessage: 'Impossibile aggiornare i dati anagrafici.',
    })
  }, [formData, updateMutation, sanitizeFormData, addToast])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (anagrafica) {
      setFormData({
        nome: anagrafica.nome,
        cognome: anagrafica.cognome,
        email: anagrafica.email,
        telefono: anagrafica.telefono || null,
        data_nascita: anagrafica.data_nascita || null,
        sesso: anagrafica.sesso || null,
        codice_fiscale: anagrafica.codice_fiscale || null,
        indirizzo: anagrafica.indirizzo || null,
        citta: anagrafica.citta || null,
        provincia: anagrafica.provincia || null,
        nazione: anagrafica.nazione || null,
        contatto_emergenza_nome: anagrafica.contatto_emergenza_nome || null,
        contatto_emergenza_telefono: anagrafica.contatto_emergenza_telefono || null,
        contatto_emergenza_relazione: anagrafica.contatto_emergenza_relazione || null,
        professione: anagrafica.professione || null,
        altezza_cm: anagrafica.altezza_cm || null,
        peso_iniziale_kg: anagrafica.peso_iniziale_kg || null,
        gruppo_sanguigno: anagrafica.gruppo_sanguigno || null,
      })
    }
  }, [anagrafica])

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    handleSave,
    handleCancel,
    updateMutation,
  }
}
