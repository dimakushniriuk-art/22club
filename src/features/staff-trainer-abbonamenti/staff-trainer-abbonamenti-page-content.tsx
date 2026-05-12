'use client'

import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MetricCard } from '@/components'
import { Card, CardContent, Button, Input } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { useAbbonamentiDashboard } from '@/hooks/use-abbonamenti-dashboard'
import { ABBONAMENTI_PER_PAGE } from '@/lib/abbonamenti/fetch-abbonamenti-dashboard'
import {
  Plus,
  Euro,
  FileText,
  Upload as _Upload,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock3,
  UserX,
} from 'lucide-react'
import { buildTabularExportPdfBlob, type ExportData } from '@/lib/export-utils'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffLazyChunkFallback } from '@/components/layout/route-loading-skeletons'
import {
  DashboardColumnListSkeleton,
  DashboardColumnPanel,
} from '@/app/dashboard/_components/dashboard-widget-columns'
import { useAuth } from '@/hooks/use-auth'
import {
  type ServiceType,
  SERVICE_TYPES,
  parseServiceFromUrl,
  defaultServiceForRole,
} from '@/lib/abbonamenti-service-type'

const logger = createLogger('app:dashboard:abbonamenti:page')

// Lazy load modali per ridurre bundle size iniziale
const NuovoPagamentoModal = lazy(() =>
  import('@/components/dashboard/nuovo-pagamento-modal').then((mod) => ({
    default: mod.NuovoPagamentoModal,
  })),
)

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

const _DEFAULT_DATE = new Date().toISOString().split('T')[0]

type AbbonamentiTheme = 'default' | 'teal'

const ABBONAMENTI_THEME = {
  default: {
    tabContainer: 'border-primary/20',
    tabActive: 'bg-primary text-white',
    inputBorder: 'border-primary/30 focus:border-primary/50',
    buttonOutline: 'border-primary/30 text-white hover:bg-primary/10 hover:border-primary/50',
    buttonPrimary:
      'bg-gradient-to-r from-primary to-primary hover:from-primary-hover hover:to-primary-hover text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40',
    kpiAccent: 'text-primary',
    cardBorder: 'border-primary/30',
    tableBorder: 'border-primary/20',
    tableDivide: 'divide-primary/10',
    emptyIcon: 'bg-primary/20 text-primary',
    modalBorder: 'border-primary/30',
    modalHeader: 'border-primary/20',
    modalIcon: 'text-primary',
    modalButton: 'border-primary/30 hover:bg-primary/10',
    modalPrimary: 'bg-primary hover:bg-primary-hover text-primary-foreground',
    spinner: 'text-primary',
  },
  teal: {
    tabContainer: 'border-teal-500/20',
    tabActive: 'bg-teal-600 text-white',
    inputBorder: 'border-teal-500/30 focus:border-teal-500/50',
    buttonOutline: 'border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50',
    buttonPrimary:
      'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40',
    kpiAccent: 'text-teal-400',
    cardBorder: 'border-teal-500/30',
    tableBorder: 'border-teal-500/20',
    tableDivide: 'divide-teal-500/10',
    emptyIcon: 'bg-teal-500/20 text-teal-400',
    modalBorder: 'border-teal-500/30',
    modalHeader: 'border-teal-500/20',
    modalIcon: 'text-teal-400',
    modalButton: 'border-teal-500/30 hover:bg-teal-500/10',
    modalPrimary: 'bg-teal-600 hover:bg-teal-500 text-white',
    spinner: 'text-teal-400',
  },
} as const

/** Primo e ultimo istante del mese corrente (UTC). */
function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  return { start: start.toISOString(), end: end.toISOString() }
}

export function StaffTrainerAbbonamentiPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsRef = useRef(searchParams)
  searchParamsRef.current = searchParams
  const { user } = useAuth()
  const profileId = user?.id || null // profiles.id (per filtro trainer/athlete)
  const role = user?.role || null
  const { addToast } = useToast()
  const {
    open: pdfOpen,
    blob: pdfBlob,
    filename: pdfFilename,
    loading: pdfLoading,
    setLoading: setPdfLoading,
    openWithBlob: openPdfWithBlob,
    onOpenChange: onPdfOpenChange,
  } = usePdfPreviewDialog()
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [enablePagination, setEnablePagination] = useState(false)

  // Filtri (solo ricerca atleta; KPI e tab servizio restano)
  const [searchTerm, setSearchTerm] = useState('')

  const urlServiceParam = searchParams.get('service')
  const urlService = parseServiceFromUrl(urlServiceParam)
  const defaultService = defaultServiceForRole(role)
  const currentServiceType: ServiceType = urlService ?? defaultService

  const {
    abbonamenti,
    kpiPayments,
    totalCount,
    loading,
    error,
    refetch: refetchAbbonamenti,
    invalidateList,
  } = useAbbonamentiDashboard({
    serviceType: currentServiceType,
    page: currentPage,
    enablePagination,
    role,
    profileId,
  })

  const abbonamentiTheme: AbbonamentiTheme =
    currentServiceType === 'nutrition' || currentServiceType === 'massage' ? 'teal' : 'default'
  const t = ABBONAMENTI_THEME[abbonamentiTheme]

  // Se manca ?service=, applica default e sostituisci URL
  useEffect(() => {
    if (urlService !== null) return
    const params = new URLSearchParams(searchParamsRef.current.toString())
    params.set('service', defaultService)
    router.replace(`/dashboard/abbonamenti?${params.toString()}`, { scroll: false })
  }, [urlService, defaultService, router])

  const urlSearch = searchParams.get('search') ?? ''
  useEffect(() => {
    setSearchTerm(urlSearch)
  }, [urlSearch])

  const updateUrlFilters = useCallback(
    (updates: { search?: string; service?: ServiceType }) => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      if (updates.service !== undefined) {
        if (updates.service) params.set('service', updates.service)
        else params.delete('service')
      }
      if (updates.search !== undefined) {
        if (updates.search.trim()) params.set('search', updates.search.trim())
        else params.delete('search')
      }
      const q = params.toString()
      router.replace(q ? `/dashboard/abbonamenti?${q}` : '/dashboard/abbonamenti', {
        scroll: false,
      })
    },
    [router],
  )

  // Prefetch modal nuovo pagamento
  useEffect(() => {
    import('@/components/dashboard/nuovo-pagamento-modal')
  }, [])

  const loadPage = useCallback(async (page: number) => {
    setCurrentPage(page)
  }, [])

  // Abilita paginazione se ci sono più di 100 record
  useEffect(() => {
    if (totalCount > ABBONAMENTI_PER_PAGE && !enablePagination) {
      setEnablePagination(true)
    }
  }, [totalCount, enablePagination])

  const handleResetFilters = useCallback(() => {
    setSearchTerm('')
    updateUrlFilters({ search: '' })
  }, [updateUrlFilters])

  // In questa vista aggregata non facciamo azioni su singolo pagamento (storno/fattura):
  // la riga è per atleta; i dettagli si gestiscono nella pagina atleta.

  // Filtraggio abbonamenti - Combinato in unico filter per performance
  const filteredAbbonamenti = useMemo(() => {
    const search = searchTerm.trim() ? searchTerm.toLowerCase().trim() : null

    return abbonamenti.filter((abb) => {
      const matchesSearch = !search || abb.athlete_name.toLowerCase().includes(search)
      return matchesSearch
    })
  }, [abbonamenti, searchTerm])

  const { start: monthStart, end: monthEnd } = getCurrentMonthRange()
  const incassoMeseFiltered = useMemo(() => {
    const inMonth = (d: string) => {
      const t = new Date(d).getTime()
      return t >= new Date(monthStart).getTime() && t <= new Date(monthEnd).getTime()
    }
    const visibleAthleteIds = new Set(filteredAbbonamenti.map((a) => a.athlete_id).filter(Boolean))
    const eligible = kpiPayments.filter((p) => {
      if (!visibleAthleteIds.has(p.athlete_id)) return false
      if (p.status === 'cancelled') return false
      if (!p.payment_date) return false
      return inMonth(p.payment_date)
    })
    return eligible.reduce((s, p) => s + (Number(p.amount) || 0), 0)
  }, [filteredAbbonamenti, kpiPayments, monthStart, monthEnd])

  const kpiRigaAbbonamenti = useMemo(() => {
    let totaleAttivi = 0
    let inScadenza = 0
    let scaduti = 0
    for (const abb of filteredAbbonamenti) {
      if (abb.total_remaining > 0) {
        totaleAttivi += 1
        if (abb.total_remaining <= 3) inScadenza += 1
      } else if (abb.total_purchased > 0) {
        scaduti += 1
      }
    }
    return {
      totaleAttivi,
      inScadenza,
      scaduti,
      ricaviAttesi: formatCurrency(incassoMeseFiltered),
    }
  }, [filteredAbbonamenti, incassoMeseFiltered])

  const metricTone = abbonamentiTheme === 'teal' ? 'teal' : 'blue'

  const handleExportPdf = useCallback(async () => {
    if (filteredAbbonamenti.length === 0) return
    setPdfLoading(true)
    try {
      const rows: ExportData = filteredAbbonamenti.map((abb) => ({
        'ID atleta': abb.athlete_id,
        Atleta: abb.athlete_name,
        Servizio: currentServiceType,
        Acquistate: abb.total_purchased,
        Usate: abb.total_used,
        Residue: abb.total_remaining,
      }))
      const blob = await buildTabularExportPdfBlob('Abbonamenti', rows)
      openPdfWithBlob(
        blob,
        `abbonamenti_${currentServiceType}_${new Date().toISOString().split('T')[0]}.pdf`,
      )
    } catch (err) {
      logger.error('Export PDF abbonamenti', err)
      addToast({ title: 'Errore', message: 'Impossibile generare il PDF.', variant: 'error' })
    } finally {
      setPdfLoading(false)
    }
  }, [filteredAbbonamenti, currentServiceType, addToast, setPdfLoading, openPdfWithBlob])

  // Drilldown drawer rimosso: ora si usa la pagina dettaglio atleta.

  if (loading && abbonamenti.length === 0) {
    return (
      <StaffContentLayout
        title="Abbonamenti"
        description="Abbonamenti, pacchetti e incassi degli atleti."
        theme="teal"
      >
        <div className="space-y-6" aria-busy>
          <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 flex-1 min-w-[200px] rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
              <Skeleton className="h-5 w-40 rounded-md" />
            </div>
          </div>

          {role !== 'trainer' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Totale attivi"
                value={0}
                icon={<Users />}
                loading
                variant="default"
              />
              <MetricCard
                title="In scadenza"
                value={0}
                icon={<Clock3 />}
                loading
                variant="default"
              />
              <MetricCard title="Scaduti" value={0} icon={<UserX />} loading variant="default" />
              <MetricCard
                title="Ricavi attesi"
                value={0}
                icon={<Euro />}
                loading
                variant="default"
              />
            </div>
          )}

          <div className="flex min-h-0 min-w-0 flex-col lg:min-h-[min(52vh,440px)] lg:min-w-0">
            <DashboardColumnPanel title="">
              <DashboardColumnListSkeleton />
            </DashboardColumnPanel>
          </div>
        </div>
      </StaffContentLayout>
    )
  }

  return (
    <StaffContentLayout
      title="Abbonamenti"
      description="Abbonamenti, pacchetti e incassi degli atleti."
      theme="teal"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExportPdf()}
            disabled={filteredAbbonamenti.length === 0 || pdfLoading}
            aria-busy={pdfLoading}
            className="border-white/10 hover:border-primary/20"
          >
            <FileText className="mr-1.5 h-4 w-4" />
            Esporta PDF
          </Button>
          <Button onClick={() => setShowModal(true)} size="sm" variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Pagamento
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <Card variant="default" className="border-red-500/30 bg-red-500/10">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-red-200">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetchAbbonamenti()}
                className="border-red-500/40 text-red-200 hover:bg-red-500/20 shrink-0"
              >
                Riprova
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tab servizio: Allenamenti | Nutrizione | Massaggi (nascosti al trainer) */}
        {role !== 'trainer' && (
          <div
            className={`flex gap-1 p-1 rounded-lg bg-background-tertiary/50 border w-fit ${t.tabContainer}`}
          >
            {SERVICE_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateUrlFilters({ service: value })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentServiceType === value
                    ? t.tabActive
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Filtri */}
        <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Cerca per nome atleta..."
                value={searchTerm}
                onChange={(e) => {
                  const v = e.target.value
                  setSearchTerm(v)
                  updateUrlFilters({ search: v })
                }}
                leftIcon={<Search className="h-4 w-4" />}
                className="bg-white/[0.04] border-white/10 focus:border-primary"
              />
            </div>
            {searchTerm.trim() && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="border-white/10 hover:border-primary/20"
              >
                <X className="mr-2 h-4 w-4" />
                Rimuovi filtri
              </Button>
            )}

            {/* Contatore risultati */}
            <div className="text-text-secondary text-sm whitespace-nowrap">
              {filteredAbbonamenti.length}{' '}
              {filteredAbbonamenti.length === 1 ? 'abbonamento trovato' : 'abbonamenti trovati'}
              {filteredAbbonamenti.length !== abbonamenti.length &&
                ` di ${abbonamenti.length} totali`}
            </div>
          </div>
        </div>

        <div role="status" aria-live="polite" className="sr-only">
          {filteredAbbonamenti.length === 1
            ? '1 abbonamento trovato'
            : `${filteredAbbonamenti.length} abbonamenti trovati`}
        </div>

        {/* KPI sopra tabella (allineato a Pencil): MetricCard, gap 24px */}
        {role !== 'trainer' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              variant="default"
              tone={metricTone}
              title="Totale attivi"
              value={kpiRigaAbbonamenti.totaleAttivi}
              icon={<Users className="h-5 w-5" aria-hidden />}
            />
            <MetricCard
              variant="default"
              tone={metricTone}
              title="In scadenza"
              value={kpiRigaAbbonamenti.inScadenza}
              icon={<Clock3 className="h-5 w-5" aria-hidden />}
            />
            <MetricCard
              variant="default"
              tone={metricTone}
              title="Scaduti"
              value={kpiRigaAbbonamenti.scaduti}
              icon={<UserX className="h-5 w-5" aria-hidden />}
            />
            <MetricCard
              variant="default"
              tone={metricTone}
              title="Ricavi attesi"
              value={kpiRigaAbbonamenti.ricaviAttesi}
              icon={<Euro className="h-5 w-5" aria-hidden />}
            />
          </div>
        )}

        {/* Tabella Abbonamenti (1 riga per atleta) */}
        <Card variant="default" className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/[0.02]">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Atleta
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Totale allenamenti
                    </th>
                    <th
                      className="px-4 py-3 text-center text-text-primary text-sm font-semibold"
                      title="Totale lezioni già usate dall’atleta (su tutti i pacchetti)"
                    >
                      Usufruiti
                    </th>
                    <th
                      className="px-4 py-3 text-center text-text-primary text-sm font-semibold"
                      title="Saldo totale atleta: lezioni ancora utilizzabili (stesso valore per ogni riga dello stesso atleta)"
                    >
                      Rimasti
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredAbbonamenti.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-text-secondary">
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className={`rounded-full p-6 animate-[pulse_2s_ease-in-out_infinite] ${t.emptyIcon}`}
                          >
                            {abbonamenti.length === 0 ? (
                              <Euro className="h-12 w-12" />
                            ) : (
                              <Filter className="h-12 w-12" />
                            )}
                          </div>
                          <h3 className="text-text-primary text-lg font-semibold">
                            {abbonamenti.length === 0
                              ? 'Nessun abbonamento registrato'
                              : 'Nessun abbonamento corrisponde ai filtri'}
                          </h3>
                          <p className="text-text-secondary text-sm mb-4">
                            {abbonamenti.length === 0
                              ? 'Inizia registrando il primo pagamento'
                              : 'Prova a modificare i filtri di ricerca'}
                          </p>
                          {abbonamenti.length === 0 ? (
                            <Button onClick={() => setShowModal(true)} className={t.buttonPrimary}>
                              <Plus className="mr-2 h-4 w-4" />
                              Crea primo abbonamento
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={handleResetFilters}
                              className={t.buttonOutline}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Rimuovi filtri
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAbbonamenti.map((abb) => (
                      <tr key={abb.athlete_id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="px-4 py-3 text-text-primary font-medium">
                          <button
                            type="button"
                            className="hover:underline underline-offset-4 text-left"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(
                                `/dashboard/pagamenti/atleta/${abb.athlete_id}?service=${currentServiceType}`,
                              )
                            }}
                          >
                            {abb.athlete_name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center text-text-primary font-semibold">
                          {abb.total_purchased}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-orange-400 font-medium">{abb.total_used}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1">
                            <span
                              className={`font-semibold ${
                                abb.total_remaining === 0
                                  ? 'text-red-400'
                                  : abb.total_remaining <= 3
                                    ? 'text-orange-400'
                                    : 'text-green-400'
                              }`}
                            >
                              {abb.total_remaining}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/pagamenti/atleta/${abb.athlete_id}?service=${currentServiceType}`,
                                )
                              }
                              className="border-white/10 hover:border-primary/20"
                            >
                              Vai al dettaglio
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Paginazione */}
        {enablePagination && Math.ceil(totalCount / ABBONAMENTI_PER_PAGE) > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="text-text-secondary text-sm">
              Mostrando {currentPage * ABBONAMENTI_PER_PAGE + 1} -{' '}
              {Math.min((currentPage + 1) * ABBONAMENTI_PER_PAGE, totalCount)} di {totalCount}{' '}
              abbonamenti
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage - 1)}
                disabled={currentPage === 0 || loading}
                className={t.buttonOutline}
              >
                <ChevronLeft className="h-4 w-4" />
                Precedente
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">
                  Pagina {currentPage + 1} di {Math.ceil(totalCount / ABBONAMENTI_PER_PAGE)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage + 1)}
                disabled={
                  currentPage >= Math.ceil(totalCount / ABBONAMENTI_PER_PAGE) - 1 || loading
                }
                className={t.buttonOutline}
              >
                Successiva
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuovo Pagamento - Lazy loaded solo quando aperto */}
      {showModal && (
        <Suspense
          fallback={
            <StaffLazyChunkFallback
              className="min-h-[240px] max-w-md mx-auto"
              label="Caricamento modulo…"
            />
          }
        >
          <NuovoPagamentoModal
            open={showModal}
            onOpenChange={setShowModal}
            serviceType={currentServiceType}
            onSuccess={() => {
              void invalidateList()
              void refetchAbbonamenti()
            }}
          />
        </Suspense>
      )}

      {/* Preview fattura + drawer drilldown + storno rimossi in questa vista aggregata */}

      <PdfCanvasPreviewDialog
        open={pdfOpen}
        onOpenChange={onPdfOpenChange}
        blob={pdfBlob}
        filename={pdfFilename}
        title="Anteprima — Abbonamenti"
      />
    </StaffContentLayout>
  )
}
