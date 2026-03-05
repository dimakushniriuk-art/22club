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
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background-secondary/40 backdrop-blur-xl shadow-[0_0_30px_rgba(2,179,191,0.08)] hover:shadow-[0_0_40px_rgba(2,179,191,0.15)] transition-all duration-300"
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
          <p className="text-text-primary whitespace-pre-wrap bg-background-tertiary/30 p-4 rounded-lg border border-primary/20">
            {motivational.note_motivazionali}
          </p>
        ) : (
          <p className="text-text-secondary text-center py-4">Nessuna nota motivazionale</p>
        )}
      </CardContent>
    </Card>
  )
}
