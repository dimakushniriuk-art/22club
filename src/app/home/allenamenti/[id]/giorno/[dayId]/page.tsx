'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Layers, Play } from 'lucide-react'
import { AllenamentiPageHeader } from '../../../AllenamentiPageHeader'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { notifyError } from '@/lib/notifications'
import { createLogger } from '@/lib/logger'
import { isValidUUID } from '@/lib/utils/type-guards'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useResolvedAthleteProfileForAllenamenti } from '@/hooks/use-resolved-athlete-profile-for-allenamenti'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'

const logger = createLogger('app:home:allenamenti:giorno:page')

const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

/** Niente anello al click (mouse); solo con Tab (focus-visible). */
const INTERACTIVE_FOCUS =
  'focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

type ExerciseMedia = {
  id: string
  name: string | null
  muscle_group: string | null
  description: string | null
  video_url: string | null
  thumb_url: string | null
  image_url: string | null
}

type ExerciseRow = {
  id: string
  order_index: number | null
  target_sets: number | null
  target_reps: number | null
  target_weight: number | null
  rest_timer_sec: number | null
  note: string | null
  circuit_block_id: string | null
  exercises: ExerciseMedia | null
}

function isRemoteOrPathImage(u: string | null | undefined): u is string {
  return (
    typeof u === 'string' &&
    u.length > 0 &&
    (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/'))
  )
}

function isStreamableVideoUrl(u: string | null | undefined): u is string {
  return (
    typeof u === 'string' && u.length > 0 && (u.startsWith('http://') || u.startsWith('https://'))
  )
}

function ExercisePreviewMedia({
  exercise,
  name,
  href,
  compact,
}: {
  exercise: ExerciseMedia | null
  name: string
  href: string | null
  compact?: boolean
}) {
  const videoUrl = exercise?.video_url
  const thumbUrl = exercise?.thumb_url
  const imageUrl = exercise?.image_url
  const posterRaw = thumbUrl || imageUrl || undefined
  const poster = posterRaw && isStreamableVideoUrl(posterRaw) ? posterRaw : undefined
  const hasVideo = isStreamableVideoUrl(videoUrl)
  const imageSrc = thumbUrl || imageUrl
  const showImage = isRemoteOrPathImage(imageSrc) && !hasVideo

  const boxClass = compact
    ? 'relative h-16 w-[5.25rem] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:h-[4.5rem] sm:w-24'
    : 'relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:h-24 sm:w-36'

  const inner = (
    <div className={boxClass}>
      {hasVideo && videoUrl ? (
        <video
          src={videoUrl}
          className="h-full w-full object-cover"
          poster={poster}
          preload="metadata"
          muted
          playsInline
          aria-label={`Anteprima video: ${name}`}
        />
      ) : showImage && imageSrc ? (
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
          sizes={compact ? '96px' : '144px'}
          unoptimized={imageSrc.startsWith('http')}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-white/5">
          <Play className="h-6 w-6 text-cyan-400/50" aria-hidden />
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="shrink-0 touch-manipulation rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-90"
        aria-label={`Video e dettagli: ${name}`}
      >
        {inner}
      </Link>
    )
  }

  return inner
}

type Block = { kind: 'single' | 'circuit'; rows: ExerciseRow[] }

function groupExerciseRows(rows: ExerciseRow[]): Block[] {
  const blocks: Block[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const bid = row.circuit_block_id
    if (bid) {
      const group: ExerciseRow[] = [row]
      let j = i + 1
      while (j < rows.length && rows[j].circuit_block_id === bid) {
        group.push(rows[j])
        j++
      }
      blocks.push({ kind: 'circuit', rows: group })
      i = j - 1
    } else {
      blocks.push({ kind: 'single', rows: [row] })
    }
  }
  return blocks
}

function formatTargets(r: ExerciseRow): string {
  const s = r.target_sets ?? 0
  const reps = r.target_reps ?? 0
  const w = r.target_weight
  const base = `${s}×${reps}`
  if (w != null && w > 0) return `${base} · ${w} kg`
  return base
}

function ExerciseExecutionExpand({
  description,
  detailHref,
}: {
  description: string
  detailHref: string | null
}) {
  return (
    <div
      className="mt-3 space-y-3 border-t border-white/10 pt-3"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <section className="space-y-1.5 sm:space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary sm:text-sm">
          Esecuzione
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary sm:text-base">
          {description}
        </p>
      </section>
      {detailHref ? (
        <Link
          href={detailHref}
          prefetch={true}
          className="inline-flex min-h-[44px] touch-manipulation items-center text-xs font-medium text-cyan-400 hover:text-cyan-300"
          onClick={(e) => e.stopPropagation()}
        >
          Video e scheda completa →
        </Link>
      ) : null}
    </div>
  )
}

export function GiornoPreviewContent({
  workoutPlanIdOverride,
  dayIdOverride,
}: {
  workoutPlanIdOverride?: string
  dayIdOverride?: string
} = {}) {
  const router = useRouter()
  const params = useParams()
  const planId = workoutPlanIdOverride ?? (typeof params?.id === 'string' ? params.id : null)
  const dayId = dayIdOverride ?? (typeof params?.dayId === 'string' ? params.dayId : null)
  const { loading: authLoading } = useAuth()
  const supabase = useSupabaseClient()
  const { pathBase } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  const { athleteProfileId } = useResolvedAthleteProfileForAllenamenti()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dayLabel, setDayLabel] = useState('')
  const [planName, setPlanName] = useState('')
  const [rows, setRows] = useState<ExerciseRow[]>([])
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(() => new Set())

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (authLoading) return
      if (!planId || !isValidUUID(planId) || !dayId || !isValidUUID(dayId)) {
        setError('Parametri non validi')
        setLoading(false)
        return
      }
      if (!athleteProfileId) {
        setError('Accedi per continuare')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const { data: plan, error: planErr } = await supabase
          .from('workout_plans')
          .select('id, name, is_draft')
          .eq('id', planId)
          .eq('athlete_id', athleteProfileId)
          .maybeSingle()

        if (cancelled) return
        if (planErr) throw planErr
        if (!plan || (plan as { is_draft?: boolean | null }).is_draft) {
          setError('Scheda non trovata')
          setLoading(false)
          return
        }

        setPlanName(((plan as { name?: string | null }).name ?? '').trim() || 'Scheda')

        const { data: dayRow, error: dayErr } = await supabase
          .from('workout_days')
          .select('id, day_number, day_name, title, workout_plan_id')
          .eq('id', dayId)
          .maybeSingle()

        if (cancelled) return
        if (dayErr) throw dayErr
        const d = dayRow as {
          workout_plan_id?: string | null
          day_number?: number | null
          day_name?: string | null
          title?: string | null
        } | null
        if (!d || d.workout_plan_id !== planId) {
          setError('Giorno non trovato')
          setLoading(false)
          return
        }

        const label =
          (d.title?.trim() ||
            d.day_name?.trim() ||
            (d.day_number != null ? `Giorno ${d.day_number}` : 'Giorno')) ??
          'Giorno'
        setDayLabel(label)

        const { data: exData, error: exErr } = await supabase
          .from('workout_day_exercises')
          .select(
            `
            id,
            order_index,
            target_sets,
            target_reps,
            target_weight,
            rest_timer_sec,
            note,
            circuit_block_id,
            exercises ( id, name, muscle_group, description, video_url, thumb_url, image_url )
          `,
          )
          .eq('workout_day_id', dayId)
          .order('order_index', { ascending: true })

        if (cancelled) return
        if (exErr) {
          logger.error('Errore workout_day_exercises', exErr, { dayId })
          throw exErr
        }

        setRows((exData ?? []) as ExerciseRow[])
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Errore')
          notifyError('Errore', 'Impossibile caricare il contenuto del giorno.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [authLoading, athleteProfileId, planId, dayId, supabase])

  const startHref = useMemo(() => {
    if (workoutsPane && planId && dayId)
      return workoutsPane.hrefFor({ kind: 'oggi', workoutPlanId: planId, dayId })
    return `${pathBase}/oggi?workout_plan_id=${encodeURIComponent(planId ?? '')}&workout_day_id=${encodeURIComponent(dayId ?? '')}`
  }, [planId, dayId, pathBase, workoutsPane])

  const blocks = useMemo(() => groupExerciseRows(rows), [rows])

  const backToScheda = () => {
    if (workoutsPane && planId) {
      workoutsPane.navigateTo({ kind: 'scheda', workoutPlanId: planId })
      return
    }
    router.push(`${pathBase}/${planId}`)
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <AllenamentiPageHeader onBack={backToScheda} />
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-4 pb-32 safe-area-inset-bottom sm:px-4 sm:pt-5 min-[834px]:px-6 min-[834px]:pb-28 min-[834px]:pt-6" />
      </div>
    )
  }

  if (error || !planId || !dayId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <AllenamentiPageHeader onBack={() => router.push(pathBase)} />
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-4 pb-32 safe-area-inset-bottom sm:px-4 sm:pt-5 min-[834px]:px-6 min-[834px]:pb-28 min-[834px]:pt-6">
          <p className="pt-2 text-sm text-text-secondary">{error ?? 'Contenuto non disponibile'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <AllenamentiPageHeader
        title={dayLabel}
        subtitle={planName}
        onBack={backToScheda}
        withBottomMargin
      />
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-4 pb-32 safe-area-inset-bottom sm:px-4 sm:pt-5 min-[834px]:px-6 min-[834px]:pb-28 min-[834px]:pt-6">
        <div className="mx-auto w-full max-w-lg space-y-5 sm:space-y-6 min-[1100px]:max-w-3xl">
          <p className="text-xs leading-relaxed text-text-secondary sm:mb-0.5 sm:text-sm">
            Controlla esercizi e serie; quando sei pronto avvia l&apos;allenamento.
          </p>

          {rows.length === 0 ? (
            <Card className={`${CARD_DS} border-dashed`}>
              <CardContent className="p-4 sm:p-5">
                <p className="text-sm text-text-secondary">Nessun esercizio in questo giorno.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {blocks.map((block, bi) => {
                if (block.kind === 'circuit') {
                  return (
                    <Card key={`c-${bi}`} className={`relative overflow-hidden ${CARD_DS}`}>
                      <CardContent className="relative z-10 space-y-2 p-4 sm:p-5">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-400">
                          <Layers className="h-3.5 w-3.5" />
                          Circuito
                        </div>
                        <ul className="space-y-2.5">
                          {block.rows.map((r) => {
                            const name = r.exercises?.name?.trim() || 'Esercizio'
                            const mg = r.exercises?.muscle_group?.trim()
                            const desc = r.exercises?.description?.trim() ?? ''
                            const detailHref = r.exercises?.id
                              ? workoutsPane
                                ? workoutsPane.hrefFor({
                                    kind: 'esercizio',
                                    exerciseId: r.exercises.id,
                                  })
                                : `${pathBase}/esercizio/${r.exercises.id}?planId=${encodeURIComponent(planId)}`
                              : null
                            const isOpen = expandedRowIds.has(r.id)
                            const canAct = Boolean(desc) || Boolean(detailHref)
                            return (
                              <li
                                key={r.id}
                                className={`flex flex-col border-b border-white/5 pb-3 last:border-0 last:pb-0 ${canAct ? `cursor-pointer touch-manipulation active:opacity-90 ${INTERACTIVE_FOCUS}` : ''}`}
                                onClick={() => {
                                  if (desc) toggleRowExpanded(r.id)
                                  else if (detailHref) void router.push(detailHref)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== 'Enter' && e.key !== ' ') return
                                  e.preventDefault()
                                  if (desc) toggleRowExpanded(r.id)
                                  else if (detailHref) void router.push(detailHref)
                                }}
                                tabIndex={canAct ? 0 : undefined}
                                role={canAct ? 'button' : undefined}
                                aria-expanded={desc ? isOpen : undefined}
                              >
                                <div className="flex gap-2.5 sm:gap-3">
                                  <ExercisePreviewMedia
                                    exercise={r.exercises}
                                    name={name}
                                    href={null}
                                    compact
                                  />
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex min-w-0 items-start justify-between gap-2">
                                      <span className="min-w-0 text-sm font-medium text-cyan-400">
                                        {name}
                                      </span>
                                      <span className="shrink-0 tabular-nums text-xs text-text-secondary">
                                        {formatTargets(r)}
                                      </span>
                                    </div>
                                    {mg ? (
                                      <span className="text-[11px] text-text-tertiary">{mg}</span>
                                    ) : null}
                                    {r.note?.trim() ? (
                                      <p className="text-[11px] text-text-tertiary">
                                        {r.note.trim()}
                                      </p>
                                    ) : null}
                                    {r.rest_timer_sec != null && r.rest_timer_sec > 0 ? (
                                      <p className="text-[11px] text-text-tertiary">
                                        Recupero indicativo: {r.rest_timer_sec}s
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                                {isOpen && desc ? (
                                  <ExerciseExecutionExpand
                                    description={desc}
                                    detailHref={detailHref}
                                  />
                                ) : null}
                              </li>
                            )
                          })}
                        </ul>
                      </CardContent>
                    </Card>
                  )
                }

                const r = block.rows[0]
                const name = r.exercises?.name?.trim() || 'Esercizio'
                const mg = r.exercises?.muscle_group?.trim()
                const desc = r.exercises?.description?.trim() ?? ''
                const detailHref = r.exercises?.id
                  ? workoutsPane
                    ? workoutsPane.hrefFor({ kind: 'esercizio', exerciseId: r.exercises.id })
                    : `${pathBase}/esercizio/${r.exercises.id}?planId=${encodeURIComponent(planId)}`
                  : null
                const isOpen = expandedRowIds.has(r.id)
                const canAct = Boolean(desc) || Boolean(detailHref)

                return (
                  <Card
                    key={r.id}
                    className={`relative overflow-hidden ${CARD_DS} ${canAct ? `cursor-pointer touch-manipulation active:opacity-90 ${INTERACTIVE_FOCUS}` : ''}`}
                    onClick={() => {
                      if (desc) toggleRowExpanded(r.id)
                      else if (detailHref) void router.push(detailHref)
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return
                      e.preventDefault()
                      if (desc) toggleRowExpanded(r.id)
                      else if (detailHref) void router.push(detailHref)
                    }}
                    tabIndex={canAct ? 0 : undefined}
                    role={canAct ? 'button' : undefined}
                    aria-expanded={desc ? isOpen : undefined}
                  >
                    <CardContent className="relative z-10 p-4 sm:p-5">
                      <div className="flex gap-3 sm:gap-4">
                        <ExercisePreviewMedia exercise={r.exercises} name={name} href={null} />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex min-w-0 items-start justify-between gap-2">
                            <span className="min-w-0 text-sm font-semibold text-cyan-400 sm:text-base">
                              {name}
                            </span>
                            <span className="shrink-0 tabular-nums text-xs text-text-secondary sm:text-sm">
                              {formatTargets(r)}
                            </span>
                          </div>
                          {mg ? <p className="text-xs text-text-tertiary">{mg}</p> : null}
                          {r.note?.trim() ? (
                            <p className="text-xs text-text-tertiary">{r.note.trim()}</p>
                          ) : null}
                          {r.rest_timer_sec != null && r.rest_timer_sec > 0 ? (
                            <p className="text-[11px] text-text-tertiary">
                              Recupero indicativo: {r.rest_timer_sec}s
                            </p>
                          ) : null}
                        </div>
                      </div>
                      {isOpen && desc ? (
                        <ExerciseExecutionExpand description={desc} detailHref={detailHref} />
                      ) : null}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="pt-4 pb-2 sm:pt-5 sm:pb-3">
            <Button
              asChild
              className="h-12 min-h-[48px] w-full gap-2 touch-manipulation rounded-xl bg-cyan-500 text-sm font-semibold text-white hover:bg-cyan-400"
            >
              <Link
                href={startHref}
                prefetch={true}
                onClick={(e) => {
                  if (!workoutsPane || !planId || !dayId) return
                  e.preventDefault()
                  workoutsPane.navigateTo({ kind: 'oggi', workoutPlanId: planId, dayId })
                }}
              >
                <Play className="h-4 w-4" />
                Inizia allenamento
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GiornoPreviewPage() {
  return (
    <Suspense fallback={null}>
      <GiornoPreviewContent />
    </Suspense>
  )
}
