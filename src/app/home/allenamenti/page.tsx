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
import { WorkoutPlanCard } from './WorkoutPlanCard'
import { useAllenamenti } from '@/hooks/use-allenamenti'
import { useWorkouts } from '@/hooks/use-workouts'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { useNormalizedRole, toLegacyRole } from '@/lib/utils/role-normalizer-client'
import { isValidProfile } from '@/lib/utils/type-guards'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useResolvedAthleteProfileForAllenamenti } from '@/hooks/use-resolved-athlete-profile-for-allenamenti'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'

const logger = createLogger('app:home:allenamenti:page')

const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

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
      // Se abbiamo giÃ  uno streak e questo giorno non ha allenamenti, interrompi
      break
    }
  }

  return streak
}

/** Calcola statistiche da workout logs (funzione pura per useMemo). */
function computeStatsFromLogs(
  workoutLogs: Array<{ data?: string; stato?: string; volume_totale?: number | null }>,
) {
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

export function AllenamentiHomePageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const { isPreview, pathBase } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  const { athleteProfileId, authLoading } = useResolvedAthleteProfileForAllenamenti()
  const [trainerAvatarUrl, setTrainerAvatarUrl] = useState<string | null>(null)

  // Type guard per user
  const isValidUser = user && isValidProfile(user)

  // Normalizza il ruolo usando utility function centralizzata
  const normalizedRoleRaw = useNormalizedRole(user?.role)
  // Converte in formato legacy per compatibilitÃ
  const normalizedRole = useMemo(() => {
    return toLegacyRole(normalizedRoleRaw)
  }, [normalizedRoleRaw])

  // Carica avatar del trainer assegnato (per card motivazionale) — solo vista atleta
  useEffect(() => {
    if (isPreview || !user?.id) return
    let cancelled = false
    supabase.rpc('get_my_trainer_profile').then((res: { data: unknown; error: unknown }) => {
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
  }, [user?.id, supabase, isPreview])

  // Stabilizza filters per evitare re-fetch continui
  // Usa athleteProfileId (profiles.id) per workout_logs.atleta_id
  const stableFilters = useMemo(
    () => ({
      atleta_id: athleteProfileId ?? undefined,
      stato: 'tutti' as const,
    }),
    [athleteProfileId],
  )

  // Recupera workout logs (allenamenti)
  const {
    allenamenti: workoutLogs,
    loading: _allenamentiLoading,
    error: allenamentiError,
  } = useAllenamenti(stableFilters, undefined, { enabled: Boolean(athleteProfileId) })

  // Recupera workout plans attivi (schede di allenamento)
  const {
    workouts,
    loading: _workoutsLoading,
    error: workoutsError,
  } = useWorkouts({
    userId: athleteProfileId,
    role: normalizedRole,
    plansListOnly: true,
    athleteSubjectProfileId: isPreview ? athleteProfileId : null,
  })

  const stats = useMemo(() => computeStatsFromLogs(workoutLogs ?? []), [workoutLogs])

  const handleBack = useCallback(() => {
    if (isPreview) {
      if (workoutsPane) {
        workoutsPane.navigateTo({ kind: 'oggi' })
        return
      }
      router.push(`${pathBase}/oggi`)
      return
    }
    router.push('/home')
  }, [router, isPreview, pathBase, workoutsPane])

  const workoutsAttivi = useMemo(
    () => (workouts ?? []).filter((w) => w.status === 'attivo'),
    [workouts],
  )

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

  if (!user || !isValidUser) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <AllenamentiPageHeader onBack={handleBack} />
        <div className="min-h-0 flex-1" aria-hidden />
      </div>
    )
  }

  if (!athleteProfileId && !authLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <AllenamentiPageHeader onBack={handleBack} />
        <div className="min-h-0 flex-1 overflow-auto px-3 py-4">
          <p className="text-sm text-text-secondary">Profilo atleta non disponibile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <AllenamentiPageHeader onBack={handleBack} />
      <div
        className={
          isPreview
            ? 'min-h-0 flex-1 overflow-auto px-3 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] safe-area-inset-bottom sm:px-4 sm:pt-5 min-[834px]:px-6 min-[834px]:pt-6'
            : 'min-h-0 flex-1 overflow-auto px-3 pb-[calc(9.5rem+env(safe-area-inset-bottom))] safe-area-inset-bottom sm:px-4 min-[834px]:px-6'
        }
      >
        <div
          className={
            isPreview
              ? 'mx-auto w-full max-w-none space-y-4 sm:space-y-6'
              : 'mx-auto w-full max-w-lg space-y-4 sm:space-y-6 min-[1100px]:max-w-3xl'
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            <Card className={`relative overflow-hidden p-3.5 sm:p-4 ${CARD_DS}`}>
              <CardContent className="flex items-center gap-3 p-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Activity className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Questa settimana
                  </div>
                  <div className="text-base font-bold leading-tight text-text-primary">
                    {stats.settimana}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`relative overflow-hidden p-3.5 sm:p-4 ${CARD_DS}`}>
              <CardContent className="flex items-center gap-3 p-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-text-tertiary">
                    Questo mese
                  </div>
                  <div className="text-base font-bold leading-tight text-text-primary">
                    {stats.mese}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {workoutsAttivi.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight text-text-primary sm:text-lg">
                Schede Assegnate
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {workoutsAttivi.map((workout) => (
                  <WorkoutPlanCard key={workout.id} workout={workout} />
                ))}
              </div>
            </div>
          )}
        </div>

        {!isPreview ? (
          <Card className="fixed inset-x-0 bottom-0 z-20 overflow-hidden rounded-t-2xl border-x-0 border-t border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/95 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 min-[834px]:px-5">
            <CardContent className="flex flex-col gap-2.5 p-0 sm:gap-3">
              <div className="mx-auto h-0.5 w-8 rounded-full bg-cyan-400/70" aria-hidden />
              <div className="flex items-center justify-center gap-3 sm:gap-3.5">
                {trainerAvatarUrl ? (
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 sm:h-12 sm:w-12">
                    <Image
                      src={trainerAvatarUrl}
                      alt="Il tuo trainer"
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized={trainerAvatarUrl.startsWith('http')}
                    />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl sm:h-12 sm:w-12">
                    🏆
                  </div>
                )}
                <div className="min-w-0 max-w-[min(100%,20rem)] text-center">
                  {stats.settimana > 0 ? (
                    <>
                      <h3 className="break-words text-sm font-semibold leading-tight text-text-primary sm:text-base">
                        Ottimo lavoro questa settimana!
                      </h3>
                      <p className="break-words mt-0.5 text-[11px] leading-snug text-text-secondary sm:text-xs">
                        Hai completato{' '}
                        <span className="font-bold tabular-nums text-cyan-400">
                          {stats.settimana}
                        </span>{' '}
                        {stats.settimana === 1 ? 'allenamento' : 'allenamenti'}. Continua così!
                      </p>
                    </>
                  ) : (
                    <h3 className="break-words text-sm font-semibold leading-snug text-text-primary sm:text-base">
                      Nessun allenamento questa settimana. Torna in 22 Club per riprendere!
                    </h3>
                  )}
                </div>
              </div>
              <Link
                href="/home/progressi"
                prefetch={true}
                className="block w-full touch-manipulation"
              >
                <Button className="h-10 min-h-[44px] w-full gap-1.5 rounded-xl bg-cyan-500 text-xs font-medium text-white hover:bg-cyan-400 sm:h-10 sm:text-sm">
                  <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Vedi i tuoi progressi
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export default function AllenamentiHomePage() {
  return (
    <Suspense fallback={null}>
      <AllenamentiHomePageContent />
    </Suspense>
  )
}
