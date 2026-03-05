// ============================================================
// Componente Tabs Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, lazy, Suspense } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
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
const AthleteWorkoutsTab = lazy(() =>
  import('./athlete-workouts-tab').then((mod) => ({
    default: mod.AthleteWorkoutsTab,
  })),
)
const AthleteProgressTab = lazy(() =>
  import('./athlete-progress-tab').then((mod) => ({
    default: mod.AthleteProgressTab,
  })),
)
const AthleteDocumentsTab = lazy(() =>
  import('./athlete-documents-tab').then((mod) => ({
    default: mod.AthleteDocumentsTab,
  })),
)

// Lazy load dei componenti tab per migliorare performance iniziale
const AthleteAnagraficaTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteAnagraficaTab,
  })),
)
const AthleteMedicalTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteMedicalTab,
  })),
)
const AthleteFitnessTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteFitnessTab,
  })),
)
const AthleteMotivationalTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteMotivationalTab,
  })),
)
const AthleteNutritionTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteNutritionTab,
  })),
)
const AthleteMassageTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteMassageTab,
  })),
)
const AthleteAdministrativeTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteAdministrativeTab,
  })),
)
const AthleteSmartTrackingTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteSmartTrackingTab,
  })),
)
const AthleteAIDataTab = lazy(() =>
  import('@/components/dashboard/athlete-profile').then((mod) => ({
    default: mod.AthleteAIDataTab,
  })),
)

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
  onPrefetchTab: (tabName: string) => void
}

const glassSurface =
  'bg-gradient-to-br from-background-secondary/38 via-background-secondary/18 to-cyan-950/22 backdrop-blur-xl'
const frameSoft = 'border border-white/10 hover:border-white/14 transition'

export function AthleteProfileTabs({
  athleteId,
  athleteUserId,
  stats,
  onPrefetchTab,
}: AthleteProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('profilo')
  const [activeProfileTab, setActiveProfileTab] = useState('anagrafica')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList
        className={`grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-6 rounded-2xl p-2 ${glassSurface} ${frameSoft} h-auto min-h-10 items-center justify-items-center`}
      >
        <TabsTrigger
          value="profilo"
          className="rounded-full px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
        >
          <User className="mr-2 h-4 w-4" />
          Profilo
        </TabsTrigger>
        <TabsTrigger
          value="allenamenti"
          className="rounded-full px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
        >
          <Dumbbell className="mr-2 h-4 w-4" />
          Allenamenti
        </TabsTrigger>
        <TabsTrigger
          value="progressi"
          className="rounded-full px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Progressi
        </TabsTrigger>
        <TabsTrigger
          value="documenti"
          className="rounded-full px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
        >
          <FileText className="mr-2 h-4 w-4" />
          Documenti
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profilo" className="mt-0">
        {athleteUserId ? (
          <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
            <TabsList
              className={`grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-6 rounded-2xl p-2 ${glassSurface} ${frameSoft} overflow-x-auto h-auto min-h-10 items-center justify-items-center`}
            >
              <TabsTrigger
                value="anagrafica"
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
                onMouseEnter={() => onPrefetchTab('anagrafica')}
              >
                <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Anagrafica</span>
              </TabsTrigger>
              <TabsTrigger
                value="medica"
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
                onMouseEnter={() => onPrefetchTab('medica')}
              >
                <Heart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Medica</span>
              </TabsTrigger>
              <TabsTrigger
                value="fitness"
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
                onMouseEnter={() => onPrefetchTab('fitness')}
              >
                <Dumbbell className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Fitness</span>
              </TabsTrigger>
              <TabsTrigger
                value="motivazionale"
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
                onMouseEnter={() => onPrefetchTab('motivazionale')}
              >
                <Target className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Motivazionale</span>
              </TabsTrigger>
              <TabsTrigger
                value="nutrizione"
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
                onMouseEnter={() => onPrefetchTab('nutrizione')}
              >
                <Utensils className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Nutrizione</span>
              </TabsTrigger>
              <TabsTrigger
                value="massaggio"
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
                onMouseEnter={() => onPrefetchTab('massaggio')}
              >
                <Hand className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Massaggio</span>
              </TabsTrigger>
              <TabsTrigger
                value="amministrativo"
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
                onMouseEnter={() => onPrefetchTab('amministrativo')}
              >
                <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Amministrativo</span>
              </TabsTrigger>
              <TabsTrigger
                value="smart-tracking"
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
                onMouseEnter={() => onPrefetchTab('smart-tracking')}
              >
                <ActivityIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Smart Tracking</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai-data"
                className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/6 transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/26 data-[state=active]:to-cyan-500/12 data-[state=active]:border data-[state=active]:border-primary/22 data-[state=active]:shadow-[0_0_22px_rgba(2,179,191,0.14)]"
                onMouseEnter={() => onPrefetchTab('ai-data')}
              >
                <Brain className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">AI Data</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="anagrafica" className="mt-0">
              <Suspense fallback={<LoadingState message="Caricamento tab anagrafica..." />}>
                <AthleteAnagraficaTab athleteId={athleteUserId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="medica" className="mt-0">
              <Suspense fallback={<LoadingState message="Caricamento tab medica..." />}>
                <AthleteMedicalTab athleteId={athleteUserId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="fitness" className="mt-0">
              <Suspense fallback={<LoadingState message="Caricamento tab fitness..." />}>
                <AthleteFitnessTab athleteId={athleteUserId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="motivazionale" className="mt-0">
              <Suspense fallback={<LoadingState message="Caricamento tab motivazionale..." />}>
                <AthleteMotivationalTab athleteId={athleteUserId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="nutrizione" className="mt-0">
              <Suspense fallback={<LoadingState message="Caricamento tab nutrizione..." />}>
                <AthleteNutritionTab athleteId={athleteUserId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="massaggio" className="mt-0">
              <Suspense fallback={<LoadingState message="Caricamento tab massaggio..." />}>
                <AthleteMassageTab athleteId={athleteUserId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="amministrativo" className="mt-0">
              <Suspense fallback={<LoadingState message="Caricamento tab amministrativo..." />}>
                <AthleteAdministrativeTab athleteId={athleteUserId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="smart-tracking" className="mt-0">
              <Suspense fallback={<LoadingState message="Caricamento tab smart tracking..." />}>
                <AthleteSmartTrackingTab athleteId={athleteUserId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="ai-data" className="mt-0">
              <Suspense fallback={<LoadingState message="Caricamento tab AI data..." />}>
                <AthleteAIDataTab athleteId={athleteUserId} />
              </Suspense>
            </TabsContent>
          </Tabs>
        ) : (
          <LoadingState message="Caricamento dati profilo..." />
        )}
      </TabsContent>

      <TabsContent value="allenamenti" className="mt-0">
        <Suspense fallback={<LoadingState message="Caricamento allenamenti..." />}>
          <AthleteWorkoutsTab athleteId={athleteId} schedeAttive={stats.schede_attive} />
        </Suspense>
      </TabsContent>

      <TabsContent value="progressi" className="mt-0">
        <Suspense fallback={<LoadingState message="Caricamento progressi..." />}>
          <AthleteProgressTab athleteId={athleteId} stats={stats} />
        </Suspense>
      </TabsContent>

      <TabsContent value="documenti" className="mt-0">
        <Suspense fallback={<LoadingState message="Caricamento documenti..." />}>
          <AthleteDocumentsTab athleteId={athleteId} documentiScadenza={stats.documenti_scadenza} />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
