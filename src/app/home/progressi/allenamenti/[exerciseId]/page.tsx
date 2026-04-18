'use client'

import Link from 'next/link'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Dumbbell, Lock, Unlock } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { PageHeaderFixed } from '@/components/layout'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useAuth } from '@/providers/auth-provider'
import { WorkoutExerciseStoricoContent } from '@/components/progressi/workout-exercise-storico-content'
import { useWorkoutExerciseStats } from '@/hooks/use-workout-exercise-stats'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

const SCROLL_CONTAINER_STYLE = { minHeight: 'calc(100dvh - var(--nav-height, 56px))' } as const

function StoricoAllenamentoEsercizioContent() {
  const router = useRouter()
  const params = useParams()
  const rawExerciseId = typeof params?.exerciseId === 'string' ? params.exerciseId : ''
  const exerciseId = useMemo(() => {
    try {
      return decodeURIComponent(rawExerciseId)
    } catch {
      return rawExerciseId
    }
  }, [rawExerciseId])

  const { user, loading } = useAuth()
  const isValidUserProfile = user && isValidProfile(user)
  const isValidUser = isValidUserProfile && !loading

  const athleteUserId = useMemo(() => {
    if (!isValidUserProfile || !user?.user_id) return null
    return isValidUUID(user.user_id) ? user.user_id : null
  }, [isValidUserProfile, user?.user_id])

  const { data: statsData } = useWorkoutExerciseStats(athleteUserId)
  const [editUnlocked, setEditUnlocked] = useState(false)

  const exerciseTitle = useMemo(() => {
    if (!exerciseId) return 'Storico esercizio'
    return (
      statsData?.exercises.find((e) => e.exercise_id === exerciseId)?.exercise_name?.trim() ||
      'Storico esercizio'
    )
  }, [exerciseId, statsData?.exercises])

  const handleBack = useCallback(() => router.push('/home/progressi/allenamenti'), [router])

  useEffect(() => {
    if (!loading && !isValidUser) {
      router.push('/login')
    }
  }, [isValidUser, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:px-6">
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <CardContent className="p-8 min-[834px]:p-12 text-center">
              <p className="text-text-secondary text-sm font-medium">Caricamento...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isValidUser) {
    return null
  }

  if (!exerciseId) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div
          className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6"
          style={SCROLL_CONTAINER_STYLE}
        >
          <PageHeaderFixed
            variant="chat"
            title="Esercizio"
            subtitle="Parametro non valido"
            onBack={handleBack}
          />
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-text-secondary text-sm">Esercizio non trovato.</p>
              <Link href="/home/progressi/allenamenti">
                <Button variant="outline" className="mt-2">
                  Torna ai grafici
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div
        className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6"
        style={SCROLL_CONTAINER_STYLE}
      >
        <PageHeaderFixed
          variant="chat"
          title={exerciseTitle}
          subtitle="Valori per sessione"
          onBack={handleBack}
        />

        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardHeader className="relative z-10 border-b border-white/10 px-4 pb-3 pt-4 min-[834px]:px-5 min-[834px]:pt-5 min-[834px]:pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <CardTitle className="text-base font-bold text-text-primary md:text-lg flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                  Andamento
                </CardTitle>
                <p className="text-text-tertiary text-xs">
                  Dal più recente. Valori da serie registrate sul log (peso/reps/tempo); massimo per
                  giorno.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-text-secondary hover:text-primary"
                aria-pressed={editUnlocked}
                aria-label={
                  editUnlocked
                    ? 'Blocca modifica ed eliminazione voci'
                    : 'Sblocca modifica ed eliminazione voci'
                }
                onClick={() => setEditUnlocked((v) => !v)}
              >
                {editUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-3 min-[834px]:p-5 min-[834px]:pt-4 space-y-6">
            <WorkoutExerciseStoricoContent
              exerciseId={exerciseId}
              athleteUserId={athleteUserId}
              actionsUnlocked={editUnlocked}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function HomeProgressiAllenamentiEsercizioPage() {
  return (
    <Suspense fallback={null}>
      <StoricoAllenamentoEsercizioContent />
    </Suspense>
  )
}
