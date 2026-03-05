/**
 * Componente Tabs Profilo Atleta - Versione Ottimizzata
 * Lazy loading più aggressivo con prefetch intelligente e rendering condizionale
 */

'use client'

import { useState, Suspense, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import { Skeleton } from '@/components/ui'
import {
  User,
  Dumbbell,
  BarChart3,
  FileText,
  Heart,
  Target,
  Utensils,
  Hand,
  CreditCard,
  Brain,
  Activity as ActivityIcon,
} from 'lucide-react'
import { AthleteWorkoutsTab } from './athlete-workouts-tab'
import { AthleteProgressTab } from './athlete-progress-tab'
import { AthleteDocumentsTab } from './athlete-documents-tab'

// Skeleton loader leggero per tab
const TabSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-32 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
)

// Dynamic imports con Next.js per migliore code splitting
// Preload solo quando necessario (on hover o quando diventa attivo)
const AthleteAnagraficaTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteAnagraficaTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false, // Disabilita SSR per questi componenti pesanti
  },
)

const AthleteMedicalTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteMedicalTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  },
)

const AthleteFitnessTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteFitnessTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  },
)

const AthleteMotivationalTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteMotivationalTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  },
)

const AthleteNutritionTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteNutritionTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  },
)

const AthleteMassageTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteMassageTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  },
)

const AthleteAdministrativeTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteAdministrativeTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  },
)

const AthleteSmartTrackingTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteSmartTrackingTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  },
)

const AthleteAIDataTab = dynamic(
  () =>
    import('@/components/dashboard/athlete-profile').then((mod) => ({
      default: mod.AthleteAIDataTab,
    })),
  {
    loading: () => <TabSkeleton />,
    ssr: false,
  },
)

// Mappa tab per prefetch intelligente
const TAB_MAP = {
  anagrafica: { component: AthleteAnagraficaTab, order: 0 },
  medica: { component: AthleteMedicalTab, order: 1 },
  fitness: { component: AthleteFitnessTab, order: 2 },
  motivazionale: { component: AthleteMotivationalTab, order: 3 },
  nutrizione: { component: AthleteNutritionTab, order: 4 },
  massaggio: { component: AthleteMassageTab, order: 5 },
  amministrativo: { component: AthleteAdministrativeTab, order: 6 },
  'smart-tracking': { component: AthleteSmartTrackingTab, order: 7 },
  'ai-data': { component: AthleteAIDataTab, order: 8 },
} as const

type TabKey = keyof typeof TAB_MAP

interface AthleteProfileTabsProps {
  athleteId: string
  athleteUserId: string | null
  stats: {
    allenamenti_totali: number
    allenamenti_mese: number
    schede_attive: number
    documenti_scadenza: number
    peso_attuale: number | null
  }
  onPrefetchTab?: (tabName: string) => void
}

