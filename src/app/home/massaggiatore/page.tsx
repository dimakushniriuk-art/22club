'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { ArrowLeft, Hand, Calendar, Sparkles, TrendingUp } from 'lucide-react'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import dynamic from 'next/dynamic'

const logger = createLogger('app:home:massaggiatore:page')

// Dynamic import per il componente massaggio
const AthleteMassageTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteMassageTab,
    })),
  {
    ssr: false,
    loading: () => <LoadingState message="Caricamento massaggi..." size="md" />,
  },
)

function MassaggiatorePageContent() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Type guard per user
  const isValidUser = user && isValidProfile(user)

  // Helper per ID mapping: user_id = profiles.user_id
  const athleteUserId = useMemo(() => {
    if (!isValidUser || !user?.user_id) return null
    return isValidUUID(user.user_id) ? user.user_id : null
  }, [user?.user_id, isValidUser])

  // Redirect se non autenticato (dopo che authLoading è false)
  useEffect(() => {
    if (!authLoading && !isValidUser) {
      logger.warn('Utente non autenticato, redirect a /login')
      router.push('/login')
    }
  }, [authLoading, isValidUser, router])

  // Loading state
  if (authLoading) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <LoadingState message="Caricamento..." size="md" />
      </div>
    )
  }

  // Error state - utente non valido
  if (!isValidUser || !athleteUserId) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <ErrorState
          title="Errore di autenticazione"
          message="Non hai i permessi per accedere a questa pagina."
        />
        <div className="flex justify-center mt-4">
          <Button onClick={() => router.push('/home')} variant="outline" className="h-9 text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Torna alla Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
      style={{ overflow: 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0 text-text-secondary hover:text-text-primary hover:bg-teal-500/10"
            aria-label="Indietro"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
              <Hand className="h-4 w-4 text-teal-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent line-clamp-1">
                Massaggiatore
              </h1>
              <p className="text-[10px] text-text-tertiary line-clamp-1">
                Prenota e gestisci trattamenti
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card Trattamenti */}
        <Card className="group border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm hover:scale-[1.01] transition-all duration-300">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                <Calendar className="h-3.5 w-3.5 text-teal-300" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-wide text-text-tertiary mb-1">
              Trattamenti
            </p>
            <p className="text-teal-300 text-lg font-bold">0</p>
          </CardContent>
        </Card>

        {/* Card Preferenze */}
        <Card className="group border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm hover:scale-[1.01] transition-all duration-300">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
                <Sparkles className="h-3.5 w-3.5 text-teal-300" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-wide text-text-tertiary mb-1">
              Preferenze
            </p>
            <p className="text-teal-300 text-lg font-bold">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Tab Massaggio */}
      <Card className="group border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm">
        <CardHeader className="pb-2.5 border-b border-teal-500/20">
          <CardTitle className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
            Dati Massaggi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-2.5">
          <Suspense fallback={<LoadingState message="Caricamento dati massaggi..." size="sm" />}>
            <AthleteMassageTab athleteId={athleteUserId} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="group border-orange-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm">
        <CardContent className="p-2.5">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex-shrink-0">
              <TrendingUp className="h-3.5 w-3.5 text-orange-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent mb-1">
                Trattamenti Massaggio
              </h3>
              <p className="text-xs text-text-secondary">
                Gestisci le tue preferenze per i trattamenti massaggio. Indica il tipo di massaggio
                preferito, l&apos;intensità desiderata e le zone problematiche per ricevere
                trattamenti personalizzati.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MassaggiatorePage() {
  return (
    <Suspense fallback={<LoadingState message="Caricamento pagina massaggiatore..." size="md" />}>
      <MassaggiatorePageContent />
    </Suspense>
  )
}
