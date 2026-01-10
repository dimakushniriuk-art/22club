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
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg">Note Nutrizionali</CardTitle>
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
          />
        ) : nutrition?.note_nutrizionali ? (
          <p className="text-text-primary whitespace-pre-wrap bg-background-tertiary/30 p-4 rounded-lg border border-teal-500/10">
            {nutrition.note_nutrizionali}
          </p>
        ) : (
          <p className="text-text-secondary text-center py-4">Nessuna nota nutrizionale</p>
        )}
      </CardContent>
    </Card>
  )
}
