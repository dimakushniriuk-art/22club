'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { createLogger } from '@/lib/logger'
import { useProfileId } from '@/lib/utils/profile-id-utils'
import { notifyError } from '@/lib/notifications'

const logger = createLogger('app:home:profilo:page')
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  User,
  TrendingUp,
  LogOut,
  Heart,
  Dumbbell,
  Utensils,
  Hand,
  CreditCard,
  BarChart3,
  ArrowLeft,
} from 'lucide-react'
// Dynamic imports per componenti tab (lazy loading)
import dynamic from 'next/dynamic'

const AthleteAnagraficaTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteAnagraficaTab,
    })),
  {
    ssr: false,
    loading: () => <LoadingState message="Caricamento anagrafica..." size="md" />,
  },
)

const AthleteMedicalTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteMedicalTab,
    })),
  {
    ssr: false,
    loading: () => <LoadingState message="Caricamento dati medici..." size="md" />,
  },
)

const AthleteFitnessTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteFitnessTab,
    })),
  {
    ssr: false,
    loading: () => <LoadingState message="Caricamento fitness..." size="md" />,
  },
)

const AthleteNutritionTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteNutritionTab,
    })),
  {
    ssr: false,
    loading: () => <LoadingState message="Caricamento nutrizione..." size="md" />,
  },
)

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

const AthleteAdministrativeTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteAdministrativeTab,
    })),
  {
    ssr: false,
    loading: () => <LoadingState message="Caricamento dati amministrativi..." size="md" />,
  },
)
import { useAthleteAnagrafica } from '@/hooks/athlete-profile/use-athlete-anagrafica'
import { useAthleteFitness } from '@/hooks/athlete-profile/use-athlete-fitness'
import { useAthleteAdministrative } from '@/hooks/athlete-profile/use-athlete-administrative'
import { useAthleteStats } from '@/hooks/home-profile/use-athlete-stats'
import {
  AthleteProfileHeaderHome,
  AthleteStatsCards,
  AthleteOverviewTab,
  AthleteSubscriptionsTab,
} from '@/components/home-profile'
import { useAvatarInitials } from '@/components/ui/avatar'
import { useSupabaseClient } from '@/hooks/use-supabase-client'

