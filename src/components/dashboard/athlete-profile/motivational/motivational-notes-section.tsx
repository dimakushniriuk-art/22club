// ============================================================
// Componente Sezione Note Motivazionali (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-motivational-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { sanitizeString } from '@/lib/sanitize'
import type { AthleteMotivationalDataUpdate } from '@/types/athlete-profile'

interface MotivationalNotesSectionProps {
  isEditing: boolean
  formData: AthleteMotivationalDataUpdate
  motivational: {
    note_motivazionali: string | null
  } | null
  onFormDataChange: (data: Partial<AthleteMotivationalDataUpdate>) => void
}

export function MotivationalNotesSection({
  isEditing,
  formData,
  motivational,
  onFormDataChange,
}: MotivationalNotesSectionProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg">Note Motivazionali</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={formData.note_motivazionali || ''}
            onChange={(e) =>
              onFormDataChange({
                note_motivazionali: sanitizeString(e.target.value, 2000) || null,
              })
            }
            placeholder="Note aggiuntive sulla motivazione..."
            rows={4}
            maxLength={2000}
          />
        ) : motivational?.note_motivazionali ? (
          <p className="text-text-primary whitespace-pre-wrap bg-background-tertiary/30 p-4 rounded-lg border border-teal-500/10">
            {motivational.note_motivazionali}
          </p>
        ) : (
          <p className="text-text-secondary text-center py-4">Nessuna nota motivazionale</p>
        )}
      </CardContent>
    </Card>
  )
}
