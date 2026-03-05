// ============================================================
// Componente Lista Giorni Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-detail-modal.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent } from '@/components/ui'
import { FileText } from 'lucide-react'
import { WorkoutDayCard } from './workout-day-card'

interface WorkoutDaysListProps {
  days: Array<{
    id: string
    day_number: number
    title: string
    exercises: Array<{
      id: string
      exercise_id: string | null
      exercise_name: string
      video_url?: string | null
      image_url?: string | null
      target_sets: number
      target_reps: number
      target_weight: number | null
      rest_timer_sec: number
      order_index: number
      sets?: Array<{
        id: string
        set_number: number
        reps: number
        weight_kg: number | null
        execution_time_sec: number | null
        rest_timer_sec: number | null
      }>
    }>
  }>
}

export function WorkoutDaysList({ days }: WorkoutDaysListProps) {
  if (days.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="text-text-tertiary mx-auto mb-2 h-8 w-8" />
          <p className="text-text-secondary text-sm">
            Nessun giorno di allenamento configurato per questa scheda
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-text-primary text-lg font-bold">Giorni di Allenamento</h4>
        <span className="text-text-tertiary text-sm">({days.length})</span>
      </div>
      {days.map((day) => (
        <WorkoutDayCard key={day.id} day={day} />
      ))}
    </div>
  )
}
