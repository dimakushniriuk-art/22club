/**
 * @fileoverview Tab Nutrizione per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati nutrizionali e preferenze alimentari
 * @module components/dashboard/athlete-profile/athlete-nutrition-tab
 */

'use client'

import { Button } from '@/components/ui'
import { useAthleteNutrition } from '@/hooks/athlete-profile/use-athlete-nutrition'
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Utensils className="h-6 w-6 text-teal-400" />
            Dati Nutrizionali
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Obiettivi, dieta e preferenze alimentari dell&apos;atleta
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
