// ============================================================
// Componente Sezione Note Nutrizionali (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-nutrition-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { sanitizeString } from '@/lib/sanitize'
import type { AthleteNutritionDataUpdate } from '@/types/athlete-profile'

interface NutritionNotesSectionProps {
  isEditing: boolean
  formData: AthleteNutritionDataUpdate
  nutrition: {
    note_nutrizionali: string | null
  } | null
  onFormDataChange: (data: Partial<AthleteNutritionDataUpdate>) => void
}

export function NutritionNotesSection({
  isEditing,
  formData,
  nutrition,
  onFormDataChange,
}: NutritionNotesSectionProps) {
  return (
    <Card
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background-secondary/40 backdrop-blur-xl shadow-[0_0_30px_rgba(2,179,191,0.08)] hover:shadow-[0_0_40px_rgba(2,179,191,0.15)] transition-all duration-300"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-text-primary">Note Nutrizionali</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={formData.note_nutrizionali || ''}
            maxLength={2000}
            onChange={(e) => {
              const sanitized = sanitizeString(e.target.value, 2000)
              onFormDataChange({ note_nutrizionali: sanitized || null })
            }}
            placeholder="Note aggiuntive sulla nutrizione..."
            rows={4}
            className="text-base"
          />
        ) : nutrition?.note_nutrizionali ? (
          <p className="text-text-primary text-sm md:text-base whitespace-pre-wrap bg-background-tertiary/30 p-4 rounded-lg border border-primary/20">
            {nutrition.note_nutrizionali}
          </p>
        ) : (
          <p className="text-text-secondary text-sm text-center py-4">Nessuna nota nutrizionale</p>
        )}
      </CardContent>
    </Card>
  )
}
