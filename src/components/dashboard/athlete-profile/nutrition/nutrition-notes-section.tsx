// ============================================================
// Componente Sezione Note Nutrizionali (FASE C)
// ============================================================

'use client'

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
    <>
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
          className="border-white/10 bg-white/[0.04] text-xs"
        />
      ) : nutrition?.note_nutrizionali ? (
        <p className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-text-primary md:text-base">
          {nutrition.note_nutrizionali}
        </p>
      ) : (
        <p className="py-4 text-center text-sm text-text-secondary">Nessuna nota nutrizionale</p>
      )}
    </>
  )
}
