// ============================================================
// Componente Sezione Programma Allenamento (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-fitness-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Calendar, Clock } from 'lucide-react'
import type { AthleteFitnessDataUpdate } from '@/types/athlete-profile'

interface FitnessTrainingProgramSectionProps {
  isEditing: boolean
  formData: AthleteFitnessDataUpdate
  fitness: {
    giorni_settimana_allenamento: number | null
    durata_sessione_minuti: number | null
    preferenze_orario: string[]
  } | null
  onFormDataChange: (data: Partial<AthleteFitnessDataUpdate>) => void
  onTogglePreferenzaOrario: (orario: string) => void
}

const PREFERENZE_ORARIO = ['mattina', 'pomeriggio', 'sera']

export function FitnessTrainingProgramSection({
  isEditing,
  formData,
  fitness,
  onFormDataChange,
  onTogglePreferenzaOrario,
}: FitnessTrainingProgramSectionProps) {
  const preferenzeOrarioList = formData.preferenze_orario || []

  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-400" />
          Programma Allenamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="giorni_settimana">Giorni a Settimana</Label>
          {isEditing ? (
            <Input
              id="giorni_settimana"
              type="number"
              min="1"
              max="7"
              value={formData.giorni_settimana_allenamento || ''}
              onChange={(e) =>
                onFormDataChange({
                  giorni_settimana_allenamento: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              placeholder="1-7"
            />
          ) : (
            fitness?.giorni_settimana_allenamento && (
              <p className="text-text-primary text-base">
                {fitness.giorni_settimana_allenamento}{' '}
                {fitness.giorni_settimana_allenamento === 1 ? 'giorno' : 'giorni'} a settimana
              </p>
            )
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durata_sessione">Durata Sessione (minuti)</Label>
          {isEditing ? (
            <Input
              id="durata_sessione"
              type="number"
              min="15"
              max="300"
              value={formData.durata_sessione_minuti || ''}
              onChange={(e) =>
                onFormDataChange({
                  durata_sessione_minuti: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              placeholder="15-300"
            />
          ) : (
            fitness?.durata_sessione_minuti && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-text-tertiary" />
                <p className="text-text-primary text-base">
                  {fitness.durata_sessione_minuti} minuti
                </p>
              </div>
            )
          )}
        </div>

        <div className="space-y-2">
          <Label>Preferenze Orario</Label>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              {PREFERENZE_ORARIO.map((orario) => {
                const isSelected = preferenzeOrarioList.includes(orario)
                return (
                  <Button
                    key={orario}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTogglePreferenzaOrario(orario)}
                  >
                    {orario.charAt(0).toUpperCase() + orario.slice(1)}
                  </Button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {fitness?.preferenze_orario && fitness.preferenze_orario.length > 0 ? (
                fitness.preferenze_orario.map((orario, index) => (
                  <Badge key={index} variant="secondary">
                    {orario.charAt(0).toUpperCase() + orario.slice(1)}
                  </Badge>
                ))
              ) : (
                <p className="text-text-secondary text-sm">Nessuna preferenza</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
