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

interface WorkoutPlanCardProps {
  workout: WorkoutPlanCardWorkout
}

function WorkoutPlanCardComponent({ workout }: WorkoutPlanCardProps) {
  return (
    <Link href={`/home/allenamenti/${workout.id}`} className="block" prefetch={true}>
      <Card className="relative overflow-hidden border border-cyan-500/30 bg-background-secondary/60 backdrop-blur-sm hover:border-cyan-400/50 hover:shadow-md hover:shadow-cyan-500/10 transition-all cursor-pointer">
        <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-cyan-500/25 via-cyan-500/10 to-primary/15" aria-hidden />
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-cyan-500/50" aria-hidden />
        <CardContent className="relative z-10 p-3 min-[834px]:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-text-primary mb-1 text-sm min-[834px]:text-base font-semibold truncate">{workout.name}</h3>
              {workout.description && (
                <p className="text-text-secondary text-xs mb-1.5 line-clamp-2">{workout.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                {workout.difficulty && (
                  <div className="flex items-center gap-0.5">
                    <Target className="text-cyan-400 h-3 w-3" />
                    <span className="text-text-secondary capitalize truncate">{workout.difficulty}</span>
                  </div>
                )}
                {workout.muscle_group && (
                  <div className="flex items-center gap-0.5">
                    <Activity className="text-cyan-400 h-3 w-3" />
                    <span className="text-text-secondary truncate">{workout.muscle_group}</span>
                  </div>
                )}
                {workout.staff_name && (
                  <span className="text-text-secondary truncate">PT: {workout.staff_name}</span>
                )}
              </div>
            </div>
            <Badge variant="secondary" size="sm" className="border-cyan-500/30 text-cyan-400 text-[10px] shrink-0">
              Attiva
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const WorkoutPlanCard = memo(WorkoutPlanCardComponent)
