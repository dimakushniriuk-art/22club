/**
 * @fileoverview Tab Motivazionale per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati motivazionali e preferenze atleta
 * @module components/dashboard/athlete-profile/athlete-motivational-tab
 */

'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { useAthleteMotivational } from '@/hooks/athlete-profile/use-athlete-motivational'

import { useAthleteMotivationalForm } from '@/hooks/athlete-profile/use-athlete-motivational-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  Target,
  Sparkles,
  Edit,
  Save,
  X,
  ListOrdered,
  UsersRound,
  AlertCircle,
  FileText,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  MotivationalMainSection,
  MotivationalMotivationsObstaclesSection,
  MotivationalPreferencesSection,
  MotivationalAbandonmentsSection,
  MotivationalNotesSection,
} from './motivational'
import { ATHLETE_PROFILE_NESTED_CARD_CLASS } from './athlete-profile-ds'
import { AthleteProfileSectionHeading } from './athlete-profile-section-heading'

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
    <Card variant="default" className={cn(ATHLETE_PROFILE_NESTED_CARD_CLASS, 'p-0')}>
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="min-w-0 text-center sm:text-left">
          <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-text-primary sm:justify-start sm:text-lg">
            <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
            Dati Motivazionali
          </h2>
          <p className="mt-1 line-clamp-2 text-xs text-text-secondary sm:line-clamp-1">
            Motivazioni, ostacoli e preferenze dell&apos;atleta
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
        <AthleteProfileSectionHeading icon={Target}>
          Motivazione e livello
        </AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <MotivationalMainSection
            isEditing={isEditing}
            formData={formData}
            motivational={motivational ?? null}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
          />
        </div>

        <AthleteProfileSectionHeading icon={ListOrdered}>
          Motivazioni e ostacoli
        </AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
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
            onNewMotivazioneChange={(value) =>
              setNewArrayItem({ ...newArrayItem, motivazione: value })
            }
            onNewOstacoloChange={(value) => setNewArrayItem({ ...newArrayItem, ostacolo: value })}
          />
        </div>

        <AthleteProfileSectionHeading icon={UsersRound}>
          Preferenze ambiente e compagnia
        </AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <MotivationalPreferencesSection
            isEditing={isEditing}
            formData={formData}
            motivational={motivational ?? null}
            onTogglePreferenza={togglePreferenza}
          />
        </div>

        <AthleteProfileSectionHeading
          icon={AlertCircle}
          trailing={
            isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAbbandonoForm(true)}
                className="flex h-9 items-center gap-2 border-white/10 text-xs hover:border-primary/20 hover:bg-white/[0.04]"
              >
                <Plus className="h-3.5 w-3.5" />
                Aggiungi abbandono
              </Button>
            ) : undefined
          }
        >
          Storico abbandoni
        </AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <MotivationalAbandonmentsSection
            isEditing={isEditing}
            showAbbandonoForm={showAbbandonoForm}
            newAbbandono={newArrayItem.abbandono || {}}
            storicoAbbandoni={
              isEditing
                ? (formData.storico_abbandoni ?? [])
                : (motivational?.storico_abbandoni ?? [])
            }
            onShowAbbandonoFormChange={(show) => {
              setShowAbbandonoForm(show)
              setNewArrayItem((prev) => ({ ...prev, abbandono: {} }))
            }}
            onNewAbbandonoChange={(abbandono) => setNewArrayItem({ ...newArrayItem, abbandono })}
            onAbbandonoAdd={addAbbandono}
            onAbbandonoRemove={removeAbbandono}
          />
        </div>

        <AthleteProfileSectionHeading icon={FileText}>
          Note motivazionali
        </AthleteProfileSectionHeading>
        <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
          <MotivationalNotesSection
            isEditing={isEditing}
            formData={formData}
            motivational={motivational ?? null}
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
