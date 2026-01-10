'use client'

import { useState, useMemo, lazy, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { Plus, Search, Calendar, User, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { useAllenamenti } from '@/hooks/use-allenamenti'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import type { AllenamentoFilters, AllenamentoSort } from '@/types/allenamento'

// Lazy load modali per ridurre bundle size iniziale
const AllenamentoDettaglioModal = lazy(() =>
  import('@/components/dashboard/allenamento-dettaglio-modal').then((mod) => ({
    default: mod.AllenamentoDettaglioModal,
  })),
)
const AllenamentiFiltriAvanzati = lazy(() =>
  import('@/components/dashboard/allenamenti-filtri-avanzati').then((mod) => ({
    default: mod.AllenamentiFiltriAvanzati,
  })),
)

// Funzioni helper estratte fuori dal componente per evitare ricreazione ogni render
function getStatoBadge(stato: string) {
  switch (stato) {
    case 'completato':
      return (
        <Badge variant="success" size="sm">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completato
        </Badge>
      )
    case 'in_corso':
      return (
        <Badge variant="warning" size="sm">
          <Clock className="mr-1 h-3 w-3" />
          In corso
        </Badge>
      )
    case 'programmato':
      return (
        <Badge variant="primary" size="sm">
          <Calendar className="mr-1 h-3 w-3" />
          Programmato
        </Badge>
      )
    case 'saltato':
      return (
        <Badge variant="warning" size="sm">
          Saltato
        </Badge>
      )
    default:
      return <Badge size="sm">{stato}</Badge>
  }
}

function formatData(dataString: string) {
  try {
    const data = new Date(dataString)

    // Verifica che la data sia valida
    if (isNaN(data.getTime())) {
      return 'Data non valida'
    }

    const oggi = new Date()
    const domani = new Date(oggi)
    domani.setDate(domani.getDate() + 1)

    if (data.toDateString() === oggi.toDateString()) {
      return `Oggi alle ${data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
    } else if (data.toDateString() === domani.toDateString()) {
      return `Domani alle ${data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
    }
    return data.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Data non valida'
  }
}

export default function AllenamentiDashboardPage() {
  const searchParams = useSearchParams()

  // State per filtri e ricerca
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [activeTab, setActiveTab] = useState<AllenamentoFilters['stato']>(
    (searchParams.get('stato') as AllenamentoFilters['stato']) || 'tutti',
  )
  const [sort] = useState<AllenamentoSort>(
    (searchParams.get('sort') as AllenamentoSort) || 'data_desc',
  )
  const [periodo, setPeriodo] = useState<AllenamentoFilters['periodo']>(
    (searchParams.get('periodo') as AllenamentoFilters['periodo']) || 'tutti',
  )
  const [showFiltriAvanzati, setShowFiltriAvanzati] = useState(false)
  const [selectedAllenamento, setSelectedAllenamento] = useState<string | null>(null)

  const debouncedSearch = useDebouncedValue(searchTerm, 500)

  // Costruisci filtri
  const filters: AllenamentoFilters = useMemo(
    () => ({
      search: debouncedSearch,
      stato: activeTab,
      periodo,
      atleta_id: null,
      data_da: null,
      data_a: null,
    }),
    [debouncedSearch, activeTab, periodo],
  )

  // Fetch allenamenti
  const { allenamenti, stats, loading, error, refresh } = useAllenamenti(filters, sort)

  // Funzioni helper ora sono fuori dal componente (vedi sopra)

  const handleApplyFiltriAvanzati = (newFilters: Partial<AllenamentoFilters>) => {
    if (newFilters.periodo) setPeriodo(newFilters.periodo)
  }

  if (loading) return <LoadingState message="Caricamento allenamenti..." />
  if (error)
    return (
      <ErrorState
        message={error.message || 'Errore nel caricamento degli allenamenti'}
        onRetry={refresh}
      />
    )

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-indigo-500/5 via-transparent to-transparent" />
      </div>

      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Allenamenti
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Monitora le sessioni di allenamento dei tuoi atleti
            </p>
          </div>
          <Link href="/dashboard/schede">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200">
              <Plus className="mr-2 h-4 w-4" />
              Nuova Scheda
            </Button>
          </Link>
        </div>

        {/* Barra ricerca e azioni */}
        <Card
          variant="trainer"
          className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
        >
          <CardContent className="p-4 relative">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                placeholder="Cerca per atleta o scheda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as AllenamentoFilters['stato'])}
        >
          <TabsList variant="pills">
            <TabsTrigger value="tutti" variant="pills">
              Tutti ({allenamenti.length})
            </TabsTrigger>
            <TabsTrigger value="completato" variant="pills">
              Completati ({stats.completati})
            </TabsTrigger>
            <TabsTrigger value="in_corso" variant="pills">
              In corso ({stats.in_corso})
            </TabsTrigger>
            <TabsTrigger value="programmato" variant="pills">
              Programmati ({stats.programmati})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {allenamenti.length === 0 ? (
                <Card
                  variant="trainer"
                  className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl"
                >
                  <CardContent className="py-12 text-center relative">
                    <div className="mb-4 text-6xl opacity-50">💪</div>
                    <h3 className="text-text-primary mb-2 text-lg font-medium">
                      Nessun allenamento trovato
                    </h3>
                    <p className="text-text-secondary mb-4 text-sm">
                      Crea una scheda per iniziare a programmare gli allenamenti
                    </p>
                    <Link href="/dashboard/schede">
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200">
                        <Plus className="mr-2 h-4 w-4" />
                        Crea scheda
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                allenamenti.map((allenamento) => (
                  <Card
                    variant="trainer"
                    key={allenamento.id}
                    className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 hover:shadow-blue-500/20 cursor-pointer transition-all duration-200"
                  >
                    <CardContent className="p-6 relative">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="bg-blue-500/20 text-blue-400 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                              {allenamento.atleta_nome.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-text-primary text-lg font-semibold">
                                  {allenamento.atleta_nome}
                                </h3>
                                {getStatoBadge(allenamento.stato)}
                              </div>
                              <p className="text-text-secondary text-sm">
                                {allenamento.scheda_nome}
                              </p>
                            </div>
                          </div>

                          {/* Dettagli */}
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="text-text-tertiary h-4 w-4" />
                              <span className="text-text-secondary">
                                {formatData(allenamento.data)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="text-text-tertiary h-4 w-4" />
                              <span className="text-text-secondary">
                                {allenamento.durata_minuti} minuti
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="text-text-tertiary h-4 w-4" />
                              <span className="text-text-secondary">
                                {allenamento.esercizi_completati}/{allenamento.esercizi_totali}{' '}
                                esercizi
                              </span>
                            </div>
                            {allenamento.volume_totale > 0 && (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="text-text-tertiary h-4 w-4" />
                                <span className="text-text-secondary">
                                  {allenamento.volume_totale}kg volume
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Note */}
                          {allenamento.note && (
                            <div className="bg-background-tertiary mt-3 rounded-lg p-3">
                              <p className="text-text-secondary text-sm">💬 {allenamento.note}</p>
                            </div>
                          )}

                          {/* Progress bar per allenamenti in corso */}
                          {allenamento.stato === 'in_corso' && (
                            <div className="mt-3">
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-text-secondary text-xs">Progresso</span>
                                <span className="text-text-secondary text-xs">
                                  {Math.round(
                                    (allenamento.esercizi_completati /
                                      allenamento.esercizi_totali) *
                                      100,
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="bg-background-tertiary h-2 overflow-hidden rounded-full">
                                <div
                                  className="bg-brand h-full transition-all"
                                  style={{
                                    width: `${(allenamento.esercizi_completati / allenamento.esercizi_totali) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Azioni */}
                        <div className="ml-4 flex flex-col gap-2">
                          <Link href={`/dashboard/atleti/${allenamento.atleta_id}/progressi`}>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Profilo di ${allenamento.atleta_nome}`}
                            >
                              <User className="mr-1 h-4 w-4" />
                              Profilo
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAllenamento(allenamento.id)}
                            aria-label={`Dettagli allenamento di ${allenamento.atleta_nome}`}
                          >
                            Dettagli
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card
          variant="trainer"
          className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
        >
          <CardHeader className="relative">
            <CardTitle size="md">Azioni Rapide</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3 relative">
            <Link href="/dashboard/schede" className="block">
              <Button
                variant="outline"
                className="w-full justify-start border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crea nuova scheda
              </Button>
            </Link>
            <Link href="/dashboard/calendario" className="block">
              <Button
                variant="outline"
                className="w-full justify-start border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Programma sessione
              </Button>
            </Link>
            <Link href="/dashboard/statistiche" className="block">
              <Button
                variant="outline"
                className="w-full justify-start border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Vedi statistiche
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Modals - Lazy loaded solo quando aperti */}
      {showFiltriAvanzati && (
        <Suspense fallback={<LoadingState message="Caricamento filtri avanzati..." />}>
          <AllenamentiFiltriAvanzati
            open={showFiltriAvanzati}
            onOpenChange={setShowFiltriAvanzati}
            filters={filters}
            onApply={handleApplyFiltriAvanzati}
          />
        </Suspense>
      )}

      {selectedAllenamento && (
        <Suspense fallback={<LoadingState message="Caricamento dettagli allenamento..." />}>
          <AllenamentoDettaglioModal
            allenamentoId={selectedAllenamento}
            open={selectedAllenamento !== null}
            onOpenChange={(open) => !open && setSelectedAllenamento(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
