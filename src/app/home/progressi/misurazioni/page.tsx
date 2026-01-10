'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useProgressAnalytics } from '@/hooks/use-progress-analytics'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { RangeStatusMeter } from '@/components/dashboard/range-status-meter'

function MisurazioniContent() {
  const router = useRouter()
  const { user, loading } = useAuth()

  // Type guard per user - isValidUser non esiste nel context, usiamo user && isValidProfile(user)
  const isValidUserProfile = user && isValidProfile(user)
  const isValidUser = isValidUserProfile && !loading

  // Usa user_id invece di id perché progress_logs.athlete_id fa riferimento a profiles(user_id)
  // Type guard assicura che user sia valido
  // NOTA: Tutti gli hooks devono essere chiamati prima di qualsiasi early return
  const athleteId = useMemo(() => {
    if (!isValidUserProfile || !user?.user_id) {
      console.warn('[MisurazioniPage] athleteId is null:', {
        isValidUserProfile,
        hasUserId: !!user?.user_id,
        user,
      })
      return null
    }
    const id = isValidUUID(user.user_id) ? user.user_id : null
    console.log('[MisurazioniPage] athleteId calculated:', {
      athleteId: id,
      user_id: user.user_id,
      isValidUUID: isValidUUID(user.user_id),
    })
    return id
  }, [isValidUserProfile, user])

  const { data: progressData, isLoading: progressLoading, error } = useProgressAnalytics(athleteId)

  // Redirect se non autenticato (solo dopo che loading è finito)
  useEffect(() => {
    if (!loading && !isValidUser) {
      router.push('/login')
    }
  }, [isValidUser, loading, router])

  // Mostra loading durante il caricamento
  if (loading) {
    return null
  }

  if (!isValidUser) {
    return null
  }

  return (
    <div className="bg-black min-w-[402px] min-h-[874px]" style={{ overflow: 'auto' }}>
      <div className="space-y-4 px-3 py-4">
        {/* Header - Design Moderno e Uniforme */}
        <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10 flex flex-col gap-2.5">
            {/* Top row: Back button + Title */}
            <div className="flex items-center gap-2">
              <Link href="/home/progressi">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
                  Dashboard Misurazioni
                </h1>
                <p className="text-text-secondary mt-0.5 text-xs line-clamp-1">
                  Grafici e analisi dei tuoi progressi
                </p>
              </div>
            </div>
            {/* Bottom row: Action button */}
            <Link href="/home/progressi/nuovo" className="w-full">
              <Button
                className="w-full gap-1.5 h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/40 transition-all duration-300"
                variant="default"
              >
                <Plus className="h-3.5 w-3.5" />
                Nuova Misurazione
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Content - Design Moderno e Uniforme */}
        <div className="space-y-4">
          {progressLoading ? (
            <Card className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
              <CardContent className="p-12 text-center relative z-10">
                <div className="mb-3 text-4xl opacity-50">📊</div>
                <p className="text-text-secondary text-sm font-medium">Caricamento dati...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="relative overflow-hidden border-red-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5" />
              <CardContent className="p-12 text-center relative z-10 px-2">
                <div className="mb-3 text-4xl opacity-50">⚠️</div>
                <p className="text-text-primary text-sm font-medium text-white">
                  Errore nel caricamento
                </p>
                <p className="text-text-tertiary text-xs mt-1.5 line-clamp-2">
                  {error instanceof Error ? error.message : String(error)}
                </p>
              </CardContent>
            </Card>
          ) : !progressData ? (
            <Card className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
              <CardContent className="p-12 text-center relative z-10 px-2">
                <div className="mb-3 text-4xl opacity-50">📊</div>
                <p className="text-text-primary text-sm font-medium text-white">
                  Nessun dato disponibile
                </p>
                <p className="text-text-tertiary text-xs mt-1.5 line-clamp-2">
                  Inizia a registrare le tue misurazioni
                </p>
                <Link href="/home/progressi/nuovo" className="mt-3 inline-block w-full">
                  <Button
                    className="w-full gap-1.5 h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30"
                    variant="default"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Prima Misurazione
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Grafico Range Status Meter - Design Moderno e Uniforme */}
              <Card
                variant="trainer"
                className="relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
                <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
                  <CardTitle
                    size="sm"
                    className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent"
                  >
                    Range Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-2.5">
                  <RangeStatusMeter
                    value={progressData.pesoAttuale}
                    min={60}
                    max={120}
                    optimalMin={70}
                    optimalMax={90}
                    title="Peso Corporeo"
                    unit=" kg"
                    showValue={true}
                    height={50}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MisurazioniPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-black min-w-[402px] min-h-[874px]" style={{ overflow: 'auto' }}>
          <div className="space-y-4 px-3 py-4">
            <Card className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
              <CardContent className="p-12 text-center relative z-10">
                <div className="mb-3 text-4xl opacity-50">📊</div>
                <p className="text-text-secondary text-sm font-medium">Caricamento...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <MisurazioniContent />
    </Suspense>
  )
}
