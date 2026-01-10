// ============================================================
// Componente Sezione Note AI Data (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-ai-data-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { sanitizeString } from '@/lib/sanitize'
import type { AthleteAIDataUpdate } from '@/types/athlete-profile'

interface AIDataNotesSectionProps {
  isEditing: boolean
  formData: AthleteAIDataUpdate
  aiData: {
    note_ai: string | null
  } | null
  onFormDataChange: (data: Partial<AthleteAIDataUpdate>) => void
}

export function AIDataNotesSection({
  isEditing,
  formData,
  aiData,
  onFormDataChange,
}: AIDataNotesSectionProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg">Note AI</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={formData.note_ai || ''}
            maxLength={2000}
            onChange={(e) => {
              const sanitized = sanitizeString(e.target.value, 2000)
              onFormDataChange({ note_ai: sanitized || null })
            }}
            placeholder="Note aggiuntive sui dati AI..."
            rows={4}
          />
        ) : aiData?.note_ai ? (
          <p className="text-text-primary whitespace-pre-wrap bg-background-tertiary/30 p-4 rounded-lg border border-teal-500/10">
            {aiData.note_ai}
          </p>
        ) : (
          <p className="text-text-secondary text-center py-4">Nessuna nota AI</p>
        )}
      </CardContent>
    </Card>
  )
}
