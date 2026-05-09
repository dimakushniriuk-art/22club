// ============================================================
// Componente Sezione Motivazione Principale e Livello (FASE C - Split File Lunghi)
// ============================================================
// Contenuto interno allineato a FitnessExperienceGoalsSection (tab Fitness): niente Card annidate.
// ============================================================

'use client'

import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Progress } from '@/components/ui'
import { sanitizeString, sanitizeNumber } from '@/lib/sanitize'
import type { AthleteMotivationalDataUpdate } from '@/types/athlete-profile'

interface MotivationalMainSectionProps {
  isEditing: boolean
  formData: AthleteMotivationalDataUpdate
  motivational: {
    motivazione_principale: string | null
    livello_motivazione: number | null
  } | null
  onFormDataChange: (data: Partial<AthleteMotivationalDataUpdate>) => void
}

export function MotivationalMainSection({
  isEditing,
  formData,
  motivational,
  onFormDataChange,
}: MotivationalMainSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="motivazione_principale">Motivazione principale</Label>
        {isEditing ? (
          <Textarea
            id="motivazione_principale"
            value={formData.motivazione_principale || ''}
            onChange={(e) =>
              onFormDataChange({
                motivazione_principale:
                  sanitizeString(e.target.value, 1000, { trim: false }) || null,
              })
            }
            placeholder="Descrivi la motivazione principale dell'atleta..."
            rows={4}
            maxLength={1000}
          />
        ) : motivational?.motivazione_principale ? (
          <p className="text-text-primary text-base whitespace-pre-wrap">
            {motivational.motivazione_principale}
          </p>
        ) : (
          <p className="text-sm text-text-secondary">Nessuna motivazione principale</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="livello_motivazione">Livello motivazione</Label>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Scala 1–10</span>
              <span className="font-semibold tabular-nums text-text-primary">
                {formData.livello_motivazione || 0}/10
              </span>
            </div>
            <Input
              id="livello_motivazione"
              type="range"
              min="1"
              max="10"
              value={formData.livello_motivazione || 5}
              onChange={(e) =>
                onFormDataChange({
                  livello_motivazione: sanitizeNumber(parseInt(e.target.value), 1, 10),
                })
              }
              className="w-full"
            />
            <Input
              type="number"
              min="1"
              max="10"
              value={formData.livello_motivazione || ''}
              onChange={(e) =>
                onFormDataChange({
                  livello_motivazione: sanitizeNumber(e.target.value, 1, 10),
                })
              }
              placeholder="1-10"
              className="w-full"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-secondary text-sm">Livello attuale</span>
              <span className="text-lg font-bold tabular-nums text-text-primary">
                {motivational?.livello_motivazione ?? 0}/10
              </span>
            </div>
            {motivational?.livello_motivazione ? (
              <Progress value={(motivational.livello_motivazione / 10) * 100} className="h-3" />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
