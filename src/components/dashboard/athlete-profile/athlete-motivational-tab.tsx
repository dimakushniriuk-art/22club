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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Target className="h-6 w-6 text-teal-400" />
            Dati Motivazionali
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Motivazioni, ostacoli e preferenze dell&apos;atleta
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
    </div>
  )
}
