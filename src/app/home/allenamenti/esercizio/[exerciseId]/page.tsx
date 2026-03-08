'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import Image from 'next/image'
import { ArrowLeft, Dumbbell, Target, Activity } from 'lucide-react'
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
      .select('id, name, description, video_url, thumb_url, image_url, difficulty, equipment, muscle_group')
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
        <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4">
          <header className="fixed inset-x-0 top-0 z-20 overflow-hidden rounded-b-xl border-b border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg pt-[env(safe-area-inset-top)]">
            <div className="absolute inset-0 rounded-b-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/5" />
            <div className="relative z-10 flex items-center gap-3">
              <Link href={backHref} className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors" aria-label="Indietro">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <Dumbbell className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-semibold text-text-primary truncate">Esercizio</h1>
                <p className="text-xs text-text-tertiary line-clamp-1">Dettaglio esercizio</p>
              </div>
            </div>
          </header>
          <Card className="border border-state-error/50 bg-background-secondary/50">
            <CardContent className="pt-6 min-[834px]:pt-8">
              <p className="text-text-secondary text-sm min-[834px]:text-base">{error ?? 'Esercizio non trovato'}</p>
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
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
        <header className="fixed inset-x-0 top-0 z-20 overflow-hidden rounded-b-xl border-b border-cyan-500/30 bg-background-secondary/80 backdrop-blur-sm p-3 min-[834px]:p-4 shadow-lg pt-[env(safe-area-inset-top)]">
          <div className="absolute inset-0 rounded-b-xl bg-gradient-to-br from-cyan-500/10 via-transparent to-primary/5" />
          <div className="relative z-10 flex items-center gap-3">
            <Link href={backHref} className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors" aria-label="Torna alla scheda">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
              <Dumbbell className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <h1 className="text-text-primary mb-0.5 text-2xl md:text-3xl font-semibold leading-tight line-clamp-2 break-words">
                {exercise.name}
              </h1>
              <p className="text-text-tertiary text-xs min-[834px]:text-sm line-clamp-1">Dettaglio esercizio</p>
            </div>
          </div>
        </header>

        <Card className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-background-secondary/50">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 via-transparent to-primary/10 pointer-events-none" />
          <div className="relative w-full aspect-video bg-black/40 rounded-t-xl overflow-hidden">
            {hasVideo && exercise.video_url ? (
              <video
                src={exercise.video_url}
                poster={posterUrl || undefined}
                className="w-full h-full object-contain"
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
                className="w-full h-full object-contain"
                unoptimized={posterUrl.startsWith('http')}
                sizes="(min-width: 834px) 800px, 100vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-cyan-400/50">
                <Dumbbell className="h-16 w-16 min-[834px]:h-20 min-[834px]:w-20" />
              </div>
            )}
          </div>
          <CardContent className="relative z-10 p-4 min-[834px]:p-6 pt-4 min-[834px]:pt-6 space-y-5 min-[834px]:space-y-6">
            <h2 className="text-text-primary text-lg min-[834px]:text-xl font-semibold leading-tight">{exercise.name}</h2>

          {exercise.description && (
            <section className="space-y-1.5 min-[834px]:space-y-2">
              <h2 className="text-text-tertiary text-xs min-[834px]:text-sm font-medium uppercase tracking-wider">Esecuzione</h2>
              <p className="text-text-secondary text-sm min-[834px]:text-base leading-relaxed whitespace-pre-wrap">
                {exercise.description}
              </p>
            </section>
          )}

          <section className="flex flex-wrap gap-1.5 min-[834px]:gap-2 pt-1">
            {exercise.muscle_group && (
              <Badge variant="info" size="sm" className="text-[10px] min-[834px]:text-xs bg-blue-500/20 text-blue-300 border-blue-500/40">
                <Activity className="h-2.5 w-2.5 min-[834px]:h-3 min-[834px]:w-3 mr-0.5" />
                {exercise.muscle_group}
              </Badge>
            )}
            {exercise.equipment && (
              <Badge variant="warning" size="sm" className="text-[10px] min-[834px]:text-xs bg-amber-500/20 text-amber-300 border-amber-500/40">
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
