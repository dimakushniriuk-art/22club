// ============================================================
// Componente Sezione Obiettivi Nutrizionali (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-nutrition-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Target } from 'lucide-react'
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
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-teal-400" />
          Obiettivo Nutrizionale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="obiettivo_nutrizionale">Obiettivo</Label>
          {isEditing ? (
            <select
              id="obiettivo_nutrizionale"
              value={formData.obiettivo_nutrizionale || ''}
              onChange={(e) =>
                onFormDataChange({
                  obiettivo_nutrizionale: (e.target.value ||
                    null) as ObiettivoNutrizionaleEnum | null,
                })
              }
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary"
            >
              <option value="">Non specificato</option>
              {OBIETTIVI_NUTRIZIONALI.map((obiettivo) => (
                <option key={obiettivo.value} value={obiettivo.value}>
                  {obiettivo.label}
                </option>
              ))}
            </select>
          ) : (
            nutrition?.obiettivo_nutrizionale && (
              <p className="text-text-primary text-base">
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
            />
          ) : (
            nutrition?.calorie_giornaliere_target && (
              <p className="text-text-primary text-base font-semibold">
                {nutrition.calorie_giornaliere_target} kcal/giorno
              </p>
            )
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dieta_seguita">Dieta Seguita</Label>
          {isEditing ? (
            <select
              id="dieta_seguita"
              value={formData.dieta_seguita || ''}
              onChange={(e) =>
                onFormDataChange({
                  dieta_seguita: (e.target.value || null) as DietaEnum | null,
                })
              }
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary"
            >
              <option value="">Non specificato</option>
              {DIETE.map((dieta) => (
                <option key={dieta.value} value={dieta.value}>
                  {dieta.label}
                </option>
              ))}
            </select>
          ) : (
            nutrition?.dieta_seguita && (
              <p className="text-text-primary text-base">
                {DIETE.find((d) => d.value === nutrition.dieta_seguita)?.label ||
                  nutrition.dieta_seguita}
              </p>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
