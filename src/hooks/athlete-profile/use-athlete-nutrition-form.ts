// ============================================================
// Hook per gestione form nutrizione atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-nutrition-tab.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import { useUpdateAthleteNutrition } from '@/hooks/athlete-profile/use-athlete-nutrition'
import type {
  AthleteNutritionData,
  AthleteNutritionDataUpdate,
  ObiettivoNutrizionaleEnum,
  DietaEnum,
  MacronutrientiTarget,
  PreferenzeOrariPasti,
} from '@/types/athlete-profile'
import type { ZodSchema } from 'zod'
import { sanitizeString, sanitizeStringArray, sanitizeNumber, sanitizeJsonb } from '@/lib/sanitize'
import { updateAthleteNutritionDataSchema } from '@/types/athlete-profile.schema'
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'

interface UseAthleteNutritionFormProps {
  nutrition: {
    obiettivo_nutrizionale: ObiettivoNutrizionaleEnum | null
    calorie_giornaliere_target: number | null
    macronutrienti_target: MacronutrientiTarget | null
    dieta_seguita: DietaEnum | null
    intolleranze_alimentari: string[]
    allergie_alimentari: string[]
    alimenti_preferiti: string[]
    alimenti_evitati: string[]
    preferenze_orari_pasti: PreferenzeOrariPasti | null
    note_nutrizionali: string | null
  } | null
  athleteId: string
}

