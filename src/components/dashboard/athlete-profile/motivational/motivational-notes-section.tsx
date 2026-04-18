// ============================================================
// Componente Sezione Note Motivazionali (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-motivational-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { StickyNote } from 'lucide-react'
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
    <Card variant="default" className="overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-6 space-y-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
          <StickyNote className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
          Note Motivazionali
        </CardTitle>
        <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
      </CardHeader>
      <CardContent className="pt-2 pb-6 px-6">
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
          />
        ) : motivational?.note_motivazionali ? (
          <p className="text-text-primary whitespace-pre-wrap p-4 rounded-lg border border-white/10 bg-white/[0.02]">
            {motivational.note_motivazionali}
          </p>
        ) : (
          <p className="text-text-secondary text-center py-4">Nessuna nota motivazionale</p>
        )}
      </CardContent>
    </Card>
  )
}
