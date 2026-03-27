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
  User,
  Utensils,
} from 'lucide-react'
import {
  AthleteOverviewTab,
  AthleteProfileHeaderHome,
  AthleteStatsCards,
  AthleteSubscriptionsTab,
} from '@/components/home-profile'
import { ErrorState } from '@/components/dashboard/error-state'
import { PageHeaderFixed } from '@/components/layout'
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
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
import { cn } from '@/lib/utils'

const logger = createLogger('app:home:profilo:page')

const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] hover:border-white/15 transition-colors duration-200'
/** Shell comune tab bar (senza display grid/flex: evita conflitti tra griglia desktop e chips scroll su mobile). */
const TABS_SHELL =
  'rounded-2xl border border-white/10 bg-black/35 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md sm:p-1.5'
const MAIN_TABS_LIST_CLASS =
  `items-stretch justify-center text-text-tertiary h-auto w-full grid grid-cols-3 gap-0.5 min-h-[48px] sm:gap-1 ${TABS_SHELL}`
const PROFILE_TABS_LIST_CLASS =
  `items-stretch justify-center text-text-tertiary !flex-nowrap max-[851px]:gap-1 ${TABS_SHELL} inline-flex h-auto w-max max-w-none gap-1 min-h-[48px] min-[834px]:mb-0 min-[834px]:grid min-[834px]:w-full min-[834px]:max-w-full min-[834px]:grid-cols-3 min-[834px]:gap-1 min-[834px]:flex-none min-[1100px]:grid-cols-6`

const TAB_TRIGGER_CLASS =
  'touch-manipulation text-xs px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[44px] min-w-0 active:opacity-90'
const PROFILE_TAB_TRIGGER_CLASS =
  'touch-manipulation shrink-0 text-[11px] px-3 sm:px-2.5 py-2.5 sm:py-2.5 rounded-xl font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/20 transition-all duration-200 inline-flex items-center justify-center gap-1.5 min-h-[44px] whitespace-nowrap active:opacity-90'

const PROFILE_TABS_SCROLL =
  '-mx-0.5 mb-1 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] scrollbar-hide'

const AthleteAnagraficaTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteAnagraficaTab,
    })),
  {
    ssr: false,
    loading: () => null,
  },
)

const AthleteMedicalTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteMedicalTab,
    })),
  {
    ssr: false,
    loading: () => null,
  },
)

const AthleteFitnessTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteFitnessTab,
    })),
  {
    ssr: false,
    loading: () => null,
  },
)

const AthleteNutritionTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteNutritionTab,
    })),
  {
    ssr: false,
    loading: () => null,
  },
)

const AthleteMassageTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteMassageTab,
    })),
  {
    ssr: false,
    loading: () => null,
  },
)

const AthleteAdministrativeTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteAdministrativeTab,
    })),
  {
    ssr: false,
    loading: () => null,
  },
)

export default function ProfiloPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = useSupabaseClient() // Client stabile, creato una sola volta
  const [activeTab, setActiveTab] = useState('overview')
  const [activeProfileTab, setActiveProfileTab] = useState('anagrafica')

  // Ottieni user_id per gli hook
  // Nota: user Ã¨ di tipo ProfileRow che ha user_id (UUID dell'utente auth)
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

  // Converti user_id a profile_id per useAthleteStats (workout_logs.athlete_id Ã¨ FK a profiles.id)
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

  // React Query giÃ  esegue questi fetch in parallelo automaticamente
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

  if (authLoading) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <PageHeaderFixed
          variant="chat"
          title="Il mio Profilo"
          subtitle="Informazioni e statistiche"
          onBack={handleBack}
          icon={<User className="h-5 w-5 text-cyan-400" />}
        />
        <div className="min-h-0 flex-1" aria-hidden />
      </div>
    )
  }

  if (statsError && !user) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:px-6">
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
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:px-6">
          <ErrorState message="Utente non trovato" onRetry={handleRetry} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <PageHeaderFixed
        variant="chat"
        title="Il mio Profilo"
        subtitle="Informazioni e statistiche"
        onBack={handleBack}
        icon={<User className="h-5 w-5 text-cyan-400" />}
      />
      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-3 pb-28 pt-1 safe-area-inset-bottom sm:space-y-5 sm:px-4 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24">
        <div className="mx-auto w-full max-w-lg min-[1100px]:max-w-3xl">
          <AthleteProfileHeaderHome user={user} avatarInitials={avatarInitials} />

          <div className="mt-4 sm:mt-5">
            <AthleteStatsCards stats={stats} hideIcons loading={statsLoading} />
          </div>
        </div>

        {/* Card principale */}
        <div className="mx-auto w-full max-w-lg min-[1100px]:max-w-3xl">
        <Card
          className={cn(
            CARD_DS,
            'relative overflow-hidden focus-visible:ring-0 focus-visible:ring-offset-0',
          )}
        >
          <CardContent className="relative z-10 p-3 sm:p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={MAIN_TABS_LIST_CLASS}>
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

              <TabsContent value="overview" className="mt-3 border-t border-white/5 pt-4 sm:mt-4 sm:pt-5 [&:focus-visible]:outline-none">
                <AthleteOverviewTab
                  user={user}
                  stats={stats}
                  calculateProgress={calculateProgress}
                />
              </TabsContent>

              <TabsContent value="profilo" className="mt-3 border-t border-white/5 pt-4 sm:mt-4 sm:pt-5 [&:focus-visible]:outline-none">
                {athleteUserId ? (
                  <Tabs
                    value={activeProfileTab}
                    onValueChange={setActiveProfileTab}
                    className="w-full"
                  >
                    <div className={PROFILE_TABS_SCROLL}>
                    <TabsList className={`mb-4 w-full min-w-0 sm:mb-5 min-[834px]:mb-4 ${PROFILE_TABS_LIST_CLASS}`}>
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
                    </div>

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
                ) : null}
              </TabsContent>

              <TabsContent value="abbonamenti" className="mt-3 border-t border-white/5 pt-4 sm:mt-4 sm:pt-5 [&:focus-visible]:outline-none">
                {athleteUserId ? (
                  <AthleteSubscriptionsTab athleteUserId={athleteUserId} />
                ) : null}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>

        {/* Azioni */}
        <div className="mx-auto w-full max-w-lg min-[1100px]:max-w-3xl">
          <div className={`overflow-hidden ${CARD_DS}`}>
            <button
              type="button"
              className="flex w-full min-h-[52px] items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 active:bg-red-500/15 touch-manipulation sm:min-h-[48px] sm:py-3"
              onClick={handleLogout}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400 ring-1 ring-red-500/20">
                <LogOut className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">Esci dall&apos;account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
