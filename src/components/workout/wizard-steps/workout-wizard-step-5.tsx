// ============================================================
// Componente Step 5 - Riepilogo (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Check, List, User, Calendar, Dumbbell, Goal } from 'lucide-react'
import type {
  WorkoutWizardData,
  WorkoutDayExerciseData,
  DayItem,
} from '@/types/workout'
import { getObjectiveLabel } from '@/lib/constants/workout-objectives'

function getDayItemsFallback(day: {
  items?: DayItem[]
  exercises?: WorkoutDayExerciseData[]
}): DayItem[] {
  if (day.items && day.items.length > 0) return day.items
  return (day.exercises || []).map((e) => ({ type: 'exercise' as const, exercise: e }))
}

interface WorkoutWizardStep5Props {
  wizardData: WorkoutWizardData
  athletes: Array<{ id: string; name: string; email: string }>
  getDayItems?: (day: {
    items?: DayItem[]
    exercises?: WorkoutDayExerciseData[]
    name?: string
  }) => DayItem[]
  circuitList?: Array<{ id: string; params: WorkoutDayExerciseData[] }>
}

export function WorkoutWizardStep5({
  wizardData,
  athletes,
  getDayItems = getDayItemsFallback,
  circuitList = [],
}: WorkoutWizardStep5Props) {
  const selectedAthlete = athletes.find((a) => a.id === wizardData.athlete_id)
  const totalExercises = wizardData.days.reduce((total, day) => {
    const items = getDayItems(day)
    return (
      total +
      items.reduce((dayTotal, item) => {
        if (item.type === 'exercise') return dayTotal + 1
        const circuit = circuitList.find((c) => c.id === item.circuitId)
        return dayTotal + (circuit?.params?.length ?? 0)
      }, 0)
    )
  }, 0)

  return (
    <Card
      variant="default"
      className="relative overflow-hidden transition-all duration-200"
    >
      <CardContent className="p-6 sm:p-8">
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
          variant="default"
          className="relative overflow-hidden"
        >
          <CardHeader className="border-b border-white/10">
            <CardTitle size="sm" className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400" />
              Riepilogo scheda
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-text-secondary flex items-center gap-2">
                  <List className="h-4 w-4 text-primary" />
                  Nome:
                </span>
                <span className="text-text-primary font-semibold">
                  {wizardData.title || 'Non definito'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-text-secondary flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400" />
                  Atleta:
                </span>
                <span className="text-text-primary font-semibold">
                  {selectedAthlete?.name || (
                    <span className="text-text-tertiary italic">Non selezionato</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-text-secondary flex items-center gap-2">
                  <Goal className="h-4 w-4 text-teal-400" />
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
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-text-secondary flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-400" />
                  Giorni:
                </span>
                <Badge variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/25">
                  {wizardData.days.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-amber-400" />
                  Esercizi totali:
                </span>
                <Badge variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/25">
                  {totalExercises}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {wizardData.notes && (
          <Card
            variant="default"
            className="relative overflow-hidden"
          >
            <CardHeader className="border-b border-white/10">
              <CardTitle size="sm">Note aggiuntive</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-text-secondary text-sm whitespace-pre-wrap">{wizardData.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
      </CardContent>
    </Card>
  )
}
