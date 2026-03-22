'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { PageHeaderFixed } from '@/components/layout'
import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import Image from 'next/image'
import { Dumbbell, Target, Activity } from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/providers/auth-provider'

type ExerciseRow = {
  id: string
  name: string
  description: string | null
  video_url: string | null
  thumb_url: string | null
  image_url: string | null
  difficulty: string
  equipment: string | null
  muscle_group: string
}

export default function EsercizioDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = useSupabaseClient()
  const { loading: authLoading } = useAuth()
  const exerciseId = typeof params?.exerciseId === 'string' ? params.exerciseId : null
  const planId = searchParams.get('planId')

  const [exercise, setExercise] = useState<ExerciseRow | null>(null)
  const [, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!exerciseId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('exercises')
      .select(
        'id, name, description, video_url, thumb_url, image_url, difficulty, equipment, muscle_group',
      )
      .eq('id', exerciseId)
      .single()
      .then((res: { data: unknown; error: unknown }) => {
        const { data, error: err } = res
        if (cancelled) return
        setLoading(false)
        if (err) {
          setError((err as { message?: string }).message ?? 'Errore')
          setExercise(null)
          return
        }
        setExercise(data as ExerciseRow)
      })
    return () => {
      cancelled = true
    }
  }, [exerciseId, supabase])

  const backHref = planId ? `/home/allenamenti/${planId}` : '/home/allenamenti'

  if (authLoading || !exerciseId) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 flex items-center justify-center">
          <p className="text-text-secondary text-sm">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 pb-24 pt-24 safe-area-inset-bottom sm:px-5 min-[834px]:px-6">
          <PageHeaderFixed
            variant="chat"
            title="Esercizio"
            subtitle="Dettaglio esercizio"
            backHref={backHref}
            icon={<Dumbbell className="h-5 w-5 text-cyan-400" />}
          />
          <Card className="rounded-lg border border-state-error/20 bg-state-error/10">
            <CardContent className="pt-6 sm:pt-8">
              <p className="text-sm text-text-secondary sm:text-base">
                {error ?? 'Esercizio non trovato'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const hasVideo =
    exercise.video_url &&
    typeof exercise.video_url === 'string' &&
    (exercise.video_url.startsWith('http://') || exercise.video_url.startsWith('https://'))
  const posterUrl = exercise.thumb_url || exercise.image_url || null

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 pb-24 pt-24 safe-area-inset-bottom sm:px-5 sm:space-y-5 min-[834px]:px-6">
        <PageHeaderFixed
          variant="chat"
          title={exercise.name}
          subtitle="Dettaglio esercizio"
          backHref={backHref}
          icon={<Dumbbell className="h-5 w-5 text-cyan-400" />}
        />

        <Card className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-black/40">
            {hasVideo && exercise.video_url ? (
              <video
                src={exercise.video_url}
                poster={posterUrl || undefined}
                className="h-full w-full object-contain"
                controls
                playsInline
                preload="metadata"
              />
            ) : posterUrl ? (
              <Image
                src={posterUrl}
                alt=""
                width={800}
                height={450}
                className="h-full w-full object-contain"
                unoptimized={posterUrl.startsWith('http')}
                sizes="(min-width: 834px) 800px, 100vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-lg border border-white/10 bg-white/5 sm:h-24 sm:w-24">
                  <Dumbbell className="h-10 w-10 text-cyan-400 sm:h-12 sm:w-12" />
                </span>
              </div>
            )}
          </div>
          <CardContent className="relative z-10 space-y-5 p-4 pt-4 sm:p-6 sm:space-y-6 sm:pt-6">
            <h2 className="text-lg font-semibold leading-tight text-text-primary sm:text-xl">
              {exercise.name}
            </h2>

            {exercise.description && (
              <section className="space-y-1.5 sm:space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-text-tertiary sm:text-sm">
                  Esecuzione
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary sm:text-base">
                  {exercise.description}
                </p>
              </section>
            )}

            <section className="flex flex-wrap gap-1.5 pt-1 sm:gap-2">
              {exercise.muscle_group && (
                <Badge
                  variant="info"
                  size="sm"
                  className="text-[10px] min-[834px]:text-xs bg-blue-500/20 text-blue-300 border-blue-500/40"
                >
                  <Activity className="h-2.5 w-2.5 min-[834px]:h-3 min-[834px]:w-3 mr-0.5" />
                  {exercise.muscle_group}
                </Badge>
              )}
              {exercise.equipment && (
                <Badge
                  variant="warning"
                  size="sm"
                  className="text-[10px] min-[834px]:text-xs bg-amber-500/20 text-amber-300 border-amber-500/40"
                >
                  {exercise.equipment}
                </Badge>
              )}
              {exercise.difficulty && (
                <Badge
                  variant={
                    exercise.difficulty === 'alta' || exercise.difficulty === 'advanced'
                      ? 'error'
                      : exercise.difficulty === 'bassa' || exercise.difficulty === 'beginner'
                        ? 'success'
                        : 'warning'
                  }
                  size="sm"
                  className="text-[10px] min-[834px]:text-xs"
                >
                  <Target className="h-2.5 w-2.5 min-[834px]:h-3 min-[834px]:w-3 mr-0.5" />
                  {['bassa', 'beginner', 'easy'].includes(exercise.difficulty)
                    ? 'Principiante'
                    : ['alta', 'advanced', 'hard'].includes(exercise.difficulty)
                      ? 'Avanzato'
                      : 'Intermedio'}
                </Badge>
              )}
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
