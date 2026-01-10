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
import { AthleteWorkoutsTab } from './athlete-workouts-tab'
import { AthleteProgressTab } from './athlete-progress-tab'
import { AthleteDocumentsTab } from './athlete-documents-tab'

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
          <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-6 border border-teal-500/10 p-1 rounded-xl overflow-x-auto !bg-transparent">
              <TabsTrigger
                value="anagrafica"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
                onMouseEnter={() => onPrefetchTab('anagrafica')}
              >
                <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Anagrafica</span>
              </TabsTrigger>
              <TabsTrigger
                value="medica"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
                onMouseEnter={() => onPrefetchTab('medica')}
              >
                <Heart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Medica</span>
              </TabsTrigger>
              <TabsTrigger
                value="fitness"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
                onMouseEnter={() => onPrefetchTab('fitness')}
              >
                <Dumbbell className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Fitness</span>
              </TabsTrigger>
              <TabsTrigger
                value="motivazionale"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
                onMouseEnter={() => onPrefetchTab('motivazionale')}
              >
                <Target className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Motivazionale</span>
              </TabsTrigger>
              <TabsTrigger
                value="nutrizione"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
                onMouseEnter={() => onPrefetchTab('nutrizione')}
              >
                <Utensils className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Nutrizione</span>
              </TabsTrigger>
              <TabsTrigger
                value="massaggio"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
                onMouseEnter={() => onPrefetchTab('massaggio')}
              >
                <Hand className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Massaggio</span>
              </TabsTrigger>
              <TabsTrigger
                value="amministrativo"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
                onMouseEnter={() => onPrefetchTab('amministrativo')}
              >
                <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Amministrativo</span>
              </TabsTrigger>
              <TabsTrigger
                value="smart-tracking"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
                onMouseEnter={() => onPrefetchTab('smart-tracking')}
              >
                <ActivityIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Smart Tracking</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai-data"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all text-xs sm:text-sm"
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
