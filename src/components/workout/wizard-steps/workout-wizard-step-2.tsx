// ============================================================
// Componente Step 2 - Giorni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Calendar, X } from 'lucide-react'
import type { WorkoutWizardData } from '@/types/workout'

interface WorkoutWizardStep2Props {
  wizardData: WorkoutWizardData
  onAddDay: () => void
  onUpdateDay: (index: number, data: Partial<WorkoutWizardData['days'][0]>) => void
  onRemoveDay: (index: number) => void
}

export function WorkoutWizardStep2({
  wizardData,
  onAddDay,
  onUpdateDay,
  onRemoveDay,
}: WorkoutWizardStep2Props) {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-text-primary mb-2 text-xl font-bold">Giorni di allenamento</h3>
          <p className="text-text-secondary text-sm">
            Organizza i giorni della settimana per questa scheda
          </p>
        </div>
        <Button
          onClick={onAddDay}
          size="sm"
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Aggiungi giorno
        </Button>
      </div>

      <div className="space-y-4">
        {wizardData.days.map((day, index) => (
          <Card
            key={index}
            variant="trainer"
            className="border-surface-300/30 bg-background-secondary/30 shadow-sm hover:border-surface-300/50 transition-all duration-200 !bg-transparent"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  size="sm"
                  className="bg-teal-500/20 text-teal-400 border-teal-500/40"
                >
                  Giorno {day.day_number}
                </Badge>
                <Input
                  value={day.title}
                  onChange={(e) => onUpdateDay(index, { title: e.target.value })}
                  className="flex-1"
                  placeholder="Es: Spinta, Gambe, Pull..."
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDay(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {wizardData.days.length === 0 && (
          <Card
            variant="trainer"
            className="border-surface-300/30 bg-background-secondary/30 shadow-sm !bg-transparent"
          >
            <CardContent className="py-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-teal-500/20 text-teal-400 rounded-full p-4">
                  <Calendar className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-text-primary mb-2 text-lg font-semibold">
                Nessun giorno aggiunto
              </h3>
              <p className="text-text-secondary mb-6 text-sm">
                Aggiungi almeno un giorno per organizzare la scheda di allenamento
              </p>
              <Button
                onClick={onAddDay}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Aggiungi primo giorno
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
