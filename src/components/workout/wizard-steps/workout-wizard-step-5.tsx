// ============================================================
// Componente Step 5 - Riepilogo (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Check, List, User, Calendar, Dumbbell, Goal } from 'lucide-react'
import type { WorkoutWizardData } from '@/types/workout'
import { getObjectiveLabel } from '@/lib/constants/workout-objectives'

interface WorkoutWizardStep5Props {
  wizardData: WorkoutWizardData
  athletes: Array<{ id: string; name: string; email: string }>
}

export function WorkoutWizardStep5({ wizardData, athletes }: WorkoutWizardStep5Props) {
  const selectedAthlete = athletes.find((a) => a.id === wizardData.athlete_id)
  const totalExercises = wizardData.days.reduce((total, day) => total + day.exercises.length, 0)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-text-primary mb-2 text-xl font-bold">Riepilogo e conferma</h3>
        <p className="text-text-secondary text-sm">
          Verifica le informazioni prima di salvare la scheda
        </p>
      </div>

      <div className="space-y-6">
        {/* Riepilogo scheda */}
        <Card
          variant="trainer"
          className="border-surface-300/30 bg-background-secondary/30 shadow-sm !bg-transparent"
        >
          <CardHeader className="border-b border-surface-300/30">
            <CardTitle size="sm" className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              Riepilogo scheda
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-surface-300/30">
                <span className="text-text-secondary flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Nome:
                </span>
                <span className="text-text-primary font-semibold">
                  {wizardData.title || 'Non definito'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-300/30">
                <span className="text-text-secondary flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Atleta:
                </span>
                <span className="text-text-primary font-semibold">
                  {selectedAthlete?.name || (
                    <span className="text-text-tertiary italic">Non selezionato</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-300/30">
                <span className="text-text-secondary flex items-center gap-2">
                  <Goal className="h-4 w-4" />
                  Obiettivo:
                </span>
                <span className="text-text-primary font-semibold">
                  {wizardData.objective ? (
                    getObjectiveLabel(wizardData.objective)
                  ) : (
                    <span className="text-text-tertiary italic">Non selezionato</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-300/30">
                <span className="text-text-secondary flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Giorni:
                </span>
                <Badge variant="info" size="sm">
                  {wizardData.days.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Esercizi totali:
                </span>
                <Badge variant="info" size="sm">
                  {totalExercises}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {wizardData.notes && (
          <Card
            variant="trainer"
            className="border-surface-300/30 bg-background-secondary/30 shadow-sm !bg-transparent"
          >
            <CardHeader className="border-b border-surface-300/30">
              <CardTitle size="sm">Note aggiuntive</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-text-secondary text-sm whitespace-pre-wrap">{wizardData.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