export function useAthleteNutritionForm({ nutrition, athleteId }: UseAthleteNutritionFormProps) {
  const updateMutation = useUpdateAthleteNutrition(athleteId)
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<AthleteNutritionDataUpdate>({})
  const [newArrayItem, setNewArrayItem] = useState<{
    intolleranza?: string
    allergia?: string
    alimento_preferito?: string
    alimento_evitato?: string
    spuntino?: string
  }>({})

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (nutrition && !isEditing) {
      setFormData({
        obiettivo_nutrizionale: nutrition.obiettivo_nutrizionale || null,
        calorie_giornaliere_target: nutrition.calorie_giornaliere_target || null,
        macronutrienti_target: nutrition.macronutrienti_target || {
          proteine_g: null,
          carboidrati_g: null,
          grassi_g: null,
        },
        dieta_seguita: nutrition.dieta_seguita || null,
        intolleranze_alimentari: nutrition.intolleranze_alimentari || [],
        allergie_alimentari: nutrition.allergie_alimentari || [],
        alimenti_preferiti: nutrition.alimenti_preferiti || [],
        alimenti_evitati: nutrition.alimenti_evitati || [],
        preferenze_orari_pasti: nutrition.preferenze_orari_pasti || {
          colazione: null,
          pranzo: null,
          cena: null,
          spuntini: [],
        },
        note_nutrizionali: nutrition.note_nutrizionali || null,
      })
    }
  }, [nutrition, isEditing])

  const sanitizeFormData = useCallback(
    (data: AthleteNutritionDataUpdate): AthleteNutritionDataUpdate => {
      // Sanitizza macronutrienti_target
      let macronutrienti_target: MacronutrientiTarget | undefined = undefined
      if (data.macronutrienti_target) {
        const sanitized = sanitizeJsonb(
          data.macronutrienti_target as unknown as Record<string, unknown>,
        )
        if (sanitized) {
          macronutrienti_target = {
            proteine_g: sanitizeNumber(
              sanitized.proteine_g as number | string | null | undefined,
              0,
              1000,
            ),
            carboidrati_g: sanitizeNumber(
              sanitized.carboidrati_g as number | string | null | undefined,
              0,
              1000,
            ),
            grassi_g: sanitizeNumber(
              sanitized.grassi_g as number | string | null | undefined,
              0,
              1000,
            ),
          } as MacronutrientiTarget
        }
      }

      // Sanitizza preferenze_orari_pasti
      let preferenze_orari_pasti: PreferenzeOrariPasti | undefined = undefined
      if (data.preferenze_orari_pasti) {
        const sanitized = sanitizeJsonb(
          data.preferenze_orari_pasti as unknown as Record<string, unknown>,
        )
        if (sanitized) {
          preferenze_orari_pasti = sanitized as unknown as PreferenzeOrariPasti
        }
      }

      return {
        obiettivo_nutrizionale: data.obiettivo_nutrizionale || undefined,
        calorie_giornaliere_target: sanitizeNumber(data.calorie_giornaliere_target, 800, 5000),
        macronutrienti_target,
        dieta_seguita: data.dieta_seguita || undefined,
        intolleranze_alimentari: sanitizeStringArray(data.intolleranze_alimentari),
        allergie_alimentari: sanitizeStringArray(data.allergie_alimentari),
        alimenti_preferiti: sanitizeStringArray(data.alimenti_preferiti),
        alimenti_evitati: sanitizeStringArray(data.alimenti_evitati),
        preferenze_orari_pasti,
        note_nutrizionali: sanitizeString(data.note_nutrizionali, 2000) || undefined,
      }
    },
    [],
  )

  const handleSave = useCallback(async () => {
    await handleAthleteProfileSave({
      formData,
      schema: updateAthleteNutritionDataSchema as ZodSchema<
        Partial<Omit<AthleteNutritionData, 'id' | 'athlete_id' | 'created_at' | 'updated_at'>>
      >,
      mutation: updateMutation,
      sanitize: sanitizeFormData,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: 'I dati nutrizionali sono stati aggiornati con successo.',
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
      successMessage: 'I dati nutrizionali sono stati aggiornati con successo.',
      errorMessage: 'Impossibile aggiornare i dati nutrizionali.',
    })
  }, [formData, updateMutation, sanitizeFormData, addToast])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (nutrition) {
      setFormData({
        obiettivo_nutrizionale: nutrition.obiettivo_nutrizionale || null,
        calorie_giornaliere_target: nutrition.calorie_giornaliere_target || null,
        macronutrienti_target: nutrition.macronutrienti_target || {
          proteine_g: null,
          carboidrati_g: null,
          grassi_g: null,
        },
        dieta_seguita: nutrition.dieta_seguita || null,
        intolleranze_alimentari: nutrition.intolleranze_alimentari || [],
        allergie_alimentari: nutrition.allergie_alimentari || [],
        alimenti_preferiti: nutrition.alimenti_preferiti || [],
        alimenti_evitati: nutrition.alimenti_evitati || [],
        preferenze_orari_pasti: nutrition.preferenze_orari_pasti || {
          colazione: null,
          pranzo: null,
          cena: null,
          spuntini: [],
        },
        note_nutrizionali: nutrition.note_nutrizionali || null,
      })
    }
  }, [nutrition])

  const addArrayItem = useCallback(
    (
      field:
        | 'intolleranze_alimentari'
        | 'allergie_alimentari'
        | 'alimenti_preferiti'
        | 'alimenti_evitati',
      value: string,
    ) => {
      const sanitized = sanitizeString(value, 100)
      if (!sanitized) return
      const current = formData[field] || []
      // Rimuovi duplicati
      if (current.includes(sanitized)) return
      setFormData({ ...formData, [field]: [...current, sanitized] })
      const keyMap = {
        intolleranze_alimentari: 'intolleranza',
        allergie_alimentari: 'allergia',
        alimenti_preferiti: 'alimento_preferito',
        alimenti_evitati: 'alimento_evitato',
      } as const
      setNewArrayItem({ ...newArrayItem, [keyMap[field]]: '' })
    },
    [formData, newArrayItem],
  )

  const removeArrayItem = useCallback(
    (
      field:
        | 'intolleranze_alimentari'
        | 'allergie_alimentari'
        | 'alimenti_preferiti'
        | 'alimenti_evitati',
      index: number,
    ) => {
      setFormData((prev) => {
        const current = prev[field] || []
        return { ...prev, [field]: current.filter((_, i) => i !== index) }
      })
    },
    [],
  )

  const updateMacronutrienti = useCallback(
    (field: keyof MacronutrientiTarget, value: number | null) => {
      // Sanitizza il valore numerico con range appropriato
      let sanitizedValue: number | null = null
      if (value !== null && value !== undefined) {
        if (field === 'proteine_g') {
          sanitizedValue = sanitizeNumber(value, 0, 1000)
        } else if (field === 'carboidrati_g') {
          sanitizedValue = sanitizeNumber(value, 0, 2000)
        } else if (field === 'grassi_g') {
          sanitizedValue = sanitizeNumber(value, 0, 500)
        } else {
          sanitizedValue = sanitizeNumber(value, 0)
        }
      }
      setFormData((prev) => {
        const current = prev.macronutrienti_target || {
          proteine_g: null,
          carboidrati_g: null,
          grassi_g: null,
        }
        return {
          ...prev,
          macronutrienti_target: { ...current, [field]: sanitizedValue },
        }
      })
    },
    [],
  )

  const updateOrarioPasto = useCallback(
    (pasto: keyof Omit<PreferenzeOrariPasti, 'spuntini'>, value: string | null) => {
      const sanitizedValue = sanitizeString(value, 10) // Formato HH:MM
      const current = formData.preferenze_orari_pasti || {
        colazione: null,
        pranzo: null,
        cena: null,
        spuntini: [],
      }
      setFormData((prev) => ({
        ...prev,
        preferenze_orari_pasti: { ...current, [pasto]: sanitizedValue },
      }))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const addSpuntino = useCallback(
    (orario: string) => {
      const sanitized = sanitizeString(orario, 10) // Formato HH:MM
      if (!sanitized) return
      const current = formData.preferenze_orari_pasti || {
        colazione: null,
        pranzo: null,
        cena: null,
        spuntini: [],
      }
      const spuntini = current.spuntini || []
      // Rimuovi duplicati
      if (spuntini.includes(sanitized)) return
      setFormData((prev) => ({
        ...prev,
        preferenze_orari_pasti: {
          ...current,
          spuntini: [...spuntini, sanitized],
        },
      }))
      setNewArrayItem((prev) => ({ ...prev, spuntino: '' }))
    },
    [formData],
  )

  const removeSpuntino = useCallback(
    (index: number) => {
      const current = formData.preferenze_orari_pasti || {
        colazione: null,
        pranzo: null,
        cena: null,
        spuntini: [],
      }
      setFormData({
        ...formData,
        preferenze_orari_pasti: {
          ...current,
          spuntini: (current.spuntini || []).filter((_, i) => i !== index),
        },
      })
    },
    [formData],
  )

  return {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    newArrayItem,
    setNewArrayItem,
    handleSave,
    handleCancel,
    addArrayItem,
    removeArrayItem,
    updateMacronutrienti,
    updateOrarioPasto,
    addSpuntino,
    removeSpuntino,
    updateMutation,
  }
}
