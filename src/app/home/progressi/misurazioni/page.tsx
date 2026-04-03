'use client'

import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { PageHeaderFixed } from '@/components/layout'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useProgressAnalytics } from '@/hooks/use-progress-analytics'
import { Plus, Scale } from 'lucide-react'
import Link from 'next/link'
import { MisurazioniValuesContent } from '@/components/progressi/misurazioni-values-content'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

const SCROLL_CONTAINER_STYLE = { minHeight: 'calc(100dvh - var(--nav-height, 56px))' } as const

function MisurazioniContent() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const isValidUserProfile = user && isValidProfile(user)
  const isValidUser = isValidUserProfile && !loading

  const athleteId = useMemo(() => {
    if (!isValidUserProfile || !user?.user_id) {
      return undefined
    }
    return isValidUUID(user.user_id) ? user.user_id : undefined
  }, [isValidUserProfile, user])

  const { data: progressData, isLoading: progressLoading, error } = useProgressAnalytics(athleteId)
  const handleBack = useCallback(() => router.back(), [router])

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
              <div className="mb-3 text-4xl opacity-50">[ ]</div>
              <p className="text-text-secondary text-sm min-[834px]:text-base font-medium">
                Caricamento...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isValidUser) {
    return null
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div
        className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24"
        style={SCROLL_CONTAINER_STYLE}
      >
        <PageHeaderFixed
          variant="chat"
          title="Dashboard Misurazioni"
          subtitle="Grafici e analisi dei tuoi progressi"
          onBack={handleBack}
        />

        <Link href="/home/progressi/nuovo" className="block w-full">
          <Button
            className="w-full min-h-[44px] gap-1.5 h-10 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            Nuova Misurazione
          </Button>
        </Link>

        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardHeader className="relative z-10 border-b border-white/10 px-4 pb-3 pt-4 min-[834px]:px-5 min-[834px]:pt-5 min-[834px]:pb-4">
            <CardTitle className="text-base font-bold text-text-primary md:text-lg">
              Tutti i valori
            </CardTitle>
            <p className="text-text-tertiary mt-0.5 text-xs">
              Posizione dei valori nel range di riferimento
            </p>
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-3 min-[834px]:p-5 min-[834px]:pt-4">
            {progressLoading ? (
              <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center">
                <div className="mb-3 text-4xl opacity-50">[ ]</div>
                <p className="text-text-secondary text-sm min-[834px]:text-base font-medium">
                  Caricamento dati...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center px-4">
                <div className="mb-3 text-4xl opacity-50">!</div>
                <p className="text-text-primary text-sm min-[834px]:text-base font-medium">
                  Errore nel caricamento
                </p>
                <p className="text-text-tertiary text-xs min-[834px]:text-sm mt-1.5 line-clamp-2">
                  {error instanceof Error ? error.message : String(error)}
                </p>
              </div>
            ) : !progressData ? (
              <div className="flex flex-col items-center justify-center py-10 min-[834px]:py-12 text-center px-4">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 min-[834px]:h-16 min-[834px]:w-16">
                  <Scale className="h-7 w-7 text-cyan-400 min-[834px]:h-8 min-[834px]:w-8" />
                </div>
                <p className="text-text-primary text-sm font-semibold min-[834px]:text-base">
                  Nessun dato disponibile
                </p>
                <p className="text-text-tertiary mt-1 text-xs min-[834px]:text-sm">
                  Inizia a registrare le tue misurazioni
                </p>
                <Link href="/home/progressi/nuovo" className="mt-4 inline-block w-full max-w-xs">
                  <Button
                    className="w-full min-h-[44px] gap-1.5 h-10 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    variant="default"
                  >
                    <Plus className="h-4 w-4" />
                    Prima Misurazione
                  </Button>
                </Link>
              </div>
            ) : (
              <MisurazioniValuesContent
                data={progressData}
                measurementDetailBasePath="/home/progressi/misurazioni"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MisurazioniPage() {
  return (
    <Suspense fallback={null}>
      <MisurazioniContent />
    </Suspense>
  )
}
