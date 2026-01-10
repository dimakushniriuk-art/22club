/**
 * @fileoverview Tab Fitness per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati fitness e obiettivi atleta
 * @module components/dashboard/athlete-profile/athlete-fitness-tab
 */

'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui'
import { useAthleteFitness } from '@/hooks/athlete-profile/use-athlete-fitness'
import { useAthleteFitnessForm } from '@/hooks/athlete-profile/use-athlete-fitness-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { Dumbbell, Edit, Save, X } from 'lucide-react'
import {
  FitnessExperienceGoalsSection,
  FitnessTrainingProgramSection,
  FitnessActivitiesZonesSection,
  FitnessInjuriesSection,
  FitnessNotesSection,
} from './fitness'

interface AthleteFitnessTabProps {
  athleteId: string
}

export function AthleteFitnessTab({ athleteId }: AthleteFitnessTabProps) {
  const { data: fitness, isLoading, error } = useAthleteFitness(athleteId)

  const {
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
  } = useAthleteFitnessForm({ fitness: fitness ?? null, athleteId })

  // Memoizza liste array per evitare ricalcoli
  const attivitaList = useMemo(
    () => formData.attivita_precedenti || [],
    [formData.attivita_precedenti],
  )
  const zoneList = useMemo(() => formData.zone_problematiche || [], [formData.zone_problematiche])
  const infortuniList = useMemo(
    () => formData.infortuni_pregressi || [],
    [formData.infortuni_pregressi],
  )

  if (isLoading) {
    return <LoadingState message="Caricamento dati fitness..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati fitness" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-teal-400" />
            Dati Fitness
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Obiettivi, esperienza e preferenze di allenamento
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

      {/* Informazioni Base */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FitnessExperienceGoalsSection
          isEditing={isEditing}
          formData={formData}
          fitness={fitness ?? null}
          onFormDataChange={(data) => setFormData({ ...formData, ...data })}
          onToggleObiettivoSecondario={toggleObiettivoSecondario}
        />

        <FitnessTrainingProgramSection
          isEditing={isEditing}
          formData={formData}
          fitness={fitness ?? null}
          onFormDataChange={(data) => setFormData({ ...formData, ...data })}
          onTogglePreferenzaOrario={togglePreferenzaOrario}
        />
      </div>

      {/* Attività Precedenti e Zone Problematiche */}
      <FitnessActivitiesZonesSection
        isEditing={isEditing}
        attivitaPrecedenti={attivitaList}
        zoneProblematiche={zoneList}
        newAttivita={newArrayItem.attivita || ''}
        newZona={newArrayItem.zona || ''}
        fitness={fitness ?? null}
        onAttivitaAdd={(value) => addArrayItem('attivita_precedenti', value)}
        onAttivitaRemove={(index) => removeArrayItem('attivita_precedenti', index)}
        onZonaAdd={(value) => addArrayItem('zone_problematiche', value)}
        onZonaRemove={(index) => removeArrayItem('zone_problematiche', index)}
        onNewAttivitaChange={(value) => setNewArrayItem({ ...newArrayItem, attivita: value })}
        onNewZonaChange={(value) => setNewArrayItem({ ...newArrayItem, zona: value })}
      />

      {/* Infortuni Pregressi */}
      <FitnessInjuriesSection
        isEditing={isEditing}
        infortuni={infortuniList}
        showInfortunioForm={showInfortunioForm}
        newInfortunio={newArrayItem.infortunio || {}}
        fitness={fitness ?? null}
        onShowInfortunioFormChange={setShowInfortunioForm}
        onNewInfortunioChange={(infortunio) => setNewArrayItem({ ...newArrayItem, infortunio })}
        onInfortunioAdd={addInfortunio}
        onInfortunioRemove={removeInfortunio}
      />

      {/* Note Fitness */}
      <FitnessNotesSection
        isEditing={isEditing}
        formData={formData}
        fitness={fitness ?? null}
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
