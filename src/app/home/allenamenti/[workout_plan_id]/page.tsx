'use client'

// Config route dinamica: force-dynamic per dati real-time
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { ArrowLeft, Calendar, Dumbbell } from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import type { Tables } from '@/types/supabase'

const logger = createLogger('app:home:allenamenti:workout-plan:page')

type WorkoutDay = Pick<
  Tables<'workout_days'>,
  'id' | 'day_number' | 'day_name' | 'title' | 'description'
> & {
  exercise_count?: number
}

export default function WorkoutPlanDaysPage() {
  const router = useRouter()
  // Estrai immediatamente il valore per evitare enumerazione di params (Next.js 15.5.9+)
  // Non memorizzare l'oggetto params per evitare enumerazione durante la serializzazione di React DevTools
  // Accedi direttamente alle proprietà senza memorizzare l'oggetto
  const workoutPlanId = useParams().workout_plan_id as string
  const { user } = useAuth()
  const supabase = useSupabaseClient()

  const [workoutPlan, setWorkoutPlan] = useState<Pick<
    Tables<'workout_plans'>,
    'id' | 'name' | 'description'
  > | null>(null)
  const [days, setDays] = useState<WorkoutDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Type guard per user
  const isValidUser = user && isValidProfile(user)
  const athleteProfileId = isValidUser && isValidUUID(user.id) ? user.id : null

  const loadWorkoutPlanDays = useCallback(async () => {
    if (!athleteProfileId || !workoutPlanId) return

    try {
      setLoading(true)
      setError(null)

      // Carica workout plan
      const { data: planData, error: planError } = await supabase
        .from('workout_plans')
        .select('id, name, description')
        .eq('id', workoutPlanId)
        .eq('athlete_id', athleteProfileId)
        .single()

      if (planError) {
        logger.error('Errore caricamento workout plan', planError, {
          workoutPlanId,
          athleteProfileId,
        })
        setError('Scheda non trovata')
        notifyError('Errore', 'Impossibile caricare la scheda di allenamento')
        setLoading(false)
        return
      }

      if (!planData) {
        setError('Scheda non trovata')
        setLoading(false)
        return
      }

      setWorkoutPlan(planData)

      // Carica giorni di allenamento
      type WorkoutDayRow = Pick<
        Tables<'workout_days'>,
        'id' | 'day_number' | 'day_name' | 'title' | 'description'
      >
      const { data: daysData, error: daysError } = await supabase
        .from('workout_days')
        .select('id, day_number, day_name, title, description')
        .eq('workout_plan_id', workoutPlanId)
        .order('day_number', { ascending: true })
        .returns<WorkoutDayRow[]>()

      if (daysError) {
        logger.error('Errore caricamento workout days', daysError, { workoutPlanId })
        setError('Errore nel caricamento dei giorni di allenamento')
        notifyError('Errore', 'Impossibile caricare i giorni di allenamento')
        setLoading(false)
        return
      }

      // Per ogni giorno, conta gli esercizi
      const daysWithCounts = await Promise.all(
        (daysData || []).map(async (day) => {
          const { count, error: countError } = await supabase
            .from('workout_day_exercises')
            .select('*', { count: 'exact', head: true })
            .eq('workout_day_id', day.id)

          if (countError) {
            logger.warn('Errore conteggio esercizi', countError, { dayId: day.id })
          }

          return {
            ...day,
            exercise_count: count || 0,
          } as WorkoutDay
        }),
      )

      setDays(daysWithCounts)
      setLoading(false)
    } catch (err) {
      logger.error('Errore caricamento dati', err, { workoutPlanId, athleteProfileId })
      setError('Errore nel caricamento dei dati')
      notifyError('Errore', 'Impossibile caricare i dati')
      setLoading(false)
    }
  }, [athleteProfileId, workoutPlanId, supabase])

  useEffect(() => {
    // Il layout gestisce già l'autenticazione, quindi possiamo assumere che user sia valido
    // Non aspettare authLoading - carica i dati immediatamente se abbiamo i parametri
    if (athleteProfileId && workoutPlanId) {
      loadWorkoutPlanDays()
      return undefined
    }
    if (!athleteProfileId) {
      // Se non c'è profileId dopo un breve delay, mostra errore (potrebbe essere ancora in caricamento)
      const timer = setTimeout(() => {
        if (!athleteProfileId) {
          setError('Utente non autenticato')
          setLoading(false)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [athleteProfileId, workoutPlanId, loadWorkoutPlanDays])

  // Mostra loading solo per i dati, non per auth (layout gestisce auth)
  if (loading) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 bg-background-tertiary rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-background-tertiary rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !workoutPlan) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] flex items-center justify-center px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <Card className="relative overflow-hidden border-red-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
          <CardContent className="p-6 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">⚠️</div>
            <p className="text-text-primary mb-4 text-white text-sm font-medium">
              {error || 'Scheda non trovata'}
            </p>
            <Button
              onClick={() => router.back()}
              className="h-9 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
            >
              Indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
      style={{ overflow: 'auto' }}
    >
      {/* Header - Design Moderno e Uniforme */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-text-primary mb-0.5 text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
              {workoutPlan.name}
            </h1>
            {workoutPlan.description && (
              <p className="text-text-secondary text-xs line-clamp-1">{workoutPlan.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Giorni di allenamento - Design Moderno e Uniforme */}
      {days.length === 0 ? (
        <Card className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardContent className="p-5 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">📅</div>
            <p className="text-text-secondary text-sm font-medium">
              Nessun giorno di allenamento configurato
            </p>
            <p className="text-text-tertiary text-xs mt-1.5">
              Questa scheda non ha giorni di allenamento configurati
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {days.map((day) => (
            <Link
              key={day.id}
              href={`/home/allenamenti/${workoutPlanId}/${day.id}`}
              className="block"
              prefetch={true}
            >
              <Card className="group relative overflow-hidden cursor-pointer border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-3 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300 flex-shrink-0">
                          <Calendar className="h-3.5 w-3.5 text-teal-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-text-primary font-semibold text-sm text-white truncate">
                            {day.day_name || day.title || `Giorno ${day.day_number}`}
                          </h3>
                          {day.description && (
                            <p className="text-text-secondary text-xs mt-0.5 line-clamp-1">
                              {day.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] mt-1.5">
                        <div className="flex items-center gap-1">
                          <Dumbbell className="text-teal-300 h-3 w-3 flex-shrink-0" />
                          <span className="text-text-secondary">
                            {day.exercise_count || 0}{' '}
                            {day.exercise_count === 1 ? 'esercizio' : 'esercizi'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="primary"
                      size="sm"
                      className="shadow-md shadow-teal-500/20 pointer-events-none flex-shrink-0 text-[10px]"
                    >
                      Giorno {day.day_number}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
