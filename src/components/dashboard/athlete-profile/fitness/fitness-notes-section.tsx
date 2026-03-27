// ============================================================
// Componente Sezione Note Fitness (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-fitness-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Textarea } from '@/components/ui'
import { sanitizeString } from '@/lib/sanitize'
import type { AthleteFitnessDataUpdate } from '@/types/athlete-profile'

interface FitnessNotesSectionProps {
  isEditing: boolean
  formData: AthleteFitnessDataUpdate
  fitness: {
    note_fitness: string | null
  } | null
  onFormDataChange: (data: Partial<AthleteFitnessDataUpdate>) => void
}

export function FitnessNotesSection({
  isEditing,
  formData,
  fitness,
  onFormDataChange,
}: FitnessNotesSectionProps) {
  return (
    <>
      {isEditing ? (
        <Textarea
          value={formData.note_fitness || ''}
          onChange={(e) =>
            onFormDataChange({
              note_fitness: sanitizeString(e.target.value, 2000) || null,
            })
          }
          maxLength={2000}
          placeholder="Note aggiuntive sul fitness..."
          rows={4}
          className="border-white/10 bg-white/[0.04] text-xs"
        />
      ) : fitness?.note_fitness ? (
        <p className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-text-primary">
          {fitness.note_fitness}
        </p>
      ) : (
        <p className="py-4 text-center text-sm text-text-secondary">Nessuna nota fitness</p>
      )}
    </>
  )
}
