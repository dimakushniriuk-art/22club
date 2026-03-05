'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  BarChart3,
  CreditCard,
  Dumbbell,
  Hand,
  Heart,
  LogOut,
  TrendingUp,
  User,
  Utensils,
} from 'lucide-react'
import {
  AthleteOverviewTab,
  AthleteProfileHeaderHome,
  AthleteStatsCards,
  AthleteSubscriptionsTab,
} from '@/components/home-profile'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { PageHeaderGlass } from '@/components/layout'
import {
  Button,
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useAvatarInitials } from '@/components/ui/avatar'
import { useAuth } from '@/providers/auth-provider'
import { useAthleteAdministrative } from '@/hooks/athlete-profile/use-athlete-administrative'
import { useAthleteAnagrafica } from '@/hooks/athlete-profile/use-athlete-anagrafica'
import { useAthleteFitness } from '@/hooks/athlete-profile/use-athlete-fitness'
import { useAthleteStats } from '@/hooks/home-profile/use-athlete-stats'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { useProfileId } from '@/lib/utils/profile-id-utils'

const logger = createLogger('app:home:profilo:page')

const CONTENT_WRAPPER_STYLE = { minHeight: 'calc(100dvh - var(--nav-height, 56px))' as const }
const PROFILO_CARD_STYLE = {
  borderColor: 'rgba(2, 179, 191, 0.35)',
  background: 'linear-gradient(145deg, rgba(22,22,26,0.95) 0%, rgba(16,16,18,0.98) 100%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(2,179,191,0.08) inset',
} as const
const PROFILO_CARD_OVERLAY_STYLE = {
  background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(2,179,191,0.1) 0%, transparent 60%)',
} as const

const TAB_TRIGGER_CLASS =
  'text-xs px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] min-w-0'
const PROFILE_TAB_TRIGGER_CLASS =
  'text-[11px] px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] min-w-0'

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

  const handleLogout = useCallback(async () => {
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
  }, [supabase, router])

  const handleRetry = useCallback(() => router.push('/login'), [router])
  const handleBack = useCallback(() => router.back(), [router])
  const handleGoProgressi = useCallback(() => router.push('/home/progressi'), [router])

  if (authLoading || statsLoading) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:px-6 min-[834px]:pt-6">
          <LoadingState message="Caricamento profilo..." size="md" />
        </div>
      </div>
    )
  }

  if (statsError && !user) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:px-6 min-[834px]:pt-6">
          <ErrorState
            message={statsError || 'Impossibile caricare il profilo'}
            onRetry={handleRetry}
          />
        </div>
      </div>
    )
  }

  if (!user || !athleteUserId) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:px-6 min-[834px]:pt-6">
          <ErrorState message="Utente non trovato" onRetry={handleRetry} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div
        className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24 min-[834px]:pt-6"
        style={CONTENT_WRAPPER_STYLE}
      >
        <PageHeaderGlass
          title="Il mio Profilo"
          subtitle="Informazioni e statistiche"
          onBack={handleBack}
          icon={<User className="h-6 w-6 min-[834px]:h-7 min-[834px]:w-7 text-primary" />}
        />

        <AthleteProfileHeaderHome user={user} avatarInitials={avatarInitials} />

        <AthleteStatsCards stats={stats} />

        {/* Card principale — stile Nutrizionista */}
        <Card
          className="relative overflow-hidden rounded-xl border backdrop-blur-md"
          style={PROFILO_CARD_STYLE}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-xl opacity-60"
            style={PROFILO_CARD_OVERLAY_STYLE}
            aria-hidden
          />
          <CardContent className="relative z-10 p-3 min-[834px]:p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="h-auto grid w-full grid-cols-3 gap-1.5 sm:gap-2 border border-primary/20 bg-background-tertiary/50 p-1.5 sm:p-2 rounded-xl min-h-[44px]">
                <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
                  <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="profilo" className={TAB_TRIGGER_CLASS}>
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Profilo</span>
                </TabsTrigger>
                <TabsTrigger value="abbonamenti" className={TAB_TRIGGER_CLASS}>
                  <CreditCard className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Abbonamenti</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-2 pt-0">
                <AthleteOverviewTab user={user} stats={stats} calculateProgress={calculateProgress} />
              </TabsContent>

              <TabsContent value="profilo" className="mt-2 pt-0">
                {athleteUserId ? (
                  <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
                    <TabsList className="h-auto grid grid-cols-2 min-[834px]:grid-cols-3 w-full gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl border border-primary/20 bg-background-tertiary/50 min-h-0 mb-5">
                      <TabsTrigger value="anagrafica" className={PROFILE_TAB_TRIGGER_CLASS}>
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">Anagrafica</span>
                      </TabsTrigger>
                      <TabsTrigger value="medica" className={PROFILE_TAB_TRIGGER_CLASS}>
                        <Heart className="h-3 w-3 shrink-0" />
                        <span className="truncate">Medica</span>
                      </TabsTrigger>
                      <TabsTrigger value="fitness" className={PROFILE_TAB_TRIGGER_CLASS}>
                        <Dumbbell className="h-3 w-3 shrink-0" />
                        <span className="truncate">Fitness</span>
                      </TabsTrigger>
                      <TabsTrigger value="nutrizione" className={PROFILE_TAB_TRIGGER_CLASS}>
                        <Utensils className="h-3 w-3 shrink-0" />
                        <span className="truncate">Nutrizione</span>
                      </TabsTrigger>
                      <TabsTrigger value="massaggio" className={PROFILE_TAB_TRIGGER_CLASS}>
                        <Hand className="h-3 w-3 shrink-0" />
                        <span className="truncate">Massaggio</span>
                      </TabsTrigger>
                      <TabsTrigger value="amministrativo" className={PROFILE_TAB_TRIGGER_CLASS}>
                        <CreditCard className="h-3 w-3 shrink-0" />
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

              <TabsContent value="abbonamenti" className="mt-2 pt-0">
                {athleteUserId ? (
                  <AthleteSubscriptionsTab athleteUserId={athleteUserId} />
                ) : (
                  <LoadingState message="Caricamento abbonamenti..." />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Azioni — card stile Nutrizionista */}
        <Card
          className="relative overflow-hidden rounded-xl border backdrop-blur-md"
          style={PROFILO_CARD_STYLE}
        >
          <CardContent className="relative z-10 p-3 min-[834px]:p-4 space-y-2">
            <Button
              variant="outline"
              className="min-h-[44px] w-full justify-start rounded-xl border-primary/30 text-text-primary hover:bg-primary/10 hover:border-primary/50"
              onClick={handleGoProgressi}
            >
              <TrendingUp className="mr-2 h-4 w-4 shrink-0" />
              Storico progressi
            </Button>
            <Button
              variant="destructive"
              className="min-h-[44px] w-full justify-start rounded-xl text-sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              Esci
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