export function AthleteProfileTabsOptimized({
  athleteId,
  athleteUserId,
  stats,
  onPrefetchTab,
}: AthleteProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('profilo')
  const [activeProfileTab, setActiveProfileTab] = useState<TabKey>('anagrafica')
  const [loadedTabs, setLoadedTabs] = useState<Set<TabKey>>(new Set(['anagrafica'])) // Preload primo tab
  const [prefetchedTabs, setPrefetchedTabs] = useState<Set<TabKey>>(new Set())

  // Prefetch tab adiacenti quando un tab diventa attivo
  useEffect(() => {
    const currentOrder = TAB_MAP[activeProfileTab]?.order ?? 0
    const tabsToPrefetch: TabKey[] = []

    // Prefetch tab precedente e successivo
    Object.entries(TAB_MAP).forEach(([key, { order }]) => {
      if (order === currentOrder - 1 || order === currentOrder + 1) {
        tabsToPrefetch.push(key as TabKey)
      }
    })

    tabsToPrefetch.forEach((tab) => {
      if (!prefetchedTabs.has(tab)) {
        setPrefetchedTabs((prev) => new Set(prev).add(tab))
        // Trigger prefetch preload
        const tabConfig = TAB_MAP[tab]
        if (tabConfig) {
          // Preload il componente
          import('@/components/dashboard/athlete-profile').catch(() => {
            // Ignora errori di prefetch
          })
        }
      }
    })
  }, [activeProfileTab, prefetchedTabs])

  // Prefetch su hover (più aggressivo)
  const handleTabHover = useCallback(
    (tabKey: TabKey) => {
      if (!loadedTabs.has(tabKey) && !prefetchedTabs.has(tabKey)) {
        setPrefetchedTabs((prev) => new Set(prev).add(tabKey))
        onPrefetchTab?.(tabKey)
        // Preload immediato su hover
        import('@/components/dashboard/athlete-profile').catch(() => {
          // Ignora errori
        })
      }
    },
    [loadedTabs, prefetchedTabs, onPrefetchTab],
  )

  // Carica tab quando diventa attivo
  const handleTabChange = useCallback((tabKey: string) => {
    const key = tabKey as TabKey
    setActiveProfileTab(key)
    setLoadedTabs((prev) => new Set(prev).add(key))
  }, [])

  // Renderizza solo il tab attivo e quelli già caricati (per mantenere stato)
  const shouldRenderTab = useCallback(
    (tabKey: TabKey) => {
      return activeProfileTab === tabKey || loadedTabs.has(tabKey)
    },
    [activeProfileTab, loadedTabs],
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-6 border border-teal-500/10 p-1 rounded-xl !bg-transparent">
        <TabsTrigger
          value="profilo"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all"
        >
          <User className="mr-2 h-4 w-4" />
          Profilo
        </TabsTrigger>
        <TabsTrigger
          value="allenamenti"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all"
        >
          <Dumbbell className="mr-2 h-4 w-4" />
          Allenamenti
        </TabsTrigger>
        <TabsTrigger
          value="progressi"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Progressi
        </TabsTrigger>
        <TabsTrigger
          value="documenti"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all"
        >
          <FileText className="mr-2 h-4 w-4" />
          Documenti
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profilo" className="mt-0">
        {athleteUserId ? (
          <Tabs value={activeProfileTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-6 border border-teal-500/10 p-1 rounded-xl overflow-x-auto !bg-transparent">
              {(Object.keys(TAB_MAP) as TabKey[]).map((tabKey) => {
                // Nota: tabConfig, isActive, isLoaded potrebbero essere usati in futuro per logica condizionale
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const tabConfig = TAB_MAP[tabKey]
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const isActive = activeProfileTab === tabKey
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const isLoaded = loadedTabs.has(tabKey)

                return (
                  <TabsTrigger
                    key={tabKey}
                    value={tabKey}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
                    onMouseEnter={() => handleTabHover(tabKey)}
                  >
                    {tabKey === 'anagrafica' && (
                      <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {tabKey === 'medica' && (
                      <Heart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {tabKey === 'fitness' && (
                      <Dumbbell className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {tabKey === 'motivazionale' && (
                      <Target className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {tabKey === 'nutrizione' && (
                      <Utensils className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {tabKey === 'massaggio' && (
                      <Hand className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {tabKey === 'amministrativo' && (
                      <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {tabKey === 'smart-tracking' && (
                      <ActivityIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    {tabKey === 'ai-data' && (
                      <Brain className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {tabKey === 'anagrafica' && 'Anagrafica'}
                      {tabKey === 'medica' && 'Medica'}
                      {tabKey === 'fitness' && 'Fitness'}
                      {tabKey === 'motivazionale' && 'Motivazionale'}
                      {tabKey === 'nutrizione' && 'Nutrizione'}
                      {tabKey === 'massaggio' && 'Massaggio'}
                      {tabKey === 'amministrativo' && 'Amministrativo'}
                      {tabKey === 'smart-tracking' && 'Smart Tracking'}
                      {tabKey === 'ai-data' && 'AI Data'}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Renderizza solo tab attivo e quelli già caricati */}
            {(Object.keys(TAB_MAP) as TabKey[]).map((tabKey) => {
              if (!shouldRenderTab(tabKey)) return null

              const TabComponent = TAB_MAP[tabKey].component
              // Nota: isActive potrebbe essere usato in futuro per logica condizionale
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const isActive = activeProfileTab === tabKey

              return (
                <TabsContent
                  key={tabKey}
                  value={tabKey}
                  className="mt-0"
                  forceMount={loadedTabs.has(tabKey)} // Mantiene stato se già caricato
                >
                  <Suspense fallback={<TabSkeleton />}>
                    <TabComponent athleteId={athleteUserId} />
                  </Suspense>
                </TabsContent>
              )
            })}
          </Tabs>
        ) : (
          <LoadingState message="Caricamento dati profilo..." />
        )}
      </TabsContent>

      <TabsContent value="allenamenti" className="mt-0">
        <AthleteWorkoutsTab athleteId={athleteId} schedeAttive={stats.schede_attive} />
      </TabsContent>

      <TabsContent value="progressi" className="mt-0">
        <AthleteProgressTab athleteId={athleteId} stats={stats} />
      </TabsContent>

      <TabsContent value="documenti" className="mt-0">
        <AthleteDocumentsTab athleteId={athleteId} documentiScadenza={stats.documenti_scadenza} />
      </TabsContent>
    </Tabs>
  )
}
