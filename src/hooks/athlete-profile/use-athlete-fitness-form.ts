// ============================================================
// Hook per gestione form fitness atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-fitness-tab.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import { useUpdateAthleteFitness } from '@/hooks/athlete-profile/use-athlete-fitness'
import type {
  AthleteFitnessDataUpdate,
  LivelloEsperienzaEnum,
  ObiettivoFitnessEnum,
  InfortunioPregresso,
} from '@/types/athlete-profile'
import { sanitizeString, sanitizeStringArray, sanitizeNumber, sanitizeJsonb } from '@/lib/sanitize'
import { updateAthleteFitnessDataSchema } from '@/types/athlete-profile.schema'
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'

interface UseAthleteFitnessFormProps {
  fitness: {
    livello_esperienza: LivelloEsperienzaEnum | null
    obiettivo_primario: ObiettivoFitnessEnum | null
    obiettivi_secondari: ObiettivoFitnessEnum[]
    giorni_settimana_allenamento: number | null
    durata_sessione_minuti: number | null
    preferenze_orario: string[]
    attivita_precedenti: string[]
    infortuni_pregressi: InfortunioPregresso[]
    zone_problematiche: string[]
    note_fitness: string | null
  } | null
  athleteId: string
}

export function useAthleteFitnessForm({ fitness, athleteId }: UseAthleteFitnessFormProps) {
  const updateMutation = useUpdateAthleteFitness(athleteId)
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<AthleteFitnessDataUpdate>({})
  const [newArrayItem, setNewArrayItem] = useState<{
    attivita?: string
    zona?: string
    infortunio?: Partial<InfortunioPregresso>
  }>({})
  const [showInfortunioForm, setShowInfortunioForm] = useState(false)

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (fitness && !isEditing) {
      setFormData({
        livello_esperienza: fitness.livello_esperienza || null,
        obiettivo_primario: fitness.obiettivo_primario || null,
        obiettivi_secondari: fitness.obiettivi_secondari || [],
        giorni_settimana_allenamento: fitness.giorni_settimana_allenamento || null,
        durata_sessione_minuti: fitness.durata_sessione_minuti || null,
        preferenze_orario: fitness.preferenze_orario || [],
        attivita_precedenti: fitness.attivita_precedenti || [],
        infortuni_pregressi: fitness.infortuni_pregressi || [],
        zone_problematiche: fitness.zone_problematiche || [],
        note_fitness: fitness.note_fitness || null,
      })
    }
  }, [fitness, isEditing])

  const sanitizeFormData = useCallback(
    (data: AthleteFitnessDataUpdate): AthleteFitnessDataUpdate => {
      return {
        livello_esperienza: data.livello_esperienza || undefined,
        obiettivo_primario: data.obiettivo_primario || undefined,
        obiettivi_secondari: sanitizeStringArray(
          data.obiettivi_secondari as unknown as string[],
        ) as unknown as ObiettivoFitnessEnum[],
        giorni_settimana_allenamento: sanitizeNumber(data.giorni_settimana_allenamento, 1, 7),
        durata_sessione_minuti: sanitizeNumber(data.durata_sessione_minuti, 15, 300),
        preferenze_orario: sanitizeStringArray(data.preferenze_orario),
        attivita_precedenti: sanitizeStringArray(data.attivita_precedenti),
        zone_problematiche: sanitizeStringArray(data.zone_problematiche),
        infortuni_pregressi: (() => {
          if (!data.infortuni_pregressi || !Array.isArray(data.infortuni_pregressi)) return []
          return data.infortuni_pregressi
            .map((item) => {
              if (!item || typeof item !== 'object') return null
              const sanitized = sanitizeJsonb(item as unknown as Record<string, unknown>)
              if (!sanitized) return null
              return {
                data: sanitizeString(sanitized.data as string | null | undefined) || '',
                tipo: sanitizeString(sanitized.tipo as string | null | undefined) || '',
                recuperato:
                  sanitized.recuperato === true || sanitized.recuperato === 'true' || false,
                note: sanitizeString(sanitized.note as string | null | undefined) || undefined,
              } as InfortunioPregresso
            })
            .filter((item): item is InfortunioPregresso => item !== null)
        })(),
        note_fitness: sanitizeString(data.note_fitness, 2000) || undefined,
      }
    },
    [],
  )

  const handleSave = useCallback(async () => {
    await handleAthleteProfileSave({
      formData,
      schema: updateAthleteFitnessDataSchema,
      mutation: updateMutation,
      sanitize: sanitizeFormData,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: 'I dati fitness sono stati aggiornati con successo.',
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
      successMessage: 'I dati fitness sono stati aggiornati con successo.',
      errorMessage: 'Impossibile aggiornare i dati fitness.',
    })
  }, [formData, updateMutation, sanitizeFormData, addToast])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (fitness) {
      setFormData({
        livello_esperienza: fitness.livello_esperienza || null,
        obiettivo_primario: fitness.obiettivo_primario || null,
        obiettivi_secondari: fitness.obiettivi_secondari || [],
        giorni_settimana_allenamento: fitness.giorni_settimana_allenamento || null,
        durata_sessione_minuti: fitness.durata_sessione_minuti || null,
        preferenze_orario: fitness.preferenze_orario || [],
        attivita_precedenti: fitness.attivita_precedenti || [],
        infortuni_pregressi: fitness.infortuni_pregressi || [],
        zone_problematiche: fitness.zone_problematiche || [],
        note_fitness: fitness.note_fitness || null,
      })
    }
  }, [fitness])

  const addArrayItem = useCallback(
    (field: 'attivita_precedenti' | 'zone_problematiche', value: string) => {
      const sanitized = sanitizeString(value, 100)
      if (!sanitized) return
      const current = formData[field] || []
      // Rimuovi duplicati
      if (current.includes(sanitized)) return
      setFormData((prev) => ({ ...prev, [field]: [...current, sanitized] }))
      setNewArrayItem((prev) => ({
        ...prev,
        [field === 'attivita_precedenti' ? 'attivita' : 'zona']: '',
      }))
    },
    [formData],
  )

  const removeArrayItem = useCallback(
    (field: 'attivita_precedenti' | 'zone_problematiche', index: number) => {
      const current = formData[field] || []
      setFormData({ ...formData, [field]: current.filter((_, i) => i !== index) })
    },
    [formData],
  )

  const toggleObiettivoSecondario = useCallback((obiettivo: ObiettivoFitnessEnum) => {
    setFormData((prev) => {
      const current = prev.obiettivi_secondari || []
      const exists = current.includes(obiettivo)
      return {
        ...prev,
        obiettivi_secondari: exists
          ? current.filter((o) => o !== obiettivo)
          : [...current, obiettivo],
      }
    })
  }, [])

  const togglePreferenzaOrario = useCallback((orario: string) => {
    setFormData((prev) => {
      const current = prev.preferenze_orario || []
      const exists = current.includes(orario)
      return {
        ...prev,
        preferenze_orario: exists ? current.filter((o) => o !== orario) : [...current, orario],
      }
    })
  }, [])

  const addInfortunio = useCallback(() => {
    if (!newArrayItem.infortunio?.data || !newArrayItem.infortunio?.tipo) return
    const sanitizedTipo = sanitizeString(newArrayItem.infortunio.tipo, 100)
    if (!sanitizedTipo) return
    const sanitizedData = sanitizeString(newArrayItem.infortunio.data)
    if (!sanitizedData) return

    setFormData((prev) => {
      const current = prev.infortuni_pregressi || []
      const newInfortunio: InfortunioPregresso = {
        data: sanitizedData,
        tipo: sanitizedTipo,
        recuperato: newArrayItem.infortunio!.recuperato || false,
        note: sanitizeString(newArrayItem.infortunio!.note, 500) || undefined,
      }
      return {
        ...prev,
        infortuni_pregressi: [...current, newInfortunio],
      }
    })
    setNewArrayItem((prev) => ({ ...prev, infortunio: {} }))
    setShowInfortunioForm(false)
  }, [newArrayItem.infortunio])

  const removeInfortunio = useCallback((index: number) => {
    setFormData((prev) => {
      const current = prev.infortuni_pregressi || []
      return { ...prev, infortuni_pregressi: current.filter((_, i) => i !== index) }
    })
  }, [])

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    newArrayItem,
    setNewArrayItem,
    showInfortunioForm,
    setShowInfortunioForm,
    handleSave,
    handleCancel,
    addArrayItem,
    removeArrayItem,
    toggleObiettivoSecondario,
    togglePreferenzaOrario,
    addInfortunio,
    removeInfortunio,
    updateMutation,
  }
}
