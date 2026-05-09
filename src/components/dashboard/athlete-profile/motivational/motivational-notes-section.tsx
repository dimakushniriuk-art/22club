// ============================================================
// Componente Sezione Note Motivazionali (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-motivational-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

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
    <>
      {isEditing ? (
        <Textarea
          value={formData.note_motivazionali || ''}
          onChange={(e) =>
            onFormDataChange({
              note_motivazionali: sanitizeString(e.target.value, 2000, { trim: false }) || null,
            })
          }
          placeholder="Note aggiuntive sulla motivazione..."
          rows={4}
          maxLength={2000}
          className="border-white/10 bg-white/[0.04] text-xs"
        />
      ) : motivational?.note_motivazionali ? (
        <p className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-text-primary">
          {motivational.note_motivazionali}
        </p>
      ) : (
        <p className="py-4 text-center text-sm text-text-secondary">Nessuna nota motivazionale</p>
      )}
    </>
  )
}
