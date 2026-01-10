// ============================================================
// Componente Sezione Note Fitness (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-fitness-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
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
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg">Note Fitness</CardTitle>
      </CardHeader>
      <CardContent>
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
          />
        ) : fitness?.note_fitness ? (
          <p className="text-text-primary whitespace-pre-wrap bg-background-tertiary/30 p-4 rounded-lg border border-teal-500/10">
            {fitness.note_fitness}
          </p>
        ) : (
          <p className="text-text-secondary text-center py-4">Nessuna nota fitness</p>
        )}
      </CardContent>
    </Card>
  )
}
