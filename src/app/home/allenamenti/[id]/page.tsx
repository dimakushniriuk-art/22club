'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { PageHeaderFixed } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import Image from 'next/image'
import { ChevronDown, ChevronRight, Dumbbell, Play, Calendar, Target, Activity, Zap, Info } from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:home:allenamenti:[id]:page')

/** Mini-preview video per lista: play su tap se autoplay bloccato (es. mobile) */
function ListVideoPreview({ videoUrl }: { videoUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showPlayOverlay, setShowPlayOverlay] = useState(false)

  const tryPlay = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.play().then(() => setShowPlayOverlay(false)).catch(() => setShowPlayOverlay(true))
  }, [])

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={tryPlay}
        onCanPlay={tryPlay}
      />
      {showPlayOverlay && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); tryPlay() }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 hover:bg-black/50 active:scale-95"
          aria-label="Riproduci video"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/90 text-white shadow-lg">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </button>
      )}
    </div>
  )
}

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
          <Button variant="outline" size="sm" onClick={() => router.push('/home/allenamenti')} className="rounded-lg border border-white/10 text-text-primary hover:bg-white/5">
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
          <PageHeaderFixed
            title="Scheda"
            subtitle="Dettaglio scheda allenamento"
            backHref="/home/allenamenti"
            icon={<Activity className="h-5 w-5 text-cyan-400" />}
          />
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
                  <Card key={day.id} className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all">
                    <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-white" aria-hidden />
                    <div className="relative z-10 flex w-full items-center justify-between gap-4 p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                        className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-10 sm:w-10">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-cyan-400 sm:text-base">{dayTitle}</span>
                          <span className="mt-0.5 block text-xs text-text-secondary sm:text-sm">
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
                        className="inline-flex h-9 min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 text-xs font-medium text-white hover:bg-cyan-400 sm:h-10 sm:text-sm"
                      >
                        <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Avvia
                      </Link>
                    </div>
                  {isExpanded && (
                    <CardContent className="relative z-10 border-t border-white/10 px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
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
                                className="relative flex gap-3 rounded-lg border border-white/10 bg-white/5 p-3 sm:gap-4 sm:p-4"
                              >
                                <Link
                                  href={`/home/allenamenti/esercizio/${ex.exercise_id}?planId=${planId ?? ''}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-3 top-3 z-10 flex h-8 w-8 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-400 transition-colors hover:bg-white/10 sm:h-9 sm:w-9"
                                  aria-label="Dettaglio esercizio"
                                >
                                  <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Link>
                                <div className="aspect-square h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 sm:h-28 sm:w-28">
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
                                    <ListVideoPreview videoUrl={ex.video_url} />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-cyan-400">
                                      <Dumbbell className="h-8 w-8" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1 pr-10 sm:pr-12">
                                  <h4 className="mb-1.5 truncate text-sm font-semibold text-text-primary sm:text-base">
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
                              className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCircuitKey((k) => (k === circuitKey ? null : circuitKey))
                                }
                                className="flex min-h-[44px] w-full items-center gap-3 border-b border-white/10 p-3 text-left transition-colors hover:bg-white/5 sm:gap-4 sm:p-4"
                              >
                                <div className="aspect-square h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 sm:h-28 sm:w-28">
                                  {firstPoster ? (
                                    <Image
                                      src={firstPoster}
                                      alt=""
                                      width={96}
                                      height={96}
                                      className="h-full w-full object-cover"
                                      unoptimized={firstPoster.startsWith('http')}
                                    />
                                  ) : firstHasVideo && firstEx?.video_url ? (
                                    <ListVideoPreview videoUrl={firstEx.video_url} />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-cyan-400">
                                      <Zap className="h-8 w-8" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                                      <Zap className="h-4 w-4 text-cyan-400 sm:h-5 sm:w-5" />
                                    </span>
                                    <span className="text-sm font-semibold text-text-primary sm:text-base">
                                      Circuito
                                    </span>
                                    <Badge variant="secondary" size="sm" className="text-[10px] border-white/10 text-text-secondary sm:text-xs">
                                      {item.exercises.length} esercizi
                                    </Badge>
                                  </div>
                                  <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
                                    Clicca per aprire la lista
                                  </p>
                                </div>
                                <span className="shrink-0 text-cyan-400">
                                  {isCircuitExpanded ? (
                                    <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                                  )}
                                </span>
                              </button>
                              {isCircuitExpanded && (
                              <ul className="divide-y divide-white/10">
                                {item.exercises.map((ex, idx) => {
                                  const hasVideo =
                                    ex.video_url &&
                                    typeof ex.video_url === 'string' &&
                                    (ex.video_url.startsWith('http://') || ex.video_url.startsWith('https://'))
                                  const posterUrl = ex.thumb_url || ex.image_url || null
                                  return (
                                    <li
                                      key={`${ex.exercise_id}-${idx}`}
                                      className="relative flex gap-3 bg-white/5 p-3 sm:gap-4 sm:p-4"
                                    >
                                      <Link
                                        href={`/home/allenamenti/esercizio/${ex.exercise_id}?planId=${planId ?? ''}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-3 top-3 z-10 flex h-8 w-8 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-white/10 bg-white/5 text-cyan-400 transition-colors hover:bg-white/10 sm:h-9 sm:w-9"
                                        aria-label="Dettaglio esercizio"
                                      >
                                        <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                                      </Link>
                                      <div className="aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 sm:h-24 sm:w-24">
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
                                          <div className="flex h-full w-full items-center justify-center text-cyan-400">
                                            <Dumbbell className="h-6 w-6" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1 pr-10 sm:pr-12">
                                        <h4 className="mb-1.5 truncate text-sm font-semibold text-text-primary sm:text-base">
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
                          className="min-h-[44px] w-full gap-2 rounded-lg bg-cyan-500 text-xs text-white hover:bg-cyan-400 sm:h-10 sm:text-sm"
                        >
                          <Play className="h-4 w-4" />
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
        <PageHeaderFixed
          title={plan.name}
          subtitle={plan.description ?? 'Scheda di allenamento'}
          backHref="/home/allenamenti"
          icon={<Activity className="h-5 w-5 text-cyan-400" />}
        />
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
