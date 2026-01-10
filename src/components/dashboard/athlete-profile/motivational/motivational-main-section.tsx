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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-teal-400" />
            Motivazione Principale
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={formData.motivazione_principale || ''}
              onChange={(e) =>
                onFormDataChange({
                  motivazione_principale: sanitizeString(e.target.value, 1000) || null,
                })
              }
              placeholder="Descrivi la motivazione principale dell'atleta..."
              rows={4}
              maxLength={1000}
            />
          ) : motivational?.motivazione_principale ? (
            <p className="text-text-primary whitespace-pre-wrap bg-background-tertiary/30 p-4 rounded-lg border border-teal-500/10">
              {motivational.motivazione_principale}
            </p>
          ) : (
            <p className="text-text-secondary text-center py-4">Nessuna motivazione principale</p>
          )}
        </CardContent>
      </Card>

      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-400" />
            Livello Motivazione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <span className="text-text-primary font-bold text-2xl">
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
