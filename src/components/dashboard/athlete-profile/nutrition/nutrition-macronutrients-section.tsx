// ============================================================
// Componente Sezione Macronutrienti Target (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-nutrition-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import type { MacronutrientiTarget, AthleteNutritionDataUpdate } from '@/types/athlete-profile'

interface NutritionMacronutrientsSectionProps {
  isEditing: boolean
  formData: AthleteNutritionDataUpdate
  nutrition: {
    macronutrienti_target: MacronutrientiTarget | null
  } | null
  onMacronutrientiUpdate: (field: keyof MacronutrientiTarget, value: number | null) => void
}

export function NutritionMacronutrientsSection({
  isEditing,
  formData,
  nutrition,
  onMacronutrientiUpdate,
}: NutritionMacronutrientsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="proteine">Proteine (g)</Label>
        {isEditing ? (
          <Input
            id="proteine"
            type="number"
            min="0"
            max="1000"
            value={formData.macronutrienti_target?.proteine_g || ''}
            onChange={(e) =>
              onMacronutrientiUpdate(
                'proteine_g',
                e.target.value ? parseFloat(e.target.value) : null,
              )
            }
            placeholder="g"
            className="border-white/10 bg-white/[0.04] text-xs"
          />
        ) : (
          nutrition?.macronutrienti_target?.proteine_g && (
            <p className="text-text-primary text-sm md:text-base">
              {nutrition.macronutrienti_target.proteine_g} g
            </p>
          )
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="carboidrati">Carboidrati (g)</Label>
        {isEditing ? (
          <Input
            id="carboidrati"
            type="number"
            min="0"
            max="2000"
            step="0.1"
            value={formData.macronutrienti_target?.carboidrati_g || ''}
            onChange={(e) =>
              onMacronutrientiUpdate(
                'carboidrati_g',
                e.target.value ? parseFloat(e.target.value) : null,
              )
            }
            placeholder="g"
            maxLength={6}
            className="border-white/10 bg-white/[0.04] text-xs"
          />
        ) : (
          nutrition?.macronutrienti_target?.carboidrati_g && (
            <p className="text-text-primary text-sm md:text-base">
              {nutrition.macronutrienti_target.carboidrati_g} g
            </p>
          )
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="grassi">Grassi (g)</Label>
        {isEditing ? (
          <Input
            id="grassi"
            type="number"
            min="0"
            max="500"
            value={formData.macronutrienti_target?.grassi_g || ''}
            onChange={(e) =>
              onMacronutrientiUpdate('grassi_g', e.target.value ? parseFloat(e.target.value) : null)
            }
            placeholder="g"
            className="border-white/10 bg-white/[0.04] text-xs"
          />
        ) : (
          nutrition?.macronutrienti_target?.grassi_g && (
            <p className="text-text-primary text-sm md:text-base">
              {nutrition.macronutrienti_target.grassi_g} g
            </p>
          )
        )}
      </div>
    </div>
  )
}
