// ============================================================
// Componente Tabs Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, lazy, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { AthleteProgressiNavSection } from '@/components/dashboard/athlete-profile/athlete-progressi-nav-section'
import { LoadingState } from '@/components/dashboard/loading-state'
import {
  User,
  Dumbbell,
  BarChart3,
  FileText,
  Heart,
  History,
  Target,
  Utensils,
  Hand,
} from 'lucide-react'
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
  statsError?: string | null
  /** Nome per sottotitoli sezioni (es. Foto progressi) */
  athleteDisplayName?: string
  onPrefetchTab: (tabName: string) => void
}

const DS_TABS_LIST =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] p-2'
const TAB_TRIGGER =
  'rounded-lg px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition data-[state=active]:font-extrabold data-[state=active]:text-text-primary data-[state=active]:bg-white/[0.06] data-[state=active]:border data-[state=active]:border-white/10'
/** Voce della barra principale: una sola riga anche su mobile (flex-1 + nowrap sul contenitore). */
const MAIN_TAB_ROW_TRIGGER = `${TAB_TRIGGER} flex flex-1 min-w-0 items-center justify-center whitespace-nowrap`

type AthleteMainTab = 'profilo' | 'progressi' | 'documenti'

function initialMainTabFromSearch(searchParams: ReturnType<typeof useSearchParams>): AthleteMainTab {
  const t = searchParams.get('tab')
  if (t === 'allenamenti') return 'progressi'
  if (t === 'profilo' || t === 'progressi' || t === 'documenti') return t
  return 'profilo'
}

export function AthleteProfileTabs({
  athleteId,
  athleteUserId,
  stats,
  statsError = null,
  athleteDisplayName,
  onPrefetchTab,
}: AthleteProfileTabsProps) {
  const searchParams = useSearchParams()
  const storicoHref = `/dashboard/atleti/${athleteId}/progressi/storico`
  const [activeTab, setActiveTab] = useState<AthleteMainTab>(() => initialMainTabFromSearch(searchParams))
  const [activeProfileTab, setActiveProfileTab] = useState('anagrafica')

  const tabParam = searchParams.get('tab')
  useEffect(() => {
    if (tabParam === 'allenamenti') {
      setActiveTab('progressi')
      return
    }
    if (tabParam === 'profilo' || tabParam === 'progressi' || tabParam === 'documenti') {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as AthleteMainTab)}
      className="w-full"
    >
      <TabsList
        className={`flex w-full min-w-0 flex-row flex-nowrap gap-2 mb-6 max-[851px]:flex-nowrap ${DS_TABS_LIST} h-auto min-h-10 items-center overflow-x-auto`}
      >
        <TabsTrigger value="profilo" className={MAIN_TAB_ROW_TRIGGER}>
          <User className="mr-2 h-4 w-4 shrink-0" />
          Profilo
        </TabsTrigger>
        <TabsTrigger value="progressi" className={MAIN_TAB_ROW_TRIGGER}>
          <BarChart3 className="mr-2 h-4 w-4 shrink-0" />
          Progressi
        </TabsTrigger>
        <Link
          href={storicoHref}
          aria-label="Apri pagina allenamenti e storico completati"
          className={`${MAIN_TAB_ROW_TRIGGER} no-underline`}
        >
          <History className="mr-2 h-4 w-4 shrink-0" />
          Storico
        </Link>
        <TabsTrigger value="documenti" className={MAIN_TAB_ROW_TRIGGER}>
          <FileText className="mr-2 h-4 w-4 shrink-0" />
          Documenti
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profilo" className="mt-0">
        {athleteUserId ? (
          <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
            <TabsList
              className={`grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6 ${DS_TABS_LIST} overflow-x-auto h-auto min-h-10 items-center justify-items-center`}
            >
              <TabsTrigger
                value="anagrafica"
                className={`${TAB_TRIGGER} px-3 py-1.5 text-xs sm:text-sm`}
                onMouseEnter={() => onPrefetchTab('anagrafica')}
              >
                <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Anagrafica</span>
              </TabsTrigger>
              <TabsTrigger
                value="medica"
                className={`${TAB_TRIGGER} px-3 py-1.5 text-xs sm:text-sm`}
                onMouseEnter={() => onPrefetchTab('medica')}
              >
                <Heart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Medica</span>
              </TabsTrigger>
              <TabsTrigger
                value="fitness"
                className={`${TAB_TRIGGER} px-3 py-1.5 text-xs sm:text-sm`}
                onMouseEnter={() => onPrefetchTab('fitness')}
              >
                <Dumbbell className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Fitness</span>
              </TabsTrigger>
              <TabsTrigger
                value="motivazionale"
                className={`${TAB_TRIGGER} px-3 py-1.5 text-xs sm:text-sm`}
                onMouseEnter={() => onPrefetchTab('motivazionale')}
              >
                <Target className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Motivazionale</span>
              </TabsTrigger>
              <TabsTrigger
                value="nutrizione"
                className={`${TAB_TRIGGER} px-3 py-1.5 text-xs sm:text-sm`}
                onMouseEnter={() => onPrefetchTab('nutrizione')}
              >
                <Utensils className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Nutrizione</span>
              </TabsTrigger>
              <TabsTrigger
                value="massaggio"
                className={`${TAB_TRIGGER} px-3 py-1.5 text-xs sm:text-sm`}
                onMouseEnter={() => onPrefetchTab('massaggio')}
              >
                <Hand className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Massaggio</span>
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
          </Tabs>
        ) : (
          <LoadingState message="Caricamento dati profilo..." />
        )}
      </TabsContent>

      <TabsContent value="progressi" className="mt-0 space-y-4 sm:space-y-6">
        <Suspense fallback={<LoadingState message="Caricamento progressi..." />}>
          <AthleteProgressTab
            athleteId={athleteId}
            stats={{
              peso_attuale: stats.peso_attuale,
              allenamenti_totali: stats.allenamenti_totali,
              allenamenti_mese: stats.allenamenti_mese,
            }}
            loadError={statsError}
            showDetailLinksBelowKpi
          />
        </Suspense>
        <AthleteProgressiNavSection
          athleteProfileId={athleteId}
          athleteDisplayName={athleteDisplayName}
        />
      </TabsContent>

      <TabsContent value="documenti" className="mt-0">
        <Suspense fallback={<LoadingState message="Caricamento documenti..." />}>
          <AthleteDocumentsTab athleteId={athleteId} documentiScadenza={stats.documenti_scadenza} />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
