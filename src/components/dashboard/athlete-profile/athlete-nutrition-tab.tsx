/**
 * @fileoverview Tab Nutrizione per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati nutrizionali e preferenze alimentari
 * @module components/dashboard/athlete-profile/athlete-nutrition-tab
 */

'use client'

import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { useAthleteNutrition } from '@/hooks/athlete-profile/use-athlete-nutrition'

import { useAthleteNutritionForm } from '@/hooks/athlete-profile/use-athlete-nutrition-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  Utensils,
  Edit,
  Save,
  X,
  Target,
  ChartPie,
  AlertCircle,
  Apple,
  Clock,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  NutritionGoalsSection,
  NutritionMacronutrientsSection,
  NutritionIntolerancesAllergiesSection,
  NutritionFoodPreferencesSection,
  NutritionMealTimesSection,
  NutritionNotesSection,
} from './nutrition'
import { ATHLETE_PROFILE_NESTED_CARD_CLASS } from './athlete-profile-ds'
import { AthleteProfileSectionHeading } from './athlete-profile-section-heading'

interface AthleteNutritionTabProps {
  athleteId: string
}

export function AthleteNutritionTab({ athleteId }: AthleteNutritionTabProps) {
  const { data: nutrition, isLoading, error } = useAthleteNutrition(athleteId)

  const {
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
  } = useAthleteNutritionForm({ nutrition: nutrition ?? null, athleteId })

  if (isLoading) {
    return <LoadingState message="Caricamento dati nutrizionali..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati nutrizionali" />
  }

  return (
    <Card variant="default" className={cn(ATHLETE_PROFILE_NESTED_CARD_CLASS, 'p-0')}>
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="min-w-0 text-center sm:text-left">
          <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-text-primary sm:justify-start sm:text-lg">
            <Utensils className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
            Dati Nutrizionali
          </h2>
          <p className="mt-1 line-clamp-2 text-xs text-text-secondary sm:line-clamp-1">
            Obiettivi, dieta e preferenze alimentari dell&apos;atleta
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
        <AthleteProfileSectionHeading icon={Target}>Obiettivo e piano alimentare</AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <NutritionGoalsSection
            isEditing={isEditing}
            formData={formData}
            nutrition={nutrition ?? null}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
          />
        </div>

        <AthleteProfileSectionHeading icon={ChartPie}>Macronutrienti target</AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <NutritionMacronutrientsSection
            isEditing={isEditing}
            formData={formData}
            nutrition={nutrition ?? null}
            onMacronutrientiUpdate={updateMacronutrienti}
          />
        </div>

        <AthleteProfileSectionHeading icon={AlertCircle}>
          Intolleranze e allergie
        </AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <NutritionIntolerancesAllergiesSection
            isEditing={isEditing}
            intolleranze={formData.intolleranze_alimentari || []}
            allergie={formData.allergie_alimentari || []}
            newIntolleranza={newArrayItem.intolleranza || ''}
            newAllergia={newArrayItem.allergia || ''}
            nutrition={nutrition ?? null}
            onIntolleranzaAdd={(value) => addArrayItem('intolleranze_alimentari', value)}
            onIntolleranzaRemove={(index) => removeArrayItem('intolleranze_alimentari', index)}
            onAllergiaAdd={(value) => addArrayItem('allergie_alimentari', value)}
            onAllergiaRemove={(index) => removeArrayItem('allergie_alimentari', index)}
            onNewIntolleranzaChange={(value) =>
              setNewArrayItem({ ...newArrayItem, intolleranza: value })
            }
            onNewAllergiaChange={(value) => setNewArrayItem({ ...newArrayItem, allergia: value })}
          />
        </div>

        <AthleteProfileSectionHeading icon={Apple}>Preferenze alimentari</AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <NutritionFoodPreferencesSection
            isEditing={isEditing}
            alimentiPreferiti={formData.alimenti_preferiti || []}
            alimentiEvitati={formData.alimenti_evitati || []}
            newAlimentoPreferito={newArrayItem.alimento_preferito || ''}
            newAlimentoEvitato={newArrayItem.alimento_evitato || ''}
            nutrition={nutrition ?? null}
            onAlimentoPreferitoAdd={(value) => addArrayItem('alimenti_preferiti', value)}
            onAlimentoPreferitoRemove={(index) => removeArrayItem('alimenti_preferiti', index)}
            onAlimentoEvitatoAdd={(value) => addArrayItem('alimenti_evitati', value)}
            onAlimentoEvitatoRemove={(index) => removeArrayItem('alimenti_evitati', index)}
            onNewAlimentoPreferitoChange={(value) =>
              setNewArrayItem({ ...newArrayItem, alimento_preferito: value })
            }
            onNewAlimentoEvitatoChange={(value) =>
              setNewArrayItem({ ...newArrayItem, alimento_evitato: value })
            }
          />
        </div>

        <AthleteProfileSectionHeading icon={Clock}>Orari pasti</AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <NutritionMealTimesSection
            isEditing={isEditing}
            formData={formData}
            nutrition={nutrition ?? null}
            newSpuntino={newArrayItem.spuntino || ''}
            onOrarioPastoUpdate={updateOrarioPasto}
            onSpuntinoAdd={addSpuntino}
            onSpuntinoRemove={removeSpuntino}
            onNewSpuntinoChange={(value) => setNewArrayItem({ ...newArrayItem, spuntino: value })}
          />
        </div>

        <AthleteProfileSectionHeading icon={FileText}>Note nutrizionali</AthleteProfileSectionHeading>
        <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
          <NutritionNotesSection
            isEditing={isEditing}
            formData={formData}
            nutrition={nutrition ?? null}
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
