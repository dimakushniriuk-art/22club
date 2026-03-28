// ============================================================
// Componente Sezione Obiettivi Nutrizionali (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-nutrition-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { SimpleSelect } from '@/components/ui'
import type {
  ObiettivoNutrizionaleEnum,
  DietaEnum,
  AthleteNutritionDataUpdate,
} from '@/types/athlete-profile'
import { sanitizeNumber } from '@/lib/sanitize'

interface NutritionGoalsSectionProps {
  isEditing: boolean
  formData: AthleteNutritionDataUpdate
  nutrition: {
    obiettivo_nutrizionale: ObiettivoNutrizionaleEnum | null
    calorie_giornaliere_target: number | null
    dieta_seguita: DietaEnum | null
  } | null
  onFormDataChange: (data: Partial<AthleteNutritionDataUpdate>) => void
}

const OBIETTIVI_NUTRIZIONALI: { value: ObiettivoNutrizionaleEnum; label: string }[] = [
  { value: 'dimagrimento', label: 'Dimagrimento' },
  { value: 'massa', label: 'Massa' },
  { value: 'mantenimento', label: 'Mantenimento' },
  { value: 'performance', label: 'Performance' },
  { value: 'salute', label: 'Salute' },
]

const DIETE: { value: DietaEnum; label: string }[] = [
  { value: 'onnivora', label: 'Onnivora' },
  { value: 'vegetariana', label: 'Vegetariana' },
  { value: 'vegana', label: 'Vegana' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranea', label: 'Mediterranea' },
  { value: 'altro', label: 'Altro' },
]

export function NutritionGoalsSection({
  isEditing,
  formData,
  nutrition,
  onFormDataChange,
}: NutritionGoalsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="obiettivo_nutrizionale" className="text-text-tertiary">
          Obiettivo
        </Label>
        {isEditing ? (
          <SimpleSelect
            value={formData.obiettivo_nutrizionale || ''}
            onValueChange={(v) =>
              onFormDataChange({
                obiettivo_nutrizionale: (v || null) as ObiettivoNutrizionaleEnum | null,
              })
            }
            placeholder="Non specificato"
            options={[
              { value: '', label: 'Non specificato' },
              ...[...OBIETTIVI_NUTRIZIONALI].sort((a, b) => a.label.localeCompare(b.label, 'it')),
            ]}
          />
        ) : (
          nutrition?.obiettivo_nutrizionale && (
            <p className="text-text-primary text-sm md:text-base">
              {OBIETTIVI_NUTRIZIONALI.find((o) => o.value === nutrition.obiettivo_nutrizionale)
                ?.label || nutrition.obiettivo_nutrizionale}
            </p>
          )
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="calorie_giornaliere">Calorie Giornaliere Target</Label>
        {isEditing ? (
          <Input
            id="calorie_giornaliere"
            type="number"
            min="800"
            max="5000"
            step="1"
            value={formData.calorie_giornaliere_target || ''}
            onChange={(e) => {
              const sanitized = sanitizeNumber(
                e.target.value ? parseInt(e.target.value) : null,
                800,
                5000,
              )
              onFormDataChange({ calorie_giornaliere_target: sanitized })
            }}
            placeholder="800-5000 kcal"
            maxLength={5}
            className="border-white/10 bg-white/[0.04] text-xs"
          />
        ) : (
          nutrition?.calorie_giornaliere_target && (
            <p className="text-text-primary text-sm md:text-base font-semibold">
              {nutrition.calorie_giornaliere_target} kcal/giorno
            </p>
          )
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dieta_seguita" className="text-text-tertiary">
          Dieta Seguita
        </Label>
        {isEditing ? (
          <SimpleSelect
            value={formData.dieta_seguita || ''}
            onValueChange={(v) =>
              onFormDataChange({
                dieta_seguita: (v || null) as DietaEnum | null,
              })
            }
            placeholder="Non specificato"
            options={[
              { value: '', label: 'Non specificato' },
              ...[...DIETE].sort((a, b) => a.label.localeCompare(b.label, 'it')),
            ]}
          />
        ) : (
          nutrition?.dieta_seguita && (
            <p className="text-text-primary text-sm md:text-base">
              {DIETE.find((d) => d.value === nutrition.dieta_seguita)?.label ||
                nutrition.dieta_seguita}
            </p>
          )
        )}
      </div>
    </div>
  )
}
