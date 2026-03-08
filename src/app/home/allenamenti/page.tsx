'use client'

import { Suspense, useCallback, useMemo, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { TrendingUp, Award, Activity } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import { AllenamentiPageHeader } from './AllenamentiPageHeader'
import { AllenamentoOggiCard } from './AllenamentoOggiCard'
import { WorkoutPlanCard } from './WorkoutPlanCard'
import { useAllenamenti } from '@/hooks/use-allenamenti'
import { useWorkouts } from '@/hooks/use-workouts'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { useNormalizedRole, toLegacyRole } from '@/lib/utils/role-normalizer'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useSupabaseClient } from '@/hooks/use-supabase-client'

const logger = createLogger('app:home:allenamenti:page')

// Funzione helper per formattare la data in italiano
function formatAppointmentDate(dateString: string): { day: string; time: string } {
  try {
    // Gestisce sia DATE che TIMESTAMP
    const date = new Date(dateString)

    // Verifica che la data sia valida
    if (isNaN(date.getTime())) {
      return { day: 'Data non valida', time: '' }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const appointmentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    let day: string
    if (appointmentDay.getTime() === today.getTime()) {
      day = 'Oggi'
    } else if (appointmentDay.getTime() === tomorrow.getTime()) {
      day = 'Domani'
    } else {
      day = date.toLocaleDateString('it-IT', { weekday: 'long' })
      day = day.charAt(0).toUpperCase() + day.slice(1)
    }

    // Se la data ha un'ora, mostra l'ora, altrimenti mostra solo la data
    const hasTime = dateString.includes('T') || dateString.includes(' ')
    const time = hasTime
      ? date.toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : ''

    return { day, time }
  } catch (err) {
    logger.warn('Errore formattazione data', err, { dateString })
    return { day: 'Data non valida', time: '' }
  }
}

// Funzione per calcolare lo streak (giorni consecutivi con allenamenti completati)
function calculateStreak(allenamenti: Array<{ data: string; stato: string }>): number {
  if (!allenamenti || allenamenti.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const completedDates = new Set<string>()

  // Raccogli tutte le date con allenamenti completati
  allenamenti
    .filter((a) => a.stato === 'completato')
    .forEach((a) => {
      try {
        const date = new Date(a.data)
        if (isNaN(date.getTime())) return
        date.setHours(0, 0, 0, 0)
        completedDates.add(date.toISOString())
      } catch {
        // Ignora date non valide
      }
    })

  // Conta giorni consecutivi partendo da oggi/ieri
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    checkDate.setHours(0, 0, 0, 0)
    const dateKey = checkDate.toISOString()

    if (completedDates.has(dateKey)) {
      streak++
    } else if (streak > 0) {
      // Se abbiamo già uno streak e questo giorno non ha allenamenti, interrompi
      break
    }
  }

  return streak
}

/** Calcola statistiche da workout logs (funzione pura per useMemo). */
function computeStatsFromLogs(workoutLogs: Array<{ data?: string; stato?: string; volume_totale?: number | null }>) {
  if (!workoutLogs || workoutLogs.length === 0) {
    return { settimana: 0, mese: 0, streak: 0, volume_medio: 0 }
  }
  const validLogs = workoutLogs.filter((log) => {
    if (!log.data) return false
    try {
      const date = new Date(log.data)
      if (isNaN(date.getTime())) return false
    } catch {
      return false
    }
    if (log.volume_totale != null) {
      if (isNaN(log.volume_totale) || log.volume_totale < 0) return false
    }
    return true
  })
  if (validLogs.length === 0) {
    return { settimana: 0, mese: 0, streak: 0, volume_medio: 0 }
  }
  const completati = validLogs.filter((a) => a.stato === 'completato')
  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const settimanaFa = new Date(oggi)
  settimanaFa.setDate(settimanaFa.getDate() - 7)
  const meseFa = new Date(oggi)
  meseFa.setMonth(meseFa.getMonth() - 1)
  const questaSettimana = completati.filter((a) => {
    try {
      const data = new Date(a.data!)
      return !isNaN(data.getTime()) && data >= settimanaFa
    } catch {
      return false
    }
  }).length
  const questoMese = completati.filter((a) => {
    try {
      const data = new Date(a.data!)
      return !isNaN(data.getTime()) && data >= meseFa
    } catch {
      return false
    }
  }).length
  const streak = calculateStreak(validLogs as { data: string; stato: string }[])
  const completatiConVolume = completati.filter(
    (a) => a.volume_totale != null && !isNaN(a.volume_totale) && a.volume_totale >= 0,
  )
  const volumeMedio =
    completatiConVolume.length > 0
      ? Math.round(
          completatiConVolume.reduce((sum, a) => sum + (a.volume_totale || 0), 0) /
            completatiConVolume.length,
        )
      : 0
  return { settimana: questaSettimana, mese: questoMese, streak, volume_medio: volumeMedio }
}

/** Organizza logs in oggi / programmati / completati (funzione pura per useMemo). */
function organizeWorkoutLogs(
  workoutLogs: Array<{
    id: string
    data?: string
    stato?: string
    scheda_nome?: string | null
    note?: string | null
    durata_minuti?: number | null
    esercizi_totali?: number | null
    esercizi_completati?: number | null
    volume_totale?: number | null
    trainer_name?: string | null
  }>,
) {
  if (!workoutLogs || workoutLogs.length === 0) {
    return { oggi: null, programmati: [], completati: [] }
  }
  const validLogs = workoutLogs.filter((log): log is typeof log & { data: string; stato: string } => {
    try {
      if (typeof log.data !== 'string' || typeof log.stato !== 'string') return false
      const date = new Date(log.data)
      return !isNaN(date.getTime())
    } catch {
      return false
    }
  })
  if (validLogs.length === 0) {
    return { oggi: null, programmati: [], completati: [] }
  }
  const oggi = new Date()
  oggi.setHours(0, 0, 0, 0)
  const oggiEnd = new Date(oggi)
  oggiEnd.setHours(23, 59, 59, 999)
  const allenamentoOggi = validLogs.find((a) => {
    try {
      const data = new Date(a.data!)
      if (isNaN(data.getTime())) return false
      data.setHours(0, 0, 0, 0)
      return data.getTime() === oggi.getTime() && (a.stato === 'programmato' || a.stato === 'in_corso')
    } catch {
      return false
    }
  })
  const programmati = validLogs
    .filter((a) => {
      try {
        const data = new Date(a.data!)
        if (isNaN(data.getTime())) return false
        return data > oggiEnd && a.stato === 'programmato'
      } catch {
        return false
      }
    })
    .slice(0, 5)
  const completati = validLogs
    .filter((a) => a.stato === 'completato')
    .sort((a, b) => {
      try {
        const dateA = new Date(a.data!).getTime()
        const dateB = new Date(b.data!).getTime()
        if (isNaN(dateA) || isNaN(dateB)) return 0
        return dateB - dateA
      } catch {
        return 0
      }
    })
    .slice(0, 5)
  return {
    oggi: allenamentoOggi
      ? {
          id: allenamentoOggi.id,
          titolo: allenamentoOggi.scheda_nome || 'Allenamento',
          descrizione: allenamentoOggi.note || 'Sessione di allenamento',
          durata: allenamentoOggi.durata_minuti || 60,
          esercizi_totali: allenamentoOggi.esercizi_totali || 0,
          esercizi_completati: allenamentoOggi.esercizi_completati || 0,
          pt: allenamentoOggi.trainer_name || 'Trainer',
          orario: formatAppointmentDate(allenamentoOggi.data!).time,
        }
      : null,
    programmati: programmati.map((a) => {
      const { day, time } = formatAppointmentDate(a.data!)
      return {
        id: a.id,
        titolo: a.scheda_nome || 'Allenamento',
        data: day,
        orario: time,
        durata: a.durata_minuti || 60,
        esercizi: a.esercizi_totali || 0,
        pt: a.trainer_name || 'Trainer',
      }
    }),
    completati: completati.map((a) => ({
      id: a.id,
      titolo: a.scheda_nome || 'Allenamento',
      data: a.data!,
      durata: a.durata_minuti || 0,
      esercizi_completati: a.esercizi_completati || 0,
      esercizi_totali: a.esercizi_totali || 0,
      volume: a.volume_totale || 0,
      note: a.note || '',
    })),
  }
}

function AllenamentiLoadingSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4">
        <div className="animate-pulse">
          <div className="h-12 w-56 bg-background-tertiary rounded-xl mb-4" />
          <div className="grid grid-cols-2 min-[834px]:grid-cols-4 gap-2.5 min-[834px]:gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-background-tertiary rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-background-tertiary rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function AllenamentiHomePageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const [oggiMedia, setOggiMedia] = useState<{
    video_url: string | null
    thumb_url: string | null
    image_url: string | null
  } | null>(null)
  const [trainerAvatarUrl, setTrainerAvatarUrl] = useState<string | null>(null)

  // Type guard per user
  const isValidUser = user && isValidProfile(user)

  // Helper per ID mapping: chiarisce quale ID usare per ogni query
  // profileId = profiles.id (corretto per workout_logs.atleta_id)
  // NOTA: Tutti gli hooks devono essere chiamati prima di qualsiasi early return
  const profileId = useMemo(() => {
    if (!isValidUser || !user?.id) return null
    return isValidUUID(user.id) ? user.id : null
  }, [user?.id, isValidUser]) // profiles.id

  // Normalizza il ruolo usando utility function centralizzata
  const normalizedRoleRaw = useNormalizedRole(user?.role)
  // Converte in formato legacy per compatibilità
  const normalizedRole = useMemo(() => {
    return toLegacyRole(normalizedRoleRaw)
  }, [normalizedRoleRaw])

  // Carica avatar del trainer assegnato (per card motivazionale)
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    supabase
      .rpc('get_my_trainer_profile')
      .then((res: { data: unknown; error: unknown }) => {
        const { data, error } = res
        if (cancelled) return
        if (error || !Array.isArray(data) || data.length === 0) return
        const row = data[0] as { pt_avatar_url?: string | null }
        const url = row?.pt_avatar_url ?? null
        if (url && typeof url === 'string') setTrainerAvatarUrl(url)
      })
    return () => {
      cancelled = true
    }
  }, [user?.id, supabase])

  // Stabilizza filters per evitare re-fetch continui
  // Usa profileId (profiles.id) per workout_logs.atleta_id
  const stableFilters = useMemo(
    () => ({
      atleta_id: profileId, // ✅ Corretto: workout_logs.atleta_id = profiles.id
      stato: 'tutti' as const,
    }),
    [profileId],
  )

  // Recupera workout logs (allenamenti)
  const {
    allenamenti: workoutLogs,
    loading: allenamentiLoading,
    error: allenamentiError,
    refresh: refreshAllenamenti,
  } = useAllenamenti(stableFilters)

  // Recupera workout plans attivi (schede di allenamento)
  const {
    workouts,
    loading: workoutsLoading,
    error: workoutsError,
    refetch: refetchWorkouts,
  } = useWorkouts({
    userId: profileId,
    role: normalizedRole,
  })

  const refreshAllenamentiRef = useRef(refreshAllenamenti)
  const refetchWorkoutsRef = useRef(refetchWorkouts)
  refreshAllenamentiRef.current = refreshAllenamenti
  refetchWorkoutsRef.current = refetchWorkouts

  useEffect(() => {
    if (!profileId) return
    refreshAllenamentiRef.current()
    refetchWorkoutsRef.current()
  }, [profileId])

  const stats = useMemo(() => computeStatsFromLogs(workoutLogs ?? []), [workoutLogs])

  const handleBack = useCallback(() => router.push('/home'), [router])
  const handleStartOggi = useCallback(() => router.push('/home/allenamenti/oggi'), [router])

  // Recupera media (video/thumbnail) per l'allenamento di oggi
  useEffect(() => {
    let cancelled = false
    const fetchOggiMedia = async () => {
      if (!workoutLogs || workoutLogs.length === 0) {
        if (!cancelled) setOggiMedia(null)
        return
      }

      const oggi = new Date()
      oggi.setHours(0, 0, 0, 0)

      const allenamentoOggi = workoutLogs.find((a) => {
        try {
          const data = new Date(a.data)
          if (isNaN(data.getTime())) return false
          data.setHours(0, 0, 0, 0)
          return (
            data.getTime() === oggi.getTime() && (a.stato === 'programmato' || a.stato === 'in_corso')
          )
        } catch {
          return false
        }
      })

      if (!allenamentoOggi?.scheda_id) {
        if (!cancelled) setOggiMedia(null)
        return
      }

      try {
        // Recupera il primo esercizio del workout plan per ottenere video/thumbnail
        const { data: workoutDay, error: dayError } = await supabase
          .from('workout_days')
          .select('id')
          .eq('workout_plan_id', allenamentoOggi.scheda_id)
          .order('day_number', { ascending: true })
          .limit(1)
          .single()

        if (cancelled) return
        if (dayError || !workoutDay) {
          setOggiMedia(null)
          return
        }

        const workoutDayId = (workoutDay as { id?: string })?.id
        if (!workoutDayId) {
          setOggiMedia(null)
          return
        }

        const { data: exercise, error: exerciseError } = await supabase
          .from('workout_day_exercises')
          .select('exercise_id')
          .eq('workout_day_id', workoutDayId)
          .order('order_index', { ascending: true })
          .limit(1)
          .single()

        if (cancelled) return
        if (exerciseError || !exercise) {
          setOggiMedia(null)
          return
        }

        const exerciseId = (exercise as { exercise_id?: string })?.exercise_id
        if (!exerciseId) {
          setOggiMedia(null)
          return
        }

        const { data: exerciseDetails, error: detailsError } = await supabase
          .from('exercises')
          .select('video_url, thumb_url, image_url')
          .eq('id', exerciseId)
          .single()

        if (cancelled) return
        if (detailsError || !exerciseDetails) {
          setOggiMedia(null)
          return
        }

        setOggiMedia({
          video_url: (exerciseDetails as { video_url?: string | null })?.video_url ?? null,
          thumb_url: (exerciseDetails as { thumb_url?: string | null })?.thumb_url ?? null,
          image_url: (exerciseDetails as { image_url?: string | null })?.image_url ?? null,
        })
      } catch (error) {
        if (!cancelled) {
          logger.warn('Errore recupero media allenamento oggi', error, {
            scheda_id: allenamentoOggi.scheda_id,
          })
          setOggiMedia(null)
        }
      }
    }

    fetchOggiMedia()
    return () => {
      cancelled = true
    }
  }, [workoutLogs, supabase])

  const organizedAllenamenti = useMemo(
    () => organizeWorkoutLogs(workoutLogs ?? []),
    [workoutLogs],
  )

  const workoutsAttivi = useMemo(
    () => (workouts ?? []).filter((w) => w.status === 'attivo'),
    [workouts],
  )

  const handleVideoPlay = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    e.currentTarget.play().catch(() => {})
  }, [])
  const handleVideoPause = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    video.pause()
    video.currentTime = 0
  }, [])
  const handleVideoError = useCallback(() => setOggiMedia(null), [])

  // Una sola notifica per tipo di errore (evita toast multipli da re-render/remount)
  const lastNotifiedAllenamentiRef = useRef<string | null>(null)
  const lastNotifiedWorkoutsRef = useRef<string | null>(null)

  useEffect(() => {
    if (!allenamentiError) {
      lastNotifiedAllenamentiRef.current = null
      return
    }
    const errorMessage =
      (allenamentiError as unknown) instanceof Error
        ? (allenamentiError as Error).message
        : String(allenamentiError)
    if (lastNotifiedAllenamentiRef.current === errorMessage) return
    lastNotifiedAllenamentiRef.current = errorMessage
    logger.warn('Errore nel caricamento allenamenti', allenamentiError, {
      profileId: user?.id,
      userId: user?.user_id,
    })
    notifyError('Errore nel caricamento allenamenti', errorMessage)
  }, [allenamentiError, user?.id, user?.user_id])

  useEffect(() => {
    if (!workoutsError) {
      lastNotifiedWorkoutsRef.current = null
      return
    }
    const errorMessage =
      typeof workoutsError === 'string'
        ? workoutsError
        : 'Errore sconosciuto nel caricamento delle schede allenamento'
    if (lastNotifiedWorkoutsRef.current === errorMessage) return
    lastNotifiedWorkoutsRef.current = errorMessage
    logger.warn('Errore nel caricamento workout plans', workoutsError, {
      profileId: user?.id,
      userId: user?.user_id,
    })
    notifyError('Errore nel caricamento schede allenamento', errorMessage)
  }, [workoutsError, user?.id, user?.user_id])

  // Loading state per i dati
  const showDataLoading = allenamentiLoading || workoutsLoading

  if (!user || !isValidUser) {
    return <AllenamentiLoadingSkeleton />
  }

  if (showDataLoading) {
    return <AllenamentiLoadingSkeleton />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-72 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
        <AllenamentiPageHeader onBack={handleBack} />

        <div className="grid grid-cols-2 min-[834px]:grid-cols-4 gap-2.5 min-[834px]:gap-4">
          <Card className="relative overflow-hidden border border-cyan-500/30 bg-background-secondary/50 backdrop-blur-sm p-3">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-cyan-500/40" />
            <CardContent className="p-0 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
                <Activity className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Questa settimana</div>
                <div className="text-base font-bold text-cyan-400 leading-tight">{stats.settimana}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden border border-cyan-500/30 bg-background-secondary/50 backdrop-blur-sm p-3">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-cyan-500/40" />
            <CardContent className="p-0 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wide text-text-tertiary">Questo mese</div>
                <div className="text-base font-bold text-cyan-400 leading-tight">{stats.mese}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {organizedAllenamenti.oggi && (
          <AllenamentoOggiCard
            oggi={organizedAllenamenti.oggi}
            oggiMedia={oggiMedia}
            onStart={handleStartOggi}
            onVideoPlay={handleVideoPlay}
            onVideoPause={handleVideoPause}
            onVideoError={handleVideoError}
          />
        )}

        {workoutsAttivi.length > 0 && (
          <div>
            <h2 className="text-text-primary mb-2.5 text-base min-[834px]:text-lg font-semibold">Schede Assegnate</h2>
            <div className="space-y-2.5 min-[834px]:space-y-3">
              {workoutsAttivi.map((workout) => (
                <WorkoutPlanCard key={workout.id} workout={workout} />
              ))}
            </div>
          </div>
        )}

        <Card className="fixed inset-x-0 bottom-0 z-20 overflow-hidden rounded-t-xl border-0 bg-background-secondary/50 backdrop-blur-sm px-3 sm:px-4 min-[834px]:px-6 pb-[env(safe-area-inset-bottom)]">
          <CardContent className="p-4 min-[834px]:p-5 text-center">
            <div className="mb-2 min-[834px]:mb-2.5 flex justify-center">
              {trainerAvatarUrl ? (
                <div className="relative h-12 w-12 min-[834px]:h-14 min-[834px]:w-14 overflow-hidden rounded-full border-2 border-cyan-500/40">
                  <Image src={trainerAvatarUrl} alt="Il tuo trainer" fill className="object-cover" sizes="(min-width: 834px) 56px, 48px" unoptimized={trainerAvatarUrl.startsWith('http')} />
                </div>
              ) : (
                <div className="text-2xl animate-bounce">🏆</div>
              )}
            </div>
            <h3 className="text-text-primary mb-1 text-base min-[834px]:text-lg font-semibold">Ottimo lavoro questa settimana!</h3>
            <p className="text-text-secondary mb-2 text-xs min-[834px]:text-sm">
              Hai completato <span className="text-cyan-400 font-bold">{stats.settimana}</span> allenamenti. Continua così!
            </p>
            <Link href="/home/progressi" prefetch={true} className="inline-block w-full">
              <Button variant="outline" size="sm" className="min-h-[44px] h-9 min-[834px]:h-10 text-xs min-[834px]:text-sm w-full rounded-xl border border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/10">
                <Award className="mr-1.5 h-3.5 w-3.5" />
                Vedi i tuoi progressi
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AllenamentiHomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 flex-col bg-background">
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4">
            <div className="animate-pulse">
              <div className="h-12 w-56 bg-background-tertiary rounded-xl mb-4" />
              <div className="grid grid-cols-2 min-[834px]:grid-cols-4 gap-2.5 min-[834px]:gap-3 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-background-tertiary rounded-xl" />
                ))}
              </div>
              <div className="h-64 bg-background-tertiary rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      <AllenamentiHomePageContent />
    </Suspense>
  )
}
