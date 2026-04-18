// ============================================================
// Componente Sezione Motivazione Principale e Livello (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-motivational-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Target, TrendingUp } from 'lucide-react'
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      <Card variant="default" className="overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-6 space-y-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
            <Target className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
            Motivazione Principale
          </CardTitle>
          <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
          {isEditing ? (
            <Textarea
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
            <p className="text-text-primary whitespace-pre-wrap p-4 rounded-lg border border-white/10 bg-white/[0.02]">
              {motivational.motivazione_principale}
            </p>
          ) : (
            <p className="text-text-secondary text-center py-4">Nessuna motivazione principale</p>
          )}
        </CardContent>
      </Card>

      <Card variant="default" className="overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-6 space-y-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
            <TrendingUp className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
            Livello Motivazione
          </CardTitle>
          <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6 space-y-4">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="livello_motivazione">Livello (1-10)</Label>
                <span className="text-text-primary font-semibold">
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
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Livello attuale</span>
                <span className="text-text-primary font-bold text-lg tabular-nums">
                  {motivational?.livello_motivazione || 0}/10
                </span>
              </div>
              {motivational?.livello_motivazione && (
                <Progress value={(motivational.livello_motivazione / 10) * 100} className="h-3" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
