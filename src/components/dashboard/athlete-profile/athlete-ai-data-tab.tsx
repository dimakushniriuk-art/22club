/**
 * @fileoverview Tab AI Data per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati AI, insights e raccomandazioni
 * @module components/dashboard/athlete-profile/athlete-ai-data-tab
 */

'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { useAthleteAIData } from '@/hooks/athlete-profile/use-athlete-ai-data'
import { useAthleteAIDataForm } from '@/hooks/athlete-profile/use-athlete-ai-data-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { Brain, Edit, Save, X } from 'lucide-react'
import {
  AIDataScoresSection,
  AIDataRiskFactorsSection,
  AIDataRecommendationsSection,
  AIDataPatternsSection,
  AIDataPredictionsSection,
  AIDataInsightsSection,
  AIDataNotesSection,
} from './ai-data'

interface AthleteAIDataTabProps {
  athleteId: string
}

const getPrioritaBadge = (priorita: 'alta' | 'media' | 'bassa') => {
  const badges = {
    alta: { color: 'destructive', text: 'Alta' },
    media: { color: 'warning', text: 'Media' },
    bassa: { color: 'secondary', text: 'Bassa' },
  }
  return badges[priorita]
}

export function AthleteAIDataTab({ athleteId }: AthleteAIDataTabProps) {
  const { data: aiData, isLoading, error } = useAthleteAIData(athleteId)

  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    handleSave,
    handleCancel,
    updateMutation,
  } = useAthleteAIDataForm({
    aiData: aiData
      ? {
          insights_aggregati: aiData.insights_aggregati as Record<string, unknown>,
          raccomandazioni: aiData.raccomandazioni.map((r) => ({
            tipo: r.tipo,
            descrizione: r.descrizione,
            priorita: r.priorita,
            azione: r.azione,
          })),
          pattern_rilevati: aiData.pattern_rilevati.map((p) => ({
            tipo: p.tipo,
            descrizione: p.descrizione,
            frequenza: p.frequenza,
          })),
          predizioni_performance: aiData.predizioni_performance,
          score_engagement: aiData.score_engagement,
          score_progresso: aiData.score_progresso,
          fattori_rischio: aiData.fattori_rischio,
          note_ai: aiData.note_ai,
        }
      : null,
    athleteId,
  })

  // Memoizza liste array per evitare ricalcoli
  const raccomandazioniList = useMemo(
    () => (isEditing ? formData.raccomandazioni || [] : aiData?.raccomandazioni || []),
    [isEditing, formData.raccomandazioni, aiData?.raccomandazioni],
  )

  if (isLoading) {
    return <LoadingState message="Caricamento dati AI..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati AI" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Brain className="h-6 w-6 text-teal-400" />
            Dati AI e Insights
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Analisi, raccomandazioni e predizioni generate dall&apos;AI
            {aiData && (
              <span className="ml-2">
                • Ultima analisi:{' '}
                {new Date(aiData.data_analisi).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifica
          </Button>
        )}
      </div>

      {/* Score Engagement e Progresso */}
      <AIDataScoresSection
        isEditing={isEditing}
        formData={formData}
        aiData={aiData ?? null}
        onFormDataChange={(data) => setFormData({ ...formData, ...data })}
      />

      {/* Fattori Rischio */}
      <AIDataRiskFactorsSection
        fattoriRischio={isEditing ? formData.fattori_rischio || [] : aiData?.fattori_rischio || []}
      />

      {/* Raccomandazioni */}
      <AIDataRecommendationsSection
        raccomandazioni={raccomandazioniList}
        getPrioritaBadge={getPrioritaBadge}
      />

      {/* Pattern Rilevati */}
      <AIDataPatternsSection
        patternRilevati={
          isEditing ? formData.pattern_rilevati || [] : aiData?.pattern_rilevati || []
        }
      />

      {/* Predizioni Performance */}
      <AIDataPredictionsSection
        predizioniPerformance={
          isEditing ? formData.predizioni_performance || [] : aiData?.predizioni_performance || []
        }
      />

      {/* Insights Aggregati */}
      <AIDataInsightsSection
        insightsAggregati={
          isEditing
            ? (formData.insights_aggregati as Record<string, unknown>) || {}
            : aiData?.insights_aggregati || {}
        }
      />

      {/* Note AI */}
      <AIDataNotesSection
        isEditing={isEditing}
        formData={formData}
        aiData={aiData ?? null}
        onFormDataChange={(data) => setFormData({ ...formData, ...data })}
      />

      {/* Pulsanti azione */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      )}

      {/* Messaggio se nessun dato */}
      {!aiData && (
        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Brain className="h-12 w-12 text-text-tertiary mb-4" />
              <p className="text-text-secondary">
                Nessun dato AI disponibile. I dati vengono generati automaticamente dal sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
