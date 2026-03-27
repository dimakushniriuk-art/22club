/**
 * @fileoverview Tab Fitness per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati fitness e obiettivi atleta
 * @module components/dashboard/athlete-profile/athlete-fitness-tab
 */

'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { useAthleteFitness } from '@/hooks/athlete-profile/use-athlete-fitness'

import { useAthleteFitnessForm } from '@/hooks/athlete-profile/use-athlete-fitness-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  Dumbbell,
  Edit,
  Save,
  X,
  Target,
  Calendar,
  Activity,
  AlertCircle,
  FileText,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  FitnessExperienceGoalsSection,
  FitnessTrainingProgramSection,
  FitnessActivitiesZonesSection,
  FitnessInjuriesSection,
  FitnessNotesSection,
} from './fitness'
import { ATHLETE_PROFILE_NESTED_CARD_CLASS } from './athlete-profile-ds'
import { AthleteProfileSectionHeading } from './athlete-profile-section-heading'

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
    <Card variant="default" className={cn(ATHLETE_PROFILE_NESTED_CARD_CLASS, 'p-0')}>
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="min-w-0 text-center sm:text-left">
          <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-text-primary sm:justify-start sm:text-lg">
            <Dumbbell className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
            Dati Fitness
          </h2>
          <p className="mt-1 line-clamp-2 text-xs text-text-secondary sm:line-clamp-1">
            Obiettivi, esperienza e preferenze di allenamento
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs touch-manipulation hover:border-primary/20 hover:bg-white/[0.04] sm:h-9 sm:w-auto sm:rounded-md"
          >
            <Edit className="h-3.5 w-3.5" />
            Modifica
          </Button>
        )}
      </div>

      <CardContent className="space-y-0 p-0">
        <AthleteProfileSectionHeading icon={Target}>Esperienza e obiettivi</AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <FitnessExperienceGoalsSection
            isEditing={isEditing}
            formData={formData}
            fitness={fitness ?? null}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
            onToggleObiettivoSecondario={toggleObiettivoSecondario}
          />
        </div>

        <AthleteProfileSectionHeading icon={Calendar}>Programma di allenamento</AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <FitnessTrainingProgramSection
            isEditing={isEditing}
            formData={formData}
            fitness={fitness ?? null}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
            onTogglePreferenzaOrario={togglePreferenzaOrario}
          />
        </div>

        <AthleteProfileSectionHeading icon={Activity}>
          Attività precedenti e zone
        </AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
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
        </div>

        <AthleteProfileSectionHeading
          icon={AlertCircle}
          trailing={
            isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInfortunioForm(true)}
                className="flex h-9 items-center gap-2 border-white/10 text-xs hover:border-primary/20 hover:bg-white/[0.04]"
              >
                <Plus className="h-3.5 w-3.5" />
                Aggiungi infortunio
              </Button>
            ) : undefined
          }
        >
          Infortuni pregressi
        </AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
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
        </div>

        <AthleteProfileSectionHeading icon={FileText}>Note fitness</AthleteProfileSectionHeading>
        <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
          <FitnessNotesSection
            isEditing={isEditing}
            formData={formData}
            fitness={fitness ?? null}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
          />
        </div>

        {isEditing && (
          <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-4 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:px-5 sm:pb-5 sm:pt-5">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex h-11 w-full items-center justify-center gap-2 border-white/10 touch-manipulation hover:border-primary/20 hover:bg-white/[0.04] sm:h-auto sm:w-auto"
            >
              <X className="h-4 w-4" />
              Annulla
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex h-11 w-full items-center justify-center gap-2 touch-manipulation sm:h-auto sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
