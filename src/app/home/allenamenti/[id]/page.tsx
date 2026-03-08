'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import Image from 'next/image'
import { ArrowLeft, ChevronDown, ChevronRight, Dumbbell, Play, Calendar, Target, Activity, Zap, Info } from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:home:allenamenti:[id]:page')

type PlanRow = { id: string; name: string; description: string | null }
type DayRow = { id: string; day_number: number; title: string | null; day_name: string }
type WdeRow = {
  id: string
  workout_day_id: string
  exercise_id: string | null
  order_index: number | null
  circuit_block_id: string | null
}
type ExerciseDetail = {
  exercise_id: string
  name: string
  order_index: number
  description: string | null
  video_url: string | null
  thumb_url: string | null
  image_url: string | null
  difficulty: string
  equipment: string | null
  muscle_group: string
}
type DayItem =
  | { type: 'exercise'; exercise: ExerciseDetail }
  | { type: 'circuit'; exercises: ExerciseDetail[] }

export default function AllenamentiSchedaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { user, loading: authLoading } = useAuth()
  const planId = typeof params?.id === 'string' ? params.id : null

  const [plan, setPlan] = useState<PlanRow | null>(null)
  const [days, setDays] = useState<Array<DayRow & { items: DayItem[] }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null)
  const [expandedCircuitKey, setExpandedCircuitKey] = useState<string | null>(null)

  const fetchPlanAndDays = useCallback(async () => {
    if (!planId) return
    try {
      setLoading(true)
      setError(null)

      const { data: planData, error: planErr } = await supabase
        .from('workout_plans')
        .select('id, name, description')
        .eq('id', planId)
        .single()

      if (planErr || !planData) {
        setError(planErr?.message ?? 'Scheda non trovata')
        setPlan(null)
        setDays([])
        return
      }
      setPlan(planData as PlanRow)

      const { data: daysData, error: daysErr } = await supabase
        .from('workout_days')
        .select('id, day_number, title, day_name')
        .eq('workout_plan_id', planId)
        .order('day_number', { ascending: true })

      if (daysErr) {
        logger.warn('Errore giorni', undefined, { error: daysErr.message })
        setDays([])
        return
      }

      const daysList = (daysData ?? []) as DayRow[]
      if (daysList.length === 0) {
        setDays([])
        return
      }

      const dayIds = daysList.map((d) => d.id)
      const { data: wdeData, error: wdeErr } = await supabase
        .from('workout_day_exercises')
        .select('id, workout_day_id, exercise_id, order_index, circuit_block_id')
        .in('workout_day_id', dayIds)
        .order('order_index', { ascending: true })

      if (wdeErr) {
        logger.warn('Errore esercizi giorni', undefined, { error: wdeErr.message })
        setDays(
          daysList.map((d) => ({ ...d, items: [] })),
        )
        return
      }

      const wdeList = (wdeData ?? []) as WdeRow[]
      const exerciseIds = [...new Set(wdeList.map((e) => e.exercise_id).filter(Boolean) as string[])]
      const exerciseDetailsMap = new Map<string, Omit<ExerciseDetail, 'exercise_id' | 'order_index'>>()
      if (exerciseIds.length > 0) {
        const { data: exData } = await supabase
          .from('exercises')
          .select('id, name, description, video_url, thumb_url, image_url, difficulty, equipment, muscle_group')
          .in('id', exerciseIds)
        const exList = (exData ?? []) as Array<{
          id: string
          name: string
          description: string | null
          video_url: string | null
          thumb_url: string | null
          image_url: string | null
          difficulty: string
          equipment: string | null
          muscle_group: string
        }>
        exList.forEach((e) =>
          exerciseDetailsMap.set(e.id, {
            name: e.name,
            description: e.description,
            video_url: e.video_url,
            thumb_url: e.thumb_url,
            image_url: e.image_url,
            difficulty: e.difficulty,
            equipment: e.equipment,
            muscle_group: e.muscle_group,
          }),
        )
      }

      const toExerciseDetail = (e: WdeRow): ExerciseDetail | null => {
        if (!e.exercise_id) return null
        const details = exerciseDetailsMap.get(e.exercise_id)
        return {
          exercise_id: e.exercise_id,
          order_index: e.order_index ?? 0,
          name: details?.name ?? 'Esercizio',
          description: details?.description ?? null,
          video_url: details?.video_url ?? null,
          thumb_url: details?.thumb_url ?? null,
          image_url: details?.image_url ?? null,
          difficulty: details?.difficulty ?? 'media',
          equipment: details?.equipment ?? null,
          muscle_group: details?.muscle_group ?? '',
        }
      }

      const byDayRows = new Map<string, WdeRow[]>()
      daysList.forEach((d) => byDayRows.set(d.id, []))
      wdeList.forEach((e) => {
        const list = byDayRows.get(e.workout_day_id)
        if (list) list.push(e)
      })

      const buildItemsForDay = (dayId: string): DayItem[] => {
        const rows = (byDayRows.get(dayId) ?? []).sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
        )
        const items: DayItem[] = []
        let i = 0
        while (i < rows.length) {
          const row = rows[i]
          const blockId = row.circuit_block_id ?? null
          if (blockId === null) {
            const ex = toExerciseDetail(row)
            if (ex) items.push({ type: 'exercise', exercise: ex })
            i++
          } else {
            const circuitExercises: ExerciseDetail[] = []
            while (i < rows.length && (rows[i].circuit_block_id ?? null) === blockId) {
              const ex = toExerciseDetail(rows[i])
              if (ex) circuitExercises.push(ex)
              i++
            }
            if (circuitExercises.length > 0) {
              items.push({ type: 'circuit', exercises: circuitExercises })
            }
          }
        }
        return items
      }

      setDays(
        daysList.map((d) => ({
          ...d,
          items: buildItemsForDay(d.id),
        })),
      )
    } catch (err) {
      logger.error('Errore caricamento scheda', err, { planId })
      setError(err instanceof Error ? err.message : 'Errore di caricamento')
      setPlan(null)
      setDays([])
    } finally {
      setLoading(false)
    }
  }, [planId, supabase])

  useEffect(() => {
    if (planId && !authLoading) fetchPlanAndDays()
  }, [planId, authLoading, fetchPlanAndDays])

  const isAthlete = isValidProfile(user) && isValidUUID(user?.id)

  if (authLoading || !planId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 flex items-center justify-center">
          <p className="text-text-secondary text-sm">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!isAthlete) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 flex flex-col items-center justify-center gap-4">
          <p className="text-text-secondary text-sm">Accesso non consentito.</p>
          <Button variant="outline" size="sm" onClick={() => router.push('/home/allenamenti')} className="rounded-xl border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/10">
            Torna agli allenamenti
          </Button>
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4">
          <header className="fixed inset-x-0 top-0 z-20 overflow-hidden rounded-b-xl border-b border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg pt-[env(safe-area-inset-top)]">
            <div className="absolute inset-0 rounded-b-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/5" />
            <div className="relative z-10 flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400" onClick={() => router.push('/home/allenamenti')} aria-label="Indietro">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-semibold text-text-primary truncate">Scheda</h1>
                <p className="text-xs text-text-tertiary line-clamp-1">Dettaglio scheda allenamento</p>
              </div>
            </div>
          </header>
          <Card className="border border-state-error/50 bg-background-secondary/50">
            <CardContent className="pt-6 min-[834px]:pt-8">
              <p className="text-text-secondary text-sm min-[834px]:text-base">{error ?? 'Scheda non trovata'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const daysListContent = loading ? (
    <p className="text-text-secondary text-sm">Caricamento giorni...</p>
  ) : days.length === 0 ? (
    <p className="text-text-secondary text-sm">Nessun giorno configurato.</p>
  ) : (
    <div className="space-y-2.5 min-[834px]:space-y-3">
      {days.map((day) => {
                const isExpanded = expandedDayId === day.id
                const dayTitle = day.title || day.day_name || `Giorno ${day.day_number}`
                return (
                  <Card key={day.id} className="relative overflow-hidden border border-cyan-500/30 bg-background-secondary/50 backdrop-blur-sm hover:border-cyan-400/50 transition-all">
                    <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-cyan-500/40" aria-hidden />
                    <div className="relative z-10 w-full p-4 min-[834px]:p-5 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left min-h-[44px]"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 min-[834px]:h-6 min-[834px]:w-6 text-cyan-400 shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 min-[834px]:h-6 min-[834px]:w-6 text-cyan-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="text-text-primary font-semibold block truncate text-sm min-[834px]:text-base">{dayTitle}</span>
                          <span className="text-text-tertiary text-xs min-[834px]:text-sm">
                            {(() => {
                              const circuitCount = day.items.reduce((n, it) => n + (it.type === 'circuit' ? it.exercises.length : 0), 0)
                              const singleCount = day.items.filter((it) => it.type === 'exercise').length
                              if (circuitCount > 0 || singleCount > 0) return `${circuitCount} a circuito, ${singleCount} singoli`
                              return '0 esercizi'
                            })()}
                          </span>
                        </div>
                      </button>
                      <Link
                        href={`/home/allenamenti/oggi?workout_plan_id=${planId}&workout_day_id=${day.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-1.5 shrink-0 min-h-[44px] h-9 min-[834px]:h-10 px-3 min-[834px]:px-4 text-xs min-[834px]:text-sm font-medium rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Play className="h-3.5 w-3.5 min-[834px]:h-4 min-[834px]:w-4" />
                        Avvia
                      </Link>
                    </div>
                  {isExpanded && (
                    <CardContent className="relative z-10 pt-0 pb-4 min-[834px]:pb-5 px-4 min-[834px]:px-5 border-t border-cyan-500/20">
                      <ul className="space-y-4 min-[834px]:space-y-5 mt-3 mb-4 min-[834px]:mb-5">
                        {day.items.map((item, itemIdx) => {
                          if (item.type === 'exercise') {
                            const ex = item.exercise
                            const hasVideo =
                              ex.video_url &&
                              typeof ex.video_url === 'string' &&
                              (ex.video_url.startsWith('http://') || ex.video_url.startsWith('https://'))
                            const posterUrl = ex.thumb_url || ex.image_url || null
                            return (
                              <li
                                key={`ex-${ex.exercise_id}-${itemIdx}`}
                                className="relative flex gap-3 min-[834px]:gap-4 p-3 min-[834px]:p-4 rounded-xl border border-cyan-500/20 bg-background-tertiary/20"
                              >
                                <Link
                                  href={`/home/allenamenti/esercizio/${ex.exercise_id}?planId=${planId ?? ''}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute top-3 right-3 z-10 flex min-h-[44px] min-w-[44px] h-8 w-8 min-[834px]:h-9 min-[834px]:w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                  aria-label="Dettaglio esercizio"
                                >
                                  <Info className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5" />
                                </Link>
                                <div className="shrink-0 w-24 h-24 min-[834px]:w-28 min-[834px]:h-28 rounded-lg overflow-hidden border border-cyan-500/20 bg-background-tertiary/50 aspect-square">
                                  {posterUrl ? (
                                    <Image
                                      src={posterUrl}
                                      alt=""
                                      width={96}
                                      height={96}
                                      className="w-full h-full object-cover"
                                      unoptimized={posterUrl.startsWith('http')}
                                    />
                                  ) : hasVideo && ex.video_url ? (
                                    <video
                                      src={ex.video_url}
                                      className="w-full h-full object-cover"
                                      muted
                                      loop
                                      playsInline
                                      preload="metadata"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-cyan-400/60">
                                      <Dumbbell className="h-8 w-8" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 pr-10 min-[834px]:pr-12">
                                  <h4 className="text-text-primary font-semibold text-sm min-[834px]:text-base mb-1.5 truncate">
                                    {ex.name}
                                  </h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {ex.muscle_group && (
                                      <Badge variant="info" size="sm" className="text-[10px] min-[834px]:text-xs bg-blue-500/20 text-blue-300 border-blue-500/40">
                                        <Activity className="h-2.5 w-2.5 min-[834px]:h-3 min-[834px]:w-3 mr-0.5" />
                                        {ex.muscle_group}
                                      </Badge>
                                    )}
                                    {ex.equipment && (
                                      <Badge variant="warning" size="sm" className="text-[10px] min-[834px]:text-xs bg-amber-500/20 text-amber-300 border-amber-500/40">
                                        {ex.equipment}
                                      </Badge>
                                    )}
                                    {ex.difficulty && (
                                      <Badge
                                        variant={
                                          ex.difficulty === 'alta' || ex.difficulty === 'advanced'
                                            ? 'error'
                                            : ex.difficulty === 'bassa' || ex.difficulty === 'beginner'
                                              ? 'success'
                                              : 'warning'
                                        }
                                        size="sm"
                                        className="text-[10px] min-[834px]:text-xs"
                                      >
                                        <Target className="h-2.5 w-2.5 min-[834px]:h-3 min-[834px]:w-3 mr-0.5" />
                                        {['bassa', 'beginner', 'easy'].includes(ex.difficulty)
                                          ? 'Principiante'
                                          : ['alta', 'advanced', 'hard'].includes(ex.difficulty)
                                            ? 'Avanzato'
                                            : 'Intermedio'}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </li>
                            )
                          }
                          const circuitKey = `${day.id}-${itemIdx}`
                          const isCircuitExpanded = expandedCircuitKey === circuitKey
                          const firstEx = item.exercises[0]
                          const firstPoster = firstEx?.thumb_url || firstEx?.image_url || null
                          const firstHasVideo =
                            firstEx?.video_url &&
                            typeof firstEx.video_url === 'string' &&
                            (firstEx.video_url.startsWith('http://') || firstEx.video_url.startsWith('https://'))
                          return (
                            <li
                              key={`circuit-${itemIdx}`}
                              className="rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCircuitKey((k) => (k === circuitKey ? null : circuitKey))
                                }
                                className="w-full flex items-center gap-3 min-[834px]:gap-4 p-3 min-[834px]:p-4 text-left hover:bg-amber-500/10 transition-colors border-b border-amber-500/20 min-h-[44px]"
                              >
                                <div className="shrink-0 w-24 h-24 min-[834px]:w-28 min-[834px]:h-28 rounded-lg overflow-hidden border border-amber-500/30 bg-background-tertiary/50 aspect-square">
                                  {firstPoster ? (
                                    <Image
                                      src={firstPoster}
                                      alt=""
                                      width={96}
                                      height={96}
                                      className="w-full h-full object-cover"
                                      unoptimized={firstPoster.startsWith('http')}
                                    />
                                  ) : firstHasVideo && firstEx?.video_url ? (
                                    <video
                                      src={firstEx.video_url}
                                      className="w-full h-full object-cover"
                                      muted
                                      loop
                                      playsInline
                                      preload="metadata"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-amber-400/60">
                                      <Zap className="h-8 w-8" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Zap className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5 text-amber-400 shrink-0" />
                                    <span className="text-text-primary font-semibold text-sm min-[834px]:text-base">
                                      Circuito
                                    </span>
                                    <Badge
                                      variant="outline"
                                      size="sm"
                                      className="text-[10px] min-[834px]:text-xs bg-amber-500/20 text-amber-300 border-amber-500/40"
                                    >
                                      {item.exercises.length} esercizi
                                    </Badge>
                                  </div>
                                  <p className="text-text-secondary text-xs min-[834px]:text-sm mt-0.5">
                                    Clicca per aprire la lista
                                  </p>
                                </div>
                                <div className="shrink-0 text-amber-400">
                                  {isCircuitExpanded ? (
                                    <ChevronDown className="h-5 w-5 min-[834px]:h-6 min-[834px]:w-6" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 min-[834px]:h-6 min-[834px]:w-6" />
                                  )}
                                </div>
                              </button>
                              {isCircuitExpanded && (
                              <ul className="divide-y divide-surface-300/20">
                                {item.exercises.map((ex, idx) => {
                                  const hasVideo =
                                    ex.video_url &&
                                    typeof ex.video_url === 'string' &&
                                    (ex.video_url.startsWith('http://') || ex.video_url.startsWith('https://'))
                                  const posterUrl = ex.thumb_url || ex.image_url || null
                                  return (
                                    <li
                                      key={`${ex.exercise_id}-${idx}`}
                                      className="relative flex gap-3 min-[834px]:gap-4 p-3 min-[834px]:p-4 bg-background-tertiary/10"
                                    >
                                      <Link
                                        href={`/home/allenamenti/esercizio/${ex.exercise_id}?planId=${planId ?? ''}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute top-3 right-3 z-10 flex min-h-[44px] min-w-[44px] h-8 w-8 min-[834px]:h-9 min-[834px]:w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                        aria-label="Dettaglio esercizio"
                                      >
                                        <Info className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5" />
                                      </Link>
                                      <div className="shrink-0 w-20 h-20 min-[834px]:w-24 min-[834px]:h-24 rounded-lg overflow-hidden border border-cyan-500/20 bg-background-tertiary/50 aspect-square">
                                        {hasVideo && ex.video_url ? (
                                          <video
                                            src={ex.video_url}
                                            poster={posterUrl || undefined}
                                            className="w-full h-full object-cover"
                                            muted
                                            loop
                                            playsInline
                                            preload="metadata"
                                          />
                                        ) : posterUrl ? (
                                          <Image
                                            src={posterUrl}
                                            alt=""
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                            unoptimized={posterUrl.startsWith('http')}
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-cyan-400/60">
                                            <Dumbbell className="h-6 w-6" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0 pr-10 min-[834px]:pr-12">
                                        <h4 className="text-text-primary font-semibold text-sm min-[834px]:text-base mb-1.5 truncate">
                                          {ex.name}
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                          {ex.muscle_group && (
                                            <Badge variant="info" size="sm" className="text-[10px] min-[834px]:text-xs bg-blue-500/20 text-blue-300 border-blue-500/40">
                                              <Activity className="h-2.5 w-2.5 min-[834px]:h-3 min-[834px]:w-3 mr-0.5" />
                                              {ex.muscle_group}
                                            </Badge>
                                          )}
                                          {ex.equipment && (
                                            <Badge variant="warning" size="sm" className="text-[10px] min-[834px]:text-xs bg-amber-500/20 text-amber-300 border-amber-500/40">
                                              {ex.equipment}
                                            </Badge>
                                          )}
                                          {ex.difficulty && (
                                            <Badge
                                              variant={
                                                ex.difficulty === 'alta' || ex.difficulty === 'advanced'
                                                  ? 'error'
                                                  : ex.difficulty === 'bassa' || ex.difficulty === 'beginner'
                                                    ? 'success'
                                                    : 'warning'
                                              }
                                              size="sm"
                                              className="text-[10px] min-[834px]:text-xs"
                                            >
                                              <Target className="h-2.5 w-2.5 min-[834px]:h-3 min-[834px]:w-3 mr-0.5" />
                                              {['bassa', 'beginner', 'easy'].includes(ex.difficulty)
                                                ? 'Principiante'
                                                : ['alta', 'advanced', 'hard'].includes(ex.difficulty)
                                                  ? 'Avanzato'
                                                  : 'Intermedio'}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  )
                                })}
                              </ul>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                      <Link
                        href={`/home/allenamenti/oggi?workout_plan_id=${planId}&workout_day_id=${day.id}`}
                        className="block"
                      >
                        <Button
                          size="sm"
                          className="w-full min-h-[44px] min-[834px]:h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white border-0 text-xs min-[834px]:text-sm"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Inizia questo giorno
                        </Button>
                      </Link>
                    </CardContent>
                  )}
                    </div>
                </Card>
              )
            })}
    </div>
  )

  const renderContent = () => (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
        <header className="fixed inset-x-0 top-0 z-20 overflow-hidden rounded-b-xl border-b border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg pt-[env(safe-area-inset-top)]">
          <div className="absolute inset-0 rounded-b-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/5" />
          <div className="relative z-10 flex items-center gap-3">
            <Link href="/home/allenamenti" className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors" aria-label="Torna agli allenamenti">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
              <Activity className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center min-h-0">
              <h1 className="text-text-primary mb-0.5 text-base sm:text-xl md:text-2xl min-[834px]:text-3xl font-semibold leading-tight line-clamp-2 break-words">
                {plan.name}
              </h1>
              <p className="text-text-tertiary text-[10px] sm:text-xs min-[834px]:text-sm line-clamp-2 break-words">
                {plan.description ?? 'Scheda di allenamento'}
              </p>
            </div>
          </div>
        </header>
        <div>
          <h2 className="text-text-primary text-base min-[834px]:text-lg font-semibold mb-3 min-[834px]:mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5 text-cyan-400" />
            Giorni di allenamento
          </h2>
          {daysListContent}
        </div>
      </div>
    </div>
  )

  return renderContent()
}
