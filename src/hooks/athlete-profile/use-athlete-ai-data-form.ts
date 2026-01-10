// ============================================================
// Hook per gestione form AI data atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-ai-data-tab.tsx per migliorare manutenibilità
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/toast'
import { useUpdateAthleteAIData } from '@/hooks/athlete-profile/use-athlete-ai-data'
import type { AthleteAIDataUpdate } from '@/types/athlete-profile'
import { sanitizeString, sanitizeStringArray, sanitizeNumber, sanitizeJsonb } from '@/lib/sanitize'
import { updateAthleteAIDataSchema } from '@/types/athlete-profile.schema'
import { handleAthleteProfileSave } from '@/lib/utils/athlete-profile-form'

interface UseAthleteAIDataFormProps {
  aiData: {
    insights_aggregati: Record<string, unknown>
    raccomandazioni: Array<{
      tipo: string
      descrizione: string
      priorita: 'alta' | 'media' | 'bassa'
      azione?: string
    }>
    pattern_rilevati: Array<{
      tipo: string
      descrizione: string
      frequenza: string
    }>
    predizioni_performance: Array<{
      metrica: string
      valore_predetto: number
      data_target: string
      confidenza: number
    }>
    score_engagement: number | null
    score_progresso: number | null
    fattori_rischio: string[]
    note_ai: string | null
  } | null
  athleteId: string
}

export function useAthleteAIDataForm({ aiData, athleteId }: UseAthleteAIDataFormProps) {
  const updateMutation = useUpdateAthleteAIData(athleteId)
  const { addToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<AthleteAIDataUpdate>({})

  // Inizializza formData quando i dati vengono caricati
  useEffect(() => {
    if (aiData && !isEditing) {
      setFormData({
        insights_aggregati: aiData.insights_aggregati || {},
        raccomandazioni: aiData.raccomandazioni || [],
        pattern_rilevati: aiData.pattern_rilevati || [],
        predizioni_performance: aiData.predizioni_performance || [],
        score_engagement: aiData.score_engagement || null,
        score_progresso: aiData.score_progresso || null,
        fattori_rischio: aiData.fattori_rischio || [],
        note_ai: aiData.note_ai || null,
      })
    }
  }, [aiData, isEditing])

  const sanitizeFormData = useCallback((data: AthleteAIDataUpdate): AthleteAIDataUpdate => {
    return {
      score_engagement: sanitizeNumber(data.score_engagement, 0, 100),
      score_progresso: sanitizeNumber(data.score_progresso, 0, 100),
      fattori_rischio: sanitizeStringArray(data.fattori_rischio, 200),
      raccomandazioni: data.raccomandazioni
        ? data.raccomandazioni.map((r) => ({
            ...r,
            tipo: sanitizeString(r.tipo, 100) || r.tipo,
            descrizione: sanitizeString(r.descrizione, 1000) || r.descrizione,
            azione: sanitizeString(r.azione, 500) || undefined,
          }))
        : undefined,
      pattern_rilevati: data.pattern_rilevati
        ? data.pattern_rilevati.map((p) => ({
            ...p,
            tipo: sanitizeString(p.tipo, 100) || p.tipo,
            descrizione: sanitizeString(p.descrizione, 1000) || p.descrizione,
            frequenza: sanitizeString(p.frequenza, 100) || p.frequenza,
          }))
        : undefined,
      predizioni_performance: data.predizioni_performance
        ? data.predizioni_performance.map((pred) => {
            const valorePredetto =
              typeof pred.valore_predetto === 'number'
                ? pred.valore_predetto
                : typeof pred.valore_predetto === 'string'
                  ? parseFloat(pred.valore_predetto) || 0
                  : 0
            return {
              metrica: sanitizeString(pred.metrica, 100) || pred.metrica,
              valore_predetto: valorePredetto,
              confidenza: typeof pred.confidenza === 'number' ? pred.confidenza : 0,
              data_target: sanitizeString(pred.data_target) || pred.data_target,
            }
          })
        : undefined,
      insights_aggregati: sanitizeJsonb(data.insights_aggregati as Record<string, unknown>) as
        | Record<string, unknown>
        | undefined,
      note_ai: sanitizeString(data.note_ai, 2000) || undefined,
    }
  }, [])

  const handleSave = useCallback(async () => {
    await handleAthleteProfileSave({
      formData,
      schema: updateAthleteAIDataSchema,
      mutation: updateMutation,
      sanitize: sanitizeFormData,
      onSuccess: () => {
        setIsEditing(false)
        addToast({
          title: 'Dati aggiornati',
          message: 'I dati AI sono stati aggiornati con successo.',
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
      successMessage: 'I dati AI sono stati aggiornati con successo.',
      errorMessage: 'Impossibile aggiornare i dati AI.',
    })
  }, [formData, updateMutation, sanitizeFormData, addToast])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    if (aiData) {
      setFormData({
        insights_aggregati: aiData.insights_aggregati || {},
        raccomandazioni: aiData.raccomandazioni || [],
        pattern_rilevati: aiData.pattern_rilevati || [],
        predizioni_performance:
          aiData.predizioni_performance?.map((pred) => ({
            metrica: pred.metrica,
            valore_predetto:
              typeof pred.valore_predetto === 'number'
                ? pred.valore_predetto
                : typeof pred.valore_predetto === 'string'
                  ? parseFloat(pred.valore_predetto) || 0
                  : 0,
            data_target: pred.data_target,
            confidenza: pred.confidenza,
          })) || [],
        score_engagement: aiData.score_engagement || null,
        score_progresso: aiData.score_progresso || null,
        fattori_rischio: aiData.fattori_rischio || [],
        note_ai: aiData.note_ai || null,
      })
    }
  }, [aiData])

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
