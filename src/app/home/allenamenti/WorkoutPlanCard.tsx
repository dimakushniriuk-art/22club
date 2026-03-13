'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Target, Activity } from 'lucide-react'

export interface WorkoutPlanCardWorkout {
  id: string
  name: string
  description?: string | null
  difficulty?: string | null
  muscle_group?: string | null
  staff_name?: string | null
}

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200 cursor-pointer'

interface WorkoutPlanCardProps {
  workout: WorkoutPlanCardWorkout
}

function WorkoutPlanCardComponent({ workout }: WorkoutPlanCardProps) {
  return (
    <Link href={`/home/allenamenti/${workout.id}`} className="block" prefetch={true}>
      <Card className={`relative overflow-hidden ${CARD_DS}`}>
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-white" aria-hidden />
        <CardContent className="relative z-10 p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 truncate text-sm font-semibold text-cyan-400 sm:text-base">{workout.name}</h3>
              {workout.description && (
                <p className="mb-1.5 line-clamp-2 text-xs text-text-secondary">{workout.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                {workout.difficulty && (
                  <div className="flex items-center gap-0.5">
                    <Target className="h-3 w-3 text-cyan-400" />
                    <span className="truncate capitalize text-text-secondary">{workout.difficulty}</span>
                  </div>
                )}
                {workout.muscle_group && (
                  <div className="flex items-center gap-0.5">
                    <Activity className="h-3 w-3 text-cyan-400" />
                    <span className="truncate text-text-secondary">{workout.muscle_group}</span>
                  </div>
                )}
                {workout.staff_name && (
                  <span className="truncate text-text-secondary">PT: {workout.staff_name}</span>
                )}
              </div>
            </div>
            <Badge variant="secondary" size="sm" className="shrink-0 text-[10px] border-0 bg-cyan-500 text-white">
              Attiva
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const WorkoutPlanCard = memo(WorkoutPlanCardComponent)
