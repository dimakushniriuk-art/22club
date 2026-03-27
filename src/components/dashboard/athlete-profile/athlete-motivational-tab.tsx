/**
 * @fileoverview Tab Motivazionale per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati motivazionali e preferenze atleta
 * @module components/dashboard/athlete-profile/athlete-motivational-tab
 */

'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui'
import { useAthleteMotivational } from '@/hooks/athlete-profile/use-athlete-motivational'

import { useAthleteMotivationalForm } from '@/hooks/athlete-profile/use-athlete-motivational-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { Target, Edit, Save, X } from 'lucide-react'
import {
  MotivationalMainSection,
  MotivationalMotivationsObstaclesSection,
  MotivationalPreferencesSection,
  MotivationalAbandonmentsSection,
  MotivationalNotesSection,
} from './motivational'

interface AthleteMotivationalTabProps {
  athleteId: string
}

export function AthleteMotivationalTab({ athleteId }: AthleteMotivationalTabProps) {
  const { data: motivational, isLoading, error } = useAthleteMotivational(athleteId)

  const {
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
  } = useAthleteMotivationalForm({ motivational: motivational ?? null, athleteId })

  // Memoizza liste array per evitare ricalcoli
  const motivazioniList = useMemo(
    () => formData.motivazioni_secondarie || [],
    [formData.motivazioni_secondarie],
  )
  const ostacoliList = useMemo(
    () => formData.ostacoli_percepiti || [],
    [formData.ostacoli_percepiti],
  )

  if (isLoading) {
    return <LoadingState message="Caricamento dati motivazionali..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati motivazionali" />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Target className="h-4 w-4 text-primary flex-shrink-0" aria-hidden />
            Dati Motivazionali
          </h2>
          <p className="text-text-secondary text-xs mt-1 line-clamp-1">
            Motivazioni, ostacoli e preferenze dell&apos;atleta
          </p>
          <div className="mt-3 h-[3px] w-24 rounded-full bg-gradient-to-r from-primary/70 via-primary/40 to-transparent" />
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 h-8 text-xs flex-shrink-0 self-start sm:self-center border border-white/10 hover:border-primary/20 hover:bg-white/[0.04]"
          >
            <Edit className="h-3 w-3" />
            Modifica
          </Button>
        )}
      </div>

      {/* Motivazione Principale e Livello */}
      <MotivationalMainSection
        isEditing={isEditing}
        formData={formData}
        motivational={motivational ?? null}
        onFormDataChange={(data) => setFormData({ ...formData, ...data })}
      />

      {/* Motivazioni Secondarie e Ostacoli */}
      <MotivationalMotivationsObstaclesSection
        isEditing={isEditing}
        motivazioniSecondarie={motivazioniList}
        ostacoliPercepiti={ostacoliList}
        newMotivazione={newArrayItem.motivazione || ''}
        newOstacolo={newArrayItem.ostacolo || ''}
        motivational={motivational ?? null}
        onMotivazioneAdd={(value) => addArrayItem('motivazioni_secondarie', value)}
        onMotivazioneRemove={(index) => removeArrayItem('motivazioni_secondarie', index)}
        onOstacoloAdd={(value) => addArrayItem('ostacoli_percepiti', value)}
        onOstacoloRemove={(index) => removeArrayItem('ostacoli_percepiti', index)}
        onNewMotivazioneChange={(value) => setNewArrayItem({ ...newArrayItem, motivazione: value })}
        onNewOstacoloChange={(value) => setNewArrayItem({ ...newArrayItem, ostacolo: value })}
      />

      {/* Preferenze Ambiente e Compagnia */}
      <MotivationalPreferencesSection
        isEditing={isEditing}
        formData={formData}
        motivational={motivational ?? null}
        onTogglePreferenza={togglePreferenza}
      />

      {/* Storico Abbandoni */}
      <MotivationalAbandonmentsSection
        isEditing={isEditing}
        showAbbandonoForm={showAbbandonoForm}
        newAbbandono={newArrayItem.abbandono || {}}
        motivational={motivational ?? null}
        onShowAbbandonoFormChange={setShowAbbandonoForm}
        onNewAbbandonoChange={(abbandono) => setNewArrayItem({ ...newArrayItem, abbandono })}
        onAbbandonoAdd={addAbbandono}
        onAbbandonoRemove={removeAbbandono}
      />

      {/* Note Motivazionali */}
      <MotivationalNotesSection
        isEditing={isEditing}
        formData={formData}
        motivational={motivational ?? null}
        onFormDataChange={(data) => setFormData({ ...formData, ...data })}
      />

      {/* Pulsanti azione */}
      {isEditing && (
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={handleCancel}
            size="sm"
            className="h-9 text-xs border-white/10 hover:border-primary/20 hover:bg-white/[0.04]"
          >
            <X className="h-3.5 w-3.5" />
            Annulla
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            size="sm"
          >
            <Save className="h-3.5 w-3.5" />
            {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      )}
    </div>
  )
}