export default function ProfiloPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = useSupabaseClient() // Client stabile, creato una sola volta
  const [activeTab, setActiveTab] = useState('overview')
  const [activeProfileTab, setActiveProfileTab] = useState('anagrafica')

  // Ottieni user_id per gli hook
  // Nota: user è di tipo ProfileRow che ha user_id (UUID dell'utente auth)
  // Gli hook usano user_id per filtrare i dati
  const athleteUserId = user?.user_id || null

  // Debug: log per verificare lo stato
  if (process.env.NODE_ENV === 'development') {
    if (authLoading) {
      logger.debug('ProfiloPage: Caricamento autenticazione in corso...')
    } else if (!user) {
      logger.warn('ProfiloPage: Utente non trovato')
    } else if (!athleteUserId) {
      logger.warn('ProfiloPage: User presente ma user_id mancante', { user })
    } else {
      logger.debug('ProfiloPage: Utente caricato correttamente', {
        userId: athleteUserId,
        userEmail: user.email,
        userRole: user.role,
      })
    }
  }

  // Converti user_id a profile_id per useAthleteStats (workout_logs.athlete_id è FK a profiles.id)
  // Chiamato prima degli altri hook per evitare problemi di inizializzazione
  const athleteProfileId = useProfileId(athleteUserId)

  // Hook per dati profilo - usano athleteUserId (user_id)
  // React Query esegue automaticamente fetch paralleli quando gli hook sono chiamati insieme
  // Questo elimina il waterfall: tutti i fetch partono simultaneamente
  const { data: anagrafica } = useAthleteAnagrafica(athleteUserId || '')
  // Nota: fitness potrebbe essere usato in futuro
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: fitness } = useAthleteFitness(athleteUserId || '')
  const { data: administrative } = useAthleteAdministrative(athleteUserId || '')

  // React Query già esegue questi fetch in parallelo automaticamente
  // Non serve un hook aggregator - React Query gestisce il parallelismo

  const avatarInitials = useAvatarInitials(user?.nome || '', user?.cognome || '')

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    calculateProgress,
  } = useAthleteStats({
    athleteUserId: athleteProfileId || athleteUserId, // Usa profile_id se disponibile, altrimenti fallback a user_id
    authLoading,
    anagrafica: anagrafica ? { peso_iniziale_kg: anagrafica.peso_iniziale_kg ?? null } : null,
    fitness: null, // AthleteFitnessData non ha peso_attuale_kg o obiettivo_peso_kg
    smartTracking: null, // Smart tracking non disponibile in questo contesto
    administrative: administrative
      ? { lezioni_rimanenti: administrative.lezioni_rimanenti ?? null }
      : null,
  })

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      logger.error('Errore nel logout', error)
      notifyError(
        'Errore nel logout',
        error instanceof Error ? error.message : 'Impossibile effettuare il logout',
      )
    }
  }

  if (authLoading || statsLoading) {
    return (
      <div className="bg-black min-w-[402px] min-h-[874px] pb-4" style={{ overflow: 'auto' }}>
        <LoadingState message="Caricamento profilo..." />
      </div>
    )
  }

  if (statsError && !user) {
    return (
      <div className="bg-black min-w-[402px] min-h-[874px] pb-4" style={{ overflow: 'auto' }}>
        <ErrorState
          message={statsError || 'Impossibile caricare il profilo'}
          onRetry={() => router.push('/login')}
        />
      </div>
    )
  }

  if (!user || !athleteUserId) {
    return (
      <div className="bg-black min-w-[402px] min-h-[874px] pb-4" style={{ overflow: 'auto' }}>
        <ErrorState message="Utente non trovato" onRetry={() => router.push('/login')} />
      </div>
    )
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4 pb-20"
      style={{ overflow: 'auto' }}
    >
      {/* Header - Design Moderno e Uniforme */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
              Il mio Profilo
            </h1>
            <p className="text-text-secondary text-xs line-clamp-1">
              Visualizza e gestisci le tue informazioni
            </p>
          </div>
        </div>
      </div>

      <AthleteProfileHeaderHome user={user} avatarInitials={avatarInitials} />

      <AthleteStatsCards stats={stats} />

      {/* Tabs principali */}
      <Card
        variant="default"
        className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-2.5 relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-1.5 mb-2.5 border border-teal-500/20 p-1 rounded-xl !bg-transparent h-auto">
              <TabsTrigger
                value="overview"
                className="text-xs px-2.5 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-200"
              >
                <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="profilo"
                className="text-xs px-2.5 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-200"
              >
                <User className="mr-1.5 h-3.5 w-3.5" />
                Profilo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 pt-2.5">
              <AthleteOverviewTab user={user} stats={stats} calculateProgress={calculateProgress} />
            </TabsContent>

            <TabsContent value="profilo" className="mt-0 pt-2.5">
              {athleteUserId ? (
                <Tabs
                  value={activeProfileTab}
                  onValueChange={setActiveProfileTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 gap-1.5 mb-2.5 border border-teal-500/20 p-1 rounded-xl !bg-transparent h-auto">
                    <TabsTrigger
                      value="anagrafica"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-200 text-[10px] px-1.5 py-1.5 flex items-center justify-center gap-1"
                    >
                      <User className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Anagrafica</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="medica"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-200 text-[10px] px-1.5 py-1.5 flex items-center justify-center gap-1"
                    >
                      <Heart className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Medica</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="fitness"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-200 text-[10px] px-1.5 py-1.5 flex items-center justify-center gap-1"
                    >
                      <Dumbbell className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Fitness</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="nutrizione"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-200 text-[10px] px-1.5 py-1.5 flex items-center justify-center gap-1"
                    >
                      <Utensils className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Nutrizione</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="massaggio"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-200 text-[10px] px-1.5 py-1.5 flex items-center justify-center gap-1"
                    >
                      <Hand className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Massaggio</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="amministrativo"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-200 text-[10px] px-1.5 py-1.5 flex items-center justify-center gap-1"
                    >
                      <CreditCard className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Amministrativo</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="anagrafica" className="mt-0">
                    <AthleteAnagraficaTab athleteId={athleteUserId} />
                  </TabsContent>

                  <TabsContent value="medica" className="mt-0">
                    <AthleteMedicalTab athleteId={athleteUserId} />
                  </TabsContent>

                  <TabsContent value="fitness" className="mt-0">
                    <AthleteFitnessTab athleteId={athleteUserId} />
                  </TabsContent>

                  <TabsContent value="nutrizione" className="mt-0">
                    <AthleteNutritionTab athleteId={athleteUserId} />
                  </TabsContent>

                  <TabsContent value="massaggio" className="mt-0">
                    <AthleteMassageTab athleteId={athleteUserId} />
                  </TabsContent>

                  <TabsContent value="amministrativo" className="mt-0">
                    <AthleteAdministrativeTab athleteId={athleteUserId} />
                  </TabsContent>
                </Tabs>
              ) : (
                <LoadingState message="Caricamento dati profilo..." />
              )}
            </TabsContent>

            <TabsContent value="abbonamenti" className="mt-0">
              {athleteUserId ? (
                <AthleteSubscriptionsTab athleteUserId={athleteUserId} />
              ) : (
                <LoadingState message="Caricamento abbonamenti..." />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Azioni */}
      <Card
        variant="default"
        className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="space-y-1.5 p-2.5 relative z-10">
          <Button
            variant="outline"
            className="h-9 text-xs w-full justify-start border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-400 transition-all duration-200 hover:scale-[1.02]"
            onClick={() => router.push('/home/progressi')}
          >
            <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
            Storico progressi
          </Button>
          <Button
            variant="destructive"
            className="h-9 text-xs w-full justify-start transition-all duration-200 hover:scale-[1.02]"
            onClick={handleLogout}
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Esci
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
