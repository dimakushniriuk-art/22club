/**
 * @fileoverview Tab Nutrizione per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati nutrizionali e preferenze alimentari
 * @module components/dashboard/athlete-profile/athlete-nutrition-tab
 */

'use client'

import { Button } from '@/components/ui'
import { useAthleteNutrition } from '@/hooks/athlete-profile/use-athlete-nutrition'

const frameSoft = 'border border-primary/20 hover:border-primary/30 transition'
import { useAthleteNutritionForm } from '@/hooks/athlete-profile/use-athlete-nutrition-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { Utensils, Edit, Save, X } from 'lucide-react'
import {
  NutritionGoalsSection,
  NutritionMacronutrientsSection,
  NutritionIntolerancesAllergiesSection,
  NutritionFoodPreferencesSection,
  NutritionMealTimesSection,
  NutritionNotesSection,
} from './nutrition'

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-text-primary md:text-2xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
              <Utensils className="h-4 w-4 text-primary md:h-5 md:w-5" />
            </span>
            Dati Nutrizionali
          </h2>
          <p className="mt-1.5 text-sm md:text-base leading-relaxed text-text-secondary">
            Obiettivi, dieta e preferenze alimentari dell&apos;atleta
          </p>
          <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-primary/70 via-primary/40 to-transparent" />
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className={`w-full min-h-[44px] shrink-0 gap-2 rounded-full bg-background-secondary/25 sm:w-auto ${frameSoft}`}
          >
            <Edit className="h-4 w-4" />
            Modifica
          </Button>
        )}
      </div>

      {/* Obiettivi e Calorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NutritionGoalsSection
          isEditing={isEditing}
          formData={formData}
          nutrition={nutrition ?? null}
          onFormDataChange={(data) => setFormData({ ...formData, ...data })}
        />

        <NutritionMacronutrientsSection
          isEditing={isEditing}
          formData={formData}
          nutrition={nutrition ?? null}
          onMacronutrientiUpdate={updateMacronutrienti}
        />
      </div>

      {/* Intolleranze e Allergie */}
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

      {/* Alimenti Preferiti e Evitati */}
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

      {/* Preferenze Orari Pasti */}
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

      {/* Note Nutrizionali */}
      <NutritionNotesSection
        isEditing={isEditing}
        formData={formData}
        nutrition={nutrition ?? null}
        onFormDataChange={(data) => setFormData({ ...formData, ...data })}
      />

      {/* Pulsanti azione */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-primary/20">
          <Button
            variant="outline"
            onClick={handleCancel}
            className={`flex min-h-[44px] items-center gap-2 rounded-full bg-background-secondary/25 ${frameSoft}`}
          >
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex min-h-[44px] items-center gap-2 rounded-full px-5 font-bold bg-gradient-to-br from-primary/30 to-cyan-500/14 border border-primary/26 shadow-[0_0_24px_rgba(2,179,191,0.16)] hover:from-primary/36 hover:to-cyan-500/18 transition text-white"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      )}
    </div>
  )
}
